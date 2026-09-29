import type { MetadataRoute } from 'next';
import { CV_DATA } from '@/lib/cv-data';
import { THEME_COLORS } from '@/lib/theme';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${CV_DATA.name} — ${CV_DATA.title}`,
    short_name: 'Robin',
    description: CV_DATA.shortBio,
    start_url: '/',
    display: 'standalone',
    background_color: THEME_COLORS.dark,
    theme_color: THEME_COLORS.dark,
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
