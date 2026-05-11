'use client'

import './globals.css'
import Sidebar from './components/Sidebar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-black antialiased text-white">
        <div className="flex min-h-screen">
          {/* El Sidebar debe tener sus propias reglas de 'hidden lg:block' adentro */}
          <Sidebar /> 
          
          {/* 
              ml-0: En móvil no hay margen izquierdo.
              lg:ml-64: Solo en pantallas grandes (Desktop) se aplica el margen.
          */}
          <main className="flex-1 ml-0 lg:ml-64 bg-[#050505] min-h-screen w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
