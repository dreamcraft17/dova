import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import { PageHead, SupplierCard, buttonStyles, fieldStyles } from '../../components/supplier/ui';
import { api } from '../../lib/api';
import type { Category, Product } from 'dova-shared';

const empty = { name: '', description: '', price: 1000, quantity: 1, categoryId: '', imageUrl: '' };

function AddProductContent() {
  const router = useRouter();
  const editingId = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitBusy, setSubmitBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [cats, products] = await Promise.all([
          api<Category[]>('/categories'),
          editingId ? api<Product[]>('/suppliers/products') : Promise.resolve<Product[]>([]),
        ]);
        setCategories(cats);
        const existing = editingId ? products.find((p) => p.id === editingId) : undefined;
        if (existing) {
          setForm({
            name: existing.name,
            description: existing.description,
            price: existing.price,
            quantity: existing.stockQuantity,
            categoryId: existing.categoryId,
            imageUrl: existing.imageUrl || '',
          });
        } else if (cats[0]) {
          setForm((current) => ({ ...current, categoryId: current.categoryId || cats[0].id }));
        }
      } catch (err) {
        setMessage((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [editingId]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(undefined);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setSubmitBusy(true);
    try {
      const path = editingId ? `/suppliers/products/${editingId}` : '/suppliers/products';
      const body = new FormData();
      body.append('name', form.name);
      body.append('description', form.description);
      body.append('price', String(form.price));
      body.append('quantity', String(form.quantity));
      body.append('categoryId', form.categoryId);
      if (form.imageUrl) body.append('imageUrl', form.imageUrl);
      if (imageFile) body.append('image', imageFile);
      await api(path, { method: editingId ? 'PUT' : 'POST', body });
      await router.push('/supplier/products');
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSubmitBusy(false);
    }
  }

  return (
    <div className="space-y-[18px]">
      <PageHead
        eyebrow="Product Management"
        title={editingId ? 'Edit Product' : 'Add Product'}
        lead={
          editingId
            ? 'Update your product details. Changes are reflected on the DOVA marketplace once saved.'
            : 'Create a complete product listing that can be published to the DOVA marketplace.'
        }
        actions={
          <Button asChild variant="outline" className={buttonStyles.light}>
            <Link href="/supplier/products">← My Products</Link>
          </Button>
        }
      />

      <div className="rounded-[13px] border border-[#cce8db] bg-[#eaf6f1] px-4 py-3.5 text-[11px] text-[#17694f]">
        Prices start at ₦1,000. Products with low stock are flagged automatically, and removed products stay in your
        catalog under “Hidden” until you reactivate them.
      </div>

      <SupplierCard className="p-6">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={(e) => void submit(e)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="product-name" className={fieldStyles.label}>
                  Product Name *
                </Label>
                <Input
                  id="product-name"
                  required
                  placeholder="e.g. Plantain Flour"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={fieldStyles.control}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="product-category" className={fieldStyles.label}>
                  Category *
                </Label>
                <Select value={form.categoryId} onValueChange={(v: string) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger id="product-category" className={`${fieldStyles.control} w-full`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="product-price" className={fieldStyles.label}>
                  Price (₦) *
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  min={1000}
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className={fieldStyles.control}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="product-quantity" className={fieldStyles.label}>
                  Available Quantity *
                </Label>
                <Input
                  id="product-quantity"
                  type="number"
                  min={1}
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className={fieldStyles.control}
                />
              </div>
              <div className="grid gap-1.5 md:col-span-2">
                <Label htmlFor="product-description" className={fieldStyles.label}>
                  Description *
                </Label>
                <Textarea
                  id="product-description"
                  required
                  placeholder="Describe the product, origin, packaging and any relevant details."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${fieldStyles.control} h-auto min-h-[120px] py-3`}
                />
              </div>

              <div className="rounded-[15px] border border-dashed border-[rgba(8,127,91,0.35)] bg-[#f7faf6] p-6 text-center md:col-span-2">
                <strong className="block text-xs text-[var(--forest)]">Product image</strong>
                <span className="mb-3 mt-1 block text-[10px] text-muted-foreground">JPG, PNG or WEBP · max 5 MB</span>
                {imagePreview || form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview || form.imageUrl}
                    alt=""
                    className="mx-auto mb-3 max-h-40 max-w-40 rounded-[12px] object-cover"
                  />
                ) : null}
                <Label
                  htmlFor="product-image"
                  className={`${buttonStyles.light} inline-flex cursor-pointer items-center`}
                >
                  {imageFile ? `Selected: ${imageFile.name}` : 'Choose image'}
                </Label>
                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setImageFile(file);
                    if (file) setForm((current) => ({ ...current, imageUrl: '' }));
                  }}
                />
              </div>

              <div className="grid gap-1.5 md:col-span-2">
                <Label htmlFor="product-image-url" className={fieldStyles.label}>
                  Or image URL (optional)
                </Label>
                <Input
                  id="product-image-url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className={fieldStyles.control}
                />
              </div>
            </div>

            {message ? <p className="mt-4 text-xs text-destructive">{message}</p> : null}

            <div className="mt-5 flex justify-end gap-2">
              <Button asChild variant="outline" className={buttonStyles.light}>
                <Link href="/supplier/products">Cancel</Link>
              </Button>
              <Button type="submit" className={buttonStyles.primary} disabled={submitBusy}>
                {submitBusy ? 'Saving…' : editingId ? 'Save Changes' : 'Publish Product'}
              </Button>
            </div>
          </form>
        )}
      </SupplierCard>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <SupplierGate title="Add Product" subtitle="DOVA Supplier Dashboard">
      <AddProductContent />
    </SupplierGate>
  );
}
