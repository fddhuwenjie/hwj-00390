import { Router, type Request, type Response } from 'express'
import { store } from '../store.js'
import type { UserRole, User } from '../../shared/types.js'

const router = Router()

router.get('/', (_req: Request, res: Response): void => {
  const admin = store.users.find((u) => u.role === 'admin')
  res.json({ success: true, data: admin })
})

router.post('/login', (req: Request, res: Response): void => {
  const { role } = req.body
  if (!role) {
    res.status(400).json({ success: false, error: '缺少 role 参数' })
    return
  }
  const validRoles: UserRole[] = ['user', 'publisher', 'admin']
  if (!validRoles.includes(role as UserRole)) {
    res.status(400).json({ success: false, error: '无效的角色' })
    return
  }
  const user = store.users.find((u) => u.role === role)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  res.json({ success: true, data: user })
})

export default router
