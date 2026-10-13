'use client';

import type { ReactNode } from 'react';
import type { Maker } from '@/lib/types';
import Icon from './Icon';
import { toast } from './Toast';

/** A control whose feature has nothing behind it yet: it says so instead of doing nothing. */
export function SoonButton({
  what,
  label,
  className,
  children,
}: {
  what: string;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => toast(`${what} isn’t available yet`)}
    >
      {children}
    </button>
  );
}

/** Opens the phone's share sheet, or copies the page link where there isn't one. */
export function ShareButton({
  title,
  label = 'Share',
  className = 'icon-btn',
  children,
}: {
  title: string;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  async function share() {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      // Rejects when the sheet is dismissed, which needs no message.
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied');
    } catch {
      toast('Couldn’t copy the link');
    }
  }

  return (
    <button type="button" className={className} aria-label={children ? undefined : label} onClick={share}>
      {children ?? <Icon name="share" size={20} />}
    </button>
  );
}

/** The maker's initial on their colour, until they upload a portrait. */
export function Avatar({ maker, size = 52 }: { maker: Maker; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, Math.round(size * 0.36)),
        background: maker.bg,
        color: maker.fg,
      }}
    >
      {maker.name[0]}
    </span>
  );
}
