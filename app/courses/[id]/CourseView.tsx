'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon, { WeaveStrip } from '@/components/Icon';
import { Avatar, ShareButton } from '@/components/ui';
import { MAKERS, SW, STORY_MAKER, inr, lessonCount, plural } from '@/lib/catalog';
import type { Course, Enrolment } from '@/lib/types';

export default function CourseView({ course, enrolment }: { course: Course; enrolment: Enrolment | null }) {
  const teacher = MAKERS[course.teacher];
  const lessons = lessonCount(course);
  const [open, setOpen] = useState(0);

  const facts = course.facts ?? [
    ['Duration', course.weeks],
    ['Format', course.format],
    ['Level', course.level],
    ['Lessons', `${lessons}, in ${plural(course.modules.length, 'module')}`],
  ];

  const includes = [
    ...(course.kit ? [course.kit] : []),
    `${lessons} lessons in ${plural(course.modules.length, 'module')}, to follow at your own pace`,
    `Taught by ${teacher.name}, ${teacher.role.toLowerCase()} in ${teacher.place}`,
    'A certificate with your name, the date and its own ID when you finish',
  ];

  return (
    <div className="screen">
      <main className="scroll">
        <div className="course-hero" style={{ background: SW.warp }}>
          <div aria-hidden="true" className="course-band cloth" style={{ background: course.swatch }} />
          <div className="hero-bar">
            <Link href="/courses" className="icon-btn float" aria-label="Back to courses">
              <Icon name="back" size={22} strokeWidth={2} />
            </Link>
            <ShareButton title={course.title} label="Share course" className="icon-btn float" />
          </div>
        </div>

        <div className="page gap-22 top-18">
          <div className="col gap-8">
            <h1 className="title-26">{course.title}</h1>
            <div className="pills">
              <span className="tag warn with-icon">
                <Icon name="award" size={13} strokeWidth={2} />
                With certificate
              </span>
              <span className="tag tint">{course.level}</span>
            </div>
          </div>

          <div className="card person">
            <Avatar maker={teacher} />
            <div className="col grow">
              <span className="small muted">Taught by</span>
              <span className="person-name">{teacher.name}</span>
              <span className="small muted">
                {teacher.role}, {teacher.place}
              </span>
            </div>
            {course.teacher === STORY_MAKER ? (
              <Link href="/crafts/story" className="link">
                Profile
              </Link>
            ) : (
              <Link href={`/shop?q=${encodeURIComponent(teacher.name)}`} className="link">
                Shawls
              </Link>
            )}
          </div>

          <dl className="fact-grid">
            {facts.map(([label, value]) => (
              <div key={label} className="card fact-card">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="h-inc" className="col gap-10">
            <h2 id="h-inc" className="h2 sm">
              What you get
            </h2>
            <ul className="ticks">
              {includes.map((item) => (
                <li key={item}>
                  <Icon name="check" strokeWidth={2.2} className="green" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="h-syl" className="col gap-10">
            <div className="between baseline">
              <h2 id="h-syl" className="h2 sm">
                What you’ll learn
              </h2>
              <span className="small muted">
                {plural(course.modules.length, 'module')} · {plural(lessons, 'lesson')}
              </span>
            </div>
            <div className="card rows">
              {course.modules.map((m, i) => (
                <div key={m.title} className="module">
                  <button
                    type="button"
                    className="row tall"
                    aria-expanded={i === open}
                    onClick={() => setOpen(i === open ? -1 : i)}
                  >
                    <span aria-hidden="true" className={`module-no${i === course.modules.length - 1 ? ' last' : ''}`}>
                      {i + 1}
                    </span>
                    <span className="col grow">
                      <span className="module-title">{m.full ?? m.title}</span>
                      <span className="small muted">{plural(m.lessons.length, 'lesson')}</span>
                    </span>
                    <Icon name="down" size={18} strokeWidth={2} className="muted caret" />
                  </button>
                  {i === open && (
                    <ol className="lessons">
                      {m.lessons.map((lesson) => (
                        <li key={lesson}>{lesson}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="cert-note">
            <WeaveStrip id="weave-course" ground="#1D2756" />
            <div className="cert-note-body">
              <Icon name="award" size={28} className="maroon" />
              <div className="col gap-2">
                <span className="bold">Your certificate</span>
                <span className="small-14 ink2">
                  Ready when you mark the last of the {lessons} lessons done. It carries your name, {teacher.name}’s
                  name and its own ID.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="bottom-bar">
        {enrolment ? (
          <>
            <div className="col">
              <span className="bar-price">{enrolment.finishedAt ? 'Finished' : 'Enrolled'}</span>
              <span className="tiny muted">
                {enrolment.done} of {lessons} lessons
              </span>
            </div>
            <Link href={enrolment.finishedAt ? `/certificate/${course.id}` : `/learn/${course.id}`} className="btn grow">
              {enrolment.finishedAt ? 'See certificate' : enrolment.done ? 'Carry on' : 'Start the first lesson'}
            </Link>
          </>
        ) : (
          <>
            <div className="col">
              <span className="bar-price">{inr(course.price)}</span>
              <span className="tiny muted">{course.kit ? 'Kit included' : course.format}</span>
            </div>
            <Link href={`/courses/${course.id}/enroll`} className="btn grow">
              Enrol
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
