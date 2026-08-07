export default function CookiesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Política de Cookies</h1>
      <p className="text-gray-500 text-sm">Última actualización: {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</p>

      <h2>¿Qué son las cookies?</h2>
      <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.</p>

      <h2>Cookies que utilizamos</h2>

      <h3>Cookies esenciales</h3>
      <p>Necesarias para el funcionamiento del sistema. Sin ellas, no puedes iniciar sesión ni usar la plataforma.</p>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Propósito</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>sb-auth-token</td>
            <td>Mantiene tu sesión activa</td>
            <td>7 días</td>
          </tr>
          <tr>
            <td>sb-refresh-token</td>
            <td>Renueva tu sesión automáticamente</td>
            <td>30 días</td>
          </tr>
        </tbody>
      </table>

      <h3>Cookies analíticas</h3>
      <p>Actualmente no utilizamos cookies analíticas. Si en el futuro integramos herramientas de análisis, actualizaremos esta política y solicitaremos tu consentimiento.</p>

      <h2>Cómo gestionar las cookies</h2>
      <p>Puedes controlar y eliminar las cookies desde la configuración de tu navegador. Ten en cuenta que desactivar las cookies esenciales impedirá el funcionamiento correcto de ClinicFlow.</p>

      <h2>Contacto</h2>
      <p>Para consultas sobre cookies: <strong>privacidad@clinicflow.ai</strong></p>
    </article>
  )
}