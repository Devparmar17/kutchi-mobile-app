import type { Metadata } from 'next';
import Link from 'next/link';
import Icon, { Play } from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { Avatar } from '@/components/ui';
import { MAKERS, STORY_MAKER, SW, weave } from '@/lib/catalog';
import type { CraftId, MakerId } from '@/lib/types';

export const metadata: Metadata = { title: 'Crafts of Kutch' };

// Crafts without a full story yet open their shawls in the shop.
const MORE: { id: CraftId; name: string; about: string; swatch: string }[] = [
  { id: 'ajrakh', name: 'Ajrakh block printing', about: 'Ajrakhpur · resist printing with natural dyes', swatch: SW.ajrakh },
  { id: 'bandhani', name: 'Bandhani tie-dye', about: 'Bhuj and Mandvi · thousands of tiny knots', swatch: SW.bandhani },
  { id: 'kala', name: 'Kala cotton', about: 'Across Kutch · rain-fed, native cotton', swatch: SW.kalaPlain },
  { id: 'embroidery', name: 'Rabari embroidery', about: 'Dhaneti · mirror work and chain stitch', swatch: SW.embroidery },
];

const WORDS = [
  ['Warp', 'The threads stretched lengthwise on the loom.'],
  ['Weft', 'The thread passed across the warp, row by row.'],
  ['Extra-weft', 'Extra threads added by hand to form a motif.'],
];

export default function Page() {
  return (
    <div className="screen">
      <header className="title-head">
        <h1 className="h1">Crafts of Kutch</h1>
        <p className="muted">See how each piece is made, by the people who make it.</p>
      </header>

      <main className="scroll">
        <div className="page bleed gap-26">
          <Link href="/crafts/story" className="card lead-story inset">
            <div aria-hidden="true" className="lead-art" style={{ background: weave('large') }} />
            <span className="tag white lead-tag">
              <Play size={12} />
              Video · 4:12
            </span>
            <div className="col gap-4 lead-body">
              <span className="eyebrow">Weaving · Bhujodi</span>
              <span className="lead-title">Bhujodi extra-weft weaving</span>
              <span className="ink2">Wool from Rabari herders’ sheep, woven on pit looms by Vankar families.</span>
              <span className="small muted lead-meta">6 stages · 4 min read</span>
            </div>
          </Link>

          <section aria-labelledby="h-more" className="col gap-10 pad">
            <h2 id="h-more" className="h2">
              More crafts
            </h2>
            <div className="card rows">
              {MORE.map((c) => (
                <Link key={c.id} href={`/shop?craft=${c.id}`} className="row craft-item">
                  <span aria-hidden="true" className="craft-thumb" style={{ background: c.swatch }} />
                  <span className="col grow">
                    <span className="bold">{c.name}</span>
                    <span className="small muted">{c.about}</span>
                  </span>
                  <Icon name="chevron" size={16} strokeWidth={2} className="muted" />
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="h-makers" className="col gap-10">
            <h2 id="h-makers" className="h2 pad">
              Meet the makers
            </h2>
            <div className="hscroll maker-row">
              {(Object.keys(MAKERS) as MakerId[]).map((id) => (
                <Link
                  key={id}
                  href={id === STORY_MAKER ? '/crafts/story' : `/shop?q=${encodeURIComponent(MAKERS[id].name)}`}
                  className="maker"
                >
                  <Avatar maker={MAKERS[id]} size={68} />
                  <span className="maker-name">{MAKERS[id].name}</span>
                  <span className="maker-craft">{MAKERS[id].craft}</span>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="h-words" className="col gap-10 pad">
            <h2 id="h-words" className="h2">
              Words you’ll hear
            </h2>
            <dl className="card words">
              {WORDS.map(([word, meaning]) => (
                <div key={word} className="col gap-2">
                  <dt>{word}</dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </main>

      <TabBar active="crafts" />
    </div>
  );
}
