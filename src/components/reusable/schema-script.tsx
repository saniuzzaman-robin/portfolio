/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SchemaScript Component
 * Renders JSON-LD structured data as a script tag
 */

interface SchemaScriptProps {
  schema: Record<string, any>;
}

export function SchemaScript({ schema }: SchemaScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
