/**
 * Service for handling track cleanup when audio playback fails
 */

/**
 * Report an invalid track to the backend for cleanup
 * @param trackId - The ID of the track that failed to play
 * @returns Promise with cleanup result
 */
export const reportInvalidTrack = async (trackId: string): Promise<{ 
  success: boolean; 
  message: string; 
  removed: boolean;
  trackTitle?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackId}/invalid`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Track cleanup result:', result);
    
    return {
      success: true,
      message: result.message,
      removed: result.removed,
      trackTitle: result.trackTitle
    };
  } catch (error) {
    console.error('Error reporting invalid track:', error);
    return {
      success: false,
      message: 'Failed to report invalid track',
      removed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};