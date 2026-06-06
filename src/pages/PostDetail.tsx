import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, MessageCircle, Send, Clock, Hash, UserPlus, UserCheck, AlertTriangle
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentUser, communityPosts, postComments, loading, fetchCommunityPostById, fetchPostComments, likePost, addComment, toggleFollowUser, isFollowingUser, checkFollowingStatus
  } = useAppStore();
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (id) {
      fetchCommunityPostById(id);
      fetchPostComments(id);
    }
  }, [id, fetchCommunityPostById, fetchPostComments]);

  const post = communityPosts.find(p => p.id === id);
  const comments = id ? (postComments[id] ?? []) : [];

  useEffect(() => {
    if (post && currentUser) checkFollowingStatus(post.authorId);
  }, [post, currentUser, checkFollowingStatus]);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (!post && !loading) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
        <div className="text-gray-500 mb-4">未找到该动态</div>
        <button onClick={() => navigate('/community')} className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition">
          返回社区
        </button>
      </div>
    );
  }

  if (!post) return null;

  const liked = currentUser ? post.likedBy.includes(currentUser.id) : false;
  const isFollowing = isFollowingUser(post.authorId);

  const handleLike = async () => {
    if (!currentUser || !id) return;
    await likePost(id, currentUser.id);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !id || !commentText.trim()) return;
    await addComment(id, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content: commentText.trim(),
    });
    setCommentText('');
  };

  const handleToggleFollow = async () => {
    if (!currentUser) return;
    await toggleFollowUser(post.authorId, currentUser.id);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/community')}
        className="flex items-center gap-1 text-gray-600 hover:text-primary-600 mb-4 text-sm font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        返回广场
      </button>

      <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl overflow-hidden">
              {post.authorAvatar ? (
                <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
              ) : (
                <span>{post.authorName.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-800">{post.authorName}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {formatDate(post.createdAt)}
              </div>
            </div>
          </div>
          {currentUser && currentUser.id !== post.authorId && (
            <button
              onClick={handleToggleFollow}
              className={cn(
                'flex items-center gap-1 text-xs px-4 py-2 rounded-full font-medium transition',
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

        <h1 className="font-display text-2xl text-gray-800 mb-4">{post.title}</h1>
        <div className="text-gray-700 whitespace-pre-wrap mb-5 leading-relaxed">{post.content}</div>

        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {post.images.map((img, i) => (
              <img key={i} src={img} alt="" className="rounded-2xl w-full object-cover max-h-80" />
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-6">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-cream-100 text-gray-600 flex items-center gap-0.5">
              <Hash className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            disabled={!currentUser}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium',
              liked ? 'text-rose-500 bg-rose-50' : 'text-gray-600 hover:bg-gray-50',
              !currentUser && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Heart className={cn('w-5 h-5', liked && 'fill-current')} />
            {post.likeCount}
          </button>
          <span className="flex items-center gap-2 text-gray-600 px-4 py-2">
            <MessageCircle className="w-5 h-5" />
            {post.commentCount}
          </span>
        </div>
      </div>

      {currentUser && (
        <form onSubmit={handleAddComment} className="bg-white rounded-3xl shadow-card p-5 mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="写下你的评论..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                发送
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8">
        <h3 className="font-display text-xl text-gray-800 mb-5 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-400" />
          评论（{comments.length}）
        </h3>
        {comments.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-gray-500 text-sm">还没有评论，快来抢沙发！</p>
          </div>
        ) : (
          <div className="space-y-5">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {comment.authorAvatar ? (
                    <img src={comment.authorAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{comment.authorName.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800 text-sm">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
