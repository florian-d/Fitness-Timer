import { useEffect, useRef, useState } from 'react';
/// <reference path="../types/wake-lock.d.ts" />

interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
}

/**
 * Custom hook to manage Screen Wake Lock API
 * Prevents the screen from dimming or locking when active
 * 
 * @param shouldLock - Boolean to control when the wake lock should be active
 * @returns Object with isSupported and isActive properties
 */
export const useWakeLock = (shouldLock: boolean): UseWakeLockReturn => {
  const [isSupported] = useState(() => 'wakeLock' in navigator);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Only proceed if Wake Lock API is supported
    if (!isSupported) {
      return;
    }

    const requestWakeLock = async () => {
      try {
        // Request a screen wake lock
        if (!navigator.wakeLock) {
          return;
        }
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setIsActive(true);

        // Listen for wake lock release (can happen when tab loses visibility)
        wakeLockRef.current.addEventListener('release', () => {
          setIsActive(false);
        });
      } catch (err) {
        // Wake lock request can fail if page is not visible or user denied permission
        console.warn('Wake lock request failed:', err);
        setIsActive(false);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          setIsActive(false);
        } catch (err) {
          console.warn('Wake lock release failed:', err);
        }
      }
    };

    if (shouldLock) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Cleanup: release wake lock when component unmounts or shouldLock changes to false
    return () => {
      releaseWakeLock();
    };
  }, [shouldLock, isSupported]);

  return { isSupported, isActive };
};
