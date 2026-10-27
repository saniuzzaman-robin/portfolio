import type { Metadata } from 'next';
import { localeUrl, pageMetadata } from '@/lib/metadata';
import { DEFAULT_LOCALE, toLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';
import { PageHeader } from '@/components/ui/section';
import { ToolsExplorer } from '@/components/tools/tools-explorer';
import { PresetLinks } from '@/components/tools/preset-links';
import { PrivacyNote } from '@/components/tools/privacy-note';
import { Footer } from '@/components/layout/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateBreadcrumbSchema, generateCollectionSchema } from '@/lib/schema';
import { TOOLS, TOOLS_PATH, toolPath, toolText } from '@/lib/data/tools';

// The tools section is English-only; `/bn/tools` and `/ar/tools` are 410 in the proxy.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: DEFAULT_LOCALE }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = toLocale((await params).lang);
  const { t } = getDictionary(lang);
  return pageMetadata({
    lang,
    title: t.meta.toolsTitle,
    description: t.meta.toolsDescription,
    path: TOOLS_PATH,
    keywords: ['developer tools', 'online dev tools', ...TOOLS.flatMap((tool) => tool.keywords)],
    englishOnly: true,
  });
}

export default async function Tools({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLocale((await params).lang);
  const { t } = getDictionary(lang);
  const url = localeUrl(lang, TOOLS_PATH);
  return (
    <>
      <SchemaScript
        schema={generateBreadcrumbSchema([
          { name: t.meta.home, url: localeUrl(lang, '/') },
          { name: t.tools.label, url },
        ])}
      />
      <SchemaScript
        schema={generateCollectionSchema({
          name: t.meta.toolsTitle,
          description: t.meta.toolsCollection,
          url,
          inLanguage: lang,
          items: TOOLS.map((tool) => {
            const text = toolText(t, tool.slug);
            return {
              name: text.title,
              description: text.description,
              url: localeUrl(lang, toolPath(tool.slug)),
            };
          }),
        })}
      />
      <PageHeader
        label={t.tools.label}
        title={t.tools.title}
        accent={t.tools.accent}
        description={t.tools.description}
        compact
      />
      <ToolsExplorer />
      <PresetLinks t={t} />
      <PrivacyNote t={t} />
      <Footer lang={lang} />
    </>
  );
}
