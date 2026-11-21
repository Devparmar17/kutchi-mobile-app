'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from '@/components/Icon';
import TabBar from '@/components/TabBar';
import { toast } from '@/components/Toast';
import { MAKERS, clockTime, courseProgress, nextLiveSession, shortDate } from '@/lib/catalog';
import type { Course, Enrolment } from '@/lib/types';

/** A calendar file for one live session, for the phone's calendar app. */
function liveCalendar(course: Course, teacher: string, start: number, end: number) {
  const stamp = (t: number) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  return (
    'data:text/calendar;charset=utf-8,' +
    encodeURIComponent(
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Kutch Shawls//Courses//EN',
        'BEGIN:VEVENT',
        `UID:live-${course.id}-${start}@kutch-shawls`,
        // The session's own time, so the link reads the same on the server and the phone.
        `DTSTAMP:${stamp(start)}`,
        `DTSTART:${stamp(start)}`,
        `DTEND:${stamp(end)}`,
        `SUMMARY:Live with ${teacher}: ${course.title}`,
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n'),
    )
  );
}

export default function LearnView({ course, enrolment }: { course: Course; enrolment: Enrolment }) {
  const teacher = MAKERS[course.teacher];
  const [done, setDone] = useState(enrolment.done);
  const [saving, setSaving] = useState(false);
  const progress = courseProgress(course, done);
  const hasLive = course.facts?.some(([label]) => label === 'Live sessions');
  const live = nextLiveSession();

  /** Moves the bookmark forward or back one lesson, and saves it with the account. */
  async function move(to: number) {
    const before = done;
    setDone(to);
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: to }),
      });
      if (!res.ok) throw new Error();
      const data: { finishedAt: number | null } = await res.json();
      if (data.finishedAt && before < to) toast('Course finished. Your certificate is ready.');
    } catch {
      setDone(before);
      toast('Couldn’t save your progress. Try again.');
    }
    setSaving(false);
  }

  return (
    <div className="screen">
      <header className="topbar">
        <Link href="/learn" className="icon-btn" aria-label="Back to my courses">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <div className="col grow">
          <h1 className="topbar-title clip">{course.title}</h1>
          <span className="tiny muted">with {teacher.name}</span>
        </div>
      </header>

      <main className="scroll">
        <div className="page gap-20 top-16">
          <section aria-label="Your progress" className="card progress">
            <div className="between baseline">
              <span className="progress-pct">
                <span className="num">{progress.pct}%</span>
                done
              </span>
              <span className="small semi ink2 num">
                {progress.done} of {progress.total} lessons
              </span>
            </div>
            <div aria-hidden="true" className="segments">
              {progress.modules.map((m) => (
                <div key={m.n}>
                  <div className={m.done === m.total ? 'full' : undefined} style={{ width: `${(m.done / m.total) * 100}%` }} />
                </div>
              ))}
            </div>
            <span className="small-14 ink2">
              {progress.finished
                ? 'Every lesson is done.'
                : `${progress.total - progress.done} lessons to go until your certificate.`}
            </span>
          </section>

          {progress.next ? (
            <section aria-labelledby="h-next" className="card lesson">
              <div aria-hidden="true" className="lesson-art cloth" style={{ background: course.swatch }} />
              <div className="col gap-12 lesson-body">
                <div className="col gap-2">
                  <h2 id="h-next" className="lesson-title">
                    {progress.next.title}
                  </h2>
                  <span className="small muted">
                    Up next · module {progress.next.module}, lesson {progress.next.n}
                  </span>
                </div>
                <button type="button" className="btn md" disabled={saving} onClick={() => move(done + 1)}>
                  <Icon name="check" size={18} strokeWidth={2.4} />
                  Mark as done
                </button>
                {done > 0 && (
                  <button type="button" className="text-btn center" disabled={saving} onClick={() => move(done - 1)}>
                    Undo the last lesson
                  </button>
                )}
              </div>
            </section>
          ) : (
            <section aria-labelledby="h-done" className="card finished">
              <Icon name="award" size={30} className="maroon" />
              <h2 id="h-done" className="lesson-title">
                You finished {course.title}
              </h2>
              <p className="small-14 ink2">Your certificate has your name, {teacher.name}’s, and today’s date.</p>
              <Link href={`/certificate/${course.id}`} className="btn md">
                See your certificate
              </Link>
              <button type="button" className="text-btn center" disabled={saving} onClick={() => move(done - 1)}>
                Undo the last lesson
              </button>
            </section>
          )}

          {hasLive && !progress.finished && (
            <div className="live">
              <span aria-hidden="true" className="live-date">
                <span>{shortDate(live.start).slice(0, 3)}</span>
                <span>{shortDate(live.start).split(' ')[1]}</span>
              </span>
              <div className="col grow">
                <span className="note-title">Live with {teacher.name}</span>
                <span className="small ink2">
                  {shortDate(live.start)} · {clockTime(live.start)} to {clockTime(live.end)} IST
                </span>
              </div>
              <a
                href={liveCalendar(course, teacher.name, live.start, live.end)}
                download="live-session.ics"
                className="icon-btn square"
                aria-label="Add the live session to your calendar"
              >
                <Icon name="calendar" />
              </a>
            </div>
          )}

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
                      <span className="module-title">{m.title}</span>
                      <span className="tiny muted">Module {m.n}</span>
                    </span>
                    <span className="mod-status num">
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
