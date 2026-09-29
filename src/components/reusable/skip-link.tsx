export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main-content"
      className="absolute start-4 top-0 z-[70] -translate-y-full rounded-b-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-transform duration-300 focus:translate-y-0"
    >
      {label}
    </a>
  );
}
