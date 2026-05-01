import type { AccentToken } from '@/lib/accent';

export type ArticleSectionType =
  | { type: 'paragraph'; content: string }
  | { type: 'heading'; content: string }
  | { type: 'subheading'; content: string }
  | { type: 'code'; language: string; content: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'callout'; variant: 'info' | 'tip' | 'warning'; content: string };

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  color: AccentToken;
  emoji: string;
  tags: string[];
  content: ArticleSectionType[];
}

export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: 'building-scalable-nextjs-applications',
    title: 'Building Scalable Next.js Applications',
    excerpt:
      'Deep dive into architectural patterns and best practices for creating production-grade Next.js applications.',
    category: 'Frontend',
    date: 'Mar 15, 2024',
    readTime: '8 min read',
    color: 'primary',
    emoji: '📚',
    tags: ['Next.js', 'Architecture', 'Performance'],
    content: [
      {
        type: 'paragraph',
        content:
          "After shipping MuslimPro's web platform to 3M+ daily users on Next.js, I've learned that scalability isn't a feature you bolt on at the end — it's a set of deliberate decisions made from day one. This article walks through the patterns that made the difference in production.",
      },
      { type: 'heading', content: 'Choosing the Right Rendering Strategy' },
      {
        type: 'paragraph',
        content:
          'Next.js gives you four rendering strategies per route: Static Site Generation (SSG), Incremental Static Regeneration (ISR), Server-Side Rendering (SSR), and full client-side rendering. The mistake most teams make is reaching for SSR by default.',
      },
      {
        type: 'list',
        items: [
          'SSG — Use for pages whose data rarely changes (marketing pages, blog posts, docs). Zero server cost at runtime.',
          'ISR — Use when data changes periodically but not per-request (prayer times by city, product listings). Set revalidate to match your data freshness requirement.',
          'SSR — Reserve for pages that need per-request personalisation (authenticated dashboards, cart pages).',
          'Client-side — Use for non-critical UI that only appears after interaction (modals, tooltips, preference panels).',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'At MuslimPro we shifted prayer times pages from SSR to ISR with a 6-hour revalidation window. P95 Time-to-First-Byte dropped from 420 ms to 38 ms.',
      },
      { type: 'heading', content: 'Caching at Every Layer' },
      {
        type: 'paragraph',
        content:
          'Next.js 14+ has four distinct caching layers: the Request Memoisation cache (per render), the Data Cache (persistent, cross-request), the Full Route Cache (HTML + RSC payload), and the Router Cache (client-side navigation). Understanding which layer applies to each fetch call is critical.',
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// ISR fetch — revalidate every 6 hours
async function getPrayerTimes(city: string) {
  const res = await fetch(\`/api/prayer-times?city=\${city}\`, {
    next: { revalidate: 21600 },
  });
  return res.json();
}

// Always-fresh fetch — opt out of caching
async function getUserSubscription(userId: string) {
  const res = await fetch(\`/api/subscription/\${userId}\`, {
    cache: 'no-store',
  });
  return res.json();
}`,
      },
      { type: 'heading', content: 'Structuring a Large Next.js Codebase' },
      {
        type: 'paragraph',
        content:
          'As the codebase grows, the default flat structure breaks down. I use a feature-first layout where each major domain owns its routes, components, and data-fetching logic together.',
      },
      {
        type: 'code',
        language: 'text',
        content: `src/
  app/
    (marketing)/         # Route group — no shared layout cost
      page.tsx
    prayer-times/
      page.tsx
      loading.tsx
      error.tsx
  features/
    prayer-times/
      components/
      hooks/
      api.ts             # Server-side data fetching
  components/
    ui/                  # Design system primitives
    layout/              # Navigation, Footer`,
      },
      { type: 'heading', content: 'Parallel Routes and Intercepting Routes' },
      {
        type: 'paragraph',
        content:
          'Two underused App Router features that dramatically reduce complexity: parallel routes let you render multiple independent page segments in one layout (ideal for dashboards), while intercepting routes let you show a modal version of a page without losing the current context.',
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          'We used intercepting routes for the MuslimPro giving platform so clicking a donation item opened a modal detail view, while a direct URL visit rendered the full page — with zero duplicate code.',
      },
      { type: 'heading', content: 'Server Components Are Not Free' },
      {
        type: 'paragraph',
        content:
          'React Server Components eliminate client JS bundle size but introduce their own overhead. Each RSC with a database call adds a sequential waterfall unless you parallelise fetches with Promise.all or use Suspense boundaries strategically.',
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// ❌ Sequential — 3× latency
const user = await getUser(id);
const posts = await getPosts(user.id);
const comments = await getComments(posts[0].id);

// ✅ Parallel where possible
const [user, globalSettings] = await Promise.all([
  getUser(id),
  getGlobalSettings(),
]);
const posts = await getPosts(user.id); // depends on user — must stay sequential`,
      },
      { type: 'heading', content: 'Conclusion' },
      {
        type: 'paragraph',
        content:
          "The patterns above aren't theoretical — they're extracted from running Next.js at scale. Start with ISR by default, cache aggressively, organise by feature, and parallelise your data fetching. The result is an application that stays fast as it grows.",
      },
    ],
  },
  {
    id: 2,
    slug: 'competitive-programming-insights',
    title: 'Competitive Programming Insights',
    excerpt:
      'Techniques and strategies from competitive programming that translate to real-world software engineering.',
    category: 'Algorithms',
    date: 'Mar 10, 2024',
    readTime: '10 min read',
    color: 'secondary',
    emoji: '🎯',
    tags: ['Algorithms', 'Problem Solving', 'Optimization'],
    content: [
      {
        type: 'paragraph',
        content:
          "Having solved 1700+ problems across Codeforces, Codechef, LightOJ, and UVA, I've noticed that the skills competitive programming sharpens are exactly the ones that separate senior engineers from junior ones in production: breaking down ambiguous problems, reasoning about worst-case complexity, and building correct solutions under pressure.",
      },
      { type: 'heading', content: 'BFS/DFS: The Backbone of Half Your Production Problems' },
      {
        type: 'paragraph',
        content:
          "Graph traversal isn't an abstract academic exercise. Every time you compute the shortest deployment path between microservices, find transitive dependencies in a package manager, or determine if two users are connected in a social graph, you're running BFS or DFS in disguise.",
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// BFS for shortest-path in an unweighted dependency graph
function shortestPath(graph: Map<string, string[]>, start: string, end: string): string[] {
  const queue: string[][] = [[start]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path.at(-1)!;

    if (node === end) return path;

    for (const neighbour of graph.get(node) ?? []) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push([...path, neighbour]);
      }
    }
  }
  return []; // no path
}`,
      },
      { type: 'heading', content: 'Dynamic Programming: Memoising Expensive Work' },
      {
        type: 'paragraph',
        content:
          'DP trains you to identify overlapping subproblems. In production this shows up everywhere: computing Fibonacci-style retry backoff, caching intermediate parsing results, or building a diff algorithm.',
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          "The two DP design steps translate directly to production memoisation: (1) define the subproblem clearly, (2) write the recurrence, then (3) replace recursion with a Map/cache. React's useMemo is literally step 3.",
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// Edit distance — powers spell-checkers, git diff, fuzzy search
function editDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}`,
      },
      { type: 'heading', content: 'Binary Search Beyond Sorted Arrays' },
      {
        type: 'paragraph',
        content:
          'The key insight competitive programmers develop early: binary search works on any monotonic predicate, not just sorted arrays. "What\'s the minimum thread count that processes 10k jobs within 1 second?" — binary search. "What\'s the smallest batch size that fits in memory?" — binary search.',
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// Binary search on the answer — find minimum workers to finish in time T
function minWorkers(jobs: number[], timeLimit: number): number {
  const canFinish = (workers: number): boolean => {
    // simulate round-robin assignment
    const workerTime = new Array(workers).fill(0);
    for (const job of jobs) {
      const minIdx = workerTime.indexOf(Math.min(...workerTime));
      workerTime[minIdx] += job;
    }
    return Math.max(...workerTime) <= timeLimit;
  };

  let lo = 1, hi = jobs.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    canFinish(mid) ? (hi = mid) : (lo = mid + 1);
  }
  return lo;
}`,
      },
      { type: 'heading', content: 'Segment Trees: Range Query Patterns in Production' },
      {
        type: 'paragraph',
        content:
          'Competitive programmers learn segment trees for range minimum/sum queries. In production, the same pattern appears in time-series analytics, sliding-window aggregations, and interval scheduling. The mental model — decompose a range into O(log n) precomputed segments — is universally applicable.',
      },
      { type: 'heading', content: 'The Meta-Skill: Reading the Problem Twice' },
      {
        type: 'paragraph',
        content:
          'Perhaps the most transferable skill is disciplined problem decomposition. Top competitive programmers always: (1) restate the problem in their own words, (2) enumerate constraints and edge cases before writing code, (3) identify the algorithmic category, then (4) code. Engineering teams that adopt this discipline ship significantly fewer regressions.',
      },
    ],
  },
  {
    id: 3,
    slug: 'typescript-best-practices',
    title: 'TypeScript Best Practices',
    excerpt:
      'Advanced TypeScript patterns for building type-safe, maintainable applications at scale.',
    category: 'Frontend',
    date: 'Mar 5, 2024',
    readTime: '12 min read',
    color: 'tertiary',
    emoji: '✨',
    tags: ['TypeScript', 'Best Practices', 'Code Quality'],
    content: [
      {
        type: 'paragraph',
        content:
          "TypeScript's type system is far more expressive than most engineers use day-to-day. After years of working across NestJS backends and Next.js/Angular frontends, these are the patterns that have eliminated entire categories of bugs in my codebases.",
      },
      { type: 'heading', content: 'Discriminated Unions Over Optional Fields' },
      {
        type: 'paragraph',
        content:
          'The most common TypeScript anti-pattern I see is using optional fields to represent state. This forces every consumer to check for undefined and invites runtime errors when state combinations are logically impossible.',
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// ❌ Optional fields — invalid states are representable
interface FetchState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
}

// ✅ Discriminated union — only valid states exist
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// TypeScript now narrows correctly inside switch/if
function render<T>(state: FetchState<T>) {
  if (state.status === 'success') {
    return state.data; // T — no undefined check needed
  }
}`,
      },
      { type: 'heading', content: 'Branded Types for Domain Safety' },
      {
        type: 'paragraph',
        content:
          "TypeScript's structural type system means two number aliases are interchangeable by default. Branded types add a nominal flavour, preventing you from accidentally passing a userId where a postId is expected.",
      },
      {
        type: 'code',
        language: 'typescript',
        content: `declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

const toUserId = (id: string): UserId => id as UserId;
const toPostId = (id: string): PostId => id as PostId;

function getPost(id: PostId) { /* ... */ }

const userId = toUserId('abc');
getPost(userId); // ✅ Type error — cannot use UserId as PostId`,
      },
      { type: 'heading', content: 'The satisfies Operator' },
      {
        type: 'paragraph',
        content:
          'Introduced in TypeScript 4.9, satisfies validates a value against a type while preserving the most specific type. This is perfect for config objects and lookup maps.',
      },
      {
        type: 'code',
        language: 'typescript',
        content: `const ROUTES = {
  home: '/',
  blog: '/blog',
  about: '/about',
} satisfies Record<string, string>;

// ROUTES.home is typed as '/' not string — autocomplete works
// And TS still enforces that all values are strings`,
      },
      { type: 'heading', content: 'Template Literal Types for API Contracts' },
      {
        type: 'paragraph',
        content:
          "Template literal types let you encode string constraints that previously lived only in runtime validation. They're particularly powerful for event systems and API route definitions.",
      },
      {
        type: 'code',
        language: 'typescript',
        content: `type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ApiVersion = 'v1' | 'v2';
type ApiRoute = \`/api/\${ApiVersion}/\${string}\`;

type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type ButtonEvents = EventName<'click' | 'hover' | 'focus'>;
// = 'onClick' | 'onHover' | 'onFocus'`,
      },
      { type: 'heading', content: 'Const Assertions and Enum Alternatives' },
      {
        type: 'paragraph',
        content:
          'Avoid TypeScript enums — they generate runtime JavaScript and have several surprising edge cases. Use const objects with as const instead, then derive the union type from the values.',
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// ❌ Enum — emits JS, no tree-shaking, numeric pitfalls
enum Status { Active, Inactive }

// ✅ Const object — zero runtime cost, full type safety
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
// = 'active' | 'inactive'`,
      },
      { type: 'heading', content: 'Infer in Conditional Types' },
      {
        type: 'paragraph',
        content:
          "The infer keyword lets you extract type information from within a conditional type. It's the foundation of utility types like ReturnType, Parameters, and Awaited.",
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// Extract the resolved type of any Promise
type Awaited<T> = T extends Promise<infer R> ? Awaited<R> : T;

// Extract the element type of any array
type ElementType<T> = T extends (infer E)[] ? E : never;

// Extract a specific HTTP handler's response type
type HandlerResponse<T extends (...args: unknown[]) => unknown> =
  Awaited<ReturnType<T>>;`,
      },
    ],
  },
  {
    id: 4,
    slug: 'system-design-for-beginners',
    title: 'System Design for Beginners',
    excerpt:
      'A comprehensive guide to system design concepts, from database selection to caching strategies.',
    category: 'System Design',
    date: 'Feb 28, 2024',
    readTime: '15 min read',
    color: 'primary',
    emoji: '🏗️',
    tags: ['System Design', 'Architecture', 'Scalability'],
    content: [
      {
        type: 'paragraph',
        content:
          'System design interviews frighten engineers because they\'re open-ended. But behind every "design Twitter" question lies a small set of recurring building blocks. Master those blocks and any system becomes approachable. This guide covers the ones that appear most often — drawn from my experience designing systems at MuslimPro that serve 3M+ daily active users.',
      },
      { type: 'heading', content: 'Start With Requirements, Not Solutions' },
      {
        type: 'paragraph',
        content:
          'The biggest mistake in system design is proposing a solution before understanding the constraints. Always clarify first.',
      },
      {
        type: 'list',
        items: [
          'Scale — How many users? Requests per second? Data volume?',
          'Latency — Is this a real-time system (chat, gaming) or can we tolerate seconds (batch reports)?',
          'Consistency — Must all users see the same data immediately, or is eventual consistency acceptable?',
          "Availability — What's the acceptable downtime? 99.9% = ~9 hours/year. 99.99% = ~1 hour/year.",
        ],
      },
      { type: 'heading', content: 'The CAP Theorem in Plain English' },
      {
        type: 'paragraph',
        content:
          "A distributed system can only guarantee two of three properties simultaneously: Consistency (all nodes see the same data), Availability (every request gets a response), and Partition Tolerance (the system works despite network splits). Since network partitions are inevitable, you're always choosing between CP and AP.",
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          "Prayer times data at MuslimPro is AP — we'd rather show slightly stale times than block requests during a network partition. User account data is CP — a user must never see a stale subscription state that lets them access paid content they haven't purchased.",
      },
      { type: 'heading', content: 'Horizontal vs Vertical Scaling' },
      {
        type: 'paragraph',
        content:
          'Vertical scaling (bigger machine) is simple but has a hard ceiling and creates a single point of failure. Horizontal scaling (more machines) is infinitely extensible but introduces distributed complexity: you need a load balancer, stateless services, and external session storage.',
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'Design services to be stateless from day one. Store sessions in Redis, not in memory. This makes horizontal scaling a configuration change, not a refactor.',
      },
      { type: 'heading', content: 'Caching Strategies' },
      {
        type: 'paragraph',
        content:
          'Caching is the single highest-leverage performance tool. There are five common strategies, each suited to different data patterns.',
      },
      {
        type: 'list',
        items: [
          'Cache-aside (Lazy loading) — Application checks cache first, fetches DB on miss, populates cache. Best for read-heavy workloads with irregular access patterns.',
          'Write-through — Write to cache and DB simultaneously. Ensures cache is always warm but adds write latency.',
          'Write-behind (Write-back) — Write to cache immediately, flush to DB asynchronously. High write throughput but risk of data loss on crash.',
          'Read-through — Cache sits in front of DB; on miss, the cache itself fetches and stores. Good for uniform access.',
          'Refresh-ahead — Pre-populate cache before expiry for predictable access patterns (e.g., prayer times at dawn).',
        ],
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// Cache-aside pattern with Redis in NestJS
@Injectable()
export class PrayerTimesService {
  constructor(
    private readonly redis: RedisService,
    private readonly db: PrayerTimesRepository,
  ) {}

  async getByCity(city: string): Promise<PrayerTimes> {
    const key = \`prayer:\${city}\`;
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);

    const data = await this.db.findByCity(city);
    await this.redis.set(key, JSON.stringify(data), 'EX', 21600); // 6h TTL
    return data;
  }
}`,
      },
      { type: 'heading', content: 'Database Selection' },
      {
        type: 'paragraph',
        content: 'No database is universally best. Choose based on your access patterns.',
      },
      {
        type: 'list',
        items: [
          'PostgreSQL — ACID compliance, complex queries, relationships. Default choice for most transactional data.',
          'MongoDB — Flexible schema, nested documents, fast iteration. Good for content management and catalogs.',
          'Redis — In-memory key/value. Sessions, caching, rate limiting, pub/sub.',
          'Elasticsearch — Full-text search, log aggregation, faceted filtering.',
          'ClickHouse / TimescaleDB — Time-series analytics, high-throughput event ingestion.',
        ],
      },
      { type: 'heading', content: 'Message Queues for Async Decoupling' },
      {
        type: 'paragraph',
        content:
          "When a request triggers work that can happen asynchronously (sending emails, processing payments, generating thumbnails), don't do it in the request handler. Put a message on a queue and process it in a worker. This keeps response times fast and makes the system resilient to spikes.",
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// NestJS Bull queue — fire and forget
@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcome(user: User): Promise<void> {
    await this.emailQueue.add('welcome', { userId: user.id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
    // Returns immediately — email sent asynchronously
  }
}`,
      },
    ],
  },
  {
    id: 5,
    slug: 'react-performance-optimization',
    title: 'React Performance Optimization',
    excerpt: 'Techniques for identifying and fixing performance bottlenecks in React applications.',
    category: 'Frontend',
    date: 'Feb 20, 2024',
    readTime: '9 min read',
    color: 'secondary',
    emoji: '⚡',
    tags: ['React', 'Performance', 'Optimization'],
    content: [
      {
        type: 'paragraph',
        content:
          'Most React performance problems share a root cause: unnecessary re-renders and excessive JavaScript on the main thread. This guide covers the profiling workflow and the targeted fixes that actually matter — skipping the premature micro-optimisations that slow down development without improving UX.',
      },
      { type: 'heading', content: 'Profile Before You Optimise' },
      {
        type: 'paragraph',
        content:
          'Never guess at performance problems. Open React DevTools → Profiler, record an interaction, and look at which components render, how often, and why. The "why did this render?" feature is invaluable.',
      },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'Lighthouse scores measure perceived performance (LCP, FID, CLS), not React render frequency. A component that re-renders 100 times might not show up in Lighthouse at all — use the React Profiler for component-level analysis.',
      },
      { type: 'heading', content: "React.memo: When It Helps and When It Doesn't" },
      {
        type: 'paragraph',
        content:
          'React.memo prevents a component from re-rendering when its props are referentially equal to the previous render. But it only helps when: (1) the component is expensive to render, and (2) its parent re-renders frequently with the same prop values.',
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// ❌ memo is useless here — inline objects are new references every render
function Parent() {
  return <ExpensiveChild config={{ theme: 'dark' }} />;
}

// ✅ Stable reference — memo can now bail out
const config = { theme: 'dark' }; // outside component, or useMemo

function Parent() {
  return <ExpensiveChild config={config} />;
}

const ExpensiveChild = React.memo(({ config }: { config: Config }) => {
  // Only re-renders when config reference changes
});`,
      },
      { type: 'heading', content: 'useMemo and useCallback: The 80/20 Rule' },
      {
        type: 'paragraph',
        content:
          "Both hooks have a cost: they allocate closures and run comparison logic every render. Only use them when: (1) you\'re passing a value to a memo\'d component, (2) the computation is genuinely expensive (> 1ms), or (3) the value is a dependency of another hook.",
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// ✅ useMemo for expensive derivation
const sortedItems = useMemo(
  () => items.slice().sort((a, b) => a.score - b.score),
  [items] // only re-sort when items changes
);

// ✅ useCallback for stable event handler passed to memo'd child
const handleSelect = useCallback(
  (id: string) => dispatch({ type: 'SELECT', id }),
  [dispatch] // dispatch from useReducer is stable
);

// ❌ Don't bother memoising cheap values
const label = useMemo(() => \`Hello, \${name}\`, [name]); // wasteful`,
      },
      { type: 'heading', content: 'Virtualisation for Long Lists' },
      {
        type: 'paragraph',
        content:
          'Rendering 10,000 DOM nodes is slow regardless of how well your React code is written. Virtual lists render only the visible subset — typically 20-50 items — and recycle DOM nodes as the user scrolls. Use @tanstack/react-virtual or react-window.',
      },
      {
        type: 'code',
        language: 'typescript',
        content: `import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualiser = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // estimated row height in px
  });

  return (
    <div ref={parentRef} style={{ overflow: 'auto', height: '600px' }}>
      <div style={{ height: virtualiser.getTotalSize() }}>
        {virtualiser.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{ transform: \`translateY(\${virtualItem.start}px)\` }}
          >
            <ItemRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}`,
      },
      { type: 'heading', content: 'Code Splitting and Lazy Loading' },
      {
        type: 'paragraph',
        content:
          "The fastest code is code that never loads. Use next/dynamic (Next.js) or React.lazy for routes and heavy components that aren't needed on initial load.",
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// next/dynamic with no SSR for client-only heavy libraries
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

// Only loaded when the user opens the modal
const HeavyModal = dynamic(() => import('@/components/HeavyModal'));`,
      },
      { type: 'heading', content: 'Concurrent Features: useTransition and useDeferredValue' },
      {
        type: 'paragraph',
        content:
          "React 18\'s concurrent features let you mark state updates as non-urgent, keeping the UI responsive during expensive renders. Use useTransition for navigation/filter updates, and useDeferredValue to debounce derived expensive renders.",
      },
      {
        type: 'code',
        language: 'typescript',
        content: `const [isPending, startTransition] = useTransition();

function handleSearch(query: string) {
  setInputValue(query); // urgent — update input immediately
  startTransition(() => {
    setSearchQuery(query); // non-urgent — can be interrupted
  });
}

// In the component that renders search results
const deferredQuery = useDeferredValue(searchQuery);
// Results render with the old query while new results compute`,
      },
    ],
  },
  {
    id: 6,
    slug: 'docker-and-containerization',
    title: 'Docker and Containerization',
    excerpt: 'Getting started with Docker for development and deployment of applications.',
    category: 'DevOps',
    date: 'Feb 15, 2024',
    readTime: '11 min read',
    color: 'tertiary',
    emoji: '🐳',
    tags: ['Docker', 'DevOps', 'Containerization'],
    content: [
      {
        type: 'paragraph',
        content:
          'Docker eliminated the "works on my machine" problem at the cost of a learning curve. Once internalised, containerisation becomes the most reliable way to build reproducible, deployment-ready applications. This guide covers practical Docker usage for Node.js/NestJS applications — the same setup I use across all my production services.',
      },
      { type: 'heading', content: 'The Mental Model: Image vs Container' },
      {
        type: 'paragraph',
        content:
          'An image is a read-only blueprint (like a class). A container is a running instance of that blueprint (like an object). You build images once, then run as many containers as you need. Images are stored in registries (Docker Hub, ECR, GCR).',
      },
      { type: 'heading', content: 'Multi-Stage Builds: Keep Production Images Lean' },
      {
        type: 'paragraph',
        content:
          'A common mistake is shipping development dependencies into production. Multi-stage builds solve this by using one stage to compile/build and a separate minimal stage to run.',
      },
      {
        type: 'code',
        language: 'dockerfile',
        content: `# Stage 1 — build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — production (only runtime deps)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]`,
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'The multi-stage build above reduces the final image from ~800 MB to ~120 MB. Smaller images pull faster, reduce attack surface, and cost less in registry storage.',
      },
      { type: 'heading', content: '.dockerignore Is As Important As .gitignore' },
      {
        type: 'paragraph',
        content:
          'Without a .dockerignore, the COPY . . instruction sends your entire working directory to the Docker daemon, including node_modules, .git, and local env files. Always create one.',
      },
      {
        type: 'code',
        language: 'text',
        content: `node_modules
dist
.git
.env
.env.local
*.log
coverage
.next
README.md`,
      },
      { type: 'heading', content: 'Docker Compose for Local Development' },
      {
        type: 'paragraph',
        content:
          'Docker Compose orchestrates multi-container environments locally. Use it to run your app alongside its dependencies (PostgreSQL, Redis, etc.) with a single command.',
      },
      {
        type: 'code',
        language: 'yaml',
        content: `# compose.yml
services:
  api:
    build:
      context: .
      target: builder        # use the build stage for hot-reload
    volumes:
      - .:/app
      - /app/node_modules    # anonymous volume — prevent host override
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://dev:dev@db:5432/dev
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: dev
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine

volumes:
  pg_data:`,
      },
      { type: 'heading', content: 'Health Checks and Graceful Shutdown' },
      {
        type: 'paragraph',
        content:
          'Production containers need health checks so the orchestrator (Kubernetes, ECS) knows when a container is ready for traffic and when to restart it.',
      },
      {
        type: 'code',
        language: 'typescript',
        content: `// NestJS health check endpoint
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis', { transport: Transport.REDIS }),
    ]);
  }
}

// Graceful shutdown — drain in-flight requests before exit
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks(); // handles SIGTERM from Docker/K8s
  await app.listen(3000);
}`,
      },
      { type: 'heading', content: 'Layer Caching: Order Your Dockerfile Correctly' },
      {
        type: 'paragraph',
        content:
          'Docker caches each layer. A cache miss on one layer invalidates all subsequent layers. Put the most frequently changing instructions last.',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'FROM (base image — changes rarely)',
          'System dependencies with apt/apk (changes rarely)',
          'COPY package.json package-lock.json (changes when deps change)',
          'RUN npm ci (re-runs only when lock file changes)',
          'COPY . . (invalidated by any source file change)',
          'RUN npm run build',
        ],
      },
    ],
  },
];
