/**
 * Cliente de emails usando Resend
 * 
 * Setup:
 * 1. Crear cuenta en resend.com
 * 2. Verificar dominio
 * 3. Agregar RESEND_API_KEY en .env.local y Vercel
 * 4. Configurar EMAIL_FROM con tu dominio verificado
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@innova-trials.com';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; data?: any; error?: string }> {
  // Validar configuración
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured');
    return { 
      success: false, 
      error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.' 
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || stripHtml(options.html),
        reply_to: options.replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Email sent successfully:', { to: options.to, id: data.id });
    return { success: true, data };

  } catch (error: any) {
    console.error('❌ Email send error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email' 
    };
  }
}

/**
 * Helper para remover HTML básico
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validar email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
