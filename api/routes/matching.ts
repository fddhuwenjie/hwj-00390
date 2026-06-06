import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'

const router = Router()

router.get('/recommendations', (req: Request, res: Response): void => {
  const { userId, limit } = req.query
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少 userId' })
    return
  }
  const limitNum = limit ? Number(limit) : 6
  const result = store.getMatchedPets(String(userId), limitNum)
  res.json({ success: true, data: result })
})

router.get('/preference/:userId', (req: Request, res: Response): void => {
  const { userId } = req.params
  const pref = store.getUserPreference(userId)
  res.json({ success: true, data: pref || null })
})

router.post('/preference', (req: Request, res: Response): void => {
  const { userId, livingEnvironment, hasPetExperience, dailyCompanionTime, familyMembers } = req.body
  if (!userId || livingEnvironment === undefined || hasPetExperience === undefined || !dailyCompanionTime) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const pref = store.setUserPreference(userId, {
    livingEnvironment,
    hasPetExperience: Boolean(hasPetExperience),
    dailyCompanionTime,
    familyMembers: familyMembers || '',
  })
  res.json({ success: true, data: pref })
})

export default router
