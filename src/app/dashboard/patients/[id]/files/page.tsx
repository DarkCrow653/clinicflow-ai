"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/logActivity"

type PatientFile = {
  id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number | null
  category: string
  notes: string | null
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  radiografia: "Radiografía",
  foto_intraoral: "Foto Intraoral",
  antes_despues: "Antes/Después",
  consentimiento: "Consentimiento",
  pdf: "PDF",
  otros: "Otros",
}

const CATEGORY_FILTERS = ["todos", ...Object.keys(CATEGORY_LABELS)]

const MAX_FILE_SIZE_MB = 10

export default function PatientFilesPage() {
  const params = useParams()

  const [patientName, setPatientName] = useState("")
  const [clinicId, setClinicId] = useState("")
  const [userId, setUserId] = useState("")
  const [files, setFiles] = useState<PatientFile[]>([])
  const [activeFilter, setActiveFilter] = useState("todos")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("otros")
  const [notes, setNotes] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredFiles = files.filter((f) =>
    activeFilter === "todos" ? true : f.category === activeFilter
  )

  useEffect(() => {
    if (params?.id) loadAll()
  }, [params])

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user?.id || "")
      .single()

    if (profile) setClinicId(profile.clinic_id)

    const { data: patient } = await supabase
      .from("patients")
      .select("full_name")
      .eq("id", params.id)
      .single()

    if (patient) setPatientName(patient.full_name)

    loadFiles(profile?.clinic_id)
  }

  const loadFiles = async (cId?: string) => {
    const { data } = await supabase
      .from("patient_files")
      .select("*")
      .eq("patient_id", params.id)
      .order("created_at", { ascending: false })

    if (data) setFiles(data)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")

    // Validación tamaño
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setUploadError(`El archivo supera el límite de ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    // Validación tipo
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "application/pdf",
      "image/dicom",
    ]
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".dcm")) {
      setUploadError("Tipo de archivo no permitido. Sube imágenes, PDFs o archivos DICOM.")
      return
    }

    setUploading(true)

    // Ruta: clinicId/patientId/timestamp_filename
    const filePath = `${clinicId}/${params.id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("patient-files")
      .upload(filePath, file)

    if (uploadError) {
      setUploadError(uploadError.message)
      setUploading(false)
      return
    }

    // Guarda metadatos
    const { error: dbError } = await supabase.from("patient_files").insert({
      patient_id: params.id,
      clinic_id: clinicId,
      uploaded_by: userId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      category: selectedCategory,
      notes: notes.trim() || null,
    })

    if (dbError) {
      setUploadError(dbError.message)
      setUploading(false)
      return
    }

    await logActivity({
      clinicId,
      action: `subió archivo "${file.name}" para`,
      entityType: "patient",
      entityId: params.id as string,
      details: patientName,
    })

    setNotes("")
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
    loadFiles()
  }

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("patient-files")
      .download(filePath)

    if (error) { alert(error.message); return }

    const url = URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const getPreviewUrl = async (filePath: string): Promise<string> => {
    const { data } = await supabase.storage
      .from("patient-files")
      .createSignedUrl(filePath, 60)

    return data?.signedUrl || ""
  }

  const deleteFile = async (fileId: string, filePath: string, fileName: string) => {
    const confirm = window.confirm(`¿Eliminar "${fileName}"? Esta acción no se puede deshacer.`)
    if (!confirm) return

    await supabase.storage.from("patient-files").remove([filePath])
    await supabase.from("patient_files").delete().eq("id", fileId)

    await logActivity({
      clinicId,
      action: `eliminó archivo "${fileName}" de`,
      entityType: "patient",
      entityId: params.id as string,
      details: patientName,
    })

    loadFiles()
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  const isImage = (fileType: string) =>
    fileType.startsWith("image/")

  return (
    <div className="space-y-6 p-10">
      <div>
        <Link
          href={`/dashboard/patients/${params.id}`}
          className="text-sm text-gray-400 hover:text-black"
        >
          ← Volver a {patientName}
        </Link>
        <h1 className="text-3xl font-bold mt-1">Archivos Clínicos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Radiografías, fotos, consentimientos y documentos de {patientName}
        </p>
      </div>

      {/* SUBIR ARCHIVO */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold">Subir archivo</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs text-gray-500">Categoría</label>
            <select
              className="w-full rounded border p-2 text-sm mt-1"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Observaciones (opcional)</label>
            <input
              className="w-full rounded border p-2 text-sm mt-1"
              placeholder="Ej. Radiografía panorámica inicial"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div
          className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center cursor-pointer hover:bg-gray-50 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-gray-500 text-sm">
            {uploading ? "Subiendo archivo..." : "Haz clic para seleccionar un archivo"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Imágenes, PDF · Máximo {MAX_FILE_SIZE_MB}MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.dcm"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>

        {uploadError && (
          <p className="text-sm text-red-500">{uploadError}</p>
        )}
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-4 py-1 text-sm transition ${
              activeFilter === filter
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter === "todos" ? "Todos" : CATEGORY_LABELS[filter]}
          </button>
        ))}
      </div>

      {/* LISTA DE ARCHIVOS */}
      {filteredFiles.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay archivos en esta categoría.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="rounded-2xl border bg-white p-4 shadow-sm space-y-3"
            >
              {/* PREVIEW si es imagen */}
              {isImage(file.file_type) && (
                <FilePreview filePath={file.file_path} fileName={file.file_name} />
              )}

              {/* PDF icon */}
              {file.file_type === "application/pdf" && (
                <div className="flex items-center justify-center h-24 rounded-lg bg-red-50 text-red-400 text-4xl">
                  📄
                </div>
              )}

              <div>
                <p className="text-sm font-semibold truncate">{file.file_name}</p>
                <p className="text-xs text-gray-400">
                  {CATEGORY_LABELS[file.category]} · {formatSize(file.file_size)}
                </p>
                <p className="text-xs text-gray-400">{formatDate(file.created_at)}</p>
                {file.notes && (
                  <p className="text-xs text-gray-500 mt-1">{file.notes}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile(file.file_path, file.file_name)}
                  className="flex-1 rounded border px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  Descargar
                </button>
                <button
                  onClick={() => deleteFile(file.id, file.file_path, file.file_name)}
                  className="rounded border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 👇 Componente para preview de imágenes con URL firmada
function FilePreview({ filePath, fileName }: { filePath: string; fileName: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    supabase.storage
      .from("patient-files")
      .createSignedUrl(filePath, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) setUrl(data.signedUrl)
      })
  }, [filePath])

  if (!url) return (
    <div className="h-24 rounded-lg bg-gray-100 animate-pulse" />
  )

  return (
    <img
      src={url}
      alt={fileName}
      className="w-full h-32 object-cover rounded-lg"
    />
  )
}