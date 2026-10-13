'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon from '@/components/Icon';
import { SoonButton } from '@/components/ui';
import {
  PAYMENTS,
  SPEEDS,
  arrivesBy,
  getSpeed,
  inr,
  joinNames,
  makersOf,
  plural,
  productSwatch,
  resolveLines,
  totalOf,
} from '@/lib/catalog';
import { refreshShop, useProducts } from '@/lib/shop';
import { actions, useStore } from '@/lib/store';
import type { BagLine, SpeedId, User } from '@/lib/types';

export default function CheckoutView({ user }: { user: User }) {
  const router = useRouter();
  const products = useProducts();
  const { bag } = useStore();
  const [speed, setSpeed] = useState<SpeedId>('standard');
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]['id']>('upi');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  // Placing the order empties the bag; the paid-for lines stay on screen until the next page loads.
  const [placed, setPlaced] = useState<BagLine[] | null>(null);

  const lines = resolveLines(placed ?? bag, products);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const makers = makersOf(lines);
  const places = [...new Set(makers.map((m) => m.place))];
  const subtotal = totalOf(lines);
  const fee = getSpeed(speed).fee;

  async function pay() {
    setPaying(true);
    setError('');
    try {
      const res = await fetch('/api/shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: bag, speed }),
      });
      if (res.status === 401) {
        window.location.assign('/login?next=/checkout');
        return;
      }
      const data: { no?: number; error?: string } = await res.json();
      if (res.ok && data.no) {
        setPlaced(bag);
        actions.clearBag();
        void refreshShop();
        router.push(`/order?no=${data.no}`);
        return;
      }
      setError(data.error ?? 'Your order couldn’t be placed. Try again.');
      // The stock on screen was out of date; bring in what the vendor has now.
      void refreshShop();
    } catch {
      setError('Couldn’t reach Kutch Shawls. Check your connection and try again.');
    }
    setPaying(false);
  }

  return (
    <div className="screen">
      <header className="topbar">
        <Link href="/bag" className="icon-btn" aria-label="Back to bag">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <h1 className="topbar-title">Checkout</h1>
        <span className="secure">
          <Icon name="lock" size={16} strokeWidth={2} />
          Secure
        </span>
      </header>

      {lines.length === 0 ? (
        <main className="scroll">
          <div className="empty">
            <span aria-hidden="true" className="empty-icon">
              <Icon name="bag" size={28} />
            </span>
            <span className="empty-title">Nothing to check out</span>
            <span className="small muted">Your bag is empty.</span>
            <Link href="/shop" className="btn md">
              Browse shawls
            </Link>
          </div>
        </main>
      ) : (
        <>
          <main className="scroll">
            <div className="page gap-26 top-18">
              <section aria-labelledby="h-del" className="col gap-10">
                <div className="step-head">
                  <span aria-hidden="true">1</span>
                  <h2 id="h-del" className="h2 sm">
                    Delivery
                  </h2>
                </div>
                <div className="card address">
                  <Icon name="pin" className="muted" />
                  <div className="col grow address-lines">
                    <span className="address-name">{user.name}</span>
                    {user.address.length > 0 ? (
                      user.address.map((line) => <span key={line}>{line}</span>)
                    ) : (
                      <span>{user.city}</span>
                    )}
                  </div>
                  <SoonButton what="Changing the address" className="text-btn">
                    Change
                  </SoonButton>
                </div>
                <div className="speed-grid">
                  {SPEEDS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      className="speed"
                      aria-pressed={o.id === speed}
                      onClick={() => setSpeed(o.id)}
                    >
                      <span className="between full">
                        <span className="bold">{o.label}</span>
                        <span aria-hidden="true" className="radio sm" />
                      </span>
                      <span className={`speed-price${o.fee ? '' : ' green'}`}>{o.fee ? inr(o.fee) : 'Free'}</span>
                      <span className="small muted">{arrivesBy(o.id)}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section aria-labelledby="h-pay" className="col gap-10">
                <div className="step-head">
                  <span aria-hidden="true">2</span>
                  <h2 id="h-pay" className="h2 sm">
                    Payment
                  </h2>
                </div>
                <div className="card rows">
                  {PAYMENTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="row tall pay"
                      aria-pressed={p.id === payment}
                      onClick={() => setPayment(p.id)}
                    >
                      <span aria-hidden="true" className="radio" />
                      <span className="col grow">
                        <span className="semi">{p.label}</span>
                        <span className="small muted">{p.hint}</span>
                      </span>
                      {p.tag && <span className="tag green">{p.tag}</span>}
                    </button>
                  ))}
                </div>
              </section>

              <section aria-labelledby="h-rev" className="col gap-10">
                <div className="step-head">
                  <span aria-hidden="true">3</span>
                  <h2 id="h-rev" className="h2 sm">
                    Review
                  </h2>
                </div>
                <div className="card summary tight">
                  <div className="review-row">
                    <div aria-hidden="true" className="thumb-stack">
                      {lines.slice(0, 3).map((l) => (
                        <span key={l.key} style={{ background: productSwatch(l.product, 'thumb', l.variant) }} />
                      ))}
                    </div>
                    <div className="col grow">
                      <span className="semi">
                        {plural(count, 'shawl')} from {plural(makers.length, 'artisan')}
                      </span>
                      <span className="small muted">
                        {joinNames(makers.map((m) => m.name))}, {joinNames(places)}
                      </span>
                    </div>
                    <Link href="/bag" className="link">
                      Edit
                    </Link>
                  </div>
                  <div className="rule" />
                  <div className="sum-row">
                    <span className="muted">Subtotal</span>
                    <span className="semi">{inr(subtotal)}</span>
                  </div>
                  <div className="sum-row">
                    <span className="muted">Delivery</span>
                    <span className="semi">{fee ? inr(fee) : 'Free'}</span>
                  </div>
                  <div className="sum-row total">
                    <span>Total</span>
                    <span>{inr(subtotal + fee)}</span>
                  </div>
                </div>
              </section>
            </div>
          </main>

          <div className="bottom-bar stacked">
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button type="button" className="btn" disabled={paying} onClick={pay}>
              <Icon name="lock" size={18} strokeWidth={2} />
              {paying ? 'Placing your order…' : `Pay ${inr(subtotal + fee)}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
