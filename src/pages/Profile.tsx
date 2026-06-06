import { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import {
  Heart,
  Clock,
  FileText,
  ClipboardList,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Check,
  XCircle,
  Eye,
  Edit,
  ArrowDown,
  Star,
  ThumbsUp,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type {
  Pet,
  Application,
  Story,
  HistoryRecord,
  Favorite,
} from '../../shared/types';
import {
  SPECIES_LABELS,
  SPECIES_EMOJI,
  STATUS_LABELS,
} from '../../shared/types';

const MENU_ITEMS = [
  { path: '/profile/favorites', label: '我的收藏', icon: Heart, emoji: '🐱' },
  { path: '/profile/history', label: '浏览历史', icon: Clock, emoji: '👀' },
  { path: '/profile/mypets', label: '我的发布', icon: FileText, emoji: '📝' },
  { path: '/profile/applications', label: '我的申请', icon: ClipboardList, emoji: '📋' },
  { path: '/profile/stories', label: '我的故事', icon: BookOpen, emoji: '📖' },
];

function UserCard() {
  const { currentUser } = useAppStore();

  const roleLabels: Record<string, string> = {
    user: '普通用户',
    publisher: '发布者',
    admin: '管理员',
  };

  const roleColors: Record<string, string> = {
    user: 'bg-sky-100 text-sky-600',
    publisher: 'bg-amber-100 text-amber-700',
    admin: 'bg-rose-100 text-rose-600',
  };

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-card border border-cream-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center text-4xl">
            🔒
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">请先登录</h2>
            <p className="text-sm text-gray-500 mt-1">登录后可查看收藏、历史记录等内容</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary-400 to-primary-500 rounded-3xl p-6 text-white shadow-soft">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl">
          {currentUser.avatar}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{currentUser.name}</h2>
          <span
            className={cn(
              'inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium',
              roleColors[currentUser.role]
            )}
          >
            {roleLabels[currentUser.role]}
          </span>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col gap-2 w-56">
      <UserCard />
      <nav className="bg-white rounded-3xl p-3 shadow-card">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === '/profile/favorites' && location.pathname === '/profile');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all mb-1 last:mb-0',
                isActive
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:bg-cream-100 hover:text-primary-500'
              )}
            >
              <span className="text-lg">{item.emoji}</span>
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileTabs() {
  const location = useLocation();

  return (
    <div className="md:hidden mb-4">
      <UserCard />
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/profile/favorites' && location.pathname === '/profile');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                isActive
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'bg-white text-gray-600 hover:bg-cream-100'
              )}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function PetCard({ pet, onClick }: { pet: Pet; onClick?: () => void }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={onClick || (() => navigate(`/pet/${pet.id}`))}
      className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-soft transition-all cursor-pointer group"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        {pet.photoUrls[0] ? (
          <img
            src={pet.photoUrls[0]}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {SPECIES_EMOJI[pet.species]}
          </div>
        )}
        {pet.isAdopted && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-gray-800/80 text-white text-xs rounded-full">
            已领养
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-800">{pet.name}</h3>
          <span className="text-lg">{SPECIES_EMOJI[pet.species]}</span>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          {SPECIES_LABELS[pet.species]} · {pet.breed || '未知品种'}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {pet.favoriteCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {pet.viewCount}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, emoji = '🐾' }: { message: string; emoji?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl mb-4">{emoji}</div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

function FavoritesView() {
  const navigate = useNavigate();
  const { currentUser, pets, favorites, fetchFavorites, fetchPets } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      await Promise.all([fetchFavorites(currentUser.id), fetchPets()]);
      setLoading(false);
    };
    load();
  }, [currentUser, fetchFavorites, fetchPets]);

  if (!currentUser) {
    return <EmptyState message="请先登录查看收藏" emoji="🔒" />;
  }

  const favoritePetIds = new Set(favorites.map((f: Favorite) => f.petId));
  const favoritePets = pets.filter((p: Pet) => favoritePetIds.has(p.id));

  if (loading) {
    return <EmptyState message="加载中..." emoji="⏳" />;
  }

  if (favoritePets.length === 0) {
    return <EmptyState message="还没有收藏的宠物哦" emoji="💝" />;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">我的收藏 ({favoritePets.length})</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favoritePets.map((pet) => (
          <PetCard key={pet.id} pet={pet} onClick={() => navigate(`/pet/${pet.id}`)} />
        ))}
      </div>
    </div>
  );
}

function HistoryView() {
  const navigate = useNavigate();
  const { currentUser, history, fetchHistory } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      await fetchHistory(currentUser.id);
      setLoading(false);
    };
    load();
  }, [currentUser, fetchHistory]);

  if (!currentUser) {
    return <EmptyState message="请先登录查看浏览历史" emoji="🔒" />;
  }

  if (loading) {
    return <EmptyState message="加载中..." emoji="⏳" />;
  }

  const sortedHistory = [...history]
    .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
    .slice(0, 20);

  if (sortedHistory.length === 0) {
    return <EmptyState message="还没有浏览记录哦" emoji="👀" />;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">浏览历史 ({sortedHistory.length})</h2>
      <div className="bg-white rounded-3xl p-4 shadow-card">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {sortedHistory.map((record: HistoryRecord) => (
            <div
              key={record.id}
              onClick={() => navigate(`/pet/${record.petId}`)}
              className="flex-shrink-0 w-40 bg-cream-50 rounded-2xl overflow-hidden cursor-pointer hover:bg-cream-100 transition-colors"
            >
              <div className="aspect-square bg-cream-200 overflow-hidden">
                {record.petPhoto ? (
                  <img src={record.petPhoto} alt={record.petName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-medium text-gray-800 text-sm truncate">{record.petName}</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(record.viewedAt).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyPetsView() {
  const navigate = useNavigate();
  const {
    currentUser,
    pets,
    applications,
    fetchPets,
    fetchApplications,
    updateApplication,
  } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [expandedPetId, setExpandedPetId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      await Promise.all([fetchPets(), fetchApplications()]);
      setLoading(false);
    };
    load();
  }, [currentUser, fetchPets, fetchApplications]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  if (!currentUser) {
    return <EmptyState message="请先登录" emoji="🔒" />;
  }

  if (currentUser.role !== 'publisher' && currentUser.role !== 'admin') {
    return <EmptyState message="仅发布者和管理员可查看" emoji="🚫" />;
  }

  if (loading) {
    return <EmptyState message="加载中..." emoji="⏳" />;
  }

  const myPets = pets.filter((p: Pet) => p.publisherId === currentUser.id);

  if (myPets.length === 0) {
    return <EmptyState message="还没有发布的宠物哦" emoji="📝" />;
  }

  const handleUpdateApplication = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateApplication(id, status);
      await fetchApplications();
      showToast(status === 'approved' ? '已通过申请' : '已拒绝申请');
    } catch {
      showToast('操作失败');
    }
  };

  const getPetApplications = (petId: string) =>
    applications.filter((a: Application) => a.petId === petId);

  return (
    <div>
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gray-800 text-white rounded-full shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-800 mb-4">我的发布 ({myPets.length})</h2>
      <div className="space-y-3">
        {myPets.map((pet) => {
          const petApps = getPetApplications(pet.id);
          const isExpanded = expandedPetId === pet.id;

          return (
            <div key={pet.id} className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-cream-100 flex-shrink-0">
                  {pet.photoUrls[0] ? (
                    <img src={pet.photoUrls[0]} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {SPECIES_EMOJI[pet.species]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{pet.name}</h3>
                    {pet.isAdopted ? (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">已领养</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-mint-100 text-mint-600 text-xs rounded-full">待领养</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {SPECIES_LABELS[pet.species]} · {pet.breed || '未知'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(pet.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" />
                      {petApps.length} 个申请
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/pet/${pet.id}`)}
                    className="p-2 rounded-xl bg-cream-100 text-gray-600 hover:bg-cream-200 transition-colors"
                    title="查看详情"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-xl bg-cream-100 text-gray-600 hover:bg-cream-200 transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-xl bg-cream-100 text-gray-600 hover:bg-cream-200 transition-colors"
                    title="下架"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {petApps.length > 0 && (
                <>
                  <button
                    onClick={() => setExpandedPetId(isExpanded ? null : pet.id)}
                    className="w-full px-4 py-2 bg-cream-50 flex items-center justify-center gap-1 text-sm text-primary-600 hover:bg-cream-100 transition-colors border-t border-cream-100"
                  >
                    {isExpanded ? (
                      <><ChevronDown className="w-4 h-4" /> 收起申请列表</>
                    ) : (
                      <><ChevronRight className="w-4 h-4" /> 查看 {petApps.length} 个申请</>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-cream-100 divide-y divide-cream-100">
                      {petApps.map((app: Application) => (
                        <div key={app.id} className="p-4 bg-cream-50/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
                                <UserIcon className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{app.applicantName}</p>
                                <p className="text-xs text-gray-500">联系方式: {app.contact}</p>
                                <p className="text-xs text-gray-400">
                                  提交于 {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded-full text-xs font-medium',
                                  app.status === 'pending' && 'bg-amber-100 text-amber-700',
                                  app.status === 'approved' && 'bg-mint-100 text-mint-600',
                                  app.status === 'rejected' && 'bg-gray-100 text-gray-500'
                                )}
                              >
                                {STATUS_LABELS[app.status]}
                              </span>
                              {app.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateApplication(app.id, 'approved')}
                                    className="p-1.5 rounded-lg bg-mint-100 text-mint-600 hover:bg-mint-200 transition-colors"
                                    title="通过"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateApplication(app.id, 'rejected')}
                                    className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                    title="拒绝"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationsView() {
  const navigate = useNavigate();
  const { currentUser, applications, fetchApplications } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      await fetchApplications({ applicantId: currentUser.id });
      setLoading(false);
    };
    load();
  }, [currentUser, fetchApplications]);

  if (!currentUser) {
    return <EmptyState message="请先登录" emoji="🔒" />;
  }

  if (loading) {
    return <EmptyState message="加载中..." emoji="⏳" />;
  }

  const myApplications = applications.filter(
    (a: Application) => a.applicantId === currentUser.id
  );

  if (myApplications.length === 0) {
    return <EmptyState message="还没有提交过申请哦" emoji="📋" />;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-mint-100 text-mint-600',
    rejected: 'bg-gray-100 text-gray-500',
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">我的申请 ({myApplications.length})</h2>
      <div className="space-y-3">
        {myApplications.map((app: Application) => {
          const isExpanded = expandedId === app.id;
          return (
            <div
              key={app.id}
              className="bg-white rounded-3xl shadow-card overflow-hidden cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : app.id)}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-cream-100 flex-shrink-0">
                  {app.petPhoto ? (
                    <img src={app.petPhoto} alt={app.petName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800">{app.petName}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    申请于 {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    statusColors[app.status]
                  )}
                >
                  {STATUS_LABELS[app.status]}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-cream-100 pt-4 bg-cream-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">联系方式</p>
                      <p className="text-gray-700">{app.contact}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">居住环境</p>
                      <p className="text-gray-700">{app.livingEnvironment}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">养宠经验</p>
                      <p className="text-gray-700">{app.hasPetExperience ? '有' : '无'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">每日陪伴时间</p>
                      <p className="text-gray-700">{app.dailyCompanionTime}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-400 mb-1">家庭成员</p>
                      <p className="text-gray-700">{app.familyMembers}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pet/${app.petId}`);
                    }}
                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
                  >
                    查看宠物详情
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StoriesView() {
  const { currentUser, stories, fetchStories, createStory } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchStories();
      setLoading(false);
    };
    load();
  }, [fetchStories]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSubmit = async () => {
    if (!currentUser || !formData.title.trim() || !formData.content.trim()) {
      showToast('请填写完整信息');
      return;
    }
    try {
      await createStory({
        title: formData.title.trim(),
        content: formData.content.trim(),
        images: formData.imageUrl ? [formData.imageUrl.trim()] : [],
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
      });
      await fetchStories();
      setShowModal(false);
      setFormData({ title: '', content: '', imageUrl: '' });
      showToast('发布成功！');
    } catch {
      showToast('发布失败');
    }
  };

  if (!currentUser) {
    return <EmptyState message="请先登录" emoji="🔒" />;
  }

  if (loading) {
    return <EmptyState message="加载中..." emoji="⏳" />;
  }

  const myStories = stories.filter((s: Story) => s.authorId === currentUser.id);

  return (
    <div>
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gray-800 text-white rounded-full shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">我的故事 ({myStories.length})</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-2xl font-medium shadow-soft hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          发布新故事
        </button>
      </div>

      {myStories.length === 0 ? (
        <EmptyState message="还没有发布过故事哦" emoji="📖" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myStories.map((story: Story) => (
            <div
              key={story.id}
              className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-soft transition-all cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden bg-cream-100">
                {story.images[0] ? (
                  <img
                    src={story.images[0]}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
                )}
                {story.isFeatured && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    精选
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 line-clamp-1 mb-2">{story.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{story.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {story.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(story.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-card animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-cream-100">
              <h3 className="text-lg font-bold text-gray-800">发布新故事</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-cream-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="给你的故事起个标题..."
                  className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="分享你的领养故事..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">封面图片 URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-cream-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-2xl bg-cream-100 text-gray-600 font-medium hover:bg-cream-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-white font-medium shadow-soft hover:shadow-lg transition-all"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentArea() {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/profile/history') return <HistoryView />;
  if (path === '/profile/mypets') return <MyPetsView />;
  if (path === '/profile/applications') return <ApplicationsView />;
  if (path === '/profile/stories') return <StoriesView />;
  return <FavoritesView />;
}

export default function Profile() {
  return (
    <div className="animate-fade-in">
      <MobileTabs />
      <div className="flex gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <ContentArea />
        </main>
      </div>
    </div>
  );
}
