"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

type Event = {
  title: string
  date: string
  status?: string // 👈 NUEVO
}

// 👇 Colores por estado
const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  pending:   { bg: "#f59e0b", border: "#d97706" },
  confirmed: { bg: "#3b82f6", border: "#2563eb" },
  completed: { bg: "#10b981", border: "#059669" },
  cancelled: { bg: "#ef4444", border: "#dc2626" },
}

export default function CalendarView({ events }: { events: Event[] }) {

  // 👇 Mapea eventos con color según estado
  const calendarEvents = events.map((event) => {
    const colors = STATUS_COLORS[event.status || "pending"]
    return {
      title: event.title,
      date: event.date,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: "#ffffff",
    }
  })

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      {/* LEYENDA DE ESTADOS 👇 */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {[
          { label: "Pendiente",  color: "#f59e0b" },
          { label: "Confirmada", color: "#3b82f6" },
          { label: "Completada", color: "#10b981" },
          { label: "Cancelada",  color: "#ef4444" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </div>
        ))}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={calendarEvents}
        height="80vh"
        eventDisplay="block"
      />
    </div>
  )
}