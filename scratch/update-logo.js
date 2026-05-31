import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://neondb_owner:npg_gJytQ7VUFAC6@ep-damp-pine-ao5akqgi.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("UPDATE site_config SET logo_url = '/logo-white.png' WHERE id = 1");
    console.log('Successfully updated logo_url to /logo-white.png. Rows updated:', res.rowCount);
  } catch (err) {
    console.error('Error running update:', err);
  } finally {
    await client.end();
  }
}

run();
