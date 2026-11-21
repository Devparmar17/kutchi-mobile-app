import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { courseById } from '@/lib/catalog';
import { requireUser } from '@/lib/server/session';
import LearnView from './LearnView';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: courseById((await params).id)?.title ?? 'My course' };
}

export default async function Page({ params }: Props) {
  const course = courseById((await params).id);
  if (!course) notFound();
  const user = await requireUser(`/learn/${course.id}`);
  const enrolment = user.courses.find((e) => e.id === course.id);
  // Not enrolled yet: the course's own page says what it is and how to join.
  if (!enrolment) redirect(`/courses/${course.id}`);
  return <LearnView key={course.id} course={course} enrolment={enrolment} />;
}
