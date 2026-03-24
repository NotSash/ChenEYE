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

function AnimatedStat({ value, label, gradient, delay, visible, prefersReduced }: {
  value: number; label: string; gradient: string; delay: number; visible: boolean; prefersReduced: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible || prefersReduced) { setCount(value); return; }
    const timeout = setTimeout(() => {
      const duration = 1800;
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [visible, value, delay, prefersReduced]);

  return (
    <div className="rounded-xl border border-white/8 p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className={`text-xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
        {count.toLocaleString()}
      </p>
      <p className="text-[10px] text-white/40 mt-1 leading-tight">{label}</p>
    </div>
  );
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

          {/* Right — Live Impact Dashboard (desktop only) */}
          <div
            className={clsx("hidden lg:flex justify-center mt-4 lg:mt-0", anim(800))}
            style={{ transitionDelay: "800ms" }}
          >
            <div className="relative w-full max-w-md">
              {/* Main dashboard card */}
              <div className="rounded-3xl border border-white/10 p-6 shadow-2xl" style={{
                background: 'rgba(18,16,8,0.55)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}>
                {/* Header with live indicator */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-white/90 tracking-wide uppercase">Community Impact</h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-[#22C55E] border border-[#22C55E]/20" style={{ background: 'rgba(21,128,61,0.12)' }}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
                    </span>
                    Live
                  </span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <AnimatedStat value={12847} label="Reports Filed" gradient="from-[#FB923C] to-[#EA580C]" delay={1200} visible={visible} prefersReduced={prefersReduced} />
                  <AnimatedStat value={9231} label="Actions Taken" gradient="from-[#F59E0B] to-[#D97706]" delay={1400} visible={visible} prefersReduced={prefersReduced} />
                  <AnimatedStat value={4562} label="Active Citizens" gradient="from-[#E11D48] to-[#BE123C]" delay={1600} visible={visible} prefersReduced={prefersReduced} />
                </div>

                {/* Resolution rate bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/50">Resolution Rate</span>
                    <span className="text-xs font-semibold text-[#22C55E]">71.8%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-[2000ms] ease-out"
                      style={{
                        width: visible ? '71.8%' : '0%',
                        background: 'linear-gradient(90deg, #22C55E, #16A34A)',
                        transitionDelay: '1800ms',
                      }}
                    />
                  </div>
                </div>

                {/* Recent activity feed */}
                <div className="space-y-2.5">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium mb-3">Recent Activity</p>
                  {[
                    { emoji: "🚫", text: "No helmet — T. Nagar", time: "2m ago", color: "#FB923C" },
                    { emoji: "⚡", text: "Signal jump — Adyar", time: "5m ago", color: "#F59E0B" },
                    { emoji: "🚗", text: "Wrong lane — ECR", time: "8m ago", color: "#E11D48" },
                    { emoji: "✅", text: "Action taken — Anna Salai", time: "12m ago", color: "#22C55E" },
                  ].map((item, i) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/5 transition-all duration-500"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateX(0)' : 'translateX(20px)',
                        transitionDelay: `${2000 + i * 200}ms`,
                      }}
                    >
                      <span className="text-sm w-6 text-center flex-shrink-0">{item.emoji}</span>
                      <span className="text-xs text-white/70 flex-1 truncate">{item.text}</span>
                      <span className="text-[10px] text-white/30 flex-shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ambient glow behind card */}
              <div className="absolute -inset-4 -z-10 rounded-3xl opacity-30 blur-2xl" style={{
                background: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(225,29,72,0.1))',
              }} />
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
