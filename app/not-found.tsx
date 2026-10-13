import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="screen">
      <main className="scroll">
        <div className="empty">
          <h1 className="empty-title">Page not found</h1>
          <p className="small muted">That page isn’t part of Kutch Shawls.</p>
          <Link href="/shop" className="btn md">
            Back to the shop
          </Link>
        </div>
      </main>
    </div>
  );
}
