'use client'
import React from 'react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Retorna directamente los children para que no dibuje el sidebar viejo a la izquierda
  return <>{children}</>
}