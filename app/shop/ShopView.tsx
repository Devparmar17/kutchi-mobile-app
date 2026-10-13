'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon, { Heart, Logo, Play, WeaveStrip } from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { Avatar } from '@/components/ui';
import {
  CRAFTS,
  MADE_BY,
  SW,
  countOf,
  inr,
  makerLine,
  matchesProduct,
  plural,
  productSwatch,
  stockTag,
} from '@/lib/catalog';
import { useShop } from '@/lib/shop';
import { actions, useStore } from '@/lib/store';
import type { CraftId } from '@/lib/types';

export interface ShopFilter {
  craft: CraftId | 'all';
  query: string;
  saved: boolean;
}

export default function ShopView({ initial }: { initial: ShopFilter }) {
  const { online, products: all } = useShop();
  const { bag, saved } = useStore();
  const [craft, setCraft] = useState(initial.craft);
  const [query, setQuery] = useState(initial.query);
  const [savedOnly, setSavedOnly] = useState(initial.saved);

  const count = countOf(bag, all);
  const searching = query.trim() !== '';
  const savedHere = all.filter((p) => saved.includes(p.id));
  const products = (savedOnly ? savedHere : all).filter(
    (p) => (craft === 'all' || p.craft === craft) && matchesProduct(p, query),
  );
  // The vendor's newest listing leads the shop.
  const featured = all[0];

  let emptyTitle = 'No shawls match';
  let emptyText = 'Try another craft or a different search.';
  if (all.length === 0) {
    emptyTitle = online ? 'No shawls in the shop yet' : 'The shop can’t be reached';
    emptyText = online
      ? 'The weavers haven’t listed anything for sale right now.'
      : 'We’ll keep trying. The shawls will appear here as soon as it’s back.';
  } else if (savedOnly && savedHere.length === 0) {
    emptyTitle = 'No saved shawls yet';
    emptyText = 'Tap the heart on a shawl to keep it here.';
  }

  return (
    <div className="screen">
      <header className="shop-head">
        <div className="between">
          <div className="brand">
            <Logo />
            Kutch Shawls
          </div>
          <div className="head-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Saved shawls"
              aria-pressed={savedOnly}
              onClick={() => setSavedOnly(!savedOnly)}
            >
              <Heart on={savedOnly} size={22} />
            </button>
            <Link href="/bag" className="icon-btn" aria-label={`Bag, ${plural(count, 'item')}`}>
              <Icon name="bag" size={22} />
              {count > 0 && (
                <span className="count-badge" aria-hidden="true">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="search">
          <label htmlFor="shop-search" className="sr-only">
            Search shawls, crafts or artisans
          </label>
          <Icon name="search" size={18} />
          <input
            id="shop-search"
            type="search"
            placeholder="Search shawls, crafts or artisans"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="scroll">
        <div className="page bleed gap-28">
          {featured && !searching && !savedOnly && (
            <Link href={`/shop/${featured.id}`} className="feature inset">
              <div aria-hidden="true" className="feature-art" style={{ background: productSwatch(featured, 'large') }} />
              <span className="tag white feature-tag">Fresh off the loom</span>
              <div className="feature-body">
                <span className="small semi gold">{featured.line}</span>
                <div className="feature-title">
                  <span className="feature-name">{featured.name}</span>
                  <span className="feature-price">{inr(featured.price)}</span>
                </div>
                <span className="feature-maker">
                  <Avatar maker={featured.maker} size={24} />
                  {MADE_BY[featured.craft]} {featured.maker.name} · {featured.maker.place}
                </span>
              </div>
            </Link>
          )}

          <section aria-labelledby="h-craft" className="col gap-8">
            <div className="between pad">
              <h2 id="h-craft" className="h2">
                Shop by craft
              </h2>
              <Link href="/crafts" className="link semi">
                About the crafts
              </Link>
            </div>
            <div className="hscroll craft-row">
              <button type="button" className="craft" aria-pressed={craft === 'all'} onClick={() => setCraft('all')}>
                <span aria-hidden="true" className="craft-swatch" style={{ background: '#1D2756' }}>
                  All
                </span>
                <span>All</span>
              </button>
              {CRAFTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="craft"
                  aria-pressed={craft === c.id}
                  onClick={() => setCraft(c.id)}
                >
                  <span aria-hidden="true" className="craft-swatch" style={{ background: c.swatch }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="h-shawls" className="col gap-12 pad">
            <div className="between baseline">
              <h2 id="h-shawls" className="h2">
                {savedOnly ? 'Saved shawls' : searching ? 'Results' : 'New from the looms'}
              </h2>
              <span className="small muted">{plural(products.length, 'shawl')}</span>
            </div>
            {products.length > 0 ? (
              <div className="product-grid">
                {products.map((p) => {
                  const tag = stockTag(p);
                  const isSaved = saved.includes(p.id);
                  return (
                    <div key={p.id} className="product">
                      <Link href={`/shop/${p.id}`} className="product-link">
                        <div
                          aria-hidden="true"
                          className="product-swatch"
                          style={{ background: productSwatch(p, 'card') }}
                        />
                        <div className="col gap-1">
                          <span className="product-name">{p.name}</span>
                          <span className="small muted">{makerLine(p)}</span>
                          <span className="product-price">{inr(p.price)}</span>
                        </div>
                      </Link>
                      {tag && <span className={`tag product-tag ${p.left === 0 ? 'dark' : 'warn'}`}>{tag}</span>}
                      <button
                        type="button"
                        className="save-btn"
                        aria-label={`Save ${p.name}`}
                        aria-pressed={isSaved}
                        onClick={() => actions.toggleSaved(p.id)}
                      >
                        <span>
                          <Heart on={isSaved} size={18} />
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty compact">
                <span className="empty-title">{emptyTitle}</span>
                <span className="small muted">{emptyText}</span>
              </div>
            )}
          </section>

          <Link href="/crafts/story" className="card story-card inset">
            <div aria-hidden="true" className="story-thumb" style={{ background: SW.warp }}>
              <span className="play-dot">
                <Play fill="#FFFFFF" />
              </span>
            </div>
            <div className="col gap-4">
              <span className="eyebrow">Craft story · 4 min</span>
              <span className="story-title">How a Bhujodi shawl is made</span>
              <span className="small muted">Six stages, from Rabari sheep’s wool to the knotted fringe.</span>
            </div>
          </Link>

          <Link href="/courses" className="promo inset">
            <WeaveStrip id="weave-shop" />
            <div className="promo-body">
              <span className="eyebrow gold with-icon">
                <Icon name="award" size={16} />
                Certificate courses
              </span>
              <span className="promo-title">Learn to weave from the people who do it</span>
              <span className="promo-text">
                Online lessons with Kutch artisans, plus optional visits to their studios.
              </span>
              <span className="promo-cta">
                Browse courses
                <Icon name="arrow" size={16} strokeWidth={2} />
              </span>
            </div>
          </Link>
        </div>
      </main>

      <TabBar active="shop" />
    </div>
  );
}
