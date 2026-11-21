import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { MAKERS, certificateId, courseById, longDate } from '@/lib/catalog';
import { requireUser } from '@/lib/server/session';

export const metadata: Metadata = { title: 'Certificates' };

export default async function Page() {
  const user = await requireUser('/certificate');
  const earned = user.courses.flatMap((e) => {
    const course = courseById(e.id);
    return course && e.finishedAt ? [{ course, finishedAt: e.finishedAt }] : [];
  });
  const going = user.courses.find((e) => !e.finishedAt);

  return (
    <div className="screen">
      <header className="topbar">
        <Link href="/profile" className="icon-btn" aria-label="Back to profile">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <h1 className="topbar-title">Certificates</h1>
      </header>

      <main className="scroll">
        {earned.length === 0 ? (
          <div className="empty">
            <span aria-hidden="true" className="empty-icon">
              <Icon name="award" size={28} />
            </span>
            <span className="empty-title">No certificates yet</span>
            <span className="small muted">Finish every lesson of a course and its certificate appears here.</span>
            <Link href={going ? `/learn/${going.id}` : '/courses'} className="btn md">
              {going ? 'Carry on learning' : 'Browse courses'}
            </Link>
          </div>
        ) : (
          <div className="page gap-12 top-18">
            <div className="card rows">
              {earned.map(({ course, finishedAt }) => (
                <Link key={course.id} href={`/certificate/${course.id}`} className="row tall">
                  <Icon name="award" className="maroon" />
                  <span className="col grow">
                    <span className="semi">{course.title}</span>
                    <span className="small muted">
                      {longDate(finishedAt)} · with {MAKERS[course.teacher].name}
                    </span>
                    <span className="tiny muted num">{certificateId(user.email, course.id, finishedAt)}</span>
                  </span>
                  <Icon name="chevron" size={16} strokeWidth={2} className="muted" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
