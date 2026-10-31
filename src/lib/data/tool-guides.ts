import type { PresetKey } from './tool-presets';
import type { ToolSlug } from './tools';

/**
 * Written explanations shown under each tool workbench, so every tool and preset URL carries
 * text of its own for readers and search engines. English only, like the tools section.
 */
export type GuideFaq = { q: string; a: string };

export type ToolGuide = {
  about: string;
  /** Typical situations where the tool helps. */
  uses: string[];
  faq: GuideFaq[];
};

export type PresetGuide = {
  about: string;
  faq: GuideFaq[];
};

export const TOOL_GUIDES: Record<ToolSlug, ToolGuide> = {
  json: {
    about:
      'Paste JSON to format, minify or validate it. When the input is invalid, the editor points at the exact line and column of the first problem, and the repair option fixes common mistakes such as trailing commas, single quotes and unquoted keys. Numbers larger than JavaScript can represent are kept digit for digit instead of being rounded.',
    uses: [
      'Making a minified API response readable while debugging',
      'Finding the stray comma that breaks a config file',
      'Querying a large payload with JSONPath instead of scrolling through it',
    ],
    faq: [
      {
        q: 'Why does my JSON fail to parse?',
        a: 'The usual causes are trailing commas, single-quoted strings, unquoted keys, comments and a missing closing bracket. The error message shows the position, and the repair option can fix most of these automatically.',
      },
      {
        q: 'Are large numbers changed when I format?',
        a: 'No. Integers beyond 2^53 would normally lose precision in JavaScript; this tool keeps their original digits, so IDs from databases and APIs come out exactly as they went in.',
      },
      {
        q: 'Is my JSON sent to a server?',
        a: 'No. Parsing, formatting and querying all run in your browser tab, so it is safe to paste payloads that contain private data.',
      },
    ],
  },
  format: {
    about:
      'A single place to beautify or minify source code and data files. Formatting uses Prettier for HTML, CSS, SCSS, Less, JavaScript, TypeScript, JSON, YAML, Markdown and GraphQL, plus a SQL formatter that understands 20 dialects. Minifying works for HTML, CSS, JavaScript, JSON and XML and reports how many bytes you save.',
    uses: [
      'Tidying a snippet before pasting it into a pull request or ticket',
      'Shrinking CSS or JavaScript for a quick size check',
      'Making a one-line SQL query from a log readable',
    ],
    faq: [
      {
        q: 'Which languages can be formatted?',
        a: 'HTML, CSS, SCSS, Less, JavaScript, TypeScript, JSON, XML, SQL, YAML, Markdown and GraphQL. Pick the language from the selector or open one of the dedicated pages for it.',
      },
      {
        q: 'Does minifying change what my code does?',
        a: 'Minifying removes whitespace and comments and, for JavaScript, shortens names with Terser. Behavior is preserved, but always test minified output before shipping it.',
      },
      {
        q: 'What happens with invalid input?',
        a: 'The tool shows the exact position of the syntax error instead of returning a blank result, so you can fix it and run again.',
      },
    ],
  },
  encode: {
    about:
      'Encode and decode text between the formats developers meet most often: Base64, Base32, hexadecimal, binary, URL percent-encoding, HTML entities, Unicode escapes, punycode, quoted-printable and ROT13. Each conversion works in both directions and treats text as UTF-8, so accented letters and emoji survive a round trip. Files can be turned into Base64 or data URIs and back, and a URL parser splits an address into editable parts.',
    uses: [
      'Decoding a Base64 value found in a header or config file',
      'Percent-encoding a query parameter that contains spaces or symbols',
      'Embedding a small image in CSS or HTML as a data URI',
    ],
    faq: [
      {
        q: 'Is Base64 encryption?',
        a: 'No. Base64 only changes how bytes are written so they survive text-only channels. Anyone can decode it, so never use it to protect secrets.',
      },
      {
        q: 'Why does decoded text look garbled?',
        a: 'Usually the original bytes were not UTF-8, or the input was cut off or contains characters outside the encoding alphabet. Check for stray whitespace and the right variant (standard or URL-safe).',
      },
      {
        q: 'Can I encode a file?',
        a: 'Yes. Drop a file to get its Base64 string or a data URI, or paste a Base64 string to get the file back.',
      },
    ],
  },
  jwt: {
    about:
      'Paste a JSON Web Token to see its header, payload and signature split into color-coded parts, with the claims shown in readable form and the expiry status called out. You can verify the signature with a shared secret, a PEM public key, a certificate or a JWK, and sign new tokens using HS, RS, PS, ES or EdDSA algorithms. Everything is computed locally with the Web Crypto API.',
    uses: [
      'Checking why an API rejects a token: expired, wrong audience or bad signature',
      'Reading the claims in an access token during development',
      'Minting a test token with specific claims for a staging environment',
    ],
    faq: [
      {
        q: 'Is it safe to paste a real token here?',
        a: 'The token is decoded in your browser and never sent anywhere. Even so, treat production tokens as credentials and prefer short-lived or test tokens when you can.',
      },
      {
        q: 'Does decoding a JWT prove it is valid?',
        a: 'No. Anyone can read the payload. A token is only trustworthy after its signature is verified with the right key and its claims such as exp, nbf, iss and aud are checked.',
      },
      {
        q: 'Which signing algorithms are supported?',
        a: 'HS256/384/512, RS256/384/512, PS256/384/512, ES256/384/512 and EdDSA.',
      },
    ],
  },
  crypto: {
    about:
      'Compute hashes and HMACs (MD5, SHA-1, SHA-2, SHA-3, Keccak and CRC-32) of text or files, and compare the result with an expected checksum. The same page encrypts and decrypts with AES-GCM, CBC and CTR in a format compatible with OpenSSL and CryptoJS, hashes and verifies passwords with bcrypt, and generates RSA, EC and Ed25519 key pairs as PEM or JWK.',
    uses: [
      'Verifying a downloaded file against its published SHA-256 checksum',
      'Producing a bcrypt hash to seed a test database',
      'Generating a throwaway key pair for signing experiments',
    ],
    faq: [
      {
        q: 'Which hash should I use?',
        a: 'Use SHA-256 or stronger for integrity checks. MD5 and SHA-1 are broken for security purposes and are only suitable for non-adversarial checksums and legacy compatibility.',
      },
      {
        q: 'Can I reverse a hash?',
        a: 'No, hashes are one-way. Short or common inputs can be guessed by brute force, which is why passwords need a slow, salted algorithm like bcrypt.',
      },
      {
        q: 'Are my keys and passphrases stored?',
        a: 'Keys, passwords and passphrases are never saved. They stay in memory in this tab and disappear when you close or reload it.',
      },
    ],
  },
  generate: {
    about:
      'Generate identifiers in bulk: UUIDs (v1, v3, v4, v5, v6 and v7), ULIDs, NanoIDs, MongoDB ObjectIds and random bytes. A decoder shows the version, variant and embedded timestamp of any UUID, ULID or ObjectId you paste. The password mode creates passwords and passphrases and displays their entropy. All randomness comes from the browser cryptographic generator.',
    uses: [
      'Creating test fixtures with unique primary keys',
      'Choosing between random and time-ordered IDs for a new table',
      'Making a strong password without a separate app',
    ],
    faq: [
      {
        q: 'Are the values truly random?',
        a: 'Yes in the sense that matters here: they come from crypto.getRandomValues, the same source browsers use for cryptographic keys, not Math.random.',
      },
      {
        q: 'Which ID format should I pick?',
        a: 'UUID v4 is the default for opaque unique IDs. UUID v7 and ULID start with a timestamp so they sort by creation time, which keeps database indexes efficient. NanoID is shorter and URL-friendly.',
      },
      {
        q: 'Can two generated IDs collide?',
        a: 'For random formats the odds are negligible at any realistic volume. Deterministic UUIDs (v3 and v5) always return the same value for the same namespace and name, by design.',
      },
    ],
  },
  diff: {
    about:
      'Compare two texts or two JSON documents. Text mode highlights changes at line, word or character level in a side-by-side or unified view, collapses unchanged lines and lets you jump between changes. JSON mode compares structure rather than formatting, ignores key order and lists every added, removed and changed path.',
    uses: [
      'Seeing what changed between two API responses',
      'Reviewing a config file edit without opening a Git client',
      'Confirming two JSON exports are equivalent despite different key order',
    ],
    faq: [
      {
        q: 'Does key order matter in JSON mode?',
        a: 'No. Objects are compared by key, so reordered properties are not reported as changes. Array order is treated as meaningful unless you choose to ignore it.',
      },
      {
        q: 'How is this different from a Git diff?',
        a: 'It works on pasted text with no repository, and in JSON mode it understands structure, so formatting-only differences disappear.',
      },
      {
        q: 'Is there a size limit?',
        a: 'Diffing runs in your browser, so the practical limit is your device memory. Very large inputs may take a moment to compare.',
      },
    ],
  },
  convert: {
    about:
      'Convert between JSON, YAML, CSV/TSV, XML and query strings, or generate TypeScript interfaces and Zod schemas from a JSON sample. The converters handle multi-document YAML, quoted CSV fields, nested values flattened into columns and XML attributes, and they keep very large numbers exact.',
    uses: [
      'Turning a Kubernetes or CI YAML file into JSON for scripting',
      'Exporting an API response to CSV for a spreadsheet',
      'Typing an unfamiliar API by generating interfaces from a sample response',
    ],
    faq: [
      {
        q: 'How are nested objects written to CSV?',
        a: 'Nested keys are flattened into columns using dotted paths, so address.city becomes its own column.',
      },
      {
        q: 'Is the generated TypeScript accurate?',
        a: 'It reflects only the sample you provide. Fields missing from the sample, or values that vary between records, will not be captured, so review the types before relying on them.',
      },
      {
        q: 'Do comments survive YAML to JSON?',
        a: 'No. JSON has no comment syntax, so YAML comments are dropped in the conversion.',
      },
    ],
  },
  time: {
    about:
      'Convert Unix timestamps between seconds, milliseconds, microseconds and nanoseconds and human formats such as ISO 8601 and RFC 2822, in any time zone. The same page measures the time between two dates, adds or subtracts durations, and explains cron expressions in plain language with their next run times, including daylight saving transitions. Quartz extensions L, W and # are supported.',
    uses: [
      'Reading a timestamp from a log line or database row',
      'Working out how many days remain until a deadline',
      'Checking when a scheduled job will fire next',
    ],
    faq: [
      {
        q: 'How do I tell seconds from milliseconds?',
        a: 'A current Unix timestamp has 10 digits in seconds and 13 in milliseconds. The converter detects the unit from the length and lets you override it.',
      },
      {
        q: 'Why is my cron job not running when I expect?',
        a: 'Common causes are a server time zone different from yours, mixing 5-field cron with 6-field Quartz syntax, and day-of-month and day-of-week both being set. The explainer lists upcoming runs so you can compare.',
      },
      {
        q: 'Which time zone is used?',
        a: 'Your browser time zone by default, and you can pick any IANA zone to convert to.',
      },
    ],
  },
  regex: {
    about:
      'Test JavaScript regular expressions against sample text with live match highlighting, a table of matches and capture groups, and replace and split previews. A token-by-token explanation breaks the pattern down, and a built-in cheat sheet covers syntax. All flags are supported, including d, v and sticky, as well as named groups.',
    uses: [
      'Building a validation pattern before putting it in code',
      'Writing a find-and-replace using capture groups',
      'Understanding a regular expression someone else wrote',
    ],
    faq: [
      {
        q: 'Which regex flavor is used?',
        a: 'JavaScript (ECMAScript), because the tester runs your pattern with the browser engine. Patterns for PCRE, Python or Java may differ in lookbehind, named group syntax and flags.',
      },
      {
        q: 'Can a pattern freeze my browser?',
        a: 'Patterns with nested quantifiers can backtrack catastrophically on some inputs. If a test hangs, simplify the pattern or anchor it more tightly.',
      },
      {
        q: 'How do I reference a capture group when replacing?',
        a: 'Use $1, $2 and so on, or $<name> for named groups. $& inserts the whole match.',
      },
    ],
  },
  text: {
    about:
      'A set of small text utilities: convert between camelCase, snake_case, kebab-case, Title Case and other styles, build URL slugs, sort and de-duplicate lines, and count words, characters, graphemes and bytes. Strings can be escaped for JSON, JavaScript, SQL, regex, CSV or shell, and a lorem ipsum generator produces placeholder text.',
    uses: [
      'Renaming identifiers when moving between code styles',
      'Checking that copy fits a character limit',
      'Escaping a string before pasting it into a command or query',
    ],
    faq: [
      {
        q: 'Why do characters and bytes differ?',
        a: 'Characters outside basic ASCII take several bytes in UTF-8. The counter reports characters, graphemes (what a reader sees as one symbol) and bytes separately.',
      },
      {
        q: 'What does sorting and de-duplicating lines do?',
        a: 'It reorders the lines alphabetically or numerically and removes repeats, which helps with lists of IDs, hosts or dependencies.',
      },
      {
        q: 'Is my text stored anywhere?',
        a: 'It is kept in your browser local storage so you can return to it, never uploaded, and you can clear it from your browser site data.',
      },
    ],
  },
  color: {
    about:
      'Convert any CSS color between HEX, RGB, HSL, HWB, OKLCH, OKLab and CMYK, pick a color visually, and check its contrast against a background using WCAG 2 ratios and APCA. A tints and shades generator builds a scale from one color. Colors that fall outside the sRGB gamut are flagged so you know the conversion is approximate.',
    uses: [
      'Translating a design token from HEX to OKLCH',
      'Confirming body text meets WCAG AA contrast',
      'Building a lighter and darker scale from a brand color',
    ],
    faq: [
      {
        q: 'What contrast ratio does WCAG require?',
        a: 'WCAG 2 AA asks for at least 4.5:1 for normal text and 3:1 for large text. AAA raises these to 7:1 and 4.5:1.',
      },
      {
        q: 'Why use OKLCH?',
        a: 'OKLCH is perceptually uniform, so changing lightness or chroma behaves predictably, which makes it well suited to generating color scales.',
      },
      {
        q: 'What does out-of-gamut mean?',
        a: 'The color cannot be shown exactly in sRGB. The tool displays the nearest in-gamut value and warns you.',
      },
    ],
  },
  network: {
    about:
      'Calculate IPv4 and IPv6 CIDR blocks: network address, broadcast address, usable host range, netmask, wildcard mask, host count and a binary view, with private and reserved ranges labelled. You can split a block into smaller subnets, and check which blocks in a list contain a given address or overlap each other.',
    uses: [
      'Planning VPC or office network subnets',
      'Checking whether an IP falls inside an allow-list',
      'Finding overlapping ranges in firewall rules',
    ],
    faq: [
      {
        q: 'How many hosts are in a /24?',
        a: 'A /24 has 256 addresses, of which 254 are usable for hosts in IPv4 because the network and broadcast addresses are reserved.',
      },
      {
        q: 'Does it support IPv6?',
        a: 'Yes. IPv6 blocks show their range and size, though there are no broadcast addresses in IPv6.',
      },
      {
        q: 'What is a wildcard mask?',
        a: 'The inverse of the netmask, used in some router and ACL syntaxes. For /24 the netmask is 255.255.255.0 and the wildcard is 0.0.0.255.',
      },
    ],
  },
  'qr-code': {
    about:
      'Make QR codes for plain text, URLs, Wi-Fi networks, contact cards and email. You choose the error correction level, size, quiet zone and colors, with a warning when contrast is too low to scan reliably, and download crisp SVG or PNG files. The code is drawn in your browser, so the data you enter is not uploaded.',
    uses: [
      'Printing a Wi-Fi code for guests',
      'Putting a link on a poster, menu or business card',
      'Sharing contact details that save straight to a phone',
    ],
    faq: [
      {
        q: 'Which error correction level should I use?',
        a: 'Higher levels survive more damage or a logo overlay but make the code denser. Level M is a good default, and Q or H suits printed codes that may get scuffed.',
      },
      {
        q: 'Why will my QR code not scan?',
        a: 'Typical causes are low contrast between the colors, an inverted scheme with a light foreground, a missing quiet zone or a code printed too small for its density.',
      },
      {
        q: 'Do QR codes expire?',
        a: 'No. The code simply contains your data. A code that links to a URL only stops working if that URL does.',
      },
    ],
  },
  markdown: {
    about:
      'Write Markdown on one side and see a live, sanitized preview on the other, with synchronized scrolling. It follows CommonMark and adds GitHub-style tables, task lists and strikethrough. You can copy the generated HTML or download it as a complete page.',
    uses: [
      'Drafting a README or issue before posting it',
      'Converting Markdown notes into HTML for a CMS',
      'Checking how a table or task list will render',
    ],
    faq: [
      {
        q: 'Which Markdown flavor is supported?',
        a: 'CommonMark with GitHub Flavored Markdown extensions: tables, task lists, strikethrough and autolinks.',
      },
      {
        q: 'Is the preview safe against scripts?',
        a: 'Yes. The output is sanitized, so script tags and unsafe attributes are removed before rendering.',
      },
      {
        q: 'Can I export the result?',
        a: 'You can copy the generated HTML or download it as a complete page.',
      },
    ],
  },
  playground: {
    about:
      'Run JavaScript and TypeScript in your browser and watch the console output, with inspected objects, tables, groups and timers. Top-level await works, and TypeScript is checked with the real compiler so type errors show before you run. Code executes in an isolated worker with a time limit, keeping the page responsive.',
    uses: [
      'Trying a snippet without creating a project',
      'Checking how a TypeScript type behaves',
      'Reproducing a bug for a bug report',
    ],
    faq: [
      {
        q: 'Where does my code run?',
        a: 'In a Web Worker inside your browser. It is not sent to a server, and it cannot touch the page itself.',
      },
      {
        q: 'Why did my script stop?',
        a: 'Runs have a time limit so an infinite loop cannot freeze the tab. Reduce the work or break it into smaller steps.',
      },
      {
        q: 'Can I import npm packages?',
        a: 'Not through a package installer. The playground is meant for standard JavaScript and TypeScript running against the browser built-ins.',
      },
    ],
  },
};

export const PRESET_GUIDES: Record<PresetKey, PresetGuide> = {
  'uuid-generator': {
    about:
      'A UUID (also called a GUID) is a 128-bit identifier written as 32 hexadecimal digits in five groups. Version 4 fills almost all of those bits with random data, which makes collisions practically impossible without any coordination between systems. Generate as many as you need, choose upper or lower case, drop the hyphens or wrap them in braces.',
    faq: [
      {
        q: 'Is a GUID the same as a UUID?',
        a: 'Yes. GUID is the name used in the Microsoft ecosystem for the same 128-bit format.',
      },
      {
        q: 'How likely is a duplicate?',
        a: 'With 122 random bits, you would need to generate billions of IDs per second for decades before a collision became likely.',
      },
    ],
  },
  'uuid-v7-generator': {
    about:
      'UUID v7 puts a Unix millisecond timestamp in the first 48 bits and fills the rest with random data. IDs created later sort after earlier ones, which keeps B-tree indexes compact and inserts fast. That makes v7 a better database primary key than fully random v4.',
    faq: [
      {
        q: 'Does a v7 UUID reveal when it was created?',
        a: 'Yes, the creation time is readable from the ID. Avoid v7 where that timestamp would be sensitive.',
      },
      {
        q: 'Can I decode one?',
        a: 'Paste it into the UUID inspector to read its version and timestamp.',
      },
    ],
  },
  'ulid-generator': {
    about:
      'A ULID is a 26-character identifier built from a 48-bit timestamp and 80 bits of randomness, encoded in Crockford Base32. It is URL-safe, case-insensitive and sorts lexicographically by creation time, so it works well as a key in databases and logs.',
    faq: [
      {
        q: 'How is a ULID different from a UUID?',
        a: 'ULIDs are shorter as text, time-sortable and avoid ambiguous characters, while UUIDs are a wider standard with more variants.',
      },
      {
        q: 'Are ULIDs sortable?',
        a: 'Yes. Comparing two ULIDs as strings orders them by creation time to the millisecond.',
      },
    ],
  },
  'password-generator': {
    about:
      'Strong passwords are long and unpredictable. This generator draws every character from the browser cryptographic random source, can build memorable multi-word passphrases, and shows the entropy in bits so you can judge the strength. Nothing is saved, so copy the result into your password manager.',
    faq: [
      {
        q: 'How long should a password be?',
        a: 'Aim for at least 16 random characters, or a passphrase of five or more words, and use a different one for every account.',
      },
      {
        q: 'Does the generator remember my passwords?',
        a: 'No. Generated passwords are never stored or transmitted.',
      },
    ],
  },
  'uuid-decoder': {
    about:
      'Paste a UUID, ULID or MongoDB ObjectId to see what is inside it. For UUIDs the inspector shows the version and variant, and for time-based formats (v1, v6, v7, ULID and ObjectId) it reveals the embedded creation time. Useful when you need to know when a record was created from its ID alone.',
    faq: [
      {
        q: 'Can I tell the age of a v4 UUID?',
        a: 'No. Version 4 is random and holds no timestamp.',
      },
      {
        q: 'What is the UUID variant?',
        a: 'It says which layout the bits follow. Nearly all UUIDs in use are variant 1, defined by RFC 4122 and RFC 9562.',
      },
    ],
  },
  'json-minifier': {
    about:
      'Minifying JSON strips every space, tab and line break that is not part of a string, leaving the smallest valid text. It cuts payload size for network transfer, storage and embedding in URLs or environment variables. Numbers stay exact, and loosely written input such as single quotes or JavaScript-style objects is accepted.',
    faq: [
      {
        q: 'Does minifying change the data?',
        a: 'No. Only formatting whitespace is removed, so the parsed value is identical.',
      },
      {
        q: 'How do I reverse it?',
        a: 'Use the JSON formatter to pretty-print the minified text again.',
      },
    ],
  },
  'json-tree-viewer': {
    about:
      'A tree view lets you explore deeply nested JSON by expanding and collapsing nodes instead of scrolling through brackets. Search to jump to a key or value, and see each node type at a glance. It is most helpful for large API responses where structure matters more than formatting.',
    faq: [
      {
        q: 'Can I search inside the tree?',
        a: 'Yes. Search matches keys and values and expands the branches that contain results.',
      },
      {
        q: 'Does it handle big numbers?',
        a: 'Yes, large integers are shown with their exact digits.',
      },
    ],
  },
  'jsonpath-tester': {
    about:
      'JSONPath is a query language for picking values out of JSON, such as $.store.book[*].author. Paste a document, type an expression and see every match with its path. It is a fast way to build and debug queries before using them in code, configuration or API tools.',
    faq: [
      {
        q: 'What does $ mean?',
        a: 'It is the root of the document. Every JSONPath expression starts from it.',
      },
      {
        q: 'How do I select all items in an array?',
        a: 'Use the wildcard, for example $.items[*], or add a filter such as $.items[?(@.price < 10)].',
      },
    ],
  },
  'json-escape': {
    about:
      'To put text inside a JSON string, characters like quotes, backslashes and line breaks must be escaped. This tool does the escaping for you and can reverse it, which is handy when a payload was double-encoded or when you need to embed a JSON snippet inside another JSON value.',
    faq: [
      {
        q: 'Which characters are escaped?',
        a: 'Double quotes, backslashes and control characters such as newlines and tabs, using sequences like \\n and \\".',
      },
      {
        q: 'Why do I see lots of backslashes?',
        a: 'The text has probably been escaped more than once. Unescape it repeatedly until it reads normally.',
      },
    ],
  },
  'url-encoder': {
    about:
      'URLs may only contain a limited set of characters, so spaces, symbols and non-ASCII letters are written as percent-encoded UTF-8 bytes, for example a space becomes %20. Encode a value before placing it in a query string, or decode a copied link to read it.',
    faq: [
      {
        q: 'What is the difference between encoding a component and a full URL?',
        a: 'Encoding a component also escapes reserved characters like / ? & =, which is right for a single parameter value. Encoding a whole URL leaves those separators intact.',
      },
      {
        q: 'Why does a plus sign sometimes mean a space?',
        a: 'In form-encoded query strings a + stands for a space. In other parts of a URL it is a literal plus.',
      },
    ],
  },
  'html-entity-encoder': {
    about:
      'HTML entities write special characters as safe text, such as &lt; for < and &amp; for &. Encoding is how you show markup as text on a page and avoid breaking HTML, while decoding turns entities back into the characters they represent.',
    faq: [
      {
        q: 'Does encoding prevent XSS?',
        a: 'Encoding output for the right context is a core defense, but it must be applied where the data is inserted. Use your framework escaping rather than manual steps in production.',
      },
      {
        q: 'Are named and numeric entities both supported?',
        a: 'Yes. Both &copy; and &#169; decode to the same character.',
      },
    ],
  },
  'image-to-base64': {
    about:
      'Converting an image to Base64 produces a text string, or a data URI, that you can embed directly in HTML, CSS or JSON without a separate file request. This suits tiny icons and inline email images. Base64 makes data about a third larger, so avoid it for big pictures.',
    faq: [
      {
        q: 'What is a data URI?',
        a: 'A URL that contains the file itself, written as data:image/png;base64, followed by the encoded bytes.',
      },
      {
        q: 'Is my image uploaded?',
        a: 'No. The file is read and encoded locally in your browser.',
      },
    ],
  },
  'url-parser': {
    about:
      'A URL has several parts: protocol, host, port, path, query string and fragment. The parser splits an address into each of them, lists query parameters one per row and lets you edit them, which is faster than reading a long link by eye.',
    faq: [
      {
        q: 'Are query parameters decoded?',
        a: 'Yes, values are shown decoded for reading and are re-encoded when you rebuild the URL.',
      },
      {
        q: 'What is the hash part?',
        a: 'The fragment after #. It is handled by the browser and is not sent to the server.',
      },
    ],
  },
  'jwt-generator': {
    about:
      'Create a signed JSON Web Token by writing the header and payload and choosing an algorithm. HS256 uses a shared secret, while RS256, ES256 and EdDSA sign with a private key. Generated tokens are handy for testing APIs and middleware without standing up a login flow.',
    faq: [
      {
        q: 'Should I use these tokens in production?',
        a: 'No. They are meant for testing. Production tokens should be issued by your auth server with properly managed keys.',
      },
      {
        q: 'What claims should I include?',
        a: 'Commonly iss, sub, aud, iat and exp. Setting an expiry limits the damage if a token leaks.',
      },
    ],
  },
  'bcrypt-generator': {
    about:
      'bcrypt is a deliberately slow, salted password hashing function. Every hash includes a random salt and a cost factor, so identical passwords give different hashes and brute-forcing becomes expensive. Hash a password here, or paste an existing hash to check whether a password matches it.',
    faq: [
      {
        q: 'What cost should I choose?',
        a: 'Pick the highest value your servers can afford. Ten to twelve is a common range today, and each step doubles the work.',
      },
      {
        q: 'Why is the hash different every time?',
        a: 'A new random salt is generated for each hash, and verification reads the salt back from the stored value.',
      },
    ],
  },
  'aes-encryption': {
    about:
      'AES is the standard symmetric cipher: the same key encrypts and decrypts. Enter text and a passphrase to encrypt it, or paste ciphertext to decrypt it. Output is compatible with OpenSSL and CryptoJS, which helps when you need to interoperate with existing scripts.',
    faq: [
      {
        q: 'Which mode should I use?',
        a: 'Prefer AES-GCM, which also authenticates the data and detects tampering. CBC and CTR do not protect against modification on their own.',
      },
      {
        q: 'Is the passphrase stored?',
        a: 'No. It exists only in memory in your browser tab.',
      },
    ],
  },
  'key-pair-generator': {
    about:
      'Public-key cryptography uses a pair of keys: a private key you keep secret and a public key you share. Generate RSA, elliptic-curve (EC) or Ed25519 pairs and export them as PEM text or JWK JSON for use with SSH-style tooling, JWT signing or TLS experiments.',
    faq: [
      {
        q: 'RSA or elliptic-curve?',
        a: 'EC and Ed25519 keys are much smaller and faster for the same security. Use RSA when you need compatibility with older systems; 2048 bits is the minimum.',
      },
      {
        q: 'Where is the private key created?',
        a: 'In your browser with the Web Crypto API. It is never sent anywhere, but treat any key made on a shared machine with care.',
      },
    ],
  },
  'date-difference-calculator': {
    about:
      'Find out how far apart two dates are, expressed in years, months, days, hours, minutes and seconds, as well as totals in each single unit. It is useful for ages, project durations, contract terms and counting down to deadlines.',
    faq: [
      {
        q: 'Are leap years handled?',
        a: 'Yes. The calculation uses the real calendar, so leap days and varying month lengths are counted correctly.',
      },
      {
        q: 'Can I add days to a date instead?',
        a: 'Yes, the date tools also add or subtract a duration from a starting point.',
      },
    ],
  },
  'cron-expression-parser': {
    about:
      'A cron expression packs a schedule into five or six fields, such as 0 9 * * 1-5 for weekdays at nine. This explainer translates it into a plain-language sentence and lists the next run times so you can confirm the schedule before deploying it. Quartz syntax with L, W and # is supported.',
    faq: [
      {
        q: 'What do the five fields mean?',
        a: 'From left to right: minute, hour, day of month, month and day of week.',
      },
      {
        q: 'How is Quartz different from Unix cron?',
        a: 'Quartz adds a seconds field at the start, an optional year, and special characters like L (last), W (nearest weekday) and #.',
      },
    ],
  },
  'json-diff': {
    about:
      'A text diff shows moved whitespace and reordered keys as changes, which is noisy for JSON. This comparison works on structure instead: it lists each added, removed and changed path, and can ignore array order. It is the quickest way to see what really differs between two API responses or config files.',
    faq: [
      {
        q: 'Are key order differences reported?',
        a: 'No. Objects are compared by key, so reordering properties is not a change.',
      },
      {
        q: 'Can I ignore the order of array items?',
        a: 'Yes, enable the option to compare arrays as unordered collections.',
      },
    ],
  },
  'word-counter': {
    about:
      'Count words, characters, sentences and lines while you type. It also reports graphemes and bytes, which matter for platforms with limits measured in characters or bytes, such as SMS, meta descriptions and database columns.',
    faq: [
      {
        q: 'How are words counted?',
        a: 'Words are runs of characters separated by whitespace or punctuation boundaries.',
      },
      {
        q: 'Why does an emoji count differently in bytes?',
        a: 'In UTF-8 an emoji takes four bytes but is one visible symbol, so characters, graphemes and bytes can all differ.',
      },
    ],
  },
  'lorem-ipsum-generator': {
    about:
      'Lorem ipsum is scrambled Latin used as stand-in copy so that designers and developers can judge a layout without being distracted by real content. Choose paragraphs, sentences or words and copy the amount you need for mockups, tests and screenshots.',
    faq: [
      {
        q: 'Does the text mean anything?',
        a: 'It derives from a work by Cicero, but it has been altered so heavily that it is effectively nonsense, which is the point.',
      },
      {
        q: 'Why use placeholder text?',
        a: 'Real copy draws attention to the words. Neutral filler keeps the focus on spacing, hierarchy and typography.',
      },
    ],
  },
  'javascript-minifier': {
    about:
      'JavaScript minification removes whitespace and comments and shortens local variable names, producing a smaller file that downloads and parses faster. This tool uses Terser, the same engine behind many build pipelines, and reports how many bytes you save.',
    faq: [
      {
        q: 'Is minified code safe to run?',
        a: 'Terser preserves behavior, but code that relies on function names or eval can break, so test the output.',
      },
      {
        q: 'Should I minify in the browser or at build time?',
        a: 'Build tools are better for real projects. This page suits quick checks and snippets.',
      },
    ],
  },
  'css-minifier': {
    about:
      'CSS minification deletes comments, extra whitespace and the last semicolon in each rule, shrinking stylesheets without changing how they render. Paste your CSS and see the exact size saved before and after.',
    faq: [
      {
        q: 'Will it merge or reorder my rules?',
        a: 'No. It only removes characters that are not needed, so the cascade stays the same.',
      },
      {
        q: 'How much can I save?',
        a: 'Hand-written CSS often shrinks by 20 to 40 percent. Gzip compression on your server reduces it further.',
      },
    ],
  },
  'html-minifier': {
    about:
      'HTML minification collapses whitespace and removes comments to reduce page weight. It also minifies the inline CSS, JavaScript and JSON blocks inside the document, then reports the size saved.',
    faq: [
      {
        q: 'Does it break whitespace-sensitive content?',
        a: 'Content inside pre and textarea elements is preserved. Inline text spacing can still change slightly, so review the result.',
      },
      {
        q: 'Are inline scripts minified too?',
        a: 'Yes, inline CSS, JavaScript and JSON are minified along with the markup.',
      },
    ],
  },
  'sql-formatter': {
    about:
      'Long SQL written on one line is hard to review. The formatter lays out keywords, joins, conditions and subqueries on separate lines with consistent indentation, and supports 20 dialects including PostgreSQL, MySQL, SQL Server, BigQuery and SQLite.',
    faq: [
      {
        q: 'Does formatting change what the query does?',
        a: 'No. Only whitespace and keyword case change, never the meaning.',
      },
      {
        q: 'Why choose a dialect?',
        a: 'Each database has its own keywords and quoting rules. Picking the right one avoids mis-formatting vendor-specific syntax.',
      },
    ],
  },
  'xml-formatter': {
    about:
      'Pretty-print XML to see its nesting clearly, or minify it to remove the indentation. When the document is malformed, the tool reports the exact position of the error instead of failing silently, which makes broken feeds and SOAP payloads much easier to fix.',
    faq: [
      {
        q: 'What usually makes XML invalid?',
        a: 'Unclosed or mismatched tags, unescaped & or < characters and attributes without quotes.',
      },
      {
        q: 'Does it keep attributes and namespaces?',
        a: 'Yes, they are preserved exactly as written.',
      },
    ],
  },
  'yaml-formatter': {
    about:
      'YAML relies on indentation, so one misplaced space can change the meaning of a file. The formatter normalizes indentation and quoting with Prettier and validates the document, pointing to the exact line and column when it cannot be parsed.',
    faq: [
      {
        q: 'Should I use tabs or spaces in YAML?',
        a: 'Spaces only. Tabs are not allowed for indentation in YAML.',
      },
      {
        q: 'Are comments kept?',
        a: 'Yes, formatting preserves comments.',
      },
    ],
  },
  'json-to-yaml': {
    about:
      'YAML is a superset-friendly, human-oriented format used by Kubernetes, GitHub Actions, Docker Compose and many other tools. Paste JSON to get equivalent YAML with clean indentation, ready to drop into a config file.',
    faq: [
      {
        q: 'Is the conversion lossless?',
        a: 'Yes. Every JSON value has a direct YAML representation, and large numbers keep their exact digits.',
      },
      {
        q: 'Why would I convert to YAML?',
        a: 'YAML is easier to read and allows comments, which suits configuration that people edit by hand.',
      },
    ],
  },
  'yaml-to-json': {
    about:
      'Convert YAML into JSON when a tool, API or script only accepts JSON. Anchors and aliases are resolved, and multi-document YAML files are handled so nothing is dropped.',
    faq: [
      {
        q: 'What happens to YAML comments?',
        a: 'They are removed, since JSON has no comment syntax.',
      },
      {
        q: 'Are anchors and aliases supported?',
        a: 'Yes. Aliased values are expanded into the output.',
      },
    ],
  },
  'json-to-csv': {
    about:
      'CSV opens in any spreadsheet. Convert an array of JSON objects into rows and columns, with keys becoming the header. Nested objects are flattened into dotted column names and values containing commas or quotes are escaped correctly.',
    faq: [
      {
        q: 'What shape of JSON works best?',
        a: 'An array of objects with similar keys. Missing keys leave empty cells.',
      },
      {
        q: 'Can I get tab-separated output?',
        a: 'Yes, the converter also supports TSV.',
      },
    ],
  },
  'csv-to-json': {
    about:
      'Turn spreadsheet exports into JSON for APIs and scripts. The first row is used as the property names, quoted fields containing commas or line breaks are read correctly, and each following row becomes an object.',
    faq: [
      {
        q: 'Are numbers converted automatically?',
        a: 'Check the output types for your data. Values such as ZIP codes or IDs with leading zeros are safer kept as strings.',
      },
      {
        q: 'What if my file uses semicolons?',
        a: 'Choose the matching delimiter, as some regions export CSV with semicolons.',
      },
    ],
  },
  'json-to-typescript': {
    about:
      'Paste a sample JSON response and get TypeScript interfaces that describe it, including nested objects and arrays. It saves the tedious work of typing API payloads by hand and gives you a starting point for strongly typed clients.',
    faq: [
      {
        q: 'Are optional fields detected?',
        a: 'Only from the sample you provide. If a field is absent in some records, mark it optional yourself or include a record that lacks it.',
      },
      {
        q: 'Can it generate Zod schemas too?',
        a: 'Yes, the converter can output a Zod schema for runtime validation.',
      },
    ],
  },
  'xml-to-json': {
    about:
      'Legacy APIs, RSS feeds and SOAP services return XML, while most modern code prefers JSON. This converter maps elements to objects, keeps attributes and handles repeated elements as arrays, producing JSON you can use right away.',
    faq: [
      {
        q: 'How are XML attributes represented?',
        a: 'They are kept alongside child elements in the resulting object, so no information is lost.',
      },
      {
        q: 'What about repeated elements?',
        a: 'Elements that occur more than once under the same parent become an array.',
      },
    ],
  },
  'wifi-qr-code-generator': {
    about:
      'A Wi-Fi QR code lets guests join your network by pointing their camera at it, with no typing. Enter the network name, security type and password, then download the code as SVG or PNG to print or display. The password is used only to draw the code and is never saved.',
    faq: [
      {
        q: 'Which security type should I choose?',
        a: 'Match your router: WPA/WPA2/WPA3 for most home and office networks, or none for an open network.',
      },
      {
        q: 'Is the password sent anywhere?',
        a: 'No. The code is generated in your browser and the password is not stored.',
      },
    ],
  },
  'vcard-qr-code-generator': {
    about:
      'A vCard QR code carries your contact details, so scanning it offers to add you to the phone contacts. Fill in name, phone, email and other fields, then download the result for a business card or email signature.',
    faq: [
      {
        q: 'How much can a vCard hold?',
        a: 'More fields make a denser, harder-to-scan code, so include only what you need.',
      },
      {
        q: 'Will it work on iPhone and Android?',
        a: 'Yes, both open the built-in camera to read it and offer to save the contact.',
      },
    ],
  },
  'md5-hash-generator': {
    about:
      'MD5 produces a 128-bit digest shown as 32 hexadecimal characters. It remains common for quick file checksums and cache keys, but it is cryptographically broken and must not be used for passwords or signatures. Hash text or a file here, and switch to other algorithms with one click.',
    faq: [
      {
        q: 'Is MD5 secure?',
        a: 'No. Collisions can be produced deliberately, so use SHA-256 or better where security matters.',
      },
      {
        q: 'Can I hash a file?',
        a: 'Yes. Drop it in and the digest is computed in your browser without uploading.',
      },
    ],
  },
  'sha256-hash-generator': {
    about:
      'SHA-256 creates a 256-bit digest, written as 64 hexadecimal characters. It is the standard choice for file integrity, content addressing and signatures. Hash text or a file, then compare the result with a published checksum to confirm a download is intact.',
    faq: [
      {
        q: 'How do I verify a download?',
        a: 'Hash the file and compare the result with the checksum on the publisher site. They must match exactly.',
      },
      {
        q: 'Is SHA-256 good for passwords?',
        a: 'Not on its own, because it is fast to brute force. Use bcrypt, scrypt or Argon2 for passwords.',
      },
    ],
  },
  'base32-encoder': {
    about:
      'Base32 represents bytes using 32 letters and digits, avoiding case and ambiguous characters. You will meet it in two-factor authentication secrets, file names and DNS-safe identifiers. Encode text or decode a string, with UTF-8 handled correctly.',
    faq: [
      {
        q: 'Why use Base32 instead of Base64?',
        a: 'It is case-insensitive and safe in file names and URLs, at the cost of being longer.',
      },
      {
        q: 'What is the equals sign at the end?',
        a: 'Padding that rounds the output to a multiple of eight characters.',
      },
    ],
  },
  'hex-encoder': {
    about:
      'Hexadecimal writes each byte as two characters from 0-9 and a-f. Converting text to hex helps when inspecting binary data, debugging protocols or reading memory dumps, and decoding turns a hex string back into text.',
    faq: [
      {
        q: 'Why are some characters more than two hex digits?',
        a: 'Non-ASCII characters are several bytes in UTF-8, and each byte takes two digits.',
      },
      {
        q: 'Does case matter?',
        a: 'No. A-F and a-f represent the same values.',
      },
    ],
  },
  'subnet-splitter': {
    about:
      'Divide a CIDR block into equal smaller subnets, for example splitting a /16 into sixteen /20 networks, and see the range, host count and broadcast address of each. It helps when planning cloud networks or carving address space between teams.',
    faq: [
      {
        q: 'How many subnets can I make?',
        a: 'Each extra prefix bit doubles the count: a /24 splits into two /25s, four /26s, and so on.',
      },
      {
        q: 'Why are two addresses unusable in each IPv4 subnet?',
        a: 'The first is the network address and the last is the broadcast address.',
      },
    ],
  },
  'regex-replace-tester': {
    about:
      'Search-and-replace with regular expressions lets you restructure text using capture groups. Enter a pattern and a replacement, and the result updates live so you can refine it before running it in an editor or script.',
    faq: [
      {
        q: 'How do I reuse a matched group?',
        a: 'Write $1 for the first group, $2 for the second, or $<name> for a named group.',
      },
      {
        q: 'How do I replace every match?',
        a: 'Turn on the g flag. Without it only the first match is replaced.',
      },
    ],
  },
};
