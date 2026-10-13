'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';
import { SoonButton } from '@/components/ui';
import { SW, arrivesBy, firstName, getSpeed, inr, joinNames, journey, productSwatch, shortDate } from '@/lib/catalog';
import { useOrderStatus, useProducts } from '@/lib/shop';
import type { OrderStatus, PlacedOrder, User } from '@/lib/types';

export default function OrderView({
  user,
  order,
  initialStatus,
}: {
  user: User;
  order: PlacedOrder | undefined;
  initialStatus: OrderStatus | null;
}) {
  const products = useProducts();
  const status = useOrderStatus(order?.no, initialStatus);

  if (!order) {
    return (
      <div className="screen">
        <header className="topbar plain">
          <Link href="/profile" className="icon-btn" aria-label="Back to profile">
            <Icon name="back" size={22} strokeWidth={2} />
          </Link>
          <span className="topbar-title">Orders</span>
        </header>
        <main className="scroll">
          <div className="empty">
            <span aria-hidden="true" className="empty-icon">
              <Icon name="box" size={28} />
            </span>
            <span className="empty-title">No orders yet</span>
            <span className="small muted">When you buy a shawl, you can follow it here from loom to door.</span>
            <Link href="/shop" className="btn md">
              Browse shawls
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const makers = [...new Set(order.items.map((i) => i.maker))];
  const pieces = order.items.reduce((sum, i) => sum + i.qty, 0);
  const when = arrivesBy(order.speed, order.placedAt);
  const steps = journey(status, order, user.city);
  const delivered = status === 'Delivered';
  const earlier = user.orders.filter((o) => o.no !== order.no);

  return (
    <div className="screen">
      <header className="topbar plain">
        <Link href="/shop" className="icon-btn" aria-label="Close and go to shop">
          <Icon name="close" size={22} strokeWidth={2} />
        </Link>
        <span className="order-no">Order #KS-{order.no}</span>
        <Link href="/profile" className="link topbar-link">
          Help
        </Link>
      </header>

      <main className="scroll">
        <div className="page gap-22 top-6">
          <div className="col gap-8">
            <span aria-hidden="true" className="done-mark">
              <Icon name="check" size={26} strokeWidth={2.4} />
            </span>
            <h1 className="h1 tight">Thank you, {firstName(user.name)}</h1>
            <p className="ink2 pretty">
              {delivered
                ? `Your order from ${joinNames(makers)} has been delivered.`
                : `${joinNames(makers)} ${makers.length === 1 ? 'has' : 'have'} your order. We’ll send updates here and by SMS.`}
            </p>
          </div>

          <section aria-labelledby="h-journey" className="card journey">
            <div className="between baseline">
              <h2 id="h-journey" className="h2 sm">
                {pieces === 1 ? 'Your shawl’s journey' : 'Your shawls’ journey'}
              </h2>
              {!delivered && <span className="small bold green">{when}</span>}
            </div>
            <ol className="steps" aria-live="polite">
              {steps.map((s) => (
                <li key={s.title} className={`step ${s.state}`}>
                  <div className="step-rail">
                    <span aria-hidden="true" className="step-dot">
                      {s.state === 'done' && <Icon name="check" size={14} strokeWidth={3} />}
                    </span>
                  </div>
                  <div className="step-body">
                    <div className="step-title">
                      <span>
                        <span className="sr-only">{s.state[0].toUpperCase() + s.state.slice(1)}: </span>
                        {s.title}
                      </span>
                      {s.state === 'now' && <span className="tag warn">In progress</span>}
                    </div>
                    <span className="small muted">{s.text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-label="Items in this order" className="card rows">
            {order.items.map((item) => {
              const product = products.find((p) => p.id === item.id);
              const colour = product?.variants?.find((v) => v.id === item.variant)?.name;
              return (
                <div key={`${item.id}:${item.variant ?? ''}`} className="row order-item">
                  <span
                    aria-hidden="true"
                    className="order-thumb"
                    style={{ background: product ? productSwatch(product, 'thumb', item.variant) : SW.warp }}
                  />
                  <div className="col grow">
                    <span className="order-name">{item.name}</span>
                    <span className="small muted">
                      {item.maker}
                      {colour && ` · ${colour}`} · Qty {item.qty}
                    </span>
                  </div>
                  <span className="order-price">{inr(item.amount)}</span>
                </div>
              );
            })}
            {order.fee > 0 && (
              <div className="row order-item">
                <span className="grow small muted">{getSpeed(order.speed).label} delivery</span>
                <span className="order-price">{inr(order.fee)}</span>
              </div>
            )}
          </section>

          <SoonButton what="Messaging the artisans" className="btn outline md">
            <Icon name="message" size={18} />
            Message the artisans
          </SoonButton>

          <Link href="/crafts/story" className="promo wait">
            <div aria-hidden="true" className="wait-thumb" style={{ background: SW.warp }} />
            <div className="col gap-2">
              <span className="eyebrow gold">{delivered ? 'Now it’s yours' : 'While you wait'}</span>
              <span className="story-title">See how your shawl was made</span>
              <span className="small navy-ink">6 stages · 4 min read</span>
            </div>
          </Link>

          {earlier.length > 0 && (
            <section aria-labelledby="h-earlier" className="col gap-8">
              <h2 id="h-earlier" className="group-title">
                Your other orders
              </h2>
              <div className="card rows">
                {earlier.map((o) => (
                  <Link key={o.no} href={`/order?no=${o.no}`} className="row tall">
                    <span className="col grow">
                      <span className="semi">Order #KS-{o.no}</span>
                      <span className="small muted">
                        {shortDate(o.placedAt)} · {inr(o.items.reduce((sum, i) => sum + i.amount, o.fee))}
                      </span>
                    </span>
                    <Icon name="chevron" size={16} strokeWidth={2} className="muted" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
