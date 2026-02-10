import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured - emails will be skipped");
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = "Innova Trials <onboarding@resend.dev>";
const BRAND_COLOR = "#0066a1";
const BRAND_SECONDARY = "#00857c";

function baseTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_SECONDARY});padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;">Innova Trials</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Clinical Research Site Evaluation</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f9fa;padding:24px 40px;text-align:center;border-top:1px solid #e9ecef;">
              <p style="color:#6c757d;font-size:12px;margin:0;">
                &copy; ${new Date().getFullYear()} Innova Trials LLC. All rights reserved.
              </p>
              <p style="color:#6c757d;font-size:11px;margin:8px 0 0;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendTokenEmail(
  to: string,
  contactName: string,
  token: string,
  siteName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const body = `
      <h2 style="color:#333;margin:0 0 16px;font-size:22px;">Your Evaluation Access Token</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Hello <strong>${contactName}</strong>,
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        You have been invited to complete a site evaluation for <strong>${siteName}</strong>. Please use the credentials below to log in to the evaluation portal.
      </p>
      <div style="background-color:#f0f7ff;border:2px solid ${BRAND_COLOR};border-radius:10px;padding:24px;margin:24px 0;text-align:center;">
        <p style="color:#6c757d;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your Access Token</p>
        <p style="color:${BRAND_COLOR};font-size:32px;font-weight:700;margin:0;letter-spacing:3px;">${token}</p>
      </div>
      <div style="background-color:#fff8e1;border-left:4px solid #ffc107;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="color:#856404;font-size:14px;margin:0;">
          <strong>Important:</strong> This token is for single use only. Once you log in, it will be consumed and cannot be reused.
        </p>
      </div>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        To access the evaluation portal:
      </p>
      <ol style="color:#555;font-size:15px;line-height:1.8;">
        <li>Go to the Site Portal login page</li>
        <li>Enter your email: <strong>${to}</strong></li>
        <li>Enter the token shown above</li>
        <li>Complete all evaluation questions</li>
      </ol>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        If you have any questions, please contact your Innova Trials administrator.
      </p>
    `;

    const client = getResend();
    if (!client) return { success: false, error: "Email service not configured" };

    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Innova Trials - Your Evaluation Access Token for ${siteName}`,
      html: baseTemplate("Evaluation Access Token", body),
    });

    if (error) {
      console.error("Resend error (token):", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Email send error (token):", err);
    return { success: false, error: err.message };
  }
}

export async function sendEvaluationCompleteEmail(
  to: string,
  contactName: string,
  siteName: string,
  score: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const scoreColor = score >= 80 ? "#28a745" : score >= 60 ? "#ffc107" : "#dc3545";

    const body = `
      <h2 style="color:#333;margin:0 0 16px;font-size:22px;">Evaluation Submitted Successfully</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Hello <strong>${contactName}</strong>,
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Thank you for completing the site evaluation for <strong>${siteName}</strong>. Your responses have been recorded and will be reviewed by our team.
      </p>
      <div style="background-color:#f8f9fa;border-radius:10px;padding:24px;margin:24px 0;text-align:center;">
        <p style="color:#6c757d;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your Score</p>
        <p style="color:${scoreColor};font-size:48px;font-weight:700;margin:0;">${score}<span style="font-size:24px;color:#6c757d;">%</span></p>
      </div>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Our team will review your evaluation and you will receive a notification when a decision has been made regarding your site's status.
      </p>
      <div style="background-color:#e8f5e9;border-left:4px solid #28a745;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="color:#2e7d32;font-size:14px;margin:0;">
          <strong>What's next?</strong> Your evaluation is now under review. You will receive an email once the review is complete.
        </p>
      </div>
    `;

    const client = getResend();
    if (!client) return { success: false, error: "Email service not configured" };

    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Innova Trials - Evaluation Submitted for ${siteName}`,
      html: baseTemplate("Evaluation Submitted", body),
    });

    if (error) {
      console.error("Resend error (evaluation):", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Email send error (evaluation):", err);
    return { success: false, error: err.message };
  }
}

export async function sendStatusChangeEmail(
  to: string,
  contactName: string,
  siteName: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let statusConfig = {
      color: BRAND_COLOR,
      icon: "&#9989;",
      title: "Status Update",
      message: "",
      bgColor: "#f0f7ff",
      borderColor: BRAND_COLOR,
    };

    switch (status) {
      case "Approved":
        statusConfig = {
          color: "#28a745",
          icon: "&#9989;",
          title: "Site Approved",
          message: "Congratulations! Your site has been approved and meets the requirements for clinical research participation.",
          bgColor: "#e8f5e9",
          borderColor: "#28a745",
        };
        break;
      case "Rejected":
        statusConfig = {
          color: "#dc3545",
          icon: "&#10060;",
          title: "Site Not Approved",
          message: "After careful review, your site does not meet the current requirements for clinical research participation. Please contact your Innova Trials administrator for more details.",
          bgColor: "#fce4ec",
          borderColor: "#dc3545",
        };
        break;
      case "ToConsider":
        statusConfig = {
          color: "#ff9800",
          icon: "&#9888;&#65039;",
          title: "Under Consideration",
          message: "Your site is currently under further consideration. Our team may reach out for additional information or a follow-up evaluation.",
          bgColor: "#fff8e1",
          borderColor: "#ff9800",
        };
        break;
    }

    const body = `
      <h2 style="color:#333;margin:0 0 16px;font-size:22px;">Site Evaluation Decision</h2>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        Hello <strong>${contactName}</strong>,
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        We have completed the review of the site evaluation for <strong>${siteName}</strong>. Please see the decision below.
      </p>
      <div style="background-color:${statusConfig.bgColor};border:2px solid ${statusConfig.borderColor};border-radius:10px;padding:24px;margin:24px 0;text-align:center;">
        <p style="font-size:36px;margin:0 0 8px;">${statusConfig.icon}</p>
        <p style="color:${statusConfig.color};font-size:24px;font-weight:700;margin:0;">${statusConfig.title}</p>
      </div>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        ${statusConfig.message}
      </p>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        If you have any questions about this decision, please contact your Innova Trials administrator.
      </p>
    `;

    const client = getResend();
    if (!client) return { success: false, error: "Email service not configured" };

    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Innova Trials - Site ${statusConfig.title}: ${siteName}`,
      html: baseTemplate("Site Evaluation Decision", body),
    });

    if (error) {
      console.error("Resend error (status):", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Email send error (status):", err);
    return { success: false, error: err.message };
  }
}

export async function sendAdminNotificationEmail(
  adminEmails: string[],
  siteName: string,
  contactName: string,
  eventType: "evaluation_complete" | "new_registration"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (adminEmails.length === 0) return { success: true };

    const isEvaluation = eventType === "evaluation_complete";

    const body = `
      <h2 style="color:#333;margin:0 0 16px;font-size:22px;">
        ${isEvaluation ? "New Evaluation Submitted" : "New Site Registration"}
      </h2>
      <p style="color:#555;font-size:15px;line-height:1.6;">
        ${isEvaluation
          ? `<strong>${contactName}</strong> has completed the evaluation for <strong>${siteName}</strong>. Please log in to the admin dashboard to review the results.`
          : `A new site <strong>${siteName}</strong> has been registered by <strong>${contactName}</strong>. Please review and generate an access token.`
        }
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="#" style="background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;">
          View in Dashboard
        </a>
      </div>
    `;

    const client = getResend();
    if (!client) return { success: false, error: "Email service not configured" };

    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `Innova Trials - ${isEvaluation ? "Evaluation Completed" : "New Registration"}: ${siteName}`,
      html: baseTemplate(isEvaluation ? "Evaluation Complete" : "New Registration", body),
    });

    if (error) {
      console.error("Resend error (admin notification):", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Email send error (admin):", err);
    return { success: false, error: err.message };
  }
}
