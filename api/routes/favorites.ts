import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { userId } = req.query
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少 userId 参数' })
    return
  }
  const favorites = store.getFavoritesByUser(String(userId))
  res.json({ success: true, data: favorites })
})

router.post('/', (req: Request, res: Response): void => {
  const { userId, petId } = req.body
  if (!userId || !petId) {
    res.status(400).json({ success: false, error: '缺少 userId 或 petId' })
    return
  }
  const favorite = store.addFavorite(String(userId), String(petId))
  if (!favorite) {
    res.status(400).json({ success: false, error: '已收藏该宠物' })
    return
  }
  res.status(201).json({ success: true, data: favorite })
})

router.delete('/:petId', (req: Request, res: Response): void => {
  const { petId } = req.params
  const { userId } = req.query
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少 userId 参数' })
    return
  }
  const removed = store.removeFavorite(String(userId), petId)
  if (!removed) {
    res.status(404).json({ success: false, error: '收藏不存在' })
    return
  }
  res.json({ success: true, data: null })
})

export default router
