import { useNavigate } from 'react-router-dom';
import { Heart, Eye, User } from 'lucide-react';
import { cn, formatAge } from '@/lib/utils';
import type { Pet } from '../../shared/types';
import { SPECIES_LABELS, SPECIES_EMOJI } from '../../shared/types';

const TAG_COLORS = [
  'bg-pink-100 text-pink-600',
  'bg-purple-100 text-purple-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-yellow-100 text-yellow-700',
  'bg-orange-100 text-orange-600',
  'bg-cyan-100 text-cyan-600',
  'bg-rose-100 text-rose-600',
  'bg-indigo-100 text-indigo-600',
  'bg-lime-100 text-lime-700',
];

interface PetCardProps {
  pet: Pet;
  matchScore?: number;
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'from-emerald-400 to-emerald-500';
  if (score >= 60) return 'from-sky-400 to-sky-500';
  if (score >= 40) return 'from-amber-400 to-amber-500';
  return 'from-gray-400 to-gray-500';
}

export default function PetCard({ pet, matchScore }: PetCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/pet/' + pet.id);
  };

  const displayedTags = pet.personalityTags.slice(0, 3);

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bg-white rounded-2xl shadow-card overflow-hidden cursor-pointer',
        'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        'break-inside-avoid mb-5'
      )}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={pet.photoUrls[0]}
          alt={pet.name}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
        />
        {pet.isAdopted && (
          <div className="absolute top-3 right-3 bg-primary-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
            已领养
          </div>
        )}
        {matchScore !== undefined && matchScore > 0 && (
          <div className={cn(
            'absolute top-3 left-3 bg-gradient-to-r text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md',
            getMatchScoreColor(matchScore)
          )}>
            匹配度 {matchScore}%
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-xl text-gray-800">{pet.name}</h3>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium">
            <span>{SPECIES_EMOJI[pet.species]}</span>
            <span>{SPECIES_LABELS[pet.species]}</span>
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-3">{pet.breed}</p>

        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          <span>{formatAge(pet.age)}</span>
          <span
            className={cn(
              'font-bold',
              pet.gender === 'male' ? 'text-sky-500' : 'text-pink-500'
            )}
          >
            {pet.gender === 'male' ? '♂' : '♀'}
          </span>
          <span>{pet.weight}kg</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {displayedTags.map((tag, index) => (
            <span
              key={tag}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full font-medium',
                TAG_COLORS[index % TAG_COLORS.length]
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <User size={14} />
            <span className="truncate max-w-[100px]">{pet.publisherName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Heart size={14} className="text-primary-400" />
              <span>{pet.favoriteCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} className="text-gray-400" />
              <span>{pet.viewCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
