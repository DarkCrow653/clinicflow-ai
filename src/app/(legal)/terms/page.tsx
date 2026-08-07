export default function TermsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Términos y Condiciones</h1>
      <p className="text-gray-500 text-sm">Última actualización: {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</p>

      <h2>1. Aceptación de los términos</h2>
      <p>Al registrarte y utilizar ClinicFlow, aceptas estos Términos y Condiciones. Si no estás de acuerdo, no debes utilizar el servicio.</p>

      <h2>2. Uso permitido</h2>
      <p>ClinicFlow está diseñado exclusivamente para la gestión administrativa y clínica de consultorios médicos y dentales. Está prohibido:</p>
      <ul>
        <li>Utilizar la plataforma para actividades ilegales.</li>
        <li>Introducir datos falsos o maliciosos.</li>
        <li>Intentar acceder a datos de otras clínicas.</li>
        <li>Revender o sublicenciar el acceso a terceros.</li>
      </ul>

      <h2>3. Responsabilidades del usuario</h2>
      <p>El usuario es responsable de:</p>
      <ul>
        <li>Mantener seguras sus credenciales de acceso.</li>
        <li>La veracidad de la información que introduce.</li>
        <li>Obtener el consentimiento de sus pacientes para el tratamiento de sus datos.</li>
        <li>Cumplir con la normativa de protección de datos aplicable en su país.</li>
      </ul>

      <h2>4. Disponibilidad del servicio</h2>
      <p>ClinicFlow ofrece el servicio "tal como está". Nos esforzamos por mantener una disponibilidad del 99%, pero no garantizamos un servicio ininterrumpido. Realizaremos mantenimientos programados con previo aviso.</p>

      <h2>5. Propiedad intelectual</h2>
      <p>ClinicFlow y todo su contenido (diseño, código, marca) son propiedad exclusiva de sus creadores. Los datos introducidos por la clínica son propiedad de la clínica.</p>

      <h2>6. Cancelación de cuentas</h2>
      <p>Puedes cancelar tu cuenta en cualquier momento. Tendrás 30 días para exportar tus datos antes de que sean eliminados permanentemente.</p>

      <h2>7. Limitación de responsabilidad</h2>
      <p>ClinicFlow no será responsable de pérdidas de datos causadas por el usuario, interrupciones del servicio por causas de fuerza mayor, o decisiones clínicas tomadas basándose en la información registrada en la plataforma.</p>

      <h2>8. Ley aplicable</h2>
      <p>Estos términos se rigen por las leyes aplicables en la jurisdicción donde opera ClinicFlow. Cualquier disputa se resolverá mediante arbitraje o en los tribunales competentes.</p>

      <h2>9. Contacto</h2>
      <p>Para consultas legales: <strong>legal@clinicflow.ai</strong></p>
    </article>
  )
}