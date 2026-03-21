import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

/* ═══════════════════════════════════════════
   Shared layout wrapper
   ═══════════════════════════════════════════ */

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
}

function EmailLayout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>
              <span style={{ color: "#1E3A5F" }}>Chen</span>
              <span style={{ color: "#0D9488" }}>EYE</span>
            </Text>
          </Section>
          {children}
          {/* Footer */}
          <Hr style={hr} />
          <Text style={footer}>
            © 2025 ChenEYE. All rights reserved.
            <br />
            <Link href="https://cheneye.app/terms" style={footerLink}>Terms</Link>
            {" · "}
            <Link href="https://cheneye.app/privacy" style={footerLink}>Privacy</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/* ═══════════════════════════════════════════
   1. Welcome Email
   ═══════════════════════════════════════════ */

export function WelcomeEmail({ anonymousId }: { anonymousId: string }) {
  return (
    <EmailLayout preview="Welcome to ChenEYE — your Anonymous ID is ready">
      <Heading style={h1}>Welcome to ChenEYE! 🎉</Heading>
      <Text style={text}>
        Thank you for joining ChenEYE. Together, we can make Chennai&apos;s roads safer.
      </Text>
      <Section style={codeBox}>
        <Text style={codeLabel}>Your Anonymous ID</Text>
        <Text style={codeValue}>{anonymousId}</Text>
        <Text style={codeHint}>
          This is how police track your reports — your real identity is never revealed.
        </Text>
      </Section>
      <Text style={text}>Here&apos;s how to get started:</Text>
      <Text style={listItem}>📸 1. Spot a traffic violation</Text>
      <Text style={listItem}>📝 2. Submit a report with evidence</Text>
      <Text style={listItem}>🚔 3. Police reviews and takes action</Text>
      <Section style={ctaSection}>
        <Link href="https://cheneye.app/dashboard/report/new" style={ctaButton}>
          Submit Your First Report →
        </Link>
      </Section>
    </EmailLayout>
  );
}

/* ═══════════════════════════════════════════
   2. Report Submitted
   ═══════════════════════════════════════════ */

export function ReportSubmittedEmail({
  reportId,
  violationType,
  vehicleNo,
}: {
  reportId: string;
  violationType: string;
  vehicleNo: string;
}) {
  return (
    <EmailLayout preview={`Report ${reportId} submitted successfully`}>
      <Heading style={h1}>Report Submitted ✅</Heading>
      <Text style={text}>Your report has been received and is now in the queue for review.</Text>
      <Section style={detailBox}>
        <Row>
          <Column style={detailLabel}>Report ID</Column>
          <Column style={detailValue}>{reportId}</Column>
        </Row>
        <Row>
          <Column style={detailLabel}>Violation</Column>
          <Column style={detailValue}>{violationType}</Column>
        </Row>
        <Row>
          <Column style={detailLabel}>Vehicle No.</Column>
          <Column style={detailValue}>{vehicleNo}</Column>
        </Row>
        <Row>
          <Column style={detailLabel}>Status</Column>
          <Column style={{ ...detailValue, color: "#F59E0B" }}>📋 Submitted</Column>
        </Row>
      </Section>
      <Text style={text}>You&apos;ll receive updates as police review your report.</Text>
      <Section style={ctaSection}>
        <Link href={`https://cheneye.app/dashboard/reports`} style={ctaButton}>
          Track Your Reports →
        </Link>
      </Section>
    </EmailLayout>
  );
}

/* ═══════════════════════════════════════════
   3. Status Update Email
   ═══════════════════════════════════════════ */

const statusConfig: Record<string, { emoji: string; color: string; label: string; message: string }> = {
  under_review: { emoji: "🔍", color: "#3B82F6", label: "Under Review", message: "A police officer has opened your report and is reviewing the evidence." },
  approved: { emoji: "✅", color: "#10B981", label: "Approved", message: "Your report has been verified and approved. Action will be taken against the violator." },
  rejected: { emoji: "❌", color: "#EF4444", label: "Rejected", message: "Your report could not be verified. Please ensure evidence is clear and details are accurate." },
  action_taken: { emoji: "🚔", color: "#8B5CF6", label: "Action Taken", message: "Enforcement action has been taken based on your report. Thank you for helping keep Chennai safe!" },
};

export function StatusUpdateEmail({
  reportId,
  status,
  adminNote,
}: {
  reportId: string;
  status: string;
  adminNote?: string;
}) {
  const config = statusConfig[status] || statusConfig.under_review;

  return (
    <EmailLayout preview={`Report ${reportId}: ${config.label}`}>
      <Heading style={h1}>
        {config.emoji} Report Update: {config.label}
      </Heading>
      <Section style={{ ...statusBadge, backgroundColor: config.color + "15", borderColor: config.color + "30" }}>
        <Text style={{ ...statusBadgeText, color: config.color }}>
          {config.emoji} {config.label}
        </Text>
      </Section>
      <Text style={text}>{config.message}</Text>
      <Section style={detailBox}>
        <Row>
          <Column style={detailLabel}>Report ID</Column>
          <Column style={detailValue}>{reportId}</Column>
        </Row>
      </Section>
      {adminNote && (
        <Section style={noteBox}>
          <Text style={noteLabel}>Note from officer:</Text>
          <Text style={noteText}>{adminNote}</Text>
        </Section>
      )}
      <Section style={ctaSection}>
        <Link href={`https://cheneye.app/dashboard/reports`} style={ctaButton}>
          View Report Details →
        </Link>
      </Section>
    </EmailLayout>
  );
}

/* ═══════════════════════════════════════════
   4. Warning Email
   ═══════════════════════════════════════════ */

export function WarningEmail({
  warningNumber,
  reportId,
  reason,
}: {
  warningNumber: number;
  reportId: string;
  reason: string;
}) {
  return (
    <EmailLayout preview={`Warning ${warningNumber}/3 issued on your account`}>
      <Heading style={{ ...h1, color: "#EF4444" }}>⚠️ Warning {warningNumber} of 3</Heading>
      <Section style={warningBox}>
        <Text style={warningText}>
          A warning has been issued against your account for report {reportId}.
        </Text>
        <Text style={{ ...text, marginTop: "8px" }}>
          <strong>Reason:</strong> {reason}
        </Text>
      </Section>
      <Text style={text}>
        {warningNumber < 3
          ? `You have ${3 - warningNumber} warning(s) remaining before your account is permanently banned.`
          : "This is your final warning. Your account has been permanently banned."}
      </Text>
      {warningNumber < 3 && (
        <Text style={text}>
          Please ensure all future reports contain genuine evidence and accurate information.
        </Text>
      )}
    </EmailLayout>
  );
}

/* ═══════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════ */

const body: React.CSSProperties = { backgroundColor: "#F8FAFC", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: 0, padding: 0 };
const container: React.CSSProperties = { maxWidth: "560px", margin: "0 auto", padding: "40px 20px" };
const header: React.CSSProperties = { textAlign: "center" as const, marginBottom: "32px" };
const logoText: React.CSSProperties = { fontSize: "28px", fontWeight: "700", letterSpacing: "-0.5px" };
const h1: React.CSSProperties = { fontSize: "24px", fontWeight: "700", color: "#0F172A", marginBottom: "16px" };
const text: React.CSSProperties = { fontSize: "14px", lineHeight: "1.6", color: "#475569", marginBottom: "12px" };
const listItem: React.CSSProperties = { ...text, paddingLeft: "8px" };
const hr: React.CSSProperties = { borderColor: "#E2E8F0", margin: "32px 0 16px" };
const footer: React.CSSProperties = { fontSize: "12px", color: "#94A3B8", textAlign: "center" as const };
const footerLink: React.CSSProperties = { color: "#64748B", textDecoration: "underline" };

const codeBox: React.CSSProperties = { backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "20px", textAlign: "center" as const, marginBottom: "24px" };
const codeLabel: React.CSSProperties = { fontSize: "12px", color: "#64748B", marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.5px" };
const codeValue: React.CSSProperties = { fontSize: "28px", fontWeight: "700", fontFamily: "monospace", color: "#1E3A5F", margin: "8px 0" };
const codeHint: React.CSSProperties = { fontSize: "12px", color: "#94A3B8", marginTop: "4px" };

const ctaSection: React.CSSProperties = { textAlign: "center" as const, margin: "24px 0" };
const ctaButton: React.CSSProperties = { display: "inline-block", backgroundColor: "#1E3A5F", color: "#FFFFFF", fontSize: "14px", fontWeight: "600", padding: "12px 28px", borderRadius: "8px", textDecoration: "none" };

const detailBox: React.CSSProperties = { backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "16px", marginBottom: "20px" };
const detailLabel: React.CSSProperties = { fontSize: "12px", color: "#94A3B8", width: "100px", paddingBottom: "8px" };
const detailValue: React.CSSProperties = { fontSize: "14px", color: "#0F172A", fontWeight: "600", paddingBottom: "8px" };

const statusBadge: React.CSSProperties = { borderRadius: "8px", border: "1px solid", padding: "12px", textAlign: "center" as const, marginBottom: "20px" };
const statusBadgeText: React.CSSProperties = { fontSize: "16px", fontWeight: "600", margin: 0 };

const noteBox: React.CSSProperties = { backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "12px", marginBottom: "20px" };
const noteLabel: React.CSSProperties = { fontSize: "12px", fontWeight: "600", color: "#92400E", marginBottom: "4px" };
const noteText: React.CSSProperties = { fontSize: "14px", color: "#78350F", margin: 0 };

const warningBox: React.CSSProperties = { backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "16px", marginBottom: "20px" };
const warningText: React.CSSProperties = { fontSize: "14px", color: "#991B1B", margin: 0 };
