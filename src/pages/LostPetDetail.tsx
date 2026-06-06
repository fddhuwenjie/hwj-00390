import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Phone, AlertTriangle, CheckCircle, Eye, Send, User, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  SPECIES_LABELS,
  SPECIES_EMOJI,
  LOST_PET_STATUS_LABELS,
} from '../../shared/types';

export default function LostPetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentUser, lostPets, lostPetSightings, fetchLostPets, fetchLostPetSightings, addLostPetSighting, markLostPetFound } = useAppStore();

  const [showSightingForm, setShowSightingForm] = useState(false);
  const [sightingForm, setSightingForm] = useState({
    time: new Date().toISOString().slice(0, 16),
    location: '',
    description: '',
    photoUrls: '',
  });

  useEffect(() => {
    fetchLostPets();
  }, [fetchLostPets]);

  useEffect(() => {
    if (id) fetchLostPetSightings(id);
  }, [id, fetchLostPetSightings]);

  const pet = lostPets.find((p) => p.id === id);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (!pet) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
        <div className="text-gray-500 mb-4">未找到该走失信息</div>
        <button onClick={() => navigate('/lost')} className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition">
          返回列表</button>
      </div>
    );
  }

  const isReporter = currentUser?.id === pet.reporterId;

  const handleSubmitSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !id) return;
    await addLostPetSighting(id, {
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      time: new Date(sightingForm.time).toISOString(),
      location: sightingForm.location,
      description: sightingForm.description,
      photoUrls: sightingForm.photoUrls ? [sightingForm.photoUrls] : [],
    });
    setShowSightingForm(false);
    setSightingForm({
      time: new Date().toISOString().slice(0, 16),
      location: '',
      description: '',
      photoUrls: '',
    });
  };

  const handleMarkFound = async () => {
    if (!id) await markLostPetFound(id);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/lost')}
        className="flex items-center gap-1 text-gray-600 hover:text-primary-600 mb-4 text-sm font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-72 bg-cream-100">
            {pet.photoUrls[0] && (
              <img src={pet.photoUrls[0]} alt={pet.petName} className="w-full h-full object-cover" />
            )}
            <div
              className={cn(
                'absolute top-4 right-4 text-sm font-semibold px-4 py-2 rounded-full shadow-md',
                pet.status === 'lost' ? 'bg-rose-500 text-white' : 'bg-mint-500 text-white'
              )}
            >
              {pet.status === 'lost' ? (
                <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" />
                  {LOST_PET_STATUS_LABELS[pet.status]}</span>
              ) : (
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" />
                  {LOST_PET_STATUS_LABELS[pet.status]}</span>
              )}
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{SPECIES_EMOJI[pet.species]}</span>
                <h1 className="font-display text-3xl text-gray-800">{pet.petName}</h1>
              </div>
              {pet.breed && <p className="text-gray-500">{pet.breed}</p>}
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">走失地点</div>
                  <div className="text-gray-800">{pet.location}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">走失时间</div>
                  <div className="text-gray-800">{formatDate(pet.lostTime)}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">联系方式</div>
                  <div className="text-gray-800">{pet.contact}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">登记人</div>
                  <div className="text-gray-800">{pet.reporterName}</div>
                </div>
              </div>
            </div>

            <div className="bg-cream-50 rounded-2xl p-4 mb-6">
              <div className="text-xs text-gray-500 mb-1">特征描述</div>
              <div className="text-gray-800">{pet.features}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {pet.status === 'lost' && currentUser && !isReporter && (
                <button
                  onClick={() => setShowSightingForm(!showSightingForm)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 text-white font-medium rounded-full shadow-soft hover:shadow-md transition"
                >
                  <Eye className="w-4 h-4" />
                  提供线索
                </button>
              )}
              {isReporter && pet.status === 'lost' && (
                <button
                onClick={handleMarkFound}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-mint-400 to-mint-500 text-white font-medium rounded-full shadow-soft hover:shadow-md transition"
              >
                <CheckCircle className="w-4 h-4" />
                标记已寻回
              </button>
            )}
            </div>
          </div>
        </div>
      </div>

      {showSightingForm && currentUser && (
        <div className="bg-white rounded-3xl shadow-card p-6 mb-6 animate-fade-in">
          <h3 className="font-display text-xl text-gray-800 mb-4">🔍 提供目击线索</h3>
          <form onSubmit={handleSubmitSighting} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目击时间 <span className="text-primary-500">*</span></label>
                <input
                  type="datetime-local"
                  required
                  value={sightingForm.time}
                  onChange={(e) => setSightingForm({ ...sightingForm, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目击地点 <span className="text-primary-500">*</span></label>
                <input
                  required
                  value={sightingForm.location}
                  onChange={(e) => setSightingForm({ ...sightingForm, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                  placeholder="详细地点"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">详细描述 <span className="text-primary-500">*</span></label>
              <textarea
                rows={3}
                required
                value={sightingForm.description}
                onChange={(e) => setSightingForm({ ...sightingForm, description: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
                placeholder="描述一下当时的情况，宠物的状态、行为等"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">照片URL</label>
              <input
                value={sightingForm.photoUrls}
                onChange={(e) => setSightingForm({ ...sightingForm, photoUrls: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSightingForm(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition"
              >
                <Send className="w-4 h-4" />
                提交线索
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8">
        <h3 className="font-display text-xl text-gray-800 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-sky-500" />
          目击线索（{lostPetSightings.length}）
        </h3>
        {lostPetSightings.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">👀</div>
            <p className="text-gray-500 text-sm">暂无线索，如果你见过它请提供线索</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lostPetSightings.map((s) => (
            <div key={s.id} className="bg-cream-50 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm">
                    {s.reporterName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{s.reporterName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(s.time)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-700 mt-2 mb-2">{s.description}</div>
              <div className="text-xs text-gray-600 flex items-center gap-1 mt-2">
                <MapPin className="w-3 h-3 text-primary-400" />
                {s.location}
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
