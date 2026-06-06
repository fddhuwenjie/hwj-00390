import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import StoryCarousel from '@/components/StoryCarousel';
import FilterBar from '@/components/FilterBar';
import PetCard from '@/components/PetCard';
import { cn } from '@/lib/utils';
import { Sparkles, Settings, X } from 'lucide-react';
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

function PreferenceModal({
  open,
  onClose,
  onSubmit,
  initialPref,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    livingEnvironment: string;
    hasPetExperience: boolean;
    dailyCompanionTime: string;
    familyMembers: string;
  }) => void;
  initialPref?: {
    livingEnvironment: string;
    hasPetExperience: boolean;
    dailyCompanionTime: string;
    familyMembers: string;
  } | null;
}) {
  const [form, setForm] = useState({
    livingEnvironment: initialPref?.livingEnvironment || '自有住房',
    hasPetExperience: initialPref?.hasPetExperience ? '是' : '否',
    dailyCompanionTime: initialPref?.dailyCompanionTime || '2-4小时',
    familyMembers: initialPref?.familyMembers || '',
  });

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit({
      livingEnvironment: form.livingEnvironment,
      hasPetExperience: form.hasPetExperience === '是',
      dailyCompanionTime: form.dailyCompanionTime,
      familyMembers: form.familyMembers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-display text-xl text-gray-800">🎯 设置养宠偏好</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">居住环境</label>
            <div className="flex flex-wrap gap-3">
              {['自有住房', '租房', '和家人同住', '独栋别墅带院子'].map((opt) => (
                <label
                  key={opt}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-full border-2 cursor-pointer transition',
                    form.livingEnvironment === opt
                      ? 'border-primary-400 bg-primary-50 text-primary-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200'
                  )}
                >
                  <input
                    type="radio"
                    name="livingEnv"
                    value={opt}
                    checked={form.livingEnvironment === opt}
                    onChange={(e) => setForm({ ...form, livingEnvironment: e.target.value })}
                    className="sr-only"
                  />
                  <span className="font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">是否有养宠经验</label>
            <div className="flex gap-3">
              {['是', '否'].map((opt) => (
                <label
                  key={opt}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2.5 rounded-full border-2 cursor-pointer transition',
                    form.hasPetExperience === opt
                      ? 'border-primary-400 bg-primary-50 text-primary-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200'
                  )}
                >
                  <input
                    type="radio"
                    name="experience"
                    value={opt}
                    checked={form.hasPetExperience === opt}
                    onChange={(e) => setForm({ ...form, hasPetExperience: e.target.value })}
                    className="sr-only"
                  />
                  <span className="font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">每日可陪伴时间</label>
            <div className="flex flex-wrap gap-3">
              {['<2小时', '2-4小时', '4-8小时', '>8小时'].map((opt) => (
                <label
                  key={opt}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-full border-2 cursor-pointer transition',
                    form.dailyCompanionTime === opt
                      ? 'border-primary-400 bg-primary-50 text-primary-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200'
                  )}
                >
                  <input
                    type="radio"
                    name="companionTime"
                    value={opt}
                    checked={form.dailyCompanionTime === opt}
                    onChange={(e) => setForm({ ...form, dailyCompanionTime: e.target.value })}
                    className="sr-only"
                  />
                  <span className="font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">家庭成员情况</label>
            <textarea
              rows={3}
              placeholder="例如：一家三口，孩子5岁；或独居；和父母同住..."
              value={form.familyMembers}
              onChange={(e) => setForm({ ...form, familyMembers: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
            />
          </div>
        </div>
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-medium rounded-2xl shadow-soft hover:shadow-md transition"
          >
            保存并获取推荐
          </button>
        </div>
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
    recommendedPets,
    userPreference,
    fetchPets,
    fetchFeaturedStories,
    fetchFavorites,
    fetchFollows,
    fetchHistory,
    fetchRecommendations,
    fetchUserPreference,
    setUserPreference,
  } = useAppStore();

  const [keyword, setKeyword] = useState('');
  const [species, setSpecies] = useState<Species | 'all'>('all');
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [neutered, setNeutered] = useState<boolean | undefined>(undefined);
  const [ageMin, setAgeMin] = useState(0);
  const [ageMax, setAgeMax] = useState(20);
  const [selectedTag, setSelectedTag] = useState<PersonalityTag | undefined>(undefined);
  const [sort, setSort] = useState<SortOrder>('newest');
  const [showPrefModal, setShowPrefModal] = useState(false);

  const buildFilters = useCallback((): PetFilters => {
    const filters: PetFilters = { sort };
    if (keyword) filters.keyword = keyword;
    if (species !== 'all') filters.species = species;
    if (gender !== undefined) filters.gender = gender;
    if (neutered !== undefined) filters.neutered = neutered;
    if (ageMin > 0) filters.ageMin = ageMin;
    if (ageMax < 20) filters.ageMax = ageMax;
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
      fetchRecommendations(currentUser.id, 6);
      fetchUserPreference(currentUser.id);
    }
  }, [currentUser, fetchFavorites, fetchFollows, fetchHistory, fetchRecommendations, fetchUserPreference]);

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

  const handleSavePreference = async (data: {
    livingEnvironment: string;
    hasPetExperience: boolean;
    dailyCompanionTime: string;
    familyMembers: string;
  }) => {
    if (!currentUser) return;
    await setUserPreference(currentUser.id, data);
    await fetchRecommendations(currentUser.id, 6);
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

      {currentUser && recommendedPets.length > 0 && (
        <div className="bg-white rounded-3xl shadow-card p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h2 className="font-display text-2xl text-gray-800">✨ 为你推荐</h2>
              {userPreference && (
                <span className="text-xs text-gray-500 ml-2">基于你的养宠偏好</span>
              )}
            </div>
            <button
              onClick={() => setShowPrefModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-cream-100 hover:bg-cream-200 text-gray-700 rounded-full text-sm font-medium transition"
            >
              <Settings className="w-4 h-4" />
              {userPreference ? '调整偏好' : '设置偏好'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedPets.slice(0, 6).map((pet) => (
              <PetCard key={pet.id} pet={pet} matchScore={pet.matchScore} />
            ))}
          </div>
        </div>
      )}

      {currentUser && !userPreference && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-8 border border-amber-200 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎯</span>
            <div className="flex-1">
              <h3 className="font-display text-lg text-gray-800 mb-1">想获得更精准的宠物推荐？</h3>
              <p className="text-sm text-gray-600 mb-3">设置你的养宠偏好，我们将为你推荐最适合的毛孩子！</p>
              <button
                onClick={() => setShowPrefModal(true)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-full transition"
              >
                立即设置
              </button>
            </div>
          </div>
        </div>
      )}

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

      {currentUser && (
        <PreferenceModal
          open={showPrefModal}
          onClose={() => setShowPrefModal(false)}
          onSubmit={handleSavePreference}
          initialPref={userPreference}
        />
      )}
    </div>
  );
}
