import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import StoryCarousel from '@/components/StoryCarousel';
import FilterBar from '@/components/FilterBar';
import PetCard from '@/components/PetCard';
import { cn } from '@/lib/utils';
import type { Species, Gender, PersonalityTag, SortOrder, PetFilters } from '../../shared/types';

function PetSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden break-inside-avoid mb-5 animate-pulse-soft">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-3">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-8" />
          <div className="h-4 bg-gray-200 rounded w-10" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-6 bg-gray-200 rounded-full w-14" />
          <div className="h-6 bg-gray-200 rounded-full w-14" />
          <div className="h-6 bg-gray-200 rounded-full w-14" />
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="flex gap-3">
            <div className="h-4 bg-gray-200 rounded w-10" />
            <div className="h-4 bg-gray-200 rounded w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyPets() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="text-7xl mb-4">🐾</div>
      <h3 className="font-display text-2xl text-gray-700 mb-2">暂无符合条件的宠物</h3>
      <p className="text-gray-500 mb-6">换个筛选条件试试吧~</p>
      <div className="flex gap-2 text-4xl">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🐱</span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>🐶</span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>🐰</span>
        <span className="animate-bounce" style={{ animationDelay: '450ms' }}>🐦</span>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    currentUser,
    pets,
    featuredStories,
    loading,
    fetchPets,
    fetchFeaturedStories,
    fetchFavorites,
    fetchFollows,
    fetchHistory,
  } = useAppStore();

  const [keyword, setKeyword] = useState('');
  const [species, setSpecies] = useState<Species | 'all'>('all');
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [neutered, setNeutered] = useState<boolean | undefined>(undefined);
  const [ageMin, setAgeMin] = useState(0);
  const [ageMax, setAgeMax] = useState(180);
  const [selectedTag, setSelectedTag] = useState<PersonalityTag | undefined>(undefined);
  const [sort, setSort] = useState<SortOrder>('newest');

  const buildFilters = useCallback((): PetFilters => {
    const filters: PetFilters = { sort };
    if (keyword) filters.keyword = keyword;
    if (species !== 'all') filters.species = species;
    if (gender !== undefined) filters.gender = gender;
    if (neutered !== undefined) filters.neutered = neutered;
    if (ageMin > 0) filters.ageMin = ageMin;
    if (ageMax < 180) filters.ageMax = ageMax;
    if (selectedTag) filters.tag = selectedTag;
    return filters;
  }, [keyword, species, gender, neutered, ageMin, ageMax, selectedTag, sort]);

  useEffect(() => {
    fetchPets(buildFilters());
  }, [buildFilters, fetchPets]);

  useEffect(() => {
    fetchFeaturedStories();
  }, [fetchFeaturedStories]);

  useEffect(() => {
    if (currentUser) {
      fetchFavorites(currentUser.id);
      fetchFollows(currentUser.id);
      fetchHistory(currentUser.id);
    }
  }, [currentUser, fetchFavorites, fetchFollows, fetchHistory]);

  const handleFilterChange = (filters: {
    keyword?: string;
    species?: Species | 'all';
    gender?: Gender | undefined;
    neutered?: boolean | undefined;
    ageMin?: number;
    ageMax?: number;
    selectedTag?: PersonalityTag | undefined;
    sort?: SortOrder;
  }) => {
    if (filters.keyword !== undefined) setKeyword(filters.keyword);
    if (filters.species !== undefined) setSpecies(filters.species);
    if (filters.gender !== undefined) setGender(filters.gender);
    if (filters.neutered !== undefined) setNeutered(filters.neutered);
    if (filters.ageMin !== undefined) setAgeMin(filters.ageMin);
    if (filters.ageMax !== undefined) setAgeMax(filters.ageMax);
    if (filters.selectedTag !== undefined) setSelectedTag(filters.selectedTag);
    if (filters.sort !== undefined) setSort(filters.sort);
  };

  const handleQuickSort = (newSort: SortOrder) => {
    if (sort !== newSort) {
      setSort(newSort);
    }
  };

  return (
    <div className="animate-fade-in">
      <StoryCarousel stories={featuredStories} />

      <div className="text-center mb-8">
        <h1 className="font-display text-4xl md:text-5xl text-primary-500 mb-3">
          🐾 寻找你的毛孩子
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          在这里，每一只小可爱都在等待一个温暖的家
        </p>
      </div>

      <FilterBar
        keyword={keyword}
        species={species}
        gender={gender}
        neutered={neutered}
        ageMin={ageMin}
        ageMax={ageMax}
        selectedTag={selectedTag}
        sort={sort}
        onChange={handleFilterChange}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-500">
          共 <span className="font-semibold text-primary-500">{pets.length}</span> 只宠物等你带回家
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm px-2 py-1">
          <button
            onClick={() => handleQuickSort('newest')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              sort === 'newest'
                ? 'bg-primary-400 text-white shadow-sm'
                : 'text-gray-600 hover:bg-cream-100'
            )}
          >
            最新
          </button>
          <button
            onClick={() => handleQuickSort('popular')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              sort === 'popular'
                ? 'bg-primary-400 text-white shadow-sm'
                : 'text-gray-600 hover:bg-cream-100'
            )}
          >
            热门
          </button>
        </div>
      </div>

      {loading ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <PetSkeleton key={i} />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <EmptyPets />
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
