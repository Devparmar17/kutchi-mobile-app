import type { Metadata } from 'next';
import { CRAFTS } from '@/lib/catalog';
import ShopView, { type ShopFilter } from './ShopView';

export const metadata: Metadata = { title: 'Shop' };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filter: ShopFilter = {
    craft: CRAFTS.find((c) => c.id === first(params.craft))?.id ?? 'all',
    query: first(params.q),
    saved: first(params.saved) === '1',
  };

  // Keyed so that following a link to another filter resets what was picked on screen.
  return <ShopView key={JSON.stringify(filter)} initial={filter} />;
}
