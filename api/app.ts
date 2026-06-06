import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import petsRoutes from './routes/pets.js'
import applicationsRoutes from './routes/applications.js'
import favoritesRoutes from './routes/favorites.js'
import followsRoutes from './routes/follows.js'
import historyRoutes from './routes/history.js'
import storiesRoutes from './routes/stories.js'
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/user.js'
import { store } from './store.js'
import { seed } from './data/seed.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

seed()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/pets', petsRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/follows', followsRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/stories', storiesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/user', userRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
