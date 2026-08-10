import { cn } from "@/lib/utils"

// 👇 Componente base — NO se modifica
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }

// =============================================
// 👇 Skeletons específicos — se agregan abajo
// =============================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-10">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-6 w-40" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PatientListSkeleton() {
  return (
    <div className="space-y-8 p-10">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AppointmentListSkeleton() {
  return (
    <div className="space-y-8 p-10">
      <Skeleton className="h-10 w-24" />
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-48" />
            {[1, 2].map((j) => (
              <div key={j} className="rounded-2xl border bg-white p-4 shadow-sm flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PatientDetailSkeleton() {
  return (
    <div className="space-y-6 p-10">
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-28 rounded" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-9 w-32 rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ServicesListSkeleton() {
  return (
    <div className="space-y-8 p-10">
      <div className="space-y-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}