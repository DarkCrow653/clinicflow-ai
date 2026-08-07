export default function PrivacyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Política de Privacidad</h1>
      <p className="text-gray-500 text-sm">Última actualización: {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</p>

      <h2>1. ¿Quiénes somos?</h2>
      <p>ClinicFlow AI es una plataforma de gestión clínica diseñada para clínicas dentales y médicas. Al utilizar nuestros servicios, confías en nosotros con tu información y la de tus pacientes. Nos comprometemos a proteger esa confianza.</p>

      <h2>2. Datos que recopilamos</h2>
      <p>Recopilamos únicamente los datos necesarios para prestar el servicio:</p>
      <ul>
        <li><strong>Datos de la clínica:</strong> nombre, dirección, teléfono, email.</li>
        <li><strong>Datos del usuario:</strong> nombre, email, contraseña (cifrada).</li>
        <li><strong>Datos de pacientes:</strong> nombre, teléfono, email, historial clínico, odontograma, tratamientos y archivos clínicos. Estos datos son introducidos directamente por la clínica.</li>
        <li><strong>Datos de uso:</strong> registros de actividad dentro de la plataforma (quién creó, modificó o eliminó información).</li>
      </ul>

      <h2>3. Cómo almacenamos los datos</h2>
      <p>Todos los datos se almacenan en servidores seguros proporcionados por Supabase, con cifrado en tránsito (HTTPS) y en reposo. Cada clínica solo puede acceder a sus propios datos mediante políticas de seguridad a nivel de base de datos (Row Level Security).</p>

      <h2>4. Quién puede acceder a los datos</h2>
      <p>Solo el personal autorizado de cada clínica puede acceder a su información. ClinicFlow no accede a los datos clínicos de los pacientes salvo para soporte técnico explícitamente solicitado.</p>

      <h2>5. Tus derechos</h2>
      <p>Como usuario tienes derecho a:</p>
      <ul>
        <li>Acceder a tus datos personales.</li>
        <li>Solicitar la rectificación de datos incorrectos.</li>
        <li>Solicitar la eliminación de tu cuenta y datos.</li>
        <li>Exportar tus datos en formato CSV.</li>
      </ul>
      <p>Para ejercer cualquiera de estos derechos, contáctanos en <strong>privacidad@clinicflow.ai</strong></p>

      <h2>6. Cookies</h2>
      <p>Utilizamos cookies esenciales para el funcionamiento de la sesión. Consulta nuestra <a href="/cookies">Política de Cookies</a> para más información.</p>

      <h2>7. Cambios en esta política</h2>
      <p>Notificaremos cualquier cambio significativo por email con al menos 30 días de antelación.</p>

      <h2>8. Contacto</h2>
      <p>Para consultas relacionadas con privacidad: <strong>privacidad@clinicflow.ai</strong></p>
    </article>
  )
}