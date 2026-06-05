'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Sun, 
  Users, 
  Building2, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  ChevronDown, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

// — Typewriter hook nativo original
function useTypewriter(text: string, speed = 40, delay = 500) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return { displayed, done };
}

// — FadeIn component nativo original
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`
    }}>
      {children}
    </div>
  );
}

// DICCIONARIO DE IDIOMAS DE ALTO NIVEL
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
  const { displayed: typedH1b } = useTypewriter(t.hero.h1b, 50, 600);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 font-sans antialiased selection:bg-[#d5fd51]/30 selection:text-[#d5fd51] overflow-x-hidden">
      
      {/* CINTILLO PRELANZAMIENTO ROBINHOOD */}
      <div className="bg-[#d5fd51]/10 border-b border-[#d5fd51]/20 py-2.5 px-4 text-center relative z-50">
        <p className="text-[#d5fd51] text-xs font-bold uppercase tracking-widest">{t.prelaunsch}</p>
      </div>

      {/* GRADIENTES FLUIDOS DE INTERFAZ FINANCIERA */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#d5fd51]/5 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-[#eb522a]/3 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none" />

      {/* NAVBAR */}
      <header className="border-b border-zinc-900 bg-[#090a0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tighter text-white">
              HOM<span className="text-[#d5fd51]">VI</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-[#d5fd51] transition-colors">{t.nav.features}</a>
            <a href="#faq" className="hover:text-[#d5fd51] transition-colors">{t.nav.faq}</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="text-xs font-bold bg-zinc-900/60 border border-zinc-800 hover:border-[#d5fd51]/30 px-3 py-1.5 rounded-lg text-zinc-300 transition-all"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <a 
              href="#report" 
              className="bg-[#d5fd51] hover:bg-[#c2eb42] text-[#090a0f] text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#d5fd51]/10"
            >
              {t.nav.cta}
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION COMPLETO */}
      <section className="relative pt-24 pb-28 md:pt-36 md:pb-44 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#d5fd51]/10 text-[#d5fd51] border border-[#d5fd51]/20 mb-8 backdrop-blur-md">
            {t.hero.badge}
          </div>
        </FadeIn>
        
        <FadeIn delay={200}>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-8">
            {t.hero.h1a} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d5fd51] to-white min-h-[1.2em] inline-block">
              {typedH1b}
              <span className="animate-ping ml-1 text-[#d5fd51]">|</span>
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={400}>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed mb-12">
            {t.hero.desc}
          </p>
        </FadeIn>

        <FadeIn delay={600}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <a 
              href="#report" 
              className="px-8 py-4 bg-[#d5fd51] hover:bg-[#c2eb42] text-[#090a0f] font-bold rounded-xl transition-all shadow-lg shadow-[#d5fd51]/20 hover:scale-[1.02] text-center"
            >
              {t.hero.btnPrimary}
            </a>
            <a 
              href="#features" 
              className="px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-semibold rounded-xl border border-zinc-800 hover:border-[#eb522a]/40 transition-all text-center"
            >
              {t.hero.btnSecondary}
            </a>
          </div>
        </FadeIn>
      </section>

      {/* SECCIÓN DETALLADA DE CARACTERÍSTICAS CORPORATIVAS */}
      <section id="features" className="py-28 border-t border-zinc-900 bg-zinc-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">{t.features.title}</h2>
              <p className="text-zinc-400 text-lg">{t.features.subtitle}</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <FadeIn delay={100} className="flex">
              <div className="bg-zinc-900/30 border border-zinc-800/60 p-8 rounded-2xl hover:border-[#d5fd51]/30 transition-all group flex flex-col justify-between w-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#d5fd51]/10 border border-[#d5fd51]/20 flex items-center justify-center text-[#d5fd51] font-bold mb-6 group-hover:bg-[#d5fd51] group-hover:text-[#090a0f] transition-all">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t.features.f1Title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{t.features.f1Desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#d5fd51] opacity-0 group-hover:opacity-100 transition-opacity">
                  Trading Activo <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </FadeIn>

            {/* Card 2 */}
            <FadeIn delay={200} className="flex">
              <div className="bg-zinc-900/30 border border-zinc-800/60 p-8 rounded-2xl hover:border-[#d5fd51]/30 transition-all group flex flex-col justify-between w-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#d5fd51]/10 border border-[#d5fd51]/20 flex items-center justify-center text-[#d5fd51] font-bold mb-6 group-hover:bg-[#d5fd51] group-hover:text-[#090a0f] transition-all">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t.features.f2Title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{t.features.f2Desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#d5fd51] opacity-0 group-hover:opacity-100 transition-opacity">
                  Optimización Movil <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </FadeIn>

            {/* Card 3 */}
            <FadeIn delay={300} className="flex">
              <div className="bg-zinc-900/30 border border-zinc-800/60 p-8 rounded-2xl hover:border-[#d5fd51]/30 transition-all group flex flex-col justify-between w-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#d5fd51]/10 border border-[#d5fd51]/20 flex items-center justify-center text-[#d5fd51] font-bold mb-6 group-hover:bg-[#d5fd51] group-hover:text-[#090a0f] transition-all">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{t.features.f3Title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{t.features.f3Desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#d5fd51] opacity-0 group-hover:opacity-100 transition-opacity">
                  Libro de Órdenes <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECCIÓN LEAD MAGNET - CAPTURA DE REPORTES */}
      <section id="report" className="py-28 border-t border-zinc-900 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d5fd51]/2 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeIn>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">{t.reportSection.title}</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-14">{t.reportSection.subtitle}</p>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="bg-[#13151a] border border-zinc-800 p-8 sm:p-14 rounded-3xl max-w-xl mx-auto shadow-2xl relative">
              <div className="absolute top-0 right-12 w-24 h-px bg-gradient-to-r from-transparent to-[#d5fd51]/40" />
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input 
                    type="text" 
                    placeholder={t.reportSection.placeholderName}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#090a0f] border border-zinc-800 focus:border-[#d5fd51] focus:ring-1 focus:ring-[#d5fd51] text-zinc-100 rounded-xl px-4 py-4 text-sm transition-all outline-none"
                  />
                  <input 
                    type="email" 
                    placeholder={t.reportSection.placeholderEmail}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#090a0f] border border-zinc-800 focus:border-[#d5fd51] focus:ring-1 focus:ring-[#d5fd51] text-zinc-100 rounded-xl px-4 py-4 text-sm transition-all outline-none"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-[#d5fd51] hover:bg-[#c2eb42] text-[#090a0f] font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#d5fd51]/10 hover:scale-[1.01] mt-2 text-sm uppercase tracking-wider"
                  >
                    {t.reportSection.btn}
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center flex flex-col items-center gap-4">
                  <CheckCircle2 className="w-12 h-12 text-[#d5fd51]" />
                  <p className="text-zinc-200 font-medium text-lg leading-relaxed max-w-md">{t.reportSection.success}</p>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECCIÓN FAQ INTEGRA */}
      <section id="faq" className="py-28 border-t border-zinc-900 bg-zinc-950/20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white text-center mb-20">{t.faq.title}</h2>
          </FadeIn>
          
          <div className="space-y-6">
            <FadeIn delay={100}>
              <div className="bg-[#13151a]/40 border border-zinc-900 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                  <span className="text-[#d5fd51]">•</span> {t.faq.q1}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed pl-4">{t.faq.a1}</p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="bg-[#13151a]/40 border border-zinc-900 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                  <span className="text-[#d5fd51]">•</span> {t.faq.q2}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed pl-4">{t.faq.a2}</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="bg-[#13151a]/40 border border-zinc-900 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                  <span className="text-[#d5fd51]">•</span> {t.faq.q3}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed pl-4">{t.faq.a3}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FOOTER CORPORATIVO */}
      <footer className="border-t border-zinc-900 bg-[#090a0f] py-12 text-center text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400">
          <span className="font-bold text-white">HOM<span className="text-[#d5fd51]">VI</span></span>
          <p>© {new Date().getFullYear()} HOMVI. Todos los derechos reservados. Diseñado para Top Producers en SD.</p>
        </div>
      </footer>

    </div>
  );
}