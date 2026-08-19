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
        <aside style={{ height: "100%", overflow: "hidden", flexShrink: 0 }}>
          <Sidebar />
        </aside>

        <main style={{ flex: 1, overflowY: "auto" }}>
          <PlanBanner />
          {children}
        </main>
      </div>
    </div>
  )
}