import type { SourceFormat } from '@/lib/tools/convert/convert';

/** Starting input per source format; each shows off the features its conversions handle. */
export const SAMPLES: Record<SourceFormat, string> = {
  json: `{
  "service": "api",
  "version": "2.1.0",
  "replicas": 3,
  "requestId": 12345678901234567890,
  "env": { "LOG_LEVEL": "info", "FEATURE_X": "on" },
  "users": [
    { "id": 1, "name": "Ada Lovelace", "email": "ada@example.com", "tags": ["admin", "ops"] },
    { "id": 2, "name": "Linus", "email": null, "tags": [] }
  ]
}
`,
  yaml: `# Comments are dropped in JSON
service: api
replicas: 3
env:
  LOG_LEVEL: info
  FEATURE_X: "on"
ports: [80, 443]
script: |
  npm ci
  npm run build
---
service: worker
replicas: 1
`,
  csv: `id,name,address.city,address.zip,tags.0,note
1,Ada Lovelace,London,007,admin,"Says ""hi"", often"
2,Linus,Helsinki,00100,ops,"Multi-line
note"
`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<catalog updated="2026-10-25">
  <book id="bk101" lang="en">
    <title>XML Developer's Guide</title>
    <price currency="USD">44.95</price>
    <isbn>0012345678</isbn>
  </book>
  <book id="bk102">
    <title>Midnight Rain</title>
    <price currency="EUR">5.95</price>
  </book>
</catalog>
`,
  query:
    'https://example.com/search?q=dev+tools&page=2&tag=json&tag=yaml&filter[lang]=en&filter[sort]=new',
};
