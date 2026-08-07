import Link from "next/link"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">ClinicFlow</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-black">← Volver al inicio</Link>
      </nav>

      {/* CONTENIDO */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        {children}
      </div>

      {/* FOOTER LEGAL */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-4 justify-center text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-black">Privacidad</Link>
          <Link href="/terms" className="hover:text-black">Términos</Link>
          <Link href="/cookies" className="hover:text-black">Cookies</Link>
          <Link href="/dpa" className="hover:text-black">DPA</Link>
          <Link href="/medical-disclaimer" className="hover:text-black">Aviso Médico</Link>
          <Link href="/contact" className="hover:text-black">Contacto</Link>
          <Link href="/status" className="hover:text-black">Estado</Link>
          <Link href="/roadmap" className="hover:text-black">Roadmap</Link>
          <Link href="/changelog" className="hover:text-black">Changelog</Link>
        </div>
      </footer>
    </div>
  )
}