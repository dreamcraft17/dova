/**
 * Platform commission: DOVA keeps a cut of each delivered order item's
 * subtotal, the supplier gets the rest. Applied at reimbursement-accrual
 * time (see database.service.ts accrueReimbursementForDeliveredOrder/Item),
 * not snapshotted on the order — so it covers already-placed orders that
 * haven't been accrued yet, as well as future ones.
 */
export function supplierShareRate(): number {
  const raw = Number(process.env.DOVA_SUPPLIER_SHARE_RATE ?? 0.8);
  return Number.isFinite(raw) && raw > 0 && raw <= 1 ? raw : 0.8;
}
