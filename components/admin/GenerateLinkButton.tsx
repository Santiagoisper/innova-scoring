"use client"

import { useState } from "react"

export default function GenerateLinkButton({ centerId }: { centerId: string }) {
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    setLink(null)

    try {
      const res = await fetch("/api/admin/create-evaluation-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          center_id: centerId,
          evaluator_email: "sponsor@demo.com",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError("No se pudo generar el link")
        return
      }

      setLink(data.link)
    } catch {
      setError("Error de red")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button
        onClick={generate}
        disabled={loading}
        className="px-3 py-2 rounded-xl bg-black text-white text-sm disabled:opacity-60"
      >
        {loading ? "Generando..." : "Generar link"}
      </button>

      {link && (
        <>
          <a className="text-blue-600 underline text-sm" href={link} target="_blank" rel="noreferrer">
            Abrir
          </a>
          <button
            className="text-sm px-2 py-1 rounded-lg border"
            onClick={() => navigator.clipboard.writeText(link)}
          >
            Copiar
          </button>
        </>
      )}

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
