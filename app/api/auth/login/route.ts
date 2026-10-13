import { logIn } from '@/lib/server/accounts';
import { signIn } from '@/lib/server/session';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  if (typeof body?.email !== 'string' || typeof body?.password !== 'string') {
    return Response.json({ error: 'Enter your email and password.' }, { status: 400 });
  }

  const result = await logIn({ email: body.email, password: body.password });
  if ('error' in result) return Response.json(result, { status: 401 });

  await signIn(result.id, request);
  return Response.json({ user: result.user });
}
