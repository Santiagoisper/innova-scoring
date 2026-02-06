"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Criterion = {
  id: number;
  question: string;
  requiresDocumentation: boolean;
};

export default function ClienteTokenPage() {
  const params = useParams();
  const token = params?.token as string;

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);

  const [submissionId, setSubmissionId] = useState<string>("");

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [uploaded, setUploaded] = useState<Record<number, boolean>>({});

  // Obtener submission real a partir del token
  useEffect(() => {
    const loadSubmission = async () => {
      if (!token) return;

      try {
        const res = await fetch("/api/client/token/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const raw = await res.text();

        let data: any = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch (e) {
          alert(
            "El endpoint /api/client/token/validate no devolvió JSON.\n\nRespuesta:\n" +
              raw
          );
          return;
        }

        if (!res.ok) {
          alert("Error validando token: " + (data?.error || "Error desconocido"));
          return;
        }

        if (!data?.submission?.id) {
          alert("Token válido pero no se encontró submission.id.");
          return;
        }

        setSubmissionId(data.submission.id);
      } catch (err: any) {
        alert("Error inesperado: " + err.message);
      }
    };

    loadSubmission();
  }, [token]);

  // Cargar preguntas reales desde Supabase
  useEffect(() => {
    const loadCriteria = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/criteria");
        const raw = await res.text();

        let data: any = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch (e) {
          alert(
            "El endpoint /api/criteria no devolvió JSON.\n\nRespuesta:\n" + raw
          );
          setLoading(false);
          return;
        }

        if (!res.ok) {
          alert("Error cargando preguntas: " + (data?.error || "Error desconocido"));
          setLoading(false);
          return;
        }

        const mapped: Criterion[] = (data ?? [])
          .filter((c: any) => c.id >= 19)
          .map((c: any) => ({
            id: c.id,
            question: c.name,
            requiresDocumentation: c.critical ?? false,
          }));

        setCriteria(mapped);
      } catch (err: any) {
        alert("Error inesperado: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCriteria();
  }, []);

  const submitAnswer = async (criterionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [criterionId]: answer }));

    if (!submissionId) {
      alert("Falta submissionId para guardar respuesta.");
      return;
    }

    const res = await fetch("/api/client/token/submit-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submission_id: submissionId,
        criterion_id: criterionId,
        answer,
      }),
    });

    const raw = await res.text();

    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (e) {
      alert(
        "El endpoint /api/client/token/submit-answer no devolvió JSON.\n\nRespuesta:\n" +
          raw
      );
      return;
    }

    if (!res.ok) {
      alert("Error guardando respuesta: " + (data?.error || "Error desconocido"));
      return;
    }
  };

  const uploadFile = async (criterionId: number) => {
    const file = files[criterionId];

    if (!file) {
      alert("Seleccioná un archivo primero");
      return;
    }

    if (!submissionId) {
      alert("Falta submissionId para subir archivo.");
      return;
    }

    setUploading((prev) => ({ ...prev, [criterionId]: true }));

    try {
      const formData = new FormData();
      formData.append("submission_id", submissionId);
      formData.append("criterion_id", String(criterionId));
      formData.append("file", file);

      const res = await fetch("/api/client/token/upload", {
        method: "POST",
        body: formData,
      });

      const raw = await res.text();

      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (e) {
        alert(
          "El endpoint /api/client/token/upload no devolvió JSON.\n\nRespuesta:\n" +
            raw
        );
        return;
      }

      if (!res.ok) {
        alert("Error subiendo archivo: " + (data?.error || "Error desconocido"));
        return;
      }

      setUploaded((prev) => ({ ...prev, [criterionId]: true }));
      alert("Archivo subido correctamente.");
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
    } finally {
      setUploading((prev) => ({ ...prev, [criterionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando formulario...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Evaluación del Centro
          </h1>

          <p className="text-gray-600 mt-2">
            Complete las respuestas y adjunte documentación cuando corresponda.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-gray-100 text-sm text-gray-700">
            <div>
              <b>Token:</b> {token}
            </div>
            <div>
              <b>Submission:</b>{" "}
              {submissionId ? submissionId : "NO ENCONTRADO"}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {criteria.map((c) => (
            <div
              key={c.id}
              className="bg-white shadow-sm rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {c.id}. {c.question}
                  </h2>

                  {c.requiresDocumentation && (
                    <p className="text-sm text-red-600 mt-1">
                      Requiere documentación obligatoria
                    </p>
                  )}
                </div>

                {uploaded[c.id] && (
                  <span className="text-green-700 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full">
                    Documento cargado ✔
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-4">
                {["yes", "no", "na"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <input
                      type="radio"
                      name={`criterion-${c.id}`}
                      value={opt}
                      checked={answers[c.id] === opt}
                      onChange={() => submitAnswer(c.id, opt)}
                    />
                    {opt === "yes" ? "Sí" : opt === "no" ? "No" : "N/A"}
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setFiles((prev) => ({ ...prev, [c.id]: file }));
                  }}
                />

                <button
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  disabled={uploading[c.id]}
                  onClick={() => uploadFile(c.id)}
                >
                  {uploading[c.id] ? "Subiendo..." : "Subir archivo"}
                </button>

                <p className="text-xs text-gray-500 mt-2">
                  Se guardará en: submissions/{submissionId || "SUBMISSION_ID"}/
                  {c.id}/archivo
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 text-gray-700">
          <h3 className="font-semibold text-gray-900">Estado</h3>
          <p className="text-sm text-gray-600 mt-2">
            Cuando completes todas las respuestas y subas los documentos
            requeridos, el score se recalcula automáticamente.
          </p>

          <div className="mt-3 text-sm">
            <div>
              <b>Respuestas cargadas:</b> {Object.keys(answers).length} /{" "}
              {criteria.length}
            </div>
            <div>
              <b>Documentos subidos:</b> {Object.keys(uploaded).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
