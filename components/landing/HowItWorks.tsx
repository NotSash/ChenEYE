"use client";

import React from "react";
import { Camera, FileText, ShieldCheck, ArrowRight } from "lucide-react";
import { LinkButton } from "../ui/Button";

const steps = [
  {
    icon: <Camera size={28} />,
    emoji: "📸",
    title: "Capture the Violation",
    description:
      "See a traffic violation? Snap a photo or record a quick video. Include the vehicle's number plate for identification.",
    step: 1,
    gradient: "from-[#EA580C] to-[#FB923C]",
  },
  {
    icon: <FileText size={28} />,
    emoji: "📝",
    title: "Submit Your Report",
    description:
      "Fill in the details — vehicle number, location, type of violation. Our guided form makes it easy. Your identity stays anonymous.",
    step: 2,
    gradient: "from-[#B45309] to-[#F59E0B]",
  },
  {
    icon: <ShieldCheck size={28} />,
    emoji: "🚔",
    title: "Police Takes Action",
    description:
      "Chennai Traffic Police reviews your report and takes appropriate action. You'll be notified of every status update.",
    step: 3,
    gradient: "from-[#15803D] to-[#22C55E]",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-28 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
            How ChenEYE Works
          </h2>
          <div className="mt-3 mx-auto w-16 h-1 rounded-full" style={{ background: 'linear-gradient(135deg, #B45309, #D97706, #F59E0B)' }} />
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector (mobile) */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-leaf)] opacity-20" />
          {/* Horizontal connector (desktop) */}
          <div className="hidden md:block absolute top-20 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-accent)] opacity-20" />

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step) => (
              <div key={step.step} className="relative pl-14 md:pl-0">
                {/* Step number — absolute on mobile, centered on desktop */}
                <div className={`absolute left-0 top-0 md:relative md:mx-auto w-12 h-12 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold text-lg shadow-md z-10`}>
                  {step.step}
                </div>
                <div className="glass-frost rounded-2xl p-5 sm:p-6 md:mt-4 float-card">
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {step.emoji} {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 sm:mt-14 text-center">
          <LinkButton href="/register" variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
            Start Your First Report
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
