"use client"

import Link from "next/link"
import { useState } from "react"

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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans scroll-smooth">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold">ClinicFlow</span>
            <span className="text-xs text-gray-400 ml-2">AI Dental</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-black hidden md:block">Funcionalidades</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-black hidden md:block">Planes</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-black hidden md:block">FAQ</a>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-black"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 transition"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs text-gray-600">
                🦷 Software para clínicas dentales
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Gestiona tu clínica dental desde un solo lugar.
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed">
                ClinicFlow te ayuda a organizar pacientes, citas, tratamientos, pagos y odontogramas en una plataforma moderna, rápida y fácil de usar.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/signup"
                  className="rounded-lg bg-black px-6 py-3 text-white font-medium hover:bg-gray-800 transition"
                >
                  Comenzar Gratis
                </Link>

                <Link
                  href="#how-it-works"
                  className="rounded-lg border px-6 py-3 font-medium hover:bg-gray-50 transition"
                >
                  Ver Demo
                </Link>
              </div>
              <p className="text-xs text-gray-400">
                Sin tarjeta de crédito · Configuración en minutos
              </p>
            </div>

            {/* DASHBOARD PREVIEW */}
            <div className="rounded-2xl border bg-gray-50 p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">Dashboard</span>
                <span className="text-xs text-gray-400 bg-white border rounded-full px-3 py-1">Admin</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Pacientes", value: "248" },
                  { label: "Citas hoy", value: "12" },
                  { label: "Ingresos mes", value: "$8,450" },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl bg-white border p-3 shadow-sm">
                    <p className="text-xs text-gray-400">{kpi.label}</p>
                    <p className="text-xl font-bold mt-1">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white border p-4 shadow-sm space-y-2">
                <p className="text-sm font-semibold">Próximas Citas</p>
                {[
                  { name: "Juan Pérez", time: "09:00", service: "Limpieza Dental" },
                  { name: "María López", time: "10:30", service: "Resina pieza 26" },
                  { name: "Carlos Ruiz", time: "11:00", service: "Ortodoncia" },
                ].map((apt) => (
                  <div key={apt.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{apt.name}</span>
                    <span className="text-xs text-gray-400">{apt.time} · {apt.service}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white border p-4 shadow-sm">
                <p className="text-sm font-semibold mb-2">Saldo Pendiente</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Total facturado</p>
                    <p className="font-bold">$24,800</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Cobrado</p>
                    <p className="font-bold text-green-600">$21,600</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pendiente</p>
                    <p className="font-bold text-red-600">$3,200</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Todo lo que necesitas para tu clínica</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Diseñado especialmente para odontólogos que quieren dejar de perder tiempo con papeleo y enfocarse en sus pacientes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition space-y-3"
              >
                <span className="text-3xl">{benefit.icon}</span>
                <h3 className="font-bold text-lg">{benefit.title}</h3>
                <p className="text-gray-500 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Empieza en minutos</h2>
            <p className="text-gray-500">Sin configuraciones complejas ni instalaciones.</p>
          </div>

          <div className="space-y-6">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{step.description}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="w-px h-12 bg-gray-200 absolute ml-6 mt-12" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Todo incluido</h2>
            <p className="text-gray-500">Una plataforma completa para la gestión integral de tu clínica dental.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((group) => (
              <div key={group.category} className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">{group.category}</h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500 font-bold">✓</span>
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
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Planes simples y transparentes</h2>
            <p className="text-gray-500">Empieza gratis y escala cuando lo necesites.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* FREE */}
            <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold">Free</h3>
                <p className="text-4xl font-bold mt-2">$0 <span className="text-gray-400 text-base font-normal">/ mes</span></p>
                <p className="text-gray-500 text-sm mt-2">Para clínicas que están comenzando.</p>
              </div>
              <ul className="space-y-3">
                {[
                  "Hasta 100 pacientes",
                  "1 usuario",
                  "Agenda",
                  "Pacientes y Citas",
                  "Calendario",
                ].map((item) => (
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
            <div className="rounded-2xl border-2 border-black bg-white p-8 shadow-sm space-y-6 relative">
              <div className="absolute -top-3 left-6">
                <span className="rounded-full bg-black text-white text-xs px-3 py-1 font-medium">Recomendado</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="text-4xl font-bold mt-2">$29 <span className="text-gray-400 text-base font-normal">/ mes</span></p>
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
      <section id="faq" className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border bg-white shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-medium">{item.question}</span>
                  <span className="text-gray-400 text-xl ml-4">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-500 text-sm">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Empieza a modernizar tu clínica dental hoy.
          </h2>
          <p className="text-gray-500 text-lg">
            Centraliza pacientes, tratamientos, citas, pagos y toda la gestión de tu clínica en una sola plataforma.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/signup"
              className="rounded-lg bg-black px-8 py-4 text-white font-medium text-lg hover:bg-gray-800 transition"
            >
              Comenzar Gratis
            </Link>

            <Link
              href="#how-it-works"
              className="rounded-lg border px-8 py-4 font-medium text-lg hover:bg-gray-50 transition"
            >
              Saber más
            </Link>
          </div>
          <p className="text-xs text-gray-400">Sin tarjeta de crédito · Configuración en minutos</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-2">
              <p className="font-bold">ClinicFlow</p>
              <p className="text-xs text-gray-400">Software de gestión para clínicas dentales.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</p>
              <div className="space-y-1">
                <a href="#features" className="block text-xs text-gray-400 hover:text-black">Funcionalidades</a>
                <a href="#pricing" className="block text-xs text-gray-400 hover:text-black">Planes</a>
                <a href="#faq" className="block text-xs text-gray-400 hover:text-black">FAQ</a>
                <a href="/roadmap" className="block text-xs text-gray-400 hover:text-black">Roadmap</a>
                <a href="/changelog" className="block text-xs text-gray-400 hover:text-black">Changelog</a>
                <a href="/status" className="block text-xs text-gray-400 hover:text-black">Estado del servicio</a>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Legal</p>
              <div className="space-y-1">
                <a href="/privacy" className="block text-xs text-gray-400 hover:text-black">Privacidad</a>
                <a href="/terms" className="block text-xs text-gray-400 hover:text-black">Términos</a>
                <a href="/cookies" className="block text-xs text-gray-400 hover:text-black">Cookies</a>
                <a href="/dpa" className="block text-xs text-gray-400 hover:text-black">DPA</a>
                <a href="/medical-disclaimer" className="block text-xs text-gray-400 hover:text-black">Aviso Médico</a>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Soporte</p>
              <div className="space-y-1">
                <a href="/contact" className="block text-xs text-gray-400 hover:text-black">Contacto</a>
                <a href="mailto:soporte@clinicflow.ai" className="block text-xs text-gray-400 hover:text-black">soporte@clinicflow.ai</a>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} ClinicFlow AI. Todos los derechos reservados.</p>
            <p className="text-xs text-gray-400">Hecho para odontólogos 🦷</p>
          </div>
        </div>
      </footer>

    </div>
  )
}