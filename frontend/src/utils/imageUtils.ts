/**
 * Image URL Utility Functions
 * Converts various image service links to direct viewable URLs
 */

/**
 * Convert Google Drive link to direct image URL
 * Supports various Google Drive/Share link formats
 */
export function convertGoogleDriveLink(url: string): string {
  // Google Share link format: https://share.google/FILE_ID
  const shareMatch = url.match(/share\.google\/([a-zA-Z0-9_-]+)/);
  if (shareMatch && shareMatch[1]) {
    // Extract the file ID from share link
    const fileId = shareMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Google Drive view link format: https://drive.google.com/file/d/FILE_ID/view
  const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/);
  if (viewMatch && viewMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${viewMatch[1]}`;
  }

  // Google Drive open link format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch && openMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }

  // Google Photos share link: https://photos.app.goo.gl/FILE_ID
  const photosMatch = url.match(/photos\.app\.goo\.gl\/([a-zA-Z0-9_-]+)/);
  if (photosMatch && photosMatch[1]) {
    // For Google Photos, we need to extract the actual file ID
    // This requires an additional step, so we'll return a helper message
    console.log('Google Photos link detected. Please use the direct file ID from Google Drive.');
    return url;
  }

  // Google Drive direct link already: https://drive.google.com/uc?export=view&id=FILE_ID
  if (url.includes('drive.google.com') && url.includes('uc?export=view')) {
    return url;
  }

  // Fallback: return original URL
  return url;
}

/**
 * Convert Imgur link to direct image URL
 */
export function convertImgurLink(url: string): string {
  // Imgur album or gallery link: https://imgur.com/gallery/IMAGE_ID
  const galleryMatch = url.match(/imgur\.com\/gallery\/([a-zA-Z0-9]+)/);
  if (galleryMatch && galleryMatch[1]) {
    return `https://i.imgur.com/${galleryMatch[1]}.jpg`;
  }

  // Imgur direct link already: https://i.imgur.com/IMAGE_ID.jpg
  if (url.includes('i.imgur.com')) {
    return url;
  }

  // Regular imgur link: https://imgur.com/IMAGE_ID
  const regularMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)/);
  if (regularMatch && regularMatch[1]) {
    return `https://i.imgur.com/${regularMatch[1]}.jpg`;
  }

  return url;
}

/**
 * Convert Cloudinary link to optimized image URL
 */
export function convertCloudinaryLink(url: string): string {
  // If already has transformations, return as is
  if (url.includes('/upload/') && (url.includes('/w_') || url.includes('/h_'))) {
    return url;
  }

  // Add basic optimization parameters
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_auto,q_auto,f_auto/${parts[1]}`;
  }

  return url;
}

/**
 * Main function to convert any supported image URL
 */
export function convertImageUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  const trimmedUrl = url.trim();

  // Handle Google Drive links
  if (trimmedUrl.includes('drive.google.com')) {
    return convertGoogleDriveLink(trimmedUrl);
  }

  // Handle Imgur links
  if (trimmedUrl.includes('imgur.com')) {
    return convertImgurLink(trimmedUrl);
  }

  // Handle Cloudinary links
  if (trimmedUrl.includes('cloudinary.com')) {
    return convertCloudinaryLink(trimmedUrl);
  }

  // Return original URL for unsupported services
  return trimmedUrl;
}

/**
 * Validate if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
