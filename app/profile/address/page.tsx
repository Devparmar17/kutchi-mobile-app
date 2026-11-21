import type { Metadata } from 'next';
import { requireUser, safeNext } from '@/lib/server/session';
import AddressView from './AddressView';

export const metadata: Metadata = { title: 'Delivery address' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = (await searchParams).next;
  const next = safeNext(Array.isArray(raw) ? raw[0] : raw, '/profile');
  const user = await requireUser(`/profile/address?next=${encodeURIComponent(next)}`);
  return <AddressView user={user} next={next} />;
}
