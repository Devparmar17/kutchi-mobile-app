'use client';

import { useSyncExternalStore } from 'react';
import { lineKey } from './catalog';
import type { BagLine, State } from './types';

// The bag, its gift note and saved shawls are kept in this browser's localStorage, so they work before
// logging in. Orders and courses are kept with the buyer's account instead, a cookie on this device
// (lib/server/session.ts).
const KEY = 'kutch-shawls-app:v1';

const MAX_NOTE = 200;

const SEED: State = { bag: [], saved: [], giftNote: '' };

let state: State | null = null;
let listening = false;
const listeners = new Set<() => void>();

function read(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.bag) && Array.isArray(parsed?.saved)) {
        const giftNote = typeof parsed.giftNote === 'string' ? parsed.giftNote.slice(0, MAX_NOTE) : '';
        return { bag: parsed.bag, saved: parsed.saved, giftNote };
      }
    }
  } catch {
    // Unreadable or blocked storage: start with an empty bag.
  }
  return SEED;
}

function getSnapshot() {
  if (!state) state = read();
  return state;
}

function getServerSnapshot() {
  return SEED;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!listening) {
    listening = true;
    // Keep other open tabs in step.
    window.addEventListener('storage', (e) => {
      if (e.key === KEY || e.key === null) {
        state = read();
        emit();
      }
    });
  }
  return () => {
    listeners.delete(listener);
  };
}

function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage is full or blocked: the change still holds until the tab closes.
  }
  emit();
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const actions = {
  /** Adds one of the shawl, up to `max`: what the vendor has, or the most one order can hold. */
  addToBag(id: string, variant: string | undefined, max: number) {
    const s = getSnapshot();
    const key = lineKey({ id, variant });
    const exists = s.bag.some((l) => lineKey(l) === key);
    const bag: BagLine[] = exists
      ? s.bag.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(max, l.qty + 1) } : l))
      : [...s.bag, { id, variant, qty: 1 }];
    commit({ ...s, bag });
  },

  setQty(key: string, qty: number) {
    const s = getSnapshot();
    commit({ ...s, bag: s.bag.map((l) => (lineKey(l) === key ? { ...l, qty } : l)) });
  },

  removeLine(key: string) {
    const s = getSnapshot();
    commit({ ...s, bag: s.bag.filter((l) => lineKey(l) !== key) });
  },

  /** Empties the bag, and its gift note, once its order has been placed. */
  clearBag() {
    commit({ ...getSnapshot(), bag: [], giftNote: '' });
  },

  setGiftNote(text: string) {
    commit({ ...getSnapshot(), giftNote: text.slice(0, MAX_NOTE) });
  },

  toggleSaved(id: string) {
    const s = getSnapshot();
    const saved = s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id];
    commit({ ...s, saved });
  },
};

export { MAX_NOTE };
