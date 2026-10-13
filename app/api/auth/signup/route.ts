import { NO_STORAGE, StorageError, signUp } from '@/lib/server/accounts';
import { signIn } from '@/lib/server/session';

const text = (value: unknown) => (typeof value === 'string' ? value : '');

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  try {
    const result = await signUp({
      name: text(body?.name),
      email: text(body?.email),
      city: text(body?.city),
      password: text(body?.password),
    });
    if ('error' in result) return Response.json(result, { status: 400 });

    await signIn(result.id, request);
    return Response.json({ user: result.user }, { status: 201 });
  } catch (error) {
    if (error instanceof StorageError) return Response.json({ error: NO_STORAGE }, { status: 503 });
    throw error;
  }
}
