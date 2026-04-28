/**
 * Google AdSense slot IDs
 *
 * Replace each placeholder with the actual ad unit slot ID from your AdSense account:
 *   AdSense → Ads → By ad unit → Create new ad unit → copy the data-ad-slot value
 *
 * Publisher ID: ca-pub-6258584982158882
 */
export const AD_SLOTS = {
  /** Home page — between Featured Projects and CTA */
  HOME_BANNER: '4634816058',

  /** About page — between content and footer */
  ABOUT_BANNER: '1589568399',

  /** Blog page — between blog grid and footer */
  BLOG_BANNER: '4275441487',

  /** Projects page — between projects grid and footer */
  PROJECTS_BANNER: '9499848004',

  /** Resume page — between resume content and footer */
  RESUME_BANNER: '1649278143',

  /** Skills page — between skills showcase and footer */
  SKILLS_BANNER: '7855504558',

  /** Game pages — shown inside the game-over / pre-start overlay */
  GAMES_OVERLAY: '8218555925',
} as const;
