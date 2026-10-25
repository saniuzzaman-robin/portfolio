import { LocaleLink } from '@/components/ui/locale-link';
import { Container } from '@/components/ui/section';
import type { Messages } from '@/i18n/messages/en';
import { TOOL_PRESETS, presetPath, presetText } from '@/lib/data/tool-presets';

/** Plain links to every preset page: a quick way in for visitors, and crawlable for search engines. */
export function PresetLinks({ t }: { t: Messages }) {
  return (
    <section aria-labelledby="tools-presets" className="pb-10 sm:pb-14">
      <Container>
        <h2
          id="tools-presets"
          className="mb-3 font-mono text-[11px] font-medium tracking-wider text-fg-subtle uppercase"
        >
          {t.tools.presetsTitle}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {TOOL_PRESETS.map((preset) => (
            <li key={preset.key}>
              <LocaleLink
                href={presetPath(preset)}
                className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-xs text-fg-muted transition-colors hover:border-primary/40 hover:bg-surface-2 hover:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {presetText(t, preset.key).title}
              </LocaleLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
