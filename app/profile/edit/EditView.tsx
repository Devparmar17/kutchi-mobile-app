'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ErrorLine, Field, focusField, send, type FormError } from '@/components/Form';
import Icon from '@/components/Icon';
import { toast } from '@/components/Toast';
import { addressLine } from '@/lib/catalog';
import type { User } from '@/lib/types';

const P = 'me';

export default function EditView({ user }: { user: User }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: user.name, city: user.city });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FormError>(null);

  const bind = (name: 'name' | 'city') => ({
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
    const res = await send('/api/account', 'PATCH', form);
    if (res.ok) {
      toast('Saved');
      router.replace('/profile');
      return;
    }
    setError(res.error);
    focusField(P, res.error);
    setBusy(false);
  }

  return (
    <div className="screen">
      <header className="topbar">
        <Link href="/profile" className="icon-btn" aria-label="Back to profile">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <h1 className="topbar-title">Your details</h1>
      </header>

      <main className="scroll">
        <form className="page gap-16 top-18" onSubmit={save} noValidate>
          <Field {...bind('name')} label="Full name" autoComplete="name" required />
          <Field {...bind('city')} label="City" autoComplete="address-level2" required />
          <div className="field">
            <span className="field-label">Email</span>
            <span className="field-static">{user.email}</span>
            <span className="hint">To use another email, sign out and log in with it.</span>
          </div>
          <ErrorLine prefix={P} error={error} />
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </form>

        <div className="page gap-8 top-0">
          <h2 className="group-title">Delivery address</h2>
          <Link href="/profile/address?next=/profile/edit" className="card row tall">
            <Icon name="pin" className="muted" />
            <span className="col grow">
              {user.address ? (
                <>
                  <span>{addressLine(user.address)}</span>
                  <span className="small muted">{user.address.phone}</span>
                </>
              ) : (
                <span>Add a delivery address</span>
              )}
            </span>
            <Icon name="chevron" size={16} strokeWidth={2} className="muted" />
          </Link>
        </div>
      </main>
    </div>
  );
}
