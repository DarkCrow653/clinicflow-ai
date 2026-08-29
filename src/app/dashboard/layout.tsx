import Sidebar from "@/components/dashboard/sidebar"
import PlanBanner from "@/components/dashboard/plan-banner"
import DemoBanner from "@/components/dashboard/demo-banner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col bg-gray-100"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — oculto en móvil, visible en desktop */}
        <aside className="hidden md:flex h-full shrink-0 overflow-hidden">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Topbar móvil — solo visible en móvil */}
          <MobileTopbar />
          <PlanBanner />
          {children}
        </main>
      </div>
    </div>
  )
}

// 👇 Importamos el topbar aquí para mantener el layout server component
import MobileTopbar from "@/components/dashboard/mobile-topbar"