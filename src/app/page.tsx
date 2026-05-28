export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-5xl font-bold">
          ClinicFlow AI
        </h1>

        <p>
          SaaS para clínicas dentales
        </p>

        <div className="space-x-4">
          <a
            href="/login"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Login
          </a>

          <a
            href="/signup"
            className="rounded border px-4 py-2"
          >
            Signup
          </a>
        </div>
      </div>
    </div>
  )
}