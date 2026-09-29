import { cn } from '@/lib/cn';

type BadgeTone = 'neutral' | 'primary' | 'success';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface-2 text-fg-muted',
  primary: 'border-primary/25 bg-primary/10 text-primary-text',
  success: 'border-success/30 bg-success/10 text-success',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] leading-5 font-medium',
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex size-2', className)} aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
      <span className="relative inline-flex size-2 rounded-full bg-success" />
    </span>
  );
}
