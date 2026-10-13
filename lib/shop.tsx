'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { OrderStatus, Shop } from './types';

// The shawls, their prices and their stock belong to the vendor's studio. Each page arrives
// with the shop as it was when the server rendered it; this keeps it fresh while the app is open.
const SHOP_POLL_MS = 10_000;
const ORDER_POLL_MS = 8_000;

const InitialShop = createContext<Shop>({ online: false, version: 0, products: [] });

let live: Shop | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

/** Asks for the shop again; the server answers "unchanged" unless the vendor has changed something. */
export async function refreshShop() {
  try {
    const res = await fetch(`/api/shop/products?v=${live?.version ?? 0}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data: Shop | { unchanged: true } = await res.json();
    if ('unchanged' in data) return;
    if (data.online) live = data;
    // The studio has gone quiet: keep the shawls on screen, but say so.
    else if (live) live = { ...live, online: false, version: 0 };
    else return;
    listeners.forEach((l) => l());
  } catch {
    // This app's own server can't be reached: keep showing what we have.
  }
}

function onVisible() {
  if (!document.hidden) void refreshShop();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refreshShop();
    timer = setInterval(onVisible, SHOP_POLL_MS);
    document.addEventListener('visibilitychange', onVisible);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    }
  };
}

export function ShopProvider({ initial, children }: { initial: Shop; children: ReactNode }) {
  return <InitialShop value={initial}>{children}</InitialShop>;
}

export function useShop(): Shop {
  const initial = useContext(InitialShop);
  return useSyncExternalStore(
    subscribe,
    () => live ?? initial,
    () => initial,
  );
}

export const useProducts = () => useShop().products;

/** Where the vendor has got to with an order, checked again every few seconds. */
export function useOrderStatus(no: number | undefined, initial: OrderStatus | null) {
  const [status, setStatus] = useState(initial);

  useEffect(() => {
    if (no === undefined) return;
    let stopped = false;
    const check = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/shop/orders/${no}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data: { status: OrderStatus | null } = await res.json();
        if (!stopped && data.status) setStatus(data.status);
      } catch {
        // Offline for a moment: the last known status stays.
      }
    };
    const poll = setInterval(check, ORDER_POLL_MS);
    return () => {
      stopped = true;
      clearInterval(poll);
    };
  }, [no]);

  return status;
}
