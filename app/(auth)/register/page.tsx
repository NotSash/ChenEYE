import { ChenEYELogoFull } from "@/components/icons/ChenEYELogo";
import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen-real flex flex-col bg-[var(--bg-secondary)] safe-area-top safe-area-bottom">
      {/* Back button */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <Link href="/" className="back-btn">
          <ArrowLeft size={16} />
          <span>Home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-lg">
          <div className="glass-frost rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg">
            <div className="flex justify-center mb-5 sm:mb-6">
              <ChenEYELogoFull size="md" showTagline />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] text-center mb-2">
              Create Your Account
            </h1>

            {/* Anonymity notice — glass-marina */}
            <div className="mb-5 sm:mb-6 p-3 rounded-xl glass-warm">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                🔒 Your identity is kept completely anonymous. We collect your details only to prevent spam and misuse. Police officials
                will never see your personal information — only an anonymous User ID.
              </p>
            </div>

            <RegisterForm />

            <p className="mt-5 sm:mt-6 text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--text-link)] hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            {" · "}
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
