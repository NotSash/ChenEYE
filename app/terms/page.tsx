import Link from "next/link";

export const metadata = {
  title: "Terms of Service — ChenEYE",
  description: "ChenEYE Terms of Service governing the use of the traffic violation reporting platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] py-16 px-4">
      <article className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">Last updated: March 19, 2025</p>

        <section className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using ChenEYE (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you disagree, please do not use the Platform.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2. Purpose</h2>
            <p>ChenEYE enables citizens to anonymously report traffic violations to Chennai Traffic Police. The Platform is NOT a social media platform — reports are private and visible only to authorized police officials.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">3. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Submit only <strong>genuine</strong> traffic violations with <strong>authentic</strong> evidence</li>
              <li>Provide accurate vehicle details, location, and time information</li>
              <li>Do not submit fabricated, manipulated, or misleading evidence</li>
              <li>Do not use the platform for personal vendettas or targeted harassment</li>
              <li>Report only violations witnessed personally within Chennai city limits</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">4. False Reporting</h2>
            <p>Filing false reports is a criminal offense under <strong>IPC Section 182</strong> (giving false information to a public servant). ChenEYE enforces a <strong>3-warning system</strong>:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Warning 1:</strong> Notification via email</li>
              <li><strong>Warning 2:</strong> Account suspended for 7 days</li>
              <li><strong>Warning 3:</strong> Permanent ban and phone number blocked</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">5. Anonymity</h2>
            <p>Your personal identity (name, email, phone) is <strong>never</strong> shared with police officials. They see only your Anonymous ID. However, your identity may be disclosed if required by law or court order.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">6. Data Retention</h2>
            <p>Reports and associated evidence are retained for a maximum of <strong>180 days</strong> after the case is resolved. Inactive accounts are purged after <strong>12 months</strong>.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">7. Intellectual Property</h2>
            <p>By submitting evidence, you grant ChenEYE and Chennai Traffic Police a non-exclusive license to use the media for law enforcement purposes. You retain ownership of your original content.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">8. Limitation of Liability</h2>
            <p>ChenEYE is a reporting tool and does not guarantee that every report will result in police action. The Platform is provided &ldquo;as is&rdquo; without warranties of any kind.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">9. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">10. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:legal@cheneye.app" className="text-[var(--text-link)]">legal@cheneye.app</a>.</p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-[var(--border-primary)]">
          <Link href="/" className="text-sm text-[var(--text-link)] hover:underline">← Back to Home</Link>
        </div>
      </article>
    </main>
  );
}
