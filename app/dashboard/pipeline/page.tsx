"use client";

import React, { useState } from 'react';
import { generateWhatsAppLink } from "@/utils/whatsapp";

interface ClientDeal {
  id: string;
  name: string;
  property: string;
  price: number;
  priceStr: string;
  stageId: string;
  updatedAt: string;
  phone: string;
  email: string;
  notes: string;
}

export default function PipelinePage() {
  // 1. Estado de clientes con datos expandidos para el modal
  const [deals, setDeals] = useState<ClientDeal[]>([
    {
      id: "d1",
      name: "Juan Manuel Peralta",
      property: "Torre Serralles - 3BR",
      price: 325000,
      priceStr: "US$ 325,000",
      stageId: "1",
      updatedAt: new Date().toISOString(),
      phone: "18095551234",
      email: "j.peralta@email.com",
      notes: "Interesado en pisos altos con vista despejada. Listo para reservar si el desglose de mantenimiento le cuadra."
    },
    {
      id: "d2",
      name: "Elena de los Santos",
      property: "Penthouse Evaristo Morales",
      price: 540000,
      priceStr: "US$ 540,000",
      stageId: "1",
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      phone: "18095551234",
      email: "elena.santos@leyes.com",
      notes: "Lleva una semana congelada porque está esperando la aprobación de un poder legal internacional."
    },
    {
      id: "d3",
      name: "Inversiones Piantini",
      property: "Torre Naco Luxury",
      price: 450000,
      priceStr: "US$ 450,000",
      stageId: "2",
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      phone: "18095551234",
      email: "inversiones.p@email.com",
      notes: "Solicitó un descuento del 5% en el precio de lista. Pendiente confirmar con el desarrollador."
    },
    {
      id: "d4",
      name: "Dr. Marcos Rossi",
      property: "Blue Mall Residences",
      price: 580000,
      priceStr: "US$ 580,000",
      stageId: "2",
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      phone: "18095551234",
      email: "m.rossi@medicina.com",
      notes: "Le encantaron los acabados de la cocina. Quiere coordinar una segunda visita con su esposa este sábado."
    },
    {
      id: "d5",
      name: "Sofía Rodríguez",
      property: "Apt Bella Vista Vista Mar",
      price: 280000,
      priceStr: "US$ 280,000",
      stageId: "3",
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      phone: "18095551234",
      email: "sofia.rod@diseno.com",
      notes: "Revisando borrador del contrato. Presentó objeción menor con la cláusula de penalidad por retraso."
    },
    {
      id: "d6",
      name: "David Chen",
      property: "Villa en Cap Cana",
      price: 1250000,
      priceStr: "US$ 1,250,000",
      stageId: "3",
      updatedAt: new Date().toISOString(),
      phone: "18095551234",
      email: "david.chen@global.com",
      notes: "Inversionista extranjero de alto perfil. Evaluando rendimiento de renta corta (Airbnb) en la zona."
    },
    {
      id: "d7",
      name: "Ricardo Arjona",
      property: "Casa de Campo - Dye Fore",
      price: 3500000,
      priceStr: "US$ 3,500,000",
      stageId: "4",
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      phone: "18095551234",
      email: "arjona@musica.com",
      notes: "Cierre programado para finales de mes. Fondos listos en cuenta de fideicomiso."
    },
    {
      id: "d8",
      name: "Familia Bisonó",
      property: "Prados del Este - Casa",
      price: 195000,
      priceStr: "US$ 195,000",
      stageId: "4",
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      phone: "18095551234",
      email: "bisono.contacto@familia.com",
      notes: "Estancado en el papeleo final del banco por un error en la certificación de cargas del inmueble."
    }
  ]);

  // 2. Estado para controlar el lead seleccionado en el Modal
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const currentDeal = deals.find(d => d.id === selectedDealId);

  const columnsDefinition = [
    { id: '1', title: 'Prospectos' },
    { id: '2', title: 'Visitas' },
    { id: '3', title: 'Negociación' },
    { id: '4', title: 'Cierre' }
  ];

  const moveDeal = (dealId: string, currentStageId: string, direction: 'forward' | 'backward') => {
    const currentIdx = columnsDefinition.findIndex(c => c.id === currentStageId);
    let nextIdx = direction === 'forward' ? currentIdx + 1 : currentIdx - 1;

    if (nextIdx >= 0 && nextIdx < columnsDefinition.length) {
      const nextStageId = columnsDefinition[nextIdx].id;
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === dealId 
            ? { ...deal, stageId: nextStageId, updatedAt: new Date().toISOString() } 
            : deal
        )
      );
    }
  };

  // 3. Función para guardar los cambios editados desde el modal en tiempo real
  const updateDealField = (dealId: string, field: keyof ClientDeal, value: any) => {
    setDeals(prevDeals =>
      prevDeals.map(deal => {
        if (deal.id === dealId) {
          const updated = { ...deal, [field]: value };
          // Si editamos el precio numérico, actualizamos automáticamente el string visual
          if (field === 'price') {
            updated.priceStr = `US$ ${Number(value).toLocaleString('en-US')}`;
          }
          return updated;
        }
        return deal;
      })
    );
  };

  const getDaysInStage = (dateString: string): number => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const copyAISuggestion = (deal: ClientDeal) => {
    let text = "";
    if (deal.stageId === "1") text = `Hola ${deal.name}, veo que te interesó *${deal.property}*. ¿Agendamos visita?`;
    else if (deal.stageId === "2") text = `Hola ${deal.name}, ¿qué te pareció la visita a *${deal.property}*?`;
    else if (deal.stageId === "3") text = `Hola ${deal.name}, estoy revisando la oferta por *${deal.property}*.`;
    else text = `Hola ${deal.name}, felicidades por tu nueva propiedad en *${deal.property}*!`;
    
    navigator.clipboard.writeText(text);
    alert(`🤖 Sugerencia IA copiada para ${deal.name}`);
  };

  const processedColumns = columnsDefinition.map(col => {
    const colDeals = deals.filter(d => d.stageId === col.id);
    const totalAmount = colDeals.reduce((sum, d) => sum + d.price, 0);
    return {
      ...col,
      count: `${colDeals.length} ${colDeals.length === 1 ? 'deal' : 'deals'}`,
      total: totalAmount > 0 ? `US$ ${totalAmount.toLocaleString('en-US')}` : 'US$ 0',
      deals: colDeals
    };
  });

  return (
    <div className="min-h-screen text-zinc-100 p-8 font-sans selection:bg-[#CCFF00] selection:text-black relative">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="border-b border-zinc-900 pb-10 flex justify-between items-end">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia de Negociación</span>
            <h1 className="text-5xl font-extrabold tracking-tighter text-white mt-2">Pipeline Visual</h1>
          </div>
          <div className="text-right">
             <p className="text-xs font-mono text-zinc-500 uppercase">Volumen Total en Pipeline</p>
             <p className="text-2xl font-black text-white">US$ {deals.reduce((s,d)=>s+d.price,0).toLocaleString()}</p>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {processedColumns.map((col) => (
            <div key={col.id} className="bg-zinc-950/20 p-4 rounded-2xl min-h-[700px] border border-zinc-900/50 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xs font-mono font-black text-zinc-400 uppercase">{col.title}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{col.count}</p>
                </div>
                <span className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-white">{col.total}</span>
              </div>

              <div className="space-y-4 flex-1">
                {col.deals.map((deal) => {
                  const days = getDaysInStage(deal.updatedAt);
                  const isNew = days === 0;
                  const isCold = days >= 4;

                  let cardStyles = "border-zinc-800 bg-zinc-950 hover:border-zinc-700";
                  if (isNew) cardStyles = "border-[#CCFF00]/40 bg-gradient-to-b from-[#CCFF00]/5 to-zinc-950 shadow-[#CCFF00]/5 hover:border-[#CCFF00]/60";
                  if (isCold) cardStyles = "border-red-500/50 bg-gradient-to-b from-red-950/20 to-zinc-950 shadow-red-950/10 hover:border-red-500/70";

                  return (
                    <div 
                      key={deal.id} 
                      className={`border p-4 rounded-xl shadow-lg flex flex-col justify-between min-h-[220px] transition-all duration-300 cursor-pointer ${cardStyles}`}
                      onClick={() => setSelectedDealId(deal.id)} // Abrir modal al hacer clic en la tarjeta
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white text-[13px] leading-tight group-hover:text-[#CCFF00]">{deal.name}</h4>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isNew ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 animate-pulse' :
                            isCold ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' :
                            'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          }`}>
                            {isNew ? '🟢 NUEVO' : isCold ? `🥶 COLD (${days}d)` : `⚡ ACTIVO`}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1 truncate">{deal.property}</p>
                        <p className="text-[#CCFF00] font-black mt-2 text-sm">{deal.priceStr}</p>
                      </div>

                      <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5">
                          <a href={generateWhatsAppLink({phone: deal.phone, clientName: deal.name, propertyName: deal.property, propertyPrice: deal.priceStr})} target="_blank" rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] font-bold uppercase text-black bg-[#CCFF00] rounded-lg">
                            💬 WA
                          </a>
                          <button onClick={() => copyAISuggestion(deal)} className="px-2 py-1.5 text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg">🪄 AI</button>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-900 gap-1.5">
                          <button disabled={col.id === '1'} onClick={() => moveDeal(deal.id, deal.stageId, 'backward')} className="text-[9px] p-1 bg-zinc-900 rounded disabled:opacity-10 text-zinc-400">◀</button>
                          <span className="text-[8px] font-mono text-zinc-600 uppercase">Mover</span>
                          <button disabled={col.id === '4'} onClick={() => moveDeal(deal.id, deal.stageId, 'forward')} className="text-[9px] p-1 bg-zinc-900 rounded disabled:opacity-10 text-zinc-400">▶</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* ========================================================= */}
      {/* OPCIÓN C: MODAL DE DETALLES Y EDICIÓN EN TIEMPO REAL      */}
      {/* ========================================================= */}
      {currentDeal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-lg bg-zinc-950 border-l border-zinc-900 h-full p-8 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Encabezado del Modal */}
            <div className="space-y-6">
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

              {/* Formulario de Edición Minimalista */}
              <div className="space-y-5">
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Nombre del Cliente</label>
                  <input 
                    type="text" 
                    value={currentDeal.name}
                    onChange={(e) => updateDealField(currentDeal.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-900 focus:border-[#CCFF00] text-xl font-bold text-white py-1 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Teléfono</label>
                    <input 
                      type="text" 
                      value={currentDeal.phone}
                      onChange={(e) => updateDealField(currentDeal.id, 'phone', e.target.value)}
                      className="w-full bg-transparent border-b border-zinc-900 focus:border-[#CCFF00] text-xs text-zinc-300 py-1 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Correo Electrónico</label>
                    <input 
                      type="email" 
                      value={currentDeal.email}
                      onChange={(e) => updateDealField(currentDeal.id, 'email', e.target.value)}
                      className="w-full bg-transparent border-b border-zinc-900 focus:border-[#CCFF00] text-xs text-zinc-300 py-1 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Propiedad Asignada</label>
                  <input 
                    type="text" 
                    value={currentDeal.property}
                    onChange={(e) => updateDealField(currentDeal.id, 'property', e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-900 focus:border-[#CCFF00] text-sm text-zinc-200 py-1 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Presupuesto / Valor Negocio (US$)</label>
                  <input 
                    type="number" 
                    value={currentDeal.price}
                    onChange={(e) => updateDealField(currentDeal.id, 'price', Number(e.target.value))}
                    className="w-full bg-transparent border-b border-zinc-900 focus:border-[#CCFF00] text-lg font-black text-[#CCFF00] py-1 outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Bitácora de Seguimiento (Notas Internas)</label>
                  <textarea 
                    rows={4}
                    value={currentDeal.notes}
                    onChange={(e) => updateDealField(currentDeal.id, 'notes', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-900 focus:border-zinc-800 rounded-xl text-xs text-zinc-400 p-3 mt-1 outline-none resize-none transition-colors leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Pie del Modal Informativo */}
            <div className="border-t border-zinc-900 pt-4 mt-6">
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
                  className="bg-[#CCFF00] hover:bg-[#b5e600] text-black font-bold uppercase text-[9px] px-3 py-2 rounded-lg transition-colors shrink-0"
                >
                  🪄 Aplicar IA
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}