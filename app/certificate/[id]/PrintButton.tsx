'use client';

import Icon from '@/components/Icon';

/** The browser's print sheet saves the certificate as a PDF; print styles hide the rest of the screen. */
export default function PrintButton() {
  return (
    <button type="button" className="btn md" onClick={() => window.print()}>
      <Icon name="download" size={18} strokeWidth={2} />
      Download PDF
    </button>
  );
}
