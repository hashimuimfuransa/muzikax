/**
 * Offline-safe API call wrapper
 * Prevents API calls when the app is offline
 */

let isOnlineState = true;

/**
 * Update the online state
 * Called by OfflineContext when network status changes
 */
export const setOnlineState = (isOnline: boolean) => {
  isOnlineState = isOnline;
};

/**
 * Check if app is currently online
 * @returns true if online, false if offline
 */
export const isAppOnline = (): boolean => {
  return isOnlineState;
};

/**
 * Wrapper for fetch that prevents calls when offline
 * @param url - The URL to fetch
 * @param options - Optional fetch options
 * @returns Promise<Response>
 * @throws Error if offline
 */
export async function offlineSafeFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  if (!isOnlineState) {
    console.log('🚫 Blocked API call while offline:', url);
    throw new Error('Cannot make API calls while offline');
  }
  
  return fetch(url, options);
}

/**
 * Type for API functions that should be wrapped
 */
type ApiFunction = (...args: any[]) => Promise<any>;

/**
 * Wrapper for API functions to make them offline-safe
 * @param fn - The API function to wrap
 * @param functionName - Name of the function for logging
 * @returns Wrapped function that checks online status first
 */
export function withOfflineCheck<T extends ApiFunction>(
  fn: T,
  functionName: string
): T {
  return ((...args: Parameters<T>) => {
    if (!isOnlineState) {
      console.log(`🚫 Blocked ${functionName} call while offline`);
      return Promise.reject(new Error(`Cannot call ${functionName} while offline`));
    }
    return fn(...args);
  }) as T;
}
