import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNavScroll } from '@/hooks/use-nav-scroll';

beforeEach(() => {
  // Reset scrollY to 0 before each test
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
});

describe('useNavScroll', () => {
  it('returns false initially before any scroll event', () => {
    const { result } = renderHook(() => useNavScroll());
    expect(result.current).toBe(false);
  });

  it('returns true when scrollY exceeds the threshold', () => {
    const { result } = renderHook(() => useNavScroll(20));

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 50, configurable: true, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });

  it('returns false when scrollY is below the threshold', () => {
    const { result } = renderHook(() => useNavScroll(100));

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 50, configurable: true, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);
  });

  it('defaults to 20px threshold', () => {
    const { result } = renderHook(() => useNavScroll());

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 21, configurable: true, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });

  it('returns false when scrollY equals the threshold (not strictly greater)', () => {
    const { result } = renderHook(() => useNavScroll(20));

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 20, configurable: true, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    // The hook uses > threshold, so exactly at threshold should be false
    expect(result.current).toBe(false);
  });

  it('removes the scroll listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useNavScroll());
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
