import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COURSES } from '@/lib/catalog';
import CourseView from './CourseView';

type Props = { params: Promise<{ id: string }> };

const getCourse = (id: string) => COURSES.find((c) => c.id === id);

export function generateStaticParams() {
  return COURSES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).id);
  return { title: course?.title ?? 'Course not found' };
}

export default async function Page({ params }: Props) {
  const course = getCourse((await params).id);
  if (!course) notFound();
  return <CourseView course={course} />;
}
