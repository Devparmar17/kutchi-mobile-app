import type { Metadata } from 'next';
import { requireUser } from '@/lib/server/session';
import { orderStatus } from '@/lib/server/vendor';
import OrderView from './OrderView';

export const metadata: Metadata = { title: 'Your order' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser('/order');
  // A specific order when the address names one of the buyer's own, otherwise their latest.
  const no = Number((await searchParams).no);
  const order = user.orders.find((o) => o.no === no) ?? user.orders[0];

  return (
    <OrderView
      key={order?.no}
      user={user}
      order={order}
      initialStatus={order ? await orderStatus(order.no) : null}
    />
  );
}
