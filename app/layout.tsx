'use client'
import './globals.css'
import AuthGuard from './components/AuthGuard'
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const esDashboard = pathname?.startsWith('/dashboard')

  return (
    <html lang="es" className="bg-zinc-950" style={{ backgroundColor: '#09090b' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#09090b" />
        <title>SECTOR - Sistema de Inventario para Constructoras</title>
      </head>
      <body className="bg-zinc-950 antialiased text-white overflow-x-hidden" style={{ backgroundColor: '#09090b' }}>
        <AuthGuard>
          {esDashboard ? (
            // Si está en el área de dashboard, renderiza directo para heredar el layout neón
            children
          ) : (
            // Si está fuera (landing, login, etc), usa el contenedor normal
            <div className="min-h-screen">{children}</div>
          )}
        </AuthGuard>
      </body>
    </html>
  )
}