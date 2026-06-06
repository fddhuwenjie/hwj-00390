import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'
import type { Species, Gender, PersonalityTag, SortOrder, Pet } from '../../shared/types.js'

const router = Router()

router.get('/species', (_req: Request, res: Response): void => {
  const distribution = store.pets.reduce((acc, pet) => {
    acc[pet.species] = (acc[pet.species] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const result = Object.entries(distribution).map(([species, count]) => ({
    species: species as Species,
    count,
  }))

  res.json({ success: true, data: result })
})

router.get('/:id', (req: Request, res: Response): void => {
  const { id } = req.params
  const pet = store.incrementPetView(id)
  if (!pet) {
    res.status(404).json({ success: false, error: '宠物不存在' })
    return
  }
  res.json({ success: true, data: pet })
})

router.get('/', (req: Request, res: Response): void => {
  const { species, breed, ageMin, ageMax, gender, neutered, tag, keyword, sort } = req.query

  let result: Pet[] = [...store.pets]

  if (species) {
    result = result.filter((p) => p.species === species)
  }
  if (breed) {
    result = result.filter((p) => p.breed.includes(String(breed)))
  }
  if (ageMin !== undefined) {
    result = result.filter((p) => p.age >= Number(ageMin))
  }
  if (ageMax !== undefined) {
    result = result.filter((p) => p.age <= Number(ageMax))
  }
  if (gender) {
    result = result.filter((p) => p.gender === gender)
  }
  if (neutered !== undefined) {
    const neuteredBool = neutered === 'true'
    result = result.filter((p) => p.neutered === neuteredBool)
  }
  if (tag) {
    result = result.filter((p) => p.personalityTags.includes(tag as PersonalityTag))
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.healthDescription.toLowerCase().includes(kw),
    )
  }

  if (sort === 'newest') {
    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } else if (sort === 'popular') {
    result.sort((a, b) => b.viewCount + b.favoriteCount - (a.viewCount + a.favoriteCount))
  }

  res.json({ success: true, data: result })
})

router.post('/', (req: Request, res: Response): void => {
  try {
    const data = req.body
    const requiredFields: (keyof Pet)[] = [
      'name', 'species', 'breed', 'age', 'gender', 'weight',
      'neutered', 'healthDescription', 'personalityTags', 'photoUrls',
      'publisherId', 'publisherName',
    ]
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${String(field)}` })
        return
      }
    }
    const pet = store.addPet(data)
    res.status(201).json({ success: true, data: pet })
  } catch (err) {
    res.status(400).json({ success: false, error: '创建失败' })
  }
})

router.put('/:id', (req: Request, res: Response): void => {
  const { id } = req.params
  const pet = store.updatePet(id, req.body)
  if (!pet) {
    res.status(404).json({ success: false, error: '宠物不存在' })
    return
  }
  res.json({ success: true, data: pet })
})

export default router
