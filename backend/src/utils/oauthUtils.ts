import { Response } from 'express';

/**
 * Sets appropriate headers for OAuth responses to handle Cross-Origin-Opener-Policy issues
 * @param res Express response object
 */
export const setOAuthResponseHeaders = (res: Response): void => {
  // Set headers to allow proper handling of OAuth flows
  res.set({
    'Access-Control-Allow-Origin': process.env['CORS_ORIGIN'] || 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
};

/**
 * Sets security headers that are compatible with OAuth flows
 * @param res Express response object
 */
export const setSecurityHeadersForOAuth = (res: Response): void => {
  // Allow popups for OAuth flows while maintaining security
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
};