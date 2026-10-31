import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeUrl, pageMetadata } from '@/lib/metadata';
import { DEFAULT_LOCALE, toLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';
import { getToolPayload } from '@/i18n/tools/server';
import { SchemaScript } from '@/components/reusable/schema-script';
import { ToolGuide } from '@/components/tools/tool-guide';
import { TOOL_GUIDES } from '@/lib/data/tool-guides';
import { ToolShell } from '@/components/tools/workbench/tool-shell';
import { generateBreadcrumbSchema, generateWebAppSchema } from '@/lib/schema';
import { TOOLS, TOOLS_PATH, findTool, toolPath, toolText } from '@/lib/data/tools';

type Params = Promise<{ lang: string; tool: string }>;

// Only registered tools are prerendered, in English; any other slug or locale 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ lang: DEFAULT_LOCALE, tool: tool.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: rawLang, tool: slug } = await params;
  const tool = findTool(slug);
  if (!tool) return {};
  const lang = toLocale(rawLang);
  const { t } = getDictionary(lang);
  const text = toolText(t, tool.slug);
  return pageMetadata({
    lang,
    title: text.title,
    description: `${text.description} ${t.tools.privacy.seo}`,
    path: toolPath(tool.slug),
    keywords: tool.keywords,
    englishOnly: true,
  });
}

export default async function ToolPage({ params }: { params: Params }) {
  const { lang: rawLang, tool: slug } = await params;
  const tool = findTool(slug);
  if (!tool) notFound();
  const lang = toLocale(rawLang);
  const { t } = getDictionary(lang);
  const text = toolText(t, tool.slug);
  const url = localeUrl(lang, toolPath(tool.slug));
  return (
    <>
      <SchemaScript
        schema={generateBreadcrumbSchema([
          { name: t.meta.home, url: localeUrl(lang, '/') },
          { name: t.tools.label, url: localeUrl(lang, TOOLS_PATH) },
          { name: text.title, url },
        ])}
      />
      <SchemaScript
        schema={generateWebAppSchema({
          name: text.title,
          description: `${text.description} ${t.tools.privacy.seo}`,
          url,
          inLanguage: lang,
        })}
      />
      <ToolShell slug={tool.slug} messages={getToolPayload(tool.slug)} />
      <ToolGuide t={t} title={text.title} guide={TOOL_GUIDES[tool.slug]} />
    </>
  );
}
