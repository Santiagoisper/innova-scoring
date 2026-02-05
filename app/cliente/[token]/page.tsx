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
  const [accessToken, setAccessToken] = useState<string>("");

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [uploaded, setUploaded] = useState<Record<number, boolean>>({});

  // ⚠️ Esto es DEMO para testear el endpoint upload
  // En producción real vas a traer submissionId y accessToken desde supabase auth o endpoint.
  useEffect(() => {
    // Pegá acá un submissionId real para probar
    setSubmissionId("PEGAR_SUBMISSION_ID_REAL");

    // Pegá acá un accessToken real del usuario logueado
    setAccessToken("PEGAR_ACCESS_TOKEN_REAL");
  }, []);

  // Simulación: cargar criteria (idealmente vendrá de un endpoint real /api/client/criteria)
  useEffect(() => {
    const loadCriteria = async () => {
      setLoading(true);

      // 🔥 DEMO: reemplazá esto por un fetch real si ya tenés endpoint
      const mockCriteria: Criterion[] = [
        { id: 30, question: "¿Tiene SOP vigente?", requiresDocumentation: true },
        { id: 31, question: "¿Cuenta con equipo médico disponible?", requiresDocumentation: false },
        { id: 32, question: "¿Tiene experiencia previa en ensayos clínicos?", requiresDocumentation: true },
      ];

      setCriteria(mockCriteria);
      setLoading(false);
    };

    loadCriteria();
  }, []);

  const submitAnswer = async (criterionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [criterionId]: answer }));

    if (!submissionId || !accessToken) {
      alert("Falta submissionId o accessToken para guardar respuesta.");
      return;
    }

    const res = await fetch("/api/client/submit-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        submission_id: submissionId,
        criterion_id: criterionId,
        answer,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error guardando respuesta: " + data.error);
      return;
    }
  };

  const uploadFile = async (criterionId: number) => {
    const file = files[criterionId];

    if (!file) {
      alert("Seleccioná un archivo primero");
      return;
    }

    if (!submissionId || !accessToken) {
      alert("Falta submissionId o accessToken para subir archivo.");
      return;
    }

    setUploading((prev) => ({ ...prev, [criterionId]: true }));

    try {
      const formData = new FormData();
      formData.append("submission_id", submissionId);
      formData.append("criterion_id", String(criterionId));
      formData.append("file", file);

      const res = await fetch("/api/client/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error subiendo archivo: " + data.error);
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
            <div><b>Token:</b> {token}</div>
            <div><b>Submission:</b> {submissionId || "NO CONFIGURADO"}</div>
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

              {/* respuestas */}
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => submitAnswer(c.id, "yes")}
                  className={`px-4 py-2 rounded-xl font-semibold border transition ${
                    answers[c.id] === "yes"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Sí
                </button>

                <button
                  onClick={() => submitAnswer(c.id, "no")}
                  className={`px-4 py-2 rounded-xl font-semibold border transition ${
                    answers[c.id] === "no"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  No
                </button>

                <button
                  onClick={() => submitAnswer(c.id, "na")}
                  className={`px-4 py-2 rounded-xl font-semibold border transition ${
                    answers[c.id] === "na"
                      ? "bg-gray-700 text-white border-gray-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  N/A
                </button>
              </div>

              {/* upload */}
              <div className="mt-6 border-t pt-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-700
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    onChange={(e) =>
                      setFiles((prev) => ({
                        ...prev,
                        [c.id]: e.target.files?.[0] || null,
                      }))
                    }
                  />

                  <button
                    onClick={() => uploadFile(c.id)}
                    disabled={uploading[c.id]}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {uploading[c.id] ? "Subiendo..." : "Subir archivo"}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Se guardará en: submissions/{submissionId}/{c.id}/archivo
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white shadow rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Estado</h3>

          <p className="text-gray-600 mt-2 text-sm">
            Cuando completes todas las respuestas y subas los documentos requeridos,
            el score se recalcula automáticamente.
          </p>

          <div className="mt-4 text-sm text-gray-700">
            <div>
              <b>Respuestas cargadas:</b>{" "}
              {Object.keys(answers).length} / {criteria.length}
            </div>

            <div>
              <b>Documentos subidos:</b>{" "}
              {Object.keys(uploaded).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
