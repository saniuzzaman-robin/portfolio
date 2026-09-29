import { cn } from '@/lib/cn';
import { DrawLine, Enter, Stagger, StaggerItem, WordReveal } from '@/components/ui/motion';

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>;
}

/**
 * Numbered "notebook" eyebrow: `01 ── Selected work`.
 * Animates (slide + line draw) when placed inside a <Stagger>; static otherwise.
 */
export function Eyebrow({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <StaggerItem
      as="p"
      direction="left"
      className="flex items-center gap-3 font-mono text-xs font-medium tracking-wider text-fg-subtle uppercase"
    >
      {index && <span className="text-primary-text">{index}</span>}
      <DrawLine className="w-8" />
      <span>{children}</span>
    </StaggerItem>
  );
}

type SectionProps = {
  id?: string;
  index?: string;
  label: string;
  title: string;
  /** Trailing words rendered with the brand gradient. */
  accent?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Section({
  id,
  index,
  label,
  title,
  accent,
  description,
  action,
  className,
  children,
}: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn('py-12 sm:py-16', className)}>
      <Container>
        <Stagger
          stagger={0.12}
          className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl space-y-4">
            <Eyebrow index={index}>{label}</Eyebrow>
            <WordReveal
              id={headingId}
              text={title}
              accent={accent}
              trigger="inherit"
              className="text-3xl font-bold tracking-tight text-fg sm:text-4xl md:text-[2.75rem] md:leading-[1.1]"
            />
            {description && (
              <StaggerItem as="p" className="text-base leading-relaxed text-fg-muted sm:text-lg">
                {description}
              </StaggerItem>
            )}
          </div>
          {action && (
            <StaggerItem direction="scale" className="shrink-0">
              {action}
            </StaggerItem>
          )}
        </Stagger>
        {children}
      </Container>
    </section>
  );
}

/** Top-of-page header for inner routes (renders the page's <h1>). */
export function PageHeader({
  label,
  title,
  accent,
  description,
  children,
}: {
  label: string;
  title: string;
  accent?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative isolate overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-x-0 -top-20 -z-10 h-[30rem] opacity-60" />
      <Container className="pt-10 pb-12 sm:pt-16 sm:pb-16">
        {/* Above the fold: CSS entrances so the heading paints without waiting for JS. */}
        <div className="max-w-3xl space-y-5">
          <Enter direction="left">
            <Eyebrow>{label}</Eyebrow>
          </Enter>
          <WordReveal
            as="h1"
            text={title}
            accent={accent}
            trigger="mount"
            delay={0.1}
            className="text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-fg sm:text-6xl"
          />
          {description && (
            <p className="max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
              {description}
            </p>
          )}
          {children && <Enter delay={0.45}>{children}</Enter>}
        </div>
      </Container>
    </header>
  );
}
