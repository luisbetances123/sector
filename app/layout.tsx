import './globals.css'
import AuthGuard from './components/AuthGuard'

// Esto le grita al iPhone que use los píxeles reales y no achique la pantalla
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata = {
  title: 'HOMVI',
  description: 'CRM Inmobiliario',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-zinc-950" style={{ backgroundColor: '#09090b' }}>
      <head>
        {/* Doble candado para obligar al iPhone a agigantar la pantalla de una vez por todas */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className="bg-zinc-950 antialiased text-white overflow-x-hidden" style={{ backgroundColor: '#09090b' }}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}