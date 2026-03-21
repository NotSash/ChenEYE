"use client";

import React from "react";
import { Lock, MapPin, Bell, Globe, Smartphone, Scale } from "lucide-react";

const features = [
  {
    icon: <Lock size={24} />,
    title: "🔒 100% Anonymous",
    description: "Your identity is never shared — not even with police. You're represented by an anonymous ID only.",
    accent: "var(--brand-sunset)",
  },
  {
    icon: <MapPin size={24} />,
    title: "📍 Hotspot Map",
    description: "See which areas in Chennai have the most violations. Data-driven awareness for safer routes.",
    accent: "var(--brand-sea)",
  },
  {
    icon: <Bell size={24} />,
    title: "🔔 Real-Time Updates",
    description: "Track your report from submission to action. Get notified at every step.",
    accent: "var(--brand-primary)",
  },
  {
    icon: <Globe size={24} />,
    title: "🌐 Multi-Language",
    description: "Use ChenEYE in English, Tamil, or Hindi. Switch anytime.",
    accent: "var(--brand-kolam)",
  },
  {
    icon: <Smartphone size={24} />,
    title: "📱 Works Everywhere",
    description: "Install like an app. Works on Android, iOS, and any browser. No app store needed.",
    accent: "var(--brand-leaf)",
  },
  {
    icon: <Scale size={24} />,
    title: "⚖️ Legally Backed",
    description: "Section 210B of the Motor Vehicles Act supports electronic evidence for traffic violations.",
    accent: "var(--brand-accent)",
  },
];

const safetyPoints = [
  "Reports visible only to authorized police officials",
  "Personal data encrypted and protected under India's DPDP Act 2023",
  "Filing false reports carries legal consequences (IPC Section 182)",
  "3-warning system ensures platform integrity",
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-28 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        {/* Features */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Why ChenEYE?</h2>
          <div className="mt-3 mx-auto w-16 h-1 rounded-full" style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C, #F59E0B)' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-frost rounded-2xl p-5 sm:p-6 float-card group"
            >
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ background: `color-mix(in srgb, ${f.accent} 12%, transparent)`, color: f.accent }}
              >
                {f.icon}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-1.5">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Safety — glass-aurora */}
        <div id="safety" className="mt-14 sm:mt-20 glass-aurora rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-[var(--status-approved-bg)] flex items-center justify-center mb-5 sm:mb-6">
              <Lock size={24} className="text-[var(--status-approved)]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-4">Your Safety is Our Priority</h3>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-left mt-6 sm:mt-8">
              {safetyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl glass">
                  <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[var(--status-approved)] flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <p className="text-sm text-[var(--text-secondary)]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
