import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { courseById } from '@/lib/catalog';
import { requireUser } from '@/lib/server/session';
import EnrollView from './EnrollView';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: 'Enrol' };

export default async function Page({ params }: Props) {
  const course = courseById((await params).id);
  if (!course) notFound();
  const user = await requireUser(`/courses/${course.id}/enroll`);
  if (user.courses.some((e) => e.id === course.id)) redirect(`/learn/${course.id}`);
  return <EnrollView course={course} user={user} />;
}
