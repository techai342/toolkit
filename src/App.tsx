import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PublicView from './pages/PublicView';
import MediaDownload from './pages/MediaDownload';
import ShortLinkRedirect from './pages/ShortLinkRedirect';
import SmartRedirect from './pages/SmartRedirect';
import { Activity } from 'lucide-react';

function HomeOrRedirect() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full text-[#F0F0F0]">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center relative before:absolute before:inset-0 before:border before:border-cyan-400 before:rotate-45 before:animate-spin">
              <Activity className="w-6 h-6 text-zinc-500 animate-pulse" />
           </div>
           <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] animate-pulse">Initializing Subsystems</div>
        </div>
      </div>
    );
  }

  // Redirect to their dashboard if logged in and profile loaded
  if (user && profile) {
    return <Navigate to={`/admin/${profile.username}`} replace />;
  }
  
  // Otherwise redirect to login
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeOrRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/:username" element={<AdminDashboard />} />
            <Route path="/:username" element={<PublicView />} />
            <Route path="/:username/link/:slug" element={<ShortLinkRedirect />} />
            <Route path="/:username/media/:toolId/:filename" element={<MediaDownload />} />
            <Route path="/:username/media/:toolId" element={<MediaDownload />} />
            <Route path="/:username/m/:slug" element={<SmartRedirect />} />
            <Route path="/:username/v/:slug" element={<SmartRedirect />} />
            <Route path="/:username/:slug" element={<SmartRedirect />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
