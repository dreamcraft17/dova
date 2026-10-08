export type NotifyResult = { sent: boolean; reason?: string };

/**
 * Email notifications are a side effect, not part of the core transaction — a Resend
 * outage or timeout must never fail the approval/rejection/contact-form request itself.
 */
export async function notifySafely(send?: Promise<NotifyResult>): Promise<NotifyResult | undefined> {
  if (!send) return undefined;
  try {
    return await send;
  } catch (error) {
    console.warn('[Notifications] send failed, continuing without email:', (error as Error).message);
    return { sent: false, reason: 'notification-error' };
  }
}
