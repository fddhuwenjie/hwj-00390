export type Species = 'cat' | 'dog' | 'rabbit' | 'bird' | 'other';
export type Gender = 'male' | 'female';
export type PersonalityTag = '亲人' | '独立' | '活泼' | '安静' | '粘人' | '高冷' | '聪明' | '贪吃' | '胆小' | '勇敢';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'publisher' | 'admin';
export type SortOrder = 'newest' | 'popular' | 'hot';
export type DogSize = 'small' | 'medium' | 'large' | 'unknown';
export type FollowUpStatus = 'pending' | 'submitted' | 'overdue';
export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor';
export type LostPetStatus = 'lost' | 'found';
export type PostTag = '日常' | '求助' | '科普' | '晒宠' | '讨论';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: number;
  gender: Gender;
  weight: number;
  neutered: boolean;
  healthDescription: string;
  personalityTags: PersonalityTag[];
  photoUrls: string[];
  publisherId: string;
  publisherName: string;
  createdAt: string;
  viewCount: number;
  favoriteCount: number;
  isAdopted: boolean;
  adoptedAt?: string;
}

export interface Application {
  id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  applicantId: string;
  applicantName: string;
  contact: string;
  livingEnvironment: string;
  hasPetExperience: boolean;
  dailyCompanionTime: string;
  familyMembers: string;
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  images: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  petId?: string;
  petName?: string;
  likes: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface HistoryRecord {
  id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  viewedAt: string;
}

export interface Favorite {
  id: string;
  petId: string;
  userId: string;
  addedAt: string;
}

export interface Follow {
  id: string;
  petId: string;
  userId: string;
  followedAt: string;
}

export interface AdminStats {
  speciesDistribution: { species: Species; count: number }[];
  monthlyTrend: { month: string; newPets: number; adoptedPets: number }[];
  topBreeds: { breed: string; count: number }[];
  avgWaitDays: number;
  adoptionSuccessRate: number;
  totalPets: number;
  adoptedPets: number;
  pendingApplications: number;
}

export interface PetFilters {
  species?: Species;
  breed?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: Gender;
  neutered?: boolean;
  tag?: PersonalityTag;
  keyword?: string;
  sort?: SortOrder;
}

export const SPECIES_LABELS: Record<Species, string> = {
  cat: '猫',
  dog: '狗',
  rabbit: '兔',
  bird: '鸟',
  other: '其他',
};

export const SPECIES_EMOJI: Record<Species, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  bird: '🐦',
  other: '🐾',
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: '公',
  female: '母',
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: '待审',
  approved: '通过',
  rejected: '拒绝',
};

export const ALL_PERSONALITY_TAGS: PersonalityTag[] = [
  '亲人', '独立', '活泼', '安静', '粘人', '高冷', '聪明', '贪吃', '胆小', '勇敢'
];

export interface UserPreference {
  id: string;
  userId: string;
  livingEnvironment: string;
  hasPetExperience: boolean;
  dailyCompanionTime: string;
  familyMembers: string;
  updatedAt: string;
}

export interface PetWithMatchScore extends Pet {
  matchScore: number;
}

export interface VaccineRecord {
  id: string;
  petId: string;
  vaccineName: string;
  date: string;
  nextDate?: string;
  createdAt: string;
}

export interface DewormingRecord {
  id: string;
  petId: string;
  dewormingType: string;
  date: string;
  createdAt: string;
}

export interface HealthCheckup {
  id: string;
  petId: string;
  title: string;
  description: string;
  date: string;
  photoUrls: string[];
  createdAt: string;
}

export interface HealthProfile {
  petId: string;
  vaccines: VaccineRecord[];
  dewormings: DewormingRecord[];
  checkups: HealthCheckup[];
}

export interface FollowUpTask {
  id: string;
  applicationId: string;
  petId: string;
  petName: string;
  petPhoto: string;
  adopterId: string;
  adopterName: string;
  adoptionDate: string;
  dueDate: string;
  status: FollowUpStatus;
  reportId?: string;
  report?: FollowUpReport;
  createdAt: string;
}

export interface FollowUpReport {
  id: string;
  taskId: string;
  petId: string;
  adopterId: string;
  description: string;
  photoUrls: string[];
  healthStatus: HealthStatus;
  submittedAt: string;
}

export interface LostPet {
  id: string;
  petName: string;
  species: Species;
  breed?: string;
  photoUrls: string[];
  features: string;
  location: string;
  latitude?: number;
  longitude?: number;
  lostTime: string;
  contact: string;
  reporterId: string;
  reporterName: string;
  status: LostPetStatus;
  sightingCount: number;
  createdAt: string;
  foundAt?: string;
}

export interface LostPetSighting {
  id: string;
  lostPetId: string;
  reporterId: string;
  reporterName: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  photoUrls: string[];
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  images: string[];
  tags: PostTag[];
  likeCount: number;
  commentCount: number;
  likedBy: string[];
  isLiked: boolean;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export const DOG_SIZE_LABELS: Record<DogSize, string> = {
  small: '小型犬',
  medium: '中型犬',
  large: '大型犬',
  unknown: '未知',
};

export const FOLLOWUP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  pending: '待回访',
  submitted: '已回访',
  overdue: '已逾期',
};

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  excellent: '非常好',
  good: '良好',
  fair: '一般',
  poor: '较差',
};

export const ALL_HEALTH_STATUS: HealthStatus[] = ['excellent', 'good', 'fair', 'poor'];

export const LOST_PET_STATUS_LABELS: Record<LostPetStatus, string> = {
  lost: '走失中',
  found: '已寻回',
};

export const ALL_POST_TAGS: PostTag[] = ['日常', '求助', '科普', '晒宠', '讨论'];

export const POST_TAG_COLORS: Record<PostTag, string> = {
  '日常': 'bg-sky-100 text-sky-600',
  '求助': 'bg-rose-100 text-rose-600',
  '科普': 'bg-violet-100 text-violet-600',
  '晒宠': 'bg-amber-100 text-amber-700',
  '讨论': 'bg-emerald-100 text-emerald-600',
};

export type CaregiverStatus = 'pending' | 'approved' | 'rejected';
export type BoardingMethod = 'home_visit' | 'foster_home' | 'pet_hotel';
export type BoardingOrderStatus = 'pending_confirm' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type DiaryAlertType = 'sick' | 'injured' | 'abnormal_behavior' | 'none';

export const CAREGIVER_STATUS_LABELS: Record<CaregiverStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
};

export const BOARDING_METHOD_LABELS: Record<BoardingMethod, string> = {
  home_visit: '上门照料',
  foster_home: '送至寄养家庭',
  pet_hotel: '宠物旅馆',
};

export const BOARDING_ORDER_STATUS_LABELS: Record<BoardingOrderStatus, string> = {
  pending_confirm: '待确认',
  confirmed: '已确认',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  disputed: '争议中',
};

export const DIARY_ALERT_LABELS: Record<DiaryAlertType, string> = {
  sick: '生病',
  injured: '受伤',
  abnormal_behavior: '异常行为',
  none: '正常',
};

export interface BoardingCaregiver {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  livingArea: number;
  hasYard: boolean;
  petExperienceYears: number;
  acceptedSpecies: Species[];
  maxPetsAtOnce: number;
  pricePerDay: number;
  serviceRadiusKm: number;
  availableDates: string[];
  bio?: string;
  status: CaregiverStatus;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  totalOrders: number;
  averageRating: number;
}

export interface BoardingCaregiverWithScore extends BoardingCaregiver {
  matchScore: number;
}

export interface SpecialCare {
  dietPreference: string;
  medication: string;
  restrictions: string;
}

export interface BoardingRequest {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  petId: string;
  petName: string;
  petSpecies: Species;
  petPhoto: string;
  startDate: string;
  endDate: string;
  specialCare: SpecialCare;
  acceptedMethods: BoardingMethod[];
  budgetMin: number;
  budgetMax: number;
  emergencyContact: string;
  status: 'open' | 'matched' | 'completed' | 'cancelled';
  createdAt: string;
  handoverNotes?: string;
}

export interface BoardingOrderCost {
  baseFee: number;
  extraFees: number;
  discount: number;
  totalAmount: number;
  days: number;
}

export interface BoardingOrder {
  id: string;
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
  boardingMethod: BoardingMethod;
  cost: BoardingOrderCost;
  handoverNotes: string;
  status: BoardingOrderStatus;
  createdAt: string;
  confirmedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  disputeReason?: string;
}

export interface BoardingDiary {
  id: string;
  orderId: string;
  caregiverId: string;
  date: string;
  description: string;
  dietStatus: string;
  activityStatus: string;
  photoUrls: string[];
  alertType: DiaryAlertType;
  alertDescription?: string;
  createdAt: string;
}

export interface BoardingReview {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  targetUserId: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface BoardingStats {
  monthlyOrders: { month: string; count: number; revenue: number }[];
  speciesDistribution: { species: Species; count: number }[];
  activeCaregivers: number;
  totalRevenue: number;
  totalOrders: number;
  pendingCaregivers: number;
  disputedOrders: number;
}

export interface CaregiverIncomeStats {
  month: string;
  orders: number;
  income: number;
  rating: number;
}
