import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { v2 as cloudinary } from 'cloudinary';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import multer from 'multer';

const app = express();
app.use(express.json());

// Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_gJytQ7VUFAC6@ep-damp-pine-ao5akqgi.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});

// Configure Cloudinary
const cloudinaryUrl = process.env.CLOUDINARY_URL || 'cloudinary://166691445291859:1Glzwun9eeUMIoOchWaMvRLbPQ8@dggiggkug';
const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
if (match) {
  cloudinary.config({
    api_key: match[1],
    api_secret: match[2],
    cloud_name: match[3],
  });
}

// Configure Razorpay
const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_5yZ7fP5x7Z5z7z';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
let razorpay: Razorpay | null = null;
if (process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

// Multer Config
const upload = multer({ storage: multer.memoryStorage() });

// Auth Middleware
const checkAuth = (req: Request, res: Response, next: Function) => {
  const adminPasscode = process.env.VITE_ADMIN_PASSCODE || 'admin123';
  const providedPasscode = req.headers['x-admin-passcode'];

  if (providedPasscode === adminPasscode) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Invalid passcode.' });
  }
};

// Cloudinary helper
const streamUpload = (fileBuffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'futurewave-labs' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(fileBuffer);
  });
};

// 1. GET /api/config
app.get('/api/config', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM site_config WHERE id = 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Config not found.' });
    }
  } catch (error: any) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. POST /api/config
app.post('/api/config', checkAuth, async (req: Request, res: Response) => {
  const {
    hero_title,
    hero_subtitle,
    price_current,
    price_original,
    discount_amount,
    seats_total,
    seats_remaining,
    chatbot_prompt,
    logo_url,
    favicon_url
  } = req.body;

  try {
    await pool.query(
      `UPDATE site_config SET 
        hero_title = $1,
        hero_subtitle = $2,
        price_current = $3,
        price_original = $4,
        discount_amount = $5,
        seats_total = $6,
        seats_remaining = $7,
        chatbot_prompt = $8,
        logo_url = $9,
        favicon_url = $10,
        updated_at = NOW()
      WHERE id = 1`,
      [
        hero_title,
        hero_subtitle,
        parseInt(price_current),
        parseInt(price_original),
        parseInt(discount_amount),
        parseInt(seats_total),
        parseInt(seats_remaining),
        chatbot_prompt,
        logo_url,
        favicon_url
      ]
    );
    res.json({ message: 'Configuration updated successfully.' });
  } catch (error: any) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. GET /api/leads
app.get('/api/leads', checkAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. PATCH /api/leads/:id
app.patch('/api/leads/:id', checkAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE leads SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Lead not found.' });
    }
  } catch (error: any) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. POST /api/payment/order
app.post('/api/payment/order', async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required.' });
  }

  try {
    // Get current price from database
    const configResult = await pool.query('SELECT price_current FROM site_config WHERE id = 1');
    const price = configResult.rows[0]?.price_current || 4999;

    let orderId = 'mock_order_' + Math.random().toString(36).substring(2, 9);
    
    // If Razorpay secret is set, create a real order
    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: price * 100, // paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });
      orderId = order.id;
    }

    // Insert pending lead
    await pool.query(
      `INSERT INTO leads (name, email, phone, razorpay_order_id, status)
       VALUES ($1, $2, $3, $4, 'Pending')`,
      [name, email, phone, orderId]
    );

    res.json({
      orderId,
      amount: price,
      currency: 'INR',
      keyId: razorpayKeyId,
      isMock: !razorpay
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. POST /api/payment/verify
app.post('/api/payment/verify', async (req: Request, res: Response) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, isMock } = req.body;

  try {
    let verified = false;

    if (isMock || !process.env.RAZORPAY_KEY_SECRET) {
      // Mock payment auto-verifies
      verified = true;
    } else {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(body.toString())
        .digest('hex');

      verified = expectedSignature === razorpay_signature;
    }

    if (verified) {
      // Update lead to Paid
      const leadUpdate = await pool.query(
        `UPDATE leads SET status = 'Paid', razorpay_payment_id = $1
         WHERE razorpay_order_id = $2 RETURNING *`,
        [razorpay_payment_id || 'MOCK_PAYMENT_ID', razorpay_order_id]
      );

      // Decrement seats
      if (leadUpdate.rows.length > 0) {
        await pool.query(
          `UPDATE site_config SET seats_remaining = GREATEST(0, seats_remaining - 1)
           WHERE id = 1`
        );
      }

      res.json({ success: true, message: 'Payment verified successfully.' });
    } else {
      res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 7. POST /api/upload
app.post('/api/upload', checkAuth, upload.single('file'), async (req: any, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const result = await streamUpload(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

export default app;
