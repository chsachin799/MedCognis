"use client";

import { Activity, Bell, LayoutDashboard, Menu, Settings, Users, Upload, FileText, BarChart3, Heart, Shield, Zap, ChevronRight, AlertTriangle, AlertCircle, CheckCircle, Moon, Sun, Mail, Smartphone, BellRing, HelpCircle, Calendar, Send, MessageSquare, Phone, Clock, ExternalLink, RefreshCw, UploadCloud } from "lucide-react";
import StatsPanel from "@/components/StatsPanel";
import TriageDashboard from "@/components/TriageDashboard";
import ScrollFrameSequence from "@/components/ScrollFrameSequence";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { assessRisk, MOCK_PATIENTS } from "@/lib/triage-engine";
import { Patient } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

type View = "dashboard" | "patients" | "analytics" | "analysis" | "config" | "support";

const API_BASE = process.env.NODE_ENV === "development" ? "http://localhost:8000" : "";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [csvPatients, setCsvPatients] = useState<Patient[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({ email: true, sms: false, app: true });
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ name: "", email: "", date: "", time: "", reason: "" });
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const MOCK_DOCTORS = [
    {
      id: "D2",
      name: "Dr. James Wilson",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
      specialty: "Neurology Specialist",
      education: "MBBS, DNB Neurology - NIMHANS",
      experience: "12 Years",
      languages: "English, Spanish",
      availability: "On Call",
      stats: { consultations: "8k+", rating: 4.8 },
      description: "Specializes in neuro-critical care and stroke management. Pioneer in integrating AI with neural diagnostics."
    },
    {
      id: "D3",
      name: "Dr. Elena Rodriguez",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300",
      specialty: "Internal Medicine",
      education: "MD Internal Medicine - Johns Hopkins University",
      experience: "10 Years",
      languages: "Spanish, English, French",
      availability: "In-Clinic",
      stats: { consultations: "9.5k+", rating: 4.9 },
      description: "Focused on comprehensive diagnostic management and multi-system pathology. Passionate about preventative clinical systems."
    },
    {
      id: "D4",
      name: "Dr. Arjun Kapoor",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300",
      specialty: "Pulmonology Chief",
      education: "MD, Fellowship in Lung Transplant - Cleveland Clinic",
      experience: "18 Years",
      languages: "Hindi, English, Punjabi",
      availability: "Training",
      stats: { consultations: "15k+", rating: 4.7 },
      description: "Veteran in respiratory diseases and pulmonary critical care. Instrumental in setting up the MedCognis Lung Lab."
    },
    {
      id: "D5",
      name: "Dr. Chloe Zhang",
      image: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&q=80&w=300&h=300",
      specialty: "Pediatrics Specialist",
      education: "MD - Stanford School of Medicine",
      experience: "9 Years",
      languages: "Mandarin, English",
      availability: "In-Clinic",
      stats: { consultations: "7k+", rating: 4.9 },
      description: "Dedicated to pediatric preventative health and neonatal care informatics."
    },
    {
      id: "D6",
      name: "Dr. Marcus Thorne",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300",
      specialty: "Orthopedic Surgeon",
      education: "MD - Oxford University, FRCS",
      experience: "14 Years",
      languages: "English, French",
      availability: "On Call",
      stats: { consultations: "11k+", rating: 4.8 },
      description: "Expert in joint replacement and sports traumatology with AI-assisted surgical planning."
    },
    {
      id: "D7",
      name: "Dr. Sofia Al-Fayed",
      image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300&h=300",
      specialty: "Gastroenterology",
      education: "MD - Cairo University Medical School",
      experience: "11 Years",
      languages: "Arabic, English",
      availability: "In-Clinic",
      stats: { consultations: "8.5k+", rating: 4.7 },
      description: "Specializes in inflammatory bowel disease and hepatology with focus on precision nutrition."
    }
  ];


  // All patients = mock + CSV-uploaded
  const allPatients = [...MOCK_PATIENTS, ...csvPatients].sort((a, b) => b.riskScore - a.riskScore);

  // Universal file parser — CSV, TSV, TXT, JSON
  const handleDataFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      let rows: Record<string, string>[] = [];

      // JSON format
      if (file.name.endsWith(".json")) {
        try {
          const json = JSON.parse(text);
          const items = Array.isArray(json) ? json : [json];
          rows = items.map((item: Record<string, unknown>) => {
            const row: Record<string, string> = {};
            for (const [k, v] of Object.entries(item)) {
              row[k.trim().toLowerCase().replace(/\s+/g, "_")] = String(v ?? "");
            }
            return row;
          });
        } catch { return; }
      } else {
        // CSV / TSV / TXT — auto-detect delimiter
        const lines = text.trim().split("\n");
        if (lines.length < 2) return;
        const firstLine = lines[0];
        const delimiter = firstLine.includes("\t") ? "\t" : ",";
        const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(delimiter).map(v => v.trim());
          if (values.length < 2) continue;
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
          rows.push(row);
        }
      }

      // Parse rows using ONLY the specified parameters
      const parsed: Patient[] = rows.map((row, i) => {
        const symptoms = (row["symptoms"] || "").split(";").map(s => s.trim()).filter(Boolean);
        const history = (row["pre-existing_conditions"] || row["pre_existing_conditions"] || "").split(";").map(s => s.trim()).filter(Boolean);
        const hr = parseInt(row["heart_rate"] || "80");
        const temp = parseFloat(row["temperature"] || "37.0");
        const bp = row["blood_pressure"] || "120/80";

        const vitals = { heartRate: hr, bloodPressure: bp, spo2: 98, temperature: temp };
        const result = assessRisk(symptoms, vitals, history);

        // Use Risk_Level from file if provided, else use AI-calculated
        const fileRisk = (row["risk_level"] || "").trim();
        const riskLevel = (["High", "Medium", "Low"].includes(fileRisk) ? fileRisk : result.riskLevel) as "High" | "Medium" | "Low";

        return {
          id: row["patient_id"] || `P-${1000 + i}`,
          name: `Patient ${row["patient_id"] || i + 1}`,
          age: parseInt(row["age"] || "0"),
          gender: (row["gender"] as "Male" | "Female" | "Other") || "Other",
          symptoms,
          vitals,
          history,
          riskScore: result.riskScore,
          riskLevel,
          department: result.department,
          admittedAt: new Date().toISOString(),
          justification: result.justification,
          predicted_disease: (result as any).predicted_disease,
          curing_process: (result as any).curing_process,
        };
      });

      setCsvPatients(prev => [...prev, ...parsed]);
    };
    reader.readAsText(file);
  }, []);

  const ACCEPTED_EXTS = [".csv", ".tsv", ".txt", ".json"];

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && ACCEPTED_EXTS.some(ext => file.name.toLowerCase().endsWith(ext))) handleDataFile(file);
  }, [handleDataFile]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleDataFile(file);
  }, [handleDataFile]);

  const handleModelRetrain = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/train`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(`Model retrained successfully! Accuracy: ${(data.metrics.accuracy * 100).toFixed(2)}%`);
      } else {
        alert(`Error retraining model: ${data.message}`);
      }
    } catch (err) {
      alert("Failed to connect to backend for retraining.");
    }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className={cn(
      "flex min-h-screen relative transition-colors duration-500",
      darkMode
        ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white"
        : "bg-gradient-to-br from-slate-100 via-white to-blue-50 text-slate-900"
    )}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Scroll Animation Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <ScrollFrameSequence frameCount={200} height="100vh" />
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-all duration-300 md:relative md:translate-x-0",
        darkMode ? "glass border-white/5" : "bg-white/80 backdrop-blur-xl border-slate-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-medical-brand flex items-center justify-center">
            <Activity className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">MedCognis <span className="text-medical-brand">Health</span></h1>
        </div>

        <nav className="p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")} />
          <NavItem icon={<Users size={20} />} label="Patient Records" active={activeView === "patients"} onClick={() => setActiveView("patients")} />
          <NavItem icon={<BarChart3 size={20} />} label="Analytics" active={activeView === "analytics"} onClick={() => setActiveView("analytics")} />
          <NavItem icon={<Zap size={20} />} label="Training & Analysis" active={activeView === "analysis"} onClick={() => setActiveView("analysis")} />
          <NavItem icon={<Settings size={20} />} label="System Config" active={activeView === "config"} onClick={() => setActiveView("config")} />
          <NavItem icon={<HelpCircle size={20} />} label="Support & Help" active={activeView === "support"} onClick={() => setActiveView("support")} />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
          <div className="flex items-center gap-2 px-6 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-medical-brand flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-medical-brand/20">M</div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">MedCognis Health</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-semibold">Health Command Center</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
          <button
            className="md:hidden p-2 hover:bg-white/5 rounded-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 hover:bg-white/5 rounded-full relative">
              <Bell size={20} className="opacity-70" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-medical-brand rounded-full"></span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">

          {/* ═══════════ DASHBOARD VIEW ═══════════ */}
          {activeView === "dashboard" && (
            <div className="space-y-8">
              {/* Hero Description */}
              <div className="glass-panel p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-medical-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-medical-brand" size={20} />
                    <span className="text-xs uppercase tracking-widest text-medical-brand font-bold">MedCognis Health AI Platform</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    Intelligent Patient Flow <br />
                    <span className="text-medical-brand">& Triage System</span>
                  </h2>
                  <p className="text-slate-400 max-w-2xl leading-relaxed mb-4">
                    A mission-critical clinical dashboard powered by AI-driven symptom analysis and real-time
                    patient prioritization. Designed to transform complex medical data into actionable intelligence,
                    enabling clinicians to make faster, safer, and more informed decisions at the point of care.
                  </p>
                  <div className="flex flex-wrap gap-6 mt-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-medical-critical" />
                      <span className="text-slate-300">Real-time Vitals Monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-medical-warning" />
                      <span className="text-slate-300">AI-Powered Risk Scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-medical-success" />
                      <span className="text-slate-300">Secure Health Protocols</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-6 border-t border-white/5 pt-4">
                    Created by <span className="text-medical-brand font-semibold">Phoenixphones</span> · Hackathon 2026
                  </p>
                </div>
              </div>

              {/* Clinician Spotlight - Sidewise Motion */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Users size={20} className="text-medical-brand" /> Clinician Spotlight
                  </h3>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-medical-brand animate-pulse"></div>
                    <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Live Availability</span>
                  </div>
                </div>

                <div className="overflow-hidden no-scrollbar -mx-2 px-2 mask-fade-right relative">
                  <div className="animate-marquee py-2 flex gap-4">
                    {[...MOCK_DOCTORS, ...MOCK_DOCTORS].map((doc, idx) => (
                      <div
                        key={`${doc.id}-${idx}`}
                        onClick={() => setSelectedDoctor(doc)}
                        className="min-w-[280px] glass-panel p-4 cursor-pointer hover:border-medical-brand/50 hover:bg-medical-brand/5 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-medical-brand/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-medical-brand/20 transition-colors"></div>

                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-medical-brand/10 border border-medical-brand/20 relative overflow-hidden">
                            {doc.image ? (
                              <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-medical-brand font-bold text-lg">
                                {doc.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm tracking-tight">{doc.name}</h4>
                            <p className="text-[10px] text-medical-brand font-bold uppercase tracking-wider">{doc.specialty}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-[10px] opacity-60">
                            <span>Experience</span>
                            <span className="font-bold">{doc.experience}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] opacity-60">
                            <span>Patient Rating</span>
                            <span className="font-bold text-amber-400">★ {doc.stats.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                            doc.availability === "In-Clinic" ? "bg-medical-success/10 text-emerald-400" :
                              doc.availability === "On Call" ? "bg-medical-warning/10 text-amber-400" :
                                "bg-white/5 text-slate-400"
                          )}>
                            {doc.availability}
                          </span>
                          <ChevronRight size={14} className="opacity-30 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ PATIENT RECORDS VIEW ═══════════ */}
          {activeView === "patients" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="text-medical-brand" /> Patient Records
                </h2>
                <p className="text-sm opacity-60 mt-1">Upload a CSV file with patient data for AI-driven symptom analysis.</p>
              </div>

              {/* CSV Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={cn(
                  "glass-panel p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all",
                  dragOver ? "border-medical-brand bg-medical-brand/10 scale-[1.01]" : "border-white/10 hover:border-white/20"
                )}
              >
                <Upload size={40} className="mx-auto mb-4 text-medical-brand opacity-70" />
                <p className="text-lg font-semibold mb-2">Drag & Drop Patient Data File</p>
                <p className="text-sm text-slate-400 mb-4">Supports CSV, TSV, TXT, and JSON formats</p>
                <label className="inline-block px-6 py-2.5 bg-medical-brand text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors">
                  Browse Files
                  <input type="file" accept=".csv,.tsv,.txt,.json" onChange={onFileInput} className="hidden" />
                </label>
                <p className="text-xs text-slate-500 mt-4">Required columns: Patient_ID, Age, Gender, Symptoms (semicolon-separated), Blood Pressure, Heart Rate, Temperature, Pre-Existing Conditions · Risk_Level is optional</p>
              </div>

              {/* Uploaded Patients */}
              {csvPatients.length > 0 && (
                <div className="glass-panel p-4">
                  <h3 className="text-sm font-semibold mb-3 text-slate-400 uppercase tracking-wider">
                    Uploaded Patients ({csvPatients.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-auto">
                    {csvPatients.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => { setSelectedPatient(p); setActiveView("analytics"); }}>
                        <div className="flex items-center gap-3">
                          <div className={cn("w-3 h-3 rounded-full", p.riskLevel === "High" ? "bg-medical-critical animate-pulse" : p.riskLevel === "Medium" ? "bg-medical-warning" : "bg-medical-success")}></div>
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs opacity-50">{p.symptoms.join(", ")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("px-2 py-0.5 rounded text-xs font-bold",
                            p.riskLevel === "High" ? "bg-medical-critical/20 text-rose-300" :
                              p.riskLevel === "Medium" ? "bg-medical-warning/20 text-amber-300" :
                                "bg-medical-success/20 text-emerald-300"
                          )}>{p.riskLevel}</span>
                          <ChevronRight size={16} className="opacity-30" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Patients Table */}
              <div className="glass-panel p-4">
                <h3 className="text-sm font-semibold mb-3 text-slate-400 uppercase tracking-wider">All Patients ({allPatients.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-white/5">
                        <th className="pb-2 pr-4">ID</th>
                        <th className="pb-2 pr-4">Name</th>
                        <th className="pb-2 pr-4">Age</th>
                        <th className="pb-2 pr-4">Risk</th>
                        <th className="pb-2 pr-4">Score</th>
                        <th className="pb-2">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPatients.map((p) => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => { setSelectedPatient(p); setActiveView("analytics"); }}>
                          <td className="py-2 pr-4 font-mono text-xs opacity-60">{p.id}</td>
                          <td className="py-2 pr-4 font-medium">{p.name}</td>
                          <td className="py-2 pr-4">{p.age}</td>
                          <td className="py-2 pr-4">
                            <span className={cn("px-2 py-0.5 rounded text-xs font-bold",
                              p.riskLevel === "High" ? "bg-medical-critical/20 text-rose-300" :
                                p.riskLevel === "Medium" ? "bg-medical-warning/20 text-amber-300" :
                                  "bg-medical-success/20 text-emerald-300"
                            )}>{p.riskLevel}</span>
                          </td>
                          <td className="py-2 pr-4">{p.riskScore}</td>
                          <td className="py-2">{p.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ ANALYTICS VIEW ═══════════ */}
          {activeView === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="text-medical-brand" /> Analytics & Diagnosis
                  </h2>
                  <p className="text-sm opacity-60 mt-1">Detailed patient analysis and diagnosis breakdown.</p>
                </div>
                {selectedPatient && (
                  <button onClick={() => setSelectedPatient(null)} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    View All Patients
                  </button>
                )}
              </div>

              {/* Selected Patient Detail */}
              {selectedPatient ? (
                <div className="space-y-4">
                  {/* Patient Header */}
                  <div className="glass-panel p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{selectedPatient.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{selectedPatient.gender}, {selectedPatient.age} years · ID: {selectedPatient.id}</p>
                      </div>
                      <div className={cn("px-4 py-2 rounded-lg text-sm font-bold",
                        selectedPatient.riskLevel === "High" ? "bg-medical-critical/20 text-rose-300 animate-pulse" :
                          selectedPatient.riskLevel === "Medium" ? "bg-medical-warning/20 text-amber-300" :
                            "bg-medical-success/20 text-emerald-300"
                      )}>
                        Risk: {selectedPatient.riskLevel} ({selectedPatient.riskScore}/100)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vitals */}
                    <div className="glass-panel p-5">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Vitals</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <VitalItem label="Heart Rate" value={`${selectedPatient.vitals.heartRate} bpm`} alert={selectedPatient.vitals.heartRate > 120 || selectedPatient.vitals.heartRate < 40} />
                        <VitalItem label="Blood Pressure" value={selectedPatient.vitals.bloodPressure} />
                        <VitalItem label="SpO2" value={`${selectedPatient.vitals.spo2}%`} alert={selectedPatient.vitals.spo2 < 90} />
                        <VitalItem label="Temperature" value={`${selectedPatient.vitals.temperature}°C`} alert={selectedPatient.vitals.temperature > 39} />
                      </div>
                    </div>

                    {/* Symptoms & History */}
                    <div className="glass-panel p-5">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Symptoms</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedPatient.symptoms.map(s => (
                          <span key={s} className="px-3 py-1 bg-medical-critical/10 border border-medical-critical/20 rounded-full text-xs text-rose-300">{s}</span>
                        ))}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Medical History</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.history.length > 0 ? selectedPatient.history.map(h => (
                          <span key={h} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs">{h}</span>
                        )) : <span className="text-xs opacity-40">No significant history</span>}
                      </div>
                    </div>
                  </div>

                  {/* Vitals Analysis & Trends */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="glass-panel p-6">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Vital Parameter Profile</h4>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                            { subject: 'HR', A: selectedPatient.vitals.heartRate, fullMark: 150 },
                            { subject: 'Temp', A: selectedPatient.vitals.temperature * 2, fullMark: 100 }, // Scaled for radar
                            { subject: 'SpO2', A: selectedPatient.vitals.spo2, fullMark: 100 },
                            { subject: 'Risk', A: selectedPatient.riskScore, fullMark: 100 },
                            { subject: 'Pain', A: (selectedPatient.vitals as any).painSeverity ? (selectedPatient.vitals as any).painSeverity * 10 : 20, fullMark: 100 },
                          ]}>
                            <PolarGrid stroke="#ffffff10" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Radar
                              name="Patient"
                              dataKey="A"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.6}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-center text-slate-500 mt-2 uppercase tracking-widest">Diagnostic Radar Profile</p>
                    </div>

                    <div className="glass-panel p-6">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Condition Intensity</h4>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'HR', val: selectedPatient.vitals.heartRate, color: selectedPatient.vitals.heartRate > 100 ? '#f43f5e' : '#3b82f6' },
                            { name: 'SpO2', val: selectedPatient.vitals.spo2, color: selectedPatient.vitals.spo2 < 95 ? '#f43f5e' : '#10b981' },
                            { name: 'Temp', val: selectedPatient.vitals.temperature, color: selectedPatient.vitals.temperature > 38 ? '#f43f5e' : '#3b82f6' },
                            { name: 'Risk', val: selectedPatient.riskScore, color: selectedPatient.riskScore > 70 ? '#f43f5e' : '#f59e0b' },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis hide domain={[0, 160]} />
                            <Tooltip
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                            />
                            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                              {
                                [
                                  { name: 'HR', val: selectedPatient.vitals.heartRate, color: selectedPatient.vitals.heartRate > 100 ? '#f43f5e' : '#3b82f6' },
                                  { name: 'SpO2', val: selectedPatient.vitals.spo2, color: selectedPatient.vitals.spo2 < 95 ? '#f43f5e' : '#10b981' },
                                  { name: 'Temp', val: selectedPatient.vitals.temperature, color: selectedPatient.vitals.temperature > 38 ? '#f43f5e' : '#3b82f6' },
                                  { name: 'Risk', val: selectedPatient.riskScore, color: selectedPatient.riskScore > 70 ? '#f43f5e' : '#f59e0b' },
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                ))
                              }
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-center text-slate-500 mt-2 uppercase tracking-widest">Comparative Vitals Benchmark</p>
                    </div>
                  </div>

                  {/* AI Reasoning & treatment Plan */}
                  <div className="glass-panel p-5 mt-4">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Diagnosis & Treatment Plan</h4>

                    {/* Predicted Disease & Dept */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-xl bg-medical-brand/5 border border-medical-brand/20">
                        <p className="text-[10px] uppercase tracking-widest text-medical-brand font-bold mb-1">Predicted Disease</p>
                        <p className="text-lg font-bold">{(selectedPatient as any).predicted_disease || "General Clinical Syndrome"}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Recommended Specialist</p>
                        <p className="text-lg font-bold">{(selectedPatient as any).recommended_specialist || "General Physician"}</p>
                      </div>
                    </div>

                    {/* Curing Process / Steps */}
                    <div className="mb-4">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity size={14} /> Medical Curing Process
                      </h5>
                      <div className="space-y-2">
                        {((selectedPatient as any).curing_process || ["Stabilize vitals", "Awaiting specialist review"]).map((step: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 text-sm">
                            <div className="w-5 h-5 rounded-full bg-medical-brand/20 flex items-center justify-center text-[10px] font-bold text-medical-brand">{idx + 1}</div>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diagnostic Reasoning</h5>
                    <div className="space-y-2">
                      {selectedPatient.justification.map((reason, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                          <AlertTriangle size={16} className="text-medical-warning mt-0.5 shrink-0" />
                          <span className="text-sm">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Patient List for Analytics */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allPatients.map((p) => (
                    <div key={p.id} className="glass-panel p-4 cursor-pointer hover:scale-[1.02] transition-all"
                      onClick={() => setSelectedPatient(p)}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{p.name}</h4>
                          <p className="text-xs opacity-50">{p.gender}, {p.age}y · {p.id}</p>
                        </div>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold",
                          p.riskLevel === "High" ? "bg-medical-critical/20 text-rose-300" :
                            p.riskLevel === "Medium" ? "bg-medical-warning/20 text-amber-300" :
                              "bg-medical-success/20 text-emerald-300"
                        )}>{p.riskLevel}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{p.symptoms.join(", ")}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="opacity-50">Dept: {p.department}</span>
                        <span className="text-medical-brand flex items-center gap-1">View Details <ChevronRight size={12} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ CONFIG VIEW ═══════════ */}
          {activeView === "config" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Settings className="text-medical-brand" /> System Configuration
                </h2>
                <p className="text-sm opacity-60 mt-1">Customize your dashboard experience and notification preferences.</p>
              </div>

              {/* Theme Settings */}
              <div className={cn("p-6 rounded-xl border", darkMode ? "glass-panel" : "bg-white border-slate-200 shadow-sm")}>
                <h3 className={cn("text-sm font-semibold uppercase tracking-wider mb-4", darkMode ? "text-slate-400" : "text-slate-500")}>Appearance</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon size={20} className="text-medical-brand" /> : <Sun size={20} className="text-amber-500" />}
                    <div>
                      <p className="font-medium">{darkMode ? "Dark Mode" : "Light Mode"}</p>
                      <p className={cn("text-xs", darkMode ? "text-white/50" : "text-slate-400")}>Switch between dark and light themes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={cn(
                      "w-11 h-6 rounded-full relative transition-all duration-300 cursor-pointer",
                      darkMode ? "bg-medical-brand" : "bg-slate-300"
                    )}
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    <span className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300",
                      darkMode ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className={cn("p-6 rounded-xl border", darkMode ? "glass-panel" : "bg-white border-slate-200 shadow-sm")}>
                <h3 className={cn("text-sm font-semibold uppercase tracking-wider mb-4", darkMode ? "text-slate-400" : "text-slate-500")}>Notifications</h3>
                <div className="space-y-4">
                  <ToggleRow
                    icon={<Mail size={20} />}
                    label="Email Notifications"
                    description="Receive triage alerts and reports via email"
                    checked={notifications.email}
                    onChange={() => setNotifications(n => ({ ...n, email: !n.email }))}
                    darkMode={darkMode}
                  />
                  <div className={cn("border-t", darkMode ? "border-white/5" : "border-slate-100")} />
                  <ToggleRow
                    icon={<Smartphone size={20} />}
                    label="SMS Alerts"
                    description="Get critical patient alerts via SMS"
                    checked={notifications.sms}
                    onChange={() => setNotifications(n => ({ ...n, sms: !n.sms }))}
                    darkMode={darkMode}
                  />
                  <div className={cn("border-t", darkMode ? "border-white/5" : "border-slate-100")} />
                  <ToggleRow
                    icon={<BellRing size={20} />}
                    label="In-App Alerts"
                    description="Show push notifications within the dashboard"
                    checked={notifications.app}
                    onChange={() => setNotifications(n => ({ ...n, app: !n.app }))}
                    darkMode={darkMode}
                  />
                </div>
              </div>

              {/* Current Settings Summary */}
              <div className="glass-panel p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Current Configuration</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs opacity-50 mb-1">Theme</p>
                    <p className="font-semibold">{darkMode ? "Dark" : "Light"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs opacity-50 mb-1">Email</p>
                    <p className={cn("font-semibold", notifications.email ? "text-medical-success" : "text-slate-500")}>{notifications.email ? "Enabled" : "Disabled"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs opacity-50 mb-1">SMS</p>
                    <p className={cn("font-semibold", notifications.sms ? "text-medical-success" : "text-slate-500")}>{notifications.sms ? "Enabled" : "Disabled"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs opacity-50 mb-1">App Alerts</p>
                    <p className={cn("font-semibold", notifications.app ? "text-medical-success" : "text-slate-500")}>{notifications.app ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ SUPPORT VIEW ═══════════ */}
          {activeView === "support" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <HelpCircle className="text-medical-brand" /> Support & Help
                </h2>
                <p className="text-sm opacity-60 mt-1">Get help, book appointments, and connect with hospital staff.</p>
              </div>

              {/* Contact Hospital Staff */}
              <div className="glass-panel p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Contact Hospital Staff</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Phone size={24} className="text-medical-brand mb-3" />
                    <p className="font-semibold mb-1">Emergency Line</p>
                    <p className="text-sm text-medical-brand">+91-1800-MED-911</p>
                    <p className="text-xs opacity-40 mt-1">Available 24/7</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Mail size={24} className="text-medical-brand mb-3" />
                    <p className="font-semibold mb-1">Email Support</p>
                    <p className="text-sm text-medical-brand">support@medcognis.health</p>
                    <p className="text-xs opacity-40 mt-1">Response within 2 hours</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setShowChat(true)}>
                    <MessageSquare size={24} className="text-medical-brand mb-3" />
                    <p className="font-semibold mb-1">Live Chat</p>
                    <p className="text-sm text-slate-300">Chat with AI Assistant</p>
                    <p className="text-xs opacity-40 mt-1">Available 24/7 (AI-Powered)</p>
                  </div>
                </div>
              </div>

              {/* Appointment Booking with Gmail */}
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Book Appointment (Fast Access)</h3>
                  <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-medical-brand hover:underline">
                    <ExternalLink size={12} /> Connect Gmail
                  </a>
                </div>
                {appointmentBooked ? (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="mx-auto mb-4 text-medical-success" />
                    <p className="text-lg font-semibold">Appointment Booked!</p>
                    <p className="text-sm text-slate-400 mt-1">A confirmation has been sent to your Gmail. You will receive real-time updates.</p>
                    <button onClick={() => { setAppointmentBooked(false); setAppointmentForm({ name: "", email: "", date: "", time: "", reason: "" }); }} className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">Book Another</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Patient Name" value={appointmentForm.name} onChange={(e) => setAppointmentForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
                    <input type="email" placeholder="Gmail Address" value={appointmentForm.email} onChange={(e) => setAppointmentForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
                    <input type="date" value={appointmentForm.date} onChange={(e) => setAppointmentForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
                    <input type="time" value={appointmentForm.time} onChange={(e) => setAppointmentForm(f => ({ ...f, time: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
                    <textarea placeholder="Reason for Visit" value={appointmentForm.reason} onChange={(e) => setAppointmentForm(f => ({ ...f, reason: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors md:col-span-2 resize-none" rows={3} />
                    <div className="md:col-span-2 flex items-center justify-between">
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> Confirmations sent via Gmail in real-time</p>
                      <button onClick={() => { if (appointmentForm.name && appointmentForm.email) setAppointmentBooked(true); }} className="px-6 py-2.5 bg-medical-brand text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"><Calendar size={16} /> Book Appointment</button>
                    </div>
                  </div>
                )}
              </div>

              {/* FAQs */}
              <div className="glass-panel p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">FAQs & Guides</h3>
                <div className="space-y-3">
                  {[
                    { q: "How does the AI triage system work?", a: "Our AI analyzes patient symptoms, vitals, and medical history to calculate a risk score and recommend the appropriate department for immediate care." },
                    { q: "How do I upload patient data?", a: "Go to Patient Records in the sidebar. You can drag and drop a CSV file or click Browse Files to upload patient data for AI analysis." },
                    { q: "What CSV format is required?", a: "Your CSV should include columns: Patient_ID, Age, Gender, Symptoms (semicolon-separated), Blood Pressure, Heart Rate, Temperature, Pre-Existing Conditions. Risk_Level is optional." },
                    { q: "How fast are appointment confirmations?", a: "Appointment confirmations are sent in real-time to your connected Gmail address. You'll receive updates for any schedule changes." },
                  ].map((faq, i) => (
                    <details key={i} className="group">
                      <summary className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors text-sm font-medium">
                        {faq.q}
                        <ChevronRight size={16} className="opacity-30 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="p-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="glass-panel p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Submit Feedback</h3>
                {feedbackSent ? (
                  <div className="text-center py-6">
                    <CheckCircle size={40} className="mx-auto mb-3 text-medical-success" />
                    <p className="font-semibold">Thank you for your feedback!</p>
                    <p className="text-sm text-slate-400 mt-1">We appreciate your input and will review it shortly.</p>
                    <button onClick={() => { setFeedbackSent(false); setFeedbackText(""); }} className="mt-3 text-xs text-medical-brand hover:underline">Submit another</button>
                  </div>
                ) : (
                  <div>
                    <textarea placeholder="Share your experience, suggestions, or report issues..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors resize-none" rows={4} />
                    <div className="flex justify-end mt-3">
                      <button onClick={() => { if (feedbackText.trim()) setFeedbackSent(true); }} className="px-5 py-2 bg-medical-brand text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"><Send size={14} /> Send Feedback</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ═══════════ TRAINING & ANALYSIS VIEW ═══════════ */}
          {activeView === "analysis" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="text-medical-brand" /> Training & Analysis
                  </h2>
                  <p className="text-sm opacity-60 mt-1">Directly analyze patient conditions or upload EHR documents for auto-fill.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Manual Analysis Form */}
                <div className="glass-panel p-8">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                    <Activity size={18} className="text-medical-brand" /> Clinical Diagnosis Support
                  </h3>
                  <PatientDiagnosisForm />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* AI Chat Assistant */}
      <ChatAssistant
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        messages={chatMessages}
        onSendMessage={async (msg: string) => {
          const newUserMsg = { role: "user" as const, content: msg };
          setChatMessages(prev => [...prev, newUserMsg]);

          try {
            const res = await fetch(`${API_BASE}/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: msg })
            });
            const data = await res.json();
            if (data.status === "success") {
              setChatMessages(prev => [...prev, { role: "ai", content: data.response }]);
            } else {
              setChatMessages(prev => [...prev, { role: "ai", content: "Error: " + data.message }]);
            }
          } catch (err) {
            setChatMessages(prev => [...prev, { role: "ai", content: "AI model connection failed." }]);
          }
        }}
      />

      {/* Clinician Profile Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors z-10"
            >
              <Activity size={20} className="rotate-45 opacity-50 hover:opacity-100" />
            </button>

            <div className="h-40 bg-gradient-to-r from-medical-brand/20 via-blue-900/40 to-slate-900/60 relative">
              <div className="absolute -bottom-10 left-8 w-24 h-24 rounded-2xl bg-medical-brand flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-medical-brand/20 border-4 border-slate-950 overflow-hidden">
                {selectedDoctor.image ? (
                  <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                ) : (
                  selectedDoctor.name.split(' ').map((n: any) => n[0]).join('')
                )}
              </div>
            </div>

            <div className="pt-14 p-8">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{selectedDoctor.name}</h3>
                <CheckCircle size={18} className="text-medical-brand" />
              </div>
              <p className="text-medical-brand font-semibold mb-6">{selectedDoctor.specialty}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Experience</p>
                  <p className="text-sm font-bold">{selectedDoctor.experience}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Education</p>
                  <p className="text-sm font-bold truncate" title={selectedDoctor.education}>{selectedDoctor.education.split(',')[0]}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-medical-brand font-bold mb-3">Clinical Profile</h4>
                  <p className="text-xs leading-relaxed opacity-70">{selectedDoctor.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-medium border border-white/10">Clinical Intelligence</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-medium border border-white/10">Precision Care</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-medium border border-white/10">Patient Care</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button className="flex-1 py-3 bg-medical-brand text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-medical-brand/20">
                  Contact Clinician
                </button>
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
                  View Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PatientDiagnosisForm() {
  const [formData, setFormData] = useState({
    Name: "",
    Age: 30,
    Gender: "Male",
    Symptoms: "Fever",
    Blood_Pressure: 120,
    Heart_Rate: 80,
    Temperature: 37.0,
    O2_Saturation: 98,
    Pain_Severity: 2,
    Consciousness: "Alert",
    Pre_Existing_Conditions: "None"
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422) {
          const detail = data.detail?.[0];
          throw new Error(detail ? `${detail.loc?.[1] || 'Field'}: ${detail.msg}` : "Validation failed. Check inputs.");
        }
        // Handle generic errors (like Duplicate Patient ID)
        const errorMsg = data.detail || data.message || "Failed to analyze patient data.";
        throw new Error(errorMsg);
      }

      setResult(data);
      setSuccess("Analysis complete successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="mb-6 p-4 border border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
        <label className="flex flex-col items-center justify-center cursor-pointer gap-2">
          <UploadCloud className="text-medical-brand" size={24} />
          <span className="text-sm font-medium">Upload EHR/EMR Document</span>
          <span className="text-xs opacity-50">Auto-fill form from PDF or Text</span>
          <input
            type="file"
            accept=".pdf,.txt,.csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setError(null);
              setSuccess(null);
              const formDataUpload = new FormData();
              formDataUpload.append("file", file);

              try {
                const res = await fetch(`${API_BASE}/parse_ehr`, {
                  method: "POST",
                  body: formDataUpload
                });
                const data = await res.json();

                if (res.ok && data.status === "success" && data.data) {
                  setFormData(prev => ({
                    ...prev,
                    ...data.data
                  }));
                  setSuccess("Document parsed and form auto-filled!");
                } else {
                  throw new Error(data.message || "Could not parse document.");
                }
              } catch (err: any) {
                setError(err.message || "Error uploading document.");
              }
            }}
          />
        </label>
      </div>

      <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1 md:col-span-1">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">Patient Name</label>
          <input type="text" placeholder="Full Name" required value={formData.Name || ""} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">Age</label>
          <input type="number" min="0" max="120" value={formData.Age || ""} onChange={(e) => setFormData({ ...formData, Age: e.target.value === "" ? 0 : parseInt(e.target.value) })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">Gender</label>
          <select value={formData.Gender} onChange={(e) => setFormData({ ...formData, Gender: e.target.value })} className="w-full px-4 py-3 bg-white text-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">Primary Symptom</label>
          <select value={formData.Symptoms} onChange={(e) => setFormData({ ...formData, Symptoms: e.target.value })} className="w-full px-4 py-3 bg-white text-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors">
            <option value="Chest Pain">Chest Pain</option>
            <option value="Fever">Fever</option>
            <option value="Cough">Cough</option>
            <option value="Numbness">Numbness</option>
            <option value="Abdominal Pain">Abdominal Pain</option>
            <option value="Headache">Headache</option>
            <option value="Breathlessness">Breathlessness</option>
            <option value="Vomiting">Vomiting</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">Systolic BP</label>
          <input type="number" min="50" max="250" value={formData.Blood_Pressure || ""} onChange={(e) => setFormData({ ...formData, Blood_Pressure: e.target.value === "" ? 0 : parseInt(e.target.value) })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">Heart Rate</label>
          <input type="number" min="30" max="300" value={formData.Heart_Rate || ""} onChange={(e) => setFormData({ ...formData, Heart_Rate: e.target.value === "" ? 0 : parseInt(e.target.value) })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">Temp (°C)</label>
          <input type="number" step="0.1" min="25" max="45" value={formData.Temperature || ""} onChange={(e) => setFormData({ ...formData, Temperature: e.target.value === "" ? 0 : parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">SpO2 (%)</label>
          <input type="number" min="0" max="100" value={formData.O2_Saturation || ""} onChange={(e) => setFormData({ ...formData, O2_Saturation: e.target.value === "" ? 0 : parseInt(e.target.value) })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">Pain (0-10)</label>
          <input type="number" min="0" max="10" value={formData.Pain_Severity === 0 ? "0" : formData.Pain_Severity || ""} onChange={(e) => setFormData({ ...formData, Pain_Severity: e.target.value === "" ? 0 : parseInt(e.target.value) })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">Consciousness</label>
          <select value={formData.Consciousness} onChange={(e) => setFormData({ ...formData, Consciousness: e.target.value })} className="w-full px-4 py-3 bg-white text-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-medical-brand transition-colors">
            <option value="Alert">Alert</option>
            <option value="Confused">Confused</option>
            <option value="Unresponsive">Unresponsive</option>
          </select>
        </div>
        <div className="md:col-span-2 pt-4 flex gap-3">
          <button type="button" onClick={() => setFormData({ Name: "", Age: 30, Gender: "Male", Symptoms: "Fever", Blood_Pressure: 120, Heart_Rate: 80, Temperature: 37.0, O2_Saturation: 98, Pain_Severity: 2, Consciousness: "Alert", Pre_Existing_Conditions: "None" })} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
            Reset
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-medical-brand text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
            {loading ? "Analyzing..." : "Analyze Patient Condition"}
          </button>
        </div>
      </form>

      {result && (
        <div className="p-4 rounded-xl bg-medical-brand/10 border border-medical-brand/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-medical-brand mb-1">
                Risk Assessment - <span className="text-white/70 italic">{result.Patient_ID}</span>
              </p>
              <h4 className={cn("text-2xl font-black",
                result.risk_level === "High" ? "text-medical-critical" :
                  result.risk_level === "Medium" ? "text-medical-warning" : "text-medical-success"
              )}>{result.risk_level}</h4>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-50 uppercase tracking-wider mb-1">Confidence</p>
              <p className="font-bold text-lg">{result.confidence}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Shield className="text-medical-brand shrink-0" size={18} />
              <p className="text-sm">Recommend Department: <span className="font-bold">{result.department}</span></p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider opacity-30">AI Insights</p>
              {result.insights?.map((insight: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <Zap className="text-medical-warning shrink-0 mt-0.5" size={14} />
                  <p className="text-xs text-slate-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
      active ? "bg-medical-brand text-white shadow-lg shadow-medical-brand/20" : "text-slate-400 hover:text-white hover:bg-white/5"
    )}>
      <span className={cn("transition-colors", active ? "text-white" : "text-slate-500 group-hover:text-white")}>
        {icon}
      </span>
      {label}
    </button>
  )
}

function VitalItem({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={cn("p-3 rounded-lg", alert ? "bg-medical-critical/10 border border-medical-critical/20" : "bg-white/5")}>
      <p className="text-xs opacity-50 mb-1">{label}</p>
      <p className={cn("text-lg font-bold", alert ? "text-medical-critical" : "text-white")}>{value}</p>
    </div>
  );
}

function ToggleRow({ icon, label, description, checked, onChange, darkMode = true }: { icon: React.ReactNode; label: string; description: string; checked: boolean; onChange: () => void; darkMode?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-medical-brand">{icon}</span>
        <div>
          <p className="font-medium">{label}</p>
          <p className={cn("text-xs", darkMode ? "text-white/50" : "text-slate-400")}>{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={cn(
          "w-11 h-6 rounded-full relative transition-all duration-300 cursor-pointer",
          checked ? "bg-medical-brand" : darkMode ? "bg-slate-600" : "bg-slate-300"
        )}
        aria-label={`Toggle ${label}`}
      >
        <span className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300",
          checked ? "left-6" : "left-1"
        )} />
      </button>
    </div>
  );
}



function ChatAssistant({ isOpen, onClose, messages, onSendMessage }: {
  isOpen: boolean;
  onClose: () => void;
  messages: { role: "user" | "ai"; content: string }[];
  onSendMessage: (msg: string) => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);


  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] glass-panel z-50 flex flex-col shadow-2xl border-white/20 animate-in slide-in-from-bottom-6 duration-300">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-medical-brand/10 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-medical-brand" />
          <span className="font-bold text-sm uppercase tracking-wider">MedCognis AI Support</span>
        </div>
        <button onClick={onClose} className="opacity-50 hover:opacity-100"><Zap size={18} className="rotate-45" /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-6">
            <div className="text-center py-4 opacity-40">
              <MessageSquare size={32} className="mx-auto mb-2" />
              <p className="text-sm font-medium">How can I help you today?</p>
              <p className="text-xs mt-1">Select a common prompt to get started</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                { icon: <Shield size={14} />, text: "How do I interpret my risk score?" },
                { icon: <AlertTriangle size={14} />, text: "Emergency protocol for high risk" },
                { icon: <Activity size={14} />, text: "Guide to effective symptom reporting" },
                { icon: <Calendar size={14} />, text: "How to book a priority appointment" }
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(p.text)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left text-xs hover:bg-medical-brand/20 hover:border-medical-brand/50 transition-all group"
                >
                  <span className="text-medical-brand group-hover:scale-110 transition-transform">{p.icon}</span>
                  <span className="opacity-70 group-hover:opacity-100">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap",
              m.role === "user" ? "bg-medical-brand text-white rounded-br-none" : "bg-white/10 text-slate-200 rounded-bl-none border border-white/5"
            )}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { onSendMessage(input); setInput(""); } }} className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:border-medical-brand"
          />
          <button type="submit" className="absolute right-2 top-1.5 text-medical-brand hover:text-white transition-colors">
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
