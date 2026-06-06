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
};
