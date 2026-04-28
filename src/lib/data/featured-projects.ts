export interface FeaturedProject {
  title: string;
  description: string;
  href: string;
  tag: string;
  accent: string;
  number: string;
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    title: 'Prayer Times',
    description:
      'Verified prayer times with geolocation accuracy, Qibla direction, and real-time Adhan notifications',
    href: 'https://app.muslimpro.com/prayer-times',
    tag: 'Geolocation + API',
    accent: '#00ff87',
    number: '01',
  },
  {
    title: 'Islamic Calendar',
    description:
      'Complete Islamic calendar with Hijri dates, Islamic events, and festival schedules',
    href: 'https://app.muslimpro.com/islamic-calendar',
    tag: 'Date Systems',
    accent: '#00d4ff',
    number: '02',
  },
  {
    title: 'Giving Platform',
    description:
      'Charitable giving platform for Badal Hajj, Quranic donations, and community support',
    href: 'https://app.muslimpro.com/giving',
    tag: 'FinTech + UX',
    accent: '#a476ff',
    number: '03',
  },
  {
    title: 'Qalbox',
    description:
      'Video streaming platform with Quranic recitations, tafsir, hadith studies, and Arabic lessons',
    href: 'https://app.muslimpro.com/qalbox',
    tag: 'Streaming + Media',
    accent: '#00ff87',
    number: '04',
  },
];
