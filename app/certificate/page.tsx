import type { Metadata } from 'next';
import Link from 'next/link';
import Icon, { Logo, WeaveStrip } from '@/components/Icon';
import { ShareButton } from '@/components/ui';
import { COURSE, COURSES, MAKERS, firstName } from '@/lib/catalog';
import { requireUser } from '@/lib/server/session';
import PrintButton from './PrintButton';

export const metadata: Metadata = { title: 'Certificate' };

const NEXT = COURSES[1];

export default async function Page() {
  const user = await requireUser('/certificate');
  const teacher = MAKERS[COURSE.teacher];
  const nextTeacher = MAKERS[NEXT.teacher];

  return (
    <div className="screen">
      <header className="topbar plain no-print">
        <Link href="/profile" className="icon-btn" aria-label="Back to profile">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <span className="topbar-title">Certificate</span>
      </header>

      <main className="scroll">
        <div className="page gap-20 top-8">
          <div className="col gap-6 no-print">
            <h1 className="h1 tight">Well woven, {firstName(user.name)}.</h1>
            <p className="ink2 pretty">
              You finished {COURSE.title}, and {teacher.name} approved your final sample.
            </p>
          </div>

          <div className="certificate">
            <WeaveStrip id="weave-cert-top" ground="#1D2756" />
            <div className="certificate-body">
              <Logo size={30} />
              <span className="certificate-kind">Certificate of completion</span>
              <span className="small muted">This certifies that</span>
              <span className="certificate-name">{user.name}</span>
              <span className="small muted">has completed</span>
              <span className="certificate-course">{COURSE.title}</span>
              <span className="certificate-about">
                A 6-week course in extra-weft handloom weaving, with a final sample reviewed by the instructor.
              </span>
              <div className="signatures">
                <div>
                  <span className="signature">{teacher.name}</span>
                  <span aria-hidden="true" className="sign-line" />
                  <span className="tiny muted">
                    {teacher.role}, {teacher.place}
                  </span>
                </div>
                <div>
                  <span aria-hidden="true" className="seal">
                    <Icon name="shield" size={18} strokeWidth={2} />
                  </span>
                  <span aria-hidden="true" className="sign-line" />
                  <span className="tiny muted">Verified by Kutch Shawls</span>
                </div>
              </div>
              <span className="certificate-id num">ID KS-C-2026-0418 · Issued 16 Nov 2026</span>
            </div>
            <WeaveStrip id="weave-cert-bottom" ground="#1D2756" />
          </div>

          <div className="two-up no-print">
            <PrintButton />
            <ShareButton title={`${user.name} · ${COURSE.title} certificate`} className="btn outline md">
              <Icon name="share" size={18} />
              Share
            </ShareButton>
          </div>

          <div className="verify no-print">
            <Icon name="shield" size={18} className="green" />
            <span>
              Employers and studios can check it’s real by entering the certificate ID in the Kutch Shawls app.
            </span>
          </div>

          <Link href={`/courses/${NEXT.id}`} className="card next-course no-print">
            <span aria-hidden="true" className="next-thumb" style={{ background: NEXT.swatch }} />
            <span className="col grow">
              <span className="eyebrow">Keep going</span>
              <span className="bold">{NEXT.title}</span>
              <span className="small muted">
                {NEXT.weeks} · with {nextTeacher.name}, {nextTeacher.place}
              </span>
            </span>
            <Icon name="chevron" size={18} strokeWidth={2} className="muted" />
          </Link>
        </div>
      </main>
    </div>
  );
}
