import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_DAYS, endSession, findSession, startSession } from './accounts';

const COOKIE = 'ks_session';

/** The signed-in buyer, or null. `id` is the account's key, for server use only. */
export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? findSession(token) : null;
}

/** For screens that belong to a buyer: sends anyone not signed in to log in, then back to `next`. */
export async function requireUser(next: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session.user;
}

/** Signs the buyer in on this device. `request` decides whether the cookie is for HTTPS only. */
export async function signIn(accountId: string, request: Request) {
  const token = await startSession(accountId);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: new URL(request.url).protocol === 'https:',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function signOut() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await endSession(token);
  store.delete(COOKIE);
}

/** Only paths inside this app are followed after logging in. */
export function safeNext(next: string | undefined) {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/shop';
}
