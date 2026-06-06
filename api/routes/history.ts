import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { userId } = req.query
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少 userId 参数' })
    return
  }
  const history = store.getHistoryByUser(String(userId))
  res.json({ success: true, data: history })
})

router.post('/', (req: Request, res: Response): void => {
  const { userId, petId, petName, petPhoto } = req.body
  if (!userId || !petId || !petName || !petPhoto) {
    res.status(400).json({ success: false, error: '缺少必要字段' })
    return
  }
  const record = store.addHistory(String(userId), String(petId), String(petName), String(petPhoto))
  res.status(201).json({ success: true, data: record })
})

export default router
