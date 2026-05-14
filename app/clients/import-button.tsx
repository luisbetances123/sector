'use client';
import React from 'react';
import { Upload } from 'lucide-react';

export default function ImportButton() {
  return (
    <button 
      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-700 transition-all text-sm font-medium"
      onClick={() => alert('Función de importación: Selecciona tu archivo Excel o CSV.')}
    >
      <Upload className="w-4 h-4 text-amber-500" />
      Importar desde Excel/CRM
    </button>
  );
}
