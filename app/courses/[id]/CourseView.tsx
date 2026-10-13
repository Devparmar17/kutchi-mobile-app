'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon, { Play, Star, WeaveStrip } from '@/components/Icon';
import { toast } from '@/components/Toast';
import { Avatar, ShareButton, SoonButton } from '@/components/ui';
import { COURSE, COURSE_DETAIL, LESSON_COUNT, MAKERS, MODULES, STORY_MAKER, SW, inr, plural } from '@/lib/catalog';
import type { Course } from '@/lib/types';

export default function CourseView({ course }: { course: Course }) {
  // Only the enrolled course has its syllabus and extras written up so far.
  const detail = course.id === COURSE.id ? COURSE_DETAIL : null;
  const teacher = MAKERS[course.teacher];
  const [open, setOpen] = useState(0);

  const facts = detail?.facts ?? [
    ['Duration', course.weeks],
    ['Format', course.format],
  ];

  return (
    <div className="screen">
      <main className="scroll">
        <div className="course-hero" style={{ background: SW.warp }}>
          <div aria-hidden="true" className="course-band" style={{ background: course.swatch }} />
          <div className="hero-bar">
            <Link href="/courses" className="icon-btn float" aria-label="Back to courses">
              <Icon name="back" size={22} strokeWidth={2} />
            </Link>
            <ShareButton title={course.title} label="Share course" className="icon-btn float" />
          </div>
          <SoonButton
            what="The course preview"
            label="Watch course preview, 2 minutes 30 seconds"
            className="preview-btn"
          >
            <span aria-hidden="true">
              <Play />
            </span>
            Preview · 2:30
          </SoonButton>
        </div>

        <div className="page gap-22 top-18">
          <div className="col gap-8">
            <div className="pills">
              <span className="tag warn with-icon">
                <Icon name="award" size={13} strokeWidth={2} />
                Certificate course
              </span>
              <span className="tag tint">{course.level}</span>
            </div>
            <h1 className="title-26">{course.title}</h1>
            <span className="course-rating lg">
              <Star size={16} />
              {course.rating}
              <span>
                · {course.reviews} reviews
                {detail && ` · ${detail.learners.toLocaleString('en-IN')} learners`}
              </span>
            </span>
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
            {course.teacher === STORY_MAKER && (
              <Link href="/crafts/story" className="link">
                Profile
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

          {detail && (
            <section aria-labelledby="h-inc" className="col gap-10">
              <h2 id="h-inc" className="h2 sm">
                What you get
              </h2>
              <ul className="ticks">
                {detail.includes.map((item) => (
                  <li key={item}>
                    <Icon name="check" strokeWidth={2.2} className="green" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {detail && (
            <section aria-labelledby="h-syl" className="col gap-10">
              <div className="between baseline">
                <h2 id="h-syl" className="h2 sm">
                  What you’ll learn
                </h2>
                <span className="small muted">
                  {plural(MODULES.length, 'module')} · {plural(LESSON_COUNT, 'lesson')}
                </span>
              </div>
              <div className="card rows">
                {MODULES.map((m, i) => (
                  <div key={m.title} className="module">
                    <button
                      type="button"
                      className="row tall"
                      aria-expanded={i === open}
                      onClick={() => setOpen(i === open ? -1 : i)}
                    >
                      <span aria-hidden="true" className={`module-no${i === MODULES.length - 1 ? ' last' : ''}`}>
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
          )}

          <div className="cert-note">
            <WeaveStrip id="weave-course" ground="#1D2756" />
            <div className="cert-note-body">
              <Icon name="award" size={28} className="maroon" />
              <div className="col gap-2">
                <span className="bold">Your certificate</span>
                <span className="small-14 ink2">
                  Issued when you finish {detail ? `all ${MODULES.length} modules` : 'every module'} and {teacher.name}{' '}
                  approves your final sample.
                </span>
                <Link href="/certificate" className="link">
                  See an example
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="bottom-bar">
        <div className="col">
          <span className="bar-price">{inr(course.price)}</span>
          <span className="tiny muted">{detail?.kit ?? course.format}</span>
        </div>
        {detail ? (
          <Link href="/learn" className="btn grow">
            Enroll now
          </Link>
        ) : (
          <button
            type="button"
            className="btn grow"
            onClick={() => toast(`Enrolment for ${course.title} isn’t open yet`)}
          >
            Enroll now
          </button>
        )}
      </div>
    </div>
  );
}
