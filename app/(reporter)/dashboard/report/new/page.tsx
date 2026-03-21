"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft, ArrowRight, Camera, MapPin, FileText, Check,
  Upload, X, Loader2, AlertTriangle, Navigation,
} from "lucide-react";

interface FormData {
  vehicleNumber: string;
  vehicleType: string;
  vehicleColor: string;
  violationType: string;
  customViolation: string;
  locationText: string;
  locationLat: number | null;
  locationLng: number | null;
  landmark: string;
  direction: string;
  date: string;
  time: string;
  severity: string;
  isRepeatOffender: boolean;
  description: string;
}

interface MediaFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url: string;
  type: "image" | "video";
}

const vehicleTypes = ["Two-Wheeler", "Three-Wheeler (Auto)", "Car", "SUV", "Bus", "Truck", "Van", "Bicycle", "Other"];
const severityLevels = ["Low", "Medium", "High", "Critical"];
const directions = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];

const initialData: FormData = {
  vehicleNumber: "",
  vehicleType: "",
  vehicleColor: "",
  violationType: "",
  customViolation: "",
  locationText: "",
  locationLat: null,
  locationLng: null,
  landmark: "",
  direction: "",
  date: new Date().toISOString().split("T")[0],
  time: new Date().toTimeString().slice(0, 5),
  severity: "Medium",
  isRepeatOffender: false,
  description: "",
};

export default function NewReportPage() {
  const router = useRouter();
  const { profile, loading: sessionLoading } = useSession();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [violationTypes, setViolationTypes] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ reportId: string } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof FormData, value: string | number | boolean | null) => {
    setData((d) => ({ ...d, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  // Fetch violation types from Supabase
  useEffect(() => {
    const fetchTypes = async () => {
      const supabase = createClient();
      const { data: types } = await supabase
        .from("violation_types")
        .select("name")
        .eq("active", true)
        .order("sort_order") as { data: { name: string }[] | null };
      if (types) setViolationTypes(types.map((t) => t.name));
    };
    fetchTypes();
  }, []);

  // Detect current GPS location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrors((e) => ({ ...e, location: "Geolocation not supported" }));
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        update("locationLat", latitude);
        update("locationLng", longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geo = await res.json();
          if (geo.display_name) {
            update("locationText", geo.display_name.split(",").slice(0, 3).join(",").trim());
          }
        } catch {
          update("locationText", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setDetectingLocation(false);
      },
      () => {
        setErrors((e) => ({ ...e, location: "Could not detect location. Please enter manually." }));
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle media selection
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newMedia: MediaFile[] = [];
    for (let i = 0; i < files.length && media.length + newMedia.length < 5; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      if (!file.type.startsWith("image/") && !isVideo) continue;
      if (file.size > 20 * 1024 * 1024) continue;
      newMedia.push({
        file, preview: URL.createObjectURL(file), uploading: false, uploaded: false, url: "", type: isVideo ? "video" : "image",
      });
    }
    setMedia((prev) => [...prev, ...newMedia]);
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
  };

  // Upload media to Supabase Storage
  const uploadMedia = async () => {
    const supabase = createClient();
    const uploaded: { url: string; type: string; size: number; filename: string }[] = [];
    for (let i = 0; i < media.length; i++) {
      if (media[i].uploaded) { uploaded.push({ url: media[i].url, type: media[i].type, size: media[i].file.size, filename: media[i].file.name }); continue; }
      setMedia((prev) => prev.map((m, j) => (j === i ? { ...m, uploading: true } : m)));
      const ext = media[i].file.name.split(".").pop() || "jpg";
      const path = `reports/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("evidence").upload(path, media[i].file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("evidence").getPublicUrl(path);
        setMedia((prev) => prev.map((m, j) => (j === i ? { ...m, uploading: false, uploaded: true, url: urlData.publicUrl } : m)));
        uploaded.push({ url: urlData.publicUrl, type: media[i].type, size: media[i].file.size, filename: media[i].file.name });
      } else {
        setMedia((prev) => prev.map((m, j) => (j === i ? { ...m, uploading: false } : m)));
      }
    }
    return uploaded;
  };

  // Validations
  const validate1 = () => {
    const errs: Record<string, string> = {};
    if (!data.vehicleNumber.trim()) errs.vehicleNumber = "Vehicle number is required";
    if (!data.violationType) errs.violationType = "Select a violation type";
    if (!data.description.trim()) errs.description = "Description is required";
    else if (data.description.trim().length < 10) errs.description = "Describe the violation in at least 10 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validate2 = () => {
    const errs: Record<string, string> = {};
    if (!data.locationText.trim()) errs.locationText = "Location is required";
    if (!data.date) errs.date = "Date is required";
    if (!data.time) errs.time = "Time is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validate1()) setStep(2);
    else if (step === 2 && validate2()) setStep(3);
    else if (step === 3) setStep(4);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const mediaUrls = media.length > 0 ? await uploadMedia() : [];
      const res = await fetch("/api/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, mediaUrls }),
      });
      const result = await res.json();
      if (!res.ok) { setErrors({ submit: result.error || "Failed to submit report" }); setSubmitting(false); return; }
      setSuccess({ reportId: result.reportId });
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    }
    setSubmitting(false);
  };

  if (sessionLoading) {
    return <div className="max-w-2xl mx-auto"><div className="h-64 rounded-2xl bg-[var(--bg-tertiary)] animate-pulse" /></div>;
  }

  // Success Screen
  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12 pb-24 md:pb-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--status-approved)] to-[#22C55E] flex items-center justify-center mb-6">
          <Check size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Report Submitted! 🎉</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Thank you for helping keep Chennai&apos;s roads safe.</p>
        <div className="inline-block px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] mb-6">
          <p className="text-xs text-[var(--text-tertiary)]">Report ID</p>
          <code className="text-lg font-mono font-bold text-[var(--brand-primary)]">{success.reportId}</code>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mb-8">You&apos;ll receive a notification when a police officer reviews your report.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/dashboard/reports")}>View My Reports</Button>
          <Button variant="primary" onClick={() => { setSuccess(null); setData(initialData); setMedia([]); setStep(1); }}>Submit Another</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, icon: <FileText size={16} />, label: "Violation" },
    { num: 2, icon: <MapPin size={16} />, label: "Location" },
    { num: 3, icon: <Camera size={16} />, label: "Evidence" },
    { num: 4, icon: <Check size={16} />, label: "Review" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => (step > 1 ? setStep(step - 1) : router.back())} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">New Report</h1>
          <p className="text-xs text-[var(--text-tertiary)]">Step {step} of 4</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <button onClick={() => { if (s.num < step) setStep(s.num); }}
              className={`flex flex-col items-center gap-1 transition-colors ${s.num === step ? "text-[var(--brand-primary)]" : s.num < step ? "text-[var(--status-approved)]" : "text-[var(--text-tertiary)]"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                s.num === step ? "border-[var(--brand-primary)] bg-[var(--bg-accent-subtle)]" : s.num < step ? "border-[var(--status-approved)] bg-[var(--status-approved)] text-white" : "border-[var(--border-primary)] bg-[var(--bg-tertiary)]"
              }`}>
                {s.num < step ? <Check size={16} /> : s.icon}
              </div>
              <span className="text-[10px] font-medium">{s.label}</span>
            </button>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded ${s.num < step ? "bg-[var(--status-approved)]" : "bg-[var(--border-primary)]"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Global Error */}
      {errors.submit && (
        <div className="p-3 rounded-xl bg-[var(--bg-danger-subtle)] border border-[var(--status-rejected)]/20">
          <p className="text-sm text-[var(--status-rejected)] flex items-center gap-2"><AlertTriangle size={16} /> {errors.submit}</p>
        </div>
      )}

      {/* Step 1: Violation Details */}
      {step === 1 && (
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5">Violation Details</h2>
          <div className="space-y-4">
            <Input label="Vehicle Number *" placeholder="e.g. TN 01 AB 1234" value={data.vehicleNumber} onChange={(e) => update("vehicleNumber", e.target.value.toUpperCase())} error={errors.vehicleNumber} />

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Violation Type *</label>
              <div className="flex flex-wrap gap-2">
                {violationTypes.map((type) => (
                  <button key={type} onClick={() => update("violationType", type)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${data.violationType === type ? "border-[var(--brand-primary)] bg-[var(--bg-accent-subtle)] text-[var(--brand-primary)]" : "border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]/50"}`}>
                    {type}
                  </button>
                ))}
                <button onClick={() => update("violationType", "Other")}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${data.violationType === "Other" ? "border-[var(--brand-primary)] bg-[var(--bg-accent-subtle)] text-[var(--brand-primary)]" : "border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]/50"}`}>
                  Other
                </button>
              </div>
              {errors.violationType && <p className="text-xs text-[var(--status-rejected)] mt-1">{errors.violationType}</p>}
            </div>

            {data.violationType === "Other" && (
              <Input label="Describe the Violation" placeholder="What violation did you observe?" value={data.customViolation} onChange={(e) => update("customViolation", e.target.value)} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Vehicle Type</label>
                <select value={data.vehicleType} onChange={(e) => update("vehicleType", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors">
                  <option value="">Select</option>
                  {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Input label="Vehicle Color" placeholder="e.g. Red" value={data.vehicleColor} onChange={(e) => update("vehicleColor", e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Description *</label>
              <textarea placeholder="Describe what you witnessed in detail..." value={data.description} onChange={(e) => update("description", e.target.value)} rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors resize-none" />
              {errors.description && <p className="text-xs text-[var(--status-rejected)] mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Severity</label>
                <select value={data.severity} onChange={(e) => update("severity", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors">
                  {severityLevels.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={data.isRepeatOffender} onChange={(e) => update("isRepeatOffender", e.target.checked)} className="w-4 h-4 rounded accent-[var(--brand-primary)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Repeat offender?</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Location & Time */}
      {step === 2 && (
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5">Location & Time</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Location *</label>
              <div className="flex gap-2">
                <input placeholder="e.g. T. Nagar Signal, Mount Road" value={data.locationText} onChange={(e) => update("locationText", e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors" />
                <button onClick={detectLocation} disabled={detectingLocation}
                  className="px-3 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {detectingLocation ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                  <span className="hidden sm:inline">{detectingLocation ? "Detecting..." : "Detect"}</span>
                </button>
              </div>
              {errors.locationText && <p className="text-xs text-[var(--status-rejected)] mt-1">{errors.locationText}</p>}
              {errors.location && <p className="text-xs text-[var(--status-pending)] mt-1">{errors.location}</p>}
              {data.locationLat && <p className="text-xs text-[var(--status-approved)] mt-1">📍 GPS: {data.locationLat.toFixed(4)}, {data.locationLng?.toFixed(4)}</p>}
            </div>

            <Input label="Nearest Landmark" placeholder="e.g. Near Panagal Park signal" value={data.landmark} onChange={(e) => update("landmark", e.target.value)} />

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Direction of Travel</label>
              <select value={data.direction} onChange={(e) => update("direction", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors">
                <option value="">Select direction</option>
                {directions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Date *" type="date" value={data.date} onChange={(e) => update("date", e.target.value)} error={errors.date} />
              <Input label="Time *" type="time" value={data.time} onChange={(e) => update("time", e.target.value)} error={errors.time} />
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Evidence Upload */}
      {step === 3 && (
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Upload Evidence</h2>
          <p className="text-xs text-[var(--text-tertiary)] mb-5">Upload photos or videos (max 5, 20MB each). Clear evidence helps police act faster.</p>

          <button onClick={() => fileInputRef.current?.click()} disabled={media.length >= 5}
            className="w-full p-8 rounded-2xl border-2 border-dashed border-[var(--border-primary)] bg-[var(--bg-tertiary)] hover:border-[var(--brand-primary)]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <div className="text-center">
              <Upload size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
              <p className="text-sm font-medium text-[var(--text-primary)]">{media.length >= 5 ? "Maximum 5 files reached" : "Tap to upload photos or videos"}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">JPG, PNG, MP4 · Max 20MB per file</p>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleMediaSelect} className="hidden" />

          {media.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {media.map((m, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border border-[var(--border-primary)] aspect-square bg-[var(--bg-tertiary)]">
                  {m.type === "image" ? <img src={m.preview} alt="Evidence" className="w-full h-full object-cover" /> : <video src={m.preview} className="w-full h-full object-cover" />}
                  {m.uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 size={24} className="text-white animate-spin" /></div>}
                  {m.uploaded && <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-[var(--status-approved)] flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                  <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"><X size={14} /></button>
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60"><p className="text-[10px] text-white truncate">{m.file.name}</p></div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--text-tertiary)] mt-3">💡 Tip: Include the vehicle number plate clearly in at least one photo.</p>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="space-y-4">
          <Card variant="glass" padding="md">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Review Your Report</h2>
            <div className="space-y-3">
              {[
                ["Vehicle Number", data.vehicleNumber],
                ["Violation", data.violationType + (data.customViolation ? ` — ${data.customViolation}` : "")],
                ...(data.vehicleType ? [["Vehicle Type", data.vehicleType]] : []),
                ["Location", data.locationText],
                ["Date & Time", `${data.date} at ${data.time}`],
                ["Severity", data.severity],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-[var(--border-primary)]">
                  <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
                  <span className="text-sm text-[var(--text-primary)] text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              <div className="py-2 border-b border-[var(--border-primary)]">
                <span className="text-xs text-[var(--text-tertiary)]">Description</span>
                <p className="text-sm text-[var(--text-primary)] mt-1">{data.description}</p>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-xs text-[var(--text-tertiary)]">Evidence</span>
                <span className="text-sm text-[var(--text-primary)]">{media.length} file(s)</span>
              </div>
            </div>
          </Card>
          <Card variant="outlined" padding="sm">
            <p className="text-xs text-[var(--text-tertiary)] flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-[var(--status-pending)]" />
              By submitting, you confirm this report is truthful. Filing false reports is punishable under IPC Section 182 and will result in warnings and potential ban.
            </p>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1"><ArrowLeft size={16} className="mr-1" /> Back</Button>}
        {step < 4 ? (
          <Button variant="primary" onClick={handleNext} className="flex-1">Next <ArrowRight size={16} className="ml-1" /></Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? <><Loader2 size={16} className="mr-1 animate-spin" /> Submitting...</> : "📸 Submit Report"}
          </Button>
        )}
      </div>
    </div>
  );
}
