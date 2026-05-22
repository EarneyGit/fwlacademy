import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, ArrowRight, Phone, Mail, User as UserIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are 'Futurewave Assistant' – a high-conversion sales bot for Futurewave Labs.
Your CORE MISSION is to move users through this 3-step funnel:
1. INFORM: Briefly answer questions about the 8-step AI Video Masterclass (Offline, ₹4999).
2. CAPTURE: If user shows interest, ask for Name, Email, and Phone.
3. CONVERT: Direct them to the "Enroll Now" button to pay.

STRICT CONSTRAINTS:
- KEEP RESPONSES VERY SHORT (max 2-3 sentences).
- Use bullet points ONLY when necessary.
- Avoid technical jargon unless asked.
- Always mention "Only 20 seats per batch" to create scarcity.

KEY FACTS:
- Course: 8-Step Offline Masterclass.
- Investment: ₹4999.
- Outcome: Master agency-grade AI video & earn ₹2k-₹5k per clip.
- Tools: We use cloud-based professional tech (Narrative Protocol, Motion Architecture).

FUNNEL LOGIC:
- If user asks about price/curriculum/ROI -> Answer & ask "Should I reserve your seat for the next batch?"
- If user says "Yes/Book/Join" -> Trigger the lead form.`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'form' | 'options';
}

const SUGGESTED_QUESTIONS = [
  "How can I join?",
  "What is the curriculum?",
  "Earnings & ROI?",
  "Reserve my seat now"
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! Ready to master agency-grade AI Video? We're taking only 20 students. How can I help you get started?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '' });
  const [showForm, setShowForm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, showForm]);

  const handleSend = async (customMessage?: string) => {
    const userMessage = (customMessage || input).trim();
    if (!userMessage || isLoading) return;

    if (!customMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    if (
      userMessage.toLowerCase().includes('book') || 
      userMessage.toLowerCase().includes('seat') || 
      userMessage.toLowerCase().includes('join') ||
      userMessage.toLowerCase().includes('enroll') ||
      userMessage.toLowerCase().includes('register') ||
      userMessage.toLowerCase().includes('interested')
    ) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Great choice! Since we only have 20 slots, please drop your details below to reserve your spot. Our team will verify and guide you to payment." 
        }]);
        setShowForm(true);
        setIsLoading(false);
      }, 800);
      return;
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY" || process.env.GEMINI_API_KEY === "") {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm currently running in offline demo mode because the GEMINI_API_KEY hasn't been configured on Vercel yet. However, you can still click the suggested options or book directly!" 
        }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const chatHistory = messages.filter(m => m.type !== 'form').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
        }
      });

      const botResponse = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name || !leadData.email || !leadData.phone) return;
    
    setShowForm(false);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `Got it, ${leadData.name.split(' ')[0]}! Your reservation is pending. Click the button below to pay ₹4999 and finalize your seat before the 20 slots are gone!` 
    }]);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        id="chatbot-trigger"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 md:bottom-6 right-6 z-[60] w-14 h-14 bg-brand-copper rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.5)] group ${isOpen ? 'hidden md:flex' : 'flex'}`}
      >
        {isOpen ? <X className="text-white w-6 h-6" /> : <Sparkles className="text-white w-6 h-6 animate-pulse" />}
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform" 
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-[100] w-full h-[100dvh] md:h-[600px] md:w-[400px] bg-brand-black md:bg-brand-black/95 backdrop-blur-xl border-t md:border border-white/10 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-brand-copper border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white leading-tight">Futurewave Assistant</h3>
                  <p className="text-[10px] text-white/70 font-medium">Online • Responding Fast</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth bg-gradient-to-b from-brand-copper/5 to-transparent"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-brand-copper text-white rounded-tr-none shadow-lg' 
                      : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {showForm && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-brand-copper/30 rounded-2xl p-5 space-y-4 shadow-xl"
                >
                  <p className="text-xs font-bold text-brand-copper uppercase tracking-widest text-center">Secure Your Spot</p>
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input 
                        required
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-brand-copper outline-none"
                        value={leadData.name}
                        onChange={e => setLeadData({...leadData, name: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input 
                        required
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-brand-copper outline-none"
                        value={leadData.email}
                        onChange={e => setLeadData({...leadData, email: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input 
                        required
                        type="tel" 
                        placeholder="WhatsApp Number" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-brand-copper outline-none"
                        value={leadData.phone}
                        onChange={e => setLeadData({...leadData, phone: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-brand-copper py-3 rounded-xl text-white font-bold text-xs shadow-lg shadow-brand-copper/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Reserve My Seat
                    </button>
                  </form>
                </motion.div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-brand-copper animate-spin" />
                    <span className="text-xs text-white/40 italic">Assistant is typing...</span>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {!isLoading && !showForm && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] text-white/60 hover:text-brand-copper hover:border-brand-copper transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fixed CTA at bottom of chat */}
            <div className="p-3 bg-brand-copper/10 border-t border-white/5">
              <a 
                href="#pricing" 
                onClick={() => setIsOpen(false)}
                className="w-full h-12 bg-white text-brand-black rounded-xl flex items-center justify-center gap-2 font-black text-sm hover:scale-[1.02] transition-transform shadow-xl"
              >
                Enroll Now • ₹4999 
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Input */}
            <div className="p-4 pb-8 md:pb-4 bg-brand-black border-t border-white/5 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your question..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 pr-14 text-white text-sm focus:outline-none focus:border-brand-copper transition-colors placeholder:text-white/20"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-10 h-10 bg-brand-copper rounded-xl flex items-center justify-center text-white hover:bg-brand-copper-glow transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

