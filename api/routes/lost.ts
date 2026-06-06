import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'
import type { Species, LostPetStatus } from '../../shared/types.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { status } = req.query
  const pets = store.getLostPets(status as LostPetStatus | undefined)
  res.json({ success: true, data: pets })
})

router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params
  const pet = store.lostPets.getById(id)
  if (!pet) {
    res.status(404).json({ success: false, error: '不存在' })
    return
  }
  res.json({ success: true, data: pet })
})

router.post('/', (req: Request, res: Response): void => {
  const {
    petName, species, breed, photoUrls, features,
    location, lostTime, contact, reporterId, reporterName,
  } = req.body
  if (!petName || !species || !features || !location || !lostTime || !contact || !reporterId || !reporterName) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const lost = store.registerLostPet({
    petName,
    species: species as Species,
    breed,
    photoUrls: photoUrls || [],
    features,
    location,
    lostTime,
    contact,
    reporterId,
    reporterName,
  })
  res.status(201).json({ success: true, data: lost })
})

router.put('/:id/found', (req: Request, res: Response): void => {
  const { id } = req.params
  const result = store.markLostPetFound(id)
  if (!result) {
    res.status(404).json({ success: false, error: '不存在' })
    return
  }
  res.json({ success: true, data: result })
})

router.get('/:id/sightings', (req: Request, res: Response): void => {
  const { id } = req.params
  const sightings = store.getSightingsByLostPet(id)
  res.json({ success: true, data: sightings })
})

router.post('/:id/sightings', (req: Request, res: Response): void => {
  const { id } = req.params
  const { reporterId, reporterName, time, location, description, photoUrls } = req.body
  if (!reporterId || !reporterName || !time || !location || !description) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const sighting = store.addLostPetSighting({
    lostPetId: id,
    reporterId,
    reporterName,
    time,
    location,
    description,
    photoUrls: photoUrls || [],
  })
  res.status(201).json({ success: true, data: sighting })
})

export default router
