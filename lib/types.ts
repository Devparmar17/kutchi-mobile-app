export type CraftId = 'weave' | 'ajrakh' | 'bandhani' | 'kala' | 'embroidery';
export type MakerId = 'laxmanbhai' | 'abdulbhai' | 'fatimaben' | 'jasuben' | 'valjibhai';
export type SpeedId = 'standard' | 'express';

export interface Maker {
  name: string;
  role: string;
  craft: string;
  place: string;
  bg: string;
  fg: string;
}

/** A colourway of a woven shawl: ground, stripe and accent thread. */
export type Palette = readonly [ground: string, stripe: string, accent: string];

export interface Variant {
  id: string;
  name: string;
  palette: Palette;
}

/** The parts of a shawl's page that this app writes itself, for the shawls it knows well. */
export interface ProductExtras {
  rating: { score: string; count: number };
  stages: { label: string; title: string; swatch: string }[];
  review: { who: string; text: string; meta: string };
  care: string;
}

/** A shawl as the shop shows it: the vendor's live listing, dressed with what this app adds. */
export interface Product {
  id: string;
  craft: CraftId;
  name: string;
  maker: Maker;
  /** Set when the maker is one of the artisans this app has a profile for. */
  makerId?: MakerId;
  price: number;
  /** How the vendor splits the price into material, craftsmanship and design. */
  breakdown: { label: string; amount: number; color: string }[];
  swatch: string;
  /** Addresses of the vendor's photos; empty until they upload some. */
  photos: string[];
  /** Pieces the vendor has in stock; 0 is sold out. */
  left: number;
  line: string;
  description: string;
  story: { technique: string; significance: string };
  specs: [label: string, value: string][];
  size?: string;
  colorName?: string;
  variants?: Variant[];
  extras?: ProductExtras;
}

/** The shop as last read from the vendor's studio. */
export interface Shop {
  /** False when the studio couldn't be reached. */
  online: boolean;
  /** Goes up whenever the vendor changes a shawl or an order comes in. */
  version: number;
  products: Product[];
}

export interface Course {
  id: string;
  cat: 'weaving' | 'dyeing' | 'printing' | 'embroidery';
  title: string;
  teacher: MakerId;
  weeks: string;
  level: string;
  format: string;
  rating: string;
  reviews: number;
  price: number;
  swatch: string;
}

export interface BagLine {
  id: string;
  variant?: string;
  qty: number;
}

/** Where the vendor has got to with an order. */
export type OrderStatus = 'New' | 'Packed' | 'Shipped' | 'Delivered';

/** One line of a placed order, kept as it was on the day it was bought. */
export interface OrderItem {
  id: string;
  variant?: string;
  name: string;
  maker: string;
  qty: number;
  amount: number;
}

export interface PlacedOrder {
  no: number;
  items: OrderItem[];
  speed: SpeedId;
  fee: number;
  placedAt: number;
}

/** The signed-in buyer, as the screens see them. */
export interface User {
  name: string;
  email: string;
  city: string;
  address: string[];
  since: number;
  /** Newest first. */
  orders: PlacedOrder[];
}

/** What this browser remembers between visits. */
export interface State {
  bag: BagLine[];
  saved: string[];
  /** Whether lesson 15, the one up next in the enrolled course, is marked done. */
  lessonDone: boolean;
}
