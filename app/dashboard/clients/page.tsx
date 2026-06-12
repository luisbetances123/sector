'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Cliente {
  id: string
  name: string
  email: string
  phone: string
  stage: string
  price: string
  notes: string
  initial: string
  created_at: string
  user_id: string
}

const emptyForm = {
  nombre: '', email: '', telefono: '', etapa: 'NUEVO',
  presupuesto_min: '', presupuesto_max: '', notas: '', proxima_accion: ''
}

export default function ClientsPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchClientes() }, [])

  async function fetchClientes() {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setClientes(data || [])
    setLoading(false)
  }

  async function agregarCliente() {
    if (!form.nombre.trim()) return alert('El nombre es requerido')
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('clients').insert([{
      name: form.nombre,
      email: form.email,
      phone: form.telefono,
      stage: form.etapa,
      price: form.presupuesto_min,
      
      notes: form.notas,
      initial: form.proxima_accion,
      owner_id: user?.id || null
    }])
    if (error) alert('Error: ' + error.message)
    else {
      setForm(emptyForm)
      setShowForm(false)
      fetchClientes()
    }
    setSaving(false)
  }

  const filtered = clientes.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getEtapaStyle = (etapa: string) => {
    switch (etapa) {
      case 'NUEVO': return 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20'
      case 'ACTIVO': return 'bg-zinc-900 text-zinc-400 border-zinc-800'
      case 'ESTANCADO': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-zinc-900 text-zinc-400 border-zinc-800'
    }
  }

  return (
    <div className="text-zinc-100 font-sans">
      <div className="space-y-8">
        <header className="border-b border-zinc-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Base de Datos Central</span>
            <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-2">Directorio de Clientes</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-72 bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] text-zinc-100 placeholder-zinc-600 text-xs rounded-xl px-4 py-3 outline-none transition-colors"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-5 py-3 hover:bg-[#b8e600] transition-colors whitespace-nowrap"
            >
              {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
            </button>
          </div>
        </header>

        {showForm && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Registrar Nuevo Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder="Juan Pérez"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Email</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="juan@email.com"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Teléfono</label>
                <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})}
                  placeholder="8091234567"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Etapa</label>
                <select value={form.etapa} onChange={e => setForm({...form, etapa: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none">
                  <option value="NUEVO">NUEVO</option>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="ESTANCADO">ESTANCADO</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Presupuesto Min</label>
                <input value={form.presupuesto_min} onChange={e => setForm({...form, presupuesto_min: e.target.value})}
                  placeholder="150000"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Presupuesto Max</label>
                <input value={form.presupuesto_max} onChange={e => setForm({...form, presupuesto_max: e.target.value})}
                  placeholder="250000"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Próxima Acción</label>
                <input value={form.proxima_accion} onChange={e => setForm({...form, proxima_accion: e.target.value})}
                  placeholder="Llamar el lunes, enviar propiedades..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Notas</label>
                <input value={form.notas} onChange={e => setForm({...form, notas: e.target.value})}
                  placeholder="Busca apartamento en Piantini..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={agregarCliente} disabled={saving}
                className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-6 py-3 hover:bg-[#b8e600] transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Registrar Cliente'}
              </button>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Total Clientes</p>
            <p className="text-3xl font-black text-white mt-1">{loading ? '...' : clientes.length}</p>
          </div>
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Activos</p>
            <p className="text-3xl font-black text-[#CCFF00] mt-1">
              {loading ? '...' : clientes.filter(c => c.stage === 'ACTIVO').length}
            </p>
          </div>
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Estancados</p>
            <p className="text-3xl font-black text-red-400 mt-1">
              {loading ? '...' : clientes.filter(c => c.stage === 'ESTANCADO').length}
            </p>
          </div>
        </section>

        {loading ? (
          <div className="text-zinc-500 text-sm text-center py-20">Cargando clientes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-20">No hay clientes. Agrega el primero.</div>
        ) : (
          <section className="bg-zinc-950/40 rounded-2xl border border-zinc-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-4 pl-6">Cliente</th>
                    <th className="p-4">Presupuesto</th>
                    <th className="p-4">Etapa</th>
                    <th className="p-4">Proxima Accion</th>
                    <th className="p-4 pr-6 text-center">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-xs">
                  {filtered.map(cliente => (
                    <tr key={cliente.id} onClick={() => window.location.href = '/dashboard/clients/' + cliente.id}
                      className="hover:bg-zinc-900/20 transition-colors group cursor-pointer">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-white text-sm group-hover:text-[#CCFF00] transition-colors">{cliente.name}</div>
                        <div className="text-zinc-500 font-mono text-[11px] mt-0.5">{cliente.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-[#CCFF00] font-black font-mono">
                          {cliente.price ? 'US$ ' + Number(cliente.price).toLocaleString() : '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ' + getEtapaStyle(cliente.stage)}>
                          {cliente.stage || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-zinc-400 text-[11px]">{cliente.initial || '-'}</span>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          {cliente.phone && (
                            <a href={'https://wa.me/' + cliente.phone + '?text=' + encodeURIComponent('Hola ' + cliente.name + ', le contacto de parte de SECTOR. ¿Tiene un momento para conversar sobre propiedades de su interés?')} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="p-2 bg-zinc-900 hover:bg-[#CCFF00] border border-zinc-800 text-zinc-400 hover:text-black rounded-lg transition-all">
                              WA
                            </a>
                          )}
                          {cliente.phone && (
                            <a href={'tel:' + cliente.phone}
                              onClick={e => e.stopPropagation()}
                              className="p-2 bg-zinc-900 hover:bg-blue-500 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all">
                              Tel
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
