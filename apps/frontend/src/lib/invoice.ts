import type { Order } from 'dova-shared';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function naira(value: number) {
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function canDownloadInvoice(order: Order) {
  return Boolean(order.paymentVerifiedAt) || ['paid', 'processing', 'shipped', 'delivered'].includes(order.status);
}

export function openInvoice(order: Order) {
  if (typeof window === 'undefined' || !canDownloadInvoice(order)) return;
  const invoiceWindow = window.open('', '_blank');
  if (!invoiceWindow) return;

  const subtotal = order.items.reduce((total, item) => total + item.subtotal, 0);
  const deliveryFee = Math.max(0, order.totalAmount - subtotal);
  const itemRows = order.items.map((item) => `
    <tr>
      <td>${escapeHtml(item.bundleName ? `${item.bundleName} — ${item.product.name}` : item.product.name)}</td>
      <td>${escapeHtml(item.quantity)}</td>
      <td>${naira(item.unitPrice)}</td>
      <td>${naira(item.subtotal)}</td>
    </tr>`).join('');
  const date = new Date(order.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
  const paymentDate = order.paymentVerifiedAt
    ? new Date(order.paymentVerifiedAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Confirmed';

  invoiceWindow.document.write(`<!doctype html>
    <html><head><title>Invoice ${escapeHtml(order.orderNumber)} | DOVA Chain</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      *{box-sizing:border-box}body{margin:0;background:#f4f7f4;color:#19352a;font:14px/1.55 Arial,sans-serif}
      .invoice{width:min(820px,100%);margin:32px auto;background:#fff;padding:44px;box-shadow:0 10px 35px rgba(0,0,0,.08)}
      header{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #0f6b43;padding-bottom:24px;margin-bottom:28px}
      h1{margin:0;color:#0f6b43;font-size:30px}h2{margin:0 0 8px;font-size:18px;color:#0f6b43}.muted{color:#6b7f75}.right{text-align:right}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-bottom:30px}.meta p{margin:3px 0}
      table{width:100%;border-collapse:collapse;margin-top:16px}th,td{text-align:left;padding:12px 8px;border-bottom:1px solid #dce8df}th{color:#0f6b43;font-size:12px;text-transform:uppercase}td:nth-child(n+2),th:nth-child(n+2){text-align:right}
      .totals{width:min(360px,100%);margin:20px 0 0 auto}.total{font-size:19px;font-weight:700;color:#0f6b43;border-top:2px solid #0f6b43;padding-top:12px}
      .paid{display:inline-block;padding:5px 12px;border-radius:999px;background:#dcfce7;color:#15803d;font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:.08em}
      footer{border-top:1px solid #dce8df;margin-top:36px;padding-top:18px;text-align:center;color:#6b7f75}
      .print{display:block;margin:0 auto 18px;border:0;border-radius:8px;padding:11px 20px;background:#d8b24a;color:#173026;font-weight:700;cursor:pointer}
      @media print{body{background:#fff}.invoice{width:100%;margin:0;padding:0;box-shadow:none}.print{display:none}}
      @media(max-width:600px){.invoice{padding:24px 18px}header,.meta{display:block}.right{text-align:left;margin-top:14px}table{font-size:12px}}
    </style></head><body>
      <button class="print" onclick="window.print()">Print / Save as PDF</button>
      <main class="invoice">
        <header><div><h1>DOVA CHAIN</h1><p class="muted">Agricultural marketplace &amp; supply network</p></div><div class="right"><h2>INVOICE</h2><p><strong>${escapeHtml(order.orderNumber)}</strong></p><p class="muted">${escapeHtml(date)}</p><span class="paid">Payment confirmed</span></div></header>
        <section class="meta"><div><h2>Billed to</h2><p><strong>${escapeHtml(order.deliveryName)}</strong></p><p>${escapeHtml(order.deliveryPhone)}</p></div><div><h2>${order.fulfillmentType === 'pickup' ? 'Pickup details' : 'Delivery details'}</h2><p>${escapeHtml(order.deliveryAddress)}</p><p class="muted">Payment confirmed: ${escapeHtml(paymentDate)}</p></div></section>
        <h2>Order items</h2><table><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>${itemRows}</tbody></table>
        <section class="totals"><p>Subtotal <span style="float:right">${naira(subtotal)}</span></p><p>Delivery fee <span style="float:right">${naira(deliveryFee)}</span></p><p class="total">Total <span style="float:right">${naira(order.totalAmount)}</span></p></section>
        <footer>Thank you for choosing DOVA Chain.<br>Keep this invoice for your records.</footer>
      </main>
    </body></html>`);
  invoiceWindow.document.close();
  invoiceWindow.focus();
}
