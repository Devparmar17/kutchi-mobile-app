import { signIn } from '@/lib/server/session';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Signs in anyone who gives an email. No password is asked for here, because none is checked. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (!EMAIL.test(email) || email.length > 120) {
    return Response.json({ error: 'Enter a valid email address.', field: 'email' }, { status: 400 });
  }

  const user = await signIn(request, { email });
  return Response.json({ user });
}
