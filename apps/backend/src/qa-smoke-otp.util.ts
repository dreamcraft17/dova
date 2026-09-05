/**
 * Lets the staging soft-launch QA runbook use a fixed OTP for a reserved
 * qa.softlaunch.<n>@example.com address instead of a freshly generated code,
 * so scripted QA runs don't need to read the code out of logs/email.
 */
export function qaSmokeOtpCode(email: string): string | undefined {
  const fixed = process.env.DOVA_QA_FIXED_OTP;
  if (!fixed || !/^qa\.softlaunch\.\d+@example\.com$/i.test(email)) return undefined;
  return fixed.replace(/\D/g, '').slice(-6).padStart(6, '0');
}
