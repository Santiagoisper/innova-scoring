/**
 * Templates de emails profesionales para Innova Trials
 */

export interface TokenEmailData {
  centerName: string;
  contactName: string;
  evaluationUrl: string;
  expiresInDays?: number;
}

export function getTokenEmailTemplate(data: TokenEmailData): { subject: string; html: string } {
  const { centerName, contactName, evaluationUrl, expiresInDays = 7 } = data;

  const subject = `Site Evaluation Request - ${centerName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Evaluation - Innova Trials</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center; background: linear-gradient(135deg, #004a99 0%, #0066cc 100%);">
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                Innova Trials
              </h1>
              <p style="margin: 8px 0 0; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">
                Site Evaluation Platform
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #475569; line-height: 1.6;">
                Dear <strong style="color: #1e293b;">${contactName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; font-size: 16px; color: #475569; line-height: 1.6;">
                Thank you for your interest in participating in our clinical trial. We're excited to evaluate <strong style="color: #1e293b;">${centerName}</strong> as a potential research site.
              </p>

              <div style="margin: 32px 0; padding: 24px; background-color: #f1f5f9; border-radius: 12px; border-left: 4px solid #004a99;">
                <p style="margin: 0 0 12px; font-size: 14px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  📋 Next Steps
                </p>
                <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
                  Please complete the site evaluation questionnaire using the secure link below. This should take approximately <strong>15-20 minutes</strong>.
                </p>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${evaluationUrl}" style="display: inline-block; padding: 18px 48px; background-color: #004a99; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0, 74, 153, 0.3); transition: all 0.3s;">
                  Start Evaluation →
                </a>
              </div>

              <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center;">
                ⏱️ This link will expire in <strong style="color: #64748b;">${expiresInDays} days</strong>
              </p>

              <div style="margin: 32px 0 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 3px solid #f59e0b;">
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.6;">
                  <strong>⚠️ Important:</strong> Questions marked as "Required" are knockout criteria. Failing these will result in automatic disqualification regardless of other scores. Please ensure all information is accurate.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #94a3b8; text-align: center;">
                If you have any questions, please reply to this email.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1; text-align: center;">
                © ${new Date().getFullYear()} Innova Trials. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}

/**
 * Template para cuando un sitio es aprobado
 */
export function getApprovalEmailTemplate(data: {
  centerName: string;
  contactName: string;
  score: number;
}): { subject: string; html: string } {
  const { centerName, contactName, score } = data;

  const subject = `🎉 Site Approved - ${centerName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✓</span>
              </div>
              
              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 900; color: #1e293b;">
                Congratulations!
              </h1>
              
              <p style="margin: 0 0 24px; font-size: 18px; color: #475569;">
                <strong>${centerName}</strong> has been approved for participation.
              </p>

              <div style="display: inline-block; padding: 12px 24px; background-color: #d1fae5; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 600;">
                  Quality Score: <span style="font-size: 24px; font-weight: 900;">${score}/100</span>
                </p>
              </div>

              <p style="margin: 24px 0 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                Our team will contact you shortly to discuss next steps and study protocols.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} Innova Trials
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}
