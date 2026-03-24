/**
 * Modern Web Share API Utility
 * Provides native sharing capabilities across devices
 */

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Check if Web Share API is supported
 */
export const canShare = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator;
};

/**
 * Check if specific files can be shared
 */
export const canShareFiles = (files: File[]): boolean => {
  if (!canShare()) return false;
  
  // @ts-ignore - navigator.canShare is experimental
  return navigator.canShare && navigator.canShare({ files });
};

/**
 * Share using modern Web Share API with fallback
 */
export const shareContent = async (
  platform: string,
  trackTitle: string,
  trackUrl: string,
  coverImage?: string
): Promise<{ success: boolean; method: 'native' | 'fallback' | 'copy' }> => {
  const shareData: ShareData = {
    title: '🎵 Check out this track on MuzikaX',
    text: `Listening to "${trackTitle}" on MuzikaX - Discover Rwandan Music 🎶`,
    url: trackUrl,
  };

  try {
    // For "web_share" or when Web Share API is available, use native sharing
    if (platform === 'web_share' || canShare()) {
      await navigator.share(shareData);
      console.log('✅ Shared via Web Share API');
      return { success: true, method: 'native' };
    }

    // Fallback for specific platforms
    switch (platform) {
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
        window.open(whatsappUrl, '_blank');
        break;
      
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
        window.open(twitterUrl, '_blank');
        break;
      
      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
        window.open(facebookUrl, '_blank');
        break;
      
      case 'linkedin':
        const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.text)}`;
        window.open(linkedinUrl, '_blank');
        break;
      
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        // Copy link instead
        await copyToClipboard(shareData.url);
        console.log('✅ Link copied for Instagram sharing');
        return { success: true, method: 'copy' };
      
      case 'copy':
        await copyToClipboard(shareData.url);
        return { success: true, method: 'copy' };
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log(`✅ Shared to ${platform}`);
    return { success: true, method: 'fallback' };
  } catch (error) {
    if ((error as any).name === 'AbortError') {
      // User cancelled the share
      console.log('❌ Share cancelled by user');
      return { success: false, method: 'fallback' };
    }
    
    console.error('Share failed:', error);
    
    // Final fallback - copy to clipboard
    try {
      await copyToClipboard(shareData.url);
      return { success: true, method: 'copy' };
    } catch (clipboardError) {
      console.error('Clipboard fallback also failed:', clipboardError);
      return { success: false, method: 'copy' };
    }
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      console.log('✅ Copied to clipboard');
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('✅ Copied to clipboard (fallback)');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to copy:', error);
    return false;
  }
};

/**
 * Share image with file (advanced)
 */
export const shareImageWithFile = async (
  imageUrl: string,
  trackTitle: string,
  trackUrl: string
): Promise<boolean> => {
  try {
    // Fetch the image as a blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'cover-image.jpg', { type: 'image/jpeg' });

    const shareData = {
      files: [file],
      title: trackTitle,
      text: `Check out "${trackTitle}" on MuzikaX`,
      url: trackUrl,
    };

    if (canShareFiles([file])) {
      // @ts-ignore - navigator.share is experimental
      await navigator.share(shareData);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to share image:', error);
    return false;
  }
};
