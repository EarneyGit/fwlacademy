export type VideoPlatform = 'youtube' | 'vimeo' | 'unknown';

export function parseVideoProvider(url: string): { platform: VideoPlatform; videoId: string | null } {
  if (!url) return { platform: 'unknown', videoId: null };

  // YouTube matchers
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { platform: 'youtube', videoId: ytMatch[1] };
  }

  // Vimeo matchers
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { platform: 'vimeo', videoId: vimeoMatch[1] };
  }

  return { platform: 'unknown', videoId: null };
}

export function getEmbedUrl(url: string, platformFallback?: VideoPlatform): string | null {
  const { platform, videoId } = parseVideoProvider(url);
  const finalPlatform = platform !== 'unknown' ? platform : platformFallback;
  const id = videoId || url.split('/').pop()?.split('?')[0]; 
  
  if (!id) return null;

  if (finalPlatform === 'youtube') {
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&controls=0&modestbranding=1&rel=0&enablejsapi=1`;
  }

  if (finalPlatform === 'vimeo') {
    return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&autopause=0&playsinline=1&controls=0&background=1`;
  }

  return null;
}
