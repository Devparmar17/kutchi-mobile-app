import type { Metadata } from 'next';
import { requireUser } from '@/lib/server/session';
import { orderStatus } from '@/lib/server/vendor';
import ProfileView from './ProfileView';

export const metadata: Metadata = { title: 'Your profile' };

export default async function Page() {
  const user = await requireUser('/profile');
  const latest = user.orders[0];
  return <ProfileView user={user} latestStatus={latest ? await orderStatus(latest.no) : null} />;
}
