import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { Story } from '../../shared/types';
import {
  Heart,
  Share2,
  Send,
  MessageCircle,
  ChevronLeft,
} from 'lucide-react';

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    stories,
    comments,
    loading,
    fetchStories,
    fetchComments,
    likeStory,
    createComment,
    currentUser,
  } = useAppStore();

  const [story, setStory] = useState<Story | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [displayLikes, setDisplayLikes] = useState(0);

  useEffect(() => {
    if (stories.length === 0) {
      fetchStories();
    }
  }, [stories.length, fetchStories]);

  useEffect(() => {
    if (id) {
      fetchComments(id);
      const found = stories.find((s) => s.id === id) || null;
      setStory(found);
      if (found) {
        setDisplayLikes(found.likes);
      }
    }
  }, [id, stories, fetchComments]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLike = async () => {
    if (!story || liked) return;
    setLiked(true);
    setLikeAnimating(true);
    setDisplayLikes((prev) => prev + 1);
    setTimeout(() => setLikeAnimating(false), 400);
    try {
      await likeStory(story.id);
    } catch {
      setLiked(false);
      setDisplayLikes((prev) => prev - 1);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.content.slice(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('链接已复制到剪贴板 🔗');
    }
  };

  const handleSubmitComment = async () => {
    if (!id || !commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      await createComment(id, {
        content: commentInput.trim(),
        userId: currentUser?.id || '1',
        userName: currentUser?.name || '匿名用户',
        userAvatar: currentUser?.avatar || '🐾',
      });
      setCommentInput('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const storyComments = id ? comments[id] || [] : [];

  if (loading || !story) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-64 bg-cream-200 rounded-3xl animate-pulse-soft" />
        <div className="space-y-4">
          <div className="h-10 bg-cream-200 rounded-2xl w-3/4 animate-pulse-soft" />
          <div className="h-6 bg-cream-200 rounded-xl w-1/2 animate-pulse-soft" />
          <div className="h-5 bg-cream-200 rounded-xl w-full animate-pulse-soft" />
          <div className="h-5 bg-cream-200 rounded-xl w-full animate-pulse-soft" />
          <div className="h-5 bg-cream-200 rounded-xl w-5/6 animate-pulse-soft" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors font-medium"
      >
        <ChevronLeft className="w-5 h-5" />
        返回
      </button>

      <article className="bg-white rounded-3xl shadow-card overflow-hidden">
        {story.images && story.images.length > 0 ? (
          <img
            src={story.images[0]}
            alt={story.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-cream-200 flex items-center justify-center">
            <span className="text-6xl">📖</span>
          </div>
        )}

        <div className="p-6 md:p-8">
          <h1 className="font-display text-3xl text-gray-800 mb-4 leading-tight">
            {story.title}
          </h1>

          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-cream-200">
            <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center text-lg">
              {story.authorAvatar}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{story.authorName}</p>
              <p className="text-sm text-gray-500">{formatDate(story.createdAt)}</p>
            </div>
            {story.isFeatured && (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full shadow-md flex items-center gap-1">
                <span>⭐</span>
                精选
              </span>
            )}
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-loose tracking-wide whitespace-pre-wrap text-base">
              {story.content}
            </p>
          </div>

          {story.images && story.images.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
              {story.images.slice(1).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${story.title}-${idx + 2}`}
                  className="w-full h-40 object-cover rounded-2xl hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-cream-200">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                liked
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              } ${likeAnimating ? 'scale-110' : ''}`}
            >
              <Heart
                className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
              />
              <span className="text-lg tabular-nums">{displayLikes}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 bg-cream-100 hover:bg-cream-200 text-gray-600 rounded-2xl font-medium transition-colors"
            >
              <Share2 className="w-5 h-5" />
              分享
            </button>
          </div>
        </div>
      </article>

      <section className="bg-white rounded-3xl shadow-card p-6 md:p-8">
        <h2 className="font-display text-2xl text-gray-800 mb-5 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary-500" />
          评论区
          {storyComments.length > 0 && (
            <span className="text-base font-normal text-gray-400">
              ({storyComments.length})
            </span>
          )}
        </h2>

        <div className="flex gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
            {currentUser?.avatar || '🐾'}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
              placeholder="写下你的温暖留言..."
              className="flex-1 px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentInput.trim() || submittingComment}
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-2xl font-medium transition-colors shadow-soft flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {submittingComment ? '发送中' : '发送'}
            </button>
          </div>
        </div>

        {storyComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400">暂无评论，来留下第一条吧~</p>
          </div>
        ) : (
          <div className="space-y-5">
            {storyComments.map((comment) => (
              <div key={comment.id} className="flex gap-3 animate-slide-up">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  {comment.userAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-gray-800">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
