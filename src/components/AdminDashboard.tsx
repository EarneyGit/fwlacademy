import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  Users, 
  TrendingUp, 
  LogOut, 
  Lock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle, 
  Upload, 
  Download, 
  Search, 
  ArrowLeft, 
  Activity,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface Config {
  hero_title: string;
  hero_subtitle: string;
  price_current: number;
  price_original: number;
  discount_amount: number;
  seats_total: number;
  seats_remaining: number;
  chatbot_prompt: string;
  logo_url: string;
  favicon_url: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  status: string;
  created_at: string;
}

export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [passcode, setPasscode] = useState(localStorage.getItem('admin_passcode') || '');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'editor' | 'leads'>('overview');
  const [config, setConfig] = useState<Config | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Loading and Error states
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState<'logo' | 'favicon' | null>(null);

  // Authenticate
  const verifyPasscode = async (codeToVerify = passcode) => {
    if (!codeToVerify) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const response = await fetch('/api/leads', {
        headers: {
          'x-admin-passcode': codeToVerify
        }
      });
      if (response.ok) {
        localStorage.setItem('admin_passcode', codeToVerify);
        setIsAuthorized(true);
        const data = await response.json();
        setLeads(data);
        fetchConfig();
      } else {
        setLoginError('Invalid passcode. Access denied.');
        localStorage.removeItem('admin_passcode');
      }
    } catch (err) {
      setLoginError('Server error connecting to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  useEffect(() => {
    if (passcode) {
      verifyPasscode(passcode);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPasscode();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_passcode');
    setPasscode('');
    setIsAuthorized(false);
  };

  const handleConfigChange = (field: keyof Config, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      [field]: value
    });
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': passcode
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save configuration settings.');
      }
    } catch (err) {
      alert('Error updating configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-admin-passcode': passcode
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        handleConfigChange(field === 'logo' ? 'logo_url' : 'favicon_url', data.url);
      } else {
        alert('File upload to Cloudinary failed.');
      }
    } catch (err) {
      alert('Upload error occurred.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleUpdateLeadStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': passcode
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedLead = await response.json();
        setLeads(leads.map(l => l.id === id ? updatedLead : l));
      } else {
        alert('Failed to update lead status.');
      }
    } catch (err) {
      alert('Error connecting to leads endpoint.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Order ID', 'Payment ID', 'Status', 'Registered At'];
    const rows = leads.map(l => [
      l.id,
      l.name,
      l.email,
      l.phone,
      l.razorpay_order_id,
      l.razorpay_payment_id || 'N/A',
      l.status,
      new Date(l.created_at).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Computations for metrics
  const paidLeads = leads.filter(l => l.status === 'Paid');
  const pendingLeads = leads.filter(l => l.status === 'Pending');
  const totalRevenue = paidLeads.length * (config?.price_current || 4999);
  const conversionRate = leads.length > 0 ? ((paidLeads.length / leads.length) * 100).toFixed(1) : '0.0';

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                          l.email.toLowerCase().includes(search.toLowerCase()) ||
                          l.phone.includes(search);
    const matchesFilter = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
        <div className="absolute top-10 left-10">
          <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Landing Page
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full p-8 sm:p-10 rounded-[2rem] border-white/10 bg-brand-charcoal/50 text-center space-y-6"
        >
          <div className="w-16 h-16 bg-brand-copper/20 rounded-2xl flex items-center justify-center glow-copper mx-auto">
            <Lock className="text-brand-copper w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">CMS Access Portal</h2>
            <p className="text-white/40 text-xs sm:text-sm">Verify authorization passcode to load admin dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              placeholder="Enter Access Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-center text-white focus:outline-none focus:border-brand-copper transition-all tracking-[0.2em] font-mono text-lg"
            />
            {loginError && <p className="text-red-500 text-xs font-bold uppercase tracking-wider">{loginError}</p>}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-brand-copper text-white font-bold rounded-xl glow-copper hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? 'VERIFYING...' : 'ENTER DASHBOARD'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
      
      {/* Header */}
      <header className="h-20 bg-brand-black/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white" aria-label="Exit Admin Panel">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {config?.logo_url ? (
              <img src={config.logo_url} alt="Logo" className="h-6 w-auto object-contain" />
            ) : (
              <span className="font-display font-bold text-lg tracking-wider text-brand-copper">FUTUREWAVE</span>
            )}
            <span className="bg-brand-copper/20 text-brand-copper border border-brand-copper/30 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
              CMS Dashboard
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-widest border border-white/5"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-64 bg-brand-charcoal/20 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-visible">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'editor', label: 'Page Content Editor', icon: Settings },
            { id: 'leads', label: 'Leads & Submissions', icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap md:w-full ${
                  activeTab === tab.id 
                    ? 'bg-brand-copper text-white glow-copper' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Dynamic Content Panel */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          {activeTab === 'overview' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-3xl font-display font-bold uppercase tracking-wider">Metrics Snapshot</h1>
                  <p className="text-white/40 text-xs sm:text-sm">Real-time indicators extracted from database logs.</p>
                </div>
                <button onClick={fetchConfig} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/5">
                  Refresh Logs
                </button>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, sub: `${paidLeads.length} Orders Paid`, icon: TrendingUp },
                  { label: 'Conversion Rate', value: `${conversionRate}%`, sub: 'Paid / Total Submissions', icon: Activity },
                  { label: 'Seats Filled', value: `${config ? config.seats_total - config.seats_remaining : 14}/${config?.seats_total || 20}`, sub: `${config?.seats_remaining || 6} Seats Remaining`, icon: Users },
                  { label: 'Total Leads', value: leads.length, sub: `${pendingLeads.length} Registrations Pending`, icon: FileText },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="glass-card p-6 rounded-2xl border-white/10 bg-brand-charcoal/30 space-y-4">
                      <div className="flex justify-between items-center text-white/40">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{card.label}</span>
                        <Icon className="w-5 h-5 text-brand-copper" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-black">{card.value}</div>
                        <div className="text-[10px] text-white/30 font-bold uppercase tracking-wide">{card.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Alert Banner */}
              <div className="glass-card p-6 rounded-2xl border-white/10 bg-brand-copper/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-brand-copper text-sm">
                    <Sparkles className="w-4 h-4" /> Live Scarcity Indicator
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed max-w-xl">
                    Remaining seats update in real-time as users complete the Razorpay checkout verification. Dynamic alerts highlight urgency based on these counts.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center sm:text-left shrink-0">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50 block mb-0.5">Vercel Webhook</span>
                  <span className="text-green-500 font-mono text-[10px] font-bold">Active & Listening</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'editor' && config && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-3xl font-display font-bold uppercase tracking-wider">Page Content Editor</h1>
                <p className="text-white/40 text-xs sm:text-sm">Manage website copywriting, media links, and pricing details.</p>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-8">
                {/* Hero Section copy */}
                <div className="glass-card p-6 sm:p-8 rounded-[2rem] border-white/10 bg-brand-charcoal/30 space-y-6">
                  <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Hero Details</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Hero Main Title</label>
                      <input 
                        type="text" 
                        value={config.hero_title}
                        onChange={(e) => handleConfigChange('hero_title', e.target.value)}
                        className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Hero Subtitle</label>
                      <textarea 
                        rows={3}
                        value={config.hero_subtitle}
                        onChange={(e) => handleConfigChange('hero_subtitle', e.target.value)}
                        className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Scarcity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-6 sm:p-8 rounded-[2rem] border-white/10 bg-brand-charcoal/30 space-y-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Course Pricing (INR)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Current Price</label>
                        <input 
                          type="number" 
                          value={config.price_current}
                          onChange={(e) => handleConfigChange('price_current', e.target.value)}
                          className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Original Price</label>
                        <input 
                          type="number" 
                          value={config.price_original}
                          onChange={(e) => handleConfigChange('price_original', e.target.value)}
                          className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Discount</label>
                        <input 
                          type="number" 
                          value={config.discount_amount}
                          onChange={(e) => handleConfigChange('discount_amount', e.target.value)}
                          className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 sm:p-8 rounded-[2rem] border-white/10 bg-brand-charcoal/30 space-y-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Scarcity Manager</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Seats</label>
                        <input 
                          type="number" 
                          value={config.seats_total}
                          onChange={(e) => handleConfigChange('seats_total', e.target.value)}
                          className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Seats Remaining</label>
                        <input 
                          type="number" 
                          value={config.seats_remaining}
                          onChange={(e) => handleConfigChange('seats_remaining', e.target.value)}
                          className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media branding */}
                <div className="glass-card p-6 sm:p-8 rounded-[2rem] border-white/10 bg-brand-charcoal/30 space-y-6">
                  <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Media & Branding Assets (Cloudinary)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Navbar Header Logo URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={config.logo_url}
                            onChange={(e) => handleConfigChange('logo_url', e.target.value)}
                            className="flex-1 bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all text-xs"
                          />
                          <label className="w-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                            <Upload className="w-4 h-4 text-white/60" />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleUploadFile(e, 'logo')} 
                              disabled={uploadingField !== null}
                            />
                          </label>
                        </div>
                        {uploadingField === 'logo' && <span className="text-[10px] text-brand-copper animate-pulse">Uploading to Cloudinary...</span>}
                      </div>
                      {config.logo_url && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-fit">
                          <img src={config.logo_url} alt="Logo preview" className="h-6 w-auto object-contain" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tab Icon (Favicon) URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={config.favicon_url}
                            onChange={(e) => handleConfigChange('favicon_url', e.target.value)}
                            className="flex-1 bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all text-xs"
                          />
                          <label className="w-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                            <Upload className="w-4 h-4 text-white/60" />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleUploadFile(e, 'favicon')}
                              disabled={uploadingField !== null}
                            />
                          </label>
                        </div>
                        {uploadingField === 'favicon' && <span className="text-[10px] text-brand-copper animate-pulse">Uploading to Cloudinary...</span>}
                      </div>
                      {config.favicon_url && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-fit">
                          <img src={config.favicon_url} alt="Favicon preview" className="h-6 w-auto object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Chatbot Custom Prompt */}
                <div className="glass-card p-6 sm:p-8 rounded-[2rem] border-white/10 bg-brand-charcoal/30 space-y-6">
                  <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">AI Chatbot Assistant System Prompt</h3>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">System Instructions (Gemini SDK)</label>
                    <textarea 
                      rows={8}
                      value={config.chatbot_prompt}
                      onChange={(e) => handleConfigChange('chatbot_prompt', e.target.value)}
                      className="w-full bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-copper transition-all font-mono text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Save CTA */}
                <div className="flex items-center gap-4">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="px-8 py-4 bg-brand-copper text-white font-bold rounded-xl glow-copper hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? 'SAVING CHANGES...' : 'SAVE WEBSITE CONTENT'}
                  </button>
                  {saveSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-wider text-xs"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Saved & Deployed to Live DB!
                    </motion.div>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'leads' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-3xl font-display font-bold uppercase tracking-wider">Leads & Registrations</h1>
                  <p className="text-white/40 text-xs sm:text-sm">Review student registrations and manage payment logs.</p>
                </div>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative flex items-center">
                  <Search className="w-4 h-4 absolute left-4 text-white/30" />
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-brand-charcoal/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-copper transition-all text-sm"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-brand-charcoal/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-copper text-white/70"
                >
                  <option value="All" className="bg-brand-black">All Statuses</option>
                  <option value="Paid" className="bg-brand-black">Paid</option>
                  <option value="Pending" className="bg-brand-black">Pending</option>
                  <option value="Failed" className="bg-brand-black">Failed</option>
                </select>
              </div>

              {/* Leads Table */}
              <div className="glass-card rounded-[2rem] border-white/10 bg-brand-charcoal/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 uppercase tracking-widest text-[9px] font-bold text-white/50">
                        <th className="p-4 pl-6">ID</th>
                        <th className="p-4">Student Details</th>
                        <th className="p-4">Payment Details</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map(lead => (
                          <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 pl-6 font-mono text-xs text-white/40">#{lead.id}</td>
                            <td className="p-4 space-y-1">
                              <div className="font-bold text-white">{lead.name}</div>
                              <div className="text-xs text-white/40 font-mono">{lead.email}</div>
                              <div className="text-xs text-white/40 font-mono">{lead.phone}</div>
                            </td>
                            <td className="p-4 space-y-1">
                              <div className="text-xs text-white/60 font-mono">Order: {lead.razorpay_order_id}</div>
                              {lead.razorpay_payment_id ? (
                                <div className="text-[10px] text-brand-copper-glow font-mono">Pay ID: {lead.razorpay_payment_id}</div>
                              ) : (
                                <div className="text-[10px] text-white/20 italic font-mono">No payment ID logged</div>
                              )}
                            </td>
                            <td className="p-4 text-xs text-white/50">
                              {new Date(lead.created_at).toLocaleDateString()} <br />
                              <span className="text-[10px] text-white/30">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td className="p-4">
                              <select 
                                value={lead.status}
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider focus:outline-none ${
                                  lead.status === 'Paid' 
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                    : lead.status === 'Pending' 
                                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}
                              >
                                <option value="Pending" className="bg-brand-black text-white">Pending</option>
                                <option value="Paid" className="bg-brand-black text-white">Paid</option>
                                <option value="Failed" className="bg-brand-black text-white">Failed</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-white/30 italic">
                            No student registration leads found matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};
