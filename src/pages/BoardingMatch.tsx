import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import {
  BOARDING_METHOD_LABELS,
  SPECIES_EMOJI,
  SPECIES_LABELS,
} from '../../shared/types';
import type {
  BoardingRequest,
  BoardingCaregiverWithScore,
  BoardingMethod,
  InsurancePlanType,
} from '../../shared/types';
import {
  INSURANCE_PLAN_PRICES,
  CAREGIVER_CERT_LEVEL_BADGES,
  CAREGIVER_CERT_LEVEL_LABELS,
} from '../../shared/types';
import {
  ArrowLeft,
  Search,
  Star,
  Award,
  MapPin,
  Trees,
  Building,
  Wallet,
  Check,
  X,
  Sparkles,
  Calendar,
  PawPrint,
} from 'lucide-react';

export default function BoardingMatch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [request, setRequest] = useState<BoardingRequest | null>(null);
  const [matches, setMatches] = useState<BoardingCaregiverWithScore[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<BoardingCaregiverWithScore | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<BoardingMethod>('foster_home');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState<InsurancePlanType | 'none'>('none');

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [req, matched] = await Promise.all([
        boardingApi.getRequest(id),
        boardingApi.getMatchingCaregivers(id),
      ]);
      setRequest(req);
      setMatches(matched);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openOrderModal = (cg: BoardingCaregiverWithScore) => {
    setSelectedCaregiver(cg);
    const commonMethod = request?.acceptedMethods.find(m => true);
    if (commonMethod) setSelectedMethod(commonMethod);
    setSelectedInsurance('none');
    setShowOrderModal(true);
  };

  const handleCreateOrder = async () => {
    if (!request || !selectedCaregiver || !currentUser) return;
    setOrderLoading(true);
    setError('');
    try {
      const order = await boardingApi.createOrder({
        requestId: request.id,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        caregiverId: selectedCaregiver.id,
        caregiverName: selectedCaregiver.userName,
        caregiverAvatar: selectedCaregiver.userAvatar,
        petId: request.petId,
        petName: request.petName,
        petPhoto: request.petPhoto,
        startDate: request.startDate,
        endDate: request.endDate,
        boardingMethod: selectedMethod,
        pricePerDay: selectedCaregiver.pricePerDay,
        handoverNotes,
        insurancePlan: selectedInsurance !== 'none' ? selectedInsurance : undefined,
      });
      await boardingApi.createAgreement(order.id);
      navigate(`/boarding/orders/${order.id}/agreement`);
    } catch (err) {
      setError('创建订单失败，请稍后重试');
    } finally {
      setOrderLoading(false);
    }
  };

  const days = request
    ? Math.max(1, Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (loading) {
    return <div className="text-center py-16 text-gray-500">加载中...</div>;
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">寄养需求不存在</p>
        <Link to="/boarding" className="text-primary-600 font-medium hover:underline">
          返回寄养服务
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/boarding')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> 返回寄养服务
      </button>

      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
              <img src={request.petPhoto} alt={request.petName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{request.petName}</h2>
                <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                  {SPECIES_EMOJI[request.petSpecies]} {SPECIES_LABELS[request.petSpecies]}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-primary-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {request.startDate} ~ {request.endDate}（{days}天）
                </span>
                <span className="flex items-center gap-1">
                  <Wallet className="w-4 h-4" />
                  预算 ¥{request.budgetMin}-¥{request.budgetMax}/天
                </span>
                <span>
                  寄养方式：{request.acceptedMethods.map(m => BOARDING_METHOD_LABELS[m]).join(' / ')}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <Search className="w-5 h-5 mx-auto mb-1" />
            <p className="text-sm font-medium">{matches.length} 位匹配寄养人</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        智能匹配结果（按匹配度排序）
      </h3>

      <div className="space-y-4">
        {matches.map(cg => (
          <div key={cg.id} className="bg-white rounded-xl p-5 shadow-sm border border-cream-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-4xl mb-2">
                  {cg.userAvatar}
                </div>
                <div className={`text-lg font-bold ${
                  cg.matchScore >= 80 ? 'text-emerald-600' : cg.matchScore >= 60 ? 'text-amber-600' : 'text-gray-500'
                }`}>
                  {cg.matchScore}分
                </div>
                <div className="text-xs text-gray-400">匹配度</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{cg.userName}</h4>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{cg.averageRating || '暂无评分'}</span>
                  </div>
                  <span className="text-xs text-gray-400">累计接单 {cg.totalOrders}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Building className="w-4 h-4 text-gray-400" />
                    {cg.livingArea}㎡
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Trees className="w-4 h-4 text-gray-400" />
                    {cg.hasYard ? '带院子' : '无院子'}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-gray-400" />
                    {cg.petExperienceYears}年经验
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {cg.serviceRadiusKm}km内
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500">可接待：</span>
                  {cg.acceptedSpecies.map(s => (
                    <span key={s} className="text-xs bg-cream-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {SPECIES_EMOJI[s]} {SPECIES_LABELS[s]}
                    </span>
                  ))}
                </div>
                {cg.bio && (
                  <p className="text-sm text-gray-500 mb-3">{cg.bio}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-primary-600 font-bold text-xl">
                    ¥{cg.pricePerDay}
                    <span className="text-sm font-normal text-gray-400">/天</span>
                    <span className="text-sm text-gray-400 ml-2">总计约 ¥{cg.pricePerDay * days}</span>
                  </div>
                  <button
                    onClick={() => openOrderModal(cg)}
                    className="bg-primary-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> 选择并下单
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-cream-200">
            <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              暂时没有匹配的寄养人，您可以
              <Link to="/boarding/publish" className="text-primary-600 font-medium hover:underline mx-1">
                调整寄养需求
              </Link>
              或稍后再试
            </p>
          </div>
        )}
      </div>

      {showOrderModal && selectedCaregiver && request && currentUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">确认寄养订单</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm">
                  {selectedCaregiver.userAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-lg">{selectedCaregiver.userName}</p>
                    <span className="text-base" title={CAREGIVER_CERT_LEVEL_LABELS['intermediate']}>
                      {CAREGIVER_CERT_LEVEL_BADGES['intermediate']}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    ⭐ {selectedCaregiver.averageRating} · {selectedCaregiver.totalOrders}单 · ¥{selectedCaregiver.pricePerDay}/天
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">寄养宠物</span>
                  <span className="font-medium text-gray-800">{request.petName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">寄养时间</span>
                  <span className="font-medium text-gray-800">{request.startDate} ~ {request.endDate}（{days}天）</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-2">选择寄养方式</span>
                  <div className="grid grid-cols-3 gap-2">
                    {request.acceptedMethods.map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        className={`p-3 rounded-lg border-2 text-sm transition-all ${
                          selectedMethod === method
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-cream-200 hover:border-cream-300 text-gray-600'
                        }`}
                      >
                        {BOARDING_METHOD_LABELS[method]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block mb-2">交接备注（选填）</span>
                  <textarea
                    value={handoverNotes}
                    onChange={e => setHandoverNotes(e.target.value)}
                    placeholder="例如交接时间、地点、宠物用品等..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-gray-800 font-medium block">保险选购（可选）</span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInsurance('none')}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedInsurance === 'none'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🛡️</span>
                        <span className={`font-medium ${selectedInsurance === 'none' ? 'text-primary-700' : 'text-gray-800'}`}>不购买</span>
                      </div>
                      {selectedInsurance === 'none' && <Check className="w-5 h-5 text-primary-500" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-7">不投保，风险由主人自行承担</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedInsurance('basic')}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedInsurance === 'basic'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🥉</span>
                        <div>
                          <span className={`font-medium ${selectedInsurance === 'basic' ? 'text-primary-700' : 'text-gray-800'}`}>基础险</span>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">推荐</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">¥{INSURANCE_PLAN_PRICES['basic']}/天 × {days}天 = ¥{INSURANCE_PLAN_PRICES['basic'] * days}</span>
                        {selectedInsurance === 'basic' && <Check className="w-5 h-5 text-primary-500" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-7">宠物医疗费最高赔付2000元</p>
                    <p className="text-xs text-gray-400 mt-0.5 ml-7">保障：意外医疗、疾病医疗</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedInsurance('comprehensive')}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedInsurance === 'comprehensive'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🥇</span>
                        <span className={`font-medium ${selectedInsurance === 'comprehensive' ? 'text-primary-700' : 'text-gray-800'}`}>综合险</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">¥{INSURANCE_PLAN_PRICES['comprehensive']}/天 × {days}天 = ¥{INSURANCE_PLAN_PRICES['comprehensive'] * days}</span>
                        {selectedInsurance === 'comprehensive' && <Check className="w-5 h-5 text-primary-500" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-7">医疗+走失，最高赔付5000元</p>
                    <p className="text-xs text-gray-400 mt-0.5 ml-7">保障：意外医疗、疾病医疗、走失赔付</p>
                  </button>
                </div>
              </div>

              <div className="border-t border-cream-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>基础服务费</span>
                  <span>¥{selectedCaregiver.pricePerDay} × {days}天 = ¥{selectedCaregiver.pricePerDay * days}</span>
                </div>
                {selectedInsurance !== 'none' && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>保险费</span>
                    <span>¥{INSURANCE_PLAN_PRICES[selectedInsurance]} × {days}天 = ¥{INSURANCE_PLAN_PRICES[selectedInsurance] * days}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>附加费</span>
                  <span>¥0</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>优惠</span>
                  <span>-¥0</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-cream-100">
                  <span className="font-medium text-gray-800">应付总额</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ¥{selectedCaregiver.pricePerDay * days + (selectedInsurance !== 'none' ? INSURANCE_PLAN_PRICES[selectedInsurance] * days : 0)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-cream-200 flex gap-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 px-6 py-3 border border-cream-300 rounded-xl font-medium text-gray-700 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={orderLoading}
                className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderLoading ? '创建中...' : '确认下单'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
