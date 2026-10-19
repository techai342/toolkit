const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'views', 'PublicView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Featured Action Banners
const marker1 = '             </div>\n         </div>\n      </div>\n\n      {/* Main Tools Container */}';
const replacement1 = `             </div>

             {/* Featured WhatsApp & TikTok Action Banners */}
             {(pageProfile.social_whatsapp || pageProfile.social_tiktok) && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pl-1 md:pl-2">
                 {pageProfile.social_whatsapp && (() => {
                   const waNum = pageProfile.social_whatsapp.replace(/[^0-9]/g, '');
                   const waGreeting = pageProfile.whatsapp_greeting || 'Assalam-o-Alaikum! I visited your verified toolkit and would like more information.';
                   const waUrl = \`https://wa.me/\${waNum}?text=\${encodeURIComponent(waGreeting)}\`;
                   return (
                     <a
                       href={waUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/30 via-green-600/20 to-black/40 border border-emerald-500/40 hover:border-emerald-400 backdrop-blur-md transition-all shadow-[0_0_25px_rgba(37,211,102,0.15)] flex items-center justify-between group hover:scale-[1.01]"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-[#25D366] text-black flex items-center justify-center shadow-lg shadow-[#25D366]/20 shrink-0 group-hover:scale-105 transition-transform">
                           <SiWhatsapp size={20} />
                         </div>
                         <div className="text-left">
                           <div className="text-xs font-bold text-white flex items-center gap-1.5">
                             <span>Chat on WhatsApp</span>
                             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                           </div>
                           <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
                             {pageProfile.whatsapp_greeting || 'Fast response direct message'}
                           </p>
                         </div>
                       </div>
                       <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
                     </a>
                   );
                 })()}

                 {pageProfile.social_tiktok && (
                   <a
                     href={pageProfile.social_tiktok}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-600/20 via-black/40 to-sky-600/20 border border-pink-500/30 hover:border-pink-400 backdrop-blur-md transition-all shadow-[0_0_25px_rgba(236,72,153,0.15)] flex items-center justify-between group hover:scale-[1.01]"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-black text-white border border-white/20 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                         <SiTiktok size={18} />
                       </div>
                       <div className="text-left">
                         <div className="text-xs font-bold text-white flex items-center gap-1.5">
                           <span>Follow on TikTok</span>
                           <span className="text-[9px] uppercase tracking-wider bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded-md font-mono">Official</span>
                         </div>
                         <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
                           Exclusive videos & content updates
                         </p>
                       </div>
                     </div>
                     <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform shrink-0" />
                   </a>
                 )}
               </div>
             )}
         </div>
      </div>

      {/* Main Tools Container */}`;

if (!content.includes(marker1)) {
  console.error('Marker 1 not found!');
  process.exit(1);
}
content = content.replace(marker1, replacement1);

// 2. Categories Filter & View Mode Switcher
const markerB1 = '          {/* Categories Filter */}';
const markerB2 = '          {/* Tools Grid */}';

const idxB1 = content.indexOf(markerB1);
const idxB2 = content.indexOf(markerB2);

if (idxB1 === -1 || idxB2 === -1) {
  console.error('Marker B not found!');
  process.exit(1);
}

const replacementB = `          {/* Categories Filter & Layout Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start w-full sm:w-auto">
                 {displayCategories.map(cat => (
                     <button 
                         key={cat}
                         onClick={() => setSelectedCategory(cat)}
                         className={\`px-5 py-2 rounded-xl border text-xs font-bold transition-all backdrop-blur-md \${
                             selectedCategory === cat 
                             ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-[1.02]'
                             : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:border-white/30 hover:bg-white/[0.08]'
                         }\`}
                     >
                         {cat}
                     </button>
                 ))}
              </div>

              {/* View Mode Switcher (Grid vs List) */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 shrink-0 self-end sm:self-auto">
                 <button
                    type="button"
                    onClick={() => setViewLayout('grid')}
                    className={\`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all \${
                       viewLayout === 'grid'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                    }\`}
                    title="Grid View"
                 >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden xs:inline">Grid</span>
                 </button>
                 <button
                    type="button"
                    onClick={() => setViewLayout('list')}
                    className={\`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all \${
                       viewLayout === 'list'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                    }\`}
                    title="List View"
                 >
                    <List className="w-4 h-4" />
                    <span className="hidden xs:inline">List</span>
                 </button>
              </div>
          </div>\n\n`;

content = content.substring(0, idxB1) + replacementB + content.substring(idxB2);

// 3. Grid vs List View rendering
const markerC1 = '          {/* Tools Grid */}';
const markerC2 = '       {/* Password Modal */}';

const idxC1 = content.indexOf(markerC1);
const idxC2 = content.indexOf(markerC2);

if (idxC1 === -1 || idxC2 === -1) {
  console.error('Marker C not found!');
  process.exit(1);
}

const replacementC = `          {/* Tools Rendering (Grid or List View) */}
          {viewLayout === 'list' ? (
            <div className="flex flex-col gap-3 mt-4">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={(e) => handleToolClick(tool, e)}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-sm hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                      {isImage(tool.image_url || tool.link_url) ? (
                        <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="p-2">{getMediaIcon(tool)}</div>
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {tool.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tool.category && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                            {tool.category}
                          </span>
                        )}
                        {tool.is_locked && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )}
                        {tool.is_gated && (
                          <span className="text-[10px] text-pink-400 flex items-center gap-1 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
                            <Sparkles className="w-2.5 h-2.5" /> Gated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tool.video_urls && tool.video_urls.length > 0 && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openVideoModal(tool.video_urls!); }}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Preview Video"
                      >
                        <Video className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Demo</span>
                      </button>
                    )}
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white flex items-center justify-center transition-all border border-purple-500/30">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTools.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-purple-300/50 text-base font-light border border-dashed border-white/20 rounded-3xl backdrop-blur-sm bg-white/5">
                  No tools match this category.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 mt-6">
                {filteredTools.map((tool) => (
                    <div key={tool.id} className="flex flex-col items-center group relative animate-in zoom-in duration-500">
                        <GlowWrapper 
                            enabled={pageProfile.theme_buttons_border} 
                            combo={pageProfile.theme_color_combo} 
                            roundedClass="rounded-[2rem]"
                            className="w-full aspect-square shadow-[0_15px_35px_rgba(0,0,0,0.4)] cursor-pointer active:scale-95 transition-transform"
                            onClick={(e: React.MouseEvent) => handleToolClick(tool, e)}
                        >
                            <div className="w-full h-full relative rounded-[calc(2rem-2px)] overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 group-hover:border-white/40 transition-all flex items-center justify-center">
                                {isImage(tool.image_url || tool.link_url) ? (
                                  <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform duration-700">
                                     {getMediaIcon(tool)}
                                  </div>
                                )}
                                
                                {/* Overlay Indicator Gradients */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-20 transition-opacity z-10"></div>
                                
                                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                    <button 
                                       onClick={(e) => handleToolShare(e, tool)} 
                                       className="w-8 h-8 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all"
                                       title="Share Tool"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    {tool.is_locked && (
                                       <div className="w-8 h-8 flex items-center justify-center bg-amber-500/20 backdrop-blur-md rounded-full border border-amber-500/40 text-amber-400">
                                          <Lock className="w-4 h-4" />
                                       </div>
                                    )}
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                                    {tool.video_urls && tool.video_urls.length > 0 && (
                                       <button 
                                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openVideoModal(tool.video_urls!); }}
                                          className="py-1 px-2.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white hover:text-black shadow-lg flex items-center gap-1.5 transition-all text-[10px] font-black uppercase tracking-tighter"
                                        >
                                            <Video className="w-3.5 h-3.5" />
                                            {tool.video_urls.length > 1 ? \`\${tool.video_urls.length} VIDS\` : 'PREVIEW'}
                                        </button>
                                    )}
                                    
                                    {tool.is_gated && (
                                        <div className="ml-auto p-1.5 bg-pink-500/20 backdrop-blur-md rounded-full border border-pink-500/40">
                                            <MessageSquare className="w-3 h-3 text-pink-400 shadow-sm" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlowWrapper>
                        <div className="mt-4 flex flex-col items-center text-center pointer-events-none w-full">
                            <h3 className="text-[15px] font-black tracking-tight text-white/90 px-2 line-clamp-1 drop-shadow-md">
                                {tool.name}
                            </h3>
                            {tool.category && (
                               <div className="flex items-center gap-1.5 mt-0.5 opacity-40">
                                  <span className="w-1 h-1 rounded-full bg-indigo-500" />
                                  <span className="text-[9px] text-white uppercase tracking-[0.2em] font-black">{tool.category}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {filteredTools.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-purple-300/50 text-base font-light border border-dashed border-white/20 rounded-3xl backdrop-blur-sm bg-white/5">
                        {tools.length === 0 ? 'No tools match this category.' : 'No tools match this category.'}
                    </div>
                )}
            </div>
          )}
      </div>\n\n`;

content = content.substring(0, idxC1) + replacementC + content.substring(idxC2);

// 4. Floating Direct WhatsApp Widget before closing div
const markerD = '      </div>\n    </div>\n  );\n}';
const replacementD = `      {/* Floating Direct WhatsApp Widget */}
      {pageProfile.social_whatsapp && (() => {
        const waNum = pageProfile.social_whatsapp.replace(/[^0-9]/g, '');
        const waGreeting = pageProfile.whatsapp_greeting || 'Assalam-o-Alaikum! I visited your verified toolkit and would like more information.';
        const waUrl = \`https://wa.me/\${waNum}?text=\${encodeURIComponent(waGreeting)}\`;
        return (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-black shadow-[0_0_30px_rgba(37,211,102,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-2 border-white/30"
            title={\`Chat with \${pageProfile.username} on WhatsApp\`}
          >
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0A0F1E] animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0A0F1E]"></span>
            <SiWhatsapp size={26} />
            <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-black/90 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl">
              Chat with {pageProfile.username}
            </span>
          </a>
        );
      })()}

      </div>
    </div>
  );
}`;

if (!content.includes(markerD)) {
  console.error('Marker D not found!');
  process.exit(1);
}
content = content.replace(markerD, replacementD);

fs.writeFileSync(filePath, content, 'utf8');
console.log('PublicView.tsx successfully updated with full customization!');
