/**
 * Re-mounts on every navigation, giving each route a soft enter transition.
 * Transform-only (no fade): an opacity animation on the whole page would delay LCP.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="enter flex flex-1 flex-col"
      style={
        {
          '--enter-y': '12px',
          '--enter-duration': '0.5s',
          animationName: 'enter-transform',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
