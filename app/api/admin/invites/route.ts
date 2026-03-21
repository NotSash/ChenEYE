import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single() as { data: { role: string } | null };

    if (!profile || profile.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden — super admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    const serviceClient = createServiceClient();

    if (action === "generate") {
      const { generatedFor, role: inviteRole, expiresInDays } = body;
      if (!generatedFor || !inviteRole) {
        return NextResponse.json({ error: "Name and role required" }, { status: 400 });
      }

      const prefix = inviteRole === "super_admin" ? "INV-SUPER" : "INV-POLICE";
      const code = `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const codeHash = crypto.createHash("sha256").update(code).digest("hex");

      const expires = new Date();
      expires.setDate(expires.getDate() + (expiresInDays || 7));

      const { error } = await (serviceClient.from("invite_codes") as any).insert({
        code_hash: codeHash,
        role: inviteRole,
        generated_for: generatedFor,
        generated_by: user.id,
        expires_at: expires.toISOString(),
        status: "active",
      });

      if (error) {
        return NextResponse.json({ error: `Failed to create invite: ${error.message}` }, { status: 500 });
      }

      await (serviceClient.from("audit_logs") as any).insert({
        event_type: "invite_generated",
        user_id: user.id,
        details: `Invite ${code} generated for ${generatedFor} (${inviteRole})`,
      });

      return NextResponse.json({ success: true, code, expiresAt: expires.toISOString() });
    }

    if (action === "revoke") {
      const { codeHash } = body;
      if (!codeHash) return NextResponse.json({ error: "Code hash required" }, { status: 400 });

      await (serviceClient.from("invite_codes") as any)
        .update({ status: "revoked" })
        .eq("code_hash", codeHash);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Invite action error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
