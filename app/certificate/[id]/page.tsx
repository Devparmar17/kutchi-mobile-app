import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Icon, { Logo, WeaveStrip } from '@/components/Icon';
import { ShareButton } from '@/components/ui';
import { COURSES, MAKERS, certificateId, courseById, firstName, longDate } from '@/lib/catalog';
import { requireUser } from '@/lib/server/session';
import PrintButton from './PrintButton';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: 'Certificate' };

export default async function Page({ params }: Props) {
  const course = courseById((await params).id);
  if (!course) notFound();
  const user = await requireUser(`/certificate/${course.id}`);
  const enrolment = user.courses.find((e) => e.id === course.id);
  // Only a finished course has a certificate; otherwise, back to where the learner got to.
  if (!enrolment?.finishedAt) redirect(enrolment ? `/learn/${course.id}` : `/courses/${course.id}`);

  const teacher = MAKERS[course.teacher];
  const id = certificateId(user.email, course.id, enrolment.finishedAt);
  // A course they haven't taken yet, to suggest next.
  const next = COURSES.find((c) => !user.courses.some((e) => e.id === c.id));
  const nextTeacher = next && MAKERS[next.teacher];

  return (
    <div className="screen">
      <header className="topbar plain no-print">
        <Link href="/certificate" className="icon-btn" aria-label="Back to certificates">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <span className="topbar-title">Certificate</span>
      </header>

      <main className="scroll">
        <div className="page gap-20 top-8">
          <div className="col gap-6 no-print">
            <h1 className="h1 tight">Well done, {firstName(user.name)}.</h1>
            <p className="ink2 pretty">You finished every lesson of {course.title}.</p>
          </div>

          <div className="certificate">
            <WeaveStrip id="weave-cert-top" ground="#1D2756" />
            <div className="certificate-body">
              <Logo size={30} />
              <span className="certificate-kind">Certificate of completion</span>
              <span className="small muted">This certifies that</span>
              <span className="certificate-name">{user.name}</span>
              <span className="small muted">has completed</span>
              <span className="certificate-course">{course.title}</span>
              <span className="certificate-about">{course.about}</span>
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
                  <span className="tiny muted">Kutch Shawls</span>
                </div>
              </div>
              <span className="certificate-id num">
                ID {id} · Issued {longDate(enrolment.finishedAt)}
              </span>
            </div>
            <WeaveStrip id="weave-cert-bottom" ground="#1D2756" />
          </div>

          <div className="two-up no-print">
            <PrintButton />
            <ShareButton title={`${user.name} · ${course.title} certificate`} className="btn outline md">
              <Icon name="share" size={18} />
              Share
            </ShareButton>
          </div>

          {next && nextTeacher && (
            <Link href={`/courses/${next.id}`} className="card next-course no-print">
              <span aria-hidden="true" className="next-thumb cloth" style={{ background: next.swatch }} />
              <span className="col grow">
                <span className="bold">{next.title}</span>
                <span className="small muted">
                  Another course · {next.weeks} with {nextTeacher.name}, {nextTeacher.place}
                </span>
              </span>
              <Icon name="chevron" size={18} strokeWidth={2} className="muted" />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
