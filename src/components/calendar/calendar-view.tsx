"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { useRef, useState } from "react"

type Event = {
  id?: string
  title: string
  date: string
  status?: string
  duration?: number // minutos
  serviceName?: string
}

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  pending:   { bg: "#f59e0b", border: "#d97706" },
  confirmed: { bg: "#3b82f6", border: "#2563eb" },
  completed: { bg: "#10b981", border: "#059669" },
  cancelled: { bg: "#ef4444", border: "#dc2626" },
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
}

type Props = {
  events: Event[]
  onEventDrop?: (id: string, newDate: string) => void
}

export default function CalendarView({ events, onEventDrop }: Props) {
  const calendarRef = useRef<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const calendarEvents = events.map((event) => {
    const colors = STATUS_COLORS[event.status || "pending"]
    const durationMinutes = event.duration || 30

    return {
      id: event.id || "",
      title: event.title,
      start: event.date,
      // 👇 NUEVO — duración real de la cita
      end: new Date(new Date(event.date).getTime() + durationMinutes * 60000).toISOString(),
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: "#ffffff",
      extendedProps: {
        status: event.status,
        serviceName: event.serviceName,
        duration: durationMinutes,
      },
    }
  })

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">

      {/* LEYENDA */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: "Pendiente",  color: "#f59e0b" },
          { label: "Confirmada", color: "#3b82f6" },
          { label: "Completada", color: "#10b981" },
          { label: "Cancelada",  color: "#ef4444" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* MODAL DE DETALLE AL HACER CLICK 👇 */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-white p-6 shadow-xl w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-black text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Fecha:</span>{" "}
                {new Date(selectedEvent.date).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p>
                <span className="font-medium">Hora:</span>{" "}
                {new Date(selectedEvent.date).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {selectedEvent.duration && (
                <p>
                  <span className="font-medium">Duración:</span>{" "}
                  {selectedEvent.duration} min
                </p>
              )}
              {selectedEvent.serviceName && (
                <p>
                  <span className="font-medium">Servicio:</span>{" "}
                  {selectedEvent.serviceName}
                </p>
              )}
              {selectedEvent.status && (
                <p>
                  <span className="font-medium">Estado:</span>{" "}
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs text-white"
                    style={{ backgroundColor: STATUS_COLORS[selectedEvent.status]?.bg }}
                  >
                    {STATUS_LABELS[selectedEvent.status]}
                  </span>
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full rounded bg-black py-2 text-sm text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
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
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:15:00"
        slotLabelInterval="01:00:00"
        allDaySlot={false}
        nowIndicator={true}
        events={calendarEvents}
        height="80vh"
        eventDisplay="block"

        // 👇 NUEVO — click para ver detalle
        eventClick={(info) => {
          const event = events.find((e) => e.id === info.event.id)
          if (event) setSelectedEvent(event)
        }}

        // 👇 NUEVO — drag & drop para reagendar
        editable={!!onEventDrop}
        droppable={!!onEventDrop}
        eventDrop={(info) => {
          if (onEventDrop && info.event.id) {
            onEventDrop(info.event.id, info.event.start?.toISOString() || "")
          }
        }}

        // 👇 Estilos del slot de tiempo
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}

        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />
    </div>
  )
}