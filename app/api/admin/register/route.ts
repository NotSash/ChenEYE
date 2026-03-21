import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hashPhone } from "@/lib/otp";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteCode, fullName, email, phone, password } = body;

    // Validate required fields
    if (!inviteCode || !fullName || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1. Validate the invite code
    const codeHash = crypto.createHash("sha256").update(inviteCode.trim()).digest("hex");

    const { data: invite } = await (supabase.from("invite_codes") as any)
      .select("id, code_hash, role, generated_for, status, expires_at")
      .eq("code_hash", codeHash)
      .single();

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    if (invite.status !== "active") {
      return NextResponse.json({ error: `Invite code is ${invite.status}` }, { status: 410 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      // Mark as expired
      await (supabase.from("invite_codes") as any)
        .update({ status: "expired" })
        .eq("id", invite.id);
      return NextResponse.json({ error: "Invite code has expired" }, { status: 410 });
    }

    // 2. Normalize phone and hash
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/^(\+91|91)/, "+91");
    const phoneHash = hashPhone(normalizedPhone.startsWith("+91") ? normalizedPhone : `+91${normalizedPhone}`);

    // 3. Generate anonymous ID
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let anonId = "CE-";
    for (let i = 0; i < 6; i++) anonId += chars[Math.floor(Math.random() * chars.length)];

    // 4. Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
      }
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    const userId = authData.user.id;

    // 5. Create profile with the invite code's role
    const { error: profileError } = await (supabase.from("profiles") as any).insert({
      id: userId,
      anonymous_id: anonId,
      full_name: fullName,
      email,
      phone_hash: phoneHash,
      role: invite.role, // police_admin or super_admin from invite
      status: "active",
      warnings: 0,
      language: "en",
      theme: "light",
    });

    if (profileError) {
      console.error("Profile error:", profileError);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 });
    }

    // 6. Mark invite code as used
    await (supabase.from("invite_codes") as any)
      .update({ status: "used", used_by: userId })
      .eq("id", invite.id);

    // 7. Audit log
    await (supabase.from("audit_logs") as any).insert({
      event_type: "admin_registered",
      user_id: userId,
      details: `${invite.role} registered via invite code for ${invite.generated_for}`,
    });

    return NextResponse.json({
      success: true,
      role: invite.role,
      message: `Account created as ${invite.role === "super_admin" ? "Super Admin" : "Police Admin"}!`,
    });
  } catch (err) {
    console.error("Admin register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
