import { courseById, lessonCount } from '@/lib/catalog';
import { getSession, saveUser } from '@/lib/server/session';

type Params = { params: Promise<{ id: string }> };

/** Saves how many lessons of a course the learner has finished. Finishing the last one earns the certificate. */
export async function POST(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Log in to save your progress.' }, { status: 401 });
  const course = courseById((await params).id);
  const enrolment = session.user.courses.find((e) => e.id === course?.id);
  if (!course || !enrolment) return Response.json({ error: 'You’re not enrolled in this course.' }, { status: 404 });

  const body = (await request.json().catch(() => null)) as { done?: unknown } | null;
  const total = lessonCount(course);
  if (!Number.isInteger(body?.done)) return Response.json({ error: 'Nothing to save.' }, { status: 400 });
  const done = Math.max(0, Math.min(total, body!.done as number));
  const finishedAt = done === total ? (enrolment.finishedAt ?? Date.now()) : undefined;

  const courses = session.user.courses.map((e) => (e.id === course.id ? { ...e, done, finishedAt } : e));
  await saveUser(request, { ...session.user, courses });
  return Response.json({ done, finishedAt: finishedAt ?? null });
}
