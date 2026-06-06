import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import {
  BOARDING_ORDER_STATUS_LABELS,
  BOARDING_METHOD_LABELS,
  DIARY_ALERT_LABELS,
} from '../../shared/types';
import type {
  BoardingOrder,
  BoardingDiary,
  BoardingReview,
  BoardingOrderStatus,
  DiaryAlertType,
} from '../../shared/types';
import {
  ArrowLeft,
  FileText,
  BookOpen,
  Star,
  Receipt,
  MessageCircle,
  AlertCircle,
  Check,
  X,
  Plus,
  Calendar,
  User,
  Camera,
  Send,
  AlertTriangle,
  Clock,
} from 'lucide-react';

type TabKey = 'info' | 'diary' | 'review' | 'settlement';

export default function BoardingOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [order, setOrder] = useState<BoardingOrder | null>(null);
  const [diaries, setDiaries] = useState<BoardingDiary[]>([]);
  const [reviews, setReviews] = useState<BoardingReview[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [diaryDesc, setDiaryDesc] = useState('');
  const [diaryDiet, setDiaryDiet] = useState('');
  const [diaryActivity, setDiaryActivity] = useState('');
  const [diaryAlert, setDiaryAlert] = useState<DiaryAlertType>('none');
  const [diaryAlertDesc, setDiaryAlertDesc] = useState('');
  const [diaryPhotos, setDiaryPhotos] = useState('');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  const [disputeReason, setDisputeReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [o, d, r] = await Promise.all([
        boardingApi.getOrder(id),
        boardingApi.getOrderDiaries(id),
        boardingApi.getOrderReviews(id),
      ]);
      setOrder(o);
      setDiaries(d);
      setReviews(r);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateStatus = async (status: BoardingOrderStatus) => {
    if (!order) return;
    setActionLoading(true);
    try {
      const updated = await boardingApi.updateOrderStatus(order.id, status);
      setOrder(updated);
    } catch (err) {
      setError('操作失败');
    }
    setActionLoading(false);
  };

  const submitDiary = async () => {
    if (!order || !currentUser) return;
    if (!diaryDesc || !diaryDiet || !diaryActivity) {
      setError('请填写完整的日记内容');
      return;
    }
    setActionLoading(true);
    try {
      const photoUrls = diaryPhotos
        .split('\n')
        .map(u => u.trim())
        .filter(u => u.length > 0);

      const myCaregiver = await boardingApi.getMyCaregiver(currentUser.id);
      if (!myCaregiver) {
        setError('您不是寄养人，无法提交日记');
        return;
      }

      await boardingApi.addDiary(order.id, {
        caregiverId: myCaregiver.id,
        date: diaryDate,
        description: diaryDesc,
        dietStatus: diaryDiet,
        activityStatus: diaryActivity,
        photoUrls,
        alertType: diaryAlert,
        alertDescription: diaryAlert !== 'none' ? diaryAlertDesc : undefined,
      });
      setShowDiaryModal(false);
      resetDiaryForm();
      loadData();
    } catch (err) {
      setError('提交日记失败');
    }
    setActionLoading(false);
  };

  const resetDiaryForm = () => {
    setDiaryDate(new Date().toISOString().split('T')[0]);
    setDiaryDesc('');
    setDiaryDiet('');
    setDiaryActivity('');
    setDiaryAlert('none');
    setDiaryAlertDesc('');
    setDiaryPhotos('');
    setError('');
  };

  const submitReview = async (targetUserId: string) => {
    if (!order || !currentUser) return;
    if (!reviewContent) {
      setError('请填写评价内容');
      return;
    }
    setActionLoading(true);
    try {
      await boardingApi.addReview(order.id, {
        reviewerId: currentUser.id,
        reviewerName: currentUser.name,
        reviewerAvatar: currentUser.avatar,
        targetUserId,
        rating: reviewRating,
        content: reviewContent,
      });
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewContent('');
      setError('');
      loadData();
    } catch (err) {
      setError('提交评价失败');
    }
    setActionLoading(false);
  };

  const submitDispute = async () => {
    if (!order) return;
    if (!disputeReason) {
      setError('请填写投诉原因');
      return;
    }
    setActionLoading(true);
    try {
      await boardingApi.disputeOrder(order.id, disputeReason);
      setShowDisputeModal(false);
      setDisputeReason('');
      loadData();
    } catch (err) {
      setError('提交投诉失败');
    }
    setActionLoading(false);
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-500">加载中...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">订单不存在</p>
        <Link to="/boarding" className="text-primary-600 font-medium hover:underline">
          返回寄养服务
        </Link>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending_confirm': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'in_progress': return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'disputed': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const alertColor = (type: DiaryAlertType) => {
    if (type === 'none') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const isOwner = currentUser?.id === order.ownerId;
  const isCaregiver = currentUser && (
    order.caregiverId === (currentUser.id === 'user-care-001' ? 'cg-' : '')
      ? true
      : ['user-care-001', 'user-care-002', 'user-care-003'].includes(currentUser.id)
  );

  const canConfirmOrder = isCaregiver && order.status === 'pending_confirm';
  const canStartOrder = (isOwner || isCaregiver) && order.status === 'confirmed';
  const canCompleteOrder = (isOwner || isCaregiver) && order.status === 'in_progress';
  const canCancelOrder = order.status === 'pending_confirm' || order.status === 'confirmed';
  const canAddDiary = isCaregiver && order.status === 'in_progress';
  const canReview = order.status === 'completed' && reviews.length < 2;
  const myReviewed = reviews.some(r => r.reviewerId === currentUser?.id);
  const canReviewNow = canReview && !myReviewed;

  const targetUserIdForReview = isOwner ? order.caregiverId.replace('cg-', 'user-care-') : order.ownerId;
  const actualTargetUserId = isOwner
    ? (order.caregiverId.includes('user-care') ? order.caregiverId : 'user-care-001')
    : order.ownerId;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: '订单信息', icon: <FileText className="w-4 h-4" /> },
    { key: 'diary', label: `寄养日记 (${diaries.length})`, icon: <BookOpen className="w-4 h-4" /> },
    { key: 'review', label: `双方评价 (${reviews.length})`, icon: <Star className="w-4 h-4" /> },
    { key: 'settlement', label: '费用结算', icon: <Receipt className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/boarding')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> 返回寄养服务
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
              <img src={order.petPhoto} alt={order.petName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">{order.petName} 的寄养订单</h1>
                <span className={`text-sm px-3 py-1 rounded-full border ${statusColor(order.status)}`}>
                  {BOARDING_ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="text-gray-500 text-sm">订单号：{order.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canConfirmOrder && (
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={actionLoading}
                className="bg-sky-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> 确认接单
              </button>
            )}
            {canStartOrder && (
              <button
                onClick={() => updateStatus('in_progress')}
                disabled={actionLoading}
                className="bg-violet-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Clock className="w-4 h-4" /> 开始寄养
              </button>
            )}
            {canCompleteOrder && (
              <button
                onClick={() => updateStatus('completed')}
                disabled={actionLoading}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> 完成寄养
              </button>
            )}
            {canCancelOrder && (
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={actionLoading}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" /> 取消订单
              </button>
            )}
            {order.status !== 'disputed' && order.status !== 'completed' && order.status !== 'cancelled' && isOwner && (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg font-medium hover:bg-rose-100 transition-colors flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" /> 投诉纠纷
              </button>
            )}
            {canAddDiary && (
              <button
                onClick={() => setShowDiaryModal(true)}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> 提交寄养日记
              </button>
            )}
            {canReviewNow && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Star className="w-4 h-4" /> 发表评价
              </button>
            )}
          </div>
        </div>

        {order.disputeReason && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-rose-800">订单处于争议中</p>
              <p className="text-sm text-rose-700">投诉原因：{order.disputeReason}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 border-b border-cream-200 overflow-x-auto pb-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-cream-100 text-primary-600 border border-cream-200 border-b-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-cream-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> 双方信息
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                    {currentUser?.avatar || '🧑'}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">宠物主人</p>
                    <p className="font-medium text-gray-800">{order.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                    {order.caregiverAvatar}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">寄养人</p>
                    <p className="font-medium text-gray-800">{order.caregiverName}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 寄养信息
              </h4>
              <div className="space-y-2 p-4 bg-cream-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-500">寄养方式</span>
                  <span className="font-medium text-gray-800">{BOARDING_METHOD_LABELS[order.boardingMethod]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">开始日期</span>
                  <span className="font-medium text-gray-800">{order.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">结束日期</span>
                  <span className="font-medium text-gray-800">{order.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">寄养天数</span>
                  <span className="font-medium text-gray-800">{order.cost.days} 天</span>
                </div>
                {order.handoverNotes && (
                  <div className="pt-2 border-t border-cream-200">
                    <span className="text-gray-500 text-sm block mb-1">交接备注</span>
                    <p className="text-gray-700 text-sm">{order.handoverNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="space-y-4">
            {diaries.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>暂无寄养日记</p>
              </div>
            )}
            {diaries.map((diary, idx) => (
              <div key={diary.id} className="border-l-4 border-primary-300 pl-4 py-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Day {idx + 1} · {diary.date}</p>
                      {diary.alertType !== 'none' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 mt-1 ${alertColor(diary.alertType)}`}>
                          <AlertCircle className="w-3 h-3" />
                          ⚠️ {DIARY_ALERT_LABELS[diary.alertType]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-11 space-y-3">
                  <div className={`p-4 rounded-xl ${diary.alertType !== 'none' ? 'bg-rose-50 border border-rose-100' : 'bg-cream-50'}`}>
                    <p className="text-gray-700">{diary.description}</p>
                    {diary.alertType !== 'none' && diary.alertDescription && (
                      <p className="text-rose-600 text-sm mt-2 pt-2 border-t border-rose-100">
                        <strong>异常说明：</strong>{diary.alertDescription}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-xs text-amber-600 mb-1">🍽️ 饮食情况</p>
                      <p className="text-sm text-gray-700">{diary.dietStatus}</p>
                    </div>
                    <div className="bg-violet-50 p-3 rounded-lg">
                      <p className="text-xs text-violet-600 mb-1">🎾 活动情况</p>
                      <p className="text-sm text-gray-700">{diary.activityStatus}</p>
                    </div>
                  </div>
                  {diary.photoUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {diary.photoUrls.map((url, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-cream-100">
                          <img src={url} alt={`照片${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-4">
            {reviews.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>暂无评价</p>
                {canReviewNow && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="mt-4 bg-amber-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors inline-flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" /> 发表评价
                  </button>
                )}
              </div>
            )}
            {reviews.map(review => (
              <div key={review.id} className="p-5 bg-cream-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                      {review.reviewerAvatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{review.reviewerName}</p>
                      <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.content}</p>
              </div>
            ))}
            {reviews.length > 0 && canReviewNow && (
              <div className="text-center">
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-amber-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors inline-flex items-center gap-2"
                >
                  <Star className="w-4 h-4" /> 发表我的评价
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settlement' && (
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-6">
              <p className="text-primary-100 mb-2">订单应付总额</p>
              <p className="text-4xl font-bold">¥{order.cost.totalAmount}</p>
              <p className="text-primary-100 text-sm mt-2">共 {order.cost.days} 天寄养服务</p>
            </div>
            <div className="bg-white border border-cream-200 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary-500" /> 费用明细
              </h4>
              <div className="flex justify-between items-center pb-3 border-b border-cream-100">
                <span className="text-gray-600">基础寄养费</span>
                <span className="font-medium text-gray-800">¥{order.cost.baseFee}</span>
              </div>
              <div className="text-sm text-gray-400 -mt-2">
                {order.cost.totalAmount / Math.max(order.cost.days, 1)}元/天 × {order.cost.days}天
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-cream-100">
                <span className="text-gray-600">附加费用</span>
                <span className="font-medium text-gray-800">¥{order.cost.extraFees}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-cream-100">
                <span className="text-gray-600">优惠</span>
                <span className="font-medium text-emerald-600">-¥{order.cost.discount}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-gray-800 text-lg">应付总额</span>
                <span className="font-bold text-primary-600 text-2xl">¥{order.cost.totalAmount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDiaryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" /> 提交寄养日记
              </h3>
              <button onClick={() => { setShowDiaryModal(false); resetDiaryForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm text-gray-600 block mb-1">日期</label>
                <input
                  type="date"
                  value={diaryDate}
                  onChange={e => setDiaryDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">今日状态描述</label>
                <textarea
                  value={diaryDesc}
                  onChange={e => setDiaryDesc(e.target.value)}
                  placeholder="描述今日宠物的整体状态..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">🍽️ 饮食情况</label>
                  <textarea
                    value={diaryDiet}
                    onChange={e => setDiaryDiet(e.target.value)}
                    placeholder="进食量、食物偏好..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">🎾 活动情况</label>
                  <textarea
                    value={diaryActivity}
                    onChange={e => setDiaryActivity(e.target.value)}
                    placeholder="运动量、玩耍情况..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">异常上报</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {(['none', 'sick', 'injured', 'abnormal_behavior'] as DiaryAlertType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDiaryAlert(type)}
                      className={`p-2 rounded-lg border-2 text-sm transition-all ${
                        diaryAlert === type
                          ? type === 'none'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-cream-200 hover:border-cream-300 text-gray-600'
                      }`}
                    >
                      {DIARY_ALERT_LABELS[type]}
                    </button>
                  ))}
                </div>
                {diaryAlert !== 'none' && (
                  <input
                    type="text"
                    value={diaryAlertDesc}
                    onChange={e => setDiaryAlertDesc(e.target.value)}
                    placeholder="请描述异常情况的详细信息..."
                    className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                  />
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                  <Camera className="w-4 h-4" /> 照片URL（每行一张，选填）
                </label>
                <textarea
                  value={diaryPhotos}
                  onChange={e => setDiaryPhotos(e.target.value)}
                  placeholder="https://...\nhttps://..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm font-mono"
                />
              </div>
            </div>
            <div className="p-6 border-t border-cream-200 flex gap-3">
              <button
                onClick={() => { setShowDiaryModal(false); resetDiaryForm(); }}
                className="flex-1 px-6 py-3 border border-cream-300 rounded-xl font-medium text-gray-700 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitDiary}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {actionLoading ? '提交中...' : '提交日记'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> 发表评价
              </h3>
              <button onClick={() => { setShowReviewModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm text-gray-600 block mb-3">评分</label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewRating(i + 1)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${i < reviewRating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                  <span className="text-2xl font-bold text-gray-700 ml-3">{reviewRating}星</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">评价内容</label>
                <textarea
                  value={reviewContent}
                  onChange={e => setReviewContent(e.target.value)}
                  placeholder="分享您的寄养体验..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-cream-200 flex gap-3">
              <button
                onClick={() => { setShowReviewModal(false); setError(''); }}
                className="flex-1 px-6 py-3 border border-cream-300 rounded-xl font-medium text-gray-700 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => submitReview(actualTargetUserId)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? '提交中...' : '提交评价'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> 提交投诉
              </h3>
              <button onClick={() => { setShowDisputeModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">请填写投诉原因，管理员将介入处理。</p>
              <textarea
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                placeholder="请详细描述您遇到的问题..."
                rows={4}
                className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="p-6 border-t border-cream-200 flex gap-3">
              <button
                onClick={() => { setShowDisputeModal(false); setError(''); }}
                className="flex-1 px-6 py-3 border border-cream-300 rounded-xl font-medium text-gray-700 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitDispute}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? '提交中...' : '确认投诉'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
