import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'
import type { Application } from '../../shared/types.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { petId, applicantId, status } = req.query

  let result: Application[] = [...store.applications]

  if (petId) {
    result = result.filter((a) => a.petId === petId)
  }
  if (applicantId) {
    result = result.filter((a) => a.applicantId === applicantId)
  }
  if (status) {
    result = result.filter((a) => a.status === status)
  }

  res.json({ success: true, data: result })
})

router.post('/', (req: Request, res: Response): void => {
  try {
    const data = req.body
    const requiredFields: (keyof Application)[] = [
      'petId', 'petName', 'petPhoto', 'applicantId', 'applicantName',
      'contact', 'livingEnvironment', 'hasPetExperience',
      'dailyCompanionTime', 'familyMembers',
    ]
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${String(field)}` })
        return
      }
    }
    const application = store.addApplication(data)
    res.status(201).json({ success: true, data: application })
  } catch (err) {
    res.status(400).json({ success: false, error: '创建申请失败' })
  }
})

router.put('/:id', (req: Request, res: Response): void => {
  const { id } = req.params
  const { status } = req.body

  if (status !== 'approved' && status !== 'rejected') {
    res.status(400).json({ success: false, error: '无效的状态，必须是 approved 或 rejected' })
    return
  }

  const application = store.updateApplicationStatus(id, status)
  if (!application) {
    res.status(404).json({ success: false, error: '申请不存在' })
    return
  }
  res.json({ success: true, data: application })
})

export default router
