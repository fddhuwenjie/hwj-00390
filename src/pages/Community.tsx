import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Plus, Clock, Flame, UserPlus, UserCheck, Hash, Send, X, Upload
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { PostTag } from '../../shared/types';
import { ALL_POST_TAGS } from '../../shared/types';

type SortMode = 'hot' | 'latest' | 'following';

export default function Community() {
  const navigate = useNavigate();
  const {
    currentUser, communityPosts, loading, fetchCommunityPosts, createCommunityPost, likePost, toggleFollowUser, isFollowingUser, checkFollowingStatus } = useAppStore();
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [filterTag, setFilterTag] = useState<PostTag | 'all'>('all');
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '', content: '', images: '', tags: [] as PostTag[] });

  useEffect(() => {
    fetchCommunityPosts(sortMode === 'following' ? 'following' : undefined);
  }, [fetchCommunityPosts, sortMode]);

  useEffect(() => {
    if (currentUser) {
      const authorIds = [...new Set(communityPosts.map(p => p.authorId))];
      authorIds.forEach(id => checkFollowingStatus(id));
    }
  }, [currentUser, communityPosts, checkFollowingStatus]);

  const filteredPosts = communityPosts.filter(p => {
    if (filterTag !== 'all' && !p.tags.includes(filterTag)) return false;
    return true;
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !postForm.title || !postForm.content) return;
    await createCommunityPost({
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      title: postForm.title,
      content: postForm.content,
      images: postForm.images ? postForm.images.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      tags: postForm.tags,
    });
    setPostForm({ title: '', content: '', images: '', tags: [] });
    setShowPostForm(false);
  };

  const toggleTag = (tag: PostTag) => {
    setPostForm(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
    }));
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${d.getMonth() + 1}-${d.getDate()}`;
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) navigate('/');
    else await likePost(postId, currentUser.id);
  };

  const handleToggleFollow = async (authorId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    await toggleFollowUser(authorId, currentUser.id);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-3xl text-primary-500 mb-1">🌟 社区广场</h1>
          <p className="text-gray-500 text-sm">与铲屎官们一起分享交流</p>
        </div>
        {currentUser && (
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-medium rounded-full shadow-soft hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            发布动态
          </button>
          )}</div>

      {showPostForm && currentUser && (
        <div className="bg-white rounded-3xl shadow-card p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-gray-800">📝 发布动态</h3>
          <button onClick={() => setShowPostForm(false)} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题 <span className="text-primary-500">*</span></label>
            <input
              required
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
              placeholder="分享点什么吧..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容 <span className="text-primary-500">*</span></label>
            <textarea
              rows={4}
              required
              value={postForm.content}
              onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none"
              placeholder="记录生活，记录生活，记录生活..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图片URL（用逗号分隔）</label>
            <div className="flex gap-2">
              <input
                value={postForm.images}
                onChange={(e) => setPostForm({ ...postForm, images: e.target.value })}
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                placeholder="https://..."
              />
              <button type="button" className="flex items-center gap-1.5 px-4 py-3 bg-cream-100 text-gray-700 rounded-2xl hover:bg-cream-200 transition">
                <Upload className="w-4 h-4" />
                上传
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <div className="flex flex-wrap gap-2">
              {ALL_POST_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1',
                    postForm.tags.includes(tag)
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
            </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-medium rounded-2xl shadow-soft hover:shadow-md transition flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            发布
          </button>
        </form>
      </div>
        )}

      <div className="bg-white rounded-2xl shadow-soft p-2 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-1 bg-cream-100 rounded-xl p-1 flex-wrap">
            {([
              { k: 'latest' as const, label: '最新', icon: <Clock className="w-4 h-4" /> },
              { k: 'hot' as const, label: '热度', icon: <Flame className="w-4 h-4" /> },
              { k: 'following' as const, label: '关注', icon: <UserPlus className="w-4 h-4" /> },
            ] as const).map(({ k, label, icon }) => (
              <button
                key={k}
                onClick={() => setSortMode(k)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition',
                  sortMode === k ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                )}
              >
                {icon}
                {label}
              </button>
              ))}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setFilterTag('all')}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition',
                filterTag === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              全部
            </button>
            {ALL_POST_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={cn(
                  'flex items-center gap-0.5 px-3 py-1.5 rounded-full text-xs font-medium transition',
                  filterTag === tag ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Hash className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse-soft">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-7xl mb-4">🌸</div>
          <h3 className="font-display text-2xl text-gray-700 mb-2">还没有动态</h3>
          <p className="text-gray-500">
            {sortMode === 'following' ? '还没有关注的用户，快去关注其他铲屎官吧' : '快来发布第一条动态吧'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const isFollowing = isFollowingUser(post.authorId);
            const liked = currentUser ? post.likedBy.includes(currentUser.id) : false;
            return (
              <Link key={post.id} to={`/community/${post.id}`} className="block bg-white rounded-2xl shadow-card p-5 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-lg overflow-hidden">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{post.authorName.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{post.authorName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  {currentUser && currentUser.id !== post.authorId && (
                    <button
                      onClick={(e) => handleToggleFollow(post.authorId, e)}
                      className={cn(
                        'flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium transition',
                        isFollowing
                          ? 'bg-primary-50 text-primary-600 border border-primary-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      )}
                    >
                      {isFollowing ? (
                        <><UserCheck className="w-3 h-3" />已关注</>
                      ) : (
                        <><UserPlus className="w-3 h-3" />关注</>
                      )}
                    </button>
                  )}
                </div>
                <h3 className="font-display text-lg text-gray-800 mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <div className="mb-3">
                    <img
                      src={post.images[0]}
                      alt=""
                      className="rounded-xl max-h-64 w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-wrap">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-cream-100 text-gray-600 flex items-center gap-0.5">
                        <Hash className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={(e) => handleLike(post.id, e)}
                      className={cn(
                        'flex items-center gap-1 transition',
                        liked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
                      )}
                    >
                      <Heart className={cn('w-4 h-4', liked ? 'fill-current' : '')} />
                      {post.likeCount}
                    </button>
                    <span className="flex items-center gap-1 text-gray-500">
                      <MessageCircle className="w-4 h-4" />
                      {post.commentCount}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
