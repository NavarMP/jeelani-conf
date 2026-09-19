export type MediaType = 'image' | 'video' | 'youtube' | 'instagram' | 'vimeo' | 'unknown';

export function getMediaType(url: string | undefined): MediaType {
  if (!url) return 'unknown';

  const lowerUrl = url.toLowerCase();

  // YouTube
  if (
    lowerUrl.includes('youtube.com/watch') ||
    lowerUrl.includes('youtube.com/embed') ||
    lowerUrl.includes('youtu.be/') ||
    lowerUrl.includes('youtube.com/shorts/')
  ) {
    return 'youtube';
  }

  // Vimeo
  if (lowerUrl.includes('vimeo.com/')) {
    return 'vimeo';
  }

  // Instagram
  if (lowerUrl.includes('instagram.com/p/') || lowerUrl.includes('instagram.com/reel/')) {
    return 'instagram';
  }

  // Video formats
  if (
    lowerUrl.endsWith('.mp4') ||
    lowerUrl.endsWith('.webm') ||
    lowerUrl.endsWith('.ogg') ||
    lowerUrl.endsWith('.mov') ||
    lowerUrl.includes('.mp4?') ||
    lowerUrl.includes('.webm?') ||
    lowerUrl.includes('.mov?')
  ) {
    return 'video';
  }

  // Image formats (or default to image for Supabase storage URLs or standard image extensions)
  if (
    lowerUrl.endsWith('.jpg') ||
    lowerUrl.endsWith('.jpeg') ||
    lowerUrl.endsWith('.png') ||
    lowerUrl.endsWith('.gif') ||
    lowerUrl.endsWith('.webp') ||
    lowerUrl.endsWith('.svg') ||
    lowerUrl.endsWith('.avif') ||
    lowerUrl.includes('supabase.co/storage/v1/object/public/') ||
    lowerUrl.includes('images.unsplash.com')
  ) {
    return 'image';
  }

  return 'image';
}

export function getYouTubeThumbnail(url: string): string | undefined {
  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URL(url).searchParams;
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0] || '';
  }
  
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return undefined;
}

export function getEmbedUrl(url: string, type: MediaType): string | undefined {
  if (type === 'youtube') {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/watch')) {
      const urlParams = new URL(url).searchParams;
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0] || '';
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
  }

  if (type === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
  }
  
  return url;
}

