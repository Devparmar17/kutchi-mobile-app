import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { OrderItem, PlacedOrder, User } from '../types';

// Anyone can sign in: the server keeps no list of accounts and checks no password. A buyer's
// account (their name, city and orders) is a cookie on their own device, so it needs no database,
// lasts until they clear their browser, and doesn't follow them to another device.
// It says who the buyer claims to be; nothing here proves it.
const ACCOUNT = 'ks_account';
const SIGNED_IN = 'ks_session';

const DAY = 24 * 60 * 60;
const SESSION_DAYS = 30;
const ACCOUNT_DAYS = 365;

// Browsers refuse a cookie much over 4,000 characters, so the oldest orders make way for new ones.
const MAX_COOKIE = 3600;

/** The sample buyer from the design; signing in with her email brings her profile and her order. */
const SAMPLE: User = {
  name: 'Ananya Mehta',
  email: 'ananya@example.com',
  city: 'Pune',
  address: ['Flat 4B, Shanti Kunj, Baner Road', 'Pune, Maharashtra 411045', '+91 98••• ••210'],
  since: Date.UTC(2026, 7, 14),
  orders: [
    {
      no: 1042,
      items: [{ id: 'p1', variant: 'indigo', name: 'Bhujodi Extra-weft Shawl', maker: 'Laxmanbhai', qty: 1, amount: 4800 }],
      speed: 'standard',
      fee: 0,
      placedAt: Date.UTC(2026, 9, 5, 13, 12),
    },
  ],
};

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');
const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0);

/** Reads an order back from the cookie, which the buyer's browser could have altered. */
function toOrder(raw: unknown): PlacedOrder | null {
  const o = raw as Partial<PlacedOrder> | null;
  if (!o || !Number.isInteger(o.no) || !Array.isArray(o.items) || o.items.length === 0) return null;
  const items: OrderItem[] = o.items.slice(0, 20).map((item: Partial<OrderItem> | null) => ({
    id: text(item?.id, 40),
    variant: text(item?.variant, 40) || undefined,
    name: text(item?.name, 80),
    maker: text(item?.maker, 80),
    qty: count(item?.qty),
    amount: count(item?.amount),
  }));
  return {
    no: o.no as number,
    items,
    speed: o.speed === 'express' ? 'express' : 'standard',
    fee: count(o.fee),
    placedAt: count(o.placedAt),
  };
}

function decode(value: string | undefined): User | null {
  if (!value) return null;
  try {
    const raw = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    const email = text(raw?.email, 120);
    const name = text(raw?.name, 80);
    if (!email || !name) return null;
    return {
      name,
      email,
      city: text(raw.city, 60),
      address: Array.isArray(raw.address) ? raw.address.slice(0, 4).map((line: unknown) => text(line, 80)) : [],
      since: count(raw.since),
      orders: Array.isArray(raw.orders) ? raw.orders.flatMap((o: unknown) => toOrder(o) ?? []) : [],
    };
  } catch {
    return null;
  }
}

/** Packs the account into a cookie value, leaving out the oldest orders if it would be too long. */
function encode(user: User) {
  let orders = user.orders;
  for (;;) {
    const value = Buffer.from(JSON.stringify({ ...user, orders })).toString('base64url');
    if (value.length <= MAX_COOKIE || orders.length <= 1) return value;
    orders = orders.slice(0, -1);
  }
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function keep(store: CookieStore, request: Request, name: string, value: string, days: number) {
  // Behind a host's proxy the request itself can look like plain HTTP, so its forwarded scheme counts too.
  const scheme = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol;
  store.set(name, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: scheme.startsWith('https'),
    path: '/',
    maxAge: days * DAY,
  });
}

/** The signed-in buyer, or null. */
export async function getSession() {
  const store = await cookies();
  if (!store.has(SIGNED_IN)) return null;
  const user = decode(store.get(ACCOUNT)?.value);
  return user ? { user } : null;
}

/** For screens that belong to a buyer: sends anyone not signed in to log in, then back to `next`. */
export async function requireUser(next: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session.user;
}

/** "riya.shah92" becomes "Riya Shah": a name for someone who logged in with only an email. */
function nameFrom(email: string) {
  const words = email.split('@')[0].split(/[^a-zA-Z]+/).filter(Boolean);
  return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'Guest';
}

/**
 * Signs in whoever asks. An email this device has used before gets its account back, orders and all;
 * a new one starts a fresh account, which replaces the one this device held.
 */
export async function signIn(request: Request, who: { email: string; name?: string; city?: string }) {
  const store = await cookies();
  const email = who.email.trim().toLowerCase();
  const known = decode(store.get(ACCOUNT)?.value);

  let user: User;
  if (known?.email === email) user = known;
  else if (email === SAMPLE.email) user = SAMPLE;
  else user = { name: nameFrom(email), email, city: '', address: [], since: Date.now(), orders: [] };

  // Signing up names the buyer and their city; logging in leaves what is already there.
  if (who.name) user = { ...user, name: who.name };
  if (who.city) user = { ...user, city: who.city };

  keep(store, request, ACCOUNT, encode(user), ACCOUNT_DAYS);
  keep(store, request, SIGNED_IN, '1', SESSION_DAYS);
  return user;
}

/** Signs this device out. The account stays on it, ready for the same email to log back in. */
export async function signOut() {
  (await cookies()).delete(SIGNED_IN);
}

/**
 * Adds an order to the signed-in buyer's account and returns its number. `no` is the vendor
 * studio's number for it; with no studio attached the order takes the buyer's next number.
 */
export async function saveOrder(request: Request, user: User, order: Omit<PlacedOrder, 'no'>, no: number | null) {
  const last = Math.max(SAMPLE.orders[0].no, ...user.orders.map((o) => o.no));
  const placed: PlacedOrder = { ...order, no: no ?? last + 1 };
  keep(await cookies(), request, ACCOUNT, encode({ ...user, orders: [placed, ...user.orders] }), ACCOUNT_DAYS);
  return placed.no;
}

/** Only paths inside this app are followed after logging in. */
export function safeNext(next: string | undefined) {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/shop';
}
