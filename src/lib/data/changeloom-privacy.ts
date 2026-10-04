import { CV_DATA } from '@/lib/cv-data';

/** A string is a paragraph; an array is a bulleted list of labelled items. */
export type PolicyBlock = string | { label: string; text: string }[];

export type PolicySection = { id: string; heading: string; blocks: PolicyBlock[] };

/**
 * Privacy policy for the Changeloom Android app, linked from its Play Store listing.
 * English only, and deliberately left out of the sitemap and navigation.
 */
export const CHANGELOOM_PRIVACY = {
  app: 'Changeloom',
  updated: '2026-10-04',
  intro: [
    `This policy explains what information the Changeloom app ("Changeloom", "the app") collects, how it is used and shared, and the choices you have. Changeloom is developed and operated by ${CV_DATA.name} ("I", "me"), an independent developer based in ${CV_DATA.location}.`,
    'Changeloom shows short summaries of news and changes (such as new releases, guidelines, rules, research findings and offers) for the topics you follow, across many professions and interests. The summaries are written from public sources; your personal information is never used to write them.',
  ],
  sections: [
    {
      id: 'collect',
      heading: 'Information the app collects',
      blocks: [
        [
          {
            label: 'Account information',
            text: 'When you sign in with Google or with an email address and password, Firebase Authentication (a Google service) stores your email address and, for Google sign-in, your name and profile photo. The Changeloom server stores your Firebase account ID and email address. Your name and photo are only shown in the app.',
          },
          {
            label: 'App activity',
            text: 'The professions (up to three) you choose, the topics you follow, the stories you bookmark, the stories you mark as read (with the time), and any topic requests you submit, including the text you write and the reply you receive.',
          },
          {
            label: 'Notification token',
            text: 'If you allow notifications, the app registers a Firebase Cloud Messaging token for your device so it can send alerts about urgent changes in topics you follow.',
          },
          {
            label: 'Usage and diagnostics',
            text: 'In release builds, Google Analytics for Firebase records how the app is used (for example, which screens are opened), Firebase Crashlytics sends crash reports (stack trace, device model, OS and app version), and Firebase Performance Monitoring records performance data such as app start time and network request times. No account ID, name or email is attached to this data.',
          },
          {
            label: 'Advertising',
            text: 'The app shows ads served by Google AdMob. AdMob may collect your device’s advertising ID, IP address and information about ad interactions to show, measure and, where you have consented, personalise ads.',
          },
          {
            label: 'App integrity',
            text: 'Firebase App Check uses Google Play Integrity to confirm that requests come from a genuine copy of the app.',
          },
          {
            label: 'Server logs',
            text: 'Like any web service, the Changeloom server and its hosting provider log technical request details, such as IP address, time and response status, to operate and secure the service.',
          },
        ],
        'Changeloom does not access your contacts, photos, files, microphone, camera or precise location.',
      ],
    },
    {
      id: 'use',
      heading: 'How the information is used',
      blocks: [
        [
          {
            label: 'To run the app',
            text: 'sign you in, build your feed from the topics you follow, and keep your bookmarks and reading progress in sync across devices.',
          },
          {
            label: 'To send notifications',
            text: 'alert you about urgent changes, only if you turn notifications on.',
          },
          {
            label: 'To handle topic requests',
            text: 'review and group requests into new topics. Only the request text, never your account details, is processed with an AI service (Anthropic’s Claude) to do this.',
          },
          {
            label: 'To improve the app',
            text: 'find and fix crashes, measure performance, and understand which features are used.',
          },
          { label: 'To show ads', text: 'which keep the app free.' },
          { label: 'To protect the service', text: 'prevent abuse and keep the service secure.' },
        ],
        'Your information is never sold.',
      ],
    },
    {
      id: 'consent',
      heading: 'Consent and your ad choices',
      blocks: [
        'If you are in the European Economic Area, the United Kingdom or Switzerland, the app asks for your consent through Google’s consent form before ads are personalised or analytics storage is used. Until then, ads and analytics run with consent denied. You can change your choice at any time from Profile → Privacy options.',
        'On any Android device you can reset or delete your advertising ID, or opt out of personalised ads, in your device settings under Google → Ads (or Privacy → Ads).',
        'You can turn notifications off at any time in the app’s Android notification settings.',
      ],
    },
    {
      id: 'sharing',
      heading: 'Service providers',
      blocks: [
        'Information is shared only with the providers that run parts of the service, each under its own privacy terms:',
        [
          {
            label: 'Google (Firebase)',
            text: 'Authentication, Cloud Messaging, Analytics, Crashlytics, Performance Monitoring, Remote Config and App Check.',
          },
          { label: 'Google AdMob', text: 'ads and the consent form.' },
          { label: 'Google Cloud', text: 'hosts the Changeloom server (Singapore region).' },
          { label: 'Neon', text: 'hosts the Changeloom database (on AWS, Singapore region).' },
          {
            label: 'Anthropic',
            text: 'processes the text of topic requests, without your account details.',
          },
        ],
        'Information may also be disclosed if required by law. Your information may be processed outside your country, including in Singapore and the United States.',
      ],
    },
    {
      id: 'retention',
      heading: 'How long information is kept',
      blocks: [
        'Account information, chosen professions, followed topics, bookmarks, read history, topic requests and notification tokens are kept until you delete your account. A notification token is also removed when you sign out of that device. Analytics, crash and ad data are kept by Google under its own retention periods, and server logs are deleted automatically by the hosting provider.',
      ],
    },
    {
      id: 'delete',
      heading: 'Deleting your account and data',
      blocks: [
        'In the app, open Profile and choose Delete account. This permanently deletes your Changeloom account and everything linked to it on the server (chosen professions, followed topics, bookmarks, read history, topic requests and notification tokens), and deletes your Firebase sign-in account.',
        'If you no longer have the app, email the address in the Contact section below from the email address on your account and ask for your account to be deleted. Your account and data will be deleted within 30 days.',
      ],
    },
    {
      id: 'security',
      heading: 'Security',
      blocks: [
        'All traffic between the app and the server is encrypted with HTTPS, and access to the server and database is restricted. No method of transmission or storage is completely secure, but reasonable measures are taken to protect your information.',
      ],
    },
    {
      id: 'rights',
      heading: 'Your rights',
      blocks: [
        'Depending on where you live, you may have the right to access, correct, export or delete your personal information, or to object to or restrict how it is used. To make a request, use the contact details below.',
      ],
    },
    {
      id: 'children',
      heading: 'Children',
      blocks: [
        'Changeloom is a general news app for professionals and people with an interest in a field, and is not directed at children under 13. Personal information is not knowingly collected from children under 13. If you believe a child has provided personal information, get in touch and it will be deleted.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      blocks: [
        'This policy may be updated from time to time. The "Last updated" date at the top shows when it last changed. Please check this page periodically.',
      ],
    },
  ] satisfies PolicySection[],
} as const;
