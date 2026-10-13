import { cache } from 'react';
import { DRESSING, MAKERS } from '../catalog';
import type { CraftId, Maker, MakerId, OrderStatus, Product, Shop } from '../types';
import { SAMPLE_LISTINGS } from './sample';

// The vendor's studio (the Dashboard app) holds the shawls, their stock and every order.
// This app asks it for the shop and hands it each order; set DASHBOARD_URL if it runs elsewhere.
const STUDIO = (process.env.DASHBOARD_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export const UNREACHABLE = 'The shop can’t be reached right now. Try again in a moment.';

/** A shawl as the studio lists it for buyers. */
export interface Listing {
  id: string;
  name: string;
  description: string;
  material: string;
  craft: string;
  size: string;
  color: string;
  dyes: string[];
  cost: { material: number; craft: number; design: number };
  stock: number;
  status: 'active' | 'out';
  story: { artisan: string; origin: string; technique: string; significance: string };
  /** How many photos it has; each is fetched through photoFromStudio. */
  photos: number;
  swatch: string;
  updatedAt: number;
}

const DYES: Record<string, string> = {
  indigo: 'Indigo',
  madder: 'Madder red',
  turmeric: 'Turmeric',
  iron: 'Iron black',
  undyed: 'Undyed',
};

// Stands in as the maker when the vendor hasn't named an artisan for a shawl.
const STUDIO_MAKER: Maker = {
  name: 'Bhujodi Handloom Co.',
  role: 'Weaving studio',
  craft: 'Handloom',
  place: 'Bhujodi',
  bg: '#E7B24C',
  fg: '#1D2756',
};

function studio(path: string, init?: RequestInit) {
  return fetch(STUDIO + path, { ...init, cache: 'no-store', signal: AbortSignal.timeout(4000) });
}

function craftOf(l: Listing): CraftId {
  const text = `${l.craft} ${l.material}`.toLowerCase();
  if (text.includes('ajrakh')) return 'ajrakh';
  if (text.includes('bandhani')) return 'bandhani';
  if (text.includes('embroider')) return 'embroidery';
  if (text.includes('kala')) return 'kala';
  return 'weave';
}

/** The artisan the vendor named, matched to one this app knows when it can be. */
function makerOf(l: Listing, dressed?: MakerId): Pick<Product, 'maker' | 'makerId'> {
  const named = l.story.artisan.trim();
  const id = named
    ? (Object.keys(MAKERS) as MakerId[]).find((m) => MAKERS[m].name.toLowerCase() === named.toLowerCase())
    : dressed;
  if (id) return { maker: MAKERS[id], makerId: id };

  const place = l.story.origin.split(',')[0].trim() || STUDIO_MAKER.place;
  return { maker: named ? { ...STUDIO_MAKER, name: named, role: 'Artisan', place } : { ...STUDIO_MAKER, place } };
}

function toProduct(l: Listing): Product {
  const dressing = DRESSING[l.id];
  const { maker, makerId } = makerOf(l, dressing?.maker);
  // "Extra-weft handloom (Bhujodi)" reads better beside the village without its bracket.
  const technique = l.craft.replace(/\s*\(.*\)$/, '');
  const size = l.size.match(/\d+\s*×\s*\d+\s*cm/)?.[0];
  const dyes = l.dyes.map((d) => DYES[d] ?? d).join(', ');

  const specs: Product['specs'] = [
    ['Material', l.material],
    ['Technique', technique],
    ['Dye', dyes],
    ['Size', size ?? l.size],
    ['Care', dressing?.extras?.care ?? ''],
  ];

  return {
    id: l.id,
    craft: dressing?.craft ?? craftOf(l),
    name: l.name,
    maker,
    makerId,
    price: l.cost.material + l.cost.craft + l.cost.design,
    breakdown: [
      { label: 'Material', amount: l.cost.material, color: '#C9B996' },
      { label: 'Craftsmanship', amount: l.cost.craft, color: '#1D2756' },
      { label: 'Design', amount: l.cost.design, color: '#E7B24C' },
    ],
    swatch: dressing?.swatch ?? l.swatch,
    photos: Array.from(
      { length: l.photos },
      (_, n) => `/api/shop/photos/${encodeURIComponent(l.id)}/${n}?v=${l.updatedAt}`,
    ),
    left: l.status === 'out' ? 0 : l.stock,
    line: dressing?.line ?? `${technique} · ${maker.place}`,
    description: l.description,
    story: { technique: l.story.technique, significance: l.story.significance },
    specs: specs.filter(([, value]) => value),
    size,
    colorName: l.color || undefined,
    variants: dressing?.variants,
    extras: dressing?.extras,
  };
}

/**
 * The shop as buyers see it. Pass the version the caller already has to get null back
 * when nothing has changed. With the studio out of reach, the shop comes back offline, holding
 * the sample shawls this app carries so there is still something to look around.
 * One page render asks once, however many of its parts need the shop.
 */
export const getShop = cache(async (known = 0): Promise<Shop | null> => {
  try {
    const res = await studio(`/api/storefront/products?v=${known}`);
    if (!res.ok) throw new Error(`studio answered ${res.status}`);
    const data: { version: number; products?: Listing[] } = await res.json();
    if (!data.products) return null;
    return { online: true, version: data.version, products: data.products.map(toProduct) };
  } catch {
    return { online: false, version: 0, products: SAMPLE_LISTINGS.map(toProduct) };
  }
});

/** Hands an order to the studio, which takes the pieces out of stock and gives it a number. */
export async function sendOrder(order: {
  customer: string;
  city: string;
  lines: { id: string; qty: number; variant?: string }[];
}): Promise<{ no: number } | { error: string }> {
  try {
    const res = await studio('/api/storefront/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data: { order?: { id: string }; error?: string } = await res.json();
    if (!res.ok || !data.order) return { error: data.error ?? UNREACHABLE };
    return { no: Number(data.order.id.replace(/\D/g, '')) };
  } catch {
    return { error: UNREACHABLE };
  }
}

/** Where the vendor has got to with an order; null when the studio can't say. */
export async function orderStatus(no: number): Promise<OrderStatus | null> {
  try {
    const res = await studio(`/api/storefront/orders?id=${encodeURIComponent(`#KS-${no}`)}`);
    if (!res.ok) return null;
    const data: { order: { status: OrderStatus } } = await res.json();
    return data.order.status;
  } catch {
    return null;
  }
}

export function photoFromStudio(id: string, n: string) {
  return studio(`/api/storefront/photos/${encodeURIComponent(id)}/${encodeURIComponent(n)}`);
}
