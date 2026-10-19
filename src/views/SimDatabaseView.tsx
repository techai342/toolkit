import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Crosshair, 
  Database, 
  Terminal, 
  Cpu, 
  Radar, 
  Trash2, 
  History as HistoryIcon,
  ShieldCheck,
  ShieldAlert,
  Moon,
  Sun,
  Ghost,
  Files,
  Activity,
  Fingerprint,
  ExternalLink
} from 'lucide-react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { SimDatabase } from './admin-dashboard/types';

interface SearchHistory {
  number: string;
  name: string;
  time: string;
}

export default function SimDatabaseView() {
  const { admin_username } = useParams();
  const [dbConfig, setDbConfig] = useState<SimDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [toasts, setToasts] = useState<{ id: number, msg: string, isError: boolean }[]>([]);

  useEffect(() => {
    if (admin_username) {
      fetchDbConfig(admin_username);
    }
  }, [admin_username]);

  useEffect(() => {
    const hist = localStorage.getItem(`saqib_history_${admin_username}`);
    if (hist) {
      try {
        setSearchHistory(JSON.parse(hist));
      } catch (e) {}
    }
    
    // Default to dark mode but check if body has dark
    setIsDark(document.documentElement.classList.contains('dark'));
  }, [admin_username]);

  const fetchDbConfig = async (username: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sim_databases')
        .select('*')
        .eq('admin_username', username)
        .limit(1)
        .maybeSingle();
        
      if (error || !data) {
        console.error("Supabase Error:", error);
        setError('Database tool not found or inactive.');
      } else {
        setDbConfig(data);
        // Increment view count
        try {
          await supabase.rpc('increment_sim_db_views', { db_id: data.id });
        } catch (e) {}
      }
    } catch (err) {
      setError('Failed to load database config.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = searchInput.replace(/[^0-9]/g, '');

    if (cleanNum.length < 10) {
      showToast('INVALID FORMAT', true);
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const WORKER_PROXY_URL = 'https://sim-api.fakcloud.tech/';
      const res = await fetch(`${WORKER_PROXY_URL}?q=${cleanNum}`);
      const responseData = await res.json();
      
      if (res.ok && responseData.success && responseData.data?.records?.length > 0) {
        showToast('TRACE COMPLETED');
        setSearchResult({ success: true, data: responseData });
        const first = responseData.data.records[0];
        addToHistory(first.phone || cleanNum, first.full_name);
      } else {
        setSearchResult({ success: false, error: 'Identity not found in database.' });
      }
    } catch (err) {
      setSearchResult({ success: false, error: 'Connection failure. Proxy timed out.' });
    } finally {
      setIsSearching(false);
    }
  };

  const addToHistory = (number: string, name: string) => {
    const entry = { number, name: name || 'UNKNOWN_ENTITY', time: new Date().toLocaleString() };
    setSearchHistory(prev => {
      if (prev.length > 0 && prev[0].number === number) return prev;
      const next = [entry, ...prev].slice(0, 50);
      localStorage.setItem(`saqib_history_${admin_username}`, JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(`saqib_history_${admin_username}`);
    showToast('Local cache purged');
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast('Data exported to clipboard'));
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('Data exported to clipboard');
      } catch (err) {}
      textArea.remove();
    }
  };

  const getCopyData = (records: any[]) => {
    let copyData = `--- ${dbConfig?.name?.toUpperCase() || 'SAQIB ZONE'} SECURE EXPORT ---\n`;
    records.forEach((item, i) => {
        copyData += `\n[RECORD ${i+1}]\nPhone: ${item.phone || 'N/A'}\nName: ${item.full_name || 'N/A'}\nCNIC: ${item.cnic || 'N/A'}\nAddress: ${item.address || 'N/A'}\n`;
    });
    return copyData;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950">
        <Activity className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !dbConfig) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950 text-white font-mono">
        <div className="text-center p-8 bg-black/40 border border-slate-800 rounded-2xl max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl text-red-400 font-bold mb-2">ACCESS DENIED</h2>
          <p className="text-slate-400 text-sm">{error || 'Terminal inactive.'}</p>
        </div>
      </div>
    );
  }

  const themeHex = dbConfig.theme_color || '#00E5FF';

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 relative font-${dbConfig.font_family || 'sans'} ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
      style={{
         '--theme-color': themeHex,
      } as React.CSSProperties}
    >
      <style>{`
        :root { --theme-color: ${themeHex}; }
        .theme-bg { background-color: var(--theme-color); }
        .theme-text { color: var(--theme-color); }
        .theme-border { border-color: var(--theme-color); }
        .theme-ring:focus { --tw-ring-color: var(--theme-color); }
        .cyber-grid {
            background-image: 
                linear-gradient(rgba(255,255,255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255, 0.03) 1px, transparent 1px);
            background-size: 20px 20px;
        }
      `}</style>
      
      {/* Background layer */}
      {isDark && <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>}
      {dbConfig.bg_image_url && (
         <div 
           className="fixed inset-0 z-0 opacity-20 pointer-events-none"
           style={{
             backgroundImage: `url(${dbConfig.bg_image_url})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundAttachment: 'fixed'
           }}
         />
      )}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-r-xl shadow-lg border transition-all duration-300 pointer-events-auto ${t.isError ? 'bg-red-500 text-white border-red-600' : 'bg-slate-900 border-l-4 theme-border text-slate-200'}`}>
            {t.isError ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 theme-text" />}
            <span className="font-mono text-xs">{t.msg}</span>
          </div>
        ))}
      </div>

      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-black ring-2 theme-border shadow-lg" style={{ background: `linear-gradient(135deg, ${themeHex}, #2563EB)` }}>
                    {dbConfig.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent leading-tight" style={{ backgroundImage: `linear-gradient(to right, ${themeHex}, #3b82f6)` }}>
                      {dbConfig.name}
                    </h1>
                    {dbConfig.admin_name && (
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider -mt-1 opacity-80">Admin: {dbConfig.admin_name}</p>
                    )}
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase">ID Resolution Node</p>
                </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 relative z-10">
                {dbConfig.main_website_link && (
                  <a href={dbConfig.main_website_link} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 shadow-lg shadow-blue-500/10">
                      <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                {dbConfig.channel_link && (
                  <a href={dbConfig.channel_link} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-all shadow-lg shadow-green-500/30">
                      <i className="bi bi-whatsapp"></i> Join Channel
                  </a>
                )}
                <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
            </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-6 relative z-10">
        
        <div className="flex bg-slate-200 dark:bg-slate-800/50 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('search')} 
              className={`flex-1 py-3 text-sm md:text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'search' ? 'bg-white dark:bg-slate-700 shadow-sm theme-text' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}
            >
                <Crosshair className="w-4 h-4" /> Target Trace
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`flex-1 py-3 text-sm md:text-base font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 shadow-sm theme-text' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}
            >
                <Database className="w-4 h-4" /> Local Logs
            </button>
        </div>

        {activeTab === 'search' && (
          <section className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div 
                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-20"
                    style={{ backgroundColor: themeHex }}
                  ></div>
                  
                  <h2 className="text-2xl font-bold mb-2 font-mono flex items-center gap-2 text-slate-900 dark:text-white">
                      <Terminal className="w-6 h-6 theme-text" /> Initialize Trace
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-mono">
                    Input valid 11-digit MSISDN or 13-digit CNIC for lookup.
                  </p>
                  
                  <form onSubmit={handleSearch} className="flex flex-col gap-4">
                      <div className="relative">
                          <Cpu className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" style={{ color: isDark ? themeHex : undefined, opacity: 0.5 }} />
                          <input 
                            type="text" 
                            required 
                            autoComplete="off" 
                            placeholder="e.g., 03xxxxxxxxx or 3xxxxxxxxxxxx" 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:border-transparent outline-none transition-all text-lg font-mono tracking-widest placeholder:tracking-normal theme-ring"
                            style={{ color: isDark ? themeHex : undefined }}
                          />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isSearching}
                        className="w-full text-slate-950 font-extrabold text-lg py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ background: `linear-gradient(to right, ${themeHex}, #818cf8)` }}
                      >
                          {isSearching ? <Activity className="w-5 h-5 animate-spin" /> : <Radar className="w-5 h-5" />} 
                          {isSearching ? "EXECUTING..." : "EXECUTE QUERY"}
                      </button>
                  </form>
              </div>

              {isSearching && (
                 <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-2xl animate-in slide-in-from-bottom-4">
                    <div className="w-16 h-16 border-4 border-t-transparent animate-spin rounded-full mb-4 theme-border"></div>
                    <div className="text-xs font-mono tracking-widest animate-pulse theme-text">SEARCHING...</div>
                </div>
              )}

              {searchResult && !isSearching && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 transition-all">
                  {!searchResult.success ? (
                    <div className="bg-red-50 dark:bg-black border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center">
                        <ShieldAlert className="w-12 h-12 text-red-500 mb-3 mx-auto animate-pulse" />
                        <h3 className="text-lg font-mono font-bold text-red-600 mb-2">[ DATA NOT FOUND ]</h3>
                        <p className="text-xs font-mono text-red-500/80 uppercase">{searchResult.error}</p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-slate-900 text-green-400 p-4 font-mono text-[11px] leading-relaxed border-b-2 border-green-500/30">
                            <div className="text-slate-400">==== {dbConfig.name.toUpperCase()} TERMINAL ESTABLISHED ====</div>
                            <div className="flex gap-2"><span className="theme-text">&gt; NODE:</span> ALFA-01</div>
                            <div className="flex gap-2"><span className="theme-text">&gt; SOURCE:</span> /db/{dbConfig.admin_username}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm tracking-widest">
                                <Fingerprint className="w-5 h-5 theme-text" /> TARGET RESOLVED
                            </h3>
                            <button 
                              onClick={() => copyToClipboard(getCopyData(searchResult.data.data.records))}
                              className="text-xs font-mono font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors bg-white dark:bg-black px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800"
                            >
                                <Files className="w-4 h-4" /> COPY 
                            </button>
                        </div>
                        <div className="flex flex-col">
                          {searchResult.data.data.records.map((item: any, idx: number) => (
                             <div key={idx} className="p-6 flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 last:border-0 relative">
                                {searchResult.data.data.records.length > 1 && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 theme-bg"></div>
                                )}
                                
                                {[
                                  { label: 'MOBILE MSISDN', val: item.phone },
                                  { label: 'TARGET IDENTITY', val: item.full_name },
                                  { label: 'NATIONAL ID (CNIC)', val: item.cnic },
                                  { label: 'REGISTERED LOCATION', val: item.address }
                                ].map(row => (
                                  <div key={row.label} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-3 border-b border-dashed border-slate-200 dark:border-slate-800/50 last:border-0">
                                      <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">{row.label}</span>
                                      <span className="text-base font-semibold text-slate-900 dark:text-white sm:text-right font-mono">{row.val || 'NULL'}</span>
                                  </div>
                                ))}
                            </div>
                          ))}
                        </div>
                    </div>
                  )}
                </div>
              )}
          </section>
        )}

        {activeTab === 'history' && (
          <section className="flex flex-col gap-4 animate-in fade-in pt-2">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-md">
                  <h2 className="text-lg font-bold font-mono flex items-center"><Database className="w-5 h-5 theme-text mr-2" /> Local Cache</h2>
                  <button 
                    onClick={clearHistory} 
                    className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-mono font-semibold px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                      <Trash2 className="w-4 h-4" /> PURGE
                  </button>
              </div>
              <div className="flex flex-col gap-3">
                {searchHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-sm">NO LOGS FOUND</div>
                ) : (
                  searchHistory.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        setSearchInput(item.number);
                        setActiveTab('search');
                        setTimeout(() => {
                           document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        }, 100);
                      }}
                      className="bg-white dark:bg-black/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex justify-between items-center transition-all cursor-pointer group hover:shadow-lg"
                      style={{ borderColor: `${themeHex}30` }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 font-bold border border-transparent transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-800">
                                <Ghost className="w-5 h-5" style={{ color: isDark ? themeHex : undefined }} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white tracking-wider font-mono theme-text group-hover:brightness-110">{item.number}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.name}</p>
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1">
                            <HistoryIcon className="w-3 h-3" /> {item.time.split(',')[0]}
                        </div>
                    </div>
                  ))
                )}
              </div>
          </section>
        )}

        {(dbConfig.whatsapp_number || dbConfig.channel_link) && (
          <a 
            href={dbConfig.whatsapp_number ? `https://wa.me/${dbConfig.whatsapp_number.replace(/[^0-9]/g, '')}` : dbConfig.channel_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl hover:border-green-500/50 transition-colors group flex items-center justify-between relative overflow-hidden"
          >
              <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors pointer-events-none"></div>
              <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-black border border-green-500/50 rounded-full flex items-center justify-center text-green-400 text-2xl shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition-shadow">
                      <i className="bi bi-whatsapp"></i>
                  </div>
                  <div>
                      <h3 className="text-white font-mono font-bold text-lg group-hover:text-green-400 transition-colors">SECURE NETWORK</h3>
                      <p className="text-slate-400 font-mono text-[10px] md:text-xs">Establish secure link to HQ for unfiltered databases.</p>
                  </div>
              </div>
              <ExternalLink className="text-slate-500 group-hover:text-green-400 w-5 h-5 transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1 relative z-10" />
          </a>
        )}

      </main>
    </div>
  );
}
