import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { registerSchema, generateAnonymousId, normalizePhone } from "@/lib/auth";
import { hashPhone } from "@/lib/otp";
import { sendWelcomeEmail } from "@/lib/emails/send";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = registerSchema.safeParse({
      ...body,
      age: parseInt(body.age),
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password } = parsed.data;
    const normalizedPhone = normalizePhone(phone);
    const phoneHash = hashPhone(normalizedPhone);
    const anonymousId = generateAnonymousId();

    // Use Service Role client (bypasses RLS)
    const supabase = createServiceClient();

    // 1. Check if phone is banned
    const { data: banned } = await supabase
      .from("banned_phones")
      .select("id")
      .eq("phone_hash", phoneHash)
      .single();

    if (banned) {
      return NextResponse.json(
        { error: "This phone number has been banned from ChenEYE." },
        { status: 403 }
      );
    }

    // 2. Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we verified via OTP
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "This email is already registered. Please login instead." },
          { status: 409 }
        );
      }
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 3. Create profile
    const { error: profileError } = await (supabase.from("profiles") as any).insert({
      id: userId,
      anonymous_id: anonymousId,
      full_name: fullName,
      email,
      phone_hash: phoneHash,
      role: "reporter",
      status: "active",
      warnings: 0,
      language: "en",
      theme: "light",
    });

    if (profileError) {
      console.error("Profile error:", JSON.stringify(profileError, null, 2));
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}`, code: profileError.code },
        { status: 500 }
      );
    }

    // 4. Send welcome email via Resend
    try {
      await sendWelcomeEmail(email, anonymousId);
    } catch (e) {
      console.error("Welcome email error (non-fatal):", e);
    }

    // 5. Log audit event
    try {
      await (supabase.from("audit_logs") as any).insert({
        event_type: "user_registered",
        user_id: userId,
        details: `User registered with anonymous ID ${anonymousId}`,
      });
    } catch (e) {
      console.error("Audit log error (non-fatal):", e);
    }

    return NextResponse.json({
      success: true,
      anonymousId,
      message: "Account created successfully!",
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
