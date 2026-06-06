'use client'
import { useState } from 'react'
import { 
  Building, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Plus,
  AlertTriangle,
  Clock,
  Briefcase,
  Search,
  X
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  project: string
  propertyType: string
  budget: string
  sector: string
  updatedAt: string
  priority: 'critico' | 'seguimiento' | 'nuevo' | 'buscando' | 'normal'
  statusLabel: string
}

export default function PipelinePage() {
  // Estado para controlar el Tablero Kanban
  const [columns, setColumns] = useState<{ [key: string]: Lead[] }>({
    'Prospectos': [
      { id: '1', name: 'Carlos Mendoza', project: 'Torre Naco Luxury', propertyType: 'Apartamento', budget: 'US$280,000', sector: 'Naco', updatedAt: 'Hace 2h', priority: 'critico', statusLabel: 'SIN RESPONDER' },
      { id: '2', name: 'Alejandro Sanz', project: 'Villa Las Terrenas', propertyType: 'Villa / Casa', budget: 'US$650,000', sector: 'Las Terrenas', updatedAt: 'Hace 5h', priority: 'nuevo', statusLabel: 'NUEVO LEAD' },
    ],
    'Calificados': [
      { id: '3', name: 'Luis Betances', project: 'Regatta Blue', propertyType: 'Penthouse', budget: 'US$450,000', sector: 'Piantini', updatedAt: 'Ayer', priority: 'buscando', statusLabel: 'BUSCANDO' },
    ],
    'En Propuesta': [
      { id: '4', name: 'Jean Lizardo', project: 'Penthouse Serrallés', propertyType: 'Apartamento', budget: 'US$890,000', sector: 'Serrallés', updatedAt: 'Hace 15m', priority: 'seguimiento', statusLabel: 'PROPUESTA' },
    ],
    'Cierre 🎉': [
      { id: '5', name: 'Mariela Núñez', project: 'Juan Dolio Beach Front', propertyType: 'Solar / Playa', budget: 'US$310,000', sector: 'Juan Dolio', updatedAt: 'Esta semana', priority: 'normal', statusLabel: 'CONTRATO' },
    ],
  })

  // Estados para controlar el Modal de Nuevo Cliente
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nuevoLead, setNuevoLead] = useState({
    name: '',
    project: '',
    propertyType: 'Apartamento',
    budget: '',
    sector: ''
  })

  // Función para mover leads entre columnas
  const moverLead = (currentColumn: string, leadId: string, direccion: 'adelante' | 'atras') => {
    const colKeys = Object.keys(columns)
    const currentIdx = colKeys.indexOf(currentColumn)
    const nuevoIdx = direccion === 'adelante' ? currentIdx + 1 : currentIdx - 1

    if (nuevoIdx < 0 || nuevoIdx >= colKeys.length) return 

    const targetColumn = colKeys[nuevoIdx]
    const leadToMove = columns[currentColumn].find(l => l.id === leadId)
    
    if (leadToMove) {
      const leadActualizado = { ...leadToMove, updatedAt: '¡Ahora mismo!' }
      setColumns({
        ...columns,
        [currentColumn]: columns[currentColumn].filter(l => l.id !== leadId),
        [targetColumn]: [...columns[targetColumn], leadActualizado]
      })
    }
  }

  // Función para manejar la creación de un cliente nuevo
  const handleCrearLead = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoLead.name || !nuevoLead.project) return

    const formatoBudget = nuevoLead.budget.startsWith('US$') ? nuevoLead.budget : `US$${Number(nuevoLead.budget).toLocaleString()}`

    const nuevoObjetoLead: Lead = {
      id: Date.now().toString(),
      name: nuevoLead.name,
      project: nuevoLead.project,
      propertyType: nuevoLead.propertyType,
      budget: formatoBudget,
      sector: nuevoLead.sector || 'Naco',
      updatedAt: '¡Ahora mismo!',
      priority: 'nuevo', // Entra directo con el color Cian Eléctrico
      statusLabel: 'NUEVO LEAD'
    }

    setColumns({
      ...columns,
      'Prospectos': [nuevoObjetoLead, ...columns['Prospectos']]
    })

    // Limpiar formulario y cerrar modal
    setNuevoLead({ name: '', project: '', propertyType: 'Apartamento', budget: '', sector: '' })
    setIsModalOpen(false)
  }

  const calcularTotalColumna = (leads: Lead[]) => {
    const total = leads.reduce((acc, lead) => {
      const num = parseInt(lead.budget.replace(/[^0-9]/g, ''), 10)
      return acc + (isNaN(num) ? 0 : num)
    }, 0)
    return `US$${total.toLocaleString()}`
  }

  const getPriorityStyles = (priority: string) => {
    switch(priority) {
      case 'critico':
        return { border: 'border-red-500/30 bg-gradient-to-b from-[#110E08] to-red-950/5', text: 'text-red-400 bg-red-500/10 border-red-500/20', icon: AlertTriangle }
      case 'seguimiento':
        return { border: 'border-amber-500/30 bg-gradient-to-b from-[#110E08] to-amber-950/5', text: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock }
      case 'nuevo':
        return { border: 'border-cyan-500/30 bg-gradient-to-b from-[#110E08] to-cyan-950/5', text: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', icon: Briefcase }
      case 'buscando':
        return { border: 'border-blue-500/30 bg-gradient-to-b from-[#110E08] to-blue-950/5', text: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Search }
      default:
        return { border: 'border-zinc-800/80 bg-[#110E08]/80', text: 'text-zinc-400 bg-zinc-900 border-zinc-800', icon: Briefcase }
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn relative">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Pipeline Visual</h1>
          <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1 font-bold">Panel de Control de Datos e Inteligencia de Negociación</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#CCFF00] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Cliente
        </button>
      </div>

      {/* Tablero Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {Object.entries(columns).map(([colName, leads], colIdx) => {
          const isCierre = colName.includes('Cierre')
          const isPrimeraColumna = colIdx === 0
          
          return (
            <div key={colName} className="bg-zinc-950/40 border border-zinc-900/60 rounded-2xl p-4 flex flex-col min-h-[520px] shadow-xl">
              
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-900">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isCierre ? 'bg-[#CCFF00]' : 'bg-zinc-500'}`} />
                    {colName}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold block mt-0.5">{leads.length} {leads.length === 1 ? 'caso' : 'casos'}</span>
                </div>
                <span className={`text-xs font-mono font-black ${isCierre ? 'text-[#CCFF00]' : 'text-white'}`}>
                  {calcularTotalColumna(leads)}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[550px] pr-1">
                {leads.length === 0 ? (
                  <div className="border border-dashed border-zinc-900 rounded-xl p-8 text-center flex flex-col items-center justify-center h-32">
                    <span className="text-zinc-700 text-xs font-medium uppercase tracking-wider">Vacío</span>
                  </div>
                ) : (
                  leads.map((lead) => {
                    const styles = getPriorityStyles(lead.priority)
                    const PriorityIcon = styles.icon

                    return (
                      <div 
                        key={lead.id} 
                        className={`border ${isCierre ? 'border-[#CCFF00]/30 bg-gradient-to-b from-[#110E08] to-[#CCFF00]/4' : styles.border} rounded-xl p-4 shadow-md group relative hover:border-zinc-700 transition-all`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-sm font-black text-white group-hover:text-[#CCFF00] transition-colors truncate">{lead.name}</h4>
                              <span className={`inline-block text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border mt-1 tracking-wider ${isCierre ? 'text-[#CCFF00] bg-[#CCFF00]/10 border-[#CCFF00]/20' : styles.text}`}>
                                {lead.statusLabel}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 flex-shrink-0">
                              {lead.sector}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                              <Building className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                              <span className="truncate">{lead.project}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono pl-0.5">
                              <PriorityIcon className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                              <span className="truncate">{lead.propertyType}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-zinc-900/60 mt-1">
                            <span className="text-xs font-mono font-black text-[#CCFF00]">{lead.budget}</span>
                            
                            <div className="flex items-center gap-1.5">
                              {!isPrimeraColumna && (
                                <button 
                                  onClick={() => moverLead(colName, lead.id, 'atras')}
                                  className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-black hover:bg-[#CCFF00] rounded-lg transition-all border border-zinc-800"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              )}

                              {!isCierre ? (
                                <button 
                                  onClick={() => moverLead(colName, lead.id, 'adelante')}
                                  className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-black hover:bg-[#CCFF00] rounded-lg transition-all border border-zinc-800"
                                >
                                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              ) : (
                                <span className="text-[#CCFF00] p-1 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-[9px] text-zinc-600 font-mono text-right mt-1.5 block">{lead.updatedAt}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL DE NUEVO CLIENTE (Estilo Robinhood Premium) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
            
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-white">Alta de Oportunidad</h2>
                <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider">Inyectar registro al Pipeline</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearLead} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Nombre del Cliente</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Juan Pérez"
                  value={nuevoLead.name}
                  onChange={(e) => setNuevoLead({...nuevoLead, name: e.target.value})}
                  className="w-full bg-[#110E08] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Proyecto</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Regatta Blue"
                    value={nuevoLead.project}
                    onChange={(e) => setNuevoLead({...nuevoLead, project: e.target.value})}
                    className="w-full bg-[#110E08] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Sector</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Piantini"
                    value={nuevoLead.sector}
                    onChange={(e) => setNuevoLead({...nuevoLead, sector: e.target.value})}
                    className="w-full bg-[#110E08] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Tipo Propiedad</label>
                  <select 
                    value={nuevoLead.propertyType}
                    onChange={(e) => setNuevoLead({...nuevoLead, propertyType: e.target.value})}
                    className="w-full bg-[#110E08] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors"
                  >
                    <option value="Apartamento">Apartamento</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Villa / Casa">Villa / Casa</option>
                    <option value="Solar / Playa">Solar / Playa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Presupuesto (Sólo número)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="250000"
                    value={nuevoLead.budget}
                    onChange={(e) => setNuevoLead({...nuevoLead, budget: e.target.value})}
                    className="w-full bg-[#110E08] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-[#CCFF00] text-black font-black uppercase text-xs tracking-widest py-3 rounded-xl hover:bg-white transition-all"
                >
                  Insertar en Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}