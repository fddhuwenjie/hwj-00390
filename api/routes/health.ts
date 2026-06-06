import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'

const router = Router()

router.get('/:petId', (req: Request, res: Response): void => {
  const { petId } = req.params
  const profile = {
    petId,
    vaccines: store.getVaccinesByPet(petId),
    dewormings: store.getDewormingsByPet(petId),
    checkups: store.getHealthCheckupsByPet(petId),
  }
  res.json({ success: true, data: profile })
})

router.post('/:petId/vaccine', (req: Request, res: Response): void => {
  const { petId } = req.params
  const { vaccineName, date, nextDate } = req.body
  if (!vaccineName || !date) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const record = store.addVaccineRecord({
    petId,
    vaccineName,
    date,
    nextDate,
  })
  res.status(201).json({ success: true, data: record })
})

router.post('/:petId/deworming', (req: Request, res: Response): void => {
  const { petId } = req.params
  const { dewormingType, date } = req.body
  if (!dewormingType || !date) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const record = store.addDewormingRecord({
    petId,
    dewormingType,
    date,
  })
  res.status(201).json({ success: true, data: record })
})

router.post('/:petId/checkup', (req: Request, res: Response): void => {
  const { petId } = req.params
  const { title, description, date, photoUrls } = req.body
  if (!title || !date) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const record = store.addHealthCheckup({
    petId,
    title,
    description: description || '',
    date,
    photoUrls: photoUrls || [],
  })
  res.status(201).json({ success: true, data: record })
})

export default router
