import React from 'react';
import { getEmbedUrl } from '../utils/videoEmbed';
import { Play } from 'lucide-react';

interface ReelProps {
  reel: {
    id: number;
    title: string;
    platform: string;
    video_url: string;
    thumbnail_url: string;
    badge: string;
  };
}

export const ReelCard: React.FC<ReelProps> = ({ reel }) => {
  const embedUrl = getEmbedUrl(reel.video_url, reel.platform as any);

  return (
    <div className="w-[280px] sm:w-[320px] aspect-[9/16] shrink-0 rounded-[2rem] overflow-hidden relative group border border-white/10 bg-brand-charcoal/50 shadow-2xl">
      {/* Fallback Background / Skeleton */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal to-brand-black flex items-center justify-center -z-10">
        <Play className="w-12 h-12 text-brand-copper/20" />
      </div>

      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full object-cover border-0 scale-[1.05]"
          allow="autoplay; fullscreen; picture-in-picture"
          loading="lazy"
          title={reel.title}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-brand-black/80">
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Video Unavailable</p>
        </div>
      )}

      {/* Overlays to prevent accidental clicks stopping the video (if we want pure background) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-brand-black/90 via-transparent to-black/30" />

      {/* Info Layer */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-3 z-10 pointer-events-none">
        {reel.badge && (
          <span className="self-start px-3 py-1.5 bg-brand-copper/90 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
            {reel.badge}
          </span>
        )}
        {reel.title && (
          <h3 className="text-lg font-bold text-white drop-shadow-md leading-tight">{reel.title}</h3>
        )}
      </div>
    </div>
  );
};
