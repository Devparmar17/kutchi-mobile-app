import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { SPEEDS, inr, plural } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Help' };

const [STANDARD, EXPRESS] = SPEEDS;

// Answers say only what the app actually does.
const TOPICS: { q: string; a: string; link?: [href: string, label: string] }[] = [
  {
    q: 'When will my shawl arrive?',
    a: `Standard delivery is free and takes about ${plural(STANDARD.days, 'day')}. Express costs ${inr(EXPRESS.fee)} and takes about ${plural(EXPRESS.days, 'day')}. Every shawl is packed in Bhujodi with a card signed by the person who made it.`,
    link: ['/order', 'Follow your latest order'],
  },
  {
    q: 'How can I pay?',
    a: 'By UPI, credit or debit card, net banking, or cash when the parcel arrives. Courses are paid for when you enrol, so cash on delivery isn’t offered for them.',
  },
  {
    q: 'Can I cancel an order?',
    a: 'Yes, until the courier collects it. Open the order and tap Cancel order. Anything you paid goes back the way you paid it.',
    link: ['/order', 'Your orders'],
  },
  {
    q: 'How do I change my delivery address?',
    a: 'Go to You, then the pencil beside your name, then Delivery address. Orders already placed keep the address they were sent to.',
    link: ['/profile/address?next=/help', 'Change address'],
  },
  {
    q: 'Why can’t I see my orders on another phone?',
    a: 'Your account, orders and courses are kept on the device you used, not on a server. Log in with the same email on the same device to see them again. Clearing your browser’s data removes them.',
  },
  {
    q: 'How do I look after a wool shawl?',
    a: 'Dry clean it, or hand wash it in cold water and dry it flat in the shade. Store it folded, with a little neem or cedar against moths.',
  },
  {
    q: 'How do course certificates work?',
    a: 'Mark each lesson done as you finish it. When the last one is done, your certificate appears under You, with an ID and the date, ready to save as a PDF.',
    link: ['/courses', 'Browse courses'],
  },
];

export default function Page() {
  return (
    <div className="screen">
      <header className="topbar">
        <Link href="/profile" className="icon-btn" aria-label="Back to profile">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <h1 className="topbar-title">Help</h1>
      </header>

      <main className="scroll">
        <div className="page gap-12 top-18">
          <div className="card rows faq">
            {TOPICS.map((t) => (
              <details key={t.q}>
                <summary className="row tall">
                  <span className="grow semi">{t.q}</span>
                  <Icon name="down" size={18} strokeWidth={2} className="muted caret" />
                </summary>
                <div className="faq-body">
                  <p className="small-14 ink2 pretty">{t.a}</p>
                  {t.link && (
                    <Link href={t.link[0]} className="link small semi">
                      {t.link[1]}
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
