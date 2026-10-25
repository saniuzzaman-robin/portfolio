'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Native `title` tooltips wait about a second; this one shows after a short beat. */
const SHOW_DELAY_MS = 150;
/** Moving from one tip straight to another skips the delay, like a menu bar. */
const GRACE_MS = 300;
const GAP_PX = 8;
const EDGE_PX = 8;

type Tip = { text: string; rect: DOMRect };

/**
 * Replaces the browser's `title` tooltip for everything inside the page with a faster, styled
 * one. It listens at the document, so components keep using plain `title` attributes: while a tip
 * is pending or visible the attribute is lifted off the element (which stops the native tooltip)
 * and put back when the tip hides, so the attribute still serves as the accessible name otherwise.
 * Touch input is ignored, and keyboard focus shows the tip too.
 */
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active: { el: Element; title: string } | null = null;
    let timer: number | undefined;
    let shown = false;
    let hiddenAt = 0;

    const hide = () => {
      window.clearTimeout(timer);
      if (!active) return;
      // React may have written a newer title while the tip was up; that one wins.
      if (!active.el.hasAttribute('title')) active.el.setAttribute('title', active.title);
      if (shown) hiddenAt = Date.now();
      active = null;
      shown = false;
      setTip(null);
    };

    const activate = (el: Element, immediate: boolean) => {
      const title = el.getAttribute('title');
      if (!title?.trim()) return;
      hide();
      el.removeAttribute('title');
      active = { el, title };
      const show = () => {
        if (!el.isConnected) return hide();
        shown = true;
        setTip({ text: title, rect: el.getBoundingClientRect() });
      };
      if (immediate || Date.now() - hiddenAt < GRACE_MS) show();
      else timer = window.setTimeout(show, SHOW_DELAY_MS);
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const target = event.target instanceof Element ? event.target : null;
      const el = target?.closest('[title]');
      if (el) {
        if (el !== active?.el) activate(el, false);
      } else if (!(target && active?.el.contains(target))) {
        hide();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const el = target?.closest('[title]');
      if (el && target?.matches(':focus-visible')) activate(el, true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };

    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerdown', hide);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', hide);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('scroll', hide, { capture: true, passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    return () => {
      hide();
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerdown', hide);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', hide);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('scroll', hide, { capture: true });
      document.documentElement.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
    };
  }, []);

  // Centered above the element, flipped below when there's no room, kept inside the viewport.
  useLayoutEffect(() => {
    const node = tipRef.current;
    if (!tip || !node) return;
    const { offsetWidth: width, offsetHeight: height } = node;
    const viewport = document.documentElement.clientWidth;
    let top = tip.rect.top - height - GAP_PX;
    if (top < EDGE_PX) top = tip.rect.bottom + GAP_PX;
    const centered = tip.rect.left + tip.rect.width / 2 - width / 2;
    node.style.left = `${Math.max(EDGE_PX, Math.min(centered, viewport - width - EDGE_PX))}px`;
    node.style.top = `${top}px`;
  }, [tip]);

  if (!tip) return null;
  return createPortal(
    <div
      ref={tipRef}
      role="tooltip"
      className="tooltip-in pointer-events-none fixed top-0 left-0 z-100 max-w-xs rounded-md border border-line-strong bg-elevated px-2 py-1 text-xs leading-snug wrap-break-word whitespace-pre-line text-fg shadow-pop"
    >
      {tip.text}
    </div>,
    document.body
  );
}
