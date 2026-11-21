'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { COURSES, COURSE_CATS, MAKERS, courseById, courseProgress, inr, lessonCount, plural } from '@/lib/catalog';
import type { Enrolment } from '@/lib/types';

const STEPS = [
  ['Learn', 'Lessons you can follow at home, at your own pace, with the artisan who teaches them.'],
  ['Make', 'Weave, print, tie or stitch a piece of your own as you go.'],
  ['Finish', 'Mark the last lesson done and your certificate is ready to save.'],
];

export default function CoursesView({ enrolments }: { enrolments: Enrolment[] }) {
  const [cat, setCat] = useState<(typeof COURSE_CATS)[number][0]>('all');

  // The course most recently started that still has lessons left.
  const current = enrolments.find((e) => !e.finishedAt);
  const resume = current && courseById(current.id);
  const progress = resume && courseProgress(resume, current.done);

  return (
    <div className="screen">
      <header className="title-head">
        <h1 className="h1">Learn from the makers</h1>
        <p className="muted">Courses taught by the artisans of Kutch.</p>
      </header>

      <main className="scroll">
        <div className="page bleed gap-22">
          {resume && progress?.next && (
            <Link href={`/learn/${resume.id}`} className="promo resume inset">
              <div className="col gap-2">
                <span className="resume-title">{resume.title}</span>
                <span className="small-14 navy-ink">
                  Up next: lesson {progress.next.n}, {progress.next.title}
                </span>
              </div>
              <div aria-hidden="true" className="meter">
                <div style={{ width: `${progress.pct}%` }} />
              </div>
              <div className="between small bold">
                <span>
                  {progress.done} of {progress.total} lessons
                </span>
                <span className="with-icon">
                  Carry on
                  <Icon name="arrow" size={16} strokeWidth={2} />
                </span>
              </div>
            </Link>
          )}

          <section aria-labelledby="h-all" className="col gap-12">
            <h2 id="h-all" className="h2 pad">
              All courses
            </h2>
            <div className="hscroll chip-row">
              {COURSE_CATS.map(([id, label]) => (
                <button key={id} type="button" className="chip" aria-pressed={id === cat} onClick={() => setCat(id)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="col gap-12 pad">
              {COURSES.filter((c) => cat === 'all' || c.cat === cat).map((c) => {
                const mine = enrolments.find((e) => e.id === c.id);
                return (
                  <Link key={c.id} href={`/courses/${c.id}`} className="card course-card">
                    <div aria-hidden="true" className="course-thumb cloth" style={{ background: c.swatch }} />
                    <div className="col grow gap-4">
                      <span className="course-title">{c.title}</span>
                      <span className="small muted">
                        with {MAKERS[c.teacher].name} · {MAKERS[c.teacher].place}
                      </span>
                      <div className="pills">
                        <span className="pill">{c.weeks}</span>
                        <span className="pill">{c.level}</span>
                        <span className={`pill ${c.format === 'Online' ? 'tint' : 'warn'}`}>{c.format}</span>
                      </div>
                      <div className="between course-foot">
                        <span className="small muted">{plural(lessonCount(c), 'lesson')}</span>
                        {mine ? (
                          <span className="small bold green">{mine.finishedAt ? 'Finished' : 'Enrolled'}</span>
                        ) : (
                          <span className="course-price">{inr(c.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="h-how" className="col gap-12 pad">
            <h2 id="h-how" className="h2">
              How the courses work
            </h2>
            <ol className="card how">
              {STEPS.map(([title, text], i) => (
                <li key={title}>
                  <span aria-hidden="true" className="how-no">
                    {i + 1}
                  </span>
                  <span className="col">
                    <span className="bold">{title}</span>
                    <span className="small-14 ink2">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <TabBar active="courses" />
    </div>
  );
}
