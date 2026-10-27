import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeUrl, pageMetadata } from '@/lib/metadata';
import { DEFAULT_LOCALE, toLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';
import { getToolPayload } from '@/i18n/tools/server';
import { SchemaScript } from '@/components/reusable/schema-script';
import { ToolShell } from '@/components/tools/workbench/tool-shell';
import { generateBreadcrumbSchema, generateWebAppSchema } from '@/lib/schema';
import { TOOLS_PATH, findTool, toolPath, toolText } from '@/lib/data/tools';
import { TOOL_PRESETS, findPreset, presetPath, presetText } from '@/lib/data/tool-presets';

type Params = Promise<{ lang: string; tool: string; preset: string }>;

// Only registered presets are prerendered, in English; any other segment or locale 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return TOOL_PRESETS.map((preset) => ({
    lang: DEFAULT_LOCALE,
    tool: preset.slug,
    preset: preset.key,
  }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: rawLang, tool: slug, preset: key } = await params;
  const preset = findPreset(slug, key);
  const tool = findTool(slug);
  if (!preset || !tool) return {};
  const lang = toLocale(rawLang);
  const { t } = getDictionary(lang);
  const text = presetText(t, preset.key);
  return pageMetadata({
    lang,
    title: text.title,
    description: `${text.description} ${t.tools.privacy.seo}`,
    path: presetPath(preset),
    keywords: [...preset.keywords, ...tool.keywords],
    englishOnly: true,
  });
}

export default async function ToolPresetPage({ params }: { params: Params }) {
  const { lang: rawLang, tool: slug, preset: key } = await params;
  const preset = findPreset(slug, key);
  const tool = findTool(slug);
  if (!preset || !tool) notFound();
  const lang = toLocale(rawLang);
  const { t } = getDictionary(lang);
  const toolLabel = toolText(t, tool.slug);
  const text = presetText(t, preset.key);
  const url = localeUrl(lang, presetPath(preset));
  return (
    <>
      <SchemaScript
        schema={generateBreadcrumbSchema([
          { name: t.meta.home, url: localeUrl(lang, '/') },
          { name: t.tools.label, url: localeUrl(lang, TOOLS_PATH) },
          { name: toolLabel.title, url: localeUrl(lang, toolPath(tool.slug)) },
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
      <ToolShell
        slug={tool.slug}
        messages={getToolPayload(tool.slug)}
        preset={{ title: text.title, params: preset.params }}
      />
    </>
  );
}
