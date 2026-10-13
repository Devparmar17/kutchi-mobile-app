import { getShop } from '@/lib/server/vendor';

/** The shop from the vendor's studio, or "unchanged" when the caller's version is still the latest. */
export async function GET(request: Request) {
  const known = Number(new URL(request.url).searchParams.get('v')) || 0;
  const shop = await getShop(known);
  return Response.json(shop ?? { unchanged: true });
}
