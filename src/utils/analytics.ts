// Matomo Analytics helper
declare global {
  interface Window {
    _paq?: Array<Array<string | number>>;
  }
}

/**
 * Track a custom event in Matomo
 * @param category - Event category (e.g., 'Workout')
 * @param action - Event action (e.g., 'Started', 'Completed')
 * @param name - Optional event name for additional context
 * @param value - Optional numeric value
 */
export const trackEvent = (
  category: string,
  action: string,
  name?: string,
  value?: number
): void => {
  if (typeof window !== 'undefined' && window._paq) {
    const eventData: Array<string | number> = ['trackEvent', category, action];
    if (name) {
      eventData.push(name);
    }
    if (value !== undefined) {
      eventData.push(value);
    }
    window._paq.push(eventData);
  }
};
