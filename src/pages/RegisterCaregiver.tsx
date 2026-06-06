import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import {
  SPECIES_LABELS,
  SPECIES_EMOJI,
} from '../../shared/types';
import type {
  Species,
  BoardingCaregiver,
} from '../../shared/types';
import {
  ArrowLeft,
  Star,
  Building,
  Trees,
  Award,
  Wallet,
  MapPin,
  Calendar as CalendarIcon,
  PawPrint,
  User,
} from 'lucide-react';

export default function RegisterCaregiver() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [existing, setExisting] = useState<BoardingCaregiver | null>(null);
  const [livingArea, setLivingArea] = useState(80);
  const [hasYard, setHasYard] = useState(false);
  const [petExperienceYears, setPetExperienceYears] = useState(3);
  const [acceptedSpecies, setAcceptedSpecies] = useState<Species[]>(['cat', 'dog']);
  const [maxPetsAtOnce, setMaxPetsAtOnce] = useState(3);
  const [pricePerDay, setPricePerDay] = useState(100);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(5);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      boardingApi.getMyCaregiver(currentUser.id).then(cg => {
        if (cg) {
          setExisting(cg);
          setLivingArea(cg.livingArea);
          setHasYard(cg.hasYard);
          setPetExperienceYears(cg.petExperienceYears);
          setAcceptedSpecies(cg.acceptedSpecies);
          setMaxPetsAtOnce(cg.maxPetsAtOnce);
          setPricePerDay(cg.pricePerDay);
          setServiceRadiusKm(cg.serviceRadiusKm);
          setAvailableDates(cg.availableDates);
          setBio(cg.bio || '');
        } else {
          const defaultDates: string[] = [];
          const today = new Date();
          for (let i = 1; i <= 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() + i);
            defaultDates.push(d.toISOString().split('T')[0]);
          }
          setAvailableDates(defaultDates);
        }
      }).catch(console.error);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">🐾</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">请先登录</h2>
      </div>
    );
  }

  const toggleSpecies = (s: Species) => {
    setAcceptedSpecies(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const toggleDate = (dateStr: string) => {
    setAvailableDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (acceptedSpecies.length === 0) {
      setError('请至少选择一种可接待物种');
      return;
    }
    if (availableDates.length === 0) {
      setError('请至少选择一个可接单日期');
      return;
    }

    setLoading(true);
    try {
      await boardingApi.registerCaregiver({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        livingArea,
        hasYard,
        petExperienceYears,
        acceptedSpecies,
        maxPetsAtOnce,
        pricePerDay,
        serviceRadiusKm,
        availableDates,
        bio,
      });
      navigate('/boarding');
    } catch (err) {
      setError('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const allSpecies: Species[] = ['cat', 'dog', 'rabbit', 'bird', 'other'];

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/boarding')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> 返回寄养服务
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Star className="w-6 h-6 text-primary-500" />
          {existing ? '更新寄养人资料' : '注册成为寄养人'}
        </h1>
        <p className="text-gray-500 mb-8">
          填写您的资质信息，审核通过后即可开始接单
        </p>

        <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl mb-8">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm">
            {currentUser.avatar}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{currentUser.name}</p>
            <p className="text-sm text-gray-500">作为寄养人身份注册</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">资质信息</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-gray-600">居住面积（㎡）</span>
                </div>
                <input
                  type="number"
                  value={livingArea}
                  onChange={e => setLivingArea(Number(e.target.value))}
                  min={10}
                  max={500}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trees className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">是否有院子</span>
                </div>
                <div className="flex items-center gap-4 h-[42px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={hasYard}
                      onChange={() => setHasYard(true)}
                      className="w-4 h-4 text-primary-500"
                    />
                    <span>是</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!hasYard}
                      onChange={() => setHasYard(false)}
                      className="w-4 h-4 text-primary-500"
                    />
                    <span>否</span>
                  </label>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-600">养宠经验（年）</span>
                </div>
                <input
                  type="number"
                  value={petExperienceYears}
                  onChange={e => setPetExperienceYears(Number(e.target.value))}
                  min={0}
                  max={50}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <PawPrint className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-gray-600">最大同时接待数量</span>
                </div>
                <input
                  type="number"
                  value={maxPetsAtOnce}
                  onChange={e => setMaxPetsAtOnce(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-primary-500" />
              可接待物种（可多选）
            </label>
            <div className="flex flex-wrap gap-3">
              {allSpecies.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecies(s)}
                  className={`px-4 py-2.5 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    acceptedSpecies.includes(s)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-cream-200 bg-white hover:border-cream-300 text-gray-600'
                  }`}
                >
                  <span className="text-xl">{SPECIES_EMOJI[s]}</span>
                  <span className="font-medium">{SPECIES_LABELS[s]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">服务信息</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-gray-600">服务报价（元/天）</span>
                </div>
                <input
                  type="number"
                  value={pricePerDay}
                  onChange={e => setPricePerDay(Number(e.target.value))}
                  min={10}
                  max={1000}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-sm text-gray-600">服务范围（km）</span>
                </div>
                <input
                  type="number"
                  value={serviceRadiusKm}
                  onChange={e => setServiceRadiusKm(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary-500" />
              可用时间段（点击选择可接单的日期）
            </label>
            <div className="p-4 bg-cream-50 rounded-xl">
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">
                {['一', '二', '三', '四', '五', '六', '日'].map(d => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const days = generateCalendarDays();
                  const firstDay = new Date(days[0]).getDay();
                  const blanks = firstDay === 0 ? 6 : firstDay - 1;
                  return (
                    <>
                      {Array.from({ length: blanks }).map((_, i) => (
                        <div key={`blank-${i}`} />
                      ))}
                      {days.map(d => {
                        const day = new Date(d);
                        const selected = availableDates.includes(d);
                        const isToday = d === new Date().toISOString().split('T')[0];
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDate(d)}
                            className={`p-2 rounded-lg text-sm transition-all ${
                              selected
                                ? 'bg-primary-500 text-white font-medium'
                                : isToday
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-white text-gray-600 hover:bg-primary-50 border border-cream-200'
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-3">已选择 {availableDates.length} 天可接单</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-500" />
              个人简介（选填）
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="简单介绍一下您的养宠经验、寄养环境或服务特色..."
              rows={3}
              className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/boarding')}
              className="flex-1 px-6 py-3 border border-cream-300 rounded-xl font-medium text-gray-700 hover:bg-cream-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '提交中...' : existing ? '更新资料（重新审核）' : '提交注册申请'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
