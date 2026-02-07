"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  FileCheck, 
  ShieldCheck,
  Building2,
  Info
} from "lucide-react";

type Criterion = {
  id: number;
  name: string;
  response_type: 'boolean' | 'text';
  critical: boolean;
};

export default function ClienteTokenPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState<string>("");
  const [centerName, setCenterName] = useState<string>("");

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [uploaded, setUploaded] = useState<Record<number, string>>({}); // Stores URLs

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Load Submission & Center Info
  useEffect(() => {
    const loadSubmission = async () => {
      if (!token) return;

      try {
        const res = await fetch("/api/client/token/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Token validation error:", data.error);
          return;
        }

        setSubmissionId(data.submission.id);
        
        // Load center info if needed
        const centerRes = await fetch(`/api/admin/centers/${data.submission.center_id}`);
        const centerData = await centerRes.json();
        if (centerData) setCenterName(centerData.name);

      } catch (err: any) {
        console.error("Unexpected error:", err.message);
      }
    };

    loadSubmission();
  }, [token]);

  // Load Criteria
  useEffect(() => {
    const loadCriteria = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/criteria");
        const data = await res.json();
        if (res.ok) setCriteria(data || []);
      } catch (err: any) {
        console.error("Error loading criteria:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCriteria();
  }, []);

  const submitAnswer = async (criterionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [criterionId]: answer }));

    if (!submissionId) return;

    await fetch("/api/client/token/submit-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission_id: submissionId,
        criterion_id: criterionId,
        answer,
      }),
    });
  };

  const uploadFile = async (criterionId: number) => {
    const file = files[criterionId];
    if (!file || !submissionId) return;

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

      const data = await res.json();

      if (res.ok && data.url) {
        setUploaded((prev) => ({ ...prev, [criterionId]: data.url }));
      }
    } catch (err: any) {
      console.error("Upload error:", err.message);
    } finally {
      setUploading((prev) => ({ ...prev, [criterionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <RefreshCw className="w-10 h-10 text-primary-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Evaluation Form...</p>
      </div>
    );
  }

  if (!submissionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black text-slate-900">Invalid Access Token</h1>
          <p className="text-slate-500 leading-relaxed">The link you followed is incorrect or has expired. Please contact Innova Trials support for a new invitation.</p>
          <button onClick={() => router.push('/cliente')} className="btn-primary w-full py-4">Go to Login</button>
        </div>
      </div>
    );
  }

  if (!disclaimerAccepted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-primary-400" />
              <span className="text-xs font-black uppercase tracking-widest opacity-60">Innova Trials Compliance</span>
            </div>
            <h1 className="text-3xl font-black">Legal Disclaimer</h1>
          </div>
          <div className="p-10 space-y-6">
            <div className="prose prose-slate max-h-60 overflow-y-auto pr-4 text-slate-600 text-sm leading-relaxed">
              <p>By proceeding with this evaluation, you certify that all information provided is accurate and representative of your research site's current capabilities.</p>
              <p>The data collected will be used by Innova Trials for site selection and quality assessment purposes only. Your information will be handled in accordance with international clinical research data protection standards.</p>
              <p>Any supporting documentation uploaded must be authentic. False representation may result in immediate disqualification from the selection process.</p>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <button 
                onClick={() => setDisclaimerAccepted(true)}
                className="btn-primary w-full py-5 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary-100"
              >
                I Accept and Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-100">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 leading-none">{centerName || 'Research Site'}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Site Evaluation Portal</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
              <p className="text-sm font-black text-primary-600">{Math.round((Object.keys(answers).length / criteria.length) * 100)}% Complete</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Technical Assessment</h1>
          <p className="text-slate-500 text-lg leading-relaxed">Please answer all questions accurately. Upload supporting documentation for critical criteria as requested.</p>
        </header>

        <div className="space-y-8">
          {criteria.map((c, idx) => (
            <div key={c.id} className="card p-8 md:p-10 space-y-8 transition-all hover:shadow-xl hover:shadow-slate-200/50">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex gap-6">
                  <span className="text-slate-200 font-black text-4xl leading-none">{(idx + 1).toString().padStart(2, '0')}</span>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">{c.name}</h3>
                    {c.critical && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                        <AlertCircle className="w-3 h-3" />
                        Critical Requirement
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {c.response_type === 'boolean' ? (
                    ['yes', 'no', 'na'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => submitAnswer(c.id, opt)}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                          answers[c.id] === opt 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))
                  ) : (
                    <span className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Open Response</span>
                  )}
                </div>
              </div>

              {c.response_type === 'text' && (
                <div className="ml-0 md:ml-16">
                  <textarea
                    placeholder="Provide detailed information here..."
                    className="input min-h-[120px] py-4"
                    value={answers[c.id] || ""}
                    onChange={(e) => submitAnswer(c.id, e.target.value)}
                  />
                </div>
              )}

              <div className="ml-0 md:ml-16 pt-6 border-t border-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer group">
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setFiles((prev) => ({ ...prev, [c.id]: file }));
                        }}
                      />
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-primary-600 transition-colors">
                        <Upload className="w-4 h-4" />
                        {files[c.id] ? files[c.id]?.name : 'Attach Supporting Document'}
                      </div>
                    </label>
                    {files[c.id] && !uploaded[c.id] && (
                      <button 
                        onClick={() => uploadFile(c.id)}
                        disabled={uploading[c.id]}
                        className="text-[10px] font-black uppercase text-primary-600 hover:underline disabled:opacity-50"
                      >
                        {uploading[c.id] ? 'Uploading...' : 'Confirm Upload'}
                      </button>
                    )}
                  </div>
                  {uploaded[c.id] && (
                    <div className="flex items-center gap-2 text-green-600">
                      <FileCheck className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Document Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="card p-10 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black">Ready to Submit?</h3>
            <p className="text-slate-400 text-sm">Ensure all required documentation is uploaded before finishing.</p>
          </div>
          <button 
            onClick={() => {
              alert("Evaluation saved successfully. Our team will review your submission.");
              router.push('/cliente');
            }}
            className="btn-primary bg-white text-slate-900 hover:bg-slate-100 px-12 py-5 text-sm font-black uppercase tracking-widest shadow-2xl shadow-white/10"
          >
            Finish Evaluation
          </button>
        </footer>
      </div>
    </div>
  );
}
