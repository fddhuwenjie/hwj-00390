import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'
import type { PostTag } from '../../shared/types.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { sort, userId, tag } = req.query
  const posts = store.getCommunityPosts(
    (sort === 'hot' ? 'hot' : 'newest'),
    userId ? String(userId) : undefined,
    tag as PostTag | undefined,
  )
  res.json({ success: true, data: posts })
})

router.post('/follow', (req: Request, res: Response): void => {
  const { followerId, followingId } = req.body
  if (!followerId || !followingId) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const result = store.followUser(followerId, followingId)
  if (!result) {
    res.status(400).json({ success: false, error: '关注失败或已关注' })
    return
  }
  res.json({ success: true, data: result })
})

router.delete('/follow', (req: Request, res: Response): void => {
  const { followerId, followingId } = req.query
  if (!followerId || !followingId) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const result = store.unfollowUser(String(followerId), String(followingId))
  res.json({ success: true, data: result })
})

router.get('/following', (req: Request, res: Response): void => {
  const { userId } = req.query
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少 userId' })
    return
  }
  const ids = store.getFollowingIds(String(userId))
  res.json({ success: true, data: ids })
})

router.get('/is-following', (req: Request, res: Response): void => {
  const { followerId, followingId } = req.query
  if (!followerId || !followingId) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const result = store.isFollowingUser(String(followerId), String(followingId))
  res.json({ success: true, data: result })
})

router.post('/', (req: Request, res: Response): void => {
  const { authorId, authorName, authorAvatar, title, content, images, tags } = req.body
  if (!authorId || !authorName || !authorAvatar || !title || !content) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const post = store.createCommunityPost({
    authorId,
    authorName,
    authorAvatar,
    title,
    content,
    images: images || [],
    tags: tags || [],
  })
  res.status(201).json({ success: true, data: post })
})

router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params
  const post = store.communityPosts.getById(id)
  if (!post) {
    res.status(404).json({ success: false, error: '不存在' })
    return
  }
  res.json({ success: true, data: post })
})

router.post('/:id/like', (req: Request, res: Response): void => {
  const { id } = req.params
  const { userId } = req.body
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少 userId' })
    return
  }
  const post = store.likeCommunityPost(id, userId)
  if (!post) {
    res.status(404).json({ success: false, error: '不存在' })
    return
  }
  res.json({ success: true, data: post })
})

router.get('/:id/comments', (req: Request, res: Response): void => {
  const { id } = req.params
  const comments = store.getPostComments(id)
  res.json({ success: true, data: comments })
})

router.post('/:id/comments', (req: Request, res: Response): void => {
  const { id } = req.params
  const { authorId, authorName, authorAvatar, content } = req.body
  if (!authorId || !authorName || !authorAvatar || !content) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const comment = store.addPostComment({
    postId: id,
    authorId,
    authorName,
    authorAvatar,
    content,
  })
  res.status(201).json({ success: true, data: comment })
})

export default router
