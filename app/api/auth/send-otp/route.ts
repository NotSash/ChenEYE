import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { hashPhone, generateOTP, storeOTP } from "@/lib/otp";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { phone, email } = await request.json();

    if (!phone || !email) {
      return NextResponse.json(
        { error: "Phone and email are required" },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const phoneHash = hashPhone(phone);
    storeOTP(phoneHash, otp);

    // Send OTP via Resend
    const fromAddress = process.env.RESEND_FROM_EMAIL || "ChenEYE <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `${otp} — Your ChenEYE Verification Code`,
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 28px; font-weight: 700;">
              <span style="color: #EA580C;">Chen</span><span style="color: #B45309;">EYE</span>
            </span>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; color: #1C1917; text-align: center;">Verify Your Phone Number</h1>
          <p style="font-size: 14px; color: #57534E; text-align: center; margin-bottom: 24px;">
            Use this code to complete your ChenEYE registration:
          </p>
          <div style="background: linear-gradient(135deg, #FFF7ED, #FFEDD5); border: 2px solid #FB923C; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 40px; font-weight: 800; letter-spacing: 8px; color: #EA580C; margin: 0; font-family: monospace;">
              ${otp}
            </p>
          </div>
          <p style="font-size: 12px; color: #A8A29E; text-align: center;">
            This code expires in 5 minutes. If you didn't request this, ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 32px 0 16px;" />
          <p style="font-size: 11px; color: #A8A29E; text-align: center;">
            &copy; 2025 ChenEYE &mdash; Be the eyes of Chennai's roads
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
