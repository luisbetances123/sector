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
}

export default function PipelinePage() {
  // Datos de prueba calibrados para activar los diferentes estados
  const [deals, setDeals] = useState<ClientDeal[]>([
    {
      id: "deal-1",
      name: "Inversiones Piantini",
      property: "Torre Naco",
      price: 450000,
      priceStr: "US$ 450,000",
      stageId: "2",
      updatedAt: "2026-06-02T10:00:00.000Z" // 6 días (🥶 Estancado - Rojo)
    },
    {
      id: "deal-2",
      name: "Carlos Mendoza",
      property: "Penthouse Piantini",
      price: 850000,
      priceStr: "US$ 850,000",
      stageId: "1",
      updatedAt: new Date().toISOString() // 0 días (🟢 Nuevo - Verde)
    },
    {
      id: "deal-3",
      name: "Sofía Rodríguez",
      property: "Apartamento Bella Vista",
      price: 280000,
      priceStr: "US$ 280,000",
      stageId: "1",
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 días (⚡ Activo - Gris)
    }
  ]);

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

  const getDaysInStage = (dateString: string): number => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const copyAISuggestion = (deal: ClientDeal) => {
    let text = "";
    if (deal.stageId === "1") {
      text = `Hola ${deal.name}, veo que te interesó la propiedad *${deal.property}*. ¿Te gustaría agendar una visita virtual o presencial esta semana?`;
    } else if (deal.stageId === "2") {
      text = `Hola ${deal.name}, un placer saludarte tras nuestra visita a *${deal.property}*. Quedo a tu orden si tienes dudas del metraje o las amenidades.`;
    } else {
      text = `Hola ${deal.name}, espero estés excelente. Estoy revisando los últimos detalles del contrato para *${deal.property}*. ¿Conversamos hoy?`;
    }
    navigator.clipboard.writeText(text);
    alert(`🤖 Propuesta de IA copiada al portapapeles para ${deal.name}`);
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
    <div className="min-h-screen text-zinc-100 p-8 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="border-b border-zinc-900 pb-10">
          <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia de Negociación</span>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white mt-2">Pipeline Visual</h1>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {processedColumns.map((col) => (
            <div key={col.id} className="bg-zinc-950/20 p-4 rounded-2xl min-h-[600px] border border-zinc-900/50 flex flex-col">
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
                  
                  // Lógica matemática de estados
                  const isNew = days === 0;
                  const isCold = days >= 4;
                  const isNormal = !isNew && !isCold;

                  // Definición dinámica de estilos CSS según el estado de CRM
                  let cardStyles = "border-zinc-800 bg-zinc-950"; // Normal
                  if (isNew) cardStyles = "border-[#CCFF00]/40 bg-gradient-to-b from-[#CCFF00]/5 to-zinc-950 shadow-[#CCFF00]/5";
                  if (isCold) cardStyles = "border-red-500/50 bg-gradient-to-b from-red-950/20 to-zinc-950 shadow-red-950/10";

                  return (
                    <div key={deal.id} className={`border p-5 rounded-xl shadow-lg flex flex-col justify-between min-h-[210px] transition-all duration-300 ${cardStyles}`}>
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white text-sm leading-tight">{deal.name}</h4>
                          
                          {/* Badge del Semáforo Inteligente */}
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                            isNew ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 animate-pulse' :
                            isCold ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' :
                            'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}>
                            {isNew && <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] block shrink-0" />}
                            {isCold && <span className="w-1.5 h-1.5 rounded-full bg-red-500 block shrink-0" />}
                            
                            {isNew ? '🟢 Nuevo' : isCold ? `🥶 Estancado (${days}d)` : `⚡ Activo (${days}d)`}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{deal.property}</p>
                        <p className="text-[#CCFF00] font-black mt-2 text-sm">{deal.priceStr}</p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex gap-2">
                          <a
                            href={generateWhatsAppLink({
                              phone: "18095551234", 
                              clientName: deal.name,
                              propertyName: deal.property,
                              propertyPrice: deal.priceStr
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] hover:bg-[#b5e600] rounded-lg transition-colors text-center"
                          >
                            💬 WhatsApp
                          </a>

                          <button
                            onClick={() => copyAISuggestion(deal)}
                            className="px-2.5 py-2 text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg transition-colors"
                            title="Generar copy con IA para esta etapa"
                          >
                            🪄 AI
                          </button>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-zinc-900 gap-2">
                          <button 
                            disabled={col.id === '1'}
                            onClick={() => moveDeal(deal.id, deal.stageId, 'backward')}
                            className="text-[10px] px-2 py-1 bg-zinc-900 hover:bg-zinc-800 rounded disabled:opacity-20 text-zinc-400 hover:text-white transition-colors"
                          >
                            ◀
                          </button>
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Mover etapa</span>
                          <button 
                            disabled={col.id === '4'}
                            onClick={() => moveDeal(deal.id, deal.stageId, 'forward')}
                            className="text-[10px] px-2 py-1 bg-zinc-900 hover:bg-zinc-800 rounded disabled:opacity-20 text-zinc-400 hover:text-white transition-colors"
                          >
                            ▶
                          </button>
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
    </div>
  );
}