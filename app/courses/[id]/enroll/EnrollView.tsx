'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { send } from '@/components/Form';
import Icon from '@/components/Icon';
import { MAKERS, PAYMENTS, addressLine, inr, lessonCount, plural } from '@/lib/catalog';
import type { Course, PaymentId, User } from '@/lib/types';

// A course is paid for up front, so cash on delivery doesn't apply.
const OPTIONS = PAYMENTS.filter((p) => p.id !== 'cod');

export default function EnrollView({ course, user }: { course: Course; user: User }) {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentId>('upi');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const teacher = MAKERS[course.teacher];
  const needsAddress = Boolean(course.kit) && !user.address;
  const here = `/courses/${course.id}/enroll`;

  async function enrol() {
    setBusy(true);
    setError('');
    const res = await send(`/api/courses/${course.id}/enroll`, 'POST', { pay: payment });
    if (res.ok) {
      router.replace(`/learn/${course.id}`);
      return;
    }
    if (res.status === 401) {
      window.location.assign(`/login?next=${encodeURIComponent(here)}`);
      return;
    }
    setError(res.error?.text ?? 'Couldn’t enrol you. Try again.');
    setBusy(false);
  }

  return (
    <div className="screen">
      <header className="topbar">
        <Link href={`/courses/${course.id}`} className="icon-btn" aria-label="Back to the course">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        <h1 className="topbar-title">Enrol</h1>
        <span className="secure">
          <Icon name="lock" size={16} strokeWidth={2} />
          Secure
        </span>
      </header>

      <main className="scroll">
        <div className="page gap-26 top-18">
          <div className="card course-card">
            <div aria-hidden="true" className="course-thumb cloth" style={{ background: course.swatch }} />
            <div className="col grow gap-4">
              <span className="course-title">{course.title}</span>
              <span className="small muted">
                with {teacher.name} · {course.weeks} · {plural(lessonCount(course), 'lesson')}
              </span>
              <span className="course-price">{inr(course.price)}</span>
            </div>
          </div>

          {course.kit && (
            <section aria-labelledby="h-kit" className="col gap-10">
              <h2 id="h-kit" className="h2 sm">
                Where to post your kit
              </h2>
              <p className="small-14 ink2">{course.kit}.</p>
              {user.address ? (
                <div className="card address">
                  <Icon name="pin" className="muted" />
                  <div className="col grow address-lines">
                    <span className="address-name">{user.name}</span>
                    <span>{addressLine(user.address)}</span>
                  </div>
                  <Link href={`/profile/address?next=${encodeURIComponent(here)}`} className="text-btn">
                    Change
                  </Link>
                </div>
              ) : (
                <Link href={`/profile/address?next=${encodeURIComponent(here)}`} className="card address add">
                  <Icon name="pin" className="maroon" />
                  <span className="col grow">
                    <span className="semi">Add a delivery address</span>
                    <span className="small muted">Needed to post the kit</span>
                  </span>
                  <Icon name="chevron" size={18} strokeWidth={2} className="muted" />
                </Link>
              )}
            </section>
          )}

          <section aria-labelledby="h-pay" className="col gap-10">
            <h2 id="h-pay" className="h2 sm">
              Payment
            </h2>
            <div className="card rows">
              {OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="row tall pay"
                  aria-pressed={p.id === payment}
                  onClick={() => setPayment(p.id)}
                >
                  <span aria-hidden="true" className="radio" />
                  <span className="col grow">
                    <span className="semi">{p.label}</span>
                    <span className="small muted">{p.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <div className="bottom-bar stacked">
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button type="button" className="btn" disabled={busy || needsAddress} onClick={enrol}>
          <Icon name="lock" size={18} strokeWidth={2} />
          {busy ? 'Enrolling…' : `Pay ${inr(course.price)} and enrol`}
        </button>
      </div>
    </div>
  );
}
