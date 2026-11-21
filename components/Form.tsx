'use client';

import type { InputHTMLAttributes } from 'react';

export type FormError = { text: string; field?: string } | null;

/** Sends a form to this app's API. Errors come back in words the buyer can act on, naming the field when there is one. */
export async function send(url: string, method: string, body: unknown): Promise<{ ok: true } | { ok: false; error: FormError; status: number }> {
  try {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) return { ok: true };
    const data: { error?: string; field?: string } = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, error: { text: data.error ?? 'Something went wrong. Try again.', field: data.field } };
  } catch {
    return { ok: false, status: 0, error: { text: 'Couldn’t reach Kutch Shawls. Check your connection and try again.' } };
  }
}

/** Puts the cursor in the field an error names. */
export function focusField(prefix: string, error: FormError) {
  if (error?.field) document.getElementById(`${prefix}-${error.field}`)?.focus();
}

/** A labelled text field that shows when the form's error is about it. */
export function Field({
  prefix,
  name,
  label,
  hint,
  error,
  ...input
}: {
  prefix: string;
  name: string;
  label: string;
  hint?: string;
  error: FormError;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = `${prefix}-${name}`;
  const bad = error?.field === name;
  const described = [hint && `${id}-hint`, bad && `${prefix}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} aria-invalid={bad || undefined} aria-describedby={described} {...input} />
      {hint && (
        <span id={`${id}-hint`} className="hint">
          {hint}
        </span>
      )}
    </div>
  );
}

export function ErrorLine({ prefix, error }: { prefix: string; error: FormError }) {
  if (!error) return null;
  return (
    <p id={`${prefix}-error`} role="alert" className="form-error">
      {error.text}
    </p>
  );
}
