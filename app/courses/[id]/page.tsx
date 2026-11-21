import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { courseById } from '@/lib/catalog';
import { getSession } from '@/lib/server/session';
import CourseView from './CourseView';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = courseById((await params).id);
  return { title: course?.title ?? 'Course not found' };
}

export default async function Page({ params }: Props) {
  const course = courseById((await params).id);
  if (!course) notFound();
  const session = await getSession();
  const enrolment = session?.user.courses.find((e) => e.id === course.id) ?? null;
  return <CourseView course={course} enrolment={enrolment} />;
}
