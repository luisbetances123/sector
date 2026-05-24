import './globals.css'
import AuthGuard from './components/AuthGuard'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-zinc-950" style={{ backgroundColor: '#09090b' }}>
      <head>
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className="bg-zinc-950 antialiased text-white overflow-x-hidden" style={{ backgroundColor: '#09090b' }}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}