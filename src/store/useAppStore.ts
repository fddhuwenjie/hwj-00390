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
}));
