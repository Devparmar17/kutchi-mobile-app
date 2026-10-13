import type { Metadata } from 'next';
import Link from 'next/link';
import Icon, { Play } from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { Avatar, ShareButton, SoonButton } from '@/components/ui';
import { COURSE, MAKERS, STORY_MAKER, SW, weave } from '@/lib/catalog';

export const metadata: Metadata = { title: 'How it’s made' };

const TITLE = 'Bhujodi extra-weft weaving';

const FRINGE =
  'linear-gradient(180deg, #26306A 0 50%, transparent 50%), repeating-linear-gradient(90deg, #EDE6D6 0 3px, transparent 3px 7px)';

// Each stage's picture is a swatch of the given height, or a row of dye colours.
const STAGES: {
  title: string;
  time: string;
  text: string;
  longest?: boolean;
  art?: [height: number, swatch: string];
  dyes?: string[];
}[] = [
  {
    title: 'Sorting the wool',
    time: '1 day',
    text: 'Fleece from Rabari herders’ sheep is sorted by shade and softness, then washed.',
    art: [72, SW.fleece],
  },
  {
    title: 'Spinning the yarn',
    time: '1 day',
    text: 'The wool is spun into yarn. Finer yarn makes a lighter, softer shawl.',
  },
  {
    title: 'Dyeing',
    time: '1 day',
    text: 'Yarn is dipped in indigo or madder, or left in its natural shade.',
    dyes: ['#26306A', '#9E2F24', '#D9A21B', '#E4D9C3'],
  },
  {
    title: 'Warping',
    time: '1 day',
    text: 'Hundreds of threads are stretched out along the lane, starched, and wound onto the loom.',
    art: [56, SW.warp],
  },
  {
    title: 'Weaving the motifs',
    time: '4 days',
    longest: true,
    text: 'At a pit loom, the weaver lifts warp threads by hand to lay in each extra-weft motif. This is the longest stage.',
    art: [72, weave('card')],
  },
  {
    title: 'Finishing',
    time: '1 day',
    text: 'The fringe is knotted, the shawl is washed, checked and signed off by the weaver.',
    art: [44, FRINGE],
  },
];

export default function Page() {
  const weaver = MAKERS[STORY_MAKER];

  return (
    <div className="screen">
      <header className="topbar">
        <Link href="/crafts" className="icon-btn" aria-label="Back to crafts">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <span className="topbar-title">How it’s made</span>
        <ShareButton title={TITLE} label="Share this story" />
      </header>

      <main className="scroll">
        <div className="page bleed gap-24 top-16">
          <figure className="video inset">
            <div className="video-frame" style={{ background: weave('large') }}>
              <SoonButton what="The video" label="Play video, 4 minutes 12 seconds" className="play-btn">
                <Play size={28} />
              </SoonButton>
              <span className="video-time">4:12</span>
            </div>
            <figcaption>Filmed at {weaver.name}’s workshop in Bhujodi</figcaption>
          </figure>

          <div className="col gap-10 pad">
            <span className="eyebrow">Weaving · Bhujodi</span>
            <h1 className="title-27">{TITLE}</h1>
            <p className="ink2 pretty">
              Bhujodi is a weaving village about 8 km from Bhuj. Vankar families here have woven wool from Rabari
              herders’ sheep for generations. This is how one shawl comes together.
            </p>
            <div className="facts">
              <span className="fact">
                <Icon name="clock" size={14} strokeWidth={2} />
                About 9 days
              </span>
              <span className="fact">Pit loom</span>
              <span className="fact">Desi sheep wool</span>
            </div>
          </div>

          <section aria-labelledby="h-stages" className="col gap-14 pad">
            <h2 id="h-stages" className="h2">
              Six stages, fleece to fringe
            </h2>
            <ol className="stages">
              {STAGES.map((s, i) => (
                  <li key={s.title} className={`stage${s.longest ? ' key' : ''}`}>
                    <div className="stage-rail">
                      <span aria-hidden="true" className="stage-no">
                        {i + 1}
                      </span>
                    </div>
                    <div className="stage-body">
                      <div className="between">
                        <span className="stage-name">{s.title}</span>
                        <span className={`tag ${s.longest ? 'navy' : 'warn'}`}>{s.time}</span>
                      </div>
                      <span className="small-14 ink2">{s.text}</span>
                      {s.art && (
                        <div aria-hidden="true" className="stage-pic" style={{ height: s.art[0], background: s.art[1] }} />
                      )}
                      {s.dyes && (
                        <div aria-hidden="true" className="dyes">
                          {s.dyes.map((color) => (
                            <span key={color} style={{ background: color }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
              ))}
            </ol>
          </section>

          <div className="card weaver inset">
            <div className="weaver-head">
              <Avatar maker={weaver} size={56} />
              <div className="col">
                <span className="eyebrow">Meet the weaver</span>
                <span className="weaver-name">{weaver.name}</span>
                <span className="small muted">
                  {weaver.role} · {weaver.place}
                </span>
              </div>
            </div>
            <p className="small-14 ink2">
              Weaves extra-weft shawls on his family’s pit loom and teaches beginners online.
            </p>
            <Link href={`/shop?q=${encodeURIComponent(weaver.name)}`} className="btn outline sm block">
              Shop his shawls
            </Link>
          </div>

          <Link href={`/courses/${COURSE.id}`} className="promo inset">
            <div className="promo-body roomy">
              <span className="eyebrow gold with-icon">
                <Icon name="award" size={16} />
                Certificate course
              </span>
              <span className="promo-title">Want to weave one yourself?</span>
              <span className="promo-text">
                {weaver.name} teaches a 6-week course, with a tabletop loom sent to your home.
              </span>
              <span className="btn md promo-btn">View the course</span>
            </div>
          </Link>
        </div>
      </main>

      <TabBar active="crafts" />
    </div>
  );
}
