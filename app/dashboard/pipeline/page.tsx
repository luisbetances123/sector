      {/* ========================================================= */}
      {/* OPCIÓN C: MODAL DE DETALLES Y EDICIÓN MEJORADO            */}
      {/* ========================================================= */}
      {currentDeal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-lg bg-zinc-950 border-l border-zinc-900 h-full p-8 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Encabezado del Modal */}
            <div className="space-y-6 overflow-y-auto pr-2 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-zinc-400">
                  ID: {currentDeal.id.toUpperCase()} • Ficha del Inversionista
                </span>
                <button 
                  onClick={() => setSelectedDealId(null)}
                  className="text-zinc-500 hover:text-white text-sm font-mono bg-zinc-900 hover:bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Formulario de Edición con Indicadores Visuales */}
              <div className="space-y-5">
                
                {/* Campo: Nombre */}
                <div className="group/field relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Nombre del Cliente</label>
                    <span className="text-[10px] text-zinc-600 font-mono opacity-0 group-hover/field:opacity-100 transition-opacity">✏️ Editar</span>
                  </div>
                  <div className="relative mt-1">
                    <input 
                      type="text" 
                      value={currentDeal.name}
                      onChange={(e) => updateDealField(currentDeal.id, 'name', e.target.value)}
                      className="w-full bg-zinc-900/40 border border-zinc-900 focus:border-[#CCFF00] rounded-xl text-base font-bold text-white px-3 py-2.5 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Campos: Teléfono y Correo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group/field">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Teléfono</label>
                      <span className="text-[9px] text-zinc-600 font-mono opacity-0 group-hover/field:opacity-100 transition-opacity">✏️</span>
                    </div>
                    <input 
                      type="text" 
                      value={currentDeal.phone}
                      onChange={(e) => updateDealField(currentDeal.id, 'phone', e.target.value)}
                      className="w-full bg-zinc-900/40 border border-zinc-900 focus:border-[#CCFF00] rounded-xl text-xs text-zinc-300 px-3 py-2.5 mt-1 outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="group/field">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Correo Electrónico</label>
                      <span className="text-[9px] text-zinc-600 font-mono opacity-0 group-hover/field:opacity-100 transition-opacity">✏️</span>
                    </div>
                    <input 
                      type="email" 
                      value={currentDeal.email}
                      onChange={(e) => updateDealField(currentDeal.id, 'email', e.target.value)}
                      className="w-full bg-zinc-900/40 border border-zinc-900 focus:border-[#CCFF00] rounded-xl text-xs text-zinc-300 px-3 py-2.5 mt-1 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Campo: Propiedad */}
                <div className="group/field">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Propiedad Asignada</label>
                    <span className="text-[10px] text-zinc-600 font-mono opacity-0 group-hover/field:opacity-100 transition-opacity">✏️ Editar</span>
                  </div>
                  <input 
                    type="text" 
                    value={currentDeal.property}
                    onChange={(e) => updateDealField(currentDeal.id, 'property', e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-900 focus:border-[#CCFF00] rounded-xl text-xs text-zinc-200 px-3 py-2.5 mt-1 outline-none transition-colors"
                  />
                </div>

                {/* Campo: Presupuesto */}
                <div className="group/field">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Presupuesto / Valor Negocio (US$)</label>
                    <span className="text-[10px] text-zinc-600 font-mono opacity-0 group-hover/field:opacity-100 transition-opacity">✏️ Editar</span>
                  </div>
                  <input 
                    type="number" 
                    value={currentDeal.price}
                    onChange={(e) => updateDealField(currentDeal.id, 'price', Number(e.target.value))}
                    className="w-full bg-zinc-900/40 border border-zinc-900 focus:border-[#CCFF00] rounded-xl text-sm font-black text-[#CCFF00] px-3 py-2.5 mt-1 outline-none transition-colors font-mono"
                  />
                </div>

                {/* Campo: Notas */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Bitácora de Seguimiento (Notas Internas)</label>
                  <textarea 
                    rows={4}
                    value={currentDeal.notes}
                    onChange={(e) => updateDealField(currentDeal.id, 'notes', e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-900 focus:border-zinc-800 rounded-xl text-xs text-zinc-400 p-3 mt-1 outline-none resize-none transition-colors leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Panel de Botones Inferior */}
            <div className="border-t border-zinc-900 pt-4 mt-6 space-y-4">
              
              {/* Sugerencia IA */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase">Sugerencia IA de Próximo Paso</p>
                  <p className="text-[11px] text-zinc-300 mt-0.5">Enviar plantilla de WhatsApp sugerida para reanimar.</p>
                </div>
                <button 
                  onClick={() => {
                    copyAISuggestion(currentDeal);
                    setSelectedDealId(null);
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold uppercase text-[9px] px-3 py-2 rounded-lg transition-colors shrink-0"
                >
                  🪄 Aplicar IA
                </button>
              </div>

              {/* Botón de Confirmación Principal */}
              <button
                onClick={() => {
                  setSelectedDealId(null);
                  alert("💾 Cambios guardados localmente en el Pipeline.");
                }}
                className="w-full bg-[#CCFF00] hover:bg-[#b5e600] text-black font-mono font-black uppercase text-xs py-3.5 rounded-xl transition-all tracking-wider shadow-lg shadow-[#CCFF00]/5 flex items-center justify-center gap-2"
              >
                💾 Guardar y Actualizar Pipeline
              </button>
            </div>

          </div>
        </div>
      )}