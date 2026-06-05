'use client';

import { useState } from 'react';

// 1. DICCIONARIO DE IDIOMAS (TEXTOS PREMIUM)
const content = {
  es: {
    nav: { features: 'Funciones', faq: 'FAQ', cta: 'Solicitar Acceso' },
    prelaunsch: '🚀 FASE DE PRELANZAMIENTO — Cupos limitados para la Beta Privada en RD',
    hero: {
      badge: '🇩🇴 CRM & Inteligencia Inmobiliaria · Santo Domingo',
      h1a: 'El sistema definitivo para los',
      h1b: 'Top Producers.',
      desc: 'Deja de pelear con hojas de cálculo y herramientas genéricas. Gestiona tu cartera del Polígono Central con emparejamiento bimonetario, bitácoras inteligentes y control absoluto de tus cierres.',
      btnPrimary: 'Obtener Reporte + Acceso Beta',
      btnSecondary: 'Ver Funciones',
    },
    features: {
      title: 'Diseñado para la velocidad del mercado dominicano',
      subtitle: 'Deja atrás los sistemas genéricos. Homvi entiende las dinámicas reales de los Brokers en Santo Domingo.',
      f1Title: 'Matching Bimonetario Automático',
      f1Desc: 'Cruza requerimientos en USD y DOP al instante. El sistema calcula tasas y encuentra la coincidencia perfecta sin errores de conversión.',
      f2Title: 'Bitácoras de Seguimiento Inteligentes',
      f2Desc: 'Registra interacciones en segundos desde tu móvil. Historial limpio por cliente para saber exactamente cuándo reactivar un lead.',
      f3Title: 'Control de Cierres e Histórico',
      f3Desc: 'Visualiza tus comisiones proyectadas, divide honorarios con cobrokers y mantén un registro histórico impecable de cada propiedad.',
    },
    reportSection: {
      title: 'Descarga el Reporte Inmobiliario del Polígono Central 2026',
      subtitle: 'Analizamos más de 500 propiedades en Naco, Piantini y Bella Vista. Descubre las tendencias de precios, zonas de mayor absorción y datos reales para cerrar más exclusivas.',
      placeholderName: 'Tu nombre completo',
      placeholderEmail: 'Tu correo profesional',
      btn: 'Enviar Reporte + Aplicar a la Beta',
      success: '🎉 ¡Registro completado! Hemos enviado el reporte a tu correo y guardado tu cupo para la Beta Privada.',
    },
    faq: {
      title: 'Preguntas Frecuentes',
      q1: '¿Qué es la Beta Privada y quién puede entrar?',
      a1: 'Es un acceso anticipado y exclusivo para un grupo selecto de Brokers independientes y agencias "Top Producers" en Santo Domingo. Buscamos feedback real antes del lanzamiento oficial.',
      q2: '¿El reporte inmobiliario es gratuito?',
      a2: 'Sí. Es un análisis de datos real recopilado por nuestro algoritmo de inteligencia inmobiliaria sobre el comportamiento del Polígono Central. Te llegará directo al correo al registrarte.',
      q3: '¿Cómo funciona el soporte local?',
      a3: 'Homvi es desarrollado localmente. Entendemos el mercado de RD (tasas, cobrokeraje, zonas). Tendrás soporte directo vía WhatsApp sin lidiar con bots internacionales.',
    }
  },
  en: {
    nav: { features: 'Features', faq: 'FAQ', cta: 'Request Access' },
    prelaunsch: '🚀 PRE-LAUNCH PHASE — Limited slots for Private Beta in RD',
    hero: {
      badge: '🇩🇴 CRM & Real Estate Intelligence · Santo Domingo',
      h1a: 'The definitive system for',
      h1b: 'Top Producers.',
      desc: 'Stop fighting with spreadsheets and generic tools. Manage your portfolio of the Polígono Central with bi-currency matching, smart logs, and absolute control over your closings.',
      btnPrimary: 'Get Report + Beta Access',
      btnSecondary: 'View Features',
    },
    features: {
      title: 'Built for the speed of the Dominican market',
      subtitle: 'Leave generic software behind. Homvi understands the real dynamics of Brokers in Santo Domingo.',
      f1Title: 'Automatic Bi-Currency Matching',
      f1Desc: 'Match requirements in USD and DOP instantly. The system calculates rates and finds the perfect match without conversion errors.',
      f2Title: 'Smart Tracking Logs',
      f2Desc: 'Log interactions in seconds from your mobile. Clean history per client to know exactly when to reactivate a lead.',
      f3Title: 'Closing Control & Historical Records',
      f3Desc: 'Visualize your projected commissions, split fees with co-brokers, and keep an impeccable historical record of every property.',
    },
    reportSection: {
      title: 'Download the 2026 Polígono Central Real Estate Report',
      subtitle: 'We analyzed over 500 properties in Naco, Piantini, and Bella Vista. Discover price trends, highest absorption areas, and real data to close more exclusive listings.',
      placeholderName: 'Your full name',
      placeholderEmail: 'Your professional email',
      btn: 'Send Report + Apply for Beta',
      success: '🎉 Registration complete! We have sent the report to your email and reserved your spot for the Private Beta.',
    },
    faq: {
      title: 'Frequently Asked Questions',
      q1: 'What is the Private Beta and who can join?',
      a1: 'It is an exclusive, early access program for a select group of independent Brokers and "Top Producer" agencies in Santo Domingo. We look for real feedback before the official launch.',
      q2: 'Is the real estate report free?',
      a2: 'Yes. It is a real data analysis compiled by our real estate intelligence algorithm regarding the behavior of the Polígono Central. It will be sent directly to your email upon registration.',
      q3: 'How does local support work?',
      a3: 'Homvi is developed locally. We understand the DR market (rates, co-brokering, sectors). You will have direct support via WhatsApp without dealing with international bots.',
    }
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const t = content[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#040806] text-zinc-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-400 overflow-x-hidden">
      
      {/* 2. CINTILLO DE PRELANZAMIENTO FINANCIERO */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 px-4 text-center">
        <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{t.prelaunsch}</p>
      </div>

      {/* GRADIENTES DE FONDO ESTILO ROBINHOOD */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-emerald-600/3 rounded-full blur-[100px] animate-pulse delay-1000 pointer-events-none" />

      {/* NAVBAR */}
      <header className="border-b border-zinc-900 bg-[#040806]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tighter text-white">
              HOM<span className="text-emerald-400">VI</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">{t.nav.features}</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">{t.nav.faq}</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Selector de idioma minimalista */}
            <button 
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="text-xs font-bold bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg text-zinc-300 transition-all"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <a 
              href="#report" 
              className="bg-emerald-500 hover:bg-emerald-600 text-[#040806] text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
            >
              {t.nav.cta}
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-8 backdrop-blur-md">
          {t.hero.badge}
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-8">
          {t.hero.h1a} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">{t.hero.h1b}</span>
        </h1>

        <p className="text-zinc-400 text-lg sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed mb-12">
          {t.hero.desc}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
          <a 
            href="#report" 
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-[#040806] font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] text-center"
          >
            {t.hero.btnPrimary}
          </a>
          <a 
            href="#features" 
            className="px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-semibold rounded-xl border border-zinc-800 hover:border-orange-500/30 transition-all text-center"
          >
            {t.hero.btnSecondary}
          </a>
        </div>
      </section>

      {/* SECTION: FEATURES */}
      <section id="features" className="py-24 border-t border-zinc-900 bg-zinc-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">{t.features.title}</h2>
            <p className="text-zinc-400 text-lg">{t.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mb-6 group-hover:bg-emerald-500 group-hover:text-[#040806] transition-all">
                $
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.features.f1Title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{t.features.f1Desc}</p>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mb-6 group-hover:bg-emerald-500 group-hover:text-[#040806] transition-all">
                ✏️
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.features.f2Title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{t.features.f2Desc}</p>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mb-6 group-hover:bg-emerald-500 group-hover:text-[#040806] transition-all">
                📊
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.features.f3Title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{t.features.f3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: CAPTURA DE REPORTES */}
      <section id="report" className="py-24 border-t border-zinc-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/2 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">{t.reportSection.title}</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-12">{t.reportSection.subtitle}</p>

          <div className="bg-zinc-900/80 border border-zinc-800 p-8 sm:p-12 rounded-3xl max-w-xl mx-auto shadow-2xl">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder={t.reportSection.placeholderName}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-100 rounded-xl px-4 py-3.5 text-sm transition-all outline-none"
                />
                <input 
                  type="email" 
                  placeholder={t.reportSection.placeholderEmail}
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-100 rounded-xl px-4 py-3.5 text-sm transition-all outline-none"
                />
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#040806] font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:scale-[1.01]"
                >
                  {t.reportSection.btn}
                </button>
              </form>
            ) : (
              <div className="py-6 text-center">
                <p className="text-emerald-400 font-semibold text-lg">{t.reportSection.success}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION: FAQ */}
      <section id="faq" className="py-24 border-t border-zinc-900 bg-zinc-950/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white text-center mb-16">{t.faq.title}</h2>
          
          <div className="space-y-8">
            <div className="border-b border-zinc-900 pb-6">
              <h3 className="text-lg font-bold text-white mb-3">{t.faq.q1}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{t.faq.a1}</p>
            </div>
            <div className="border-b border-zinc-900 pb-6">
              <h3 className="text-lg font-bold text-white mb-3">{t.faq.q2}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{t.faq.a2}</p>
            </div>
            <div className="border-b border-zinc-900 pb-6">
              <h3 className="text-lg font-bold text-white mb-3">{t.faq.q3}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{t.faq.a3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} HOMVI. Todos los derechos reservados. Diseñado para Top Producers en SD.</p>
      </footer>

    </div>
  );
}