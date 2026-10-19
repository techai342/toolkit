const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'src', 'views', 'admin-dashboard', 'components', 'ToolkitSetupWizard.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const markerStart = '              {/* STEP 4: THEME, MARKETING POPUP & SECURITY */}';
const markerEnd = '              {/* Wizard Bottom Navigation Buttons */}';

const idxStart = content.indexOf(markerStart);
const idxEnd = content.indexOf(markerEnd);

if (idxStart === -1 || idxEnd === -1) {
  console.error('Markers not found in ToolkitSetupWizard.tsx');
  process.exit(1);
}

const newStep4 = `              {/* STEP 4: FULL CUSTOMIZATION (THEMES, NEON GLOW & AMBIANCE) */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="border-b border-white/5 pb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-2">
                      <Sparkles size={14} className="text-purple-400" />
                      <span>Full Visual Customization</span>
                    </div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Theme, Glow Effects & Appearance</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Customize dynamic neon border glow themes, typography fonts, username color accents, background canvas, and marketing popup.
                    </p>
                  </div>

                  {/* Typography Font Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1 flex items-center justify-between">
                      <span>Typography Font Style</span>
                      <span className="text-[10px] text-purple-400 lowercase font-mono">var(--font-{settingsForm.theme_font_family || 'sans'})</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "sans", label: "Sans (Modern)", font: "font-sans", sample: "Clean Inter" },
                        {
                          id: "serif",
                          label: "Serif (Classic)",
                          font: "font-serif",
                          sample: "Playfair Display",
                        },
                        { id: "mono", label: "Mono (Tech)", font: "font-mono", sample: "JetBrains Terminal" },
                        {
                          id: "display",
                          label: "Display (Bold)",
                          font: "font-black tracking-wide",
                          sample: "Space Grotesk",
                        },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              theme_font_family: f.id,
                            })
                          }
                          className={\`p-3 rounded-xl border text-center transition-all \${
                            settingsForm.theme_font_family === f.id
                              ? "bg-purple-500/25 border-purple-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-[1.02]"
                              : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                          }\`}
                        >
                          <div className={\`text-base mb-1 \${f.font}\`}>Aa</div>
                          <div className="text-[11px] font-semibold truncate">{f.label}</div>
                          <div className="text-[9px] text-zinc-500 truncate">{f.sample}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Neon Conic Glow Theme Combo Presets */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Neon Border Glow Theme</span>
                      </label>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">
                        {settingsForm.theme_color_combo || 'rgb'} active
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { id: "rgb", label: "RGB Chroma", preview: "bg-[conic-gradient(from_0deg,#ef4444,#22c55e,#3b82f6,#ef4444)]" },
                        { id: "purple_cyan", label: "Cyberpunk", preview: "bg-[conic-gradient(from_0deg,#a855f7,#06b6d4,#a855f7)]" },
                        { id: "fire", label: "Inferno Fire", preview: "bg-[conic-gradient(from_0deg,#f97316,#eab308,#f97316)]" },
                        { id: "ocean", label: "Deep Ocean", preview: "bg-[conic-gradient(from_0deg,#0ea5e9,#3b82f6,#0ea5e9)]" },
                        { id: "toxic", label: "Toxic Neon", preview: "bg-[conic-gradient(from_0deg,#84cc16,#bef264,#84cc16)]" },
                        { id: "royal", label: "Royal Gold", preview: "bg-[conic-gradient(from_0deg,#eab308,#a855f7,#eab308)]" },
                        { id: "sakura", label: "Sakura Pink", preview: "bg-[conic-gradient(from_0deg,#f472b6,#fdf2f8,#f472b6)]" },
                        { id: "sunset", label: "Sunset", preview: "bg-[conic-gradient(from_0deg,#ef4444,#f97316,#a855f7,#ef4444)]" },
                        { id: "none", label: "Clean / Off", preview: "bg-zinc-700" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              theme_color_combo: c.id,
                            })
                          }
                          className={\`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center \${
                            settingsForm.theme_color_combo === c.id
                              ? "border-purple-400 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-[1.03]"
                              : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/30 hover:text-white"
                          }\`}
                        >
                          <div className="w-7 h-7 rounded-full p-[2px] overflow-hidden relative shadow-sm">
                            <div className={\`w-full h-full rounded-full \${c.preview} \${c.id !== 'none' ? 'animate-spin' : ''}\`}></div>
                          </div>
                          <span className="text-[10px] font-semibold truncate w-full">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Glow Targets Selection Toggles */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Active Glow Placements
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Choose which components on your public toolkit will display the rotating neon glow
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {[
                        { key: "theme_profile_border", label: "Profile Avatar Glow", icon: "👤" },
                        { key: "theme_buttons_border", label: "Tools Cards Glow", icon: "⚡" },
                        { key: "theme_social_border", label: "Social Buttons Glow", icon: "🌐" },
                        { key: "theme_search_border", label: "Search Bar Glow", icon: "🔍" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              [item.key]: !settingsForm[item.key],
                            })
                          }
                          className={\`p-3 rounded-xl border flex items-center justify-between transition-all \${
                            settingsForm[item.key]
                              ? "bg-purple-600/20 border-purple-500/60 text-white shadow-sm"
                              : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                          }\`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.icon}</span>
                            <span className="text-xs font-medium">{item.label}</span>
                          </div>
                          <div className={\`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold \${
                            settingsForm[item.key]
                              ? "bg-purple-500 border-purple-400 text-white"
                              : "border-zinc-600 text-transparent"
                          }\`}>
                            ✓
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Username Color Accent Swatches */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                        Username Color Accent
                      </label>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {settingsForm.theme_username_color || "#FFFFFF"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { label: "White", color: "#FFFFFF" },
                        { label: "Purple", color: "#A855F7" },
                        { label: "Cyan", color: "#00F2FE" },
                        { label: "Emerald", color: "#10B981" },
                        { label: "Amber", color: "#F59E0B" },
                        { label: "Pink", color: "#EC4899" },
                        { label: "Fire Red", color: "#EF4444" },
                        { label: "Sky Blue", color: "#38BDF8" },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              theme_username_color: c.color,
                            })
                          }
                          className={\`w-8 h-8 rounded-full border-2 transition-transform \${
                            (settingsForm.theme_username_color || "#FFFFFF").toLowerCase() === c.color.toLowerCase()
                              ? "scale-125 border-white ring-2 ring-purple-500 shadow-md"
                              : "border-transparent opacity-80 hover:opacity-100 hover:scale-110"
                          }\`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}

                      <div className="flex items-center gap-1.5 ml-auto bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
                        <span className="text-zinc-500 font-mono">#</span>
                        <input
                          type="text"
                          value={(settingsForm.theme_username_color || "#FFFFFF").replace("#", "")}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              theme_username_color: \`#\${e.target.value.replace(/[^0-9a-fA-F]/g, "")}\`,
                            })
                          }
                          maxLength={6}
                          className="w-16 bg-transparent text-white font-mono text-xs outline-none uppercase"
                          placeholder="FFFFFF"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background Canvas Ambiance & Wallpaper */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1">
                      Canvas Background Ambiance
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {[
                        { id: "#0A0F1E", label: "Obsidian", desc: "Classic Deep Blue" },
                        { id: "#030014", label: "Midnight Void", desc: "Ultra Dark Space" },
                        { id: "#130924", label: "Cyber Violet", desc: "Electric Purple" },
                        { id: "#0B0E14", label: "Charcoal Noir", desc: "Minimalist Black" },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              bg_color: b.id,
                            })
                          }
                          className={\`p-2.5 rounded-xl border text-left transition-all \${
                            (settingsForm.bg_color || "#0A0F1E").toLowerCase() === b.id.toLowerCase()
                              ? "border-purple-400 bg-white/10 text-white font-bold"
                              : "border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white"
                          }\`}
                        >
                          <div className="w-4 h-4 rounded-full border border-white/20 mb-1" style={{ backgroundColor: b.id }}></div>
                          <div className="text-xs truncate">{b.label}</div>
                          <div className="text-[9px] text-zinc-500 truncate">{b.desc}</div>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/20 shrink-0 flex items-center justify-center">
                        {settingsForm.bg_image_url ? (
                          <img
                            src={settingsForm.bg_image_url}
                            alt="Wallpaper"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Palette className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {wallpaperUploading ? "Uploading..." : "Upload Custom Wallpaper"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleWallpaperFile}
                            disabled={wallpaperUploading}
                          />
                        </label>
                        {settingsForm.bg_image_url && (
                          <button
                            type="button"
                            onClick={() =>
                              setSettingsForm({
                                ...settingsForm,
                                bg_image_url: "",
                              })
                            }
                            className="block text-[11px] text-red-400 hover:underline"
                          >
                            Remove wallpaper
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visitor Marketing Popup Toggle */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            Visitor Marketing Announcement Popup
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Show special alert/notice when visitors open your toolkit
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.popup_enabled}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              popup_enabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    {settingsForm.popup_enabled && (
                      <div className="space-y-2.5 pt-2 border-t border-white/5 animate-in fade-in duration-200">
                        <input
                          type="text"
                          value={settingsForm.popup_title || ""}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              popup_title: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-pink-500"
                          placeholder="Popup Headline (e.g. 🔥 Join our Official Telegram for VIP updates!)"
                        />
                        <textarea
                          value={settingsForm.popup_description || ""}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              popup_description: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-pink-500 resize-none"
                          placeholder="Announcement description or promotional details..."
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={settingsForm.popup_button_text || ""}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                popup_button_text: e.target.value,
                              })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-pink-500"
                            placeholder="Button Text (e.g. Join Now)"
                          />
                          <input
                            type="url"
                            value={settingsForm.popup_link || ""}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                popup_link: e.target.value,
                              })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-pink-500"
                            placeholder="Button Target URL (e.g. https://t.me/...)"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Checklist Review */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-purple-500/20 space-y-2.5">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Setup Summary Checklist</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">@{settingsForm.username || "unset"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        {settingsForm.social_whatsapp ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-zinc-600 inline-block shrink-0"></span>
                        )}
                        <span className="truncate">WhatsApp Connected</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        {settingsForm.social_tiktok ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-zinc-600 inline-block shrink-0"></span>
                        )}
                        <span className="truncate">TikTok Linked</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">Glow: {settingsForm.theme_color_combo || 'rgb'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
\n`;

content = content.substring(0, idxStart) + newStep4 + content.substring(idxEnd);
fs.writeFileSync(targetPath, content, 'utf8');
console.log('ToolkitSetupWizard.tsx Step 4 updated successfully!');
