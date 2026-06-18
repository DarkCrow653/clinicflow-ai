export function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) {
    alert("No hay datos para exportar.")
    return
  }

  const headers = Object.keys(rows[0])
  const csvRows = [headers.join(",")]

  for (const row of rows) {
    const values = headers.map((header) => {
      let val = row[header] ?? ""
      val = String(val).replace(/"/g, '""')
      if (val.includes(",") || val.includes("\n")) {
        val = `"${val}"`
      }
      return val
    })
    csvRows.push(values.join(","))
  }

  const csvString = csvRows.join("\n")
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}