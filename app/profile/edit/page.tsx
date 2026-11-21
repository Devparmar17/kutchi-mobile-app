import type { Metadata } from 'next';
import { requireUser } from '@/lib/server/session';
import EditView from './EditView';

export const metadata: Metadata = { title: 'Your details' };

export default async function Page() {
  const user = await requireUser('/profile/edit');
  return <EditView user={user} />;
}
