import { Container } from '@/components/ui/section';
import { Enter, WordReveal } from '@/components/ui/motion';

/** Shared layout for 404 / error screens. */
export function StatusPage({
  code,
  title,
  description,
  children,
}: {
  code: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative isolate flex flex-1 items-center overflow-hidden py-24">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -z-10 size-[40rem] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
      />
      <Container>
        <div className="flex flex-col items-center text-center">
          <p
            aria-label={code}
            className="flex font-heading text-[7rem] leading-none font-extrabold tracking-tighter sm:text-[10rem]"
          >
            {code.split('').map((digit, i) => (
              <Enter key={i} as="span" direction="pop" delay={i * 0.08} duration={0.8}>
                <span aria-hidden className="text-gradient">
                  {digit}
                </span>
              </Enter>
            ))}
          </p>
          <WordReveal
            as="h1"
            text={title}
            trigger="mount"
            delay={0.3}
            className="mt-4 text-3xl font-bold tracking-tight text-fg sm:text-4xl"
          />
          <Enter
            as="p"
            delay={0.5}
            className="mt-4 max-w-md text-base leading-relaxed text-fg-muted"
          >
            {description}
          </Enter>
          <Enter
            direction="scale"
            delay={0.6}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {children}
          </Enter>
        </div>
      </Container>
    </section>
  );
}
