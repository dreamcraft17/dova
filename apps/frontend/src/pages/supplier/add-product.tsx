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
import { MAX_PRODUCT_IMAGES } from 'dova-shared';

const empty = { name: '', description: '', price: 1000, quantity: 1, categoryId: '', unitLabel: '' };

type PendingImage = { file: File; previewUrl: string };

function AddProductContent() {
  const router = useRouter();
  const editingId = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitBusy, setSubmitBusy] = useState(false);

  const totalImages = existingImageUrls.length + pendingImages.length;
  const atImageLimit = totalImages >= MAX_PRODUCT_IMAGES;

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
            unitLabel: existing.unitLabel || '',
          });
          setExistingImageUrls(
            existing.imageUrls?.length ? existing.imageUrls : existing.imageUrl ? [existing.imageUrl] : [],
          );
        } else if (cats[0]) {
          setForm((current) => ({ ...current, categoryId: current.categoryId || cats[0].id }));
        }
      } catch (err) {
        setLoadError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [editingId]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_PRODUCT_IMAGES - totalImages;
    if (room <= 0) return;
    const next = Array.from(files)
      .slice(0, room)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPendingImages((current) => [...current, ...next]);
  }

  function removeExistingImage(url: string) {
    setExistingImageUrls((current) => current.filter((u) => u !== url));
  }

  function removePendingImage(previewUrl: string) {
    setPendingImages((current) => {
      const target = current.find((img) => img.previewUrl === previewUrl);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((img) => img.previewUrl !== previewUrl);
    });
  }

  function addImageUrl() {
    const url = imageUrlInput.trim();
    if (!url || atImageLimit) return;
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid protocol');
    } catch {
      setSubmitError('Image URL must be a valid http(s) link.');
      return;
    }
    setSubmitError('');
    setExistingImageUrls((current) => (current.includes(url) ? current : [...current, url]));
    setImageUrlInput('');
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setSubmitBusy(true);
    try {
      const path = editingId ? `/suppliers/products/${editingId}` : '/suppliers/products';
      const body = new FormData();
      body.append('name', form.name);
      body.append('description', form.description);
      body.append('price', String(form.price));
      body.append('quantity', String(form.quantity));
      body.append('categoryId', form.categoryId);
      if (form.unitLabel.trim()) body.append('unitLabel', form.unitLabel.trim());
      body.append('imageUrls', JSON.stringify(existingImageUrls));
      pendingImages.forEach((img) => body.append('images', img.file));
      await api(path, { method: editingId ? 'PUT' : 'POST', body });
      await router.push('/supplier/products');
    } catch (err) {
      setSubmitError((err as Error).message);
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

      {loadError ? (
        <p className="rounded-[13px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          Could not load categories: {loadError}
        </p>
      ) : null}

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
                  placeholder="e.g. Premium Rice"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={fieldStyles.control}
                />
              </div>
              <div className="grid gap-1.5 md:col-span-2">
                <Label htmlFor="product-unit-label" className={fieldStyles.label}>Selling unit / pack size *</Label>
                <Input id="product-unit-label" required maxLength={80} placeholder="e.g. 25 kg bag, 1 bag, 500 ml bottle, 1 crate" value={form.unitLabel} onChange={(e) => setForm({ ...form, unitLabel: e.target.value })} className={fieldStyles.control} />
                <p className="text-[10px] text-muted-foreground">Price and stock will be shown using this label. Enter the number of packs/bags available in stock.</p>
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

              <div className="rounded-[15px] border border-dashed border-[rgba(8,127,91,0.35)] bg-[#f7faf6] p-6 md:col-span-2">
                <div className="flex items-center justify-between">
                  <strong className="block text-xs text-[var(--forest)]">Product images</strong>
                  <span className="text-[10px] text-muted-foreground">{totalImages}/{MAX_PRODUCT_IMAGES} · JPG, PNG or WEBP · max 5 MB each</span>
                </div>
                <p className="mb-3 mt-1 text-[10px] text-muted-foreground">
                  The first image is used as the cover photo everywhere on the marketplace. The rest appear as a gallery on the product page.
                </p>

                {totalImages > 0 ? (
                  <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {existingImageUrls.map((url, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <div key={url} className="group relative aspect-square overflow-hidden rounded-[10px] border border-[rgba(8,127,91,0.2)]">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {index === 0 ? (
                          <span className="absolute left-1 top-1 rounded bg-[var(--forest)] px-1.5 py-0.5 text-[8px] font-bold text-white">Cover</span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] text-white"
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {pendingImages.map((img) => (
                      <div key={img.previewUrl} className="group relative aspect-square overflow-hidden rounded-[10px] border border-[rgba(8,127,91,0.2)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                        {existingImageUrls.length === 0 && pendingImages[0] === img ? (
                          <span className="absolute left-1 top-1 rounded bg-[var(--forest)] px-1.5 py-0.5 text-[8px] font-bold text-white">Cover</span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removePendingImage(img.previewUrl)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] text-white"
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <Label
                  htmlFor="product-image"
                  className={`${buttonStyles.light} inline-flex cursor-pointer items-center ${atImageLimit ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Add images
                </Label>
                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={atImageLimit}
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              <div className="grid gap-1.5 md:col-span-2">
                <Label htmlFor="product-image-url" className={fieldStyles.label}>
                  Or add an image URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="product-image-url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://..."
                    disabled={atImageLimit}
                    className={fieldStyles.control}
                  />
                  <Button type="button" variant="outline" className={buttonStyles.light} onClick={addImageUrl} disabled={atImageLimit || !imageUrlInput.trim()}>
                    Add
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Paste a public image link — no upload happens until you tap Publish Product. Prefer &quot;Add images&quot; from your phone gallery if the link fails to preview.
                </p>
              </div>
            </div>

            {submitError ? <p className="mt-4 text-xs text-destructive">{submitError}</p> : null}

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
