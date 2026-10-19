import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Users, Eye, ArrowLeft, User as UserIcon, Monitor, Smartphone, Globe, Clock, Activity, Calendar, Zap, Wifi, Terminal } from 'lucide-react';

export default function HiddenAdminStats() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First verify this profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', username)
          .single();

        if (profileError || !profileData) {
          // If no profile is found, they are on a non-existent page
          setError("Profile not found");
          return;
        }

        setProfile(profileData);

        // Fetch analytics events for this profile
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('analytics_events')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (analyticsError) {
          console.error("Error fetching analytics:", analyticsError);
        } else if (analyticsData) {
          setStats(analyticsData);
        }

        return profileData;

      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    };

    let channel: any;
    if (username) {
      fetchData().then((profileData) => {
        if (profileData && profileData.id) {
          channel = supabase.channel('inspector-realtime')
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'analytics_events', filter: `profile_id=eq.${profileData.id}` },
              (payload) => {
                setStats((prev) => [payload.new, ...prev]);
              }
            )
            .subscribe();
        }
      });
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [username]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030014]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-cyan-500 animate-spin" />
          <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Fetching Diagnostics...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030014] text-white">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-zinc-400 mb-6">{error || "Could not load statistics."}</p>
        <button onClick={() => navigate(`/${username}`)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg">Return to Profile</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/${username}`)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-cyan-400 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Deep Inspector
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Targeting Account: @{profile.username}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-zinc-500 text-xs">Total Records</span>
              <span className="text-cyan-400 font-bold text-xl">{stats.length}</span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#0A0F1E] border border-cyan-500/20 rounded-xl p-6 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Recent Activity Payload</h3>
                    <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats.length}</div>
                <div className="text-xs text-zinc-500 mt-2">Visits logged</div>
            </div>
            <div className="bg-[#0A0F1E] border border-amber-500/20 rounded-xl p-6 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Predominant OS</h3>
                    <Smartphone className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400">
                  {stats.length > 0 ? (
                    (() => {
                      const osList = stats.map(s => s.metadata?.platform?.toLowerCase() || "");
                      const counts = osList.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as any);
                      const topOS = Object.keys(counts).length ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) : "N/A";
                      
                      if (topOS.includes('win')) return 'Windows';
                      if (topOS.includes('mac')) return 'macOS';
                      if (topOS.includes('linux')) return 'Linux';
                      if (topOS.includes('android')) return 'Android';
                      if (topOS.includes('iphone') || topOS.includes('ipad')) return 'iOS';
                      return "Other";
                    })()
                  ) : "N/A"}
                </div>
                <div className="text-xs text-zinc-500 mt-2">Target favored ecosystem</div>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#0A0F1E] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Timestamp</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Event Flow</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">IP / Origin</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Platform</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, i) => {
                  const meta = stat.metadata || {};
                  return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm text-zinc-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        {new Date(stat.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs rounded uppercase tracking-wider">
                        {stat.event_type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-400 font-mono">
                      {meta.ip_address ? <span className="text-emerald-400 font-bold">{meta.ip_address}</span> : "Unknown IP"}
                    </td>
                    <td className="p-4 text-sm text-zinc-400">
                      {meta.platform || "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedStat(stat)}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                )})}
                {stats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No diagnostic data found for this profile yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspector Modal */}
        {selectedStat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0A0F1E] border border-cyan-500/30 w-full max-w-lg rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Target Telemetry
                </h3>
                <button 
                  onClick={() => setSelectedStat(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400"
                >
                  Close
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 p-4 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1"><Wifi className="w-3 h-3"/> IP Address</span>
                    <span className="text-emerald-400 font-mono text-sm">{selectedStat.metadata?.ip_address || 'Unknown'}</span>
                  </div>
                  <div className="bg-black/30 p-4 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1"><Zap className="w-3 h-3"/> Battery Level</span>
                    <span className="text-cyan-400 font-mono text-sm">{selectedStat.metadata?.battery_level || 'Unknown'}</span>
                  </div>
                  <div className="bg-black/30 p-4 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1"><Zap className="w-3 h-3"/> Charging State</span>
                    <span className="text-amber-400 font-mono text-sm">{selectedStat.metadata?.is_charging || 'Unknown'}</span>
                  </div>
                  <div className="bg-black/30 p-4 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1"><Monitor className="w-3 h-3"/> Resolution</span>
                    <span className="text-indigo-400 font-mono text-sm">{selectedStat.metadata?.screen_resolution || 'Unknown'}</span>
                  </div>
                </div>

                <div className="bg-black/30 p-4 border border-white/5 rounded-xl flex flex-col gap-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3"/> User Agent Signature
                  </span>
                  <div className="text-zinc-400 text-xs font-mono break-all leading-relaxed bg-black/40 p-3 rounded">
                    {selectedStat.metadata?.browser_info || 'No user agent found'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
