export default function DpaPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Acuerdo de Procesamiento de Datos (DPA)</h1>
      <p className="text-gray-500 text-sm">Última actualización: {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</p>

      <p>Este Acuerdo de Procesamiento de Datos regula el tratamiento de datos personales de pacientes que ClinicFlow realiza en nombre de las clínicas usuarias.</p>

      <h2>1. Roles</h2>
      <ul>
        <li><strong>Responsable del tratamiento:</strong> La clínica que introduce y gestiona los datos de sus pacientes.</li>
        <li><strong>Encargado del tratamiento:</strong> ClinicFlow, que procesa los datos según las instrucciones de la clínica.</li>
      </ul>

      <h2>2. Datos procesados</h2>
      <ul>
        <li>Datos identificativos de pacientes (nombre, teléfono, email).</li>
        <li>Datos de salud (historial clínico, odontograma, tratamientos).</li>
        <li>Archivos clínicos (radiografías, fotografías, consentimientos).</li>
        <li>Datos de facturación y pagos.</li>
      </ul>

      <h2>3. Medidas de seguridad</h2>
      <ul>
        <li>Cifrado HTTPS en todas las comunicaciones.</li>
        <li>Cifrado en reposo en la base de datos.</li>
        <li>Aislamiento de datos por clínica mediante Row Level Security.</li>
        <li>Registro de auditoría de todas las acciones sobre los datos.</li>
        <li>Autenticación segura con tokens.</li>
        <li>Copias de seguridad automáticas.</li>
      </ul>

      <h2>4. Subencargados</h2>
      <p>ClinicFlow utiliza los siguientes proveedores de infraestructura:</p>
      <ul>
        <li><strong>Supabase:</strong> Base de datos y almacenamiento de archivos.</li>
        <li><strong>Vercel:</strong> Hosting de la aplicación.</li>
      </ul>

      <h2>5. Eliminación de datos</h2>
      <p>Cuando una clínica cancela su cuenta, sus datos son eliminados permanentemente en un plazo máximo de 30 días.</p>

      <h2>6. Contacto</h2>
      <p>Para consultas sobre el procesamiento de datos: <strong>dpa@clinicflow.ai</strong></p>
    </article>
  )
}