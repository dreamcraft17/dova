/** bcrypt cost. Production default 12; unit tests set BCRYPT_ROUNDS=4 via jest.setup.js. */
export function bcryptCost(): number {
  const n = Number(process.env.BCRYPT_ROUNDS);
  if (Number.isFinite(n) && n >= 4 && n <= 15) return Math.trunc(n);
  return 12;
}
