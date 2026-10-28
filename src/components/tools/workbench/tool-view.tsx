'use client';

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { ToolSlug } from '@/lib/data/tools';

/**
 * Each tool is its own `next/dynamic` chunk, so a tool page only downloads its own code
 * and libraries. Register a tool as `slug: dynamic(() => import('@/components/tools/<slug>/…'))`.
 */
const VIEWS: Record<ToolSlug, ComponentType> = {
  json: dynamic(() => import('@/components/tools/json/json-tool').then((mod) => mod.JsonTool)),
  format: dynamic(() =>
    import('@/components/tools/format/format-tool').then((mod) => mod.FormatTool)
  ),
  convert: dynamic(() =>
    import('@/components/tools/convert/convert-tool').then((mod) => mod.ConvertTool)
  ),
  encode: dynamic(() =>
    import('@/components/tools/encode/encode-tool').then((mod) => mod.EncodeTool)
  ),
  jwt: dynamic(() => import('@/components/tools/jwt/jwt-tool').then((mod) => mod.JwtTool)),
  crypto: dynamic(() =>
    import('@/components/tools/crypto/crypto-tool').then((mod) => mod.CryptoTool)
  ),
  generate: dynamic(() =>
    import('@/components/tools/generate/generate-tool').then((mod) => mod.GenerateTool)
  ),
  time: dynamic(() => import('@/components/tools/time/time-tool').then((mod) => mod.TimeTool)),
  diff: dynamic(() => import('@/components/tools/diff/diff-tool').then((mod) => mod.DiffTool)),
  regex: dynamic(() => import('@/components/tools/regex/regex-tool').then((mod) => mod.RegexTool)),
  text: dynamic(() => import('@/components/tools/text/text-tool').then((mod) => mod.TextTool)),
  color: dynamic(() => import('@/components/tools/color/color-tool').then((mod) => mod.ColorTool)),
  network: dynamic(() =>
    import('@/components/tools/network/network-tool').then((mod) => mod.NetworkTool)
  ),
  'qr-code': dynamic(() =>
    import('@/components/tools/qr-code/qr-code-tool').then((mod) => mod.QrCodeTool)
  ),
  markdown: dynamic(() =>
    import('@/components/tools/markdown/markdown-tool').then((mod) => mod.MarkdownTool)
  ),
  playground: dynamic(() =>
    import('@/components/tools/playground/playground-tool').then((mod) => mod.PlaygroundTool)
  ),
};

export function ToolView({ slug }: { slug: ToolSlug }) {
  const View = VIEWS[slug];
  return <View />;
}
