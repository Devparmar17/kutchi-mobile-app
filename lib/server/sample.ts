import { MAKERS, weave } from '../catalog';
import type { MakerId } from '../types';
import type { Listing } from './vendor';

const SHAWL = 'Shawl · about 100 × 220 cm';
const STOLE = 'Stole · about 70 × 200 cm';

// Dotted cloth (bandhani knots, embroidery mirrors) and the ajrakh diamond grid, in any colours.
const dots = (dot: string, ground: string, gap = 10) =>
  `radial-gradient(circle, ${dot} 0 1.8px, transparent 2.4px) 0 0 / ${gap}px ${gap}px, ${ground}`;
const mirrors = (ground: string) =>
  `radial-gradient(circle, #E9E4D8 0 2.2px, transparent 2.8px) 0 0 / 14px 14px, radial-gradient(circle, #D9A21B 0 1.6px, transparent 2.2px) 7px 7px / 14px 14px, ${ground}`;
const diamonds = (a: string, b: string) =>
  `conic-gradient(from 45deg, ${a} 25%, ${b} 0 50%, ${a} 0 75%, ${b} 0) 0 0 / 18px 18px`;

/**
 * One of the app's own shawls. The first six have a hand-drawn swatch and a maker in the catalog's DRESSING;
 * the rest name their artisan and bring their own swatch, as a shawl the vendor adds would.
 */
const listing = (
  shawl: Pick<Listing, 'id' | 'name' | 'material' | 'craft' | 'size' | 'color' | 'dyes' | 'cost' | 'stock'>,
  own?: { by: MakerId; swatch: string },
): Listing => ({
  ...shawl,
  description: `${shawl.material} piece in ${shawl.color.toLowerCase()}, made with ${shawl.craft.toLowerCase()}.`,
  status: shawl.stock === 0 ? 'out' : 'active',
  story: {
    artisan: own ? MAKERS[own.by].name : '',
    origin: `${own ? MAKERS[own.by].place : 'Bhujodi'}, Kutch`,
    technique: '',
    significance: '',
  },
  photos: 0,
  swatch: own?.swatch ?? '',
  updatedAt: 0,
});

/**
 * The app's own shawls, three for each craft: what the shop sells while no vendor's studio is
 * attached, and what it falls back to showing when an attached one can't be reached.
 */
export const SAMPLE_LISTINGS: Listing[] = [
  listing({
    id: 'p1', name: 'Bhujodi Extra-weft Shawl', material: 'Desi wool', craft: 'Extra-weft handloom',
    size: SHAWL, color: 'Indigo & ivory', dyes: ['indigo', 'undyed'],
    cost: { material: 1800, craft: 2400, design: 600 }, stock: 14,
  }),
  listing({
    id: 'p2', name: 'Kala Cotton Stole', material: 'Kala cotton', craft: 'Pit-loom plain weave',
    size: STOLE, color: 'Undyed natural', dyes: ['undyed'],
    cost: { material: 800, craft: 1100, design: 300 }, stock: 3,
  }),
  listing({
    id: 'p3', name: 'Ajrakh Wool Shawl', material: 'Merino wool', craft: 'Ajrakh block print',
    size: SHAWL, color: 'Madder & indigo', dyes: ['madder', 'indigo'],
    cost: { material: 2100, craft: 2800, design: 700 }, stock: 0,
  }),
  listing({
    id: 'p4', name: 'Dhabda Woollen Shawl', material: 'Desi sheep wool', craft: 'Pit-loom weaving',
    size: SHAWL, color: 'Black & white', dyes: ['iron', 'undyed'],
    cost: { material: 2400, craft: 3200, design: 800 }, stock: 8,
  }),
  listing({
    id: 'p5', name: 'Bandhani Wool Shawl', material: 'Fine wool', craft: 'Bandhani tie-dye',
    size: SHAWL, color: 'Maroon', dyes: ['madder'],
    cost: { material: 2700, craft: 3600, design: 900 }, stock: 2,
  }),
  listing({
    id: 'p6', name: 'Rabari Embroidered Stole', material: 'Wool', craft: 'Rabari hand embroidery',
    size: STOLE, color: 'Black, mirror work', dyes: ['iron'],
    cost: { material: 1800, craft: 2700, design: 700 }, stock: 6,
  }),

  listing(
    {
      id: 'p7', name: 'Bhujodi Striped Stole', material: 'Desi wool', craft: 'Extra-weft handloom',
      size: STOLE, color: 'Madder & ivory', dyes: ['madder', 'undyed'],
      cost: { material: 1200, craft: 1700, design: 400 }, stock: 9,
    },
    { by: 'laxmanbhai', swatch: weave('card', ['#8E2A1E', '#EDE6D6', '#1D2756']) },
  ),
  listing(
    {
      id: 'p8', name: 'Kala Cotton Indigo Stole', material: 'Kala cotton', craft: 'Pit-loom plain weave',
      size: STOLE, color: 'Indigo', dyes: ['indigo'],
      cost: { material: 900, craft: 1300, design: 300 }, stock: 7,
    },
    {
      by: 'valjibhai',
      swatch:
        'linear-gradient(90deg, transparent 0 82%, #EDE6D6 82% 86%, transparent 86%), repeating-linear-gradient(0deg, #2F3B80 0 3px, #1D2756 3px 4px)',
    },
  ),
  listing(
    {
      id: 'p9', name: 'Kala Cotton Striped Shawl', material: 'Kala cotton', craft: 'Pit-loom plain weave',
      size: SHAWL, color: 'Natural & madder', dyes: ['undyed', 'madder'],
      cost: { material: 1300, craft: 1900, design: 400 }, stock: 4,
    },
    {
      by: 'valjibhai',
      swatch:
        'repeating-linear-gradient(90deg, transparent 0 26px, #9E2F24 26px 30px, transparent 30px 34px, #9E2F24 34px 36px), repeating-linear-gradient(0deg, #DDD0B6 0 3px, #C9B996 3px 4px)',
    },
  ),
  listing(
    {
      id: 'p10', name: 'Ajrakh Indigo Stole', material: 'Merino wool', craft: 'Ajrakh block print',
      size: STOLE, color: 'Indigo & white', dyes: ['indigo'],
      cost: { material: 1500, craft: 2300, design: 500 }, stock: 6,
    },
    { by: 'abdulbhai', swatch: diamonds('#1D2756', '#D9DDF0') },
  ),
  listing(
    {
      id: 'p11', name: 'Ajrakh Black & Madder Shawl', material: 'Desi wool', craft: 'Ajrakh block print',
      size: SHAWL, color: 'Black & madder', dyes: ['iron', 'madder'],
      cost: { material: 2200, craft: 3000, design: 700 }, stock: 3,
    },
    { by: 'abdulbhai', swatch: diamonds('#1E1E22', '#8E2A1E') },
  ),
  listing(
    {
      id: 'p12', name: 'Bandhani Indigo Stole', material: 'Fine wool', craft: 'Bandhani tie-dye',
      size: STOLE, color: 'Indigo', dyes: ['indigo'],
      cost: { material: 1700, craft: 2500, design: 600 }, stock: 8,
    },
    { by: 'fatimaben', swatch: dots('#EDE6D6', '#1D2756') },
  ),
  listing(
    {
      id: 'p13', name: 'Bandhani Turmeric Shawl', material: 'Fine wool', craft: 'Bandhani tie-dye',
      size: SHAWL, color: 'Turmeric yellow', dyes: ['turmeric'],
      cost: { material: 2500, craft: 3400, design: 800 }, stock: 5,
    },
    { by: 'fatimaben', swatch: dots('#7A1F2B', '#D9A21B', 12) },
  ),
  listing(
    {
      id: 'p14', name: 'Rabari Mirror-work Shawl', material: 'Wool', craft: 'Rabari hand embroidery',
      size: SHAWL, color: 'Madder, mirror work', dyes: ['madder'],
      cost: { material: 3000, craft: 4700, design: 1200 }, stock: 2,
    },
    { by: 'jasuben', swatch: mirrors('#7A1F2B') },
  ),
  listing(
    {
      id: 'p15', name: 'Rabari Chain-stitch Stole', material: 'Wool', craft: 'Rabari hand embroidery',
      size: STOLE, color: 'Indigo', dyes: ['indigo'],
      cost: { material: 1600, craft: 2600, design: 600 }, stock: 7,
    },
    { by: 'jasuben', swatch: mirrors('#1D2756') },
  ),
];
