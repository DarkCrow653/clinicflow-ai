import Link from "next/link"

const links = [
  { href: "/privacy", label: "Privacidad" },
  { href: "/terms", label: "Términos" },
  { href: "/cookies", label: "Cookies" },
  { href: "/dpa", label: "DPA" },
  { href: "/medical-disclaimer", label: "Descargo médico" },
  { href: "/contact", label: "Contacto" },
  { href: "/status", label: "Estado" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/changelog", label: "Changelog" },
]

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col px-6 py-12">
        <nav className="mb-8 flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm">
          <Link href="/" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Inicio
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <main className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  )
}
