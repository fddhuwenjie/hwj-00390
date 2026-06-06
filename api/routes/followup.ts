import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'

const router = Router()

router.get('/my', (req: Request, res: Response): void => {
  const { userId } = req.query
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少 userId' })
    return
  }
  const tasks = store.getFollowUpTasksByAdopter(String(userId))
  res.json({ success: true, data: tasks })
})

router.get('/all', (_req: Request, res: Response): void => {
  const tasks = store.getAllFollowUpTasks()
  res.json({ success: true, data: tasks })
})

router.get('/report/:taskId', (req: Request, res: Response): void => {
  const { taskId } = req.params
  const report = store.getFollowUpReport(taskId)
  res.json({ success: true, data: report || null })
})

router.post('/submit/:taskId', (req: Request, res: Response): void => {
  const { taskId } = req.params
  const { description, photoUrls, healthStatus, adopterId } = req.body
  if (!description || !healthStatus || !adopterId) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const report = store.submitFollowUpReport(taskId, {
    description,
    photoUrls: photoUrls || [],
    healthStatus,
    adopterId,
  })
  if (!report) {
    res.status(404).json({ success: false, error: '回访任务不存在' })
    return
  }
  res.json({ success: true, data: report })
})

export default router
