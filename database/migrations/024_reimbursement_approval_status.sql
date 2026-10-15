ALTER TABLE supplier_reimbursements DROP CONSTRAINT IF EXISTS supplier_reimbursements_status_check;
ALTER TABLE supplier_reimbursements
  ADD CONSTRAINT supplier_reimbursements_status_check
  CHECK (status IN ('pending_approval', 'pending_transfer', 'processing', 'awaiting_otp', 'success', 'failed'));
