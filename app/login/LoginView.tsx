'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import Icon, { Logo, WeaveStrip } from '@/components/Icon';

type Mode = 'login' | 'signup';
type Field = 'name' | 'email' | 'city' | 'password';

const COPY = {
  login: {
    title: 'Welcome back',
    lede: 'Log in to see your orders, your saved shawls and your courses.',
    note: 'Any email and password will log you in.',
    submit: 'Log in',
    busy: 'Logging in…',
    switchText: 'New to Kutch Shawls?',
    switchLink: 'Create an account',
  },
  signup: {
    title: 'Create your account',
    lede: 'Buy straight from the weavers and follow every order from loom to door.',
    note: 'Anyone can join.',
    submit: 'Create account',
    busy: 'Creating your account…',
    switchText: 'Already have an account?',
    switchLink: 'Log in',
  },
};

export default function LoginView({ mode, next }: { mode: Mode; next: string }) {
  const [form, setForm] = useState({ name: '', email: '', city: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; field?: Field } | null>(null);

  const copy = COPY[mode];
  const other: Mode = mode === 'login' ? 'signup' : 'login';
  const otherHref = `/login?${other === 'signup' ? 'mode=signup&' : ''}next=${encodeURIComponent(next)}`;

  const set = (field: Field, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (error?.field === field || !error?.field) setError(null);
  };

  const invalid = (field: Field) => ({
    'aria-invalid': error?.field === field ? (true as const) : undefined,
    'aria-describedby': error?.field === field ? 'auth-error' : undefined,
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.password) {
      setError({ text: 'Enter a password.', field: 'password' });
      document.getElementById('auth-password')?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The password stays on this screen: no password is checked, so none is sent.
        body: JSON.stringify(mode === 'login' ? { email: form.email } : { name: form.name, email: form.email, city: form.city }),
      });
      if (res.ok) {
        // A full page load, so every screen is rendered again for the signed-in buyer.
        window.location.assign(next);
        return;
      }
      const data: { error?: string; field?: Field } = await res.json();
      setError({ text: data.error ?? 'Something went wrong. Try again.', field: data.field });
      if (data.field) document.getElementById(`auth-${data.field}`)?.focus();
    } catch {
      setError({ text: 'Couldn’t reach Kutch Shawls. Check your connection and try again.' });
    }
    setBusy(false);
  }

  return (
    <div className="screen">
      <header className="topbar plain">
        <Link href="/" className="icon-btn" aria-label="Back">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
      </header>

      <main className="scroll">
        <div className="page gap-24 auth">
          <div className="col gap-10">
            <Logo size={40} />
            <h1 className="h1 tight">{copy.title}</h1>
            <p className="ink2 pretty">{copy.lede}</p>
          </div>

          <form className="col gap-16" onSubmit={submit} noValidate>
            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  {...invalid('name')}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                {...invalid('email')}
              />
            </div>

            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="auth-city">City</label>
                <input
                  id="auth-city"
                  autoComplete="address-level2"
                  required
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  {...invalid('city')}
                />
                <span className="hint">Where your shawls will be delivered.</span>
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-password">Password</label>
              <div className="password">
                <input
                  id="auth-password"
                  type={show ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  {...invalid('password')}
                />
                <button type="button" aria-pressed={show} onClick={() => setShow(!show)}>
                  {show ? 'Hide' : 'Show'}
                  <span className="sr-only"> password</span>
                </button>
              </div>
            </div>

            {error && (
              <p id="auth-error" role="alert" className="form-error">
                {error.text}
              </p>
            )}

            <button type="submit" className="btn" disabled={busy}>
              {busy ? copy.busy : copy.submit}
            </button>
          </form>

          <p className="auth-note">
            {copy.note} Your account is kept on this device, so it won’t appear on another phone or browser.
          </p>

          <p className="auth-switch">
            {copy.switchText}{' '}
            <Link href={otherHref} className="auth-link">
              {copy.switchLink}
            </Link>
          </p>

          <Link href="/shop" className="auth-browse">
            Just browsing? Look around the shop
            <Icon name="arrow" size={16} strokeWidth={2} />
          </Link>
        </div>
      </main>

      <WeaveStrip id="weave-auth" ground="#1D2756" />
    </div>
  );
}
