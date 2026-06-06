import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete } from '@/api/client';
import type {
  User,
  Pet,
  Story,
  Application,
  Favorite,
  Follow,
  HistoryRecord,
  Comment,
  AdminStats,
  PetFilters,
  ApplicationStatus,
  UserPreference,
  PetWithMatchScore,
  HealthProfile,
  FollowUpTask,
  FollowUpReport,
  LostPet,
  LostPetSighting,
  CommunityPost,
  PostComment,
  HealthStatus,
  PostTag,
  LostPetStatus,
} from '../../shared/types';

interface AppState {
  currentUser: User | null;
  pets: Pet[];
  stories: Story[];
  applications: Application[];
  favorites: Favorite[];
  follows: Follow[];
  history: HistoryRecord[];
  featuredStories: Story[];
  comments: Record<string, Comment[]>;
  adminStats: AdminStats | null;
  loading: boolean;
  error: string | null;

  recommendedPets: PetWithMatchScore[];
  userPreference: UserPreference | null;
  healthProfile: HealthProfile | null;
  followUpTasks: FollowUpTask[];
  followUpReport: FollowUpReport | null;
  lostPets: LostPet[];
  lostPetSightings: LostPetSighting[];
  communityPosts: CommunityPost[];
  postComments: Record<string, PostComment[]>;
  followingIds: string[];

  setUser: (user: User | null) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;

  fetchPets: (filters?: PetFilters) => Promise<void>;
  fetchPet: (id: string) => Promise<Pet | undefined>;
  createPet: (data: Partial<Pet>) => Promise<Pet>;

  fetchApplications: (params?: Record<string, unknown>) => Promise<void>;
  createApplication: (data: Partial<Application>) => Promise<Application>;
  updateApplication: (id: string, status: ApplicationStatus) => Promise<Application>;

  fetchFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (userId: string, petId: string) => Promise<boolean>;
  isFavorite: (petId: string) => boolean;

  fetchFollows: (userId: string) => Promise<void>;
  toggleFollow: (userId: string, petId: string) => Promise<boolean>;
  isFollowing: (petId: string) => boolean;

  fetchHistory: (userId: string) => Promise<void>;
  addHistory: (userId: string, pet: Pet) => Promise<void>;

  fetchStories: () => Promise<void>;
  fetchFeaturedStories: () => Promise<void>;
  createStory: (data: Partial<Story>) => Promise<Story>;
  likeStory: (id: string) => Promise<void>;

  fetchComments: (storyId: string) => Promise<void>;
  createComment: (storyId: string, data: Partial<Comment>) => Promise<Comment>;

  fetchAdminStats: () => Promise<void>;

  fetchRecommendations: (userId: string, limit?: number) => Promise<void>;
  fetchUserPreference: (userId: string) => Promise<void>;
  setUserPreference: (userId: string, data: {
    livingEnvironment: string;
    hasPetExperience: boolean;
    dailyCompanionTime: string;
    familyMembers: string;
  }) => Promise<UserPreference>;

  fetchHealthProfile: (petId: string) => Promise<void>;
  addVaccineRecord: (petId: string, data: Partial<{ vaccineName: string; date: string; nextDate?: string }>) => Promise<void>;
  addDewormingRecord: (petId: string, data: Partial<{ dewormingType: string; date: string }>) => Promise<void>;
  addHealthCheckup: (petId: string, data: Partial<{ title: string; description: string; date: string; photoUrls: string[] }>) => Promise<void>;

  fetchFollowUpTasks: (userId?: string) => Promise<void>;
  fetchMyFollowUpTasks: () => Promise<void>;
  fetchAllFollowUpTasks: () => Promise<void>;
  fetchFollowUpReport: (taskId: string) => Promise<void>;
  submitFollowUpReport: (taskId: string, data: {
    description: string;
    photoUrls: string[];
    healthStatus: HealthStatus;
  }) => Promise<FollowUpReport>;

  fetchLostPets: (status?: LostPetStatus) => Promise<void>;
  registerLostPet: (data: Partial<LostPet>) => Promise<LostPet>;
  markLostPetFound: (lostPetId: string) => Promise<void>;
  fetchLostPetSightings: (lostPetId: string) => Promise<void>;
  addLostPetSighting: (lostPetId: string, data: Partial<LostPetSighting>) => Promise<LostPetSighting>;

  fetchCommunityPosts: (sort?: 'newest' | 'hot' | 'following', tag?: PostTag) => Promise<void>;
  fetchCommunityPostById: (postId: string) => Promise<void>;
  createCommunityPost: (data: Partial<CommunityPost>) => Promise<CommunityPost>;
  likeCommunityPost: (postId: string, userId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  fetchPostComments: (postId: string) => Promise<void>;
  createPostComment: (postId: string, data: Partial<PostComment>) => Promise<PostComment>;
  addComment: (postId: string, data: Partial<PostComment>) => Promise<PostComment>;

  fetchFollowingIds: (userId: string) => Promise<void>;
  toggleFollowUser: (followerId: string, followingId: string) => Promise<boolean>;
  isFollowingUser: (followingId: string) => boolean;
  checkFollowingStatus: (followingId: string) => Promise<void>;
}

const STORAGE_KEY = 'petAdoptionUser';

function loadStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as User;
    }
  } catch {
    // ignore
  }
  return null;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: loadStoredUser(),
  pets: [],
  stories: [],
  applications: [],
  favorites: [],
  follows: [],
  history: [],
  featuredStories: [],
  comments: {},
  adminStats: null,
  loading: false,
  error: null,

  recommendedPets: [],
  userPreference: null,
  healthProfile: null,
  followUpTasks: [],
  followUpReport: null,
  lostPets: [],
  lostPetSightings: [],
  communityPosts: [],
  postComments: {},
  followingIds: [],

  setUser: (user) => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    set({ currentUser: user });
  },
  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ currentUser: null });
  },
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),

  fetchPets: async (filters) => {
    set({ loading: true });
    try {
      const data = await apiGet<Pet[]>('/pets', filters as Record<string, unknown>);
      set({ pets: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  fetchPet: async (id) => {
    try {
      return await apiGet<Pet>(`/pets/${id}`);
    } catch {
      return undefined;
    }
  },
  createPet: async (data) => {
    return apiPost<Pet>('/pets', data);
  },

  fetchApplications: async (params) => {
    set({ loading: true });
    try {
      const data = await apiGet<Application[]>('/applications', params);
      set({ applications: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  createApplication: async (data) => {
    return apiPost<Application>('/applications', data);
  },
  updateApplication: async (id, status) => {
    return apiPut<Application>(`/applications/${id}`, { status });
  },

  fetchFavorites: async (userId) => {
    try {
      const data = await apiGet<Favorite[]>('/favorites', { userId });
      set({ favorites: data });
    } catch {
      // ignore
    }
  },
  toggleFavorite: async (userId, petId) => {
    const exists = get().favorites.some(f => f.petId === petId && f.userId === userId);
    if (exists) {
      await apiDelete(`/favorites/${petId}`, { userId });
    } else {
      await apiPost('/favorites', { userId, petId });
    }
    await get().fetchFavorites(userId);
    return !exists;
  },
  isFavorite: (petId) => {
    const user = get().currentUser;
    if (!user) return false;
    return get().favorites.some(f => f.petId === petId && f.userId === user.id);
  },

  fetchFollows: async (userId) => {
    try {
      const data = await apiGet<Follow[]>('/follows', { userId });
      set({ follows: data });
    } catch {
      // ignore
    }
  },
  toggleFollow: async (userId, petId) => {
    const exists = get().follows.some(f => f.petId === petId && f.userId === userId);
    if (exists) {
      await apiDelete(`/follows/${petId}`, { userId });
    } else {
      await apiPost('/follows', { userId, petId });
    }
    await get().fetchFollows(userId);
    return !exists;
  },
  isFollowing: (petId) => {
    const user = get().currentUser;
    if (!user) return false;
    return get().follows.some(f => f.petId === petId && f.userId === user.id);
  },

  fetchHistory: async (userId) => {
    try {
      const data = await apiGet<HistoryRecord[]>('/history', { userId });
      set({ history: data });
    } catch {
      // ignore
    }
  },
  addHistory: async (userId, pet) => {
    try {
      await apiPost('/history', {
        userId,
        petId: pet.id,
        petName: pet.name,
        petPhoto: pet.photoUrls[0] || '',
      });
      await get().fetchHistory(userId);
    } catch {
      // ignore
    }
  },

  fetchStories: async () => {
    set({ loading: true });
    try {
      const data = await apiGet<Story[]>('/stories');
      set({ stories: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  fetchFeaturedStories: async () => {
    try {
      const data = await apiGet<Story[]>('/stories/featured');
      set({ featuredStories: data });
    } catch {
      // ignore
    }
  },
  createStory: async (data) => {
    return apiPost<Story>('/stories', data);
  },
  likeStory: async (id) => {
    await apiPost(`/stories/${id}/like`);
  },

  fetchComments: async (storyId) => {
    try {
      const data = await apiGet<Comment[]>(`/stories/${storyId}/comments`);
      set({ comments: { ...get().comments, [storyId]: data } });
    } catch {
      // ignore
    }
  },
  createComment: async (storyId, data) => {
    const result = await apiPost<Comment>(`/stories/${storyId}/comments`, data);
    await get().fetchComments(storyId);
    return result;
  },

  fetchAdminStats: async () => {
    set({ loading: true });
    try {
      const data = await apiGet<AdminStats>('/admin/stats');
      set({ adminStats: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchRecommendations: async (userId, limit) => {
    try {
      const data = await apiGet<PetWithMatchScore[]>('/matching/recommendations', { userId, limit });
      set({ recommendedPets: data });
    } catch {
      // ignore
    }
  },
  fetchUserPreference: async (userId) => {
    try {
      const data = await apiGet<UserPreference | null>(`/matching/preference/${userId}`);
      set({ userPreference: data });
    } catch {
      // ignore
    }
  },
  setUserPreference: async (userId, data) => {
    const result = await apiPost<UserPreference>('/matching/preference', { userId, ...data });
    set({ userPreference: result });
    return result;
  },

  fetchHealthProfile: async (petId) => {
    try {
      const data = await apiGet<HealthProfile>(`/health/${petId}`);
      set({ healthProfile: data });
    } catch {
      // ignore
    }
  },
  addVaccineRecord: async (petId, data) => {
    await apiPost(`/health/${petId}/vaccine`, data);
    await get().fetchHealthProfile(petId);
  },
  addDewormingRecord: async (petId, data) => {
    await apiPost(`/health/${petId}/deworming`, data);
    await get().fetchHealthProfile(petId);
  },
  addHealthCheckup: async (petId, data) => {
    await apiPost(`/health/${petId}/checkup`, data);
    await get().fetchHealthProfile(petId);
  },

  fetchFollowUpTasks: async (userId) => {
    try {
      const url = userId ? '/followup/my' : '/followup/all';
      const params = userId ? { userId } : undefined;
      const data = await apiGet<FollowUpTask[]>(url, params);
      set({ followUpTasks: data });
    } catch {
      // ignore
    }
  },
  fetchMyFollowUpTasks: async () => {
    const user = get().currentUser;
    if (!user) return;
    await get().fetchFollowUpTasks(user.id);
  },
  fetchAllFollowUpTasks: async () => {
    await get().fetchFollowUpTasks();
  },
  fetchFollowUpReport: async (taskId) => {
    try {
      const data = await apiGet<FollowUpReport | null>(`/followup/report/${taskId}`);
      set({ followUpReport: data });
    } catch {
      // ignore
    }
  },
  submitFollowUpReport: async (taskId, data) => {
    const user = get().currentUser;
    if (!user) throw new Error('Not logged in');
    const result = await apiPost<FollowUpReport>(`/followup/submit/${taskId}`, { ...data, adopterId: user.id });
    await get().fetchMyFollowUpTasks();
    return result;
  },

  fetchLostPets: async (status) => {
    set({ loading: true });
    try {
      const data = await apiGet<LostPet[]>('/lost', status ? { status } : undefined);
      set({ lostPets: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  registerLostPet: async (data) => {
    return apiPost<LostPet>('/lost', data);
  },
  markLostPetFound: async (lostPetId) => {
    await apiPut<LostPet>(`/lost/${lostPetId}/found`);
    const user = get().currentUser;
    if (user) await get().fetchLostPets();
  },
  fetchLostPetSightings: async (lostPetId) => {
    try {
      const data = await apiGet<LostPetSighting[]>(`/lost/${lostPetId}/sightings`);
      set({ lostPetSightings: data });
    } catch {
      // ignore
    }
  },
  addLostPetSighting: async (lostPetId, data) => {
    const result = await apiPost<LostPetSighting>(`/lost/${lostPetId}/sightings`, data);
    await get().fetchLostPetSightings(lostPetId);
    await get().fetchLostPets();
    return result;
  },

  fetchCommunityPosts: async (sort = 'newest', tag) => {
    set({ loading: true });
    try {
      const user = get().currentUser;
      const params: Record<string, unknown> = { sort: sort === 'following' ? 'newest' : sort };
      if (user) params.userId = user.id;
      if (tag) params.tag = tag;
      let data = await apiGet<CommunityPost[]>('/community', params);
      if (sort === 'following' && user) {
        await get().fetchFollowingIds(user.id);
        const ids = get().followingIds;
        data = data.filter(p => ids.includes(p.authorId));
      }
      set({ communityPosts: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  fetchCommunityPostById: async (postId) => {
    try {
      const existing = get().communityPosts.find(p => p.id === postId);
      if (!existing) {
        const data = await apiGet<CommunityPost[]>(`/community`);
        set({ communityPosts: data });
      }
    } catch {
      // ignore
    }
  },
  createCommunityPost: async (data) => {
    const result = await apiPost<CommunityPost>('/community', data);
    await get().fetchCommunityPosts();
    return result;
  },
  likeCommunityPost: async (postId, userId) => {
    await apiPost(`/community/${postId}/like`, { userId });
    const posts = get().communityPosts.map((p) =>
      p.id === postId
        ? {
            ...p,
            isLiked: !p.isLiked,
            likeCount: p.isLiked ? Math.max(0, p.likeCount - 1) : p.likeCount + 1,
            likedBy: p.isLiked ? p.likedBy.filter(id => id !== userId) : [...p.likedBy, userId],
          }
        : p
    );
    set({ communityPosts: posts });
  },
  likePost: async (postId, userId) => {
    await get().likeCommunityPost(postId, userId);
  },
  fetchPostComments: async (postId) => {
    try {
      const data = await apiGet<PostComment[]>(`/community/${postId}/comments`);
      set({ postComments: { ...get().postComments, [postId]: data } });
    } catch {
      // ignore
    }
  },
  createPostComment: async (postId, data) => {
    const result = await apiPost<PostComment>(`/community/${postId}/comments`, data);
    await get().fetchPostComments(postId);
    const posts = get().communityPosts.map((p) =>
      p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
    );
    set({ communityPosts: posts });
    return result;
  },
  addComment: async (postId, data) => {
    return await get().createPostComment(postId, data);
  },

  fetchFollowingIds: async (userId) => {
    try {
      const data = await apiGet<string[]>('/community/following', { userId });
      set({ followingIds: data });
    } catch {
      // ignore
    }
  },
  toggleFollowUser: async (followerId, followingId) => {
    const exists = get().followingIds.includes(followingId);
    if (exists) {
      await apiDelete('/community/follow', { followerId, followingId });
      set({ followingIds: get().followingIds.filter((id) => id !== followingId) });
    } else {
      await apiPost('/community/follow', { followerId, followingId });
      set({ followingIds: [...get().followingIds, followingId] });
    }
    return !exists;
  },
  isFollowingUser: (followingId) => {
    return get().followingIds.includes(followingId);
  },
  checkFollowingStatus: async (followingId) => {
    const user = get().currentUser;
    if (!user) return;
    try {
      const data = await apiGet<{ isFollowing: boolean }>('/community/is-following', { followerId: user.id, followingId });
      if (data.isFollowing && !get().followingIds.includes(followingId)) {
        set({ followingIds: [...get().followingIds, followingId] });
      } else if (!data.isFollowing && get().followingIds.includes(followingId)) {
        set({ followingIds: get().followingIds.filter(id => id !== followingId) });
      }
    } catch {
      // ignore
    }
  },
}));
