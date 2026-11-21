import { PAYMENTS, courseById } from '@/lib/catalog';
import { getSession, saveUser } from '@/lib/server/session';

type Params = { params: Promise<{ id: string }> };

/** Enrols the signed-in buyer in a course. A course with a kit to post needs their delivery address first. */
export async function POST(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Log in to enrol.' }, { status: 401 });
  const course = courseById((await params).id);
  if (!course) return Response.json({ error: 'No such course.' }, { status: 404 });

  const { user } = session;
  if (user.courses.some((e) => e.id === course.id)) return Response.json({ ok: true });

  const body = (await request.json().catch(() => null)) as { pay?: unknown } | null;
  // A course is paid for up front, so cash on delivery doesn't apply.
  if (!PAYMENTS.some((p) => p.id === body?.pay && p.id !== 'cod')) {
    return Response.json({ error: 'Choose how you’d like to pay.' }, { status: 400 });
  }
  if (course.kit && !user.address) {
    return Response.json({ error: 'Add the address we’ll post your kit to.' }, { status: 400 });
  }

  await saveUser(request, { ...user, courses: [{ id: course.id, at: Date.now(), done: 0 }, ...user.courses] });
  return Response.json({ ok: true }, { status: 201 });
}
