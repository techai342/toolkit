import React, { useState } from "react";
import { Copy, Edit, ExternalLink, FileCode, Plus, Trash2, Bot, Sparkles, Video, Lock } from "lucide-react";
import { SimDatabase, SmsBomber, Chatbot, AiImageGenerator, TikTokDownloader } from "../../types";
import { ToolLockModal, ToolLockBanner, useToolLock } from "../../../../components/ToolLockGate";

interface CustomToolsTabProps {
  simDatabases: SimDatabase[];
  smsBombers: SmsBomber[];
  chatbots: Chatbot[];
  imageGenerators: AiImageGenerator[];
  tiktokDownloaders: TikTokDownloader[];
  openSimDbModal: (dbRow?: SimDatabase) => void;
  deleteSimDb: (id: string, e: React.MouseEvent) => void;
  openSmsBomberModal: (bomberRow?: SmsBomber) => void;
  deleteSmsBomber: (id: string, e: React.MouseEvent) => void;
  openChatbotModal: (botRow?: Chatbot) => void;
  deleteChatbot: (id: string, e: React.MouseEvent) => void;
  openAiImageModal: (gen?: AiImageGenerator) => void;
  deleteAiImage: (id: string, e: React.MouseEvent) => void;
  openTiktokModal: (tool?: TikTokDownloader) => void;
  deleteTiktokDownloader: (id: string, e: React.MouseEvent) => void;
  handleCopyLink: (text: string) => void;
}

export const CustomToolsTab: React.FC<CustomToolsTabProps> = ({
  simDatabases,
  smsBombers,
  chatbots,
  imageGenerators,
  tiktokDownloaders,
  openSimDbModal,
  deleteSimDb,
  openSmsBomberModal,
  deleteSmsBomber,
  openChatbotModal,
  deleteChatbot,
  openAiImageModal,
  deleteAiImage,
  openTiktokModal,
  deleteTiktokDownloader,
  handleCopyLink,
}) => {
  const { isLocked, unlock, relock } = useToolLock();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeToolName, setActiveToolName] = useState("Custom Tools");

  const handleAction = (toolName: string, callback: () => void) => {
    if (isLocked) {
      setActiveToolName(toolName);
      setModalOpen(true);
    } else {
      callback();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Lock Status Banner */}
      <ToolLockBanner
        toolName="Custom Tools Creator"
        isLocked={isLocked}
        onUnlockClick={() => {
          setActiveToolName("Custom Tools Creator");
          setModalOpen(true);
        }}
        onRelockClick={relock}
      />

      {/* Main Creator Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">
              Custom Tools Creator
            </h3>
            {isLocked ? (
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-red-400" /> LOCKED
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                UNLOCKED (OWNER)
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm">
            {isLocked
              ? "All custom tool creation is locked by Owner (Saqib 242). Ordinary users cannot use or create tools."
              : "Create standalone databases, chatbots, and customized tools."}
          </p>
        </div>

        {/* 5 Creator Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-wrap">
          {/* 1. Sim DB */}
          <button
            onClick={() => handleAction("Sim Database", () => openSimDbModal())}
            className={`px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-xs ${
              isLocked
                ? "bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-950/40"
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-4 h-4" />}
            Sim DB
            {isLocked && (
              <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold">
                LOCKED
              </span>
            )}
          </button>

          {/* 2. SMS Bomber */}
          <button
            onClick={() => handleAction("SMS Bomber", () => openSmsBomberModal())}
            className={`px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-xs ${
              isLocked
                ? "bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 shadow-lg shadow-red-950/40"
                : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-4 h-4" />}
            SMS Bomber
            {isLocked && (
              <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold">
                LOCKED
              </span>
            )}
          </button>

          {/* 3. Chatbot */}
          <button
            onClick={() => handleAction("Chatbot", () => openChatbotModal())}
            className={`px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-xs ${
              isLocked
                ? "bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-950/40"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-4 h-4" />}
            Chatbot
            {isLocked && (
              <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold">
                LOCKED
              </span>
            )}
          </button>

          {/* 4. AI Image */}
          <button
            onClick={() => handleAction("AI Image Generator", () => openAiImageModal())}
            className={`px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-xs ${
              isLocked
                ? "bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-950/40"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Sparkles className="w-4 h-4" />}
            AI Image
            {isLocked && (
              <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold">
                LOCKED
              </span>
            )}
          </button>

          {/* 5. TikTok */}
          <button
            onClick={() => handleAction("TikTok Downloader", () => openTiktokModal())}
            className={`px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-xs ${
              isLocked
                ? "bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-500/30 shadow-lg shadow-sky-950/40"
                : "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20"
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Video className="w-4 h-4" />}
            TikTok
            {isLocked && (
              <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold">
                LOCKED
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {(simDatabases.length === 0 && smsBombers.length === 0 && chatbots.length === 0 && imageGenerators.length === 0 && tiktokDownloaders.length === 0) ? (
        <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl border-dashed">
          <FileCode className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-500">
            No custom tools created yet
          </h3>
          {isLocked && (
            <p className="text-xs text-amber-400/80 mt-2 font-mono">
              🔒 Custom tools creation is currently locked by Application Owner (Saqib 242)
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {/* Sim DB Maps */}
          {simDatabases.map((dbRow) => (
            <div
              key={dbRow.id}
              className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-3xl p-5 backdrop-blur-xl transition-all hover:translate-y-[-4px]"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-bold text-lg">
                      {dbRow.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                        Sim DB
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">
                      Admin Route
                    </p>
                    <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
                      <code className="text-[11px] font-mono text-zinc-400">
                        /db/{dbRow.admin_username}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                  <button
                    onClick={() => handleCopyLink(`${window.location.origin}/db/${dbRow.admin_username}`)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`/db/${dbRow.admin_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-zinc-400 hover:text-cyan-400 transition-all border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleAction("Sim DB (Edit)", () => openSimDbModal(dbRow))}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAction("Sim DB (Delete)", () => deleteSimDb(dbRow.id, e))}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* SMS Bomber Maps */}
          {smsBombers.map((bomberRow) => (
            <div
              key={bomberRow.id}
              className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-3xl p-5 backdrop-blur-xl transition-all hover:translate-y-[-4px]"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-bold text-lg">
                      {bomberRow.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md border border-red-400/20">
                        SMS Bomber
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">
                      Admin Route
                    </p>
                    <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
                      <code className="text-[11px] font-mono text-zinc-400">
                        /bomber/{bomberRow.admin_username}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                  <button
                    onClick={() => handleCopyLink(`${window.location.origin}/bomber/${bomberRow.admin_username}`)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`/bomber/${bomberRow.admin_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleAction("SMS Bomber (Edit)", () => openSmsBomberModal(bomberRow))}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAction("SMS Bomber (Delete)", () => deleteSmsBomber(bomberRow.id, e))}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Chatbots Maps */}
          {chatbots.map((botRow) => (
            <div
              key={botRow.id}
              className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-3xl p-5 backdrop-blur-xl transition-all hover:translate-y-[-4px]"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      <Bot size={18} className="text-purple-400" />
                      {botRow.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">
                        Chatbot
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">
                      Admin Route
                    </p>
                    <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
                      <code className="text-[11px] font-mono text-zinc-400">
                        /cb/{botRow.admin_username}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                  <button
                    onClick={() => handleCopyLink(`${window.location.origin}/cb/${botRow.admin_username}`)}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`/cb/${botRow.admin_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white/5 hover:bg-purple-500/20 rounded-xl text-zinc-400 hover:text-purple-400 transition-all border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleAction("Chatbot (Edit)", () => openChatbotModal(botRow))}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAction("Chatbot (Delete)", () => deleteChatbot(botRow.id, e))}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI Image Generators Maps */}
          {imageGenerators.map((gen) => (
            <div
              key={gen.id}
              className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-3xl p-5 backdrop-blur-xl transition-all hover:translate-y-[-4px]"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-400" />
                      {gen.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md border border-indigo-400/20">
                        AI Image
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">
                      Admin Route
                    </p>
                    <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
                      <code className="text-[11px] font-mono text-zinc-400">
                        /image/{gen.admin_username}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                  <button
                    onClick={() => handleCopyLink(`${window.location.origin}/image/${gen.admin_username}`)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`/image/${gen.admin_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white/5 hover:bg-indigo-500/20 rounded-xl text-zinc-400 hover:text-indigo-400 transition-all border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleAction("AI Image (Edit)", () => openAiImageModal(gen))}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAction("AI Image (Delete)", () => deleteAiImage(gen.id, e))}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* TikTok Downloader Maps */}
          {tiktokDownloaders.map((tool) => (
            <div
              key={tool.id}
              className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-3xl p-5 backdrop-blur-xl transition-all hover:translate-y-[-4px]"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      <Video size={18} className="text-sky-400" />
                      {tool.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md border border-sky-400/20">
                        TikTok
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">
                      Admin Route
                    </p>
                    <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
                      <code className="text-[11px] font-mono text-zinc-400">
                        /tiktok/{tool.admin_username}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                  <button
                    onClick={() => handleCopyLink(`${window.location.origin}/tiktok/${tool.admin_username}`)}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`/tiktok/${tool.admin_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white/5 hover:bg-sky-500/20 rounded-xl text-zinc-400 hover:text-sky-400 transition-all border border-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleAction("TikTok Downloader (Edit)", () => openTiktokModal(tool))}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAction("TikTok Downloader (Delete)", () => deleteTiktokDownloader(tool.id, e))}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Tool Lock Modal */}
      <ToolLockModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        toolName={activeToolName}
      />
    </div>
  );
};
