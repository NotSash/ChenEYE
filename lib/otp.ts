import crypto from "crypto";

/**
 * In-memory OTP store. 
 * In production, replace with Redis or a Supabase table.
 * This works in dev because Next.js keeps the Node process alive.
 */
const store = new Map<string, { otp: string; expiresAt: number }>();

// Ensure the same Map instance is reused across hot reloads
const globalStore = globalThis as unknown as {
  __otpStore?: Map<string, { otp: string; expiresAt: number }>;
};
if (!globalStore.__otpStore) {
  globalStore.__otpStore = store;
}
const otpStore = globalStore.__otpStore;

export function hashPhone(phone: string): string {
  return crypto.createHash("sha256").update(phone).digest("hex");
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(phoneHash: string, otp: string): void {
  otpStore.set(phoneHash, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
}

export function verifyOTP(phoneHash: string, otp: string): { valid: boolean; error?: string } {
  const stored = otpStore.get(phoneHash);

  if (!stored) {
    return { valid: false, error: "No OTP found. Please request a new one." };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phoneHash);
    return { valid: false, error: "OTP has expired. Please request a new one." };
  }

  if (stored.otp !== otp) {
    return { valid: false, error: "Invalid OTP. Please try again." };
  }

  // Valid — clean up
  otpStore.delete(phoneHash);
  return { valid: true };
}
