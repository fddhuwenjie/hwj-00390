import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Eye, Plus, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  SPECIES_LABELS,
  SPECIES_EMOJI,
  LOST_PET_STATUS_LABELS,
} from '../../shared/types';
import type { LostPetStatus } from '../../shared/types';

export default function LostPets() {
  const navigate = useNavigate();
  const { currentUser, lostPets, loading, fetchLostPets } = useAppStore();
  const [filter, setFilter] = useState<LostPetStatus | 'all'>('all');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchLostPets();
  }, [fetchLostPets]);

  const filteredPets = lostPets.filter((pet) => {
    if (filter !== 'all' && pet.status !== filter) return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      return (
        pet.petName.toLowerCase().includes(kw) ||
        pet.location.toLowerCase().includes(kw) ||
        pet.features.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-3xl text-primary-500 mb-1">🔍 走失寻回</h1>
          <p className="text-gray-500 text-sm">帮助走失的毛孩子找到回家的路</p>
        </div>
        {currentUser && (
          <button
            onClick={() => navigate('/lost/register')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-medium rounded-full shadow-soft hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            登记走失
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-soft p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索名字、地点、特征..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-cream-100 rounded-xl p-1">
            {(['all', 'lost', 'found'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  filter === status
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                )}
              >
                {status === 'all' ? '全部' : LOST_PET_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card overflow-hidden animate-pulse-soft">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-7xl mb-4">🐾</div>
          <h3 className="font-display text-2xl text-gray-700 mb-2">暂无走失信息</h3>
          <p className="text-gray-500">
            {filter === 'found' ? '还没有宠物被寻回' : '目前没有走失中的宠物'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPets.map((pet) => (
            <Link
              key={pet.id}
              to={`/lost/${pet.id}`}
              className="bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
            >
              <div className="relative h-48 overflow-hidden bg-cream-100">
                {pet.photoUrls[0] && (
                  <img
                    src={pet.photoUrls[0]}
                    alt={pet.petName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div
                  className={cn(
                    'absolute top-3 right-3 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md',
                    pet.status === 'lost'
                      ? 'bg-rose-500 text-white'
                      : 'bg-mint-500 text-white'
                  )}
                >
                  {pet.status === 'lost' ? (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {LOST_PET_STATUS_LABELS[pet.status]}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {LOST_PET_STATUS_LABELS[pet.status]}
                    </span>
                  )}
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs px-2.5 py-1 rounded-full font-medium text-gray-700">
                  {SPECIES_EMOJI[pet.species]} {SPECIES_LABELS[pet.species]}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg text-gray-800">{pet.petName}</h3>
                  {pet.sightingCount > 0 && (
                    <span className="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {pet.sightingCount} 条线索
                    </span>
                  )}
                </div>
                {pet.breed && <p className="text-sm text-gray-500 mb-3">{pet.breed}</p>}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{pet.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    <span>{formatDate(pet.lostTime)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
