'use client';

import { useSyncExternalStore } from 'react';

let message = '';
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Shows a short message at the foot of the screen; a new one replaces the last. */
export function toast(text: string) {
  message = text;
  clearTimeout(timer);
  timer = setTimeout(() => {
    message = '';
    emit();
  }, 2600);
  emit();
}

export default function Toaster() {
  const text = useSyncExternalStore(
    subscribe,
    () => message,
    () => '',
  );
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {text && <div className="toast">{text}</div>}
    </div>
  );
}
