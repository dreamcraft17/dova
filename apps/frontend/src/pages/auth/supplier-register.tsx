import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Building2, FileUp, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthField } from '../../components/auth/AuthField';
import { AuthPasswordField } from '../../components/auth/AuthPasswordField';
import { AuthMessage, AuthSubmit } from '../../components/auth/AuthControls';
import { api } from '../../lib/api';

export default function SupplierRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [file, setFile] = useState<File>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (file) body.append('verificationDocs', file);
      const result = await api<{ message: string }>('/suppliers/register', {
        method: 'POST',
        body,
      });
      setDone(result.message);
      setTimeout(() => void router.push('/auth/login'), 1200);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell aside={<AuthAside variant="supplier" />}>
      <AuthCard
        eyebrow="Supplier application"
        title="Become a DOVA Supplier"
        subtitle="Join our trusted supplier network and connect your products directly with customers."
        portal="Farmer & Supplier Portal"
        securityNote={
          <>
            <strong>Reviewed by the DOVA team.</strong> Your supplier dashboard opens once an admin approves your
            application and verification document.
          </>
        }
        footer={
          <p>
            Already registered? <Link href="/auth/login">Sign in</Link>
          </p>
        }
      >
        <form className="grid gap-4" onSubmit={submit}>
          <AuthField
            id="supplier-contact"
            label="Contact / full name"
            required
            autoComplete="name"
            placeholder="Ada Okonkwo"
            icon={<UserIcon className="size-4" />}
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          />
          <AuthField
            id="supplier-business"
            label="Farm / company name"
            required
            autoComplete="organization"
            placeholder="Green Valley Farms"
            icon={<Building2 className="size-4" />}
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
          <AuthField
            id="supplier-email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            icon={<Mail className="size-4" />}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <AuthField
            id="supplier-phone"
            label="Phone number"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+234 ..."
            icon={<Phone className="size-4" />}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <AuthPasswordField
            id="supplier-password"
            label="Password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            icon={<Lock className="size-4" />}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <div className="grid gap-1.5">
            <span className="text-[11px] font-black text-[var(--deep)]">Verification document</span>
            <div className="rounded-[15px] border border-dashed border-[rgba(8,127,91,0.35)] bg-[#f7faf6] p-4">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Upload <strong className="text-[var(--deep)]">one clear document</strong> that proves your business or
                identity (PDF, JPG or PNG, max 5 MB):
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-muted-foreground">
                <li>
                  <strong className="text-[var(--deep)]">CAC / Business Name Registration</strong> (preferred for
                  companies)
                </li>
                <li>
                  <strong className="text-[var(--deep)]">Valid government ID</strong> of the owner/contact — NIN slip,
                  National ID, Driver&apos;s Licence, or International Passport
                </li>
                <li>
                  Optional for farms: <strong className="text-[var(--deep)]">proof of farm/business address</strong>{' '}
                  (e.g. utility bill)
                </li>
              </ul>
              <label
                htmlFor="supplier-document"
                className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-border bg-white px-4 py-3 text-xs font-black text-[var(--forest)] hover:bg-[#f1f7f2]"
              >
                <FileUp className="size-4" />
                <span className="truncate">{file ? file.name : 'Choose document'}</span>
              </label>
              <input
                id="supplier-document"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            </div>
          </div>

          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
          {done ? <AuthMessage tone="success">{done}</AuthMessage> : null}
          <AuthSubmit busy={busy} busyLabel="Submitting…" disabled={Boolean(done)}>
            Submit Application
          </AuthSubmit>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
