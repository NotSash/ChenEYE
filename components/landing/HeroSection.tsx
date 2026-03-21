"use client";

import React, { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Shield, Smartphone, Zap, ArrowRight, ChevronDown } from "lucide-react";
import { LinkButton } from "../ui/Button";
import Image from "next/image";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const anim = (delay: number) =>
    prefersReduced
      ? "opacity-100"
      : clsx(
          "transition-all duration-700 ease-out",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        );

  return (
    <section className="relative min-h-screen-real flex items-center overflow-hidden">
      {/* Background Image — Chennai Marina Beach */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-chennai.png"
          alt="Aerial view of Marina Beach, Chennai at sunset"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(18,16,8,0.7) 0%, rgba(18,16,8,0.5) 40%, rgba(18,16,8,0.6) 70%, rgba(18,16,8,0.85) 100%)'
      }} />

      {/* Warm glow accents */}
      <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#EA580C] opacity-[0.08] blur-[120px]" />
      <div className="absolute top-20 right-0 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#F59E0B] opacity-[0.06] blur-[120px]" />

      <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-6 py-20 sm:py-24 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className={anim(200)} style={{ transitionDelay: "200ms" }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-white/90 border border-white/15" style={{
                background: 'rgba(234, 88, 12, 0.2)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                🚦 Making Chennai&apos;s Roads Safer
              </span>
            </div>

            {/* Headline */}
            <h1
              className={clsx("mt-5 sm:mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight", anim(400))}
              style={{ transitionDelay: "400ms", textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
            >
              Report Traffic
              <br />
              Violations.{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#FB923C] via-[#F59E0B] to-[#E11D48] bg-clip-text text-transparent">
                  Anonymously.
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-[#FB923C] via-[#F59E0B] to-[#E11D48] rounded-full opacity-70" />
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={clsx("mt-4 sm:mt-6 text-base sm:text-lg text-white/75 max-w-md mx-auto lg:mx-0 leading-relaxed", anim(600))}
              style={{ transitionDelay: "600ms", textShadow: '0 1px 10px rgba(0,0,0,0.2)' }}
            >
              Your identity stays hidden. Your impact doesn&apos;t. Help Chennai
              Traffic Police take action with photo evidence.
            </p>

            {/* CTAs */}
            <div
              className={clsx("mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start", anim(800))}
              style={{ transitionDelay: "800ms" }}
            >
              <LinkButton href="/register" variant="primary" size="lg" rightIcon={<ArrowRight size={18} />} fullWidth className="sm:w-auto">
                Start Reporting
              </LinkButton>
              <button
                onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-6 text-sm sm:text-base font-semibold text-white border-2 border-white/25 rounded-xl hover:bg-white/15 hover:border-white/40 active:scale-[0.97] transition-all duration-200 touch-target"
                style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              >
                See How It Works
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Trust indicators */}
            <div
              className={clsx("mt-8 sm:mt-10 flex flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start", anim(1000))}
              style={{ transitionDelay: "1000ms" }}
            >
              {[
                { icon: <Shield size={15} />, text: "100% Anonymous" },
                { icon: <Smartphone size={15} />, text: "Any device" },
                { icon: <Zap size={15} />, text: "2 minutes" },
              ].map((item) => (
                <span key={item.text} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/60">
                  <span className="text-[#FB923C]">{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>
          </div>

          {/* Right — phone mockup (desktop only) */}
          <div
            className={clsx("hidden lg:flex justify-center mt-4 lg:mt-0", anim(800))}
            style={{ transitionDelay: "800ms" }}
          >
            <div className={clsx("relative", !prefersReduced && "animate-float")}>
              {/* Phone */}
              <div className="w-52 h-[380px] sm:w-64 sm:h-[460px] lg:w-72 lg:h-[520px] rounded-[32px] sm:rounded-[40px] border-2 sm:border-4 border-white/15 p-3 sm:p-4 shadow-2xl" style={{
                background: 'rgba(18,16,8,0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}>
                {/* Status bar */}
                <div className="flex items-center justify-between px-3 pt-1.5 pb-2">
                  <span className="text-[10px] sm:text-xs text-white/50">9:41</span>
                  <div className="w-14 sm:w-20 h-4 sm:h-6 rounded-full bg-black/50" />
                  <span className="text-[10px] sm:text-xs text-white/50">📶</span>
                </div>
                {/* App mockup content */}
                <div className="space-y-2 sm:space-y-3 mt-1 sm:mt-2">
                  <div className="h-7 sm:h-8 rounded-lg sm:rounded-xl bg-white/8 flex items-center px-2.5 gap-1.5">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#FB923C]/40" />
                    <span className="text-[10px] sm:text-xs text-white/40">New Report</span>
                  </div>
                  <div className="h-24 sm:h-32 rounded-lg sm:rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
                    <span className="text-2xl sm:text-4xl opacity-40">📸</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 sm:h-4 rounded bg-white/8 w-3/4" />
                    <div className="h-3 sm:h-4 rounded bg-white/8 w-1/2" />
                  </div>
                  <div className="h-9 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EA580C, #F59E0B)' }}>
                    <span className="text-[10px] sm:text-xs text-white font-medium">Submit Report</span>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -left-4 sm:-left-14 lg:-left-16 top-12 sm:top-16 lg:top-20 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg border border-white/10" style={{ background: 'rgba(18,16,8,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', animation: 'float 4s ease-in-out infinite 0.5s' }}>
                <span className="text-xs sm:text-sm text-white/80">🚫 No Helmet</span>
              </div>
              <div className="absolute -right-4 sm:-right-14 lg:-right-16 top-40 sm:top-48 lg:top-52 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg border border-white/10" style={{ background: 'rgba(18,16,8,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', animation: 'float 4s ease-in-out infinite 1s' }}>
                <span className="text-xs sm:text-sm text-white/80">⚡ Signal Jump</span>
              </div>
              <div className="absolute -left-2 sm:-left-10 bottom-16 sm:bottom-20 lg:bottom-24 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg border border-[#22C55E]/20" style={{ background: 'rgba(21,128,61,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', animation: 'float 4s ease-in-out infinite 1.5s' }}>
                <span className="text-xs sm:text-sm text-[#22C55E]">✅ Action Taken</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown size={22} className="text-white/30" />
      </div>
    </section>
  );
}
