import { checkCity, checkName, isError, tidy } from '@/lib/server/forms';
import { signIn } from '@/lib/server/session';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Starts an account for anyone: a name, an email and the city to deliver to. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = checkName(body?.name);
  if (isError(name)) return Response.json(name, { status: 400 });
  const email = tidy(body?.email);
  if (!EMAIL.test(email) || email.length > 120) {
    return Response.json({ error: 'Enter a valid email address.', field: 'email' }, { status: 400 });
  }
  const city = checkCity(body?.city);
  if (isError(city)) return Response.json(city, { status: 400 });

  const user = await signIn(request, { email, name, city });
  return Response.json({ user }, { status: 201 });
}
