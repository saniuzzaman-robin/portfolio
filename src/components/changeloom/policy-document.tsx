import { Container, PageHeader } from '@/components/ui/section';
import { CV_DATA } from '@/lib/cv-data';
import type { PolicyBlock, PolicySection } from '@/lib/data/changeloom-privacy';

function Block({ block }: { block: PolicyBlock }) {
  if (typeof block === 'string') return <p>{block}</p>;
  return (
    <ul className="list-disc space-y-2 ps-5 marker:text-fg-subtle">
      {block.map(({ label, text }) => (
        <li key={label}>
          <span className="font-semibold text-fg">{label}:</span> {text}
        </li>
      ))}
    </ul>
  );
}

/** Legal document for the Changeloom app: English only, so it is always left-to-right. */
export function PolicyDocument({
  app,
  title,
  accent,
  updated,
  intro,
  sections,
  contactText,
}: {
  app: string;
  title: string;
  accent: string;
  updated: string;
  intro: readonly string[];
  sections: readonly PolicySection[];
  contactText: string;
}) {
  const date = new Date(`${updated}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return (
    <div lang="en" dir="ltr">
      <PageHeader
        label={app}
        title={title}
        accent={accent}
        description={<>Last updated {date}</>}
      />
      <Container className="pb-20">
        <article className="space-y-10 text-base leading-relaxed text-fg-muted">
          <div className="space-y-4">
            {intro.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
          {sections.map(({ id, heading, blocks }) => (
            <section key={id} id={id} aria-labelledby={`${id}-heading`} className="space-y-4">
              <h2 id={`${id}-heading`} className="text-xl font-bold tracking-tight text-fg">
                {heading}
              </h2>
              {blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
          <section id="contact" aria-labelledby="contact-heading" className="space-y-4">
            <h2 id="contact-heading" className="text-xl font-bold tracking-tight text-fg">
              Contact
            </h2>
            <p>
              {contactText} {CV_DATA.name} at{' '}
              <a
                href={`mailto:${CV_DATA.email}`}
                className="font-medium text-primary-text underline underline-offset-4"
              >
                {CV_DATA.email}
              </a>
              .
            </p>
          </section>
        </article>
      </Container>
    </div>
  );
}
