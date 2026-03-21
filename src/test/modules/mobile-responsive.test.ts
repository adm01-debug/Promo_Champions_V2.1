/**
 * Mobile Navigation & Responsive Tests
 * Tests: breakpoint detection, menu state, touch interactions
 */
import { describe, it, expect } from 'vitest';

describe('Mobile - Breakpoint Detection', () => {
  const getDeviceType = (width: number): 'mobile' | 'tablet' | 'desktop' => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  it('should detect mobile', () => {
    expect(getDeviceType(375)).toBe('mobile');
    expect(getDeviceType(767)).toBe('mobile');
  });

  it('should detect tablet', () => {
    expect(getDeviceType(768)).toBe('tablet');
    expect(getDeviceType(1023)).toBe('tablet');
  });

  it('should detect desktop', () => {
    expect(getDeviceType(1024)).toBe('desktop');
    expect(getDeviceType(1920)).toBe('desktop');
  });
});

describe('Mobile - Navigation Items', () => {
  const MAX_MOBILE_ITEMS = 5;

  const getMobileNavItems = (allItems: { label: string; priority: number }[]) => {
    return [...allItems]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, MAX_MOBILE_ITEMS);
  };

  it('should limit to 5 items', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ label: `Item ${i}`, priority: i }));
    expect(getMobileNavItems(items)).toHaveLength(5);
  });

  it('should prioritize low priority numbers', () => {
    const items = [
      { label: 'Low', priority: 1 },
      { label: 'High', priority: 10 },
      { label: 'Mid', priority: 5 },
    ];
    expect(getMobileNavItems(items)[0].label).toBe('Low');
  });

  it('should handle fewer than 5 items', () => {
    const items = [{ label: 'A', priority: 1 }, { label: 'B', priority: 2 }];
    expect(getMobileNavItems(items)).toHaveLength(2);
  });
});

describe('Mobile - Menu State', () => {
  const createMenuState = () => {
    let isOpen = false;
    return {
      isOpen: () => isOpen,
      toggle: () => { isOpen = !isOpen; },
      open: () => { isOpen = true; },
      close: () => { isOpen = false; },
    };
  };

  it('should start closed', () => {
    const menu = createMenuState();
    expect(menu.isOpen()).toBe(false);
  });

  it('should toggle', () => {
    const menu = createMenuState();
    menu.toggle();
    expect(menu.isOpen()).toBe(true);
    menu.toggle();
    expect(menu.isOpen()).toBe(false);
  });

  it('should open/close explicitly', () => {
    const menu = createMenuState();
    menu.open();
    expect(menu.isOpen()).toBe(true);
    menu.close();
    expect(menu.isOpen()).toBe(false);
  });
});

describe('Mobile - Swipe Direction Detection', () => {
  const detectSwipe = (startX: number, endX: number, threshold: number = 50): 'left' | 'right' | null => {
    const diff = endX - startX;
    if (Math.abs(diff) < threshold) return null;
    return diff > 0 ? 'right' : 'left';
  };

  it('should detect right swipe', () => {
    expect(detectSwipe(100, 200)).toBe('right');
  });

  it('should detect left swipe', () => {
    expect(detectSwipe(200, 100)).toBe('left');
  });

  it('should return null for small movement', () => {
    expect(detectSwipe(100, 130)).toBeNull();
  });

  it('should respect custom threshold', () => {
    expect(detectSwipe(100, 130, 20)).toBe('right');
  });
});

describe('Mobile - Active Route Detection', () => {
  const isActiveRoute = (currentPath: string, routePath: string): boolean => {
    if (routePath === '/') return currentPath === '/';
    return currentPath.startsWith(routePath);
  };

  it('should match exact root path', () => {
    expect(isActiveRoute('/', '/')).toBe(true);
    expect(isActiveRoute('/sdr', '/')).toBe(false);
  });

  it('should match path prefixes', () => {
    expect(isActiveRoute('/pipeline', '/pipeline')).toBe(true);
    expect(isActiveRoute('/pipeline/details', '/pipeline')).toBe(true);
  });

  it('should not match unrelated paths', () => {
    expect(isActiveRoute('/vendas', '/pipeline')).toBe(false);
  });
});

describe('Mobile - Touch Target Size Validation', () => {
  const MIN_TOUCH_TARGET = 44; // WCAG 2.5.5

  const isAccessibleTouchTarget = (width: number, height: number): boolean => {
    return width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;
  };

  it('should validate 44px minimum', () => {
    expect(isAccessibleTouchTarget(44, 44)).toBe(true);
    expect(isAccessibleTouchTarget(48, 48)).toBe(true);
  });

  it('should reject small targets', () => {
    expect(isAccessibleTouchTarget(30, 30)).toBe(false);
    expect(isAccessibleTouchTarget(44, 30)).toBe(false);
  });
});
