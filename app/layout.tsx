import './globals.css'
import AuthGuard from './components/AuthGuard'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black antialiased text-white overflow-x-hidden">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}
