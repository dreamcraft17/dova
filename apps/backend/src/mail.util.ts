import nodemailer from 'nodemailer';

export type SendMailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

type EmailProvider = 'resend' | 'smtp' | 'auto';

function configuredProvider(): EmailProvider {
  const value = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (value === 'smtp' || value === 'resend') return value;
  return 'auto';
}

export function usesResend() {
  const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  return hasResend && (configuredProvider() === 'resend' || configuredProvider() === 'auto');
}

export function isEmailProviderConfigured() {
  if (!process.env.EMAIL_FROM) return false;
  if (configuredProvider() === 'resend') return Boolean(process.env.RESEND_API_KEY);
  if (configuredProvider() === 'smtp') return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  return usesResend() || Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function usesSmtp() {
  return Boolean(
    configuredProvider() !== 'resend' &&
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM,
  );
}

export async function sendViaSmtp(input: SendMailInput): Promise<{ sent: boolean; reason?: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, '');
  const from = process.env.EMAIL_FROM;
  if (!host || !user || !pass || !from) return { sent: false, reason: 'email-provider-not-configured' };

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: host.includes('gmail.com'),
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    });
    return { sent: true };
  } catch (error) {
    console.warn('[Mail] SMTP send failed:', (error as Error).message);
    return { sent: false, reason: 'provider-error' };
  }
}

export async function sendViaResend(input: SendMailInput): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { sent: false, reason: 'email-provider-not-configured' };

  const to = Array.isArray(input.to) ? input.to : [input.to];
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        reply_to: input.replyTo,
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });
    if (!response.ok) {
      console.warn('[Mail] Resend API rejected email:', response.status);
      return { sent: false, reason: 'provider-error' };
    }
    return { sent: true };
  } catch (error) {
    console.warn('[Mail] Resend API request failed:', (error as Error).message);
    return { sent: false, reason: 'provider-error' };
  }
}

export async function sendEmail(input: SendMailInput): Promise<{ sent: boolean; reason?: string }> {
  if (!isEmailProviderConfigured()) return { sent: false, reason: 'email-provider-not-configured' };
  // Prefer the HTTP provider whenever both legacy SMTP and Resend credentials exist.
  // EMAIL_PROVIDER=smtp is the explicit opt-in required to use SMTP.
  if (usesResend()) return sendViaResend(input);
  if (usesSmtp()) return sendViaSmtp(input);
  return { sent: false, reason: 'email-provider-not-configured' };
}
