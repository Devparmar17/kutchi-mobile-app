'use client';

import Link from 'next/link';
import { countOf, plural } from '@/lib/catalog';
import { useProducts } from '@/lib/shop';
import { useStore } from '@/lib/store';
import Icon, { type IconName } from './Icon';

const TABS = [
  { id: 'shop', href: '/shop', label: 'Shop', icon: 'shop' },
  { id: 'crafts', href: '/crafts', label: 'Crafts', icon: 'crafts' },
  { id: 'courses', href: '/courses', label: 'Courses', icon: 'courses' },
  { id: 'bag', href: '/bag', label: 'Bag', icon: 'bag' },
  { id: 'profile', href: '/profile', label: 'You', icon: 'user' },
] as const satisfies readonly { id: string; href: string; label: string; icon: IconName }[];

export type TabId = (typeof TABS)[number]['id'];

export default function TabBar({ active }: { active: TabId }) {
  const count = countOf(useStore().bag, useProducts());

  return (
    <nav aria-label="Main" className="tabbar">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className="tab"
          aria-current={t.id === active ? 'page' : undefined}
          aria-label={t.id === 'bag' ? `Bag, ${plural(count, 'item')}` : undefined}
        >
          <span className="tab-icon">
            <Icon name={t.icon} size={22} />
            {t.id === 'bag' && count > 0 && (
              <span className="count-badge" aria-hidden="true">
                {count}
              </span>
            )}
          </span>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
