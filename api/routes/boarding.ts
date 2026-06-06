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
  InsurancePolicy,
  InsuranceClaim,
  InsurancePlanType,
  InsuranceClaimStatus,
  TrainingCourse,
  CaregiverCourseProgress,
  CaregiverCertLevel,
  TrainingCourseStatus,
  PetLocationRecord,
  GeoFence,
  GeoFenceAlert,
  GeoFenceAlertStatus,
  BoardingAgreement,
  AgreementStatus,
  BoardingDashboardStats,
  BoardingCaregiverExtended,
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

router.get('/insurance/policy/:orderId', (req: Request, res: Response): void => {
  const { orderId } = req.params;
  const policy = store.getInsurancePolicyByOrder(orderId);
  res.json({ success: true, data: policy || null });
});

router.post('/insurance/policy', (req: Request, res: Response): void => {
  try {
    const data = req.body;
    const requiredFields = ['orderId', 'planType'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const policy = store.createInsurancePolicy(data.orderId, data.planType as InsurancePlanType);
    res.status(201).json({ success: true, data: policy });
  } catch (err) {
    res.status(400).json({ success: false, error: '创建保单失败' });
  }
});

router.get('/insurance/claims/:orderId', (req: Request, res: Response): void => {
  const { orderId } = req.params;
  const claims = store.getInsuranceClaimsByOrder(orderId);
  res.json({ success: true, data: claims });
});

router.get('/insurance/claims', (req: Request, res: Response): void => {
  const { status } = req.query;
  const claims = store.getAllInsuranceClaims(status as InsuranceClaimStatus | undefined);
  res.json({ success: true, data: claims });
});

router.post('/insurance/claims', (req: Request, res: Response): void => {
  try {
    const data = req.body;
    const requiredFields = [
      'policyId', 'orderId', 'applicantId', 'applicantName',
      'description', 'claimAmount', 'voucherPhotos', 'expenseDetails',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const claim = store.createInsuranceClaim({
      policyId: data.policyId,
      orderId: data.orderId,
      applicantId: data.applicantId,
      applicantName: data.applicantName,
      description: data.description,
      claimAmount: data.claimAmount,
      voucherPhotos: data.voucherPhotos || [],
      expenseDetails: data.expenseDetails,
    });
    res.status(201).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false, error: '创建理赔申请失败' });
  }
});

router.post('/insurance/claims/:id/review', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { approved, reviewNote } = req.body;
  if (approved === undefined) {
    res.status(400).json({ success: false, error: '缺少 approved 字段' });
    return;
  }
  const claim = store.reviewInsuranceClaim(id, Boolean(approved), reviewNote);
  if (!claim) {
    res.status(404).json({ success: false, error: '理赔申请不存在' });
    return;
  }
  res.json({ success: true, data: claim });
});

router.post('/insurance/claims/:id/pay', (req: Request, res: Response): void => {
  const { id } = req.params;
  const claim = store.markClaimPaid(id);
  if (!claim) {
    res.status(404).json({ success: false, error: '理赔申请不存在' });
    return;
  }
  res.json({ success: true, data: claim });
});

router.get('/training/courses', (_req: Request, res: Response): void => {
  const courses = store.getAllTrainingCourses();
  res.json({ success: true, data: courses });
});

router.get('/training/courses/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const course = store.getTrainingCourse(id);
  if (!course) {
    res.status(404).json({ success: false, error: '课程不存在' });
    return;
  }
  res.json({ success: true, data: course });
});

router.get('/training/progress/:caregiverId', (req: Request, res: Response): void => {
  const { caregiverId } = req.params;
  const progress = store.getCaregiverCourseProgress(caregiverId);
  res.json({ success: true, data: progress });
});

router.post('/training/complete', (req: Request, res: Response): void => {
  try {
    const data = req.body;
    const requiredFields = ['caregiverId', 'courseId', 'score'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const progress = store.completeTrainingCourse(data.caregiverId, data.courseId, data.score);
    res.status(201).json({ success: true, data: progress });
  } catch (err) {
    res.status(400).json({ success: false, error: '提交失败' });
  }
});

router.get('/caregivers/:id/extended', (req: Request, res: Response): void => {
  const { id } = req.params;
  const caregiver = store.getCaregiverExtended(id);
  if (!caregiver) {
    res.status(404).json({ success: false, error: '寄养人不存在' });
    return;
  }
  res.json({ success: true, data: caregiver });
});

router.get('/caregivers-extended', (req: Request, res: Response): void => {
  const { status } = req.query;
  const caregivers = store.getAllCaregiversExtended(status as CaregiverStatus | undefined);
  res.json({ success: true, data: caregivers });
});

router.get('/caregivers/:id/cert-level', (req: Request, res: Response): void => {
  const { id } = req.params;
  const caregiver = store.getCaregiverById(id);
  if (!caregiver) {
    res.status(404).json({ success: false, error: '寄养人不存在' });
    return;
  }
  const certLevel = store.calculateCaregiverCertLevel(id);
  res.json({ success: true, data: certLevel });
});

router.get('/orders/:id/locations', (req: Request, res: Response): void => {
  const { id } = req.params;
  const order = store.getBoardingOrderById(id);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  const locations = store.getLocationsByOrder(id);
  res.json({ success: true, data: locations });
});

router.get('/orders/:id/locations/:date', (req: Request, res: Response): void => {
  const { id, date } = req.params;
  const order = store.getBoardingOrderById(id);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  const locations = store.getLocationsByOrderAndDate(id, date);
  res.json({ success: true, data: locations });
});

router.post('/orders/:id/locations', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const data = req.body;
    const requiredFields = [
      'caregiverId', 'date', 'time',
      'latitude', 'longitude', 'addressText',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const record = store.addPetLocation({
      ...data,
      orderId: id,
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, error: '上报位置失败' });
  }
});

router.get('/orders/:id/geo-fence', (req: Request, res: Response): void => {
  const { id } = req.params;
  const order = store.getBoardingOrderById(id);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  const fence = store.getGeoFenceByOrder(id);
  res.json({ success: true, data: fence || null });
});

router.post('/orders/:id/geo-fence', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const data = req.body;
    const requiredFields = [
      'centerLatitude', 'centerLongitude', 'radiusMeters', 'addressText',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        res.status(400).json({ success: false, error: `缺少字段: ${field}` });
        return;
      }
    }
    const fence = store.createGeoFence({
      ...data,
      orderId: id,
    });
    res.status(201).json({ success: true, data: fence });
  } catch (err) {
    res.status(400).json({ success: false, error: '创建电子围栏失败' });
  }
});

router.get('/orders/:id/alerts', (req: Request, res: Response): void => {
  const { id } = req.params;
  const order = store.getBoardingOrderById(id);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  const alerts = store.getAlertsByOrder(id);
  res.json({ success: true, data: alerts });
});

router.get('/orders/:id/agreement', (req: Request, res: Response): void => {
  const { id } = req.params;
  const order = store.getBoardingOrderById(id);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  const agreement = store.getAgreementByOrder(id);
  res.json({ success: true, data: agreement || null });
});

router.post('/orders/:id/agreement', (req: Request, res: Response): void => {
  const { id } = req.params;
  const agreement = store.createBoardingAgreement(id);
  if (!agreement) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  res.status(201).json({ success: true, data: agreement });
});

router.post('/agreements/:id/sign', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { signerRole } = req.body;
  if (!signerRole || (signerRole !== 'owner' && signerRole !== 'caregiver')) {
    res.status(400).json({ success: false, error: '缺少或无效的 signerRole 字段' });
    return;
  }
  const agreement = store.signAgreement(id, signerRole as 'owner' | 'caregiver');
  if (!agreement) {
    res.status(404).json({ success: false, error: '协议不存在' });
    return;
  }
  res.json({ success: true, data: agreement });
});

router.post('/agreements/:id/reject', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { reason, rejectorRole } = req.body;
  if (!reason) {
    res.status(400).json({ success: false, error: '缺少 reason 字段' });
    return;
  }
  if (!rejectorRole || (rejectorRole !== 'owner' && rejectorRole !== 'caregiver')) {
    res.status(400).json({ success: false, error: '缺少或无效的 rejectorRole 字段' });
    return;
  }
  const agreement = store.rejectAgreement(id, reason, rejectorRole as 'owner' | 'caregiver');
  if (!agreement) {
    res.status(404).json({ success: false, error: '协议不存在' });
    return;
  }
  res.json({ success: true, data: agreement });
});

router.post('/orders/:id/cancel-with-deduction', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { cancelDate } = req.body;
  if (!cancelDate) {
    res.status(400).json({ success: false, error: '缺少 cancelDate 字段' });
    return;
  }
  const order = store.cancelOrderWithDeduction(id, cancelDate);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  res.json({ success: true, data: order });
});

router.get('/orders/:id/cancel-deduction', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { cancelDate } = req.query;
  if (!cancelDate) {
    res.status(400).json({ success: false, error: '缺少 cancelDate 查询参数' });
    return;
  }
  const order = store.getBoardingOrderById(id);
  if (!order) {
    res.status(404).json({ success: false, error: '订单不存在' });
    return;
  }
  const percentage = store.calculateCancelDeduction(order, String(cancelDate));
  res.json({ success: true, data: percentage });
});

router.get('/dashboard/stats', (_req: Request, res: Response): void => {
  const stats = store.getBoardingDashboardStats();
  res.json({ success: true, data: stats });
});

router.get('/stats', (_req: Request, res: Response): void => {
  const stats = store.getBoardingStats();
  res.json({ success: true, data: stats });
});

export default router;
