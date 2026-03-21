"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "../ui/Button";
import { ChenEYELogoFull } from "../icons/ChenEYELogo";

/* ═══ Stats ═══ */
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 1000, suffix: "+", label: "Reports Submitted" },
  { value: 85, suffix: "%", label: "Action Rate" },
  { value: 50, suffix: "+", label: "Hotspots Tracked" },
];

/* ═══ FAQ ═══ */
const faqs = [
  {
    q: "Is my identity really anonymous?",
    a: "Yes. When you register, a unique anonymous User ID (e.g., CE-A7X2K9) is generated. Police officials only see this ID — never your name, email, or phone number. The link between your identity and your ID is protected by enterprise-grade security.",
  },
  {
    q: "What types of violations can I report?",
    a: "You can report: wrong-side driving, signal jumping, no helmet, no seatbelt, illegal parking, rash driving, over-speeding, riding on footpath, drunk driving, road nuisance, driving without license plate, phone use while driving, triple riding, not using indicators, and more.",
  },
  {
    q: "Do I need to download an app?",
    a: "No! ChenEYE is a Progressive Web App (PWA). Visit the website and you can install it directly to your home screen — just like an app, but without the app store. Works on Android, iOS, and all browsers.",
  },
  {
    q: "What happens after I submit a report?",
    a: "Your report goes through these stages: Submitted → Under Review (a police officer opens it) → Approved or Rejected → Action Taken. You'll receive notifications at every step.",
  },
  {
    q: "Can I get in trouble for reporting?",
    a: "No — as long as your reports are genuine. Section 210B of the Motor Vehicles Act supports electronic evidence for traffic violations. However, filing false reports is punishable under IPC Section 182.",
  },
  {
    q: "What if someone files a false report?",
    a: "We have a 3-warning system. If a report is determined to be false, the reporter receives a warning. After 3 warnings, the account is permanently banned. The reporter's phone number is also blocked from creating new accounts.",
  },
  {
    q: "Is my data safe?",
    a: "All data is encrypted in transit and at rest. We comply with India's Digital Personal Data Protection Act, 2023 (DPDP Act). Your uploaded media is stored in private, secure cloud storage with expiring access links.",
  },
  {
    q: "Can I report violations from other cities?",
    a: "Currently, ChenEYE is exclusively for Chennai. We hope to expand to other cities in the future based on demand and partnerships with local traffic police.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[var(--border-primary)] rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--bg-hover)] transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[var(--text-primary)] pr-4">{q}</span>
        <span className="shrink-0 text-[var(--text-tertiary)]">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ maxHeight: open ? "500px" : "0px", opacity: open ? 1 : 0 }}
      >
        <p className="px-5 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ═══ Main ═══ */
export default function FooterSection() {
  return (
    <>
      {/* Stats */}
      <section className="py-12 sm:py-16" style={{ background: 'linear-gradient(135deg, #1C0F05 0%, #7C2D12 40%, #B45309 70%, #1C0F05 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  <AnimatedNumber target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 bg-[var(--bg-secondary)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">Frequently Asked Questions</h2>
            <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-primary)]" />
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-24 bg-[var(--bg-primary)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            Ready to Make Chennai&apos;s Roads Safer?
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Join fellow citizens in keeping our streets safe. It only takes 2 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/register" variant="primary" size="lg">Create Free Account</LinkButton>
          </div>
          <p className="mt-4 text-sm text-[var(--text-tertiary)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--text-link)] hover:underline">Login</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <ChenEYELogoFull size="sm" />
              <p className="mt-3 text-sm text-[var(--text-tertiary)]">
                Making Chennai&apos;s roads safer, one report at a time. 🏙️
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Features", href: "#features" },
                  { label: "FAQ", href: "#faq" },
                ].map((l) => (
                  <li key={l.href}><a href={l.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Contact</h4>
              <p className="text-sm text-[var(--text-secondary)]">support@cheneye.app</p>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-[var(--border-primary)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-tertiary)]">© 2025 ChenEYE. All rights reserved.</p>
            <p className="text-xs text-[var(--text-tertiary)]">Built with ❤️ for Chennai</p>
          </div>
        </div>
      </footer>
    </>
  );
}
