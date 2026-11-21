import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { MAKERS, courseById, courseProgress } from '@/lib/catalog';
import { requireUser } from '@/lib/server/session';

export const metadata: Metadata = { title: 'My courses' };

export default async function Page() {
  const user = await requireUser('/learn');
  const mine = user.courses.flatMap((e) => {
    const course = courseById(e.id);
    return course ? [{ course, enrolment: e, progress: courseProgress(course, e.done) }] : [];
  });

  return (
    <div className="screen">
      <header className="topbar">
        <Link href="/courses" className="icon-btn" aria-label="Back to courses">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <h1 className="topbar-title">My courses</h1>
      </header>

      <main className="scroll">
        {mine.length === 0 ? (
          <div className="empty">
            <span aria-hidden="true" className="empty-icon">
              <Icon name="courses" size={28} />
            </span>
            <span className="empty-title">No courses yet</span>
            <span className="small muted">Learn weaving, dyeing, printing or embroidery from the artisans who do it.</span>
            <Link href="/courses" className="btn md">
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="page gap-12 top-18">
            {mine.map(({ course, enrolment, progress }) => (
              <Link key={course.id} href={`/learn/${course.id}`} className="card course-card">
                <div aria-hidden="true" className="course-thumb cloth" style={{ background: course.swatch }} />
                <div className="col grow gap-6">
                  <span className="course-title">{course.title}</span>
                  <span className="small muted">with {MAKERS[course.teacher].name}</span>
                  <div aria-hidden="true" className="meter light">
                    <div style={{ width: `${progress.pct}%` }} />
                  </div>
                  <span className="small semi">
                    {enrolment.finishedAt
                      ? 'Finished · certificate ready'
                      : `${progress.done} of ${progress.total} lessons`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <TabBar active="courses" />
    </div>
  );
}
