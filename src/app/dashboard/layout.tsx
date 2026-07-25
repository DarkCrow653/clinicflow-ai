import Sidebar from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex bg-gray-100"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <aside style={{ height: "100dvh", overflow: "hidden", flexShrink: 0 }}>
        <Sidebar />
      </aside>

      <main style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  )
}