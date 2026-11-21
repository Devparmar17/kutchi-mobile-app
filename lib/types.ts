export type CraftId = 'weave' | 'ajrakh' | 'bandhani' | 'kala' | 'embroidery';
export type MakerId = 'laxmanbhai' | 'abdulbhai' | 'fatimaben' | 'jasuben' | 'valjibhai';
export type SpeedId = 'standard' | 'express';
export type PaymentId = 'upi' | 'card' | 'net' | 'cod';

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
  stages: { label: string; title: string; swatch: string }[];
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

export interface Module {
  title: string;
  /** The longer title shown in the syllabus, when the short one leaves something out. */
  full?: string;
  lessons: string[];
}

export interface Course {
  id: string;
  cat: 'weaving' | 'dyeing' | 'printing' | 'embroidery';
  title: string;
  teacher: MakerId;
  weeks: string;
  level: string;
  format: string;
  price: number;
  swatch: string;
  /** One sentence for the certificate: what finishing the course means. */
  about: string;
  modules: Module[];
  /** What is posted to the learner, if anything; posting it needs a delivery address. */
  kit?: string;
  /** Extra facts for the course page, beyond its length and format. */
  facts?: [label: string, value: string][];
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
  /** How the buyer chose to pay; missing on orders placed before it was kept. */
  pay?: PaymentId;
  /** The address it went to, on one line, as it was on the day. */
  to?: string;
  giftNote?: string;
  cancelledAt?: number;
}

/** Where a buyer's shawls, and any course kit, are delivered. */
export interface Address {
  line: string;
  area: string;
  city: string;
  pin: string;
  phone: string;
}

/** A course the buyer has paid for, and how far through it they are. */
export interface Enrolment {
  id: string;
  at: number;
  /** Lessons finished, counted from the first. */
  done: number;
  /** When the last lesson was marked done: the certificate's date. */
  finishedAt?: number;
}

/** The signed-in buyer, as the screens see them. */
export interface User {
  name: string;
  email: string;
  city: string;
  address: Address | null;
  since: number;
  /** Newest first. */
  orders: PlacedOrder[];
  /** Newest first. */
  courses: Enrolment[];
}

/** What this browser remembers between visits. */
export interface State {
  bag: BagLine[];
  saved: string[];
  /** Printed on handmade paper and sent with the next order. */
  giftNote: string;
}
