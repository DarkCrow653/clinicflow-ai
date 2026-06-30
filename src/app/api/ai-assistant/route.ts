import { NextRequest, NextResponse } from "next/server"

const SYSTEM_INSTRUCTIONS = `Eres un asistente de redacción para una clínica dental.
Tu única función es organizar, resumir, redactar y explicar información clínica que YA fue registrada por un profesional de la salud.

REGLAS ABSOLUTAS:
- NUNCA diagnostiques.
- NUNCA sugieras tratamientos nuevos que no estén ya en la información proporcionada.
- NUNCA inventes datos clínicos que no se te dieron.
- Solo trabajas con la información que se te entrega, organizándola y redactándola mejor.
- Si la información es insuficiente, dilo claramente en vez de inventar.`

const PROMPTS: Record<string, string> = {
  summary: "Genera un resumen clínico breve y profesional de la siguiente información del paciente, organizado cronológicamente:",
  evolution: "Redacta una nota de evolución clínica profesional basada en la siguiente información, en el formato típico de un expediente médico/dental:",
  patient_explanation: "Explica el siguiente tratamiento/diagnóstico en lenguaje simple y empático para que el paciente lo entienda, sin tecnicismos médicos innecesarios:",
  print_report: "Organiza la siguiente información en un informe limpio y profesional, listo para imprimir y entregar al paciente:",
}

export async function POST(req: NextRequest) {
  try {
    const { type, content } = await req.json()

    if (!type || !content) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
    }

    const promptInstruction = PROMPTS[type]
    if (!promptInstruction) {
      return NextResponse.json({ error: "Tipo de acción inválido" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key no configurada" }, { status: 500 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${SYSTEM_INSTRUCTIONS}\n\n${promptInstruction}\n\n${content}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini error:", errorData)
      return NextResponse.json({ error: "Error al generar contenido" }, { status: 500 })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return NextResponse.json({ text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}