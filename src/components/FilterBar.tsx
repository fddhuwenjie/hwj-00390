import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Species, Gender, PersonalityTag, SortOrder } from '../../shared/types';
import { SPECIES_LABELS, SPECIES_EMOJI, ALL_PERSONALITY_TAGS } from '../../shared/types';

const TAG_COLORS = [
  'bg-pink-100 text-pink-600 hover:bg-pink-200 border-pink-200',
  'bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200',
  'bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200',
  'bg-green-100 text-green-600 hover:bg-green-200 border-green-200',
  'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200',
  'bg-orange-100 text-orange-600 hover:bg-orange-200 border-orange-200',
  'bg-cyan-100 text-cyan-600 hover:bg-cyan-200 border-cyan-200',
  'bg-rose-100 text-rose-600 hover:bg-rose-200 border-rose-200',
  'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border-indigo-200',
  'bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200',
];

const TAG_ACTIVE_COLORS = [
  'bg-pink-500 text-white border-pink-500',
  'bg-purple-500 text-white border-purple-500',
  'bg-blue-500 text-white border-blue-500',
  'bg-green-500 text-white border-green-500',
  'bg-yellow-500 text-white border-yellow-500',
  'bg-orange-500 text-white border-orange-500',
  'bg-cyan-500 text-white border-cyan-500',
  'bg-rose-500 text-white border-rose-500',
  'bg-indigo-500 text-white border-indigo-500',
  'bg-lime-500 text-white border-lime-500',
];

export interface FilterBarProps {
  keyword: string;
  species: Species | 'all';
  gender: Gender | undefined;
  neutered: boolean | undefined;
  ageMin: number;
  ageMax: number;
  selectedTag: PersonalityTag | undefined;
  sort: SortOrder;
  onChange: (filters: {
    keyword?: string;
    species?: Species | 'all';
    gender?: Gender | undefined;
    neutered?: boolean | undefined;
    ageMin?: number;
    ageMax?: number;
    selectedTag?: PersonalityTag | undefined;
    sort?: SortOrder;
  }) => void;
}

export default function FilterBar({
  keyword,
  species,
  gender,
  neutered,
  ageMin,
  ageMax,
  selectedTag,
  sort,
  onChange,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const speciesOptions: (Species | 'all')[] = ['all', 'cat', 'dog', 'rabbit', 'bird', 'other'];

  const handleTagClick = (tag: PersonalityTag) => {
    onChange({ selectedTag: selectedTag === tag ? undefined : tag });
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 md:p-5 mb-6">
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
          placeholder="搜索宠物名称、品种..."
          className="w-full pl-12 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all"
        />
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {speciesOptions.map((s) => {
            const isActive = species === s;
            const label = s === 'all' ? '全部' : SPECIES_LABELS[s];
            const emoji = s === 'all' ? '🐾' : SPECIES_EMOJI[s];
            return (
              <button
                key={s}
                onClick={() => onChange({ species: s })}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-400 text-white shadow-md shadow-primary-200'
                    : 'bg-cream-50 text-gray-600 hover:bg-cream-100 border border-cream-200'
                )}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500 transition-colors mb-4"
      >
        <SlidersHorizontal size={16} />
        <span>更多筛选</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="space-y-4 pb-2 mb-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">性别</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onChange({ gender: gender === 'male' ? undefined : 'male' })}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    gender === 'male'
                      ? 'bg-sky-500 text-white'
                      : 'bg-cream-50 text-gray-600 hover:bg-cream-100 border border-cream-200'
                  )}
                >
                  ♂ 公
                </button>
                <button
                  onClick={() => onChange({ gender: gender === 'female' ? undefined : 'female' })}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    gender === 'female'
                      ? 'bg-pink-500 text-white'
                      : 'bg-cream-50 text-gray-600 hover:bg-cream-100 border border-cream-200'
                  )}
                >
                  ♀ 母
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">是否绝育</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onChange({ neutered: neutered === true ? undefined : true })}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    neutered === true
                      ? 'bg-mint-500 text-white'
                      : 'bg-cream-50 text-gray-600 hover:bg-cream-100 border border-cream-200'
                  )}
                >
                  已绝育
                </button>
                <button
                  onClick={() => onChange({ neutered: neutered === false ? undefined : false })}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    neutered === false
                      ? 'bg-gray-500 text-white'
                      : 'bg-cream-50 text-gray-600 hover:bg-cream-100 border border-cream-200'
                  )}
                >
                  未绝育
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              年龄范围（月龄）: {ageMin} - {ageMax}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={180}
                value={ageMin}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), ageMax);
                  onChange({ ageMin: val });
                }}
                className="flex-1 accent-primary-400"
              />
              <input
                type="range"
                min={0}
                max={180}
                value={ageMax}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), ageMin);
                  onChange({ ageMax: val });
                }}
                className="flex-1 accent-primary-400"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">性格标签</label>
        <div className="flex flex-wrap gap-2">
          {ALL_PERSONALITY_TAGS.map((tag, index) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                  isActive ? TAG_ACTIVE_COLORS[index % TAG_ACTIVE_COLORS.length] : TAG_COLORS[index % TAG_COLORS.length]
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500 mr-2">排序:</span>
        <button
          onClick={() => onChange({ sort: 'newest' })}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            sort === 'newest'
              ? 'bg-primary-100 text-primary-600'
              : 'text-gray-600 hover:bg-cream-100'
          )}
        >
          最新发布
        </button>
        <button
          onClick={() => onChange({ sort: 'popular' })}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            sort === 'popular'
              ? 'bg-primary-100 text-primary-600'
              : 'text-gray-600 hover:bg-cream-100'
          )}
        >
          最受欢迎
        </button>
      </div>
    </div>
  );
}
