import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getShop } from '@/lib/server/vendor';
import ProductView from './ProductView';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = (await getShop())?.products.find((p) => p.id === id);
  return { title: product?.name ?? 'Shawl' };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const shop = await getShop();
  // With the studio out of reach nobody can say the shawl doesn't exist, so the screen explains instead.
  if (shop?.online && !shop.products.some((p) => p.id === id)) notFound();
  return <ProductView id={id} />;
}
