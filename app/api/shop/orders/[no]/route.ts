import { getSession } from '@/lib/server/session';
import { orderStatus } from '@/lib/server/vendor';

/** Where the vendor has got to with one of the signed-in buyer's own orders. */
export async function GET(_request: Request, { params }: { params: Promise<{ no: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Log in to see your orders.' }, { status: 401 });

  const no = Number((await params).no);
  if (!session.user.orders.some((o) => o.no === no)) {
    return Response.json({ error: 'No such order.' }, { status: 404 });
  }
  return Response.json({ status: await orderStatus(no) });
}
