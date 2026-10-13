import { signOut } from '@/lib/server/session';

export async function POST() {
  await signOut();
  return Response.json({ ok: true });
}
