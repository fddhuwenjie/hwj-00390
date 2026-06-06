import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { SPECIES_LABELS } from '../../shared/types';
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
import { Shield, PawPrint, Heart, ClipboardList, Target, Calendar } from 'lucide-react';

const WARM_COLORS = ['#FF8A65', '#FFB18F', '#FFD0B9', '#FFE8DC', '#FFC107'];

export default function Admin() {
  const { currentUser, adminStats, loading, fetchAdminStats } = useAppStore();

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAdminStats();
    }
  }, [currentUser, fetchAdminStats]);

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

  if (loading || !adminStats) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-10 bg-cream-200 rounded-2xl w-48 animate-pulse-soft" />
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
    );
  }

  const stats = [
    {
      label: '总宠物数',
      value: adminStats.totalPets,
      icon: '🐾',
      gradient: 'from-orange-400 to-orange-500',
      borderColor: 'bg-gradient-to-r from-orange-400 to-orange-500',
    },
    {
      label: '已被领养',
      value: adminStats.adoptedPets,
      icon: '💚',
      gradient: 'from-green-400 to-emerald-500',
      borderColor: 'bg-gradient-to-r from-green-400 to-emerald-500',
    },
    {
      label: '待审申请',
      value: adminStats.pendingApplications,
      icon: '📋',
      gradient: 'from-blue-400 to-sky-500',
      borderColor: 'bg-gradient-to-r from-blue-400 to-sky-500',
    },
    {
      label: '领养成功率',
      value: `${Math.round(adminStats.adoptionSuccessRate * 100)}%`,
      icon: '🎯',
      gradient: 'from-purple-400 to-violet-500',
      borderColor: 'bg-gradient-to-r from-purple-400 to-violet-500',
    },
  ];

  const pieData = adminStats.speciesDistribution.map((item) => ({
    name: SPECIES_LABELS[item.species] || item.species,
    value: item.count,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gray-800 mb-2">管理后台 📊</h1>
        <p className="text-gray-500">平台数据概览与运营分析</p>
      </div>

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
    </div>
  );
}
