import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Upload } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Species } from '../../shared/types';
import { SPECIES_LABELS, SPECIES_EMOJI } from '../../shared/types';

export default function RegisterLostPet() {
  const navigate = useNavigate();
  const { currentUser, registerLostPet } = useAppStore();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    petName: '',
    species: 'cat' as Species,
    breed: '',
    photoUrls: '',
    features: '',
    location: '',
    lostTime: new Date().toISOString().slice(0, 16),
    contact: '',
  });

  if (!currentUser) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="font-display text-2xl text-gray-700 mb-2">请先登录</h2>
        <p className="text-gray-500 mb-6">登录后才能登记走失宠物</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition"
        >
          返回首页
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.petName || !form.features || !form.location || !form.contact) return;
    await registerLostPet({
      petName: form.petName,
      species: form.species,
      breed: form.breed || undefined,
      photoUrls: form.photoUrls ? [form.photoUrls] : [],
      features: form.features,
      location: form.location,
      lostTime: new Date(form.lostTime).toISOString(),
      contact: form.contact,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in bg-white rounded-3xl shadow-card p-10 text-center max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-mint-500/10 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-mint-500" />
        </div>
        <h2 className="font-display text-2xl text-gray-800 mb-2">登记成功！</h2>
        <p className="text-gray-500 mb-6">
          我们会帮你一起寻找，祝你早日找回宝贝回家 🙏</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/lost')}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition"
          >
            查看走失列表
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-600 hover:text-primary-600 mb-4 text-sm font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8">
        <h1 className="font-display text-2xl text-gray-800 mb-6">📝 登记走失宠物</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">宠物名字 <span className="text-primary-500">*</span></label>
              <input
                required
                value={form.petName}
                onChange={(e) => setForm({ ...form, petName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                placeholder="宠物名字"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">物种 <span className="text-primary-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {(['cat', 'dog', 'rabbit', 'bird', 'other'] as Species[]).map((sp) => (
                  <label
                    key={sp}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2.5 rounded-full border-2 cursor-pointer transition text-sm',
                      form.species === sp
                        ? 'border-primary-400 bg-primary-50 text-primary-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200'
                    )}
                  >
                    <input
                      type="radio"
                      name="species"
                      value={sp}
                      checked={form.species === sp}
                      onChange={(e) => setForm({ ...form, species: e.target.value as Species })}
                      className="sr-only"
                    />
                    <span>{SPECIES_EMOJI[sp]} {SPECIES_LABELS[sp]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">品种</label>
              <input
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                placeholder="例如：英短、柴犬等"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">走失时间 <span className="text-primary-500">*</span></label>
              <input
                type="datetime-local"
                required
                value={form.lostTime}
                onChange={(e) => setForm({ ...form, lostTime: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">照片URL（用逗号分隔多个）</label>
            <div className="flex gap-2">
              <input
                value={form.photoUrls}
                onChange={(e) => setForm({ ...form, photoUrls: e.target.value })}
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                placeholder="https://..."
              />
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-3 bg-cream-100 text-gray-700 rounded-2xl hover:bg-cream-200 transition"
              >
                <Upload className="w-4 h-4" />
                上传
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">特征描述 <span className="text-primary-500">*</span></label>
            <textarea
              rows={3}
              required
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
              placeholder="毛色、花纹、是否佩戴物、性格特征等，越详细越容易被识别"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">走失地点 <span className="text-primary-500">*</span></label>
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
              placeholder="详细地址，例如：北京市朝阳区望京SOHO附近"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">联系方式 <span className="text-primary-500">*</span></label>
            <input
              required
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
              placeholder="手机号或微信号"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-medium text-lg rounded-2xl shadow-soft hover:shadow-md hover:from-primary-500 hover:to-primary-600 transition"
          >
            提交登记
          </button>
        </form>
      </div>
    </div>
  );
}
