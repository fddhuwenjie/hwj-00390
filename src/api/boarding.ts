import { apiGet, apiPost, apiPut } from './client';
import type {
  BoardingCaregiver,
  BoardingCaregiverWithScore,
  BoardingRequest,
  BoardingOrder,
  BoardingDiary,
  BoardingReview,
  BoardingStats,
  BoardingOrderStatus,
  CaregiverIncomeStats,
  Pet,
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
  BoardingAgreement,
  AgreementStatus,
  BoardingDashboardStats,
  BoardingCaregiverExtended,
} from '../../shared/types';

export const boardingApi = {
  getMyCaregiver: (userId: string) =>
    apiGet<BoardingCaregiver | null>('/boarding/caregivers/mine', { userId }),

  getCaregiver: (id: string) =>
    apiGet<BoardingCaregiver>(`/boarding/caregivers/${id}`),

  getAllCaregivers: (status?: CaregiverStatus) =>
    apiGet<BoardingCaregiver[]>('/boarding/caregivers', status ? { status } : undefined),

  registerCaregiver: (data: Partial<BoardingCaregiver>) =>
    apiPost<BoardingCaregiver>('/boarding/caregivers', data),

  updateCaregiverAvailability: (id: string, availableDates: string[]) =>
    apiPut<BoardingCaregiver>(`/boarding/caregivers/${id}/availability`, { availableDates }),

  reviewCaregiver: (id: string, approved: boolean, reviewNote?: string) =>
    apiPost<BoardingCaregiver>(`/boarding/caregivers/${id}/review`, { approved, reviewNote }),

  getCaregiverStats: (id: string) =>
    apiGet<CaregiverIncomeStats[]>(`/boarding/caregivers/${id}/stats`),

  getMyRequests: (ownerId: string) =>
    apiGet<BoardingRequest[]>('/boarding/requests/mine', { ownerId }),

  getRequest: (id: string) =>
    apiGet<BoardingRequest>(`/boarding/requests/${id}`),

  getAllRequests: (status?: BoardingRequest['status']) =>
    apiGet<BoardingRequest[]>('/boarding/requests', status ? { status } : undefined),

  createRequest: (data: Partial<BoardingRequest>) =>
    apiPost<BoardingRequest>('/boarding/requests', data),

  getMatchingCaregivers: (requestId: string) =>
    apiGet<BoardingCaregiverWithScore[]>(`/boarding/requests/${requestId}/match`),

  getAdoptedPets: (userId: string) =>
    apiGet<Pet[]>('/boarding/pets/adopted', { userId }),

  getMyOrders: (params: { ownerId?: string; caregiverId?: string }) =>
    apiGet<BoardingOrder[]>('/boarding/orders/mine', params),

  getOrder: (id: string) =>
    apiGet<BoardingOrder>(`/boarding/orders/${id}`),

  getAllOrders: (status?: BoardingOrderStatus) =>
    apiGet<BoardingOrder[]>('/boarding/orders', status ? { status } : undefined),

  createOrder: (data: {
    requestId: string;
    ownerId: string;
    ownerName: string;
    caregiverId: string;
    caregiverName: string;
    caregiverAvatar: string;
    petId: string;
    petName: string;
    petPhoto: string;
    startDate: string;
    endDate: string;
    boardingMethod: string;
    pricePerDay: number;
    handoverNotes: string;
    extraFees?: number;
    discount?: number;
    insurancePlan?: InsurancePlanType;
  }) =>
    apiPost<BoardingOrder>('/boarding/orders', data),

  updateOrderStatus: (id: string, status: BoardingOrderStatus, disputeReason?: string) =>
    apiPut<BoardingOrder>(`/boarding/orders/${id}/status`, { status, disputeReason }),

  disputeOrder: (id: string, reason: string) =>
    apiPost<BoardingOrder>(`/boarding/orders/${id}/dispute`, { reason }),

  getOrderDiaries: (orderId: string) =>
    apiGet<BoardingDiary[]>(`/boarding/orders/${orderId}/diaries`),

  addDiary: (orderId: string, data: {
    caregiverId: string;
    date: string;
    description: string;
    dietStatus: string;
    activityStatus: string;
    photoUrls?: string[];
    alertType: string;
    alertDescription?: string;
  }) =>
    apiPost<BoardingDiary>(`/boarding/orders/${orderId}/diaries`, data),

  getOrderReviews: (orderId: string) =>
    apiGet<BoardingReview[]>(`/boarding/orders/${orderId}/reviews`),

  addReview: (orderId: string, data: {
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar: string;
    targetUserId: string;
    rating: number;
    content: string;
  }) =>
    apiPost<BoardingReview>(`/boarding/orders/${orderId}/reviews`, data),

  getUserReviews: (userId: string) =>
    apiGet<BoardingReview[]>(`/boarding/users/${userId}/reviews`),

  getStats: () =>
    apiGet<BoardingStats>('/boarding/stats'),

  getInsurancePolicy: (orderId: string) =>
    apiGet<InsurancePolicy | null>(`/boarding/insurance/policy/${orderId}`),

  createInsurancePolicy: (orderId: string, planType: InsurancePlanType) =>
    apiPost<InsurancePolicy>('/boarding/insurance/policy', { orderId, planType }),

  getInsuranceClaimsByOrder: (orderId: string) =>
    apiGet<InsuranceClaim[]>(`/boarding/insurance/claims/${orderId}`),

  getAllInsuranceClaims: (status?: InsuranceClaimStatus) =>
    apiGet<InsuranceClaim[]>('/boarding/insurance/claims', status ? { status } : undefined),

  createInsuranceClaim: (data: {
    policyId: string;
    orderId: string;
    applicantId: string;
    applicantName: string;
    description: string;
    claimAmount: number;
    voucherPhotos: string[];
    expenseDetails: string;
  }) => apiPost<InsuranceClaim>('/boarding/insurance/claims', data),

  reviewInsuranceClaim: (claimId: string, approved: boolean, reviewNote?: string) =>
    apiPost<InsuranceClaim>(`/boarding/insurance/claims/${claimId}/review`, { approved, reviewNote }),

  markClaimPaid: (claimId: string) =>
    apiPost<InsuranceClaim>(`/boarding/insurance/claims/${claimId}/pay`, {}),

  getAllTrainingCourses: () => apiGet<TrainingCourse[]>('/boarding/training/courses'),

  getTrainingCourse: (id: string) => apiGet<TrainingCourse>(`/boarding/training/courses/${id}`),

  getCaregiverCourseProgress: (caregiverId: string) =>
    apiGet<CaregiverCourseProgress[]>(`/boarding/training/progress/${caregiverId}`),

  completeTrainingCourse: (caregiverId: string, courseId: string, score: number) =>
    apiPost<CaregiverCourseProgress>('/boarding/training/complete', { caregiverId, courseId, score }),

  getCaregiverExtended: (id: string) =>
    apiGet<BoardingCaregiverExtended>(`/boarding/caregivers/${id}/extended`),

  getAllCaregiversExtended: (status?: string) =>
    apiGet<BoardingCaregiverExtended[]>('/boarding/caregivers-extended', status ? { status } : undefined),

  getCaregiverCertLevel: (id: string) =>
    apiGet<{ level: CaregiverCertLevel }>(`/boarding/caregivers/${id}/cert-level`),

  getOrderLocations: (orderId: string) =>
    apiGet<PetLocationRecord[]>(`/boarding/orders/${orderId}/locations`),

  getOrderLocationsByDate: (orderId: string, date: string) =>
    apiGet<PetLocationRecord[]>(`/boarding/orders/${orderId}/locations/${date}`),

  addPetLocation: (orderId: string, data: {
    caregiverId: string;
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    addressText: string;
    note?: string;
  }) => apiPost<PetLocationRecord>(`/boarding/orders/${orderId}/locations`, data),

  getGeoFence: (orderId: string) =>
    apiGet<GeoFence | null>(`/boarding/orders/${orderId}/geo-fence`),

  createGeoFence: (orderId: string, data: {
    centerLatitude: number;
    centerLongitude: number;
    radiusMeters: number;
    addressText: string;
  }) => apiPost<GeoFence>(`/boarding/orders/${orderId}/geo-fence`, data),

  getGeoFenceAlerts: (orderId: string) =>
    apiGet<GeoFenceAlert[]>(`/boarding/orders/${orderId}/alerts`),

  getAgreement: (orderId: string) =>
    apiGet<BoardingAgreement | null>(`/boarding/orders/${orderId}/agreement`),

  createAgreement: (orderId: string) =>
    apiPost<BoardingAgreement>(`/boarding/orders/${orderId}/agreement`, {}),

  signAgreement: (agreementId: string, signerRole: 'owner' | 'caregiver') =>
    apiPost<BoardingAgreement>(`/boarding/agreements/${agreementId}/sign`, { signerRole }),

  rejectAgreement: (agreementId: string, reason: string, rejectorRole: 'owner' | 'caregiver') =>
    apiPost<BoardingAgreement>(`/boarding/agreements/${agreementId}/reject`, { reason, rejectorRole }),

  cancelOrderWithDeduction: (orderId: string, cancelDate: string) =>
    apiPost<BoardingOrder>(`/boarding/orders/${orderId}/cancel-with-deduction`, { cancelDate }),

  getCancelDeduction: (orderId: string, cancelDate: string) =>
    apiGet<{ percentage: number; refundAmount: number }>(`/boarding/orders/${orderId}/cancel-deduction`, { cancelDate }),

  getDashboardStats: () =>
    apiGet<BoardingDashboardStats>('/boarding/dashboard/stats'),
};
