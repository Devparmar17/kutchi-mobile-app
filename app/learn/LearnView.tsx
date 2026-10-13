'use client';

import Link from 'next/link';
import Icon, { Play } from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { SoonButton } from '@/components/ui';
import { COURSE, LESSON_COUNT, MAKERS, MODULES, courseProgress, weave } from '@/lib/catalog';
import { actions, useStore } from '@/lib/store';

const TEACHER = MAKERS[COURSE.teacher];

// The lesson that is up next; marking it done or undoing that is the one thing this screen changes.
const LESSON = courseProgress(false).next;

// Saturday's live session, 10:00 to 11:00 IST, as a calendar file.
const LIVE_ICS =
  'data:text/calendar;charset=utf-8,' +
  encodeURIComponent(
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kutch Shawls//Courses//EN',
      'BEGIN:VEVENT',
      'UID:live-20261010@kutch-shawls',
      'DTSTAMP:20261005T000000Z',
      'DTSTART:20261010T043000Z',
      'DTEND:20261010T053000Z',
      `SUMMARY:Live with ${TEACHER.name}: ${COURSE.title}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n'),
  );

export default function LearnView() {
  const { lessonDone } = useStore();
  const progress = courseProgress(lessonDone);

  return (
    <div className="screen">
      <header className="topbar">
        <Link href="/courses" className="icon-btn" aria-label="Back to courses">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <div className="col grow">
          <h1 className="topbar-title clip">{COURSE.title}</h1>
          <span className="tiny muted">with {TEACHER.name}</span>
        </div>
      </header>

      <main className="scroll">
        <div className="page gap-20 top-16">
          <section aria-label="Your progress" className="card progress">
            <div className="between baseline">
              <span className="progress-pct">
                <span>{progress.pct}%</span>
                complete
              </span>
              <span className="small semi ink2">
                {progress.done} of {LESSON_COUNT} lessons
              </span>
            </div>
            <div aria-hidden="true" className="segments">
              {progress.modules.map((m) => (
                <div key={m.n}>
                  <div className={m.done === m.total ? 'full' : undefined} style={{ width: `${(m.done / m.total) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="between">
              <span className="small-14 ink2">
                Finish modules {progress.next.module} to {MODULES.length} to earn your certificate
              </span>
              <Link href="/certificate" className="link">
                Preview
              </Link>
            </div>
          </section>

          <section aria-labelledby="h-next" className="col gap-10">
            <h2 id="h-next" className="h2 sm">
              Up next
            </h2>
            <div className="card lesson">
              <div className="lesson-video" style={{ background: weave('medium') }}>
                <SoonButton what="The lesson video" label={`Play lesson ${LESSON.n}`} className="play-btn sm">
                  <Play size={24} />
                </SoonButton>
                <span className="video-time">12:40</span>
              </div>
              <div className="col gap-10 lesson-body">
                <div className="col gap-2">
                  <span className="eyebrow">
                    Module {LESSON.module} · Lesson {LESSON.n}
                  </span>
                  <span className="lesson-title">{LESSON.title}</span>
                  <span className="small muted">Watch, then try it on your tabletop loom.</span>
                </div>
                <button type="button" className="done-btn" aria-pressed={lessonDone} onClick={actions.toggleLesson}>
                  <Icon name="check" size={18} strokeWidth={2.4} />
                  {lessonDone ? 'Done · tap to undo' : 'Mark as done'}
                </button>
              </div>
            </div>
          </section>

          <div className="live">
            <span aria-hidden="true" className="live-date">
              <span>SAT</span>
              <span>10</span>
            </span>
            <div className="col grow">
              <span className="note-title">Live with {TEACHER.name}</span>
              <span className="small ink2">Sat, 10 Oct · 10:00 to 11:00 IST</span>
            </div>
            <a href={LIVE_ICS} download="live-session.ics" className="icon-btn square" aria-label="Add live session to calendar">
              <Icon name="calendar" />
            </a>
          </div>

          <section aria-labelledby="h-task" className="card task">
            <div className="between">
              <span className="eyebrow">Module {LESSON.module} task</span>
              <span className="tag warn">Due Wed, 14 Oct</span>
            </div>
            <h2 id="h-task" className="lesson-title">
              Weave a 10 cm motif sample
            </h2>
            <p className="small-14 ink2">
              Upload two photos, front and back. {TEACHER.name} reviews every sample within 3 days.
            </p>
            <SoonButton what="Uploading photos" className="upload-btn">
              <Icon name="upload" />
              Upload photos
            </SoonButton>
          </section>

          <section aria-labelledby="h-mods" className="col gap-10">
            <h2 id="h-mods" className="h2 sm">
              Modules
            </h2>
            <ol className="card rows">
              {progress.modules.map((m) => {
                const state = m.done === m.total ? 'done' : m.done > 0 ? 'current' : 'idle';
                return (
                  <li key={m.n} className={`row tall mod ${state}`}>
                    <span aria-hidden="true" className="mod-dot">
                      {state === 'done' && <Icon name="check" size={14} strokeWidth={3} />}
                    </span>
                    <span className="col grow">
                      <span className="tiny muted">Module {m.n}</span>
                      <span className="module-title">{m.title}</span>
                    </span>
                    <span className="mod-status">
                      {state === 'done' ? 'Done' : state === 'current' ? `${m.done} of ${m.total}` : 'Not started'}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </main>

      <TabBar active="courses" />
    </div>
  );
}
