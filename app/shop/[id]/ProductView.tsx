'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon, { Heart, Star } from '@/components/Icon';
import { Avatar, ShareButton } from '@/components/ui';
import { MADE_BY, STORY_MAKER, arrivesBy, chip, inr, lowerFirst, maxOf, plural, productSwatch, stockTag } from '@/lib/catalog';
import { useShop } from '@/lib/shop';
import { actions, useStore } from '@/lib/store';

export default function ProductView({ id }: { id: string }) {
  const router = useRouter();
  const { online, products } = useShop();
  const { saved } = useStore();
  const p = products.find((x) => x.id === id);
  const [variantId, setVariantId] = useState(p?.variants?.[0]?.id);

  if (!p) {
    return (
      <div className="screen">
        <main className="scroll">
          <div className="empty">
            <span className="empty-title">{online ? 'This shawl has been taken down' : 'The shop can’t be reached'}</span>
            <span className="small muted">
              {online ? 'The weaver is no longer selling it.' : 'Try again in a moment.'}
            </span>
            <Link href="/shop" className="btn md">
              Back to the shop
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const color = p.variants?.find((v) => v.id === variantId)?.name ?? p.colorName;
  const isSaved = saved.includes(p.id);
  const soldOut = p.left === 0;
  const tag = stockTag(p);
  const x = p.extras;
  const about = [p.description, p.story.technique, p.story.significance].filter(Boolean);

  function addToBag() {
    if (!p) return;
    actions.addToBag(p.id, variantId, maxOf(p));
    router.push('/bag');
  }

  return (
    <div className="screen">
      <main className="scroll">
        <div className="hero">
          {p.photos.length > 0 ? (
            <div className="hscroll gallery">
              {p.photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt={`${p.name}, photo ${i + 1} of ${p.photos.length}`} />
              ))}
            </div>
          ) : (
            <div aria-hidden="true" className="hero-art" style={{ background: productSwatch(p, 'hero', variantId) }} />
          )}
          <div className="hero-bar">
            <Link href="/shop" className="icon-btn float" aria-label="Back to shop">
              <Icon name="back" size={22} strokeWidth={2} />
            </Link>
            <div className="hero-actions">
              <ShareButton title={p.name} className="icon-btn float" />
              <button
                type="button"
                className="icon-btn float"
                aria-label="Save to wishlist"
                aria-pressed={isSaved}
                onClick={() => actions.toggleSaved(p.id)}
              >
                <Heart on={isSaved} />
              </button>
            </div>
          </div>
          {p.photos.length > 1 && <span className="video-time">{plural(p.photos.length, 'photo')} · swipe</span>}
        </div>

        <div className="page gap-24 product-page">
          <div className="col gap-4">
            <span className="small bold maroon">{p.line}</span>
            <h1 className="title-26">{p.name}</h1>
            <div className="between">
              <span className="price-24">{inr(p.price)}</span>
              {x && (
                <a href="#reviews" className="link ink rating">
                  <Star size={16} />
                  {x.rating.score}
                  <span className="rating-count">· {x.rating.count} reviews</span>
                </a>
              )}
            </div>
            <span className="small muted">
              Inclusive of taxes · Free delivery {lowerFirst(arrivesBy('standard'))}
              {tag && !soldOut && <span className="stock-note"> · {tag}</span>}
            </span>
          </div>

          {(color || p.size) && (
            <div className="col gap-10">
              <div className="between baseline">
                {color && (
                  <span className="color-label">
                    Color: <span>{color}</span>
                  </span>
                )}
                {p.size && <span className="small muted">One size · {p.size}</span>}
              </div>
              {p.variants && (
                <div className="variants">
                  {p.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className="variant"
                      aria-label={v.name}
                      aria-pressed={v.id === variantId}
                      onClick={() => setVariantId(v.id)}
                    >
                      <span aria-hidden="true" style={{ background: chip(v.palette) }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card person">
            <Avatar maker={p.maker} />
            <div className="col grow">
              <span className="small muted">{MADE_BY[p.craft]}</span>
              <span className="person-name">{p.maker.name}</span>
              <span className="small muted">
                {p.maker.role} · {p.maker.place}, Kutch
              </span>
            </div>
            {p.makerId === STORY_MAKER ? (
              <Link href="/crafts/story" className="btn outline sm">
                Meet him
              </Link>
            ) : (
              <Link href={`/shop?q=${encodeURIComponent(p.maker.name)}`} className="btn outline sm">
                More shawls
              </Link>
            )}
          </div>

          {about.length > 0 && (
            <section aria-labelledby="h-about" className="col gap-8">
              <h2 id="h-about" className="h2 sm">
                About this piece
              </h2>
              {about.map((text) => (
                <p key={text} className="small-14 ink2 pretty">
                  {text}
                </p>
              ))}
            </section>
          )}

          <section aria-labelledby="h-price" className="col gap-12">
            <div className="col gap-2">
              <h2 id="h-price" className="h2 sm">
                Where your {inr(p.price)} goes
              </h2>
              <p className="small muted">{p.maker.name} sets this price, based on the work behind it.</p>
            </div>
            <div aria-hidden="true" className="split-bar">
              {p.breakdown.map((b) => (
                <span key={b.label} style={{ flex: `${b.amount} 1 0`, background: b.color }} />
              ))}
            </div>
            <dl className="split-legend">
              {p.breakdown.map((b) => (
                <div key={b.label} className="col gap-2">
                  <dt className="small muted">
                    <span aria-hidden="true" className="legend-dot" style={{ background: b.color }} />
                    {b.label}
                  </dt>
                  <dd className="bold">{inr(b.amount)}</dd>
                </div>
              ))}
            </dl>
          </section>

          {x && (
            <section aria-labelledby="h-made" className="col gap-10 unpad">
              <div className="between pad">
                <h2 id="h-made" className="h2 sm">
                  How it’s made
                </h2>
                <Link href="/crafts/story" className="link semi">
                  All 6 stages
                </Link>
              </div>
              <div className="hscroll stage-row">
                {x.stages.map((s) => (
                  <Link key={s.label} href="/crafts/story" className="stage-card">
                    <div aria-hidden="true" className="stage-art" style={{ background: s.swatch }} />
                    <span className="stage-label">{s.label}</span>
                    <span className="stage-title">{s.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="h-details" className="col gap-10">
            <h2 id="h-details" className="h2 sm">
              Details
            </h2>
            <dl className="card specs">
              {p.specs.map(([label, value]) => (
                <div key={label} className="spec">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {x && (
            <section id="reviews" aria-labelledby="h-reviews" className="col gap-10">
              <div className="between baseline">
                <h2 id="h-reviews" className="h2 sm">
                  Reviews
                </h2>
                <span className="small muted">{x.rating.count} reviews</span>
              </div>
              <div className="card review">
                <div className="between">
                  <span className="review-who">{x.review.who}</span>
                  <span className="stars">
                    <span className="sr-only">5 out of 5 stars</span>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} />
                    ))}
                  </span>
                </div>
                <p className="review-text">{x.review.text}</p>
                <span className="review-meta">{x.review.meta}</span>
              </div>
            </section>
          )}

          <div className="note">
            <Icon name="shield" size={22} />
            <div className="col gap-2">
              <span className="note-title">Handmade and verified</span>
              <span className="small ink2">Ships with an authenticity card signed by the maker.</span>
            </div>
          </div>
        </div>
      </main>

      <div className="bottom-bar">
        <button type="button" className="btn grow" disabled={soldOut} onClick={addToBag}>
          {!soldOut && <Icon name="bag" size={20} strokeWidth={2} />}
          {soldOut ? 'Sold out' : 'Add to bag'}
        </button>
      </div>
    </div>
  );
}
