"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

type Event = {
  title: string
  date: string
}

export default function CalendarView({
  events,
}: {
  events: Event[]
}) {
  return (
    <div className="rounded bg-white p-4">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
        ]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right:
            "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        height="80vh"
      />
    </div>
  )
}