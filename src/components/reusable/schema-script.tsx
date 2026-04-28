/**
 * SchemaScript Component
 * Renders JSON-LD structured data as a script tag
 */

type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
type JsonLdObject = { [key: string]: JsonLdValue };

interface SchemaScriptProps {
  schema: JsonLdObject;
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
