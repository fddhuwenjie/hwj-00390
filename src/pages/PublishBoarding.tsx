import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import {
  SPECIES_LABELS,
  SPECIES_EMOJI,
  BOARDING_METHOD_LABELS,
} from '../../shared/types';
import type {
  Pet,
  BoardingMethod,
  Species,
} from '../../shared/types';
import {
  ArrowLeft,
  PawPrint,
  Calendar,
  Utensils,
  Pill,
  Ban,
  Phone,
  Wallet,
  Home as HomeIcon,
  MapPin,
  Building,
} from 'lucide-react';

export default function PublishBoarding() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [adoptedPets, setAdoptedPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dietPreference, setDietPreference] = useState('');
  const [medication, setMedication] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [acceptedMethods, setAcceptedMethods] = useState<BoardingMethod[]>([]);
  const [budgetMin, setBudgetMin] = useState(50);
  const [budgetMax, setBudgetMax] = useState(200);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      boardingApi.getAdoptedPets(currentUser.id).then(setAdoptedPets).catch(console.error);
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

  const toggleMethod = (method: BoardingMethod) => {
    setAcceptedMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedPetId) {
      setError('请选择要寄养的宠物');
      return;
    }
    if (!startDate || !endDate) {
      setError('请选择寄养日期范围');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError('结束日期必须晚于开始日期');
      return;
    }
    if (acceptedMethods.length === 0) {
      setError('请至少选择一种寄养方式');
      return;
    }
    if (budgetMin > budgetMax) {
      setError('预算最小值不能大于最大值');
      return;
    }
    if (!emergencyContact) {
      setError('请填写紧急联系方式');
      return;
    }

    const pet = adoptedPets.find(p => p.id === selectedPetId);
    if (!pet) return;

    setLoading(true);
    try {
      const req = await boardingApi.createRequest({
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        ownerAvatar: currentUser.avatar,
        petId: pet.id,
        petName: pet.name,
        petSpecies: pet.species as Species,
        petPhoto: pet.photoUrls[0],
        startDate,
        endDate,
        specialCare: { dietPreference, medication, restrictions },
        acceptedMethods,
        budgetMin,
        budgetMax,
        emergencyContact,
      });
      navigate(`/boarding/match/${req.id}`);
    } catch (err) {
      setError('发布失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/boarding')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> 返回寄养服务
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <PawPrint className="w-6 h-6 text-primary-500" />
          发布寄养需求
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-primary-500" />
              选择寄养宠物（从已领养的宠物中选择）
            </label>
            {adoptedPets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {adoptedPets.map(pet => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedPetId === pet.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-cream-200 hover:border-cream-300 bg-white'
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg overflow-hidden bg-cream-100 mb-2">
                      <img src={pet.photoUrls[0]} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="font-medium text-gray-800">{pet.name}</p>
                    <p className="text-xs text-gray-500">
                      {SPECIES_EMOJI[pet.species as Species]} {SPECIES_LABELS[pet.species as Species]} · {pet.breed}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-cream-50 rounded-xl p-8 text-center">
                <p className="text-gray-500 mb-3">您还没有已领养的宠物</p>
                <Link to="/" className="text-primary-600 font-medium hover:underline">
                  去首页看看可领养的宠物 →
                </Link>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              寄养日期范围
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 mb-1 block">开始日期</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500 mb-1 block">结束日期</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">特殊护理要求</label>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Utensils className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-600">饮食偏好</span>
                </div>
                <textarea
                  value={dietPreference}
                  onChange={e => setDietPreference(e.target.value)}
                  placeholder="例如：早晚各一次猫粮，每次约30克，温水泡软"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Pill className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-gray-600">用药说明</span>
                </div>
                <textarea
                  value={medication}
                  onChange={e => setMedication(e.target.value)}
                  placeholder="例如：关节保健品每日1粒，饭后服用"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Ban className="w-4 h-4 text-rose-500" />
                  <span className="text-sm text-gray-600">禁忌事项</span>
                </div>
                <textarea
                  value={restrictions}
                  onChange={e => setRestrictions(e.target.value)}
                  placeholder="例如：不能吃人类食物，不能喝牛奶，避免剧烈运动"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <HomeIcon className="w-4 h-4 text-primary-500" />
              可接受的寄养方式（可多选）
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['home_visit', 'foster_home', 'pet_hotel'] as BoardingMethod[]).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => toggleMethod(method)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    acceptedMethods.includes(method)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-cream-200 hover:border-cream-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {method === 'home_visit' ? '🚶' : method === 'foster_home' ? '🏠' : '🏨'}
                  </div>
                  <p className="font-medium text-gray-800">{BOARDING_METHOD_LABELS[method]}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {method === 'home_visit' && '寄养人上门照料'}
                    {method === 'foster_home' && '送至寄养人家中'}
                    {method === 'pet_hotel' && '专业宠物旅馆'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary-500" />
              预算范围（元/天）
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={budgetMin}
                onChange={e => setBudgetMin(Number(e.target.value))}
                min={0}
                className="w-32 px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                value={budgetMax}
                onChange={e => setBudgetMax(Number(e.target.value))}
                min={0}
                className="w-32 px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="text-gray-500 text-sm">元/天</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-500" />
              紧急联系方式
            </label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={e => setEmergencyContact(e.target.value)}
              placeholder="请输入手机号码，寄养期间如有紧急情况将联系此号码"
              className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              disabled={loading || adoptedPets.length === 0}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '发布中...' : '发布需求并匹配寄养人'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
