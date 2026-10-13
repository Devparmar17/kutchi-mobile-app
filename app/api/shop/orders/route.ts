import { getSpeed, resolveLines } from '@/lib/catalog';
import { addOrder } from '@/lib/server/accounts';
import { getSession } from '@/lib/server/session';
import { UNREACHABLE, getShop, sendOrder } from '@/lib/server/vendor';
import type { BagLine, PlacedOrder, SpeedId } from '@/lib/types';

const MAX_LINES = 20;

/** Reads the bag sent from checkout, or null when it isn't a well-formed one. */
function parseBag(value: unknown): BagLine[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_LINES) return null;
  const lines: BagLine[] = [];
  for (const raw of value as { id?: unknown; variant?: unknown; qty?: unknown }[]) {
    if (typeof raw?.id !== 'string' || !Number.isInteger(raw.qty) || (raw.qty as number) < 1) return null;
    lines.push({
      id: raw.id,
      variant: typeof raw.variant === 'string' ? raw.variant : undefined,
      qty: raw.qty as number,
    });
  }
  return lines;
}

/** Places the signed-in buyer's order with the vendor's studio and remembers it with their account. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Log in to place your order.' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { lines?: unknown; speed?: unknown } | null;
  const bag = parseBag(body?.lines);
  if (!bag) return Response.json({ error: 'Your bag is empty.' }, { status: 400 });
  const speed = getSpeed(body?.speed as SpeedId);

  // Prices and stock are read fresh from the studio, never taken from the phone.
  const shop = await getShop();
  if (!shop?.online) return Response.json({ error: UNREACHABLE }, { status: 503 });

  const lines = resolveLines(bag, shop.products);
  if (lines.length < bag.length) {
    return Response.json({ error: 'A shawl in your bag is no longer available. Remove it and try again.' }, { status: 409 });
  }
  const short = lines.find((l) => l.qty > l.max);
  if (short) {
    const { name, left } = short.product;
    let error = `No more than ${short.max} of ${name} can go in one order.`;
    if (left === 0) error = `${name} has sold out.`;
    else if (left < short.qty) error = `Only ${left} left of ${name}.`;
    return Response.json({ error }, { status: 409 });
  }

  const sent = await sendOrder({
    customer: session.user.name,
    city: session.user.city,
    // The vendor needs the colourway only where the shawl comes in more than one.
    lines: lines.map((l) => ({ id: l.product.id, qty: l.qty, variant: l.product.variants ? l.color : undefined })),
  });
  if ('error' in sent) return Response.json({ error: sent.error }, { status: 409 });

  const order: PlacedOrder = {
    no: sent.no,
    items: lines.map((l) => ({
      id: l.product.id,
      variant: l.variant,
      name: l.product.name,
      maker: l.product.maker.name,
      qty: l.qty,
      amount: l.total,
    })),
    speed: speed.id,
    fee: speed.fee,
    placedAt: Date.now(),
  };
  await addOrder(session.id, order);

  return Response.json({ no: order.no }, { status: 201 });
}
