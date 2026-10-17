import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Building2, FileUp, Lock, Mail, MessageCircle, Phone, User as UserIcon } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthField } from '../../components/auth/AuthField';
import { AuthPasswordField } from '../../components/auth/AuthPasswordField';
import { AuthMessage, AuthSubmit } from '../../components/auth/AuthControls';
import { DEFAULT_PHONE_VALUE, PhoneInput, formatE164, type PhoneValue } from '../../components/auth/PhoneInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api } from '../../lib/api';

export default function SupplierRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    password: '',
  });
  const [phone, setPhone] = useState<PhoneValue>(DEFAULT_PHONE_VALUE);
  const [whatsapp, setWhatsapp] = useState<PhoneValue>(DEFAULT_PHONE_VALUE);
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [file, setFile] = useState<File>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');

  function handlePhoneChange(next: PhoneValue) {
    setPhone(next);
    if (sameAsPhone) setWhatsapp(next);
  }

  function handleSameAsPhoneChange(checked: boolean) {
    setSameAsPhone(checked);
    if (checked) setWhatsapp(phone);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (phone.number.length < 6 || whatsapp.number.length < 6) {
      setError('Enter a valid phone number and WhatsApp number.');
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append('phone', formatE164(phone));
      body.append('whatsapp', formatE164(whatsapp));
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
          <PhoneInput
            id="supplier-phone"
            label="Phone number"
            icon={<Phone className="size-4" />}
            required
            value={phone}
            onChange={handlePhoneChange}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="supplier-same-as-phone"
              checked={sameAsPhone}
              onCheckedChange={(checked) => handleSameAsPhoneChange(checked === true)}
            />
            <Label htmlFor="supplier-same-as-phone" className="text-[11px] font-semibold text-muted-foreground">
              WhatsApp number is the same as phone number
            </Label>
          </div>
          <PhoneInput
            id="supplier-whatsapp"
            label="WhatsApp number"
            icon={<MessageCircle className="size-4" />}
            required
            disabled={sameAsPhone}
            value={whatsapp}
            onChange={setWhatsapp}
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
