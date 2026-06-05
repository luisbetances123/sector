'use client'
import { useState } from 'react'
import { 
  DollarSign, 
  User, 
  ArrowRight, 
  Building, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight,
  Plus
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  project: string
  budget: string
  sector: string
  updatedAt: string
}

export default function PipelinePage() {
  // Estado local para simular interactividad viva arrastrando/moviendo leads
  const [columns, setColumns] = useState<{ [key: string]: Lead[] }>({
    'Prospectos': [
      { id: '1', name: 'Carlos Mendoza', project: 'Torre Naco Luxury', budget: 'US$280,000', sector: 'Naco', updatedAt: 'Hace 2h' },
      { id: '2', name: 'Alejandro Sanz', project: 'Villa Las Terrenas', budget: 'US$650,000', sector: 'Las Terrenas', updatedAt: 'Hace 5h' },
    ],
    'Calificados': [
      { id: '3', name: 'Luis Betances', project: 'Regatta Blue', budget: 'US$450,000', sector: 'Piantini', updatedAt: 'Ayer' },
    ],
    'En Propuesta': [
      { id: '4', name: 'Jean Lizardo', project: 'Penthouse Serrallés', budget: 'US$890,000', sector: 'Serrallés', updatedAt: 'Hace 15m' },
    ],
    'Cierre 🎉': [
      { id: '5', name: 'Mariela Núñez', project: 'Juan Dolio Beach Front', budget: 'US$310,000', sector: 'Juan Dolio', updatedAt: 'Esta semana' },
    ],
  })

  // Función rápida para simular el avance de un lead por el embudo comercial
  const avanzarLead = (currentColumn: string, leadId: string) => {
    const colKeys = Object.keys(columns)
    const currentIdx = colKeys.indexOf(currentColumn)
    if (currentIdx === colKeys.length - 1) return // Ya está en cierre

    const nextColumn = colKeys[currentIdx + 1]
    const leadToMove = columns[currentColumn].find(l => l.id === leadId)
    
    if (leadToMove) {
      // Actualizar marcas de tiempo estéticas
      const leadActualizado = { ...leadToMove, updatedAt: '¡Ahora mismo!' }
      setColumns({
        ...columns,
        [currentColumn]: columns[currentColumn].filter(l => l.id !== leadId),
        [nextColumn]: [...columns[nextColumn], leadActualizado]
      })
    }
  }

  // Calcular volumen financiero total bajo negociación en pantalla
  const calcularTotalColumna = (leads: Lead[]) => {
    const total = leads.reduce((acc, lead) => {
      const num = parseInt(lead.budget.replace(/[^0-9]/g, ''), 10)
      return acc + (isNaN(num) ? 0 : num)
    }, 0)
    return `US$${total.toLocaleString()}`
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Pipeline Visual</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Controla el flujo de tus comisiones y cierres activos</p>
        </div>
        <button className="bg-[#CCFF00] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 self-start sm:self-auto shadow-md shadow-[#CCFF00]/5">
          <Plus className="w-4 h-4 stroke-[3]" /> Crear Oportunidad
        </button>
      </div>

      {/* Tablero Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {Object.entries(columns).map(([colName, leads]) => {
          const isCierre = colName.includes('Cierre')
          return (
            <div key={colName} className="bg-black/20 border border-zinc-800/60 rounded-2xl p-4 flex flex-col min-h-[450px] shadow-xl">
              
              {/* Info de la Columna */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-900">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isCierre ? 'bg-[#CCFF00]' : 'bg-zinc-600'}`} />
                    {colName}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold block mt-0.5">{leads.length} {leads.length === 1 ? 'caso' : 'casos'}</span>
                </div>
                <span className={`text-xs font-mono font-black ${isCierre ? 'text-[#CCFF00]' : 'text-zinc-400'}`}>
                  {calcularTotalColumna(leads)}
                </span>
              </div>

              {/* Tarjetas de Leads */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {leads.length === 0 ? (
                  <div className="border border-dashed border-zinc-900 rounded-xl p-8 text-center flex flex-col items-center justify-center h-32">
                    <span className="text-zinc-700 text-xs font-medium uppercase tracking-wider">Vacío</span>
                  </div>
                ) : (
                  leads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className={`bg-[#110E08]/80 border ${isCierre ? 'border-[#CCFF00]/20 bg-gradient-to-b from-[#110E08] to-[#CCFF00]/2' : 'border-zinc-800/80'} rounded-xl p-4 shadow-md group relative hover:border-zinc-700 transition-all`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-black text-zinc-100 group-hover:text-[#CCFF00] transition-colors truncate">{lead.name}</h4>
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 flex-shrink-0">
                            {lead.sector}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Building className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                          <span className="truncate">{lead.project}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-zinc-900/60 mt-1">
                          <span className="text-xs font-mono font-black text-[#CCFF00]">{lead.budget}</span>
                          
                          {/* Botón de acción rápido para avanzar de etapa */}
                          {!isCierre ? (
                            <button 
                              onClick={() => avanzarLead(colName, lead.id)}
                              className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-black hover:bg-[#CCFF00] rounded-lg transition-all border border-zinc-800 hover:border-transparent flex items-center justify-center"
                              title="Avanzar etapa"
                            >
                              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          ) : (
                            <span className="text-emerald-400 p-1 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[9px] text-zinc-600 font-mono text-right mt-1.5 block">{lead.updatedAt}</div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}