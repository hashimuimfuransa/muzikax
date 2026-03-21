/**
 * User-friendly error messages for production
 * Maps technical errors to user-friendly messages
 */

export interface ErrorMessage {
  title: string;
  message: string;
  suggestion?: string;
}

// Error type classifications
export enum ErrorType {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  AUTH = 'AUTH',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Get user-friendly error message based on error type or status code
 */
export const getUserFriendlyError = (error: any, statusCode?: number): ErrorMessage => {
  // Handle network errors
  if (!window.navigator.onLine || error.message === 'NetworkError' || error.message?.includes('fetch') || error.message?.includes('network')) {
    return {
      title: 'Connection Issue',
      message: "We're having trouble connecting to our servers. Please check your internet connection.",
      suggestion: 'Check your connection and try again',
    };
  }

  // Handle specific HTTP status codes
  switch (statusCode || error.status) {
    case 401:
      return {
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again to continue.',
        suggestion: 'Redirecting to login...',
      };
    
    case 403:
      return {
        title: 'Access Denied',
        message: "You don't have permission to access this resource.",
        suggestion: 'Please contact support if you believe this is an error',
      };
    
    case 404:
      return {
        title: 'Not Found',
        message: "The content you're looking for doesn't exist or has been moved.",
        suggestion: 'Check the URL or navigate to another page',
      };
    
    case 429:
      return {
        title: 'Too Many Requests',
        message: "You've made too many requests. Please wait a moment before trying again.",
        suggestion: 'Wait a few seconds and try again',
      };
    
    case 500:
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. We\'re working to fix it.',
        suggestion: 'Please try again in a few moments',
      };
    
    case 502:
    case 503:
    case 504:
      return {
        title: 'Service Unavailable',
        message: 'Our service is temporarily unavailable. We\'ll be back shortly.',
        suggestion: 'Please wait a moment and refresh the page',
      };
    
    default:
      // Parse error message from response if available
      const serverMessage = error?.response?.data?.message || error?.message;
      
      if (serverMessage) {
        // If it's a validation error with specific details
        if (error?.response?.data?.errors) {
          return {
            title: 'Validation Error',
            message: 'Please check your information and try again.',
            suggestion: Array.isArray(error.response.data.errors) 
              ? error.response.data.errors.join(', ') 
              : Object.values(error.response.data.errors).join(', '),
          };
        }
        
        // Generic server message
        return {
          title: 'Error',
          message: serverMessage,
          suggestion: 'Please try again',
        };
      }
      
      // Default unknown error
      return {
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred. Please try again.',
        suggestion: 'If the problem persists, contact our support team',
      };
  }
};

/**
 * Format error for display in toast/notification
 */
export const formatErrorForToast = (error: any, statusCode?: number): { message: string, type: 'error' | 'warning' } => {
  const friendlyError = getUserFriendlyError(error, statusCode);
  
  return {
    message: `${friendlyError.title}: ${friendlyError.message}`,
    type: 'error' as const,
  };
};

/**
 * Check if error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  return (
    !window.navigator.onLine ||
    error.message === 'NetworkError' ||
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('NetworkError') ||
    error.message?.includes('network') ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT'
  );
};

/**
 * Get retry delay with exponential backoff
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
export const getRetryDelay = (attempt: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
  // Add some jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

/**
 * Determine if error should trigger automatic retry
 */
export const shouldRetry = (error: any, attempt: number): boolean => {
  const maxRetries = 3;
  
  if (attempt >= maxRetries) {
    return false;
  }
  
  // Retry on network errors
  if (isNetworkError(error)) {
    return true;
  }
  
  // Retry on server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  return false;
};
