import { getSession, saveUser } from '@/lib/server/session';
import { hasStudio } from '@/lib/server/vendor';

/**
 * Cancels one of the signed-in buyer's orders. Only orders this app keeps itself can be cancelled
 * here; once a vendor's studio has an order, it is theirs to stop.
 */
export async function POST(request: Request, { params }: { params: Promise<{ no: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Log in to change your orders.' }, { status: 401 });
  if (hasStudio) {
    return Response.json({ error: 'This order is already with the weavers and can’t be cancelled here.' }, { status: 409 });
  }

  const no = Number((await params).no);
  const order = session.user.orders.find((o) => o.no === no);
  if (!order) return Response.json({ error: 'No such order.' }, { status: 404 });
  if (order.cancelledAt) return Response.json({ ok: true });

  const orders = session.user.orders.map((o) => (o.no === no ? { ...o, cancelledAt: Date.now() } : o));
  await saveUser(request, { ...session.user, orders });
  return Response.json({ ok: true });
}
