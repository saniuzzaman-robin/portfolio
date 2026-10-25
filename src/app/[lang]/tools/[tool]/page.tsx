import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeUrl, pageMetadata } from '@/lib/metadata';
import { toLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';
import { getToolPayload } from '@/i18n/tools/server';
import { SchemaScript } from '@/components/reusable/schema-script';
import { ToolShell } from '@/components/tools/workbench/tool-shell';
import { generateBreadcrumbSchema, generateWebAppSchema } from '@/lib/schema';
import { TOOLS, TOOLS_PATH, findTool, toolPath, toolText } from '@/lib/data/tools';

type Params = Promise<{ lang: string; tool: string }>;

// Only registered tools are prerendered; any other slug 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ tool: tool.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: rawLang, tool: slug } = await params;
  const tool = findTool(slug);
  if (!tool) return {};
  const lang = toLocale(rawLang);
  const text = toolText(getDictionary(lang).t, tool.slug);
  return pageMetadata({
    lang,
    title: text.title,
    description: text.description,
    path: toolPath(tool.slug),
    keywords: tool.keywords,
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
          description: text.description,
          url,
          inLanguage: lang,
        })}
      />
      <ToolShell slug={tool.slug} messages={getToolPayload(lang, tool.slug)} />
    </>
  );
}
