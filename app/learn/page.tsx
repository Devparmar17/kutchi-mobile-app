import type { Metadata } from 'next';
import { requireUser } from '@/lib/server/session';
import LearnView from './LearnView';

export const metadata: Metadata = { title: 'My course' };

export default async function Page() {
  await requireUser('/learn');
  return <LearnView />;
}
