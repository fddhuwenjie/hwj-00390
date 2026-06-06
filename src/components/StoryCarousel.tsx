import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Story } from '../../shared/types';

interface StoryCarouselProps {
  stories: Story[];
}

export default function StoryCarousel({ stories }: StoryCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    if (stories.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }
  }, [stories.length]);

  const prev = useCallback(() => {
    if (stories.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    }
  }, [stories.length]);

  useEffect(() => {
    if (stories.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, stories.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [stories]);

  if (!stories || stories.length === 0) {
    return null;
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-card mb-8 group">
      {stories.map((story, index) => (
        <div
          key={story.id}
          onClick={() => navigate(`/story/${story.id}`)}
          className={cn(
            'absolute inset-0 cursor-pointer transition-opacity duration-700',
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}
        >
          <img
            src={story.images[0]}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <h3 className="font-display text-2xl md:text-3xl mb-2 drop-shadow-lg">
              {story.title}
            </h3>
            <div className="flex items-center gap-4 text-white/90 text-sm md:text-base">
              <span className="flex items-center gap-1">
                <span className="text-lg">{story.authorAvatar}</span>
                {story.authorName}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={16} className="fill-current text-primary-400" />
                {story.likes}
              </span>
            </div>
          </div>
        </div>
      ))}

      {stories.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className={cn(
              'absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-20',
              'w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm',
              'flex items-center justify-center text-white',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              'hover:bg-white/40'
            )}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className={cn(
              'absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20',
              'w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm',
              'flex items-center justify-center text-white',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              'hover:bg-white/40'
            )}
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'w-8 bg-primary-400'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
