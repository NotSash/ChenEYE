import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const codeHash = crypto.createHash("sha256").update(code.trim()).digest("hex");
    const supabase = createServiceClient();

    const { data: invite } = await (supabase.from("invite_codes") as any)
      .select("id, code_hash, role, generated_for, status, expires_at")
      .eq("code_hash", codeHash)
      .single();

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    if (invite.status === "used") {
      return NextResponse.json({ error: "This invite code has already been used" }, { status: 410 });
    }

    if (invite.status === "revoked") {
      return NextResponse.json({ error: "This invite code has been revoked" }, { status: 410 });
    }

    if (invite.status === "expired" || new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "This invite code has expired" }, { status: 410 });
    }

    return NextResponse.json({
      valid: true,
      role: invite.role,
      generatedFor: invite.generated_for,
    });
  } catch (err) {
    console.error("Validate invite error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
