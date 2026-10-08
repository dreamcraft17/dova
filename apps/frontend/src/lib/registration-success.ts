export function isRegistrationSuccessContinueKey(key: string): boolean {
  return key === 'Escape' || key === 'Enter';
}

export function isRegistrationSuccessBackdropClick(target: unknown, currentTarget: unknown): boolean {
  return target === currentTarget;
}
