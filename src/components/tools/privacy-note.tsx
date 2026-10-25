import { HardDrive, ShieldCheck, WifiOff } from 'lucide-react';
import { Container } from '@/components/ui/section';
import type { Messages } from '@/i18n/messages/en';

const POINTS = [
  { key: 'local', icon: ShieldCheck },
  { key: 'noUpload', icon: WifiOff },
  { key: 'stored', icon: HardDrive },
] as const;

/** Tells visitors the tools run on their device, so private input is safe to use. */
export function PrivacyNote({ t }: { t: Messages }) {
  const { privacy } = t.tools;
  return (
    <section aria-labelledby="tools-privacy" className="pb-20 sm:pb-28">
      <Container>
        <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 id="tools-privacy" className="font-heading text-base font-semibold text-fg">
            {privacy.title}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">{privacy.description}</p>
          <ul className="mt-5 grid gap-5 sm:grid-cols-3">
            {POINTS.map(({ key, icon: Icon }) => (
              <li key={key} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary-text">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-fg">{privacy.points[key].title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                    {privacy.points[key].text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
