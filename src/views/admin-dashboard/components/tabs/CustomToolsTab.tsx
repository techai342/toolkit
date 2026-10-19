import React from "react";
import { Copy, Edit, ExternalLink, FileCode, Plus, Trash2, Bot, Sparkles, Video } from "lucide-react";
import { SimDatabase, SmsBomber, Chatbot, AiImageGenerator, TikTokDownloader } from "../../types";

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
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            Custom Tools Creator
          </h3>
          <p className="text-zinc-400 text-sm">
            Create standalone databases, chatbots, and customized tools.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => openSimDbModal()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs"
          >
            <Plus className="w-4 h-4" />
            Sim DB
          </button>
          <button
            onClick={() => openSmsBomberModal()}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs"
          >
            <Plus className="w-4 h-4" />
            SMS Bomber
          </button>
          <button
            onClick={() => openChatbotModal()}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs"
          >
            <Plus className="w-4 h-4" />
            Chatbot
          </button>
          <button
            onClick={() => openAiImageModal()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs"
          >
            <Sparkles className="w-4 h-4" />
            AI Image
          </button>
          <button
            onClick={() => openTiktokModal()}
            className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs"
          >
            <Video className="w-4 h-4" />
            TikTok
          </button>
        </div>
      </div>

      {(simDatabases.length === 0 && smsBombers.length === 0 && chatbots.length === 0 && imageGenerators.length === 0 && tiktokDownloaders.length === 0) ? (
        <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl border-dashed">
          <FileCode className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-500">
            No custom tools created yet
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {/* Sim DB Maps (same as before) */}
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
                    <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                      Sim DB
                    </span>
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
                      onClick={() => openSimDbModal(dbRow)}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteSimDb(dbRow.id, e)}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* SMS Bomber Maps (same as before) */}
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
                    <span className="text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md border border-red-400/20">
                      SMS Bomber
                    </span>
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
                      onClick={() => openSmsBomberModal(bomberRow)}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteSmsBomber(bomberRow.id, e)}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Chatbots Maps (same as before) */}
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
                    <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">
                      Chatbot
                    </span>
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
                      onClick={() => openChatbotModal(botRow)}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteChatbot(botRow.id, e)}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI Image Generators Maps (New) */}
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
                    <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md border border-indigo-400/20">
                      AI Image
                    </span>
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
                      onClick={() => openAiImageModal(gen)}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteAiImage(gen.id, e)}
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
                    <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md border border-sky-400/20">
                      TikTok
                    </span>
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
                      onClick={() => openTiktokModal(tool)}
                      className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl text-zinc-400 hover:text-blue-400 transition-all border border-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteTiktokDownloader(tool.id, e)}
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
    </div>
  );
};
