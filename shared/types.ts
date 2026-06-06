export type Species = 'cat' | 'dog' | 'rabbit' | 'bird' | 'other';
export type Gender = 'male' | 'female';
export type PersonalityTag = '亲人' | '独立' | '活泼' | '安静' | '粘人' | '高冷' | '聪明' | '贪吃' | '胆小' | '勇敢';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'publisher' | 'admin';
export type SortOrder = 'newest' | 'popular';

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
