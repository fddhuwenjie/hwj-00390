import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import { SPECIES_LABELS, SPECIES_EMOJI } from '../../shared/types';
import type { BoardingDashboardStats, BoardingOrder } from '../../shared/types';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Calendar, Activity,
  Award, PawPrint, BarChart3, PieChart as PieChartIcon,
  Clock, Star, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const GRADIENT_COLORS = {
  green: 'from-emerald-400 to-green-500',
  blue: 'from-cyan-400 to-blue-500',
  orange: 'from-amber-400 to-orange-500',
  purple: 'from-violet-400 to-purple-500',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  change?: number;
  unit?: string;
}

function KpiCard({ title, value, icon, gradient, change, unit }: KpiCardProps) {
  const isUp = (change ?? 0) >= 0;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 group">
      <div className={cn('absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl', gradient)} />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400 font-medium tracking-wide mb-3">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className={cn('text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent', gradient)}>
              {value}
            </span>
            {unit && <span className="text-slate-500 text-sm ml-1">{unit}</span>}
          </div>
          {change !== undefined && (
            <div className="mt-3 flex items-center gap-1.5">
              <div className={cn(
                'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium',
                isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              )}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
              <span className="text-xs text-slate-500">较上月</span>
            </div>
          )}
        </div>
        <div className={cn(
          'flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300',
          gradient
        )}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: string;
}

function ChartCard({ title, icon, children, badge }: ChartCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-xl border border-slate-700/50 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
        </div>
        {badge && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-medium">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function AdminBoardingDashboard() {
  const { currentUser } = useAppStore();
  const [stats, setStats] = useState<BoardingDashboardStats | null>(null);
  const [orders, setOrders] = useState<BoardingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardStats, allOrders] = await Promise.all([
          boardingApi.getDashboardStats(),
          boardingApi.getAllOrders(),
        ]);
        setStats(dashboardStats);
        setOrders(allOrders);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let last = 0;
    const animate = (t: number) => {
      if (!last) last = t;
      const delta = t - last;
      if (delta > 50) {
        last = t;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
          el.scrollTop = 0;
        } else {
          el.scrollTop += 1;
        }
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [orders.length]);

  const heatMapData = stats?.heatMapData ?? [];
  const speciesData = (stats?.speciesDistribution ?? []).map(s => ({
    name: SPECIES_LABELS[s.species] || s.species,
    emoji: SPECIES_EMOJI[s.species] || '🐾',
    value: s.count,
    percentage: s.percentage,
  }));
  const topCaregivers = (stats?.topCaregivers ?? []).slice(0, 10).map((cg, idx) => ({
    ...cg,
    rank: idx + 1,
  }));
  const trendData = stats?.avgOrderAmountTrend ?? [];

  const maxOrders = topCaregivers[0]?.orders || 1;

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">权限不足</h2>
          <p className="text-slate-400">该页面仅管理员可访问</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[150px] opacity-[0.08]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500 rounded-full blur-[150px] opacity-[0.08]" />

      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent tracking-tight">
              🐾 寄养数据大屏
            </h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">实时监控平台寄养业务运营数据</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 backdrop-blur border border-slate-700/50">
              <div className="relative">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                <span className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
              <span className="text-sm text-emerald-400 font-medium">实时运行中</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <KpiCard
            title="实时寄养中订单"
            value={stats?.activeInProgressOrders ?? 0}
            icon={<PawPrint className="w-6 h-6" />}
            gradient={GRADIENT_COLORS.green}
            change={12.5}
            unit="单"
          />
          <KpiCard
            title="今日新增订单"
            value={stats?.todayNewOrders ?? 0}
            icon={<Calendar className="w-6 h-6" />}
            gradient={GRADIENT_COLORS.blue}
            change={8.3}
            unit="单"
          />
          <KpiCard
            title="本月总收入"
            value={formatCurrency(stats?.monthTotalRevenue ?? 0).replace('¥', '')}
            icon={<DollarSign className="w-6 h-6" />}
            gradient={GRADIENT_COLORS.orange}
            change={23.7}
            unit="元"
          />
          <KpiCard
            title="活跃寄养人数"
            value={stats?.activeCaregiverCount ?? 0}
            icon={<Users className="w-6 h-6" />}
            gradient={GRADIENT_COLORS.purple}
            change={-3.2}
            unit="人"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <ChartCard title="寄养热力时段" icon={<BarChart3 className="w-5 h-5" />} badge="近12个月">
            <div className="h-80">
              {loading || heatMapData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatMapData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="barPeakGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                      }}
                      cursor={{ fill: 'rgba(6, 182, 212, 0.08)' }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                    />
                    <Bar
                      dataKey="count"
                      name="订单数"
                      radius={[8, 8, 0, 0]}
                    >
                      {heatMapData.map((entry, index) => {
                        const isPeak = entry.month.includes('2月') || entry.month.includes('7月') || entry.month.includes('8月');
                        return (
                          <Cell
                            key={index}
                            fill={isPeak ? 'url(#barPeakGradient)' : 'url(#barGradient)'}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-4 border-t border-slate-700/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-cyan-700/30 to-cyan-500" />
                <span className="text-xs text-slate-400">日常时段</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-amber-700/40 to-amber-500" />
                <span className="text-xs text-slate-400">春节/暑假高峰</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="物种分布" icon={<PieChartIcon className="w-5 h-5" />} badge="全平台">
            <div className="h-80">
              {loading || speciesData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {CHART_COLORS.map((color, i) => (
                        <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={speciesData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="rgba(15, 23, 42, 0.8)"
                      strokeWidth={2}
                    >
                      {speciesData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#pieGrad${index % CHART_COLORS.length})`} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                      }}
                      formatter={(value, name, props) => {
                        const payload = props.payload as { emoji?: string; percentage?: number };
                        const emoji = payload.emoji || '🐾';
                        const percentage = payload.percentage ?? 0;
                        return [
                          <span className="flex items-center gap-2">
                            <span>{emoji}</span>
                            <span>{value} 单 ({percentage.toFixed(1)}%)</span>
                          </span>,
                          name
                        ];
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                      formatter={(value, entry) => {
                        const emoji = (entry.payload as { emoji?: string })?.emoji || '🐾';
                        return (
                          <span className="flex items-center gap-1.5">
                            <span>{emoji}</span>
                            <span>{value}</span>
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <ChartCard title="寄养人接单排行 TOP10" icon={<Award className="w-5 h-5" />} badge="金牌寄养人">
            <div className="h-80 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
              {loading || topCaregivers.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
              ) : (
                topCaregivers.map((cg) => {
                  const percent = (cg.orders / maxOrders) * 100;
                  const medalColor = cg.rank === 1 ? 'from-amber-400 to-yellow-500'
                    : cg.rank === 2 ? 'from-slate-300 to-slate-400'
                    : cg.rank === 3 ? 'from-orange-400 to-amber-600'
                    : 'from-slate-600 to-slate-700';
                  return (
                    <div key={cg.caregiverId} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-700/30 transition-colors">
                      <div className={cn(
                        'flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br text-white text-sm font-bold shadow-md flex-shrink-0',
                        medalColor
                      )}>
                        {cg.rank <= 3 ? ['🥇', '🥈', '🥉'][cg.rank - 1] : cg.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-medium text-white text-sm truncate">{cg.caregiverName}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="flex items-center gap-0.5 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {cg.rating.toFixed(1)}
                            </span>
                            <span className="text-sm font-bold text-cyan-400">{cg.orders}单</span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ChartCard>

          <ChartCard title="平均寄养天数 & 每单费用趋势" icon={<TrendingUp className="w-5 h-5" />} badge="近6个月">
            <div className="h-80">
              {loading || trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="daysGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient id="amountGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#64748b"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#64748b"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'avgDays' ? `${value} 天` : `${value} 元`,
                        name === 'avgDays' ? '平均寄养天数' : '平均每单费用'
                      ]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                      formatter={(value) => value === 'avgDays' ? '平均寄养天数(天)' : '平均每单费用(元)'}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgDays"
                      name="avgDays"
                      stroke="url(#daysGradient)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#06b6d4', strokeWidth: 2, stroke: 'rgba(15, 23, 42, 0.8)' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgAmount"
                      name="avgAmount"
                      stroke="url(#amountGradient)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: 'rgba(15, 23, 42, 0.8)' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        <ChartCard title="实时订单动态" icon={<Clock className="w-5 h-5" />} badge="自动滚动">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: '总订单', value: orders.length, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              { label: '进行中', value: orders.filter(o => o.status === 'in_progress').length, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { label: '已完成', value: orders.filter(o => o.status === 'completed').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: '待确认', value: orders.filter(o => o.status === 'pending_confirm').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map((item) => (
              <div key={item.label} className={cn('rounded-xl p-3', item.bg)}>
                <div className={cn('text-2xl font-bold', item.color)}>{item.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          <div
            ref={scrollRef}
            className="h-64 overflow-hidden space-y-2 custom-scrollbar"
            onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
          >
            {loading || orders.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : (
              [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
                <div
                  key={order.id}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/30 hover:border-cyan-500/30 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-xl flex-shrink-0">
                    🐾
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{order.petName}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-500" />
                      <span className="text-sm text-slate-300">{order.caregiverName}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {formatTime(order.createdAt)} · {order.cost.days}天
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-amber-400">¥{order.cost.totalAmount}</span>
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium',
                      order.status === 'completed' && 'bg-emerald-500/15 text-emerald-400',
                      order.status === 'in_progress' && 'bg-violet-500/15 text-violet-400',
                      order.status === 'confirmed' && 'bg-blue-500/15 text-blue-400',
                      order.status === 'pending_confirm' && 'bg-amber-500/15 text-amber-400',
                      order.status === 'cancelled' && 'bg-slate-500/15 text-slate-400',
                      order.status === 'disputed' && 'bg-rose-500/15 text-rose-400',
                    )}>
                      {order.status === 'completed' ? '已完成'
                        : order.status === 'in_progress' ? '进行中'
                        : order.status === 'confirmed' ? '已确认'
                        : order.status === 'pending_confirm' ? '待确认'
                        : order.status === 'cancelled' ? '已取消'
                        : '争议中'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>

        <div className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} 宠物寄养平台 · 数据每 30 秒自动刷新
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
