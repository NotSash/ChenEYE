import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile for anonymous_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("anonymous_id, status")
      .eq("id", user.id)
      .single() as { data: { anonymous_id: string; status: string } | null };

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.status === "banned") {
      return NextResponse.json({ error: "Your account is banned. You cannot submit reports." }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    const { vehicleNumber, violationType, locationText, date, time, description } = body;
    if (!vehicleNumber || !violationType || !locationText || !date || !time || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate report ID
    const reportId = `RPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Use service client to insert (bypasses RLS)
    const serviceClient = createServiceClient();
    const { data: report, error: insertError } = await (serviceClient.from("reports") as any).insert({
      report_id: reportId,
      reporter_anonymous_id: profile.anonymous_id,
      vehicle_number: vehicleNumber.toUpperCase().trim(),
      vehicle_type: body.vehicleType || null,
      vehicle_color: body.vehicleColor || null,
      violation_type: violationType,
      custom_violation: body.customViolation || null,
      location_text: locationText,
      location_lat: body.locationLat || null,
      location_lng: body.locationLng || null,
      landmark: body.landmark || null,
      direction: body.direction || null,
      date,
      time,
      severity: body.severity || null,
      is_repeat_offender: body.isRepeatOffender || false,
      description,
      status: "submitted",
    }).select("report_id").single();

    if (insertError) {
      console.error("Report insert error:", JSON.stringify(insertError, null, 2));
      return NextResponse.json({ error: `Failed to submit report: ${insertError.message}` }, { status: 500 });
    }

    // Insert media records if provided
    if (body.mediaUrls && body.mediaUrls.length > 0) {
      const mediaRecords = body.mediaUrls.map((m: { url: string; type: string; size: number; filename: string }) => ({
        report_id: reportId,
        url: m.url,
        type: m.type === "video" ? "video" : "image",
        size: m.size || 0,
        original_filename: m.filename || "evidence",
      }));

      await (serviceClient.from("report_media") as any).insert(mediaRecords);
    }

    // Create notification for the user
    try {
      await (serviceClient.from("notifications") as any).insert({
        user_id: user.id,
        type: "report_update",
        title: "Report Submitted! 📋",
        message: `Your report ${reportId} for ${violationType} has been submitted successfully. We'll notify you when it's reviewed.`,
        read: false,
        report_id: reportId,
      });
    } catch (e) {
      console.error("Notification error (non-fatal):", e);
    }

    // Log audit event
    try {
      await (serviceClient.from("audit_logs") as any).insert({
        event_type: "report_submitted",
        user_id: user.id,
        target_id: reportId,
        details: `Report ${reportId} submitted for ${violationType}`,
      });
    } catch (e) {
      console.error("Audit log error (non-fatal):", e);
    }

    return NextResponse.json({
      success: true,
      reportId,
      message: "Report submitted successfully!",
    });
  } catch (err) {
    console.error("Submit report error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
