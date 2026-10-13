import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import type { PlacedOrder, User } from '../types';

// Buyers' accounts and sign-in sessions, kept in one JSON file beside the app.
const FILE = path.join(process.cwd(), 'data', 'accounts.json');

export const SESSION_DAYS = 30;
export const MIN_PASSWORD = 8;

const DAY = 24 * 60 * 60 * 1000;
const hashPassword = promisify(scrypt) as (password: string, salt: string, length: number) => Promise<Buffer>;

interface Account extends User {
  id: string;
  /** Password, salted and hashed with scrypt. The password itself is never stored. */
  salt: string;
  hash: string;
}

interface Db {
  accounts: Account[];
  /** Keyed by a hash of the token in the buyer's cookie, so the file alone can't sign anyone in. */
  sessions: Record<string, { account: string; expires: number }>;
}

/** A sample buyer, so the app can be tried without signing up. Her order is the studio's sample #KS-1042. */
export const DEMO = { email: 'ananya@example.com', password: 'kutch-demo' };

async function seed(): Promise<Db> {
  const salt = randomBytes(16).toString('hex');
  return {
    accounts: [
      {
        id: 'demo',
        name: 'Ananya Mehta',
        email: DEMO.email,
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
        salt,
        hash: (await hashPassword(DEMO.password, salt, 64)).toString('hex'),
      },
    ],
    sessions: {},
  };
}

// Kept on globalThis because each route is bundled with its own copy of this module.
const shared = globalThis as {
  __kutchAccounts?: Db;
  __kutchAccountsTime?: number;
  __kutchAccountsQueue?: Promise<unknown>;
};

/** When the file was last written, or 0 when there isn't one. */
const fileTime = () => stat(FILE).then((s) => s.mtimeMs, () => 0);

async function load(): Promise<Db> {
  // The file is the record: if it was replaced or deleted by hand, start again from it.
  const time = await fileTime();
  if (!shared.__kutchAccounts || shared.__kutchAccountsTime !== time) {
    shared.__kutchAccountsTime = time;
    try {
      const parsed = JSON.parse(await readFile(FILE, 'utf8'));
      if (!Array.isArray(parsed?.accounts) || typeof parsed?.sessions !== 'object') throw new Error('bad file');
      shared.__kutchAccounts = parsed;
    } catch {
      // No file yet, or one that can't be read: start with just the sample buyer.
      shared.__kutchAccounts = await seed();
    }
  }
  return shared.__kutchAccounts!;
}

/** Thrown when the accounts file can't be written, as on a host with a read-only disk. */
export class StorageError extends Error {}

export const NO_STORAGE = 'Accounts can’t be saved on this server yet, so signing in isn’t available here.';

/**
 * Runs one change at a time and writes the file after it, so two requests can't overwrite each other.
 * The change is made on a copy and only kept once it is safely on disk.
 */
function update<T>(change: (db: Db) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const db = structuredClone(await load());
    const result = await change(db);
    try {
      await mkdir(path.dirname(FILE), { recursive: true });
      await writeFile(FILE, JSON.stringify(db, null, 2));
    } catch {
      throw new StorageError('the accounts file is not writable');
    }
    shared.__kutchAccounts = db;
    shared.__kutchAccountsTime = await fileTime();
    return result;
  };
  const done = (shared.__kutchAccountsQueue ?? Promise.resolve()).then(run, run);
  shared.__kutchAccountsQueue = done.catch(() => {});
  return done;
}

const tokenKey = (token: string) => createHash('sha256').update(token).digest('hex');

function toUser({ name, email, city, address, since, orders }: Account): User {
  return { name, email, city, address, since, orders };
}

export type Field = 'name' | 'email' | 'city' | 'password';
export type AuthResult = { id: string; user: User } | { error: string; field?: Field };

export async function signUp(input: { name: string; email: string; city: string; password: string }): Promise<AuthResult> {
  const name = input.name.trim().replace(/\s+/g, ' ');
  const email = input.email.trim().toLowerCase();
  const city = input.city.trim().replace(/\s+/g, ' ');

  if (name.length < 2 || name.length > 80) return { error: 'Enter your full name.', field: 'name' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return { error: 'Enter a valid email address.', field: 'email' };
  }
  if (!city || city.length > 60) return { error: 'Enter the city we’ll deliver to.', field: 'city' };
  if (input.password.length < MIN_PASSWORD || input.password.length > 200) {
    return { error: `Use at least ${MIN_PASSWORD} characters for your password.`, field: 'password' };
  }

  const salt = randomBytes(16).toString('hex');
  const hash = (await hashPassword(input.password, salt, 64)).toString('hex');

  return update((db) => {
    if (db.accounts.some((a) => a.email === email)) {
      return { error: 'There’s already an account with this email. Log in instead.', field: 'email' as const };
    }
    const account: Account = {
      id: randomBytes(8).toString('hex'),
      name,
      email,
      city,
      address: [],
      since: Date.now(),
      orders: [],
      salt,
      hash,
    };
    db.accounts.push(account);
    return { id: account.id, user: toUser(account) };
  });
}

export async function logIn(input: { email: string; password: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const account = (await load()).accounts.find((a) => a.email === email);
  // Hash even when there is no such account, so the answer takes as long either way.
  const hash = await hashPassword(input.password.slice(0, 200), account?.salt ?? 'no-such-account', 64);
  if (!account || !timingSafeEqual(hash, Buffer.from(account.hash, 'hex'))) {
    return { error: 'That email and password don’t match an account.' };
  }
  return { id: account.id, user: toUser(account) };
}

/** Starts a session and returns the token to keep in the buyer's cookie. */
export function startSession(accountId: string) {
  const token = randomBytes(32).toString('hex');
  return update((db) => {
    const now = Date.now();
    for (const [key, session] of Object.entries(db.sessions)) {
      if (session.expires < now) delete db.sessions[key];
    }
    db.sessions[tokenKey(token)] = { account: accountId, expires: now + SESSION_DAYS * DAY };
    return token;
  });
}

export function endSession(token: string) {
  return update((db) => {
    delete db.sessions[tokenKey(token)];
  });
}

export async function findSession(token: string): Promise<{ id: string; user: User } | null> {
  const db = await load();
  const session = db.sessions[tokenKey(token)];
  if (!session || session.expires < Date.now()) return null;
  const account = db.accounts.find((a) => a.id === session.account);
  return account ? { id: account.id, user: toUser(account) } : null;
}

/** Remembers an order with the buyer who placed it, newest first. */
export function addOrder(accountId: string, order: PlacedOrder) {
  return update((db) => {
    db.accounts.find((a) => a.id === accountId)?.orders.unshift(order);
  });
}
