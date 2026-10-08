type OtpEmailKind = 'verification' | 'password-reset';

function frontendBase() {
  return (process.env.FRONTEND_URL ?? 'https://dova.dntech.id').split(',')[0].trim().replace(/\/$/, '');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function otpCopy(kind: OtpEmailKind) {
  if (kind === 'password-reset') {
    return {
      subject: 'Reset your DOVA password',
      preheader: 'Use this code to choose a new password.',
      headline: 'Password reset code',
      lead: 'You asked to reset your DOVA password. Enter the code below on the reset page.',
      actionLabel: 'Open password reset',
      actionPath: '/auth/reset-password',
      ignore: 'If you did not request a password reset, ignore this email. Your password stays the same.',
    };
  }
  return {
    subject: 'Verify your DOVA email',
    preheader: 'Enter this code in Profile to unlock checkout.',
    headline: 'Email verification code',
    lead: 'Thanks for joining DOVA. Enter this code in your Profile to verify your email before your first order.',
    actionLabel: 'Open Profile',
    actionPath: '/customer/profile?verify=1',
    ignore: 'If you did not create a DOVA account, you can ignore this email.',
  };
}

export function buildOtpEmail(kind: OtpEmailKind, fullName: string, code: string) {
  const copy = otpCopy(kind);
  const base = frontendBase();
  const logoUrl = `${base}/images/logo.jpg`;
  const actionUrl = `${base}${copy.actionPath}`;
  const safeName = escapeHtml(fullName.trim() || 'there');
  const safeCode = escapeHtml(code);

  const text = [
    `Hello ${fullName.trim() || 'there'},`,
    '',
    copy.lead,
    '',
    `Your code: ${code}`,
    'This code expires in 10 minutes.',
    '',
    `${copy.actionLabel}: ${actionUrl}`,
    '',
    copy.ignore,
    '',
    '— DOVA · Verified agricultural supply',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f8faf8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a2e24;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(copy.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8faf8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #dce8df;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15,107,67,0.08);">
          <tr>
            <td style="background:#eaf6f0;border-bottom:3px solid #d8b24a;padding:28px 32px 24px;text-align:center;">
              <img src="${logoUrl}" width="72" height="72" alt="DOVA" style="display:block;margin:0 auto 12px;border-radius:50%;object-fit:cover;" />
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0f6b43;">DOVA</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="margin:0 0 8px;font-size:14px;color:#5c7368;">Hello ${safeName},</p>
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:700;color:#1a2e24;">${escapeHtml(copy.headline)}</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#5c7368;">${escapeHtml(copy.lead)}</p>
              <div style="text-align:center;padding:20px 16px;background:#f8faf8;border:1px dashed #b8d4c4;border-radius:12px;margin:0 0 20px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0f6b43;">Your 6-digit code</p>
                <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:0.32em;color:#0b5535;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${safeCode}</p>
              </div>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.55;color:#5c7368;">Code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="border-radius:10px;background:#0f6b43;">
                    <a href="${actionUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(copy.actionLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8a9d94;">${escapeHtml(copy.ignore)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid #eaf6f0;background:#fcfdfc;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#8a9d94;">Verified farms &amp; suppliers · Morning &amp; evening delivery slots</p>
              <p style="margin:8px 0 0;font-size:11px;color:#b0beb8;"><a href="${base}" style="color:#0f6b43;text-decoration:none;">dova.dntech.id</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: copy.subject, text, html };
}
