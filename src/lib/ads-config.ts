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
  HOME_BANNER: 'YOUR_SLOT_ID',

  /** About page — between content and footer */
  ABOUT_BANNER: 'YOUR_SLOT_ID',

  /** Blog page — between blog grid and footer */
  BLOG_BANNER: 'YOUR_SLOT_ID',

  /** Projects page — between projects grid and footer */
  PROJECTS_BANNER: 'YOUR_SLOT_ID',

  /** Resume page — between resume content and footer */
  RESUME_BANNER: 'YOUR_SLOT_ID',

  /** Skills page — between skills showcase and footer */
  SKILLS_BANNER: 'YOUR_SLOT_ID',

  /** Game pages — shown inside the game-over / pre-start overlay */
  GAMES_OVERLAY: 'YOUR_SLOT_ID',
} as const;
