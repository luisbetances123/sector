'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function CalendarPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">CALENDARIO</h1>
      <p className="text-white mt-4">Cargando...</p>
    </div>
  )
}
