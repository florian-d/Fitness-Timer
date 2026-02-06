import { renderHook, waitFor } from '@testing-library/react';
import { useWakeLock } from './useWakeLock';

// Mock the Wake Lock API
const mockRelease = jest.fn().mockResolvedValue(undefined);
const mockRequest = jest.fn();
const mockAddEventListener = jest.fn();

const createMockWakeLockSentinel = () => ({
  released: false,
  type: 'screen' as const,
  release: mockRelease,
  addEventListener: mockAddEventListener,
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

describe('useWakeLock', () => {
  let originalWakeLock: WakeLock | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    originalWakeLock = (navigator as any).wakeLock;
    mockRequest.mockResolvedValue(createMockWakeLockSentinel());
  });

  afterEach(() => {
    if (originalWakeLock === undefined) {
      delete (navigator as any).wakeLock;
    } else {
      (navigator as any).wakeLock = originalWakeLock;
    }
  });

  test('detects Wake Lock API support', () => {
    (navigator as any).wakeLock = { request: mockRequest };
    
    const { result } = renderHook(() => useWakeLock(false));
    
    expect(result.current.isSupported).toBe(true);
  });

  test('detects when Wake Lock API is not supported', () => {
    delete (navigator as any).wakeLock;
    
    const { result } = renderHook(() => useWakeLock(false));
    
    expect(result.current.isSupported).toBe(false);
  });

  test('requests wake lock when shouldLock is true', async () => {
    (navigator as any).wakeLock = { request: mockRequest };
    
    renderHook(() => useWakeLock(true));
    
    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('screen');
    });
  });

  test('does not request wake lock when shouldLock is false', async () => {
    (navigator as any).wakeLock = { request: mockRequest };
    
    renderHook(() => useWakeLock(false));
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockRequest).not.toHaveBeenCalled();
  });

  test('releases wake lock when shouldLock changes from true to false', async () => {
    (navigator as any).wakeLock = { request: mockRequest };
    
    const { rerender } = renderHook(
      ({ shouldLock }) => useWakeLock(shouldLock),
      { initialProps: { shouldLock: true } }
    );
    
    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('screen');
    });
    
    // Change shouldLock to false
    rerender({ shouldLock: false });
    
    await waitFor(() => {
      expect(mockRelease).toHaveBeenCalled();
    });
  });

  test('releases wake lock on unmount', async () => {
    (navigator as any).wakeLock = { request: mockRequest };
    
    const { unmount } = renderHook(() => useWakeLock(true));
    
    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('screen');
    });
    
    unmount();
    
    await waitFor(() => {
      expect(mockRelease).toHaveBeenCalled();
    });
  });

  test('handles wake lock request errors gracefully', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const mockError = new Error('Wake lock not allowed');
    mockRequest.mockRejectedValueOnce(mockError);
    
    (navigator as any).wakeLock = { request: mockRequest };
    
    const { result } = renderHook(() => useWakeLock(true));
    
    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith('Wake lock request failed:', mockError);
    });
    
    expect(result.current.isActive).toBe(false);
    
    consoleWarnSpy.mockRestore();
  });

  test('does not request wake lock if API is not supported', async () => {
    delete (navigator as any).wakeLock;
    
    renderHook(() => useWakeLock(true));
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockRequest).not.toHaveBeenCalled();
  });

  test('sets isActive to true when wake lock is acquired', async () => {
    (navigator as any).wakeLock = { request: mockRequest };
    
    const { result } = renderHook(() => useWakeLock(true));
    
    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });
  });
});
