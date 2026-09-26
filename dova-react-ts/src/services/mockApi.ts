export type MockSubmission = Record<string, FormDataEntryValue>;

export async function submitPrototypeForm(data: MockSubmission): Promise<{ ok: true; data: MockSubmission }> {
  await new Promise((resolve) => window.setTimeout(resolve, 250));
  return { ok: true, data };
}

export async function addToMockCart(item: { product: string; pack: string; quantity: number }) {
  await new Promise((resolve) => window.setTimeout(resolve, 150));
  return { ok: true, item };
}

export async function submitMockReview(review: { name: string; rating: number; text: string }) {
  await new Promise((resolve) => window.setTimeout(resolve, 200));
  return { ok: true, review };
}
