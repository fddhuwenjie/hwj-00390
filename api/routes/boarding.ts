import { Router, type Request, type Response } from 'express';
import { store } from '../store.js';
import type {
  BoardingCaregiver,
  BoardingRequest,
  BoardingOrder,
  BoardingOrderStatus,
  BoardingDiary,
  BoardingReview,
  BoardingMethod,
  DiaryAlertType,
  CaregiverStatus,
} from '../../shared/types.js';

const router = Router();

router.get('/caregivers/mine', (req: Request, res: Response): void => {
  const { userId } = req.query;
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少 userId' });
    return;
  }
  const caregiver = store.getCaregiverByUser(String(userId));
  res.json({ success: true, data: caregiver || null });
});

router.get('/caregivers/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const caregiver = store.getCaregiverById(id);
  if (!caregiver) {
    res.status(404).json({ success: false, error: '寄养人不存在' });
    return;
  }
  res.json({ success: true, data: caregiver });
});

router.get('/caregivers', (req: Request, res: Response): void => {
  const { status } = req.query;
  const caregivers = store.getAllCaregivers(status as CaregiverStatus | undefined);
  res.json({ success: true, data: caregivers });
});

router.post('/caregivers', (req: Request, res: Response): void => {
  try {
    const data = req.body;
    const requiredFields = [
      'userId', 'userName', 'userAvatar',
      'livingArea', 'hasYard', 'petExperienceYears',
      'acceptedSpecies', 'maxPetsAtOnce',
      'pricePerDay', 'serviceRadiusKm', 'availableDates',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const caregiver = store.registerCaregiver(data);
    res.status(201).json({ success: true, data: caregiver });
  } catch (err) {
    res.status(400).json({ success: false, error: '注册失败' });
  }
});

router.put('/caregivers/:id/availability', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { availableDates } = req.body;
  const caregiver = store.updateCaregiverAvailability(id, availableDates);
  if (!caregiver) {
    res.status(404).json({ success: false, error: '寄养人不存在' });
    return;
  }
  res.json({ success: true, data: caregiver });
});

router.post('/caregivers/:id/review', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { approved, reviewNote } = req.body;
  if (approved === undefined) {
    res.status(400).json({ success: false, error: '缺少 approved 字段' });
    return;
  }
  const caregiver = store.reviewCaregiver(id, approved, reviewNote);
  if (!caregiver) {
    res.status(404).json({ success: false, error: '寄养人不存在' });
    return;
  }
  res.json({ success: true, data: caregiver });
});

router.get('/caregivers/:id/stats', (req: Request, res: Response): void => {
  const { id } = req.params;
  const caregiver = store.getCaregiverById(id);
  if (!caregiver) {
    res.status(404).json({ success: false, error: '寄养人不存在' });
    return;
  }
  const stats = store.getCaregiverIncomeStats(caregiver.userId);
  res.json({ success: true, data: stats });
});

router.get('/requests/mine', (req: Request, res: Response): void => {
  const { ownerId } = req.query;
  if (!ownerId) {
    res.status(400).json({ success: false, error: '缺少 ownerId' });
    return;
  }
  const requests = store.getBoardingRequestsByOwner(String(ownerId));
  res.json({ success: true, data: requests });
});

router.get('/requests/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const request = store.getBoardingRequestById(id);
  if (!request) {
    res.status(404).json({ success: false, error: '寄养需求不存在' });
    return;
  }
  res.json({ success: true, data: request });
});

router.get('/requests', (req: Request, res: Response): void => {
  const { status } = req.query;
  const requests = store.getAllBoardingRequests(status as BoardingRequest['status'] | undefined);
  res.json({ success: true, data: requests });
});

router.post('/requests', (req: Request, res: Response): void => {
  try {
    const data = req.body;
    const requiredFields = [
      'ownerId', 'ownerName', 'ownerAvatar',
      'petId', 'petName', 'petSpecies', 'petPhoto',
      'startDate', 'endDate',
      'specialCare', 'acceptedMethods',
      'budgetMin', 'budgetMax', 'emergencyContact',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const request = store.createBoardingRequest(data);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, error: '发布失败' });
  }
});

router.get('/requests/:id/match', (req: Request, res: Response): void => {
  const { id } = req.params;
  const matches = store.findMatchingCaregivers(id);
  res.json({ success: true, data: matches });
});

router.get('/pets/adopted', (req: Request, res: Response): void => {
  const { userId } = req.query;
  if (!userId) {
    res.status(400).json({ success: false, error: '缺少 userId' });
    return;
  }
  const pets = store.getAdoptedPetsByUser(String(userId));
  res.json({ success: true, data: pets });
});

router.get('/orders/mine', (req: Request, res: Response): void => {
  const { ownerId, caregiverId } = req.query;
  let orders: BoardingOrder[] = [];
  if (ownerId) {
    orders = store.getBoardingOrdersByOwner(String(ownerId));
  } else if (caregiverId) {
    orders = store.getBoardingOrdersByCaregiver(String(caregiverId));
  }
  res.json({ success: true, data: orders });
});

router.get('/orders/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const order = store.getBoardingOrderById(id);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  res.json({ success: true, data: order });
});

router.get('/orders', (req: Request, res: Response): void => {
  const { status } = req.query;
  const orders = store.getAllBoardingOrders(status as BoardingOrderStatus | undefined);
  res.json({ success: true, data: orders });
});

router.post('/orders', (req: Request, res: Response): void => {
  try {
    const data = req.body;
    const requiredFields = [
      'requestId', 'ownerId', 'ownerName',
      'caregiverId', 'caregiverName', 'caregiverAvatar',
      'petId', 'petName', 'petPhoto',
      'startDate', 'endDate', 'boardingMethod',
      'pricePerDay', 'handoverNotes',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const order = store.createBoardingOrder(data);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: '创建订单失败' });
  }
});

router.put('/orders/:id/status', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status, disputeReason } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: '缺少 status 字段' });
    return;
  }
  const order = store.updateBoardingOrderStatus(id, status as BoardingOrderStatus, disputeReason);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  res.json({ success: true, data: order });
});

router.post('/orders/:id/dispute', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) {
    res.status(400).json({ success: false, error: '缺少 reason 字段' });
    return;
  }
  const order = store.markOrderDisputed(id, reason);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  res.json({ success: true, data: order });
});

router.get('/orders/:id/diaries', (req: Request, res: Response): void => {
  const { id } = req.params;
  const diaries = store.getDiariesByOrder(id);
  res.json({ success: true, data: diaries });
});

router.post('/orders/:id/diaries', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const data = req.body;
    const requiredFields = [
      'caregiverId', 'date', 'description',
      'dietStatus', 'activityStatus', 'alertType',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const diary = store.addBoardingDiary({
      ...data,
      orderId: id,
      photoUrls: data.photoUrls || [],
      alertType: data.alertType as DiaryAlertType,
    });
    res.status(201).json({ success: true, data: diary });
  } catch (err) {
    res.status(400).json({ success: false, error: '提交日记失败' });
  }
});

router.get('/orders/:id/reviews', (req: Request, res: Response): void => {
  const { id } = req.params;
  const reviews = store.getReviewsByOrder(id);
  res.json({ success: true, data: reviews });
});

router.post('/orders/:id/reviews', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const data = req.body;
    const requiredFields = [
      'reviewerId', 'reviewerName', 'reviewerAvatar',
      'targetUserId', 'rating', 'content',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const review = store.addBoardingReview({
      ...data,
      orderId: id,
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, error: '提交评价失败' });
  }
});

router.get('/users/:userId/reviews', (req: Request, res: Response): void => {
  const { userId } = req.params;
  const reviews = store.getReviewsByUser(userId);
  res.json({ success: true, data: reviews });
});

router.get('/stats', (_req: Request, res: Response): void => {
  const stats = store.getBoardingStats();
  res.json({ success: true, data: stats });
});

export default router;
