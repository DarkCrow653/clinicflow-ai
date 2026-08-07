export default function MedicalDisclaimerPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Aviso Médico</h1>

      <div className="not-prose rounded-2xl border border-yellow-200 bg-yellow-50 p-6 my-6">
        <p className="font-bold text-yellow-800 text-lg">⚠️ Importante</p>
        <p className="text-yellow-700 mt-2">
          ClinicFlow es una herramienta de gestión clínica. No es un sistema de diagnóstico médico.
        </p>
      </div>

      <h2>1. Naturaleza del software</h2>
      <p>ClinicFlow AI es una plataforma de gestión administrativa y organizativa para clínicas dentales y médicas. Su función es facilitar la organización de pacientes, citas, tratamientos y documentación clínica.</p>

      <h2>2. Limitaciones</h2>
      <p>ClinicFlow <strong>no realiza</strong>:</p>
      <ul>
        <li>Diagnósticos médicos o dentales.</li>
        <li>Recomendaciones de tratamiento.</li>
        <li>Interpretación de resultados clínicos.</li>
        <li>Prescripción de medicamentos.</li>
      </ul>

      <h2>3. Responsabilidad clínica</h2>
      <p>Toda decisión clínica recae exclusivamente en el profesional de la salud responsable. ClinicFlow proporciona únicamente un entorno digital para registrar y organizar la información que el profesional considera relevante.</p>

      <h2>4. Uso de la información registrada</h2>
      <p>La información registrada en ClinicFlow refleja el criterio del profesional que la introduce. ClinicFlow no valida, verifica ni interpreta esta información desde una perspectiva médica.</p>

      <h2>5. Contacto</h2>
      <p>Para consultas: <strong>soporte@clinicflow.ai</strong></p>
    </article>
  )
}