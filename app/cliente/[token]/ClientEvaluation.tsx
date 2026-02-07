"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  FileText,
  Upload,
  AlertCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldCheck,
  FileIcon,
  Loader2,
} from "lucide-react";

type Criterion = {
  id: number;
  name: string;
  category: string;
  weight: number;
  critical: boolean;
  type: "scoring" | "development";
};

type ClientEvaluationProps = {
  token: string;
  initialSubmission: any;
};

export default function ClientEvaluation({
  token,
  initialSubmission,
}: ClientEvaluationProps) {
  const [step, setStep] = useState<"disclaimer" | "form" | "success">(
    initialSubmission?.responses?.disclaimer_accepted ? "form" : "disclaimer"
  );
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [responses, setResponses] = useState<Record<number, number | string>>({});
  const [attachments, setAttachments] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load criteria
  useEffect(() => {
    async function loadCriteria() {
      try {
        // Corregido: usamos /api/criteria que es el endpoint que acabamos de crear/reparar
        const res = await fetch("/api/criteria");
        if (!res.ok) throw new Error("Failed to load criteria");
        const data = await res.json();
        setCriteria(data);

        // Load existing responses if any
        if (initialSubmission?.responses?.scores) {
          setResponses(initialSubmission.responses.scores);
        }
        if (initialSubmission?.responses?.attachments) {
          setAttachments(initialSubmission.responses.attachments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCriteria();
  }, [initialSubmission]);

  const handleScoreChange = (id: number, score: number) => {
    setResponses((prev) => ({ ...prev, [id]: score }));
  };

  const handleTextChange = (id: number, text: string) => {
    setResponses((prev) => ({ ...prev, [id]: text }));
  };

  const handleFileUpload = async (id: number, file: File) => {
    setUploading((prev) => ({ ...prev, [id]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("center_id", initialSubmission.center_id);
      formData.append("criterion_id", id.toString());

      // Note: We need a generic upload API or use the one we have
      const res = await fetch("/api/client/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAttachments((prev) => ({ ...prev, [id]: data.url }));
    } catch (err) {
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          responses,
          attachments,
          disclaimer_accepted: true,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      setStep("success");
    } catch (err) {
      alert("Error submitting evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando cuestionario...</p>
      </div>
    );
  }

  if (step === "disclaimer") {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-primary-600 p-8 text-white text-center">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-bold font-display">Aviso Legal y Privacidad</h1>
            <p className="mt-2 text-primary-100">Por favor, lee y acepta los términos para comenzar.</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="prose prose-slate text-slate-600 max-h-[300px] overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
              <p>Al acceder a esta plataforma de evaluación, usted acepta que:</p>
              <ul>
                <li>La información proporcionada es veraz y representa el estado actual de su centro.</li>
                <li>Los documentos adjuntos son copias fieles de los originales.</li>
                <li>Innova Trials tratará sus datos conforme a la ley de protección de datos vigente.</li>
                <li>Esta evaluación es una herramienta de diagnóstico y no garantiza la selección automática para estudios clínicos.</li>
              </ul>
              <p>Su participación es voluntaria y puede interrumpirla en cualquier momento antes del envío final.</p>
            </div>
            <button
              onClick={() => setStep("form")}
              className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary-200"
            >
              Acepto los términos y comenzar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-scale-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 font-display mb-4">¡Evaluación Enviada!</h1>
        <p className="text-xl text-slate-600 mb-8">
          Muchas gracias por completar el cuestionario. Tu información está siendo procesada por nuestro equipo.
        </p>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <p className="text-sm text-slate-500">Recibirás una notificación por correo electrónico con los siguientes pasos una vez que revisemos la documentación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 font-display">Cuestionario de Evaluación CRO</h1>
        <p className="text-slate-500 mt-2">Completa todas las secciones para obtener tu puntuación final.</p>
      </div>

      {/* Progress */}
      <div className="sticky top-4 z-30 mb-8 px-6 py-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold text-slate-900">
            Progreso: {Math.round((Object.keys(responses).length / criteria.length) * 100)}%
          </div>
          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-500" 
              style={{ width: `${(Object.keys(responses).length / criteria.length) * 100}%` }}
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(responses).length < criteria.length}
          className="btn-primary px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Enviando..." : "Enviar Evaluación Final"}
        </button>
      </div>

      {/* Criteria List */}
      <div className="space-y-6">
        {criteria.map((c) => (
          <div key={c.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-primary-300 transition-colors">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded">Criterio {c.id}</span>
                    {c.critical && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Crítico
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 leading-tight">{c.name}</h3>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {c.type === "scoring" ? (
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                      <button
                        onClick={() => handleScoreChange(c.id, 100)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          responses[c.id] === 100 ? "bg-white text-green-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        SÍ
                      </button>
                      <button
                        onClick={() => handleScoreChange(c.id, 0)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          responses[c.id] === 0 ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        NO
                      </button>
                    </div>
                  ) : (
                    <div className="text-primary-600">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>

              {/* Development Area */}
              {c.type === "development" && (
                <div className="mt-6">
                  <textarea
                    placeholder="Describe detalladamente aquí..."
                    className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    value={(responses[c.id] as string) || ""}
                    onChange={(e) => handleTextChange(c.id, e.target.value)}
                  />
                </div>
              )}

              {/* File Upload Area */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${attachments[c.id] ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                      {attachments[c.id] ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Documentación de respaldo</p>
                      <p className="text-xs text-slate-500">Formatos: PDF, Word, Excel, JPG</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {attachments[c.id] && (
                      <a href={attachments[c.id]} target="_blank" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
                        <FileIcon className="w-3 h-3" /> Ver archivo
                      </a>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(c.id, file);
                        }}
                      />
                      <div className={`btn-sm ${attachments[c.id] ? "btn-secondary" : "btn-primary"} flex items-center gap-2`}>
                        {uploading[c.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {attachments[c.id] ? "Cambiar Archivo" : "Subir Archivo"}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-12 p-8 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Info className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="font-bold">¿Necesitas ayuda?</p>
            <p className="text-sm text-slate-400">Si tienes dudas con alguna pregunta, contacta a tu sponsor.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(responses).length < criteria.length}
          className="btn-primary bg-white text-slate-900 hover:bg-slate-100 border-none px-10 py-4 shadow-xl disabled:opacity-30"
        >
          {submitting ? "Procesando..." : "Finalizar Evaluación"}
        </button>
      </div>
    </div>
  );
}
