import { CV_DATA } from '@/lib/cv-data';
import type { PolicySection } from '@/lib/data/changeloom-privacy';

/** Terms of Service for the Changeloom Android app. English only, left out of the sitemap and navigation. */
export const CHANGELOOM_TERMS = {
  app: 'Changeloom',
  updated: '2026-10-04',
  intro: [
    `These terms govern your use of the Changeloom Android app ("Changeloom", "the app"), developed and operated by ${CV_DATA.name} ("I", "me"), an independent developer based in ${CV_DATA.location}. By creating an account or using the app you agree to them. If you do not agree, please do not use the app.`,
  ],
  sections: [
    {
      id: 'service',
      heading: 'What Changeloom is',
      blocks: [
        'Changeloom shows short summaries of news and changes (such as new releases, guidelines, rules, research findings and offers) for the topics you follow, across many professions and interests. You can choose your profession, follow topics, bookmark and mark stories as read, receive notifications about urgent changes, and request topics that are not yet covered.',
        'The app is free to use and is supported by ads. Features may change, be limited or be removed at any time.',
      ],
    },
    {
      id: 'accounts',
      heading: 'Your account',
      blocks: [
        'You sign in with Google or with an email address and password. You are responsible for keeping your sign-in details secure and for activity under your account. You must be at least 13 years old to use the app, and you must give accurate information.',
        'You can delete your account at any time from Profile → Delete account. How your information is handled is described in the Privacy Policy.',
      ],
    },
    {
      id: 'content',
      heading: 'Summaries and accuracy',
      blocks: [
        'Summaries are written with the help of AI from public sources, and may be incomplete, out of date or wrong. Changeloom is a convenience for staying informed, not a substitute for the original source, such as official documentation, regulations, guidelines or announcements. Check the original source before you act on a story.',
        'Stories about health, law, finance, safety or any other regulated field are general information only. They are not medical, legal, financial or other professional advice, and they do not create a professional relationship. Always rely on a qualified professional and the official guidance that applies to you.',
        'Product, organisation and brand names, logos and trademarks belong to their owners. Changeloom is not affiliated with or endorsed by them.',
      ],
    },
    {
      id: 'acceptable-use',
      heading: 'Acceptable use',
      blocks: [
        'Please do not:',
        [
          {
            label: 'Misuse the service',
            text: 'attempt to disrupt, overload, probe or gain unauthorised access to the app, the server or other users’ accounts.',
          },
          {
            label: 'Scrape or resell',
            text: 'copy the app’s content in bulk, or use automated means to access the service other than through the app.',
          },
          {
            label: 'Reverse engineer',
            text: 'decompile or tamper with the app, or bypass its integrity checks, except where the law allows it.',
          },
          {
            label: 'Submit harmful requests',
            text: 'use topic requests to send unlawful, abusive or misleading content, or spam.',
          },
        ],
      ],
    },
    {
      id: 'requests',
      heading: 'Topic requests',
      blocks: [
        'When you submit a topic request, you allow me to use the text of the request to review, group and decide on new topics, including by processing it with an AI service. Do not include personal or confidential information in a request. I may decline or change any request, and there is no guarantee that a topic will be added.',
      ],
    },
    {
      id: 'ownership',
      heading: 'Ownership',
      blocks: [
        'The app, its design and its code belong to me, and you are given a personal, non-exclusive, non-transferable licence to use the app for its intended purpose. The source material behind each summary belongs to its original publishers.',
      ],
    },
    {
      id: 'ads-notifications',
      heading: 'Ads and notifications',
      blocks: [
        'The app shows ads served by Google AdMob. I am not responsible for the content of ads or of third-party sites you reach through them or through story links. Notifications are sent only if you allow them, and you can turn them off in your Android settings.',
      ],
    },
    {
      id: 'suspension',
      heading: 'Suspension and ending your use',
      blocks: [
        'You can stop using the app and delete your account at any time. I may suspend or remove access for accounts that break these terms or put the service or other users at risk, and I may stop offering the app altogether.',
      ],
    },
    {
      id: 'disclaimer',
      heading: 'No warranty',
      blocks: [
        'The app is provided "as is" and "as available", without warranties of any kind, whether express or implied, including that it will be uninterrupted, error free or suitable for a particular purpose.',
      ],
    },
    {
      id: 'liability',
      heading: 'Limit of liability',
      blocks: [
        'To the extent the law allows, I am not liable for any indirect or consequential loss, or for any loss arising from decisions you make based on content in the app. Nothing in these terms limits liability that cannot be limited by law.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to these terms',
      blocks: [
        'These terms may be updated from time to time. The "Last updated" date at the top shows when they last changed. If you keep using the app after a change, you accept the updated terms.',
      ],
    },
  ] satisfies PolicySection[],
} as const;
