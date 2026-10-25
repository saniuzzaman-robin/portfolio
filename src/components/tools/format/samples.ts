import type { FormatLanguage } from '@/lib/tools/format/languages';

/** Starting input per language: deliberately cramped, so Beautify has something to show. */
export const SAMPLES: Record<FormatLanguage, string> = {
  html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Demo</title>
<style>body{font-family:system-ui;margin:0}.card{padding:1rem;border:1px solid #ddd}</style></head>
<body><main class="card"><h1>Hello</h1><p>Formatted   <b>locally</b>, nothing uploaded.</p>
<!-- comments go when minifying -->
<script>document.querySelector('h1').addEventListener('click',()=>{alert('hi')})</script></main></body></html>
`,
  css: `.card{display:grid;grid-template-columns:repeat(auto-fill,minmax(12rem,1fr));gap:1rem}
.card:hover{box-shadow:0 1px 2px rgb(0 0 0 / .2)}/* minify keeps calc spaces */
@media (min-width:640px){.card{padding:calc(1rem + 2px)}}
`,
  scss: `$gap: 1rem;
.card{display:grid;gap:$gap; // line comments are fine
&:hover{color:darken(#336699,10%)}
.title{margin:#{$gap} 0}}
`,
  less: `@gap: 1rem;
.card{display:grid;gap:@gap;
&:hover{color:darken(#336699,10%)}
.title{margin:@gap 0}}
`,
  javascript: `import {readFile} from 'node:fs/promises'
export async function loadConfig(path='config.json'){const text=await readFile(path,'utf8');
  const config=JSON.parse(text);return {...config,loadedAt:Date.now()}}
`,
  typescript: `type User={id:number;name:string;email?:string}
export function greet(user:User,greeting='Hello'):string{return \`\${greeting}, \${user.name}!\`}
`,
  json: `{"name":"portfolio","private":true,"scripts":{"dev":"next dev","build":"next build"},"tags":["nextjs","react"]}
`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer's Guide</title>
<price>44.95</price><!-- minify drops comments --></book><book id="bk102"/></catalog>
`,
  sql: `select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = true group by u.id, u.name having count(o.id) > 5 order by orders desc limit 10;
`,
  yaml: `services:
    web:
        image: "nginx:1.27"
        ports: [ "80:80",   "443:443" ]
        environment:
            - TZ=UTC
`,
  markdown: `Format & Minify
===
* Runs   locally
* Uses Prettier

| Tool | Purpose |
|-|-|
| terser | JS minify |
`,
  graphql: `query User($id:ID!){user(id:$id){id name posts(first:5){edges{node{id title}}}}}
`,
};
