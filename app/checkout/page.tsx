import type { Metadata } from 'next';
import { requireUser } from '@/lib/server/session';
import CheckoutView from './CheckoutView';

export const metadata: Metadata = { title: 'Checkout' };

export default async function Page() {
  const user = await requireUser('/checkout');
  return <CheckoutView user={user} />;
}
