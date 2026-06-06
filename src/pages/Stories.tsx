import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Heart, MessageCircle, PenLine, X } from 'lucide-react';

export default function Stories() {
  const { stories, loading, fetchStories, createStory, currentUser } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await createStory({
        title: title.trim(),
        content: content.trim(),
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        authorId: currentUser?.id || '1',
        authorName: currentUser?.name || '匿名用户',
        authorAvatar: currentUser?.avatar || '🐾',
      });
      setTitle('');
      setContent('');
      setImageUrl('');
      setShowModal(false);
      fetchStories();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-10 bg-cream-200 rounded-2xl w-48 animate-pulse-soft mb-2" />
            <div className="h-5 bg-cream-200 rounded-xl w-64 animate-pulse-soft" />
          </div>
          <div className="h-11 bg-cream-200 rounded-2xl w-40 animate-pulse-soft" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl shadow-card h-96 animate-pulse-soft" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-gray-800 mb-2">领养故事 📖</h1>
          <p className="text-gray-500">看看这些毛孩子的幸福结局</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-medium shadow-soft hover:shadow-lg transition-all duration-300"
        >
          <PenLine className="w-4 h-4" />
          分享我的故事
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-cream-200 rounded-full flex items-center justify-center mb-5">
            <span className="text-4xl">📖</span>
          </div>
          <p className="text-gray-500 text-lg">还没有故事，来分享第一个吧~</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stories.map((story) => (
            <Link
              key={story.id}
              to={`/story/${story.id}`}
              className="bg-white rounded-3xl shadow-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="relative">
                {story.images && story.images.length > 0 ? (
                  <img
                    src={story.images[0]}
                    alt={story.title}
                    className="w-full h-48 object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-cream-200 rounded-t-3xl flex items-center justify-center">
                    <span className="text-5xl">🐾</span>
                  </div>
                )}
                {story.isFeatured && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full shadow-md flex items-center gap-1">
                    <span>⭐</span>
                    精选
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="font-display text-xl text-gray-800 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {story.title}
                </h2>

                <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                  <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs">
                    {story.authorAvatar}
                  </span>
                  <span>{story.authorName}</span>
                  <span className="text-gray-300">·</span>
                  <span>{formatDate(story.createdAt)}</span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {story.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-primary-400" />
                    <span>{story.likes}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-primary-400" />
                    <span>评论</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-card w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl text-gray-800">分享我的故事 ✍️</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-cream-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="给你的故事起个温馨的标题"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">内容</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="记录你和毛孩子的点点滴滴..."
                  rows={5}
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  图片 URL（可选）
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-gray-600 bg-cream-100 hover:bg-cream-200 rounded-2xl font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !content.trim() || submitting}
                  className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-2xl font-medium transition-colors shadow-soft"
                >
                  {submitting ? '发布中...' : '发布故事'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
