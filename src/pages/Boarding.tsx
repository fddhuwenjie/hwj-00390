import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import {
  CAREGIVER_STATUS_LABELS,
  BOARDING_ORDER_STATUS_LABELS,
  BOARDING_METHOD_LABELS,
  SPECIES_EMOJI,
  SPECIES_LABELS,
} from '../../shared/types';
import type {
  BoardingRequest,
  BoardingOrder,
  BoardingCaregiver,
} from '../../shared/types';
import {
  Heart,
  Home,
  ClipboardList,
  Star,
  FileText,
  Calendar,
  ChevronRight,
  Plus,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

type TabKey = 'overview' | 'requests' | 'orders' | 'caregiver';

export default function Boarding() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [requests, setRequests] = useState<BoardingRequest[]>([]);
  const [orders, setOrders] = useState<BoardingOrder[]>([]);
  const [myCaregiver, setMyCaregiver] = useState<BoardingCaregiver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [reqs, ords, cg] = await Promise.all([
        boardingApi.getMyRequests(currentUser.id),
        boardingApi.getMyOrders({ ownerId: currentUser.id }),
        boardingApi.getMyCaregiver(currentUser.id),
      ]);
      setRequests(reqs);
      setOrders(ords);
      setMyCaregiver(cg);
    } catch (err) {
      console.error('加载数据失败', err);
    }
    setLoading(false);
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">🐾</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">请先登录</h2>
        <p className="text-gray-500">点击右上角"模拟登录"按钮开始使用寄养服务</p>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-emerald-100 text-emerald-700';
      case 'matched': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-600';
      case 'cancelled': return 'bg-rose-100 text-rose-600';
      case 'pending_confirm': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-sky-100 text-sky-700';
      case 'in_progress': return 'bg-violet-100 text-violet-700';
      case 'disputed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-rose-100 text-rose-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: '服务总览', icon: <Home className="w-4 h-4" /> },
    { key: 'requests', label: `我的需求 (${requests.length})`, icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'orders', label: `我的订单 (${orders.length})`, icon: <FileText className="w-4 h-4" /> },
    { key: 'caregiver', label: '寄养人中心', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Heart className="w-7 h-7" /> 宠物寄养托管服务
            </h1>
            <p className="text-primary-100">专业寄养，安心托付，让毛孩子享受温暖假期</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/boarding/publish"
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> 发布寄养需求
            </Link>
            <Link
              to="/boarding/caregiver/register"
              className="bg-primary-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-800 transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" /> 注册成为寄养人
            </Link>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-cream-200 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-white text-primary-600 border border-cream-200 border-b-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-cream-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-cream-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <span className="text-gray-500 text-sm">寄养需求</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{requests.length}</p>
                  <p className="text-xs text-gray-400 mt-1">条已发布</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-cream-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-gray-500 text-sm">寄养订单</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{orders.length}</p>
                  <p className="text-xs text-gray-400 mt-1">笔历史订单</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-cream-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <span className="text-gray-500 text-sm">寄养人状态</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">
                    {myCaregiver ? CAREGIVER_STATUS_LABELS[myCaregiver.status] : '未注册'}
                  </p>
                  {myCaregiver && (
                    <p className="text-xs text-gray-400 mt-1">
                      评分 {myCaregiver.averageRating} · 接单数 {myCaregiver.totalOrders}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-cream-200">
                  <div className="flex items-center justify-between p-4 border-b border-cream-100">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary-500" /> 最近寄养需求
                    </h3>
                    <button onClick={() => setActiveTab('requests')} className="text-sm text-primary-600 hover:text-primary-700">
                      查看全部
                    </button>
                  </div>
                  <div className="divide-y divide-cream-100">
                    {requests.slice(0, 3).map(req => (
                      <div key={req.id} className="p-4 hover:bg-cream-50 cursor-pointer"
                        onClick={() => navigate(`/boarding/match/${req.id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-cream-100 flex items-center justify-center text-2xl">
                            {SPECIES_EMOJI[req.petSpecies]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{req.petName}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(req.status)}`}>
                                {req.status === 'open' ? '招募中' : req.status === 'matched' ? '已匹配' : req.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              <Calendar className="w-3 h-3 inline" /> {req.startDate} ~ {req.endDate}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                    {requests.length === 0 && (
                      <div className="p-8 text-center text-gray-400">
                        暂无寄养需求
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-cream-200">
                  <div className="flex items-center justify-between p-4 border-b border-cream-100">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-500" /> 最近寄养订单
                    </h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm text-primary-600 hover:text-primary-700">
                      查看全部
                    </button>
                  </div>
                  <div className="divide-y divide-cream-100">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="p-4 hover:bg-cream-50 cursor-pointer"
                        onClick={() => navigate(`/boarding/orders/${order.id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                            <img src={order.petPhoto} alt={order.petName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{order.petName}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                                {BOARDING_ORDER_STATUS_LABELS[order.status]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              寄养人：{order.caregiverName} · ¥{order.cost.totalAmount}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="p-8 text-center text-gray-400">
                        暂无寄养订单
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">我的寄养需求</h3>
                <Link to="/boarding/publish"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> 发布新需求
                </Link>
              </div>
              <div className="space-y-3">
                {requests.map(req => (
                  <div key={req.id} className="bg-white rounded-xl p-4 shadow-sm border border-cream-200">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                        <img src={req.petPhoto} alt={req.petName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800 text-lg">{req.petName}</span>
                          <span className="text-sm text-gray-500">
                            {SPECIES_EMOJI[req.petSpecies]} {SPECIES_LABELS[req.petSpecies]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${statusColor(req.status)}`}>
                            {req.status === 'open' ? '招募中' : req.status === 'matched' ? '已匹配' : req.status === 'completed' ? '已完成' : '已取消'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                          <div>
                            <span className="text-gray-400">寄养日期</span>
                            <p className="text-gray-700 font-medium">{req.startDate} ~ {req.endDate}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">预算范围</span>
                            <p className="text-gray-700 font-medium">¥{req.budgetMin} - ¥{req.budgetMax}/天</p>
                          </div>
                          <div>
                            <span className="text-gray-400">寄养方式</span>
                            <p className="text-gray-700 font-medium">
                              {req.acceptedMethods.map(m => BOARDING_METHOD_LABELS[m]).join(' / ')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">紧急联系</span>
                            <p className="text-gray-700 font-medium">{req.emergencyContact}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {req.status === 'open' && (
                            <button
                              onClick={() => navigate(`/boarding/match/${req.id}`)}
                              className="text-sm text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-1"
                            >
                              查看匹配寄养人 <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-cream-200">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-500 mb-4">还没有发布寄养需求</p>
                    <Link to="/boarding/publish"
                      className="bg-primary-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" /> 发布第一条寄养需求
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">我的寄养订单</h3>
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-cream-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/boarding/orders/${order.id}`)}>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                      <img src={order.petPhoto} alt={order.petName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-lg">{order.petName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                          {BOARDING_ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">寄养人</span>
                          <p className="text-gray-700 font-medium">{order.caregiverAvatar} {order.caregiverName}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">寄养方式</span>
                          <p className="text-gray-700 font-medium">{BOARDING_METHOD_LABELS[order.boardingMethod]}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">寄养日期</span>
                          <p className="text-gray-700 font-medium">{order.startDate} ~ {order.endDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">费用总计</span>
                          <p className="text-primary-600 font-bold">¥{order.cost.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-4" />
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-cream-200">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-gray-500">还没有寄养订单</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'caregiver' && (
            <div>
              {myCaregiver ? (
                <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-4xl">
                      {myCaregiver.userAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-800">{myCaregiver.userName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(myCaregiver.status)}`}>
                          {CAREGIVER_STATUS_LABELS[myCaregiver.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>⭐ 平均评分 {myCaregiver.averageRating}</span>
                        <span>📦 累计接单 {myCaregiver.totalOrders}</span>
                      </div>
                    </div>
                  </div>

                  {myCaregiver.status === 'pending' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">资质审核中</p>
                        <p className="text-sm text-amber-700">您的寄养人资质正在审核，请耐心等待管理员审核通过。</p>
                      </div>
                    </div>
                  )}

                  {myCaregiver.status === 'rejected' && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
                      <p className="font-medium text-rose-800 mb-1">审核未通过</p>
                      <p className="text-sm text-rose-700">原因：{myCaregiver.reviewNote || '未填写'}</p>
                      <Link to="/boarding/caregiver/register"
                        className="text-rose-600 text-sm font-medium mt-2 inline-block hover:underline">
                        重新提交资料
                      </Link>
                    </div>
                  )}

                  {myCaregiver.status === 'approved' && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-cream-50 rounded-lg p-3">
                          <span className="text-gray-400 text-sm">居住面积</span>
                          <p className="text-gray-800 font-semibold">{myCaregiver.livingArea} ㎡</p>
                        </div>
                        <div className="bg-cream-50 rounded-lg p-3">
                          <span className="text-gray-400 text-sm">是否有院子</span>
                          <p className="text-gray-800 font-semibold">{myCaregiver.hasYard ? '✅ 是' : '❌ 否'}</p>
                        </div>
                        <div className="bg-cream-50 rounded-lg p-3">
                          <span className="text-gray-400 text-sm">养宠经验</span>
                          <p className="text-gray-800 font-semibold">{myCaregiver.petExperienceYears} 年</p>
                        </div>
                        <div className="bg-cream-50 rounded-lg p-3">
                          <span className="text-gray-400 text-sm">服务报价</span>
                          <p className="text-primary-600 font-semibold">¥{myCaregiver.pricePerDay}/天</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-2">可接待物种</h4>
                        <div className="flex flex-wrap gap-2">
                          {myCaregiver.acceptedSpecies.map(s => (
                            <span key={s} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                              {SPECIES_EMOJI[s]} {SPECIES_LABELS[s]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {myCaregiver.bio && (
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-700 mb-2">个人简介</h4>
                          <p className="text-gray-600">{myCaregiver.bio}</p>
                        </div>
                      )}

                      <Link to="/boarding/caregiver/register"
                        className="text-primary-600 font-medium hover:underline inline-flex items-center gap-1">
                        更新个人资料 <ChevronRight className="w-4 h-4" />
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-12 text-center">
                  <div className="text-5xl mb-4">🌟</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">成为寄养人</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    注册成为寄养人，为更多毛孩子提供温暖的临时家园，同时获得额外收入
                  </p>
                  <Link to="/boarding/caregiver/register"
                    className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors inline-flex items-center gap-2">
                    <Star className="w-5 h-5" /> 立即注册
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
