import { useEffect, useState, type FormEvent } from 'react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '../../lib/api';
import type { Promotion } from 'dova-shared';

const empty = { title: '', linkUrl: '', isActive: true };

function PromotionsContent() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [existingImageUrl, setExistingImageUrl] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      setPromotions(await api<Promotion[]>('/admin/promotions'));
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(undefined);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function startEdit(promo: Promotion) {
    setEditingId(promo.id);
    setForm({ title: promo.title, linkUrl: promo.linkUrl || '', isActive: promo.isActive });
    setExistingImageUrl(promo.imageUrl);
    setImageFile(undefined);
  }

  function resetForm() {
    setEditingId(undefined);
    setForm(empty);
    setExistingImageUrl(undefined);
    setImageFile(undefined);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const path = editingId ? `/admin/promotions/${editingId}` : '/admin/promotions';
      const body = new FormData();
      body.append('title', form.title);
      body.append('isActive', String(form.isActive));
      if (form.linkUrl.trim()) body.append('linkUrl', form.linkUrl.trim());
      if (imageFile) body.append('image', imageFile);
      await api(path, { method: editingId ? 'PUT' : 'POST', body });
      resetForm();
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(promo: Promotion) {
    setBusy(true);
    try {
      await api(`/admin/promotions/${promo.id}/active`, {
        method: 'PUT',
        body: JSON.stringify({ active: !promo.isActive }),
      });
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(promo: Promotion) {
    if (!confirm(`Delete promotion "${promo.title}"?`)) return;
    setBusy(true);
    try {
      await api(`/admin/promotions/${promo.id}`, { method: 'DELETE' });
      if (editingId === promo.id) resetForm();
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Marketing</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Promotions</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">
          The active promotion shows as a one-time popup to customers when they open the storefront (once per
          browser session). Only one promotion can be active at a time.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</Card>
      ) : null}

      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold text-primary">{editingId ? 'Edit promotion' : 'New promotion'}</h2>
        <form onSubmit={(e) => void submit(e)} className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="promo-title">Title *</Label>
            <Input
              id="promo-title"
              required
              placeholder="e.g. 12.12 Harvest Sale"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="promo-link">Link URL (optional)</Label>
            <Input
              id="promo-link"
              placeholder="https://..."
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground">Where customers go when they tap the banner.</p>
          </div>

          <div className="grid gap-1.5 md:col-span-2">
            <Label>Banner image {editingId ? '' : '*'}</Label>
            {imagePreview || existingImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview || existingImageUrl}
                alt=""
                className="mb-2 max-h-40 rounded-[10px] border object-contain"
              />
            ) : null}
            <Label htmlFor="promo-image" className="inline-flex w-fit cursor-pointer items-center rounded-md border px-3 py-2 text-xs font-semibold">
              {imageFile ? `Selected: ${imageFile.name}` : 'Choose image'}
            </Label>
            <input
              id="promo-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => setImageFile(e.target.files?.[0])}
            />
            <p className="text-[10px] text-muted-foreground">JPG, PNG or WEBP · max 5 MB. Recommended: wide banner, e.g. 1200×675.</p>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="promo-active" checked={form.isActive} onCheckedChange={(v: boolean) => setForm({ ...form, isActive: v })} />
            <Label htmlFor="promo-active">Active (visible to customers)</Label>
          </div>

          <div className="flex items-end justify-end gap-2 md:col-span-2">
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel edit
              </Button>
            ) : null}
            <Button type="submit" disabled={busy || (!editingId && !imageFile)}>
              {busy ? 'Saving…' : editingId ? 'Save changes' : 'Create promotion'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banner</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No promotions yet.'}
                </TableCell>
              </TableRow>
            ) : (
              promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={promo.imageUrl} alt="" className="h-10 w-16 rounded object-cover" />
                  </TableCell>
                  <TableCell className="font-bold">{promo.title}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                    {promo.linkUrl || '—'}
                  </TableCell>
                  <TableCell>
                    <span className={promo.isActive ? 'font-semibold text-emerald-600' : 'text-muted-foreground'}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(promo)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void toggleActive(promo)}>
                        {promo.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                        disabled={busy}
                        onClick={() => void remove(promo)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function AdminPromotionsPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Promotions" subtitle="Storefront popup ads">
          <PromotionsContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
