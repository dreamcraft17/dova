import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category, Product } from 'dova-shared';
import { computeBundlePricing } from 'dova-shared';

export type BundleFormValues = {
  name: string;
  description: string;
  categoryId: string;
  imageUrl: string;
  bundlePrice: number;
  isFeatured: boolean;
};

export type BundleContentRow = { productId: string; quantity: number; product: Product };

export function BundleForm({
  initial,
  initialContents,
  categories,
  products,
  submitLabel,
  busy,
  onSubmit,
}: {
  initial?: BundleFormValues;
  initialContents?: BundleContentRow[];
  categories: Category[];
  products: Product[];
  submitLabel: string;
  busy: boolean;
  onSubmit: (values: BundleFormValues, contents: BundleContentRow[]) => Promise<void> | void;
}) {
  const [form, setForm] = useState<BundleFormValues>(
    initial ?? { name: '', description: '', categoryId: '', imageUrl: '', bundlePrice: 1000, isFeatured: false },
  );
  const [contents, setContents] = useState<BundleContentRow[]>(initialContents ?? []);
  const [productSearch, setProductSearch] = useState('');
  const [message, setMessage] = useState('');

  function addContent(product: Product) {
    setContents((prev) => [...prev, { productId: product.id, quantity: 1, product }]);
    setProductSearch('');
  }
  function removeContent(productId: string) {
    setContents((prev) => prev.filter((c) => c.productId !== productId));
  }
  function updateQuantity(productId: string, quantity: number) {
    setContents((prev) => prev.map((c) => (c.productId === productId ? { ...c, quantity } : c)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    if (!form.name.trim()) return setMessage('Bundle name is required.');
    if (contents.length < 2) return setMessage('Add at least 2 products to this bundle.');
    const price = Number(form.bundlePrice);
    if (!price || price <= 0 || Number.isNaN(price)) return setMessage('Bundle price must be greater than zero.');
    for (const c of contents) {
      if (!c.quantity || c.quantity <= 0 || Number.isNaN(c.quantity)) {
        return setMessage('All product quantities must be greater than zero.');
      }
    }
    const preview = computeBundlePricing(price, contents.map((c) => ({ quantity: c.quantity, product: { price: c.product.price } })));
    if (preview.savingsAmount <= 0) return setMessage('Bundle price must be less than the individual total of its contents.');
    await onSubmit(form, contents);
  }

  const preview =
    contents.length >= 2
      ? computeBundlePricing(Number(form.bundlePrice) || 0, contents.map((c) => ({ quantity: c.quantity, product: { price: c.product.price } })))
      : undefined;
  const previewInvalid = preview ? preview.savingsAmount <= 0 : false;

  const searchResults = productSearch.trim()
    ? products
        .filter(
          (p) =>
            p.isActive &&
            p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
            !contents.some((c) => c.productId === p.id),
        )
        .slice(0, 8)
    : [];

  return (
    <Card className="max-w-2xl p-5">
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <div className="space-y-1.5">
          <Label htmlFor="bundle-name">Name</Label>
          <Input id="bundle-name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bundle-description">Description</Label>
          <Textarea
            id="bundle-description"
            required
            minLength={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bundle-category">Category</Label>
          <Select value={form.categoryId || 'none'} onValueChange={(v) => setForm({ ...form, categoryId: v === 'none' ? '' : v })}>
            <SelectTrigger id="bundle-category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bundle-price">Bundle price (₦)</Label>
          <Input
            id="bundle-price"
            type="number"
            min={1}
            required
            value={form.bundlePrice}
            onChange={(e) => setForm({ ...form, bundlePrice: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bundle-image">Image URL (optional)</Label>
          <Input
            id="bundle-image"
            placeholder="https://..."
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-input px-3 py-2.5">
          <Label htmlFor="bundle-featured" className="cursor-pointer">
            Featured
          </Label>
          <Switch id="bundle-featured" checked={form.isFeatured} onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked })} />
        </div>

        <div className="space-y-2 rounded-lg border border-input p-3">
          <Label>Products in this bundle</Label>
          <Input
            placeholder="Search products to add…"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          {searchResults.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="rounded-full border border-input px-3 py-1 text-xs font-semibold hover:bg-muted"
                  onClick={() => addContent(p)}
                >
                  + {p.name} — ₦{p.price.toLocaleString('en-NG')}
                </button>
              ))}
            </div>
          ) : null}

          {contents.map((c) => (
            <div key={c.productId} className="flex items-center gap-3 rounded-lg bg-muted p-2 text-sm">
              <span className="flex-1 font-medium">{c.product.name}</span>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={c.quantity}
                onChange={(e) => updateQuantity(c.productId, Number(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">₦{c.product.price.toLocaleString('en-NG')} each</span>
              <span className="font-semibold">₦{(c.product.price * c.quantity).toLocaleString('en-NG')}</span>
              <button type="button" onClick={() => removeContent(c.productId)} aria-label="Remove">
                <X className="size-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}

          {contents.length < 2 ? <p className="text-xs text-muted-foreground">Add at least 2 products to this bundle.</p> : null}
        </div>

        {preview ? (
          <p className={previewInvalid ? 'text-sm text-destructive' : 'text-sm text-secondary'}>
            {previewInvalid
              ? 'Bundle price must be less than the individual total of its contents.'
              : `Individual total: ₦${preview.individualTotal.toLocaleString('en-NG')} · Savings: ₦${preview.savingsAmount.toLocaleString('en-NG')} (${Math.round(preview.savingsPercentage)}%)`}
          </p>
        ) : null}

        {message ? <p className="text-sm text-destructive">{message}</p> : null}

        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
