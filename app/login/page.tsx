import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession, safeNext } from '@/lib/server/session';
import LoginView from './LoginView';

export const metadata: Metadata = { title: 'Log in' };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = safeNext(first(params.next));
  if (await getSession()) redirect(next);

  const mode = first(params.mode) === 'signup' ? 'signup' : 'login';
  // Keyed so the links between the two forms start each one clean.
  return <LoginView key={mode} mode={mode} next={next} />;
}
