import { photoFromStudio } from '@/lib/server/vendor';

/** Passes one of a shawl's photos through from the vendor's studio. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; n: string }> }) {
  const { id, n } = await params;
  try {
    const photo = await photoFromStudio(id, n);
    if (!photo.ok) return new Response('Not found', { status: 404 });
    return new Response(photo.body, {
      headers: {
        'Content-Type': photo.headers.get('Content-Type') ?? 'image/jpeg',
        // The address carries the shawl's last-saved time, so a changed photo gets a new one.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('The studio can’t be reached', { status: 502 });
  }
}
