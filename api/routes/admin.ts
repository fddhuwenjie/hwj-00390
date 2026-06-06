import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'
import type { Species, AdminStats } from '../../shared/types.js'

const router = Router()

router.get('/stats', (_req: Request, res: Response): void => {
  const allSpecies: Species[] = ['cat', 'dog', 'rabbit', 'bird', 'other']
  const speciesDistribution = allSpecies.map((species) => ({
    species,
    count: store.pets.filter((p) => p.species === species).length,
  }))

  const adoptedPets = store.pets.filter((p) => p.isAdopted)
  const totalPets = store.pets.length

  const now = new Date()
  const monthlyTrend: { month: string; newPets: number; adoptedPets: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`

    const newPets = store.pets.filter(
      (p) => p.createdAt >= `${month}-01T00:00:00Z` && p.createdAt < `${nextMonthStr}-01T00:00:00Z`,
    ).length
    const adoptedInMonth = adoptedPets.filter(
      (p) =>
        p.adoptedAt &&
        p.adoptedAt >= `${month}-01T00:00:00Z` &&
        p.adoptedAt < `${nextMonthStr}-01T00:00:00Z`,
    ).length

    monthlyTrend.push({ month, newPets, adoptedPets: adoptedInMonth })
  }

  const breedCounts = store.pets.reduce((acc, pet) => {
    acc[pet.breed] = (acc[pet.breed] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topBreeds = Object.entries(breedCounts)
    .map(([breed, count]) => ({ breed, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  let avgWaitDays = 0
  if (adoptedPets.length > 0) {
    const totalWait = adoptedPets.reduce((sum, pet) => {
      if (pet.adoptedAt) {
        const created = new Date(pet.createdAt).getTime()
        const adopted = new Date(pet.adoptedAt).getTime()
        return sum + Math.floor((adopted - created) / (1000 * 60 * 60 * 24))
      }
      return sum
    }, 0)
    avgWaitDays = Math.round(totalWait / adoptedPets.length * 10) / 10
  }

  const approved = store.applications.filter((a) => a.status === 'approved').length
  const rejected = store.applications.filter((a) => a.status === 'rejected').length
  const totalReviewed = approved + rejected
  const adoptionSuccessRate = totalReviewed > 0 ? Math.round((approved / totalReviewed) * 1000) / 10 : 0

  const pendingApplications = store.applications.filter((a) => a.status === 'pending').length

  const stats: AdminStats = {
    speciesDistribution,
    monthlyTrend,
    topBreeds,
    avgWaitDays,
    adoptionSuccessRate,
    totalPets,
    adoptedPets: adoptedPets.length,
    pendingApplications,
  }

  res.json({ success: true, data: stats })
})

export default router
