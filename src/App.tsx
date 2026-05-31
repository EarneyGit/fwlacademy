import React, { useState, useEffect } from "react";
import logoWhite from "./assets/logo.png";
import { 
  Play, 
  ChevronRight, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  XCircle, 
  Layers, 
  Smartphone, 
  Monitor, 
  Plus,
  Minus,
  Sparkles,
  Award,
  IndianRupee,
  Cpu,
  Zap,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Lock,
  X
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Chatbot } from "./components/Chatbot";
import { AdminDashboard } from "./components/AdminDashboard";

// --- Components ---

const PaymentPage: React.FC<{ 
  onBack: () => void;
  config: any;
  onSuccess: (paymentId: string) => void;
}> = ({ onBack, config, onSuccess }) => {
  const [timer, setTimer] = useState(600); // 10 minutes
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      alert('Please fill out Name, Email, and Phone fields.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const orderResponse = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });

      if (!orderResponse.ok) {
        alert('Failed to initialize order with server. Please try again.');
        setIsProcessing(false);
        return;
      }

      const orderData = await orderResponse.json();

      if (orderData.isMock) {
        const confirmMock = window.confirm(
          `Razorpay key secret not configured on Vercel backend.\nPerform MOCK payment transaction of ₹${orderData.amount}?`
        );
        if (confirmMock) {
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              isMock: true
            })
          });

          if (verifyResponse.ok) {
            onSuccess('MOCK_PAYMENT_SUCCESS_' + Math.random().toString(36).substring(2, 9));
          } else {
            alert('Mock signature verification failed.');
          }
        }
        setIsProcessing(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'Futurewave Labs',
        description: 'AI Video Masterclass Enrollment',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              onSuccess(response.razorpay_payment_id);
            } else {
              alert('Signature verification failed on backend. Contact Support.');
            }
          } catch (err) {
            alert('Signature verification connection error.');
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: '#D97706'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Network error connecting to payment API.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-brand-black text-white relative flex flex-col pt-20"
    >
      <button 
        onClick={onBack}
        className="fixed top-8 right-8 z-50 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all group active:scale-95"
      >
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="space-y-3 sm:space-y-4 w-full">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-brand-copper font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight leading-tight">
              SECURE <span className="text-brand-copper">CHECKOUT</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/40 text-[10px] sm:text-sm">
              <span className="flex items-center gap-1.5 sm:gap-2"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" /> Slot Reserved</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5 sm:gap-2 text-brand-copper-glow"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Expires: {formatTime(timer)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 border border-white/10 rounded-xl sm:rounded-2xl p-1 bg-white/5 w-full sm:w-auto overflow-hidden">
            <div className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-copper rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black text-center">PAYMENT</div>
            <div className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-white/30 text-[9px] sm:text-xs font-black text-center">ENROLL</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 sm:gap-12 items-start mb-20">
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <div className="glass-card p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6">
                 <ShieldCheck className="w-6 h-6 text-brand-copper" />
               </div>
               
               <form className="space-y-6" onSubmit={handlePaymentSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-brand-black/50 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-copper focus:ring-1 focus:ring-brand-copper/30 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-brand-black/50 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-copper focus:ring-1 focus:ring-brand-copper/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-brand-black/50 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-copper focus:ring-1 focus:ring-brand-copper/30 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Payment Provider</label>
                      <div className="w-full h-[58px] bg-brand-black/50 border border-brand-copper/50 text-brand-copper-glow rounded-2xl flex items-center justify-center font-bold text-sm tracking-widest uppercase">
                        Razorpay Standard
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-6 bg-brand-copper text-white font-black text-xl rounded-2xl glow-copper hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 group"
                    >
                      {isProcessing ? 'PROMPT LOADING...' : `PAY ₹${config.price_current.toLocaleString()} NOW`}
                      <Zap className="w-5 h-5 fill-current group-hover:animate-bounce" />
                    </button>
                    <p className="text-center text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold mt-6">
                      SECURED & VERIFIED VIA RAZORPAY COMPLIANCE
                    </p>
                  </div>
               </form>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-20 grayscale">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-brand-copper/30 bg-brand-copper/[0.02] space-y-8">
               <div className="text-[10px] font-black text-brand-copper uppercase tracking-widest">Order Summary</div>
               
               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-brand-copper/20 flex items-center justify-center shrink-0">
                      <Play className="w-8 h-8 text-brand-copper fill-current" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight">The Pipeline Masterclass</h4>
                      <p className="text-white/40 text-xs">Full Lifetime Access + Assets</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Course Value</span>
                      <span className="text-white/60 line-through">₹{config.price_original.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Early Bird Discount</span>
                      <span className="text-green-500">-₹{config.discount_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10">
                      <span>Total</span>
                      <span className="text-brand-copper-glow">₹{config.price_current.toLocaleString()}</span>
                    </div>
                  </div>
               </div>

               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-[10px] text-white/40 leading-relaxed italic">
                   "The knowledge in this course saved me 40+ hours of rendering time in the first week alone." 
                   <span className="block mt-2 font-bold text-white/60">— Past Graduate</span>
                 </p>
               </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border-white/5 flex items-center gap-4">
              <Lock className="w-5 h-5 text-brand-copper/50" />
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium leading-relaxed">
                Payment info is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LiveBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-brand-black" />
    {/* Very soft ambient glow */}
    <motion.div 
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-[20%] left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,6,0.1),transparent_80%)]"
    />
  </div>
);

const Particles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Small Sharp Particles */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={`sharp-${i}`}
          className="absolute w-[2px] h-[2px] bg-brand-copper/60 rounded-full"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0
          }}
          animate={{ 
            y: [null, `${Math.random() * 100}%`],
            opacity: [0, 0.7, 0]
          }}
          transition={{ 
            duration: Math.random() * 15 + 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          style={{
            filter: "blur(0.3px)",
          }}
        />
      ))}
      
      {/* Tiny White Twinkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`twinkle-${i}`}
          className="absolute w-[1px] h-[1px] bg-white/50 rounded-full"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0
          }}
          animate={{ 
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{ 
            duration: Math.random() * 4 + 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: Math.random() * 10
          }}
        />
      ))}
    </div>
  );
};

const InteractiveCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`${className} perspective-1000`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

const Navbar = ({ onJoin, logoUrl }: { onJoin: () => void; logoUrl?: string }) => (
  <nav className="fixed top-0 left-0 right-0 z-[100] bg-brand-black/60 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
      <a href="#" className="flex items-center group shrink-0">
        <img 
          src={logoUrl || logoWhite} 
          alt="Futurewave Labs" 
          className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]" 
        />
      </a>
      
      <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
        <a href="#protocol" className="hover:text-brand-copper transition-colors">The Protocol</a>
        <a href="#syllabus" className="hover:text-brand-copper transition-colors">Syllabus</a>
        <a href="#roi" className="hover:text-brand-copper transition-colors">Monetization</a>
        <a href="#faq" className="hover:text-brand-copper transition-colors">Support</a>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Live Batch Open</span>
        </div>
        <a 
          href="#signup" 
          onClick={(e) => { e.preventDefault(); onJoin(); }}
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-brand-copper rounded-lg sm:rounded-xl text-white text-[10px] sm:text-xs font-bold glow-copper hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
        >
          Secure Seat
        </a>
      </div>
    </div>
  </nav>
);

const Hero = ({ onJoin, config }: { onJoin: () => void; config: any }) => {
  const filled = config.seats_total - config.seats_remaining;
  const total = config.seats_total;

  return (
    <header className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Background Gradient for Smooth Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,6,0.08),transparent_80%)] pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto text-center relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-brand-copper/10 border border-brand-copper/20 text-brand-copper-glow text-[10px] sm:text-xs font-bold mb-6 sm:mb-8 uppercase tracking-widest"
        >
          <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          Offline Direct Live Intensive
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-6 sm:mb-8 tracking-tight leading-[1.2] sm:leading-[1.1] max-w-4xl mx-auto"
        >
          {config.hero_title}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-white/50 mb-8 font-light leading-relaxed font-sans px-4 sm:px-0"
        >
          {config.hero_subtitle}
        </motion.p>

        {/* Dynamic Seat Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-[200px] sm:max-w-xs mx-auto mb-10 sm:mb-12"
        >
          <div className="flex justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
            <span>Seats Filled</span>
            <motion.span 
              key={filled}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-brand-copper-glow"
            >
              {filled} / {total}
            </motion.span>
          </div>
          <div className="h-1 sm:h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(filled / total) * 100}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-brand-copper glow-copper relative"
            >
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-10 sm:w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" 
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8"
        >
          <motion.button 
            onClick={onJoin}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(217,119,6,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-brand-copper rounded-xl sm:rounded-2xl text-white font-bold text-base sm:text-lg glow-copper overflow-hidden block"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant" />
            Claim Your Seat – ₹{config.price_current.toLocaleString()}
          </motion.button>
          <div className="flex items-center gap-3 text-white/40">
            <div className="flex -space-x-2 sm:-space-x-3">
              {[1,2,3,4].map(i => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  key={i} 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-black bg-brand-charcoal overflow-hidden"
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`} alt="avatar" />
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col items-start translate-y-0.5">
               <span className="text-xs sm:text-sm font-medium">Joined by {total * 9}+ founders</span>
               <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] sm:text-[10px] text-white/20 font-bold uppercase tracking-widest">5 people browsing</span>
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hero Visual with Scroll Fade */}
      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.6 }}
        className="max-w-5xl mx-auto mt-16 sm:mt-24 relative group px-4 sm:px-0"
      >
        <InteractiveCard>
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-copper to-brand-copper-glow rounded-[1.5rem] sm:rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative glass-card rounded-[1.2rem] sm:rounded-[2rem] p-4 md:p-8 overflow-hidden aspect-video flex items-center justify-center">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000')] bg-cover opacity-20 mix-blend-overlay"></div>
             <div className="relative z-10 text-center px-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 sm:w-20 sm:h-20 bg-brand-copper/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-brand-copper/40 backdrop-blur-md"
                >
                  <Play className="text-brand-copper-glow h-6 sm:h-8 w-6 sm:w-8 ml-1" />
                </motion.div>
                <p className="font-display text-lg sm:text-2xl font-semibold text-white/90">The 8-Step Cinematic Workflow</p>
                <p className="text-white/40 text-[8px] sm:text-[10px] mt-2 font-medium tracking-wide text-glow-copper uppercase tracking-[0.2em] max-w-xs mx-auto">Narrative Protocol | Motion Architecture | Resolution Mastery</p>
             </div>
          </div>
        </InteractiveCard>
      </motion.div>
    </header>
  );
};

const TrustBanner = () => {
  const brands = ['Lifestyle Brands', 'Tech SAAS', 'E-commerce', 'Auto Industry', 'Fashion Houses', 'Real Estate'];
  
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.01] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center text-white/30 text-sm font-bold uppercase tracking-[0.3em] mb-12"
        >
          The exact workflow powering high-converting content for
        </motion.p>
        
        <div className="relative flex overflow-hidden group">
          <motion.div 
            animate={{ x: ["0%", "-100%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-16 items-center flex-nowrap min-w-full shrink-0"
          >
            {[...brands, ...brands].map((brand, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0 opacity-40 hover:opacity-100 transition-opacity cursor-default">
                <Award className="w-5 h-5 text-brand-copper" />
                <span className="text-xl font-display font-bold text-white tracking-tight whitespace-nowrap">{brand}</span>
              </div>
            ))}
          </motion.div>
          
          <motion.div 
            animate={{ x: ["0%", "-100%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-16 items-center flex-nowrap min-w-full shrink-0"
          >
            {[...brands, ...brands].map((brand, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0 opacity-40 hover:opacity-100 transition-opacity cursor-default">
                <Award className="w-5 h-5 text-brand-copper" />
                <span className="text-xl font-display font-bold text-white tracking-tight whitespace-nowrap">{brand}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Agitation = () => (
  <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
     <motion.div 
       initial={{ opacity: 0, y: 40 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       className="max-w-4xl mx-auto text-center mb-12 sm:mb-20"
     >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-4 sm:mb-6">Why Most AI Video <span className="text-brand-copper">Fails.</span></h2>
        <p className="text-white/40 text-base sm:text-lg">Amateur creators think AI is a magic button. It's not. That's why their output looks "cheap."</p>
     </motion.div>

     <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl border-red-500/10 relative overflow-hidden group"
        >
           {/* Chaotic Noise Overlay */}
           <motion.div 
             animate={{ opacity: [0.05, 0.1, 0.05], x: [0, -2, 2, 0], y: [0, 1, -1, 0] }}
             transition={{ duration: 0.1, repeat: Infinity }}
             className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"
           />
           <div className="relative z-10 font-sans">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                 <XCircle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 sm:mb-4">The Amateur Trap</h3>
              <ul className="space-y-3 sm:space-y-4">
                 {[
                   "Morphing faces and inconsistent characters.",
                   "Robotic, emotionless AI voices.",
                   "Blurred, low-resolution 'grainy' output.",
                   "Lack of cinematic lighting and 180-degree rule."
                 ].map((item, i) => (
                   <motion.li 
                     key={i} 
                     initial={{ opacity: 0, x: -10 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex items-start gap-2 sm:gap-3 text-white/50 text-xs sm:text-sm"
                   >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/40 mt-1.5 shrink-0" />
                      {item}
                   </motion.li>
                 ))}
              </ul>
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-3xl border-brand-copper/20 relative overflow-hidden group"
        >
           {/* Neural Cluster Animation */}
           <div className="absolute inset-0 pointer-events-none opacity-20">
              {[...Array(5)].map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                   transition={{ duration: 3 + i, repeat: Infinity }}
                   className="absolute w-24 h-24 sm:w-32 sm:h-32 bg-brand-copper/10 rounded-full blur-3xl"
                   style={{ top: `${Math.random() * 80}%`, left: `${Math.random() * 80}%` }}
                 />
              ))}
           </div>
           <div className="relative z-10 font-sans">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <Sparkles className="text-brand-copper w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-copper/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 glow-copper">
                 <CheckCircle2 className="text-brand-copper-glow w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 sm:mb-4">The Futurewave Protocol</h3>
              <ul className="space-y-3 sm:space-y-4">
                 {[
                   "Rock-solid consistency across multi-scenes.",
                   "Proprietary protocol for cinematic storytelling.",
                   "Dual-pass 4K upscaling for agency-grade crispness.",
                   "Professional post-production & audio clearing."
                 ].map((item, i) => (
                   <motion.li 
                     key={i} 
                     initial={{ opacity: 0, x: 10 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex items-start gap-2 sm:gap-3 text-white/80 text-xs sm:text-sm"
                   >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-copper mt-1.5 shrink-0" />
                      {item}
                   </motion.li>
                 ))}
              </ul>
           </div>
        </motion.div>
     </div>
  </section>
);

const MasterFormats = () => (
  <section className="py-32 relative overflow-hidden">
     <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
           <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">The 3 Master Formats</h2>
           <p className="text-white/40 max-w-xl">We don't teach single tricks. We teach the only three formats that clients actually pay for.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Format A: Single / Single",
                desc: "Single character and single environment for high-conversion sales pitches and founder storytelling.",
                icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />,
                value: "Sells for ₹1,500+",
                color: "from-blue-500/10 to-transparent"
              },
              {
                title: "Format B: Single / Multi",
                desc: "Single character across multiple environments for dynamic storytelling, dreamscapes, and cinematic product launches.",
                icon: <Layers className="w-5 h-5 sm:w-6 sm:h-6" />,
                value: "Sells for ₹2,000+",
                color: "from-brand-copper/10 to-transparent"
              },
              {
                title: "Format C: Multi / Multi",
                desc: "Multiple characters and environments for complex cinematic brand advertisements and short films.",
                icon: <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />,
                value: "Sells for ₹2,500+",
                color: "from-purple-500/10 to-transparent"
              }
            ].map((format, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                key={i} 
                className="glass-card glass-card-hover p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] relative overflow-hidden group"
              >
                 <div className={`absolute inset-0 bg-gradient-to-br ${format.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                 
                 <div className="relative z-10 font-sans">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 text-brand-copper-glow group-hover:bg-brand-copper group-hover:text-white transition-all duration-300">
                       {format.icon}
                    </div>
                    <h4 className="text-lg sm:text-xl font-display font-bold text-white mb-3 sm:mb-4 sm:h-14 leading-tight">{format.title}</h4>
                    <p className="text-white/40 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">{format.desc}</p>
                    
                    <div className="mb-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: "30%" }}
                         whileInView={{ width: "100%" }}
                         transition={{ duration: 2, delay: i * 0.5 }}
                         className="h-full bg-brand-copper"
                       />
                    </div>

                    <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-white/5">
                       <span className="text-brand-copper font-bold text-xs sm:text-sm tracking-wide">{format.value}</span>
                       <ChevronRight className="w-4 h-4 text-brand-copper/40 group-hover:text-brand-copper group-hover:translate-x-1 transition-all" />
                    </div>
                 </div>
              </motion.div>
            ))}
        </div>
     </div>
  </section>
);

const PipelineReveal = () => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    { 
      title: "Scripting & Narrative Engineering", 
      tool: "HBC Framework", 
      desc: "Developing industry-specific scripts with a deep focus on target audience mapping and high-retention hooks.", 
      detail: "Mastering the Hook, Body, and CTA structure optimized for short-form retention & psychological triggers." 
    },
    { 
      title: "Visual Asset Synthesis & Cinematic Control", 
      tool: "Character Continuity", 
      desc: "Establishing character consistency protocols and scene shots that strictly obey the 180-degree rule.", 
      detail: "Learn the exact settings to keep your characters identical across multiple environments and camera angles." 
    },
    { 
      title: "High-Fidelity Static Enhancement", 
      tool: "Local Software", 
      desc: "Utilizing professional local software to upscale raw generations and recover textures before any motion.", 
      detail: "Recover skin textures and fix environmental artifacts using agency-grade local software stacks." 
    },
    { 
      title: "Neural Motion Architecture", 
      tool: "Fluid Physics", 
      desc: "Transforming enhanced static assets into fluid video with realistic physics and natural dialogue.", 
      detail: "Achieving human-like body movements and realistic dialogue delivery for peak immersion." 
    },
    { 
      title: "Multi-Layer Timeline Assembly", 
      tool: "Post-Production", 
      desc: "Using high-end editing suites to arrange shots, apply cinematic color grading and dynamic transitions.", 
      detail: "Mastering dynamic zoom-in movements, professional shot arrangement, and high-end subtitling." 
    },
    { 
      title: "Sonic Purification & Mastering", 
      tool: "Audio Clearing", 
      desc: "Deploying software-based vocal enhancement to strip away digital noise and achieve studio quality.", 
      detail: "Strip away digital artifacts and achieve noise-free, studio-quality audio dialogue and soundscapes." 
    },
    { 
      title: "Two-Pass Neural Video Reconstruction", 
      tool: "Futurewave Method", 
      desc: "Processing a rough render through a final software-based AI layer to eliminate jitter & push 4K.", 
      detail: "Eliminate motion jitter and push resolution to agency-grade 4K crispness using our proprietary layer." 
    },
    { 
      title: "Algorithmic Export Optimization", 
      tool: "Growth Ready", 
      desc: "Configuring precise bitrates and codecs for final rendering to ensure maximum quality and engagement.", 
      detail: "Optimizing for peak performance across social media algorithms with the right technical export settings." 
    },
  ];

  return (
    <section id="protocol" className="py-20 sm:py-32 px-4 sm:px-6 overflow-hidden">
       <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-24"
          >
             <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-white mb-4 sm:mb-8 leading-tight">The 8-Step Pipeline Reveal</h2>
             <p className="text-white/40 text-sm sm:text-base max-w-2xl mx-auto italic">Hover over any step to reveal the secret technical layer behind the agency-grade output.</p>
          </motion.div>
  
          <div className="relative">
             {/* Central Glow Spine */}
             <div className="absolute left-[31px] md:left-1/2 top-10 bottom-0 w-[1px] bg-white/10 hidden md:block" />

             <div className="space-y-24">
                {steps.map((step, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    onMouseEnter={() => setHoveredStep(i)}
                    onMouseLeave={() => setHoveredStep(null)}
                    key={i} 
                    className={`flex flex-col md:flex-row items-center gap-12 group/step ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                     <div className={`flex-1 w-full p-8 md:p-10 rounded-[2.5rem] border transition-all duration-500 glass-card bg-white/5 backdrop-blur-xl relative overflow-hidden ${hoveredStep === i ? 'border-brand-copper/40 bg-brand-copper/[0.04] scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'border-white/5'} ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <AnimatePresence mode="wait">
                          {hoveredStep === i ? (
                            <motion.div
                              key="detail"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="relative z-10"
                            >
                              <div className={`flex items-center gap-2 mb-4 ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                <motion.div 
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="w-1.5 h-1.5 rounded-full bg-brand-copper shadow-[0_0_8px_rgba(217,119,6,0.8)]" 
                                />
                                <div className="text-brand-copper font-bold text-[10px] uppercase tracking-[0.2em]">Protocol Active</div>
                              </div>
                              <p className="text-white text-xl font-medium leading-relaxed italic mb-4">"{step.detail}"</p>
                              <div className={`flex items-center gap-4 text-[9px] font-mono text-white/20 ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                 <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> NEURAL_LOAD: 12%</span>
                                 <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> LATENCY: 42ms</span>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="base"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="relative z-10"
                            >
                              <h4 className="text-2xl font-display font-bold text-white mb-2 group-hover/step:text-brand-copper transition-colors">{step.title}</h4>
                              <p className="text-brand-copper-glow text-sm font-semibold mb-4 tracking-wider uppercase opacity-80">{step.tool}</p>
                              <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                     
                     <motion.div 
                       whileHover={{ scale: 1.15 }}
                       className="relative z-10 shrink-0"
                     >
                        <div className={`w-16 h-16 rounded-2xl border-2 transition-all duration-500 flex items-center justify-center font-display font-black text-xl backdrop-blur-md relative ${hoveredStep === i ? 'bg-brand-copper border-brand-copper text-white shadow-[0_0_30px_rgba(217,119,6,0.3)] scale-110' : 'bg-brand-charcoal border-brand-copper/30 text-brand-copper-glow'}`}>
                           0{i + 1}
                           {hoveredStep === i && (
                             <motion.div 
                               initial={{ scale: 0.8, opacity: 0.5 }}
                               animate={{ scale: 1.8, opacity: 0 }}
                               transition={{ duration: 1.2, repeat: Infinity }}
                               className="absolute inset-0 border-2 border-brand-copper rounded-2xl"
                             />
                           )}
                        </div>
                     </motion.div>
  
                     <div className="flex-1 w-full hidden md:block" />
                  </motion.div>
                ))}
             </div>
          </div>
       </div>
    </section>
  );
};

const Monetization = () => {
  const [weeklyVideos, setWeeklyVideos] = useState(8);
  const [avgRate, setAvgRate] = useState(2000);
  
  const monthlyRevenue = weeklyVideos * 4 * avgRate;

  return (
    <section id="roi" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
       <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(45deg,transparent,rgba(217,119,6,0.05),transparent)]" />
       <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-6 sm:p-12 md:p-20 rounded-[2rem] sm:rounded-[3rem] border-brand-copper/30"
          >
             <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                <div>
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     className="inline-flex items-center gap-2 text-brand-copper-glow font-bold text-xs sm:text-sm uppercase tracking-widest mb-4 sm:mb-6"
                   >
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      The Monetization Blueprint
                   </motion.div>
                   <motion.h2 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-white mb-6 sm:mb-8 leading-tight"
                   >
                      How to make your <br/>
                      <span className="text-brand-copper">₹4999 back in 48 hours.</span>
                   </motion.h2>
                   <p className="text-white/50 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed max-w-xl">
                      Standard agency rates for these cinematic AI videos range from ₹1,500 to ₹5,000+ per video. 
                      Selling just <span className="text-white font-bold underline underline-offset-4 decoration-brand-copper">one single video</span> to a local client instantly covers the course investment and generates profit.
                   </p>
                   
                   <div className="space-y-4 sm:space-y-6">
                      {[
                        { label: "Format A (Single/Single)", val: "₹1,500+" },
                        { label: "Format B (Single/Multi)", val: "₹2,000+" },
                        { label: "Format C (Multi/Multi)", val: "₹2,500+" },
                      ].map((item, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5"
                        >
                          <span className="text-white/70 text-xs sm:text-sm font-medium">{item.label}</span>
                          <span className="text-brand-copper-glow text-xs sm:text-sm font-bold">{item.val}</span>
                        </motion.div>
                      ))}
                   </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, rotateY: 20 }}
                  whileInView={{ opacity: 1, rotateY: 0 }}
                  transition={{ duration: 1 }}
                  className="relative mt-8 lg:mt-0"
                >
                   <div className="p-6 pb-12 sm:pb-8 sm:p-8 bg-brand-charcoal rounded-2xl sm:rounded-3xl border border-brand-copper/20 shadow-2xl relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-copper/20 blur-3xl opacity-50" />
                      <h4 className="text-white font-display font-bold text-xl sm:text-2xl mb-6 sm:mb-8">Profit Potential Calculator</h4>
                      <div className="space-y-6 sm:space-y-8">
                         <div>
                            <div className="flex justify-between text-xs sm:text-sm text-white/40 mb-3">
                               <span>Weekly Output (Videos)</span>
                               <span className="text-white font-bold">{weeklyVideos}</span>
                            </div>
                            <input 
                              type="range" min="1" max="25" step="1"
                              value={weeklyVideos}
                              onChange={(e) => setWeeklyVideos(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-brand-copper"
                            />
                         </div>
                         <div>
                            <div className="flex justify-between text-xs sm:text-sm text-white/40 mb-3">
                               <span>Average Rate Per Video</span>
                               <span className="text-white font-bold">₹{avgRate.toLocaleString()}</span>
                            </div>
                            <input 
                              type="range" min="500" max="10000" step="250"
                              value={avgRate}
                              onChange={(e) => setAvgRate(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-brand-copper"
                            />
                         </div>
                         <motion.div 
                           key={monthlyRevenue}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="pt-6 sm:pt-8 border-t border-white/10 mt-6 sm:mt-8"
                         >
                            <p className="text-white/40 text-[10px] sm:text-sm mb-2 uppercase tracking-widest font-bold">Estimated Monthly Revenue</p>
                            <p className="text-4xl sm:text-5xl font-display font-black text-brand-copper-glow">₹{monthlyRevenue.toLocaleString()}</p>
                         </motion.div>
                      </div>
                   </div>
                   
                   <motion.div 
                     animate={{ y: [0, -10, 0] }}
                     transition={{ duration: 4, repeat: Infinity }}
                     className="absolute -bottom-10 sm:-bottom-6 right-2 sm:-right-6 p-4 sm:p-6 glass-card rounded-xl sm:rounded-2xl border-brand-copper/20 shadow-2xl z-20"
                   >
                      <div className="flex items-center gap-3 sm:gap-4">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="text-green-500 w-5 h-5 sm:w-6 sm:h-6" />
                         </div>
                         <div>
                            <p className="text-white text-xs sm:text-sm font-bold">Immediate ROI</p>
                            <p className="text-white/40 text-[9px] sm:text-xs text-nowrap">Based on 2024 Market rates</p>
                         </div>
                      </div>
                   </motion.div>
                </motion.div>
             </div>
          </motion.div>
       </div>
    </section>
  );
};

const OfferBreakdown = ({ onJoin, config }: { onJoin: () => void; config: any }) => {
  const seatsRemaining = config.seats_remaining;

  return (
    <section id="offer" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
       {/* Background Accent */}
       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-copper/5 blur-[100px] -z-10 rounded-full" />
       
       <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
             <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-white mb-4 sm:mb-6 leading-tight">The Final Step.</h2>
             <p className="text-brand-copper-glow font-bold text-base sm:text-lg tracking-wide">Limited Seats Available. Do Not Miss This Batch.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="md:col-span-2 glass-card p-8 sm:p-10 md:p-14 rounded-[1.5rem] sm:rounded-[2.5rem] border-brand-copper/20"
             >
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 sm:mb-8">What's Inside the Protocol?</h3>
                <ul className="space-y-4 sm:space-y-6">
                   {[
                     "Cognitive Scripting & HBC Framework Training",
                     "The 8-Step Technical Production Protocol",
                     "Master Asset Synthesis & Character Consistency",
                     "Cinematic Neural Motion Architecture Secrets",
                     "Official Futurewave Labs Certification"
                   ].map((item, i) => (
                     <motion.li 
                       key={i} 
                       initial={{ opacity: 0, y: 10 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="flex items-center gap-3 sm:gap-4 text-white/80"
                     >
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-copper shrink-0" />
                        <span className="font-medium text-sm sm:text-base">{item}</span>
                     </motion.li>
                   ))}
                </ul>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="h-full"
             >
                <InteractiveCard className="h-full">
                  <div className="glass-card p-8 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border-brand-copper bg-brand-copper/5 text-center relative flex flex-col justify-between h-full">
                     <motion.div 
                       animate={{ y: [0, -5, 0] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 sm:py-1.5 bg-brand-copper text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-xl z-20 whitespace-nowrap"
                     >
                        Best Value
                     </motion.div>
                     <div className="relative z-10">
                       <p className="text-white/40 text-[10px] sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4">Total Value: <span className="line-through">₹{config.price_original.toLocaleString()}</span></p>
                       <div className="flex items-center justify-center gap-1 mb-6 sm:mb-8">
                          <span className="text-3xl sm:text-4xl font-display font-bold text-white">₹</span>
                          <span className="text-5xl sm:text-7xl font-display font-black text-white px-1 sm:px-2">{config.price_current.toLocaleString()}</span>
                       </div>
                       
                       <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 backdrop-blur-sm">
                          <p className="text-brand-copper-glow text-lg sm:text-xl font-display font-bold mb-0.5 sm:mb-1">{seatsRemaining}/{config.seats_total}</p>
                          <p className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Seats Remaining</p>
                       </div>
                     </div>

                     <div>
                        <motion.button 
                          onClick={onJoin}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-4 sm:py-5 bg-brand-copper rounded-xl sm:rounded-2xl text-white font-bold text-lg sm:text-xl glow-copper transition-all mb-4 block relative overflow-hidden group/btn"
                        >
                          <span className="relative z-10">Join Batch Now</span>
                          <motion.div 
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 bg-white/20 -skew-x-12"
                          />
                        </motion.button>
                        <div className="flex flex-col gap-2">
                           <p className="text-white/30 text-[9px] sm:text-[10px] flex items-center justify-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Secure Checkout
                           </p>
                           <div className="hidden sm:flex items-center justify-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              <p className="text-[9px] text-green-500/50 font-bold uppercase tracking-[0.2em]">3 people looking now</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </InteractiveCard>
             </motion.div>
          </div>
       </div>
    </section>
  );
};

const SyllabusDownload = () => (
  <section id="syllabus" className="py-20 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-brand-copper/5">
     <div className="max-w-4xl mx-auto text-center border-2 border-brand-copper/30 glass-card p-8 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] relative group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 sm:px-6 py-1.5 sm:py-2 bg-brand-copper text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] shadow-xl whitespace-nowrap">
           Resource Pack
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-4 sm:mb-6">Ready to see the full <span className="text-brand-copper">curriculum?</span></h2>
        <p className="text-white/60 mb-8 sm:mb-10 text-sm sm:text-lg">Get the deep-dive 12-page syllabus including the full technical blueprints and monetization roadmap.</p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6">
           <motion.a 
             href="/Futurewave_Basic_Syllabus_Final.pdf"
             download="Futurewave_Basic_Syllabus_Final.pdf"
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="px-10 py-5 bg-white text-brand-black font-black text-lg rounded-2xl flex items-center gap-3 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all"
           >
              Download PDF Syllabus
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </motion.a>
           <p className="text-white/30 text-sm font-medium">Free instant access • 1.2 MB PDF</p>
        </div>
     </div>
  </section>
);

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: "Do I need a high-end PC?", a: "While we use high-performance local software for editing and upscaling, we teach you how to optimize your current setup to handle this agency-grade workflow." },
    { q: "Will I learn how to keep characters consistent?", a: "Yes. This is a core pillar of our protocol. You will learn the exact settings to keep your characters identical across multiple environments and camera angles." },
    { q: "Why don't you list the software names?", a: "We teach a proprietary agency pipeline, not a single tool. We reveal the exact software stack inside the masterclass to protect our students' competitive edge in the market." },
    { q: "Is there a certificate?", a: "Yes. You receive an Official Futurewave Labs Certification upon completing the masterclass and demonstrating the 8-step protocol." }
  ];

  return (
    <section id="faq" className="py-20 sm:py-32 px-4 sm:px-6 bg-brand-black">
       <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
             <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-4">Frequently Asked</h2>
             <p className="text-white/40 text-sm sm:text-base">Everything you need to know before joining.</p>
          </div>

          <div className="space-y-4">
             {faqs.map((faq, i) => (
               <div key={i} className="glass-card rounded-xl sm:rounded-2xl overflow-hidden border border-white/5">
                  <button 
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors gap-4"
                  >
                     <span className="text-base sm:text-lg font-medium text-white/90">{faq.q}</span>
                     {open === i ? <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-brand-copper shrink-0" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 shrink-0" />}
                  </button>
                  <AnimatePresence>
                     {open === i && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="px-5 sm:px-6 pb-5 sm:pb-6 text-white/50 text-sm sm:text-base leading-relaxed"
                       >
                          {faq.a}
                       </motion.div>
                     )}
                  </AnimatePresence>
               </div>
             ))}
          </div>
       </div>
    </section>
  );
};

const Footer = ({ logoUrl }: { logoUrl?: string }) => (
   <footer className="py-16 sm:py-32 px-4 sm:px-6 border-t border-white/5 bg-brand-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-copper/30 to-transparent" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 sm:gap-16 relative z-10">
         <div className="max-w-xs space-y-6">
            <div className="flex items-center">
                <img 
                  src={logoUrl || logoWhite} 
                  alt="Futurewave Labs" 
                  className="h-10 sm:h-12 w-auto object-contain" 
                />
            </div>
            <p className="text-white/30 text-sm leading-relaxed">
              We empower creators to bypass the limitations of traditional production using systematic AI cinematic workflows.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Linkedin, href: "#" }
              ].map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-brand-copper hover:border-brand-copper/50 transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-24">
            <div className="space-y-6">
               <h4 className="text-white font-bold text-sm uppercase tracking-widest">Masterclass</h4>
               <ul className="space-y-4 text-white/40 text-sm">
                  <li><a href="#workflow" className="hover:text-brand-copper transition-colors">The Pipeline</a></li>
                  <li><a href="#offer" className="hover:text-brand-copper transition-colors">Pricing</a></li>
                  <li><a href="#roi" className="hover:text-brand-copper transition-colors">Monetization</a></li>
                  <li><a href="#faq" className="hover:text-brand-copper transition-colors">Course FAQ</a></li>
               </ul>
            </div>
            <div className="space-y-6">
               <h4 className="text-white font-bold text-sm uppercase tracking-widest">Company</h4>
               <ul className="space-y-4 text-white/40 text-sm">
                  <li><a href="#" className="hover:text-brand-copper transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-brand-copper transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-brand-copper transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-brand-copper transition-colors">Contact Support</a></li>
               </ul>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white/20 text-xs font-medium tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Futurewave Labs. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
             <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Encrypted Payment</span>
             <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> Global Access</span>
          </div>
      </div>
   </footer>
);

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.pathname === "/admin");
  const [isCheckout, setIsCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txRef, setTxRef] = useState('');

  const [config, setConfig] = useState({
    hero_title: 'Master Agency-Grade Cinematic AI Video.',
    hero_subtitle: 'Bypass traditional production constraints. Build cinematic, studio-quality AI campaigns using our systematic 8-step production pipeline.',
    price_current: 4999,
    price_original: 14999,
    discount_amount: 10000,
    seats_total: 20,
    seats_remaining: 6,
    logo_url: '/logo-white.png',
    favicon_url: '/logo.png'
  });

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);

        // Dynamically update site favicon if it has changed
        if (data.favicon_url) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.favicon_url;
        }
      }
    } catch (err) {
      console.error('Error fetching site configuration:', err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdmin(window.location.pathname === "/admin");
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  useEffect(() => {
    if (isCheckout || paymentSuccess) {
      window.scrollTo(0, 0);
    }
  }, [isCheckout, paymentSuccess]);

  const handlePaymentSuccess = (paymentId: string) => {
    setTxRef(paymentId);
    setPaymentSuccess(true);
    setIsCheckout(false);
    fetchConfig(); // reload remaining seats
  };

  return (
    <div className="bg-brand-black min-h-screen text-slate-200 selection:bg-brand-copper selection:text-white relative">
      <LiveBackground />
      <Particles />
      <div className="grain" />
      
      <AnimatePresence mode="wait">
        {isAdmin ? (
          <AdminDashboard 
            key="admin" 
            onBack={() => {
              window.history.pushState({}, '', '/');
              setIsAdmin(false);
            }} 
          />
        ) : paymentSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 relative z-10"
          >
            <div className="glass-card max-w-lg w-full p-8 sm:p-10 rounded-[2.5rem] border-green-500/20 bg-brand-charcoal/50 text-center space-y-6 shadow-2xl relative overflow-hidden" style={{ minHeight: '380px' }}>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center glow-green mx-auto border border-green-500/30">
                <CheckCircle2 className="text-green-500 w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-black text-white uppercase tracking-wider">SEAT CONFIRMED</h2>
                <p className="text-white/60 text-sm">Welcome to Futurewave Labs. Your enrollment is verified!</p>
              </div>
              
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left space-y-2 font-mono text-xs text-white/50">
                <div className="flex justify-between"><span className="text-white/30">Payment Gateway</span><span>Razorpay Standard</span></div>
                <div className="flex justify-between"><span className="text-white/30">Transaction Ref</span><span className="text-brand-copper-glow font-bold">{txRef}</span></div>
                <div className="flex justify-between"><span className="text-white/30">Enrollment Status</span><span className="text-green-400">Processed</span></div>
              </div>

              <p className="text-white/40 text-xs sm:text-sm italic">
                We have emailed your masterclass schedule and onboarding guidelines. Please check your inbox (and spam folder) for access links.
              </p>

              <button
                onClick={() => {
                  setPaymentSuccess(false);
                  setTxRef('');
                }}
                className="w-full py-4 bg-brand-copper hover:bg-brand-copper/90 text-white font-bold rounded-xl transition-all glow-copper uppercase tracking-wider text-xs"
              >
                Go Back to Site
              </button>
            </div>
          </motion.div>
        ) : !isCheckout ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 font-sans"
          >
            <Navbar onJoin={() => setIsCheckout(true)} logoUrl={config.logo_url} />
            <Hero onJoin={() => setIsCheckout(true)} config={config} />
            <TrustBanner />
            <Agitation />
            <MasterFormats />
            <PipelineReveal />
            <Monetization />
            <OfferBreakdown onJoin={() => setIsCheckout(true)} config={config} />
            <SyllabusDownload />
            <FAQ />
            <Footer logoUrl={config.logo_url} />
            <Chatbot />

            {/* Floating CTA for Mobile Scarcity */}
            <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[90] md:hidden w-full px-4 sm:px-6">
               <button 
                 onClick={() => setIsCheckout(true)}
                 className="w-full flex items-center justify-between px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-copper glow-copper rounded-xl sm:rounded-2xl text-white font-bold text-xs sm:text-sm shadow-2xl"
               >
                  <span>JOIN THE BATCH</span>
                  <div className="flex items-center gap-2">
                     <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] sm:text-[10px]">₹{config.price_current.toLocaleString()}</span>
                     <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
               </button>
            </div>
          </motion.div>
        ) : (
          <PaymentPage key="payment" config={config} onBack={() => setIsCheckout(false)} onSuccess={handlePaymentSuccess} />
        )}
      </AnimatePresence>
    </div>
  );
}
