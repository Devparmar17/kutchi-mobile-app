'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ErrorLine, Field, focusField, send, type FormError } from '@/components/Form';
import Icon from '@/components/Icon';
import { toast } from '@/components/Toast';
import type { Address, User } from '@/lib/types';

const P = 'addr';

export default function AddressView({ user, next }: { user: User; next: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Address>(
    user.address ?? { line: '', area: '', city: user.city, pin: '', phone: '' },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FormError>(null);

  const bind = (name: keyof Address) => ({
    prefix: P,
    name,
    error,
    value: form[name],
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [name]: e.target.value }));
      if (!error?.field || error.field === name) setError(null);
    },
  });

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await send('/api/account', 'PATCH', { address: form });
    if (res.ok) {
      toast('Address saved');
      router.replace(next);
      return;
    }
    if (res.status === 401) {
      window.location.assign(`/login?next=${encodeURIComponent(`/profile/address?next=${next}`)}`);
      return;
    }
    setError(res.error);
    focusField(P, res.error);
    setBusy(false);
  }

  return (
    <div className="screen">
      <header className="topbar">
        <Link href={next} className="icon-btn" aria-label="Back">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <h1 className="topbar-title">Delivery address</h1>
      </header>

      <main className="scroll">
        <form className="page gap-16 top-18" onSubmit={save} noValidate>
          <p className="ink2 pretty">Shawls and course kits are sent here. The courier calls the number if they can’t find you.</p>
          <Field {...bind('line')} label="House or flat, and street" autoComplete="address-line1" required />
          <Field {...bind('area')} label="Area or landmark (optional)" autoComplete="address-line2" />
          <div className="two-up">
            <Field {...bind('city')} label="City" autoComplete="address-level2" required />
            <Field {...bind('pin')} label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={6} required />
          </div>
          <Field {...bind('phone')} label="Mobile number" type="tel" inputMode="tel" autoComplete="tel-national" required />
          <ErrorLine prefix={P} error={error} />
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving…' : 'Save address'}
          </button>
        </form>
      </main>
    </div>
  );
}
