return (
    <div className="flex min-h-screen overflow-x-hidden">
      {!isLanding && !isPublic && <Sidebar />}
      <main className={`flex-1 min-w-0 bg-[#050505] min-h-screen overflow-x-hidden ${!isLanding && !isPublic ? 'pb-16 md:pb-0' : ''}`}>
        {children}
      </main>
      {!isLanding && !isPublic && <MobileNav />}
    </div>
  )