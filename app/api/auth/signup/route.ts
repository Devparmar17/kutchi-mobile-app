import { signIn } from '@/lib/server/session';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const tidy = (value: unknown) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '');

/** Starts an account for anyone: a name, an email and the city to deliver to. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = tidy(body?.name);
  const email = tidy(body?.email);
  const city = tidy(body?.city);

  if (name.length < 2 || name.length > 80) {
    return Response.json({ error: 'Enter your full name.', field: 'name' }, { status: 400 });
  }
  if (!EMAIL.test(email) || email.length > 120) {
    return Response.json({ error: 'Enter a valid email address.', field: 'email' }, { status: 400 });
  }
  if (!city || city.length > 60) {
    return Response.json({ error: 'Enter the city we’ll deliver to.', field: 'city' }, { status: 400 });
  }

  const user = await signIn(request, { email, name, city });
  return Response.json({ user }, { status: 201 });
}
