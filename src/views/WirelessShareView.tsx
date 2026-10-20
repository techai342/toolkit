import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Wifi, 
  Share2, 
  QrCode, 
  Copy, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileCode, 
  FileArchive, 
  FileText, 
  FileImage, 
  File as FileIcon, 
  Download, 
  Smartphone, 
  Laptop, 
  Send, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Zap,
  MessageSquareCode
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  WebRTCFileTransferEngine, 
  PeerDevice, 
  FileTransferMeta, 
  TransferProgress, 
  TextSnippet 
} from '../lib/webrtc-file-transfer';

export default function WirelessShareView() {
  const { roomId: urlRoomParam } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();

  // Active room ID (from URL param, query param, or generated)
  const [roomId, setRoomId] = useState<string>(() => {
    if (urlRoomParam) return urlRoomParam;
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const r = sp.get('room');
      if (r) return r;
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
  });

  const [joinInput, setJoinInput] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<'files' | 'clipboard'>('files');

  // WebRTC engine states
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('connecting');
  const [myDevice, setMyDevice] = useState<PeerDevice | null>(null);
  const [remotePeer, setRemotePeer] = useState<PeerDevice | null>(null);
  
  // File transfers
  const [transfers, setTransfers] = useState<TransferProgress[]>([]);
  const [pendingOffer, setPendingOffer] = useState<{
    meta: FileTransferMeta;
    accept: () => void;
    reject: () => void;
  } | null>(null);

  // Text snippets / Clipboard
  const [snippets, setSnippets] = useState<TextSnippet[]>([]);
  const [snippetInput, setSnippetInput] = useState<string>('');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const engineRef = useRef<WebRTCFileTransferEngine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate QR Code for sharing link
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/share?room=${roomId}`;

    QRCode.toDataURL(shareUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#f8fafc',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [roomId]);

  // Initialize WebRTC engine on room change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    const engine = new WebRTCFileTransferEngine(roomId, {
      onConnectionStatus: (status) => {
        setConnectionStatus(status);
        if (status === 'connected') {
          setRemotePeer(engine.getRemotePeer());
        } else if (status === 'disconnected') {
          setRemotePeer(null);
        }
      },
      onPeerJoin: (peer) => {
        setRemotePeer(peer);
      },
      onPeerLeave: () => {
        setRemotePeer(null);
      },
      onFileOffer: (meta, accept, reject) => {
        setPendingOffer({
          meta,
          accept: () => {
            accept();
            setPendingOffer(null);
          },
          reject: () => {
            reject();
            setPendingOffer(null);
          },
        });
      },
      onTransferProgress: (progress) => {
        setTransfers((prev) => {
          const idx = prev.findIndex((t) => t.id === progress.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...progress };
            return next;
          }
          return [progress, ...prev];
        });
      },
      onTransferComplete: (progress) => {
        setTransfers((prev) => {
          const idx = prev.findIndex((t) => t.id === progress.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...progress };
            return next;
          }
          return [progress, ...prev];
        });
      },
      onTextSnippet: (snippet) => {
        setSnippets((prev) => [snippet, ...prev]);
      },
    });

    engineRef.current = engine;
    setMyDevice(engine.device);
    engine.start().catch((err) => console.error('Engine start error:', err));

    return () => {
      engine.destroy();
    };
  }, [roomId]);

  const handleCreateNewRoom = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomId(newCode);
    setTransfers([]);
    setSnippets([]);
    setPendingOffer(null);
    navigate(`/share?room=${newCode}`, { replace: true });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinInput.trim().replace(/\D/g, '');
    if (clean.length >= 4) {
      setRoomId(clean);
      setJoinInput('');
      setTransfers([]);
      setSnippets([]);
      setPendingOffer(null);
      navigate(`/share?room=${clean}`, { replace: true });
    }
  };

  const copyShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/share?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyPin = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0 || !engineRef.current) return;
    for (let i = 0; i < files.length; i++) {
      engineRef.current.queueFile(files[i]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetInput.trim() || !engineRef.current) return;
    const sent = engineRef.current.sendTextSnippet(snippetInput.trim());
    if (sent) {
      setSnippets((prev) => [sent, ...prev]);
      setSnippetInput('');
    }
  };

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Format bytes to human readable string
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Get icon by file extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <FileArchive className="w-7 h-7 text-amber-400" />;
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
      return <FileImage className="w-7 h-7 text-emerald-400" />;
    }
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'cpp', 'java', 'sql', 'php', 'sh', 'rs'].includes(ext)) {
      return <FileCode className="w-7 h-7 text-cyan-400" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) {
      return <FileText className="w-7 h-7 text-blue-400" />;
    }
    return <FileIcon className="w-7 h-7 text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Wifi className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  WebShare P2P Drop
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Local LAN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Wire-free high-speed transfer between PC, Laptop & Mobile
              </p>
            </div>
          </div>

          {/* Quick Room PIN / Share controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
              title="Show QR Code for Mobile"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>QR Code</span>
            </button>

            <button
              onClick={copyShareLink}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
              title="Copy shareable link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
              <span>{copiedLink ? 'Copied!' : 'Share Link'}</span>
            </button>

            <button
              onClick={handleCreateNewRoom}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              title="Generate new room code"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Device Connection & Room Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Room PIN Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>ROOM PIN</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> End-to-End P2P
              </span>
            </div>

            <div className="my-2 flex items-center justify-between">
              <span className="text-3xl font-mono font-bold tracking-widest text-cyan-400">
                {roomId}
              </span>
              <button
                onClick={copyPin}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Copy Room PIN"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Join another room input */}
            <form onSubmit={handleJoinRoom} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                placeholder="Enter 6-digit PIN"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                maxLength={6}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
              >
                Join
              </button>
            </form>
          </div>

          {/* Local Device Info */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>THIS DEVICE</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Online
              </span>
            </div>
            
            <div className="my-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                {myDevice?.deviceType === 'mobile' ? (
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Laptop className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <div className="truncate">
                <h4 className="text-sm font-semibold text-white truncate">
                  {myDevice?.deviceName || 'Local Device'}
                </h4>
                <p className="text-xs text-slate-500 truncate font-mono">
                  {myDevice?.peerId}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Ready to send & receive files on local Wi-Fi.
            </p>
          </div>

          {/* Remote Peer Connection Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>CONNECTED PEER</span>
              <span className={`inline-flex items-center gap-1.5 text-xs ${
                connectionStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`} />
                {connectionStatus === 'connected' ? 'P2P Ready' : 'Waiting...'}
              </span>
            </div>

            <div className="my-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                {remotePeer?.deviceType === 'mobile' ? (
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                ) : remotePeer ? (
                  <Laptop className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Wifi className="w-5 h-5 text-slate-600 animate-pulse" />
                )}
              </div>
              <div className="truncate">
                <h4 className="text-sm font-semibold text-white truncate">
                  {remotePeer ? remotePeer.deviceName : 'Waiting for Peer...'}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  {remotePeer ? 'Direct LAN WebRTC Channel Open' : 'Scan QR with phone or open link on 2nd PC'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Transfer Speed:</span>
              <span className="text-cyan-400 font-mono font-medium">Full Wi-Fi LAN Speed</span>
            </div>
          </div>
        </div>

        {/* Incoming Transfer Request Notification Modal / Alert */}
        {pendingOffer && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900/90 border border-cyan-500/40 shadow-2xl shadow-cyan-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                {getFileIcon(pendingOffer.meta.name)}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500 text-slate-950 uppercase">
                    Incoming File
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    from {pendingOffer.meta.senderName}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white truncate mt-0.5">
                  {pendingOffer.meta.name}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Size: {formatBytes(pendingOffer.meta.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={pendingOffer.reject}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700"
              >
                Decline
              </button>
              <button
                onClick={pendingOffer.accept}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Accept & Download
              </button>
            </div>
          </div>
        )}

        {/* Tab Selector: File Sharing vs Quick Clipboard */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'files'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            File Transfer (Zip, Code, Images, Docs)
          </button>
          
          <button
            onClick={() => setActiveTab('clipboard')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
              activeTab === 'clipboard'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            Code & Text Clipboard
          </button>
        </div>

        {/* TAB 1: FILE TRANSFER */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* Drag & Drop File Upload Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesSelected(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center group ${
                connectionStatus === 'connected'
                  ? 'border-slate-700 hover:border-cyan-500 bg-slate-900/40 hover:bg-slate-900/70'
                  : 'border-slate-800 bg-slate-950/40 opacity-75'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />

              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-300">
                <ArrowUpRight className="w-8 h-8" />
              </div>

              <h3 className="mt-4 text-base sm:text-lg font-bold text-white">
                {connectionStatus === 'connected'
                  ? 'Drop any Zip, Image, Code or Document file here'
                  : 'Connect another device to start sharing files'}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                {connectionStatus === 'connected'
                  ? 'Direct P2P transfer over Wi-Fi. No file size limits, no cable required.'
                  : 'Scan the QR code on your mobile or enter the 6-digit PIN on your 2nd laptop.'}
              </p>

              {/* Supported formats tags */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
                  <FileArchive className="w-3.5 h-3.5" /> ZIP / RAR / 7Z
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-emerald-300 font-medium flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5" /> PNG / JPG / WebP
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-cyan-300 font-medium flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" /> JS / TS / PY / Code
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-blue-300 font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> PDF / DOCX / TXT
                </span>
              </div>
            </div>

            {/* Active & Completed Transfers List */}
            {transfers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>TRANSFERS ({transfers.length})</span>
                  <button
                    onClick={() => setTransfers([])}
                    className="text-slate-500 hover:text-slate-300 transition"
                  >
                    Clear History
                  </button>
                </div>

                <div className="space-y-2">
                  {transfers.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                            {getFileIcon(item.fileName)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">
                              {item.fileName}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                              <span>{formatBytes(item.fileSize)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {item.direction === 'sending' ? (
                                  <>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                                    Sending
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                                    Receiving
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status / Action */}
                        <div className="flex items-center gap-3 shrink-0">
                          {item.status === 'completed' && (
                            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                              <CheckCircle2 className="w-4 h-4" />
                              Complete
                            </span>
                          )}

                          {item.status === 'cancelled' && (
                            <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                              <XCircle className="w-4 h-4" />
                              Cancelled
                            </span>
                          )}

                          {item.status === 'transferring' && (
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-cyan-400">
                                {item.progressPercent}%
                              </span>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {formatBytes(item.speedBytesPerSec)}/s
                              </div>
                            </div>
                          )}

                          {/* Direct Download Button for received file */}
                          {item.direction === 'receiving' && item.blobUrl && (
                            <a
                              href={item.blobUrl}
                              download={item.fileName}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Save
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {item.status === 'transferring' && (
                        <div className="w-full">
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-150"
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
                            <span>{formatBytes(item.transferredBytes)} transferred</span>
                            <span>{item.etaSeconds > 0 ? `ETA: ${item.etaSeconds}s` : 'Finalizing...'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CODE & TEXT CLIPBOARD */}
        {activeTab === 'clipboard' && (
          <div className="space-y-6">
            {/* Input textarea */}
            <form onSubmit={handleSendSnippet} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>SEND CODE / TEXT CLIPBOARD</span>
                <span>Instant P2P Sync</span>
              </div>
              <textarea
                rows={4}
                value={snippetInput}
                onChange={(e) => setSnippetInput(e.target.value)}
                placeholder="Paste code snippet, URL, password or message to send to connected laptop or phone..."
                className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-500">
                  {snippetInput.length} characters
                </span>
                <button
                  type="submit"
                  disabled={!snippetInput.trim() || connectionStatus !== 'connected'}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send to {remotePeer ? remotePeer.deviceName : 'Peer'}
                </button>
              </div>
            </form>

            {/* Snippets Feed */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400">
                CLIPBOARD HISTORY ({snippets.length})
              </div>

              {snippets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  No snippets shared yet. Paste code or text above to send it instantly.
                </div>
              ) : (
                snippets.map((snip) => (
                  <div
                    key={snip.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          snip.isSelf ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {snip.isSelf ? 'You Sent' : `From ${snip.senderName}`}
                        </span>
                        <span className="font-mono text-slate-500">
                          {new Date(snip.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        onClick={() => copySnippet(snip.id, snip.text)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                      >
                        {copiedSnippetId === snip.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap select-all border border-slate-800/80">
                      {snip.text}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* QR Code Modal for Phone Scanner */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Connect Mobile Phone
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg font-bold text-white">
              Scan with Phone Camera
            </h3>
            <p className="text-xs text-slate-400">
              Open your phone's camera or QR scanner to join this room instantly without typing.
            </p>

            {/* QR Code Image */}
            <div className="p-4 bg-white rounded-2xl shadow-inner mx-auto max-w-[240px]">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Room QR Code" className="w-full h-auto" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-800">
                  Generating QR...
                </div>
              )}
            </div>

            {/* PIN display */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Or enter PIN:</span>
              <span className="text-lg font-mono font-bold text-cyan-400 tracking-wider">
                {roomId}
              </span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
