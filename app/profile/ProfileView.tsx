'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import Icon, { type IconName } from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { SW, addressLine, arrivesBy, initials, lowerFirst, monthYear, orderHeadline, productSwatch } from '@/lib/catalog';
import { useOrderStatus, useProducts } from '@/lib/shop';
import { useStore } from '@/lib/store';
import type { OrderStatus, User } from '@/lib/types';

function RowBody({ icon, label, hint, value }: { icon: IconName; label: string; hint?: string; value?: ReactNode }) {
  return (
    <>
      <Icon name={icon} className="muted" />
      {hint ? (
        <span className="col grow">
          <span>{label}</span>
          <span className="small muted clip">{hint}</span>
        </span>
      ) : (
        <span className="grow">{label}</span>
      )}
      {value !== undefined && <span className="row-value num">{value}</span>}
      <Icon name="chevron" size={16} strokeWidth={2} className="muted" />
    </>
  );
}

export default function ProfileView({ user, latestStatus }: { user: User; latestStatus: OrderStatus | null }) {
  const products = useProducts();
  const { saved } = useStore();
  const [leaving, setLeaving] = useState(false);

  const latest = user.orders.find((o) => !o.cancelledAt);
  const status = useOrderStatus(latest?.no, latestStatus);
  const first = latest?.items[0];
  const firstProduct = products.find((p) => p.id === first?.id);
  const savedCount = products.filter((p) => saved.includes(p.id)).length;
  const certificates = user.courses.filter((e) => e.finishedAt).length;

  async function signOut() {
    setLeaving(true);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    // A full page load, so nothing rendered for this buyer stays on screen.
    window.location.assign('/');
  }

  return (
    <div className="screen">
      <header className="profile-head">
        <span aria-hidden="true" className="avatar user">
          {initials(user.name)}
        </span>
        <div className="col grow">
          <h1 className="profile-name">{user.name}</h1>
          <span className="small muted">
            {user.city && `${user.city} · `}Member since {monthYear(user.since)}
          </span>
        </div>
        <Link href="/profile/edit" aria-label="Edit your details" className="icon-btn">
          <Icon name="edit" />
        </Link>
      </header>

      <main className="scroll">
        <div className="page gap-20 top-0">
          {latest && (
            <Link href={`/order?no=${latest.no}`} className="promo track">
              <span
                aria-hidden="true"
                className="track-thumb"
                style={{ background: firstProduct ? productSwatch(firstProduct, 'thumb', first?.variant) : SW.warp }}
              />
              <div className="col grow">
                <span className="semi">{orderHeadline(status)}</span>
                <span className="small navy-ink">
                  Order #KS-{latest.no}
                  {status !== 'Delivered' && ` · arrives ${lowerFirst(arrivesBy(latest.speed, latest.placedAt))}`}
                </span>
              </div>
              <Icon name="chevron" size={18} strokeWidth={2} />
            </Link>
          )}

          <section aria-labelledby="h-shop" className="col gap-8">
            <h2 id="h-shop" className="group-title">
              Shopping
            </h2>
            <div className="card rows">
              <Link href="/order" className="row">
                <RowBody icon="box" label="My orders" value={user.orders.length} />
              </Link>
              <Link href="/shop?saved=1" className="row">
                <RowBody icon="heart" label="Saved shawls" value={savedCount} />
              </Link>
              <Link href="/profile/address" className="row tall">
                <RowBody
                  icon="pin"
                  label="Delivery address"
                  hint={user.address ? addressLine(user.address) : 'Not added yet'}
                />
              </Link>
            </div>
          </section>

          <section aria-labelledby="h-learn" className="col gap-8">
            <h2 id="h-learn" className="group-title">
              Learning
            </h2>
            <div className="card rows">
              <Link href="/learn" className="row">
                <RowBody icon="courses" label="My courses" value={user.courses.length} />
              </Link>
              <Link href="/certificate" className="row">
                <RowBody icon="award" label="Certificates" value={certificates} />
              </Link>
            </div>
          </section>

          <div className="card rows">
            <Link href="/help" className="row">
              <RowBody icon="help" label="Help" />
            </Link>
          </div>

          <div className="col account-foot">
            <span className="small muted">Signed in as {user.email}</span>
            <button type="button" className="sign-out" disabled={leaving} onClick={signOut}>
              {leaving ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </main>

      <TabBar active="profile" />
    </div>
  );
}
