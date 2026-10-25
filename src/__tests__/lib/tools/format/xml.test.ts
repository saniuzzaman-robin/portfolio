import { describe, it, expect } from 'vitest';
import { formatXml, minifyXml } from '@/lib/tools/format/xml';

const SOURCE = `<?xml version="1.0"?>
<!DOCTYPE note [ <!ENTITY a "x>y"> ]>
<note   id="1"  lang='en'><to>Tove</to>
<!-- greeting -->
<body>Hello <b>you</b> there</body><empty/><blank>  </blank>
<code xml:space="preserve">
  keep
</code><data><![CDATA[ <raw> ]]></data></note>`;

describe('formatXml', () => {
  it('indents element content and keeps text, mixed content and preserved space', () => {
    const result = formatXml(SOURCE, 2);
    expect(result).toEqual({
      ok: true,
      warnings: [],
      text: `<?xml version="1.0"?>
<!DOCTYPE note [ <!ENTITY a "x>y"> ]>
<note id="1" lang='en'>
  <to>Tove</to>
  <!-- greeting -->
  <body>Hello <b>you</b> there</body>
  <empty/>
  <blank>  </blank>
  <code xml:space="preserve">
  keep
</code>
  <data><![CDATA[ <raw> ]]></data>
</note>
`,
    });
  });

  it('indents with tabs', () => {
    expect(formatXml('<a><b/></a>', 'tab')).toMatchObject({ text: '<a>\n\t<b/>\n</a>\n' });
  });
});

describe('minifyXml', () => {
  it('removes comments and whitespace between tags only', () => {
    expect(minifyXml(SOURCE)).toMatchObject({
      ok: true,
      text:
        '<?xml version="1.0"?><!DOCTYPE note [ <!ENTITY a "x>y"> ]>' +
        '<note id="1" lang=\'en\'><to>Tove</to><body>Hello <b>you</b> there</body><empty/>' +
        '<blank>  </blank><code xml:space="preserve">\n  keep\n</code>' +
        '<data><![CDATA[ <raw> ]]></data></note>',
    });
  });
});

describe('XML well-formedness errors', () => {
  it.each([
    ['<a><b></a>', 'Expected </b> but found </a>', 6],
    ['<a>', '<a> is never closed', 0],
    ['</a>', 'Unexpected closing tag </a>', 0],
    ['<a x=1/>', 'Attribute values must be quoted', 5],
    ['<a x="1" x="2"/>', 'Duplicate attribute "x"', 9],
    ['<a x="1"y="2"/>', 'Attributes must be separated by whitespace', 8],
    ['<a><!-- x</a>', 'Unterminated comment', 3],
  ])('%s', (xml, message, from) => {
    expect(minifyXml(xml)).toMatchObject({ ok: false, error: { message, from } });
  });
});
