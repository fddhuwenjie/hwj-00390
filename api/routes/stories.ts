import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'
import type { Story, Comment } from '../../shared/types.js'

const router = Router()

router.get('/featured', (_req: Request, res: Response): void => {
  const featured = store.stories
    .filter((s) => s.isFeatured)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
  res.json({ success: true, data: featured })
})

router.get('/:id/comments', (req: Request, res: Response): void => {
  const { id } = req.params
  const comments = store.getCommentsByStory(id)
  res.json({ success: true, data: comments })
})

router.post('/:id/comments', (req: Request, res: Response): void => {
  const { id } = req.params
  const { userId, userName, userAvatar, content } = req.body
  if (!userId || !userName || !userAvatar || !content) {
    res.status(400).json({ success: false, error: '缺少必要字段' })
    return
  }
  const story = store.stories.find((s) => s.id === id)
  if (!story) {
    res.status(404).json({ success: false, error: '故事不存在' })
    return
  }
  const comment = store.addComment({
    storyId: id,
    userId: String(userId),
    userName: String(userName),
    userAvatar: String(userAvatar),
    content: String(content),
  })
  res.status(201).json({ success: true, data: comment })
})

router.post('/:id/like', (req: Request, res: Response): void => {
  const { id } = req.params
  const story = store.likeStory(id)
  if (!story) {
    res.status(404).json({ success: false, error: '故事不存在' })
    return
  }
  res.json({ success: true, data: story })
})

router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params
  const story = store.stories.find((s) => s.id === id)
  if (!story) {
    res.status(404).json({ success: false, error: '故事不存在' })
    return
  }
  res.json({ success: true, data: story })
})

router.get('/', (_req: Request, res: Response): void => {
  const stories = [...store.stories].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json({ success: true, data: stories })
})

router.post('/', (req: Request, res: Response): void => {
  try {
    const data = req.body
    const requiredFields: (keyof Story)[] = [
      'title', 'content', 'images', 'authorId', 'authorName', 'authorAvatar',
    ]
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${String(field)}` })
        return
      }
    }
    if (data.isFeatured === undefined) {
      data.isFeatured = false
    }
    const story = store.addStory(data)
    res.status(201).json({ success: true, data: story })
  } catch (err) {
    res.status(400).json({ success: false, error: '创建故事失败' })
  }
})

export default router
