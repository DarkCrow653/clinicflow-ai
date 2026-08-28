"use client"

import Link from "next/link"
import { useState } from "react"
import DemoButton from "@/components/demo-button"

const BENEFITS = [
  {
    icon: "👥",
    title: "Gestión de Pacientes",
    description: "Organiza toda la información clínica de cada paciente en un solo lugar.",
  },
  {
    icon: "📅",
    title: "Agenda Inteligente",
    description: "Programa citas, controla el calendario y evita conflictos de horarios.",
  },
  {
    icon: "🦷",
    title: "Odontograma Interactivo",
    description: "Visualiza cada pieza dental y registra tratamientos de forma profesional.",
  },
  {
    icon: "📋",
    title: "Planes de Tratamiento",
    description: "Crea tratamientos completos con seguimiento del progreso.",
  },
  {
    icon: "💰",
    title: "Pagos y Presupuestos",
    description: "Genera presupuestos en PDF, registra pagos y controla saldos pendientes.",
  },
  {
    icon: "📊",
    title: "Dashboard Ejecutivo",
    description: "Consulta indicadores, ingresos, tratamientos activos y actividad reciente.",
  },
]

const STEPS = [
  { number: "01", title: "Registra tu clínica", description: "Crea tu cuenta y configura tu clínica en minutos." },
  { number: "02", title: "Agrega pacientes", description: "Importa o crea pacientes con toda su información clínica." },
  { number: "03", title: "Crea tratamientos y agenda citas", description: "Organiza el trabajo diario de tu clínica." },
  { number: "04", title: "Gestiona todo desde un panel", description: "Dashboard ejecutivo con todo lo que necesitas." },
]

const FEATURES = [
  {
    category: "Gestión",
    items: ["Pacientes", "Citas", "Servicios", "Calendario"],
  },
  {
    category: "Clínica Dental",
    items: ["Odontograma", "Historial Clínico", "Planes de Tratamiento", "Procedimientos Dentales"],
  },
  {
    category: "Finanzas",
    items: ["Presupuestos PDF", "Pagos", "Recibos", "Estado Financiero"],
  },
  {
    category: "Administración",
    items: ["Multiusuario", "Roles", "Auditoría", "Exportaciones CSV"],
  },
]

const FAQ = [
  {
    question: "¿Necesito instalar algo?",
    answer: "No. ClinicFlow funciona completamente desde el navegador, sin instalaciones ni configuraciones complejas.",
  },
  {
    question: "¿Puedo acceder desde cualquier dispositivo?",
    answer: "Sí. Es compatible con computadoras, tablets y móviles.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Sí. Cada clínica solo puede acceder a su propia información mediante autenticación segura y políticas de acceso estrictas.",
  },
  {
    question: "¿Puedo empezar gratis?",
    answer: "Sí. Existe un plan gratuito para comenzar a utilizar ClinicFlow sin ningún costo.",
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold">ClinicFlow</span>
            <span className="text-xs text-gray-400 ml-1">AI Dental</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-black">Funcionalidades</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-black">Planes</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-black">FAQ</a>
            <Link href="/login" className="text-sm text-gray-600 hover:text-black">Iniciar sesión</Link>
            <Link href="/signup" className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 transition">
              Comenzar Gratis
            </Link>
          </div>

          {/* Mobile: login + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/login" className="text-sm text-gray-600 hover:text-black px-2 py-1">
              Entrar
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-2">Funcionalidades</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-2">Planes</a>
            <a href="#faq" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 hover:text-black py-2">FAQ</a>
            <Link href="/signup" className="block text-center rounded-lg bg-black px-4 py-3 text-sm text-white hover:bg-gray-800 transition">
              Comenzar Gratis
            </Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* Texto */}
            <div className="space-y-5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs text-gray-600">
                🦷 Software para clínicas dentales
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Gestiona tu clínica dental desde un solo lugar.
              </h1>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                ClinicFlow te ayuda a organizar pacientes, citas, tratamientos, pagos y odontogramas en una plataforma moderna, rápida y fácil de usar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  href="/signup"
                  className="rounded-lg bg-black px-6 py-3 text-white font-medium hover:bg-gray-800 transition text-center"
                >
                  Comenzar Gratis
                </Link>
                <DemoButton className="rounded-lg border px-6 py-3 font-medium hover:bg-gray-50 transition text-center" />
              </div>
              <p className="text-xs text-gray-400">Sin tarjeta de crédito · Configuración en minutos</p>
            </div>

            {/* Dashboard Preview */}
            <div className="rounded-2xl border bg-gray-50 p-4 md:p-6 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold">Dashboard</span>
                <span className="text-xs text-gray-400 bg-white border rounded-full px-3 py-1">Admin</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Pacientes", value: "248" },
                  { label: "Citas hoy", value: "12" },
                  { label: "Ingresos", value: "$8,450" },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl bg-white border p-2 md:p-3 shadow-sm">
                    <p className="text-xs text-gray-400 truncate">{kpi.label}</p>
                    <p className="text-base md:text-xl font-bold mt-1">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white border p-3 md:p-4 shadow-sm space-y-2">
                <p className="text-sm font-semibold">Próximas Citas</p>
                {[
                  { name: "Juan Pérez", time: "09:00", service: "Limpieza" },
                  { name: "María López", time: "10:30", service: "Resina" },
                  { name: "Carlos Ruiz", time: "11:00", service: "Ortodoncia" },
                ].map((apt) => (
                  <div key={apt.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate">{apt.name}</span>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{apt.time} · {apt.service}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white border p-3 md:p-4 shadow-sm">
                <p className="text-sm font-semibold mb-2">Saldo Pendiente</p>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-400">Facturado</p>
                    <p className="font-bold text-sm">$24,800</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Cobrado</p>
                    <p className="font-bold text-sm text-green-600">$21,600</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pendiente</p>
                    <p className="font-bold text-sm text-red-600">$3,200</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">Todo lo que necesitas para tu clínica</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              Diseñado especialmente para odontólogos que quieren dejar de perder tiempo con papeleo y enfocarse en sus pacientes.
            </p>
          </div>

          {/* 1 col mobile, 2 tablet, 3 desktop */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition space-y-3"
              >
                <span className="text-3xl">{benefit.icon}</span>
                <h3 className="font-bold text-base md:text-lg">{benefit.title}</h3>
                <p className="text-gray-500 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="how-it-works" className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">Empieza en minutos</h2>
            <p className="text-gray-500 text-sm md:text-base">Sin configuraciones complejas ni instalaciones.</p>
          </div>

          <div className="space-y-6">
            {STEPS.map((step) => (
              <div key={step.number} className="flex gap-4 md:gap-6 items-start">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                <div className="flex-1 pt-1 md:pt-2">
                  <h3 className="font-bold text-base md:text-lg">{step.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="features" className="py-16 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">Todo incluido</h2>
            <p className="text-gray-500 text-sm md:text-base">Una plataforma completa para la gestión integral de tu clínica dental.</p>
          </div>

          {/* 2 col mobile, 4 desktop */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((group) => (
              <div key={group.category} className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm space-y-3 md:space-y-4">
                <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wide">{group.category}</h3>
                <ul className="space-y-1.5 md:space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-1.5 text-xs md:text-sm">
                      <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="pricing" className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">Planes simples y transparentes</h2>
            <p className="text-gray-500 text-sm md:text-base">Empieza gratis y escala cuando lo necesites.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* FREE */}
            <div className="rounded-2xl border bg-white p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold">Free</h3>
                <p className="text-3xl md:text-4xl font-bold mt-2">$0 <span className="text-gray-400 text-base font-normal">/ mes</span></p>
                <p className="text-gray-500 text-sm mt-2">Para clínicas que están comenzando.</p>
              </div>
              <ul className="space-y-3">
                {["Hasta 100 pacientes", "1 usuario", "Agenda", "Pacientes y Citas", "Calendario"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center rounded-lg bg-black px-6 py-3 text-white font-medium hover:bg-gray-800 transition"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* PRO */}
            <div className="rounded-2xl border-2 border-black bg-white p-6 md:p-8 shadow-sm space-y-6 relative">
              <div className="absolute -top-3 left-6">
                <span className="rounded-full bg-black text-white text-xs px-3 py-1 font-medium">Recomendado</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="text-3xl md:text-4xl font-bold mt-2">$29 <span className="text-gray-400 text-base font-normal">/ mes</span></p>
                <p className="text-gray-500 text-sm mt-2">Para clínicas que quieren crecer.</p>
              </div>
              <ul className="space-y-3">
                {[
                  "Pacientes ilimitados",
                  "Usuarios ilimitados",
                  "Dashboard Ejecutivo",
                  "Odontograma Interactivo",
                  "Planes de Tratamiento",
                  "Presupuestos en PDF",
                  "Pagos y Recibos",
                  "Exportaciones CSV",
                  "Gestión de Archivos",
                  "Auditoría completa",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="block w-full text-center rounded-lg border-2 border-black px-6 py-3 font-medium text-gray-400 cursor-not-allowed"
              >
                Próximamente
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, index) => (
              <div key={index} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left min-h-[56px]"
                >
                  <span className="font-medium text-sm md:text-base pr-4">{item.question}</span>
                  <span className="text-gray-400 text-xl flex-shrink-0">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <p className="text-gray-500 text-sm">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Empieza a modernizar tu clínica dental hoy.
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            Centraliza pacientes, tratamientos, citas, pagos y toda la gestión de tu clínica en una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="rounded-lg bg-black px-8 py-4 text-white font-medium text-base md:text-lg hover:bg-gray-800 transition text-center"
            >
              Comenzar Gratis
            </Link>
            <DemoButton className="rounded-lg border px-8 py-4 font-medium text-base md:text-lg hover:bg-gray-50 transition text-center" />
          </div>
          <p className="text-xs text-gray-400">Sin tarjeta de crédito · Configuración en minutos</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1 space-y-2">
              <p className="font-bold">ClinicFlow</p>
              <p className="text-xs text-gray-400">Software de gestión para clínicas dentales.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</p>
              <div className="space-y-1">
                <a href="#features" className="block text-xs text-gray-400 hover:text-black py-0.5">Funcionalidades</a>
                <a href="#pricing" className="block text-xs text-gray-400 hover:text-black py-0.5">Planes</a>
                <a href="#faq" className="block text-xs text-gray-400 hover:text-black py-0.5">FAQ</a>
                <a href="/roadmap" className="block text-xs text-gray-400 hover:text-black py-0.5">Roadmap</a>
                <a href="/changelog" className="block text-xs text-gray-400 hover:text-black py-0.5">Changelog</a>
                <a href="/status" className="block text-xs text-gray-400 hover:text-black py-0.5">Estado</a>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Legal</p>
              <div className="space-y-1">
                <a href="/privacy" className="block text-xs text-gray-400 hover:text-black py-0.5">Privacidad</a>
                <a href="/terms" className="block text-xs text-gray-400 hover:text-black py-0.5">Términos</a>
                <a href="/cookies" className="block text-xs text-gray-400 hover:text-black py-0.5">Cookies</a>
                <a href="/dpa" className="block text-xs text-gray-400 hover:text-black py-0.5">DPA</a>
                <a href="/medical-disclaimer" className="block text-xs text-gray-400 hover:text-black py-0.5">Aviso Médico</a>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Soporte</p>
              <div className="space-y-1">
                <a href="/contact" className="block text-xs text-gray-400 hover:text-black py-0.5">Contacto</a>
                <a href="mailto:soporte@clinicflow.ai" className="block text-xs text-gray-400 hover:text-black py-0.5">soporte@clinicflow.ai</a>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400 text-center md:text-left">© {new Date().getFullYear()} ClinicFlow AI. Todos los derechos reservados.</p>
            <p className="text-xs text-gray-400">Hecho para odontólogos 🦷</p>
          </div>
        </div>
      </footer>

    </div>
  )
}