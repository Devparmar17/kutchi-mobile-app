'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon, { Star } from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { COURSE, COURSES, COURSE_CATS, MAKERS, MODULES, courseProgress, inr } from '@/lib/catalog';
import { useStore } from '@/lib/store';

const STEPS = [
  ['Learn', 'Video lessons and live Saturday sessions with the artisan.'],
  ['Make', 'Weave, print or stitch your own sample and upload photos.'],
  ['Get certified', 'The artisan reviews your work. You get a certificate anyone can verify.'],
];

export default function CoursesView() {
  const { lessonDone } = useStore();
  const [cat, setCat] = useState<(typeof COURSE_CATS)[number][0]>('all');
  const progress = courseProgress(lessonDone);

  return (
    <div className="screen">
      <header className="title-head">
        <h1 className="h1">Learn from the makers</h1>
        <p className="muted">Certificate courses taught by Kutch artisans.</p>
      </header>

      <main className="scroll">
        <div className="page bleed gap-22">
          <Link href="/learn" className="promo resume inset">
            <div className="between">
              <span className="eyebrow gold">Continue learning</span>
              <span className="small navy-ink">
                Module {progress.next.module} of {MODULES.length}
              </span>
            </div>
            <div className="col gap-2">
              <span className="resume-title">{COURSE.title}</span>
              <span className="small-14 navy-ink">
                Next: Lesson {progress.next.n} · {progress.next.title}
              </span>
            </div>
            <div aria-hidden="true" className="meter">
              <div style={{ width: `${progress.pct}%` }} />
            </div>
            <div className="between small bold">
              <span>{progress.pct}% complete</span>
              <span className="with-icon">
                Resume
                <Icon name="arrow" size={16} strokeWidth={2} />
              </span>
            </div>
          </Link>

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
              {COURSES.filter((c) => cat === 'all' || c.cat === cat).map((c) => (
                <Link key={c.id} href={`/courses/${c.id}`} className="card course-card">
                  <div aria-hidden="true" className="course-thumb" style={{ background: c.swatch }} />
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
                      <span className="course-rating">
                        <Star />
                        {c.rating}
                        <span>({c.reviews})</span>
                      </span>
                      <span className="course-price">{inr(c.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="h-how" className="col gap-12 pad">
            <h2 id="h-how" className="h2">
              How certification works
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
