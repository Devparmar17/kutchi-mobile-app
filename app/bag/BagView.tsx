'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { SoonButton } from '@/components/ui';
import { arrivesBy, inr, lowerFirst, plural, productSwatch, resolveLines, stockTag, totalOf } from '@/lib/catalog';
import { useProducts } from '@/lib/shop';
import { actions, useStore } from '@/lib/store';

export default function BagView() {
  const { bag } = useStore();
  const lines = resolveLines(bag, useProducts());
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const total = totalOf(lines);

  return (
    <div className="screen">
      <header className="title-head inline">
        <h1 className="h1">Your bag</h1>
        <span className="muted">{plural(count, 'item')}</span>
      </header>

      <main className="scroll">
        <div className="page gap-16">
          {lines.length > 0 ? (
            <>
              <div className="notice">
                <Icon name="truck" size={20} />
                Free delivery · arrives {lowerFirst(arrivesBy('standard'))}
              </div>

              <div className="col gap-12">
                {lines.map((l) => {
                  const note = stockTag(l.product);
                  return (
                    <div key={l.key} className="card bag-line">
                      <Link
                        href={`/shop/${l.product.id}`}
                        aria-label={`View ${l.product.name}`}
                        className="bag-thumb"
                        style={{ background: productSwatch(l.product, 'card', l.variant) }}
                      />
                      <div className="col grow">
                        <div className="bag-top">
                          <div className="col grow gap-1">
                            <span className="bag-name">{l.product.name}</span>
                            <span className="small muted">
                              {l.product.maker.name} · {l.product.maker.place}
                            </span>
                            {l.color && <span className="small muted">{l.color}</span>}
                            {note && <span className="small semi warn-text">{note}</span>}
                          </div>
                          <button
                            type="button"
                            className="icon-btn remove-btn"
                            aria-label={`Remove ${l.product.name}`}
                            onClick={() => actions.removeLine(l.key)}
                          >
                            <Icon name="close" size={18} strokeWidth={2} />
                          </button>
                        </div>
                        <div className="between bag-foot">
                          <div className="stepper">
                            <button
                              type="button"
                              aria-label={`One less ${l.product.name}`}
                              disabled={l.qty <= 1}
                              onClick={() => actions.setQty(l.key, l.qty - 1)}
                            >
                              <Icon name="minus" size={16} strokeWidth={2.2} />
                            </button>
                            <span aria-live="polite" className="num">
                              {l.qty}
                            </span>
                            <button
                              type="button"
                              aria-label={`One more ${l.product.name}`}
                              disabled={l.qty >= l.max}
                              onClick={() => actions.setQty(l.key, l.qty + 1)}
                            >
                              <Icon name="plus" size={16} strokeWidth={2.2} />
                            </button>
                          </div>
                          <span className="line-total num">{inr(l.total)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <SoonButton what="Adding a gift note" className="gift">
                <Icon name="gift" size={22} className="maroon" />
                <span className="col grow">
                  <span className="semi">Add a gift note</span>
                  <span className="small muted">Printed on handmade paper and tucked into the fold</span>
                </span>
                <Icon name="chevron" size={18} strokeWidth={2} className="muted" />
              </SoonButton>

              <section aria-labelledby="h-sum" className="card summary">
                <h2 id="h-sum" className="summary-title">
                  Order summary
                </h2>
                <div className="sum-row">
                  <span className="muted">Subtotal</span>
                  <span className="semi">{inr(total)}</span>
                </div>
                <div className="sum-row">
                  <span className="muted">Delivery</span>
                  <span className="semi green">Free</span>
                </div>
                <div className="rule" />
                <div className="sum-row total">
                  <span>Total</span>
                  <span>{inr(total)}</span>
                </div>
              </section>
            </>
          ) : (
            <div className="empty">
              <span aria-hidden="true" className="empty-icon">
                <Icon name="bag" size={28} />
              </span>
              <span className="empty-title">Your bag is empty</span>
              <span className="small muted">Find a shawl woven by hand in Kutch.</span>
            </div>
          )}
        </div>
      </main>

      <div className="bottom-bar flat">
        <div className="col">
          <span className="tiny muted">Total</span>
          <span className="bar-total num">{inr(total)}</span>
        </div>
        <Link href={lines.length > 0 ? '/checkout' : '/shop'} className="btn md grow">
          {lines.length > 0 ? 'Checkout' : 'Browse shawls'}
        </Link>
      </div>

      <TabBar active="bag" />
    </div>
  );
}
