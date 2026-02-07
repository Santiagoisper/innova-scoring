"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    contact_name: "",
    email: "",
    site_name: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({
          contact_name: "",
          email: "",
          site_name: "",
          message: "",
        });
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 p-8 md:p-12 rounded-2xl border border-green-200 shadow-xl text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-900 mb-2">Request Submitted!</h3>
        <p className="text-green-700 mb-6">
          Thank you for your interest. We've received your information and will send you 
          a personal evaluation token via email within 24-48 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm font-semibold text-green-600 hover:text-green-700 underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-8 md:p-12 rounded-2xl border border-slate-200 shadow-xl">
      <div className="space-y-6">
        <div>
          <label htmlFor="contact_name" className="block text-sm font-semibold text-slate-700 mb-2">
            Contact Person Name *
          </label>
          <input
            type="text"
            id="contact_name"
            name="contact_name"
            required
            value={formData.contact_name}
            onChange={handleChange}
            disabled={status === "submitting"}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Dr. John Smith"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={status === "submitting"}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="contact@researchsite.com"
          />
        </div>

        <div>
          <label htmlFor="site_name" className="block text-sm font-semibold text-slate-700 mb-2">
            Research Site Name *
          </label>
          <input
            type="text"
            id="site_name"
            name="site_name"
            required
            value={formData.site_name}
            onChange={handleChange}
            disabled={status === "submitting"}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Medical Research Center"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            disabled={status === "submitting"}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Tell us about your research site, therapeutic areas, or any specific questions..."
          />
        </div>

        {status === "error" && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="w-5 h-5" />
          {status === "submitting" ? "Sending..." : "Send Request"}
        </button>

        <p className="text-sm text-slate-500 text-center">
          After reviewing your submission, we'll send you a personal evaluation token via email.
        </p>
      </div>
    </form>
  );
}
