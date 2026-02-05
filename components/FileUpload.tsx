"use client";

import { useState } from "react";

type Props = {
  submissionId: string;
  criterionId: string;
  accessToken: string;
};

export default function FileUpload({ submissionId, criterionId, accessToken }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (!file) {
      alert("Seleccioná un archivo primero");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("submission_id", submissionId);
      formData.append("criterion_id", criterionId);
      formData.append("file", file);

      const res = await fetch("/api/client/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log("UPLOAD RESPONSE:", data);

      if (!res.ok) {
        alert("Error: " + data.error);
        return;
      }

      alert("Archivo subido OK");
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={uploadFile}
        disabled={loading}
        style={{ marginLeft: 10 }}
      >
        {loading ? "Subiendo..." : "Subir"}
      </button>
    </div>
  );
}
