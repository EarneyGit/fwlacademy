import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ReelCard } from './ReelCard';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';

interface Reel {
  id: number;
  title: string;
  platform: string;
  video_url: string;
  thumbnail_url: string;
  badge: string;
  display_order: number;
  active: boolean;
}

export const AIReelsShowcase = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await fetch('/api/reels');
        if (res.ok) {
          const data = await res.json();
          // Filter active and sort
          const activeReels = data
            .filter((r: Reel) => r.active)
            .sort((a: Reel, b: Reel) => a.display_order - b.display_order);
          setReels(activeReels);
        }
      } catch (err) {
        console.error("Failed to load reels", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  // Create an artificially infinite array
  const extendedReels = [...reels, ...reels, ...reels, ...reels];

  // Auto-scroll every 2 seconds
  useEffect(() => {
    if (reels.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const cardWidth = 350; // Approx card width + gap
        
        // If we get near the end of our duplicated sets
        if (scrollLeft >= maxScroll - cardWidth * 2) {
          // Calculate the width of exactly ONE original set of reels
          const singleSetWidth = scrollWidth / 4;
          
          // Instantly snap back one full set to maintain illusion
          scrollRef.current.style.scrollBehavior = 'auto';
          scrollRef.current.scrollLeft = scrollLeft - singleSetWidth;
          
          // Wait for next frame to resume smooth scrolling
          requestAnimationFrame(() => {
            if (scrollRef.current) {
              scrollRef.current.style.scrollBehavior = 'smooth';
              scrollRef.current.scrollLeft += cardWidth;
            }
          });
        } else {
          scrollRef.current.style.scrollBehavior = 'smooth';
          scrollRef.current.scrollLeft += cardWidth;
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [reels]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.style.scrollBehavior = 'smooth';
      scrollRef.current.scrollLeft = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
    }
  };

  if (loading || reels.length === 0) {
    return null; // Hide section if no reels to show or still loading
  }

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-brand-black border-y border-white/5">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-copper/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-12 sm:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-copper/10 border border-brand-copper/20 text-brand-copper-glow text-[10px] sm:text-xs font-bold mb-6 uppercase tracking-widest">
            <Play className="w-3.5 h-3.5" />
            AI Reel Lab
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6">
            AI Reels Created <span className="text-brand-copper">With Our Workflow</span>
          </h2>
          <p className="text-white/40 text-base sm:text-lg leading-relaxed">
            Explore real short-form videos made using AI tools, prompts, editing systems, and agency-grade production workflows taught inside Futurewave Labs Academy.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 hidden md:flex"
        >
          <button 
            onClick={() => scroll('left')}
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Scroll left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Scroll right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Carousel */}
      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto flex gap-6 sm:gap-8 px-4 sm:px-6 pb-8 snap-x snap-mandatory hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="w-2 sm:w-[5vw] shrink-0" /> {/* Spacer */}
        {extendedReels.map((reel, idx) => (
          <motion.div
            key={`${reel.id}-${idx}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "0px -50px" }}
            transition={{ delay: (idx % reels.length) * 0.05 }}
            className="snap-center sm:snap-start shrink-0"
          >
            <ReelCard reel={reel} />
          </motion.div>
        ))}
        <div className="w-4 sm:w-[5vw] shrink-0" /> {/* End Spacer */}
      </div>


      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
