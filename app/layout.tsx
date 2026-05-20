'use client'
import './globals.css'
import { usePathname } from 'next/navigation'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLanding = pathname === '/landing'
  return (
    <html lang="es">
      <body className="bg-black antialiased text-white">
        <div className="flex min-h-screen">
          {!isLanding && <Sidebar />}
          <main className="flex-1 bg-[#050505] min-h-screen pb-16 md:pb-0">
            {children}
          </main>
        </div>
        {!isLanding && <MobileNav />}
      </body>
    </html>
  )
}
