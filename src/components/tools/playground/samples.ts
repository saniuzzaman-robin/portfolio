export const JAVASCRIPT_SAMPLE = `// Press Run (Ctrl/⌘+Enter). Console output appears in the panel.
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('world'));

const user = { id: 1, name: 'Ada', roles: ['admin', 'dev'], joined: new Date(0) };
console.log('User:', user);

console.table([
  { language: 'JavaScript', year: 1995 },
  { language: 'TypeScript', year: 2012 },
]);

// Top-level await and timers work; the run ends when nothing is left pending.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await sleep(300);
console.info('Done after', 300, 'ms');
`;

export const TYPESCRIPT_SAMPLE = `// Press Run (Ctrl/⌘+Enter). Type errors are shown in the editor and stop the run.
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number };

const area = (shape: Shape): number =>
  shape.kind === 'circle' ? Math.PI * shape.radius ** 2 : shape.width * shape.height;

const shapes: Shape[] = [
  { kind: 'circle', radius: 1 },
  { kind: 'rect', width: 2, height: 3 },
];
console.table(shapes.map((shape) => ({ kind: shape.kind, area: area(shape).toFixed(2) })));

function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
console.log('First:', first(shapes));

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
await sleep(300);
console.info('Done after', 300, 'ms');
`;
