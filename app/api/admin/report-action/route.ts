import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

// Admin actions: update report status, issue warning
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single() as { data: { role: string } | null };

    if (!profile || !["police_admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { action, reportId, reason, actionDescription } = body;

    if (!action || !reportId) {
      return NextResponse.json({ error: "Missing action or reportId" }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Get the report
    const { data: report } = await (serviceClient.from("reports") as any)
      .select("report_id, reporter_anonymous_id, status, violation_type")
      .eq("report_id", reportId)
      .single();

    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    let newStatus: string;
    let notifTitle: string;
    let notifMessage: string;

    switch (action) {
      case "approve":
        newStatus = "approved";
        notifTitle = "Report Approved ✅";
        notifMessage = `Your report ${reportId} for ${report.violation_type} has been approved by police.`;
        break;
      case "reject":
        if (!reason) return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
        newStatus = "rejected";
        notifTitle = "Report Rejected ❌";
        notifMessage = `Your report ${reportId} was rejected: ${reason}`;
        break;
      case "under_review":
        newStatus = "under_review";
        notifTitle = "Report Under Review 🔍";
        notifMessage = `Your report ${reportId} is now being reviewed by police.`;
        break;
      case "action_taken":
        newStatus = "action_taken";
        notifTitle = "Action Taken! 🛡️";
        notifMessage = `Police have taken action on your report ${reportId}. ${actionDescription || ""}`;
        break;
      case "warn":
        // Issue warning to the reporter
        const { data: reporter } = await (serviceClient.from("profiles") as any)
          .select("id, warnings")
          .eq("anonymous_id", report.reporter_anonymous_id)
          .single();

        if (!reporter) return NextResponse.json({ error: "Reporter not found" }, { status: 404 });

        const newWarnings = (reporter.warnings || 0) + 1;

        // Update warning count
        await (serviceClient.from("profiles") as any)
          .update({ warnings: newWarnings, ...(newWarnings >= 3 ? { status: "banned" } : {}) })
          .eq("id", reporter.id);

        // Insert warning record
        await (serviceClient.from("warnings") as any).insert({
          user_id: reporter.id,
          report_id: reportId,
          reason: reason || "False or misleading report",
          warning_number: newWarnings,
          issued_by: user.id,
        });

        // Ban phone if 3 warnings
        if (newWarnings >= 3) {
          const { data: reporterProfile } = await (serviceClient.from("profiles") as any)
            .select("phone_hash")
            .eq("id", reporter.id)
            .single();
          if (reporterProfile) {
            await (serviceClient.from("banned_phones") as any)
              .insert({ phone_hash: reporterProfile.phone_hash })
              .onConflict("phone_hash").ignoreDuplicates();
          }
        }

        // Notify reporter
        await (serviceClient.from("notifications") as any).insert({
          user_id: reporter.id,
          type: "warning",
          title: newWarnings >= 3 ? "Account Banned 🚫" : `Warning ${newWarnings}/3 ⚠️`,
          message: newWarnings >= 3
            ? `Your account has been banned due to 3 warnings. Reason: ${reason}`
            : `You've received warning ${newWarnings}/3. Reason: ${reason}. ${3 - newWarnings} more will result in a ban.`,
          report_id: reportId,
        });

        // Audit log
        await (serviceClient.from("audit_logs") as any).insert({
          event_type: "warning_issued",
          user_id: user.id,
          target_id: reporter.id,
          details: `Warning ${newWarnings}/3 issued. Reason: ${reason}`,
        });

        return NextResponse.json({ success: true, warnings: newWarnings, banned: newWarnings >= 3 });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update report status
    await (serviceClient.from("reports") as any)
      .update({
        status: newStatus,
        ...(reason ? { rejection_reason: reason } : {}),
        ...(actionDescription ? { action_description: actionDescription } : {}),
      })
      .eq("report_id", reportId);

    // Insert status history
    await (serviceClient.from("report_status_history") as any).insert({
      report_id: reportId,
      status: newStatus,
      admin_id: user.id,
      note: reason || actionDescription || null,
    });

    // Notify reporter
    const { data: reporterForNotif } = await (serviceClient.from("profiles") as any)
      .select("id")
      .eq("anonymous_id", report.reporter_anonymous_id)
      .single();

    if (reporterForNotif) {
      await (serviceClient.from("notifications") as any).insert({
        user_id: reporterForNotif.id,
        type: action === "action_taken" ? "action_taken" : "report_update",
        title: notifTitle,
        message: notifMessage,
        report_id: reportId,
      });
    }

    // Audit log
    await (serviceClient.from("audit_logs") as any).insert({
      event_type: `report_${action}`,
      user_id: user.id,
      target_id: reportId,
      details: `Report ${action}: ${reason || actionDescription || ""}`,
    });

    return NextResponse.json({ success: true, newStatus });
  } catch (err) {
    console.error("Admin action error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
