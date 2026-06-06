import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  HeartOff,
  Eye,
  Clock,
  Calendar,
  Scissors,
  Weight,
  User,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Syringe,
  Bug,
  Stethoscope,
  FileText,
  Plus,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn, formatAge } from '@/lib/utils';
import type { Pet } from '../../shared/types';
import {
  SPECIES_LABELS,
  SPECIES_EMOJI,
  GENDER_LABELS,
} from '../../shared/types';

const TAG_COLORS = [
  'bg-rose-100 text-rose-600',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-600',
  'bg-sky-100 text-sky-600',
  'bg-violet-100 text-violet-600',
  'bg-pink-100 text-pink-600',
  'bg-orange-100 text-orange-600',
  'bg-teal-100 text-teal-600',
  'bg-indigo-100 text-indigo-600',
  'bg-fuchsia-100 text-fuchsia-600',
];

type DetailTab = 'info' | 'health';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentUser,
    pets,
    favorites,
    follows,
    healthProfile,
    fetchPet,
    fetchPets,
    fetchFavorites,
    fetchFollows,
    fetchHealthProfile,
    addHistory,
    toggleFavorite,
    toggleFollow,
    createApplication,
    isFavorite,
    isFollowing,
  } = useAppStore();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    contact: '',
    livingEnvironment: '自有住房',
    hasPetExperience: '是',
    dailyCompanionTime: '2-4小时',
    familyMembers: '',
  });
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPet(id);
        if (!result) {
          setError('宠物不存在');
          return;
        }
        setPet(result);
        setCurrentPhotoIndex(0);
        setSubmitSuccess(false);
        await fetchHealthProfile(id);

        if (currentUser) {
          await addHistory(currentUser.id, result);
          await fetchFavorites(currentUser.id);
          await fetchFollows(currentUser.id);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, currentUser, fetchPet, addHistory, fetchFavorites, fetchFollows, fetchHealthProfile]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const relatedPets = useMemo(() => {
    if (!pet) return [];
    return pets
      .filter((p) => p.id !== pet.id && p.species === pet.species && !p.isAdopted)
      .slice(0, 4);
  }, [pets, pet]);

  const timelineEvents = useMemo(() => {
    if (!healthProfile) return [];
    const events: {
      date: string;
      type: 'vaccine' | 'deworming' | 'checkup';
      title: string;
      description?: string;
      nextDate?: string;
    }[] = [];

    healthProfile.vaccines.forEach((v) => {
      events.push({
        date: v.date,
        type: 'vaccine',
        title: `疫苗接种：${v.vaccineName}`,
        nextDate: v.nextDate,
      });
    });
    healthProfile.dewormings.forEach((d) => {
      events.push({
        date: d.date,
        type: 'deworming',
        title: `驱虫：${d.dewormingType}`,
      });
    });
    healthProfile.checkups.forEach((c) => {
      events.push({
        date: c.date,
        type: 'checkup',
        title: c.title,
        description: c.description,
      });
    });

    events.sort((a, b) => b.date.localeCompare(a.date));
    return events;
  }, [healthProfile]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2500);
  };

  const handlePrevPhoto = () => {
    if (!pet) return;
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? pet.photoUrls.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    if (!pet) return;
    setCurrentPhotoIndex((prev) =>
      prev === pet.photoUrls.length - 1 ? 0 : prev + 1
    );
  };

  const handleFavorite = async () => {
    if (!currentUser || !pet) return;
    const added = await toggleFavorite(currentUser.id, pet.id);
    showNotification(added ? '已添加到收藏 ❤️' : '已取消收藏');
  };

  const handleFollow = async () => {
    if (!currentUser || !pet) return;
    const followed = await toggleFollow(currentUser.id, pet.id);
    showNotification(followed ? `已关注 ${pet.name}，有新动态会通知你 🔔` : '已取消关注');
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !pet) return;

    try {
      await createApplication({
        petId: pet.id,
        petName: pet.name,
        petPhoto: pet.photoUrls[0] || '',
        applicantId: currentUser.id,
        applicantName: currentUser.name,
        contact: formData.contact,
        livingEnvironment: formData.livingEnvironment,
        hasPetExperience: formData.hasPetExperience === '是',
        dailyCompanionTime: formData.dailyCompanionTime,
        familyMembers: formData.familyMembers,
        status: 'pending',
      });
      setSubmitSuccess(true);
    } catch (err) {
      showNotification('提交失败，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-20">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <div className="text-gray-500 mb-4">{error || '宠物不存在'}</div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition"
        >
          返回首页
        </button>
      </div>
    );
  }

  const isFav = currentUser ? isFavorite(pet.id) : false;
  const isFol = currentUser ? isFollowing(pet.id) : false;

  return (
    <div className="animate-fade-in relative pb-12">
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white shadow-card rounded-2xl px-6 py-3 border border-primary-100 animate-fade-in">
          <div className="flex items-center gap-2 text-gray-700">
            <CheckCircle className="w-5 h-5 text-mint-500" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div className="relative">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-card bg-cream-100">
              {pet.photoUrls.length > 0 && (
                <img
                  src={pet.photoUrls[currentPhotoIndex]}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              )}

              {pet.isAdopted && (
                <div className="absolute top-4 right-4 bg-mint-500 text-white font-display text-lg px-5 py-2 rounded-full shadow-lg">
                  已被领养 💚
                </div>
              )}

              {pet.photoUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {pet.photoUrls.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {pet.photoUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition',
                      idx === currentPhotoIndex
                        ? 'border-primary-400 ring-2 ring-primary-200'
                        : 'border-transparent hover:border-primary-200'
                    )}
                  >
                    <img
                      src={url}
                      alt={`${pet.name}-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="font-display text-3xl text-primary-500 mb-2">
              {pet.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{SPECIES_EMOJI[pet.species]}</span>
              <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                {SPECIES_LABELS[pet.species]}
              </span>
              <span className="text-gray-600">{pet.breed}</span>
            </div>
          </div>

          {pet.personalityTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pet.personalityTags.map((tag, idx) => (
                <span
                  key={tag}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    TAG_COLORS[idx % TAG_COLORS.length]
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-cream-50 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">年龄</div>
                <div className="text-gray-800 font-medium">{formatAge(pet.age)}</div>
              </div>
            </div>
            <div className="bg-cream-50 rounded-2xl px-4 py-3 flex items-center gap-3">
              <User className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">性别</div>
                <div className="text-gray-800 font-medium">
                  {GENDER_LABELS[pet.gender]}
                </div>
              </div>
            </div>
            <div className="bg-cream-50 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Weight className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">体重</div>
                <div className="text-gray-800 font-medium">{pet.weight} kg</div>
              </div>
            </div>
            <div className="bg-cream-50 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Scissors className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">绝育</div>
                <div className="text-gray-800 font-medium">
                  {pet.neutered ? '已绝育' : '未绝育'}
                </div>
              </div>
            </div>
            <div className="bg-cream-50 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">发布时间</div>
                <div className="text-gray-800 font-medium">
                  {formatDate(pet.createdAt)}
                </div>
              </div>
            </div>
            <div className="bg-cream-50 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-500">浏览</div>
                <div className="text-gray-800 font-medium">{pet.viewCount} 次</div>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-primary-400 bg-cream-50 rounded-r-2xl px-5 py-4 italic text-gray-600">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{pet.healthDescription}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center text-white font-display text-xl">
              {pet.publisherName.charAt(0)}
            </div>
            <div>
              <div className="text-xs text-gray-500">发布者</div>
              <div className="text-gray-800 font-medium">{pet.publisherName}</div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleFavorite}
              disabled={!currentUser}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full transition border-2',
                isFav
                  ? 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 hover:border-primary-600'
                  : 'bg-white text-primary-500 border-primary-200 hover:border-primary-400 hover:bg-primary-50',
                !currentUser && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isFav ? (
                <Heart className="w-5 h-5 fill-current" />
              ) : (
                <HeartOff className="w-5 h-5" />
              )}
              <span className="font-medium">收藏</span>
            </button>

            <button
              onClick={handleFollow}
              disabled={!currentUser}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full transition border-2',
                isFol
                  ? 'bg-sky-500 text-white border-sky-500 hover:bg-sky-600 hover:border-sky-600'
                  : 'bg-white text-sky-500 border-sky-200 hover:border-sky-400 hover:bg-sky-50',
                !currentUser && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">{isFol ? '已关注' : '关注'}</span>
            </button>

            {!pet.isAdopted && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex-1 sm:flex-none sm:min-w-[160px] px-6 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-medium rounded-full shadow-soft hover:shadow-md hover:from-primary-500 hover:to-primary-600 transition"
              >
                {showForm ? '收起表单' : '申请领养'}
              </button>
            )}
          </div>

          {!currentUser && (
            <p className="text-sm text-gray-500">
              请先登录后再进行收藏、关注或领养申请
            </p>
          )}
        </div>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              'px-6 py-3 font-medium text-sm transition-all relative',
              activeTab === 'info'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              基础信息
            </span>
            {activeTab === 'info' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={cn(
              'px-6 py-3 font-medium text-sm transition-all relative',
              activeTab === 'health'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              健康档案
              {pet.isAdopted && (
                <span className="ml-1 text-xs bg-mint-100 text-mint-700 px-2 py-0.5 rounded-full">
                  已转移
                </span>
              )}
            </span>
            {activeTab === 'health' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-t" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'health' && (
        <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8 mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl text-gray-800 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-primary-500" />
              健康档案时间线
            </h3>
          </div>

          {!healthProfile || timelineEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h4 className="font-display text-lg text-gray-700 mb-2">暂无健康记录</h4>
              <p className="text-sm text-gray-500">这只宠物还没有健康档案记录</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative pl-14">
                    <div className={cn(
                      'absolute left-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md',
                      event.type === 'vaccine' && 'bg-sky-100',
                      event.type === 'deworming' && 'bg-emerald-100',
                      event.type === 'checkup' && 'bg-violet-100'
                    )}>
                      {event.type === 'vaccine' && <Syringe className="w-5 h-5 text-sky-600" />}
                      {event.type === 'deworming' && <Bug className="w-5 h-5 text-emerald-600" />}
                      {event.type === 'checkup' && <Plus className="w-5 h-5 text-violet-600" />}
                    </div>
                    <div className="bg-cream-50 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(event.date)}</span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      {event.nextDate && (
                        <div className="text-xs text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          下次接种：{formatDate(event.nextDate)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!pet.isAdopted && showForm && (
        <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8 mb-12 animate-fade-in border border-primary-50">
          <h2 className="font-display text-2xl text-gray-800 mb-6">
            🐾 领养申请表
          </h2>

          {submitSuccess ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-mint-500/10 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-mint-500" />
              </div>
              <h3 className="font-display text-2xl text-gray-800 mb-2">
                申请已提交！
              </h3>
              <p className="text-gray-500 mb-6">
                发布者将尽快审核你的申请，请耐心等待～
              </p>
              <button
                onClick={() => setShowForm(false)}
                className="px-8 py-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition"
              >
                好的
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitApplication} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系方式 <span className="text-primary-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="请填写手机号或微信号"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  居住环境 <span className="text-primary-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {['自有住房', '租房', '和家人同住'].map((option) => (
                    <label
                      key={option}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-full border-2 cursor-pointer transition',
                        formData.livingEnvironment === option
                          ? 'border-primary-400 bg-primary-50 text-primary-600'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200'
                      )}
                    >
                      <input
                        type="radio"
                        name="livingEnvironment"
                        value={option}
                        checked={formData.livingEnvironment === option}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            livingEnvironment: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                      <span className="font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  是否有养宠经验 <span className="text-primary-500">*</span>
                </label>
                <div className="flex gap-3">
                  {['是', '否'].map((option) => (
                    <label
                      key={option}
                      className={cn(
                        'flex items-center gap-2 px-6 py-2.5 rounded-full border-2 cursor-pointer transition',
                        formData.hasPetExperience === option
                          ? 'border-primary-400 bg-primary-50 text-primary-600'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200'
                      )}
                    >
                      <input
                        type="radio"
                        name="hasPetExperience"
                        value={option}
                        checked={formData.hasPetExperience === option}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hasPetExperience: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                      <span className="font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  每日可陪伴时间 <span className="text-primary-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {['<2小时', '2-4小时', '4-8小时', '>8小时'].map((option) => (
                    <label
                      key={option}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-full border-2 cursor-pointer transition',
                        formData.dailyCompanionTime === option
                          ? 'border-primary-400 bg-primary-50 text-primary-600'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200'
                      )}
                    >
                      <input
                        type="radio"
                        name="dailyCompanionTime"
                        value={option}
                        checked={formData.dailyCompanionTime === option}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dailyCompanionTime: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                      <span className="font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  家庭成员情况简述
                </label>
                <textarea
                  rows={4}
                  placeholder="请简要描述家庭成员情况，例如是否有老人、小孩、其他宠物等，有助于发布者了解情况~"
                  value={formData.familyMembers}
                  onChange={(e) =>
                    setFormData({ ...formData, familyMembers: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-medium text-lg rounded-2xl shadow-soft hover:shadow-md hover:from-primary-500 hover:to-primary-600 transition"
              >
                提交申请
              </button>
            </form>
          )}
        </div>
      )}

      {relatedPets.length > 0 && (
        <div>
          <h2 className="font-display text-2xl text-gray-800 mb-5">
            🌟 同种类的其他小伙伴
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {relatedPets.map((relatedPet) => (
              <button
                key={relatedPet.id}
                onClick={() => navigate(`/pet/${relatedPet.id}`)}
                className="flex-shrink-0 w-56 bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-md transition group text-left"
              >
                <div className="h-40 bg-cream-100 overflow-hidden">
                  {relatedPet.photoUrls[0] && (
                    <img
                      src={relatedPet.photoUrls[0]}
                      alt={relatedPet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{SPECIES_EMOJI[relatedPet.species]}</span>
                    <h3 className="font-display text-lg text-gray-800">
                      {relatedPet.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">{relatedPet.breed}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{formatAge(relatedPet.age)}</span>
                    <span>·</span>
                    <span>{GENDER_LABELS[relatedPet.gender]}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
