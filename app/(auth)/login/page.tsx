import { ChenEYELogoFull } from "@/components/icons/ChenEYELogo";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen-real flex flex-col bg-[var(--bg-secondary)] safe-area-top safe-area-bottom">
      {/* Back button */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <Link href="/" className="back-btn">
          <ArrowLeft size={16} />
          <span>Home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="glass-frost rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex justify-center mb-6">
              <ChenEYELogoFull size="md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] text-center mb-6">
              Welcome Back
            </h1>
            <LoginForm />
            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[var(--text-link)] hover:underline font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
