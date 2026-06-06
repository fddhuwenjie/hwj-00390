import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PawPrint,
  Heart,
  Scissors,
  Weight,
  Calendar,
  Tag,
  Image,
  Plus,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Species, Gender, PersonalityTag } from '../../shared/types';
import {
  SPECIES_LABELS,
  SPECIES_EMOJI,
  GENDER_LABELS,
  ALL_PERSONALITY_TAGS,
} from '../../shared/types';

export default function PublishPet() {
  const navigate = useNavigate();
  const { currentUser, createPet } = useAppStore();

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    species: 'cat' as Species,
    breed: '',
    age: '',
    gender: 'male' as Gender,
    weight: '',
    neutered: false,
    healthDescription: '',
    personalityTags: [] as PersonalityTag[],
    photoUrls: ['', '', ''],
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTag = (tag: PersonalityTag) => {
    setFormData((prev) => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter((t) => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  };

  const addPhotoUrl = () => {
    setFormData((prev) => ({
      ...prev,
      photoUrls: [...prev.photoUrls, ''],
    }));
  };

  const removePhotoUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, i) => i !== index),
    }));
  };

  const updatePhotoUrl = (index: number, value: string) => {
    setFormData((prev) => {
      const newUrls = [...prev.photoUrls];
      newUrls[index] = value;
      return { ...prev, photoUrls: newUrls };
    });
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      showToast('error', '请先登录');
      return;
    }

    if (!formData.name.trim()) {
      showToast('error', '请输入宠物名称');
      return;
    }
    if (!formData.age || Number(formData.age) <= 0) {
      showToast('error', '请输入有效的年龄');
      return;
    }
    if (!formData.weight || Number(formData.weight) <= 0) {
      showToast('error', '请输入有效的体重');
      return;
    }

    const validPhotoUrls = formData.photoUrls.filter((url) => url.trim() !== '');

    setSubmitting(true);
    try {
      const pet = await createPet({
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        neutered: formData.neutered,
        healthDescription: formData.healthDescription.trim(),
        personalityTags: formData.personalityTags,
        photoUrls: validPhotoUrls,
        publisherId: currentUser.id,
        publisherName: currentUser.name,
      });

      showToast('success', '发布成功！');
      setTimeout(() => {
        navigate(`/pet/${pet.id}`);
      }, 1000);
    } catch (err) {
      showToast('error', (err as Error).message || '发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-12 shadow-card text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cream-100 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">请先登录</h2>
          <p className="text-gray-500">登录后才能发布宠物信息哦</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {toast && (
        <div
          className={cn(
            'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg animate-fade-in flex items-center gap-2 text-white',
            toast.type === 'success' ? 'bg-mint-500' : 'bg-rose-500'
          )}
        >
          {toast.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h1 className="font-display text-3xl text-primary-600 mb-2">发布宠物</h1>
        <p className="text-gray-500">填写宠物信息，帮助它找到温暖的家 🏠</p>
      </div>

      <div className="space-y-6">
        <section className="bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">基本信息</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                宠物名称 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="给它起个名字吧"
                className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                物种 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(SPECIES_LABELS) as Species[]).map((species) => (
                  <button
                    key={species}
                    type="button"
                    onClick={() => setFormData({ ...formData, species })}
                    className={cn(
                      'flex flex-col items-center gap-1 py-3 rounded-2xl transition-all border-2',
                      formData.species === species
                        ? 'border-primary-400 bg-primary-50 text-primary-600'
                        : 'border-transparent bg-cream-50 text-gray-600 hover:bg-cream-100'
                    )}
                  >
                    <span className="text-2xl">{SPECIES_EMOJI[species]}</span>
                    <span className="text-xs font-medium">{SPECIES_LABELS[species]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">品种</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="如：中华田园猫"
                className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                年龄（月）<span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="如：6"
                className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">性别</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(GENDER_LABELS) as Gender[]).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender })}
                    className={cn(
                      'py-3 rounded-2xl font-medium transition-all border-2',
                      formData.gender === gender
                        ? 'border-primary-400 bg-primary-50 text-primary-600'
                        : 'border-transparent bg-cream-50 text-gray-600 hover:bg-cream-100'
                    )}
                  >
                    {gender === 'male' ? '♂ ' : '♀ '}
                    {GENDER_LABELS[gender]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Weight className="w-4 h-4 text-gray-400" />
                体重（kg）<span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="如：3.5"
                className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-mint-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-mint-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">健康信息</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Scissors className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">是否已绝育</p>
                  <p className="text-sm text-gray-500">绝育有助于宠物健康</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, neutered: !formData.neutered })}
                className={cn(
                  'relative w-14 h-8 rounded-full transition-all',
                  formData.neutered ? 'bg-primary-500' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all',
                    formData.neutered ? 'left-7' : 'left-1'
                  )}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">健康描述</label>
              <textarea
                value={formData.healthDescription}
                onChange={(e) => setFormData({ ...formData, healthDescription: e.target.value })}
                placeholder="描述一下宠物的健康状况，如疫苗接种情况、有无病史等..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">性格标签</h2>
            <span className="text-sm text-gray-400">（可多选）</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ALL_PERSONALITY_TAGS.map((tag) => {
              const isSelected = formData.personalityTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    isSelected
                      ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-soft'
                      : 'bg-cream-100 text-gray-600 hover:bg-cream-200'
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
              <Image className="w-5 h-5 text-sky-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">照片</h2>
            <span className="text-sm text-gray-400">（粘贴图片 URL）</span>
          </div>

          <div className="space-y-3">
            {formData.photoUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-cream-100 flex-shrink-0 overflow-hidden">
                  {url ? (
                    <img src={url} alt={`photo-${index}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
                      <Image className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updatePhotoUrl(index, e.target.value)}
                  placeholder={`图片 URL ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
                {formData.photoUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhotoUrl(index)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-100 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addPhotoUrl}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cream-100 text-gray-600 hover:bg-cream-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加更多图片
          </button>
        </section>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={cn(
            'w-full py-4 rounded-3xl text-white font-bold text-lg shadow-soft transition-all',
            'bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 hover:shadow-lg',
            submitting && 'opacity-60 cursor-not-allowed'
          )}
        >
          {submitting ? '发布中...' : '✨ 发布宠物信息'}
        </button>
      </div>
    </div>
  );
}
