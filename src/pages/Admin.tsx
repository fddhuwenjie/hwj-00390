import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import { SPECIES_LABELS, CAREGIVER_STATUS_LABELS, BOARDING_ORDER_STATUS_LABELS, BOARDING_METHOD_LABELS } from '../../shared/types';
import type { BoardingCaregiver, BoardingOrder, BoardingStats, CaregiverStatus, BoardingOrderStatus } from '../../shared/types';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Shield, PawPrint, Heart, ClipboardList, Target, Calendar, BarChart3, History, AlertCircle, Check, Eye,
  Home, Users, FileText, Star, TrendingUp, XCircle, Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FOLLOWUP_STATUS_LABELS, HEALTH_STATUS_LABELS } from '../../shared/types';
import type { FollowUpStatus } from '../../shared/types';

const WARM_COLORS = ['#FF8A65', '#FFB18F', '#FFD0B9', '#FFE8DC', '#FFC107'];

type AdminTab = 'overview' | 'followups' | 'boarding';
type BoardingSubTab = 'stats' | 'caregivers' | 'orders';

export default function Admin() {
  const { currentUser, adminStats, followUpTasks, loading, fetchAdminStats, fetchAllFollowUpTasks } = useAppStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [boardingSubTab, setBoardingSubTab] = useState<BoardingSubTab>('stats');

  const [boardingStats, setBoardingStats] = useState<BoardingStats | null>(null);
  const [caregivers, setCaregivers] = useState<BoardingCaregiver[]>([]);
  const [caregiverFilter, setCaregiverFilter] = useState<CaregiverStatus | 'all'>('all');
  const [orders, setOrders] = useState<BoardingOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<BoardingOrderStatus | 'all'>('all');
  const [boardingLoading, setBoardingLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAdminStats();
      fetchAllFollowUpTasks();
    }
  }, [currentUser, fetchAdminStats, fetchAllFollowUpTasks]);

  useEffect(() => {
    if (activeTab === 'boarding' && currentUser?.role === 'admin') {
      loadBoardingData();
    }
  }, [activeTab, currentUser, caregiverFilter, orderFilter]);

  const loadBoardingData = async () => {
    setBoardingLoading(true);
    try {
      if (boardingSubTab === 'stats') {
        const stats = await boardingApi.getStats();
        setBoardingStats(stats);
      } else if (boardingSubTab === 'caregivers') {
        const list = await boardingApi.getAllCaregivers(caregiverFilter === 'all' ? undefined : caregiverFilter);
        setCaregivers(list);
      } else if (boardingSubTab === 'orders') {
        const list = await boardingApi.getAllOrders(orderFilter === 'all' ? undefined : orderFilter);
        setOrders(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBoardingLoading(false);
    }
  };

  const handleReviewCaregiver = async (id: string, approved: boolean) => {
    try {
      await boardingApi.reviewCaregiver(id, approved, approved ? '资质审核通过' : '资质暂不符合要求');
      await loadBoardingData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisputeOrder = async (id: string) => {
    try {
      await boardingApi.disputeOrder(id, '管理员标记为争议订单');
      await loadBoardingData();
    } catch (e) {
      console.error(e);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="bg-white rounded-3xl shadow-card p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary-500" />
          </div>
          <h1 className="font-display text-3xl text-gray-800 mb-3">权限不足</h1>
          <p className="text-gray-500 leading-relaxed">
            该页面仅管理员可访问。如需查看管理后台，请切换至管理员账号。
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: '总宠物数',
      value: adminStats?.totalPets ?? 0,
      icon: '🐾',
      gradient: 'from-orange-400 to-orange-500',
      borderColor: 'bg-gradient-to-r from-orange-400 to-orange-500',
    },
    {
      label: '已被领养',
      value: adminStats?.adoptedPets ?? 0,
      icon: '💚',
      gradient: 'from-green-400 to-emerald-500',
      borderColor: 'bg-gradient-to-r from-green-400 to-emerald-500',
    },
    {
      label: '待审申请',
      value: adminStats?.pendingApplications ?? 0,
      icon: '📋',
      gradient: 'from-blue-400 to-sky-500',
      borderColor: 'bg-gradient-to-r from-blue-400 to-sky-500',
    },
    {
      label: '领养成功率',
      value: `${Math.round((adminStats?.adoptionSuccessRate ?? 0) * 100)}%`,
      icon: '🎯',
      gradient: 'from-purple-400 to-violet-500',
      borderColor: 'bg-gradient-to-r from-purple-400 to-violet-500',
    },
  ];

  const pieData = (adminStats?.speciesDistribution ?? []).map((item) => ({
    name: SPECIES_LABELS[item.species] || item.species,
    value: item.count,
  }));

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const sortedFollowUps = [...followUpTasks].sort((a, b) => {
    const order = { overdue: 0, pending: 1, submitted: 2 } as Record<FollowUpStatus, number>;
    return order[a.status] - order[b.status] || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const tabs = [
    { k: 'overview' as const, label: '数据概览', icon: <BarChart3 className="w-4 h-4" /> },
    { k: 'followups' as const, label: '回访管理', icon: <History className="w-4 h-4" /> },
    { k: 'boarding' as const, label: '寄养管理', icon: <Home className="w-4 h-4" /> },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gray-800 mb-2">管理后台 📊</h1>
        <p className="text-gray-500">平台数据概览与运营分析</p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft p-1.5 inline-flex">
        {tabs.map(({ k, label, icon }) => (
          <button
            key={k}
            onClick={() => setActiveTab(k)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition',
              activeTab === k
                ? 'bg-primary-500 text-white shadow-soft'
                : 'text-gray-600 hover:bg-cream-100'
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="animate-fade-in space-y-6">
          {(loading || !adminStats) ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-3xl shadow-card p-6 h-32 animate-pulse-soft" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-3xl shadow-card p-6 h-80 animate-pulse-soft" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-3xl shadow-card overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className={`h-1.5 ${stat.borderColor}`} />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                        <span className="text-2xl">{stat.icon}</span>
                      </div>
                      <p className="font-display text-4xl text-gray-800">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl shadow-card p-6">
                  <h2 className="font-display text-xl text-gray-800 mb-5 flex items-center gap-2">
                    <PawPrint className="w-5 h-5 text-primary-500" />
                    物种分布
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={WARM_COLORS[index % WARM_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                          }}
                        />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-card p-6">
                  <h2 className="font-display text-xl text-gray-800 mb-5 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary-500" />
                    领养趋势（最近6个月）
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={adminStats.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#FFEFDD" />
                        <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                          }}
                        />
                        <Legend iconType="circle" />
                        <Line
                          type="monotone"
                          dataKey="newPets"
                          name="新增宠物"
                          stroke="#FF8A65"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#FF8A65', strokeWidth: 0 }}
                          activeDot={{ r: 7 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="adoptedPets"
                          name="被领养"
                          stroke="#66BB6A"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#66BB6A', strokeWidth: 0 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-card p-6">
                  <h2 className="font-display text-xl text-gray-800 mb-5 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary-500" />
                    热门品种 TOP 10
                  </h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={adminStats.topBreeds} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#FFEFDD" />
                        <XAxis type="number" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                        <YAxis
                          type="category"
                          dataKey="breed"
                          stroke="#9CA3AF"
                          tick={{ fontSize: 12 }}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                          }}
                        />
                        <Bar
                          dataKey="count"
                          name="数量"
                          fill="#FF8A65"
                          radius={[0, 10, 10, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-card p-6 flex flex-col justify-center items-center">
                  <h2 className="font-display text-xl text-gray-800 mb-6 flex items-center gap-2 self-start">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    平均领养等待天数
                  </h2>
                  <div className="flex flex-col items-center justify-center flex-1 py-6">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-inner">
                          <span className="font-display text-5xl text-primary-600">
                            {adminStats.avgWaitDays}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-6 font-medium">天</p>
                    <p className="text-sm text-gray-400 mt-2 text-center max-w-xs leading-relaxed">
                      从宠物上线到成功被领养的平均等待时长
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'followups' && (
        <div className="animate-fade-in">
          <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-cream-50 rounded-xl">
                <div className="font-display text-2xl text-gray-800">{sortedFollowUps.length}</div>
                <div className="text-xs text-gray-500">全部</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <div className="font-display text-2xl text-amber-600">
                  {sortedFollowUps.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-500">待回访</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <div className="font-display text-2xl text-rose-600">
                  {sortedFollowUps.filter(t => t.status === 'overdue').length}
                </div>
                <div className="text-xs text-gray-500">已逾期</div>
              </div>
              <div className="p-3 bg-mint-50 rounded-xl">
                <div className="font-display text-2xl text-mint-600">
                  {sortedFollowUps.filter(t => t.status === 'submitted').length}
                </div>
                <div className="text-xs text-gray-500">已完成</div>
              </div>
            </div>
          </div>

          {sortedFollowUps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="font-display text-2xl text-gray-700 mb-2">暂无回访任务</h3>
              <p className="text-gray-500">目前还没有回访任务</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedFollowUps.map(task => {
                const isOverdue = task.status === 'overdue';
                const isSubmitted = task.status === 'submitted';
                const isPending = task.status === 'pending';
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'bg-white rounded-2xl shadow-card overflow-hidden',
                      isOverdue && 'ring-2 ring-rose-300'
                    )}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-cream-100 flex-shrink-0">
                        {task.petPhoto ? (
                          <img src={task.petPhoto} alt={task.petName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-gray-800">{task.petName}</h3>
                          <span
                            className={cn(
                              'text-xs px-2.5 py-1 rounded-full font-medium',
                              isOverdue && 'bg-rose-100 text-rose-600',
                              isPending && 'bg-amber-100 text-amber-700',
                              isSubmitted && 'bg-mint-100 text-mint-600'
                            )}
                          >
                            {isOverdue && (
                              <span className="flex items-center gap-0.5">
                                <AlertCircle className="w-3 h-3" />
                              </span>
                            )}
                            {FOLLOWUP_STATUS_LABELS[task.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          领养人：{task.adopterName}
                        </p>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                          <span>截止：{formatDate(task.dueDate)}</span>
                          <span>领养：{formatDate(task.adoptionDate)}</span>
                          {task.report?.submittedAt && (
                            <span>提交：{formatDate(task.report.submittedAt)}</span>
                          )}
                        </div>
                        {task.report && (
                          <div className="mt-2 bg-cream-50 rounded-xl p-3 text-sm">
                            <div className="text-gray-700 mb-1">
                              <span className="text-gray-500">健康：</span>
                              {HEALTH_STATUS_LABELS[task.report.healthStatus]}
                            </div>
                            <div className="text-gray-700 line-clamp-2">
                              <span className="text-gray-500">描述：</span>
                              {task.report.description}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          className="p-2 rounded-xl bg-cream-100 text-gray-600 hover:bg-cream-200 transition"
                          title="查看宠物"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isSubmitted && (
                          <button
                            className="p-2 rounded-xl bg-mint-100 text-mint-600 hover:bg-mint-200 transition"
                            title="已确认"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'boarding' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-white rounded-2xl shadow-soft p-1.5 inline-flex">
            {[
              { k: 'stats' as const, label: '寄养统计', icon: <TrendingUp className="w-4 h-4" /> },
              { k: 'caregivers' as const, label: '寄养人审核', icon: <Users className="w-4 h-4" /> },
              { k: 'orders' as const, label: '寄养订单', icon: <FileText className="w-4 h-4" /> },
            ].map(({ k, label, icon }) => (
              <button
                key={k}
                onClick={() => { setBoardingSubTab(k); }}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition',
                  boardingSubTab === k
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'text-gray-600 hover:bg-cream-100'
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {boardingSubTab === 'stats' && (
            <div className="animate-fade-in space-y-6">
              {boardingLoading || !boardingStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-3xl shadow-card p-6 h-32 animate-pulse-soft" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: '本月寄养订单', value: boardingStats.monthlyOrders[boardingStats.monthlyOrders.length - 1]?.count || 0, icon: '📋', gradient: 'from-orange-400 to-orange-500' },
                      { label: '总交易额(元)', value: boardingStats.totalRevenue, icon: '💰', gradient: 'from-green-400 to-emerald-500' },
                      { label: '活跃寄养人数', value: boardingStats.activeCaregivers, icon: '👥', gradient: 'from-blue-400 to-sky-500' },
                      { label: '待审核寄养人', value: boardingStats.pendingCaregivers, icon: '⏳', gradient: 'from-amber-400 to-yellow-500' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white rounded-3xl shadow-card overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                            <span className="text-2xl">{stat.icon}</span>
                          </div>
                          <p className="font-display text-4xl text-gray-800">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white rounded-3xl shadow-card p-6">
                      <h2 className="font-display text-xl text-gray-800 mb-5 flex items-center gap-2">
                        <PawPrint className="w-5 h-5 text-primary-500" />
                        寄养热门物种
                      </h2>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={boardingStats.speciesDistribution.map(s => ({
                                name: SPECIES_LABELS[s.species] || s.species,
                                value: s.count
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {boardingStats.speciesDistribution.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={WARM_COLORS[index % WARM_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                              }}
                            />
                            <Legend iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-card p-6">
                      <h2 className="font-display text-xl text-gray-800 mb-5 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        寄养订单月度趋势
                      </h2>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={boardingStats.monthlyOrders}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#FFEFDD" />
                            <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                              }}
                            />
                            <Legend iconType="circle" />
                            <Bar
                              dataKey="orders"
                              name="订单数"
                              fill="#FF8A65"
                              radius={[10, 10, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {boardingSubTab === 'caregivers' && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setCaregiverFilter(status)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition',
                      caregiverFilter === status
                        ? 'bg-primary-500 text-white'
                        : 'bg-cream-100 text-gray-600 hover:bg-cream-200'
                    )}
                  >
                    {status === 'all' ? '全部' : CAREGIVER_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>

              {boardingLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-card p-6 h-32 animate-pulse-soft" />
                  ))}
                </div>
              ) : caregivers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="font-display text-2xl text-gray-700 mb-2">暂无寄养人</h3>
                  <p className="text-gray-500">当前筛选条件下没有寄养人数据</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {caregivers.map(cg => (
                    <div key={cg.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                          {cg.userAvatar || '🧑'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-800">{cg.userName}</h3>
                            <span className={cn(
                              'text-xs px-2.5 py-1 rounded-full font-medium',
                              cg.status === 'approved' && 'bg-mint-100 text-mint-600',
                              cg.status === 'pending' && 'bg-amber-100 text-amber-700',
                              cg.status === 'rejected' && 'bg-rose-100 text-rose-600',
                            )}>
                              {CAREGIVER_STATUS_LABELS[cg.status]}
                            </span>
                            {cg.averageRating > 0 && (
                              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 fill-amber-500" />
                                {cg.averageRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            <span>📐 {cg.livingArea}㎡</span>
                            <span>{cg.hasYard ? '🏡 有院子' : '🏢 无院子'}</span>
                            <span>⏱ {cg.petExperienceYears}年经验</span>
                            <span>💰 {cg.pricePerDay}元/天</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-2">
                            <span>可接待: {cg.acceptedSpecies.map(s => SPECIES_LABELS[s] || s).join('、')}</span>
                            <span>|</span>
                            <span>最多{cg.maxPetsAtOnce}只</span>
                            <span>|</span>
                            <span>服务半径{cg.serviceRadiusKm}km</span>
                          </div>
                          {cg.bio && <p className="text-xs text-gray-500 mt-1">简介: {cg.bio}</p>}
                          {cg.reviewNote && <p className="text-xs text-rose-500 mt-1">审核备注: {cg.reviewNote}</p>}
                        </div>
                        {cg.status === 'pending' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleReviewCaregiver(cg.id, true)}
                              className="flex items-center gap-1 px-3 py-2 bg-mint-500 text-white rounded-xl text-sm font-medium hover:bg-mint-600 transition"
                            >
                              <Check className="w-4 h-4" />通过
                            </button>
                            <button
                              onClick={() => handleReviewCaregiver(cg.id, false)}
                              className="flex items-center gap-1 px-3 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition"
                            >
                              <XCircle className="w-4 h-4" />拒绝
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {boardingSubTab === 'orders' && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap gap-2">
                {(['all', 'pending_confirm', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition',
                      orderFilter === status
                        ? 'bg-primary-500 text-white'
                        : 'bg-cream-100 text-gray-600 hover:bg-cream-200'
                    )}
                  >
                    {status === 'all' ? '全部' : BOARDING_ORDER_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>

              {boardingLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-card p-6 h-32 animate-pulse-soft" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="font-display text-2xl text-gray-700 mb-2">暂无寄养订单</h3>
                  <p className="text-gray-500">当前筛选条件下没有寄养订单</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className={cn(
                        'bg-white rounded-2xl shadow-card overflow-hidden',
                        order.status === 'disputed' && 'ring-2 ring-rose-300'
                      )}
                    >
                      <div className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                              {order.petPhoto ? (
                                <img src={order.petPhoto} alt={order.petName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-800">{order.petName}</h3>
                                <span className={cn(
                                  'text-xs px-2.5 py-1 rounded-full font-medium',
                                  order.status === 'completed' && 'bg-mint-100 text-mint-600',
                                  order.status === 'confirmed' && 'bg-blue-100 text-blue-600',
                                  order.status === 'in_progress' && 'bg-purple-100 text-purple-600',
                                  order.status === 'pending_confirm' && 'bg-amber-100 text-amber-700',
                                  order.status === 'cancelled' && 'bg-gray-100 text-gray-600',
                                  order.status === 'disputed' && 'bg-rose-100 text-rose-600',
                                )}>
                                  {BOARDING_ORDER_STATUS_LABELS[order.status]}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-0.5">
                                主人: {order.ownerName} ↔ 寄养人: {order.caregiverName}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-xl text-primary-600">¥{order.cost.totalAmount}</div>
                            <div className="text-xs text-gray-500">{order.cost.days}天 × ¥{Math.round(order.cost.baseFee / order.cost.days)}/天</div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 flex flex-wrap gap-3 border-t border-cream-100 pt-2">
                          <span>📅 {formatDate(order.startDate)} ~ {formatDate(order.endDate)}</span>
                          <span>🏠 {BOARDING_METHOD_LABELS[order.boardingMethod]}</span>
                          {order.handoverNotes && <span className="truncate max-w-xs">📝 {order.handoverNotes}</span>}
                          {order.disputeReason && (
                            <span className="text-rose-600">
                              <AlertCircle className="w-3 h-3 inline mr-1" />争议: {order.disputeReason}
                            </span>
                          )}
                        </div>

                        {order.status !== 'disputed' && order.status !== 'cancelled' && order.status !== 'completed' && (
                          <div className="mt-3 pt-3 border-t border-cream-100 flex justify-end gap-2">
                            <button
                              onClick={() => handleDisputeOrder(order.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-sm hover:bg-rose-100 transition"
                            >
                              <Ban className="w-4 h-4" />标记争议
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
