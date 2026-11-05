'use client';

import { trackCvDownload, type CvDownloadLocation } from '@/lib/analytics';
import { RESUME_PDF_PATH } from '@/lib/site';

/** Downloads the CV PDF and reports which control was used; for server components. */
export function ResumeDownloadLink({
  location,
  className,
  children,
}: {
  location: CvDownloadLocation;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={RESUME_PDF_PATH}
      download
      className={className}
      onClick={() => trackCvDownload(location)}
    >
      {children}
    </a>
  );
}
