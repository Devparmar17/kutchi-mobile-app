import { checkAddress, checkCity, checkName, isError } from '@/lib/server/forms';
import { getSession, saveUser } from '@/lib/server/session';

/** Changes the signed-in buyer's name and city, or their delivery address; whichever is sent. */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Log in to change your details.' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: 'Nothing to change.' }, { status: 400 });
  let user = session.user;

  if ('name' in body) {
    const name = checkName(body.name);
    if (isError(name)) return Response.json(name, { status: 400 });
    user = { ...user, name };
  }
  if ('city' in body) {
    const city = checkCity(body.city);
    if (isError(city)) return Response.json(city, { status: 400 });
    user = { ...user, city };
  }
  if ('address' in body) {
    const address = checkAddress(body.address);
    if (isError(address)) return Response.json(address, { status: 400 });
    user = { ...user, address };
  }

  await saveUser(request, user);
  return Response.json({ ok: true });
}
