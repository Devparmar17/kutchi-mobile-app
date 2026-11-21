import type { Metadata } from 'next';
import { getSession } from '@/lib/server/session';
import CoursesView from './CoursesView';

export const metadata: Metadata = { title: 'Courses' };

export default async function Page() {
  // Anyone can look around; a signed-in learner also sees where they got to.
  const session = await getSession();
  return <CoursesView enrolments={session?.user.courses ?? []} />;
}
