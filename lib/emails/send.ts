import { Resend } from "resend";
import { render } from "@react-email/components";
import {
  WelcomeEmail,
  ReportSubmittedEmail,
  StatusUpdateEmail,
  WarningEmail,
} from "./templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ChenEYE <noreply@cheneye.app>";

export async function sendWelcomeEmail(to: string, anonymousId: string) {
  const html = await render(WelcomeEmail({ anonymousId }));
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to ChenEYE — Your Anonymous ID is Ready 🎉",
    html,
  });
}

export async function sendReportSubmittedEmail(
  to: string,
  reportId: string,
  violationType: string,
  vehicleNo: string
) {
  const html = await render(
    ReportSubmittedEmail({ reportId, violationType, vehicleNo })
  );
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Report ${reportId} — Submitted Successfully ✅`,
    html,
  });
}

export async function sendStatusUpdateEmail(
  to: string,
  reportId: string,
  status: string,
  adminNote?: string
) {
  const statusLabels: Record<string, string> = {
    under_review: "Under Review 🔍",
    approved: "Approved ✅",
    rejected: "Rejected ❌",
    action_taken: "Action Taken 🚔",
  };

  const html = await render(
    StatusUpdateEmail({ reportId, status, adminNote })
  );
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Report ${reportId} — ${statusLabels[status] || status}`,
    html,
  });
}

export async function sendWarningEmail(
  to: string,
  warningNumber: number,
  reportId: string,
  reason: string
) {
  const html = await render(
    WarningEmail({ warningNumber, reportId, reason })
  );
  return resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ Warning ${warningNumber}/3 — ChenEYE Account Notice`,
    html,
  });
}
