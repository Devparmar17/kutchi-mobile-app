import type {
  BagLine,
  Course,
  CraftId,
  Maker,
  MakerId,
  OrderStatus,
  Palette,
  PlacedOrder,
  Product,
  ProductExtras,
  SpeedId,
  Variant,
} from './types';

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "A", "A and B", "A, B and C". */
export function joinNames(names: string[]) {
  if (names.length < 2) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Dates are written out by hand, in India's time, so the server and every phone print the same text.
const inIndia = (time: number) => new Date(time + 5.5 * 60 * 60 * 1000);

/** "Mon, 5 Oct" */
export function shortDate(time: number) {
  const d = inIndia(time);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "6:42 pm" */
export function clockTime(time: number) {
  const d = inIndia(time);
  const hour = d.getUTCHours();
  return `${hour % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`;
}

/** "Aug 2026" */
export function monthYear(time: number) {
  const d = inIndia(time);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/* Woven swatches stand in for photographs until the vendor uploads theirs. */

const INDIGO: Palette = ['#26306A', '#EDE6D6', '#C2483A'];

// Weft band start, end and repeat, then the four warp stripe stops, in px.
const WEAVE_SCALE = {
  thumb: [14, 16, 30, 8, 10, 16, 18],
  card: [22, 25, 48, 14, 18, 30, 33],
  medium: [30, 34, 64, 22, 28, 46, 50],
  large: [40, 44, 84, 30, 38, 64, 70],
  hero: [62, 67, 128, 34, 44, 76, 82],
} as const;

export type SwatchSize = keyof typeof WEAVE_SCALE;

export function weave(size: SwatchSize, [ground, stripe, accent]: Palette = INDIGO) {
  const [a, b, c, d, e, f, g] = WEAVE_SCALE[size];
  return (
    `repeating-linear-gradient(0deg, transparent 0 ${a}px, rgba(231,178,76,0.95) ${a}px ${b}px, transparent ${b}px ${c}px), ` +
    `repeating-linear-gradient(90deg, ${ground} 0 ${d}px, ${stripe} ${d}px ${e}px, ${ground} ${e}px ${f}px, ${accent} ${f}px ${g}px)`
  );
}

export const chip = ([ground, stripe, accent]: Palette) =>
  `repeating-linear-gradient(90deg, ${ground} 0 6px, ${stripe} 6px 8px, ${ground} 8px 12px, ${accent} 12px 13px)`;

export const SW = {
  kala: 'linear-gradient(90deg, transparent 0 82%, #9E2F24 82% 86%, transparent 86%), repeating-linear-gradient(0deg, #DDD0B6 0 3px, #C9B996 3px 4px)',
  kalaPlain: 'repeating-linear-gradient(0deg, #DDD0B6 0 3px, #C9B996 3px 4px)',
  ajrakh: 'conic-gradient(from 45deg, #8E2A1E 25%, #1D2756 0 50%, #8E2A1E 0 75%, #1D2756 0) 0 0 / 18px 18px',
  dhabda: 'repeating-linear-gradient(90deg, #1E1E22 0 12px, #F1EEE6 12px 14px, #1E1E22 14px 17px, #F1EEE6 17px 19px)',
  bandhani: 'radial-gradient(circle, #F2D9A6 0 1.8px, transparent 2.4px) 0 0 / 10px 10px, #7A1F2B',
  embroidery:
    'radial-gradient(circle, #E9E4D8 0 2.2px, transparent 2.8px) 0 0 / 14px 14px, radial-gradient(circle, #D9A21B 0 1.6px, transparent 2.2px) 7px 7px / 14px 14px, #17171B',
  warp: 'repeating-linear-gradient(90deg, #EDE6D6 0 2px, #C9B996 2px 4px)',
  fleece:
    'radial-gradient(circle at 30% 40%, #F4EFE4 0 12px, transparent 13px), radial-gradient(circle at 72% 62%, #EDE5D4 0 16px, transparent 17px), radial-gradient(circle at 52% 18%, #F1EADB 0 10px, transparent 11px), #DCCFB6',
  indigoYarn: 'repeating-linear-gradient(90deg, #1D2756 0 10px, #26306A 10px 14px, #2F3B80 14px 22px)',
  dyes: 'repeating-linear-gradient(90deg, #1D2756 0 12px, #2F3B80 12px 20px, #8E2A1E 20px 28px, #B5452F 28px 34px)',
};

/** The weaver the one full craft story follows. */
export const STORY_MAKER: MakerId = 'laxmanbhai';

export const MAKERS: Record<MakerId, Maker> = {
  laxmanbhai: { name: 'Laxmanbhai', role: 'Master weaver', craft: 'Weaver', place: 'Bhujodi', bg: '#E7B24C', fg: '#1D2756' },
  abdulbhai: { name: 'Abdulbhai', role: 'Ajrakh printer', craft: 'Ajrakh printer', place: 'Ajrakhpur', bg: '#8E2A1E', fg: '#FFFFFF' },
  fatimaben: { name: 'Fatimaben', role: 'Bandhani artisan', craft: 'Bandhani', place: 'Bhuj', bg: '#1D2756', fg: '#FFFFFF' },
  jasuben: { name: 'Jasuben', role: 'Embroidery artisan', craft: 'Embroidery', place: 'Dhaneti', bg: '#1F5A33', fg: '#FFFFFF' },
  valjibhai: { name: 'Valjibhai', role: 'Kala cotton weaver', craft: 'Kala cotton', place: 'Bhujodi', bg: '#C9B996', fg: '#1A1C27' },
};

export const CRAFTS: { id: CraftId; label: string; swatch: string }[] = [
  { id: 'weave', label: 'Bhujodi weave', swatch: weave('card') },
  { id: 'ajrakh', label: 'Ajrakh', swatch: SW.ajrakh },
  { id: 'bandhani', label: 'Bandhani', swatch: SW.bandhani },
  { id: 'kala', label: 'Kala cotton', swatch: SW.kala },
  { id: 'embroidery', label: 'Embroidery', swatch: SW.embroidery },
];

/**
 * What this app adds to a shawl the vendor lists: who made it, its craft and a drawn swatch.
 * Keyed by the vendor's id for the shawl; a shawl without an entry is described from its listing alone.
 */
export interface Dressing {
  craft: CraftId;
  maker: MakerId;
  swatch: string;
  line?: string;
  variants?: Variant[];
  extras?: ProductExtras;
}

export const DRESSING: Record<string, Dressing> = {
  p1: {
    craft: 'weave',
    maker: 'laxmanbhai',
    swatch: weave('card'),
    line: 'Extra-weft handloom · Bhujodi',
    variants: [
      { id: 'indigo', name: 'Indigo & ivory', palette: INDIGO },
      { id: 'madder', name: 'Madder & ivory', palette: ['#8E2A1E', '#EDE6D6', '#1D2756'] },
      { id: 'black', name: 'Black & natural', palette: ['#1E1E22', '#E4D9C3', '#C2483A'] },
    ],
    extras: {
      rating: { score: '4.8', count: 36 },
      stages: [
        { label: 'Stage 1 · 1 day', title: 'Sorting the Rabari sheep’s wool', swatch: SW.fleece },
        { label: 'Stage 3 · 1 day', title: 'Dyeing the yarn with indigo', swatch: SW.indigoYarn },
        { label: 'Stage 5 · 4 days', title: 'Weaving the motifs by hand', swatch: weave('card') },
      ],
      review: {
        who: 'Rohan I. · Delhi',
        text: 'Warmer than it looks, and the motifs are just as neat on the back. You can tell a person made it.',
        meta: 'Verified purchase · Indigo & ivory',
      },
      care: 'Dry clean, or hand wash cold',
    },
  },
  p2: { craft: 'kala', maker: 'valjibhai', swatch: SW.kala },
  p3: { craft: 'ajrakh', maker: 'abdulbhai', swatch: SW.ajrakh },
  p4: { craft: 'weave', maker: 'laxmanbhai', swatch: SW.dhabda },
  p5: { craft: 'bandhani', maker: 'fatimaben', swatch: SW.bandhani },
  p6: { craft: 'embroidery', maker: 'jasuben', swatch: SW.embroidery },
};

/** How to credit the maker, by craft: a bandhani shawl is tied and dyed, not woven. */
export const MADE_BY: Record<CraftId, string> = {
  weave: 'Woven by',
  kala: 'Woven by',
  ajrakh: 'Printed by',
  bandhani: 'Tied and dyed by',
  embroidery: 'Embroidered by',
};

export const makerLine = (p: Product) => `${p.maker.name} · ${p.maker.place}`;

export const craftLabel = (id: CraftId) => CRAFTS.find((c) => c.id === id)?.label ?? '';

/** Whether a shawl's name, craft, maker or village contains the search text. */
export function matchesProduct(p: Product, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [p.name, p.line, craftLabel(p.craft), p.maker.name, p.maker.place].some((s) => s.toLowerCase().includes(q));
}

/** "Only 3 left" and "Sold out" badges; nothing while stock is comfortable. */
export function stockTag(p: Product) {
  if (p.left > 3) return '';
  return p.left === 0 ? 'Sold out' : `Only ${p.left} left`;
}

// The most of one shawl a single order can hold, however many the vendor has.
export const MAX_PER_ORDER = 10;

export const maxOf = (p: Product) => Math.min(p.left, MAX_PER_ORDER);

/** A shawl's picture as a CSS background: the vendor's first photo, else its swatch drawn at this size. */
export function productSwatch(p: Product, size: SwatchSize, variantId?: string) {
  if (p.photos[0]) return `url("${p.photos[0]}") center / cover no-repeat`;
  const variant = p.variants?.find((v) => v.id === variantId) ?? p.variants?.[0];
  return variant ? weave(size, variant.palette) : p.swatch;
}

export const lineKey = (l: Pick<BagLine, 'id' | 'variant'>) => `${l.id}:${l.variant ?? ''}`;

/** Bag lines joined to their shawls; lines for shawls the vendor no longer lists drop out. */
export function resolveLines(lines: BagLine[], products: Product[]) {
  return lines.flatMap((line) => {
    const product = products.find((p) => p.id === line.id);
    if (!product) return [];
    const variant = product.variants?.find((v) => v.id === line.variant);
    return [
      {
        key: lineKey(line),
        qty: line.qty,
        product,
        variant: line.variant,
        color: variant?.name ?? product.colorName,
        max: maxOf(product),
        total: product.price * line.qty,
      },
    ];
  });
}

export type ResolvedLine = ReturnType<typeof resolveLines>[number];

export const countOf = (lines: BagLine[], products: Product[]) =>
  resolveLines(lines, products).reduce((sum, l) => sum + l.qty, 0);

export const totalOf = (lines: ResolvedLine[]) => lines.reduce((sum, l) => sum + l.total, 0);

/** Each artisan once, in the order their shawls appear. */
export const makersOf = (lines: ResolvedLine[]) => [
  ...new Map(lines.map((l) => [l.product.maker.name, l.product.maker])).values(),
];

export const SPEEDS: { id: SpeedId; label: string; fee: number; days: number }[] = [
  { id: 'standard', label: 'Standard', fee: 0, days: 4 },
  { id: 'express', label: 'Express', fee: 150, days: 2 },
];

export const getSpeed = (id: SpeedId) => SPEEDS.find((s) => s.id === id) ?? SPEEDS[0];

/** "By Fri, 9 Oct": when an order placed at `from` should arrive. */
export const arrivesBy = (id: SpeedId, from = Date.now()) => `By ${shortDate(from + getSpeed(id).days * DAY_MS)}`;

/** The five steps of an order's journey, each marked done, now, next or later from the vendor's status. */
export function journey(status: OrderStatus | null, order: Pick<PlacedOrder, 'placedAt' | 'speed'>, city: string) {
  // How many steps are behind it. The vendor's "Shipped" covers the courier's leg too.
  const finished = { New: 1, Packed: 2, Shipped: 3, Delivered: 5 }[status ?? 'New'];
  const steps = [
    { title: 'Order placed', text: `${shortDate(order.placedAt)} · ${clockTime(order.placedAt)}` },
    {
      title: 'Packed in Bhujodi',
      doing: 'Being packed in Bhujodi',
      text: 'Each shawl is folded with an authenticity card signed by its weaver.',
    },
    {
      title: 'Shipped from Bhuj',
      doing: 'Waiting for the courier in Bhuj',
      text: finished > 2 ? 'Handed to the courier' : `Expected ${shortDate(order.placedAt + DAY_MS)}`,
    },
    { title: 'Out for delivery', doing: 'On its way to you', text: 'We’ll text you the delivery window' },
    { title: 'Delivered', text: status === 'Delivered' ? city : `${arrivesBy(order.speed, order.placedAt)} · ${city}` },
  ];
  return steps.map((step, i) => {
    const state = i < finished ? 'done' : i === finished ? 'now' : i === finished + 1 ? 'next' : 'later';
    return { state, title: (state === 'now' && step.doing) || step.title, text: step.text };
  });
}

/** One line for where an order has got to, for the profile's order card. */
export const orderHeadline = (status: OrderStatus | null) =>
  ({ New: 'Being packed in Bhujodi', Packed: 'Packed and waiting for the courier', Shipped: 'On its way to you', Delivered: 'Delivered' })[
    status ?? 'New'
  ];

export const PAYMENTS = [
  { id: 'upi', label: 'UPI', hint: 'Pay from any UPI app', tag: 'Fastest' },
  { id: 'card', label: 'Credit or debit card', hint: 'Visa, Mastercard, RuPay', tag: '' },
  { id: 'net', label: 'Net banking', hint: 'All major banks', tag: '' },
  { id: 'cod', label: 'Cash on delivery', hint: 'Pay when it arrives', tag: '' },
] as const;

/* Courses */

export const COURSE_CATS = [
  ['all', 'All'],
  ['weaving', 'Weaving'],
  ['dyeing', 'Dyeing'],
  ['printing', 'Printing'],
  ['embroidery', 'Embroidery'],
] as const;

export const COURSES: Course[] = [
  { id: 'c1', cat: 'weaving', title: 'Bhujodi Weaving Foundations', teacher: 'laxmanbhai', weeks: '6 weeks', level: 'Beginner', format: 'Online + studio visit', rating: '4.9', reviews: 212, price: 6500, swatch: weave('card') },
  { id: 'c2', cat: 'dyeing', title: 'Natural Dyeing: Indigo and Madder', teacher: 'abdulbhai', weeks: '4 weeks', level: 'Beginner', format: 'Online', rating: '4.8', reviews: 164, price: 3200, swatch: SW.dyes },
  { id: 'c3', cat: 'printing', title: 'Ajrakh Block Printing', teacher: 'abdulbhai', weeks: '5 weeks', level: 'Intermediate', format: 'Online + studio visit', rating: '4.7', reviews: 98, price: 4800, swatch: SW.ajrakh },
  { id: 'c4', cat: 'dyeing', title: 'Bandhani: Tying and Dyeing', teacher: 'fatimaben', weeks: '3 weeks', level: 'Beginner', format: 'Online', rating: '4.8', reviews: 131, price: 2400, swatch: SW.bandhani },
  { id: 'c5', cat: 'embroidery', title: 'Rabari Embroidery Stitches', teacher: 'jasuben', weeks: '4 weeks', level: 'Beginner', format: 'Online', rating: '4.9', reviews: 187, price: 2800, swatch: SW.embroidery },
];

/** The one course with a full syllabus, and the one the learner is enrolled in. */
export const COURSE = COURSES[0];

export const MODULES = [
  { title: 'The loom and its tools', lessons: ['Meet the pit loom', 'Heddles, reed and shuttle', 'Choosing your wool', 'Setting up your tabletop loom'] },
  { title: 'Setting up the warp', lessons: ['Measuring the warp', 'Starching the threads', 'Winding onto the loom', 'Fixing a broken thread'] },
  { title: 'Plain weave', lessons: ['Your first rows', 'Keeping the edges straight', 'Beating the weft evenly', 'Weaving stripes'] },
  { title: 'Extra-weft motifs', lessons: ['Reading a motif', 'Lifting the warp by hand', 'Inserting your first motif', 'Repeating a motif', 'Neat motifs on both sides'] },
  { title: 'Finishing and the fringe', lessons: ['Taking the piece off the loom', 'Knotting the fringe', 'Washing and pressing'] },
  { title: 'Final project', full: 'Final project: your own stole sample', lessons: ['Planning your design', 'Weaving your sample', 'Photographing your work', 'Submitting for review'] },
];

export const LESSON_COUNT = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);

/** What the enrolled course's own page says beyond its card. */
export const COURSE_DETAIL = {
  learners: 1040,
  facts: [
    ['Duration', '6 weeks, about 3 hours a week'],
    ['Format', 'Online, plus an optional 3-day studio visit'],
    ['Live sessions', 'Saturdays, 10:00 IST'],
    ['Language', 'Gujarati and Hindi, English subtitles'],
  ],
  includes: [
    'A tabletop loom and desi wool kit, delivered to your home',
    `${LESSON_COUNT} video lessons and ${MODULES.length} live sessions`,
    `Feedback on your samples from ${MAKERS[COURSE.teacher].name}`,
    'A certificate with an ID anyone can verify',
  ],
  kit: 'Loom kit included',
};

// Lessons finished before the one that is up next (lesson 15).
const LESSONS_DONE = 14;

export function courseProgress(lessonDone: boolean) {
  const done = LESSONS_DONE + (lessonDone ? 1 : 0);
  let rest = done;
  const modules = MODULES.map((m, i) => {
    const finished = Math.min(rest, m.lessons.length);
    rest -= finished;
    return { n: i + 1, title: m.title, total: m.lessons.length, done: finished };
  });
  const current = modules.find((m) => m.done < m.total) ?? modules[modules.length - 1];
  return {
    done,
    pct: Math.round((done / LESSON_COUNT) * 100),
    modules,
    next: {
      n: done + 1,
      title: MODULES[current.n - 1].lessons[current.done],
      module: current.n,
    },
  };
}
