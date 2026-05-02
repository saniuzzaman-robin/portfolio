import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useClickOutside } from '@/hooks/use-click-outside';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useClickOutside', () => {
  it('fires callback when a mousedown occurs outside the ref element', () => {
    const callback = vi.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);

    const ref = { current: div };
    renderHook(() => useClickOutside(ref, callback));

    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(callback).toHaveBeenCalledOnce();

    document.body.removeChild(div);
    document.body.removeChild(outside);
  });

  it('does NOT fire callback when mousedown is inside the ref element', () => {
    const callback = vi.fn();
    const div = document.createElement('div');
    const inner = document.createElement('span');
    div.appendChild(inner);
    document.body.appendChild(div);

    const ref = { current: div };
    renderHook(() => useClickOutside(ref, callback));

    inner.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it('does NOT fire callback when mousedown is on the ref element itself', () => {
    const callback = vi.fn();
    const div = document.createElement('div');
    document.body.appendChild(div);

    const ref = { current: div };
    renderHook(() => useClickOutside(ref, callback));

    div.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it('attaches and removes the event listener correctly', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const callback = vi.fn();
    const div = document.createElement('div');
    const ref = { current: div };

    const { unmount } = renderHook(() => useClickOutside(ref, callback));
    expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });
});
