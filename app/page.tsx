import Link from 'next/link';
import Icon, { Logo } from '@/components/Icon';
import { SoonButton } from '@/components/ui';
import { SW, weave } from '@/lib/catalog';

// The stack of folded shawls: left offset, width and height in px, then cloth and fringe.
const FOLDS = [
  [40, 286, 56, weave('card'), '#EDE6D6'],
  [18, 318, 50, SW.ajrakh, '#D9B98C'],
  [56, 262, 64, SW.kala, '#DDD0B6'],
  [28, 300, 46, SW.bandhani, '#F2D9A6'],
  [64, 250, 54, SW.embroidery, '#E9E4D8'],
] as const;

export default function Page() {
  return (
    <div className="screen welcome">
      <div aria-hidden="true" className="welcome-art">
        <div className="folds">
          {FOLDS.map(([left, width, height, cloth, fringe]) => (
            <div key={left} className="fold" style={{ marginLeft: left }}>
              <div className="fold-cloth" style={{ width, height, background: cloth }} />
              <div
                className="fold-fringe"
                style={{ height, background: `repeating-linear-gradient(90deg, ${fringe} 0 2px, transparent 2px 5px)` }}
              />
            </div>
          ))}
        </div>
        <svg className="welcome-thread" viewBox="0 0 390 410" preserveAspectRatio="none">
          <path
            d="M-10 396 C 70 330, 150 410, 236 352 S 360 300, 402 338"
            fill="none"
            stroke="#E7B24C"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="welcome-brand">
        <Logo core="#17204B" />
        Kutch Shawls
      </div>
      <SoonButton what="Changing the language" label="Language: English. Change language" className="lang-btn">
        <Icon name="globe" size={16} />
        English
      </SoonButton>

      <div className="welcome-body">
        <div className="col gap-12">
          <h1 className="welcome-title">Shawls with a story, woven by hand in Kutch.</h1>
          <p className="welcome-lede">
            Buy straight from the weavers, see how every piece is made, and learn the craft from them.
          </p>
        </div>
        <div className="col gap-4">
          <Link href="/login?mode=signup" className="btn lg">
            Get started
          </Link>
          <Link href="/login" className="welcome-link">
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  );
}
