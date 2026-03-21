import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — ChenEYE",
  description: "ChenEYE Privacy Policy explaining data collection, usage, and protection practices.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] py-16 px-4">
      <article className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">Last updated: March 19, 2025 · Compliant with India&apos;s DPDP Act, 2023</p>

        <section className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">1. Information We Collect</h2>
            <h3 className="font-medium text-[var(--text-primary)] mt-3">Account Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name, email address, phone number — used for account creation and spam prevention</li>
              <li>Hashed password — stored securely using bcrypt</li>
              <li>Anonymous User ID — generated randomly, this is what police see</li>
            </ul>
            <h3 className="font-medium text-[var(--text-primary)] mt-3">Report Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Photos and videos submitted as evidence</li>
              <li>Vehicle details (number, type, color)</li>
              <li>Location data (text-based, optional GPS coordinates)</li>
              <li>Violation type, date, time, and description</li>
            </ul>
            <h3 className="font-medium text-[var(--text-primary)] mt-3">Technical Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Device type, browser, and operating system</li>
              <li>IP address (anonymized after 24 hours)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Facilitate traffic violation reporting to Chennai Traffic Police</li>
              <li>Send you status updates about your reports via email</li>
              <li>Prevent spam, abuse, and false reporting</li>
              <li>Detect vendetta patterns (repeated reports against same vehicle)</li>
              <li>Generate anonymized analytics for city traffic insights</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">3. Anonymity Protection</h2>
            <p>Your core anonymity guarantee:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Police officials <strong>never</strong> see your name, email, or phone number</li>
              <li>They only see your Anonymous ID (e.g., CE-A7X2K9)</li>
              <li>Your personal data is stored in a separate, encrypted database table</li>
              <li>Row-Level Security (RLS) policies prevent cross-access</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">4. Data Security</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Supabase Row-Level Security for access control</li>
              <li>Media files stored in private buckets with time-limited access URLs</li>
              <li>Regular security audits and vulnerability assessments</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">5. Data Sharing</h2>
            <p>We share data <strong>only</strong> with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Chennai Traffic Police</strong> — report data (without personal identity)</li>
              <li><strong>Law enforcement</strong> — personal data only when required by court order</li>
            </ul>
            <p className="mt-2">We <strong>never</strong> sell or share your data with advertisers or third parties.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">6. Your Rights (DPDP Act)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Right to Access</strong> — request a copy of your data</li>
              <li><strong>Right to Correction</strong> — update inaccurate information</li>
              <li><strong>Right to Erasure</strong> — request deletion of your account and data</li>
              <li><strong>Right to Grievance Redressal</strong> — contact our Data Protection Officer</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">7. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Active reports: retained until 180 days after resolution</li>
              <li>Evidence media: deleted 30 days after case closure</li>
              <li>Account data: deleted 12 months after last activity</li>
              <li>Anonymized analytics: retained indefinitely</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">8. Cookies</h2>
            <p>We use only <strong>essential cookies</strong> for authentication and theme/language preferences. We do not use tracking or advertising cookies.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">9. Contact</h2>
            <p>Data Protection Officer: <a href="mailto:privacy@cheneye.app" className="text-[var(--text-link)]">privacy@cheneye.app</a></p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-[var(--border-primary)]">
          <Link href="/" className="text-sm text-[var(--text-link)] hover:underline">← Back to Home</Link>
        </div>
      </article>
    </main>
  );
}
