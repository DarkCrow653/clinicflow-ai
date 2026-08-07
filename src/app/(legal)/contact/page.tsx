"use client"

import { useState } from "react"

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", type: "soporte", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Por ahora solo simula el envío
    setSent(true)
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Contacto</h1>
        <p className="text-gray-500 mt-2">Estamos aquí para ayudarte.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: "💬", title: "Soporte técnico", desc: "Problemas con la plataforma.", email: "soporte@clinicflow.ai" },
          { icon: "💼", title: "Consultas comerciales", desc: "Planes, precios y demos.", email: "ventas@clinicflow.ai" },
          { icon: "🔒", title: "Privacidad y datos", desc: "Solicitudes relacionadas con tus datos.", email: "privacidad@clinicflow.ai" },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border bg-white p-6 shadow-sm space-y-2">
            <span className="text-3xl">{item.icon}</span>
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
            <a href={`mailto:${item.email}`} className="text-sm font-medium hover:underline">
              {item.email}
            </a>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-6 max-w-xl">
        <h2 className="text-2xl font-bold">Formulario de contacto</h2>

        {sent ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center space-y-2">
            <p className="text-2xl">✅</p>
            <p className="font-semibold text-green-800">Mensaje enviado</p>
            <p className="text-sm text-green-600">Te responderemos en menos de 24 horas.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Nombre *</label>
              <input
                required
                className="w-full rounded border p-2 mt-1 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email *</label>
              <input
                required
                type="email"
                className="w-full rounded border p-2 mt-1 text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Tipo de consulta</label>
              <select
                className="w-full rounded border p-2 mt-1 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="soporte">Soporte técnico</option>
                <option value="comercial">Consulta comercial</option>
                <option value="privacidad">Privacidad y datos</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Mensaje *</label>
              <textarea
                required
                className="w-full rounded border p-2 mt-1 text-sm min-h-[120px]"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="rounded bg-black px-6 py-2 text-white text-sm hover:bg-gray-800"
            >
              Enviar mensaje
            </button>
          </form>
        )}
      </div>
    </div>
  )
}