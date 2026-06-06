import type {
  User,
  Pet,
  Application,
  Story,
  Comment,
  HistoryRecord,
  Favorite,
  Follow,
} from '../shared/types.js';

type HasId = { id: string };

const generateId = () => Math.random().toString(36).slice(2, 11);
const now = () => new Date().toISOString();

class Collection<T extends HasId> extends Array<T> {
  list(): T[] {
    return Array.from(this);
  }

  getById(id: string): T | undefined {
    for (let i = 0; i < this.length; i++) {
      if (this[i].id === id) return this[i];
    }
    return undefined;
  }

  create(item: Omit<T, 'id'> & { id?: string }): T {
    const id = item.id || generateId();
    const newItem = { ...item, id } as T;
    this.unshift(newItem);
    return newItem;
  }

  update(id: string, data: Partial<T>): T | undefined {
    for (let i = 0; i < this.length; i++) {
      if (this[i].id === id) {
        this[i] = { ...this[i], ...data } as T;
        return this[i];
      }
    }
    return undefined;
  }

  delete(id: string): boolean {
    for (let i = 0; i < this.length; i++) {
      if (this[i].id === id) {
        this.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  findAll(predicate: (item: T) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i])) result.push(this[i]);
    }
    return result;
  }
}

class MockStore {
  users: Collection<User> = new Collection<User>();
  pets: Collection<Pet> = new Collection<Pet>();
  applications: Collection<Application> = new Collection<Application>();
  stories: Collection<Story> = new Collection<Story>();
  comments: Collection<Comment> = new Collection<Comment>();
  history: Collection<HistoryRecord> = new Collection<HistoryRecord>();
  favorites: Collection<Favorite> = new Collection<Favorite>();
  follows: Collection<Follow> = new Collection<Follow>();

  private static instance: MockStore;

  private constructor() {}

  static getInstance(): MockStore {
    if (!MockStore.instance) {
      MockStore.instance = new MockStore();
    }
    return MockStore.instance;
  }

  addPet(data: Omit<Pet, 'id' | 'createdAt' | 'viewCount' | 'favoriteCount' | 'isAdopted'>): Pet {
    const pet: Pet = {
      ...data,
      id: generateId(),
      createdAt: now(),
      viewCount: 0,
      favoriteCount: 0,
      isAdopted: false,
    };
    this.pets.unshift(pet);
    return pet;
  }

  updatePet(id: string, data: Partial<Pet>): Pet | null {
    const idx = this.pets.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.pets[idx] = { ...this.pets[idx], ...data };
    return this.pets[idx];
  }

  incrementPetView(id: string): Pet | null {
    const pet = this.pets.find((p) => p.id === id);
    if (!pet) return null;
    pet.viewCount += 1;
    return pet;
  }

  incrementPetFavorite(id: string): Pet | null {
    const pet = this.pets.find((p) => p.id === id);
    if (!pet) return null;
    pet.favoriteCount += 1;
    return pet;
  }

  decrementPetFavorite(id: string): Pet | null {
    const pet = this.pets.find((p) => p.id === id);
    if (!pet) return null;
    pet.favoriteCount = Math.max(0, pet.favoriteCount - 1);
    return pet;
  }

  addApplication(data: Omit<Application, 'id' | 'status' | 'createdAt'>): Application {
    const app: Application = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: now(),
    };
    this.applications.unshift(app);
    return app;
  }

  updateApplicationStatus(id: string, status: 'approved' | 'rejected'): Application | null {
    const app = this.applications.find((a) => a.id === id);
    if (!app) return null;
    app.status = status;
    app.reviewedAt = now();
    if (status === 'approved') {
      const pet = this.pets.find((p) => p.id === app.petId);
      if (pet) {
        pet.isAdopted = true;
        pet.adoptedAt = now();
      }
    }
    return app;
  }

  addFavorite(userId: string, petId: string): Favorite | null {
    if (this.favorites.some((f) => f.userId === userId && f.petId === petId)) {
      return null;
    }
    const fav: Favorite = {
      id: generateId(),
      userId,
      petId,
      addedAt: now(),
    };
    this.favorites.unshift(fav);
    this.incrementPetFavorite(petId);
    return fav;
  }

  removeFavorite(userId: string, petId: string): boolean {
    const idx = this.favorites.findIndex((f) => f.userId === userId && f.petId === petId);
    if (idx === -1) return false;
    this.favorites.splice(idx, 1);
    this.decrementPetFavorite(petId);
    return true;
  }

  getFavoritesByUser(userId: string): Favorite[] {
    return this.favorites.filter((f) => f.userId === userId);
  }

  addFollow(userId: string, petId: string): Follow | null {
    if (this.follows.some((f) => f.userId === userId && f.petId === petId)) {
      return null;
    }
    const follow: Follow = {
      id: generateId(),
      userId,
      petId,
      followedAt: now(),
    };
    this.follows.unshift(follow);
    return follow;
  }

  removeFollow(userId: string, petId: string): boolean {
    const idx = this.follows.findIndex((f) => f.userId === userId && f.petId === petId);
    if (idx === -1) return false;
    this.follows.splice(idx, 1);
    return true;
  }

  getFollowsByUser(userId: string): Follow[] {
    return this.follows.filter((f) => f.userId === userId);
  }

  addHistory(userId: string, petId: string, petName: string, petPhoto: string): HistoryRecord {
    const existingIdx = this.history.findIndex((h) => h.petId === petId);
    if (existingIdx !== -1) {
      this.history.splice(existingIdx, 1);
    }
    const record: HistoryRecord = {
      id: generateId(),
      petId,
      petName,
      petPhoto,
      viewedAt: now(),
    };
    this.history.unshift(record);
    return record;
  }

  getHistoryByUser(userId: string): HistoryRecord[] {
    return this.history.slice(0, 20);
  }

  addStory(data: Omit<Story, 'id' | 'likes' | 'createdAt'>): Story {
    const story: Story = {
      ...data,
      id: generateId(),
      likes: 0,
      createdAt: now(),
    };
    this.stories.unshift(story);
    return story;
  }

  likeStory(id: string): Story | null {
    const story = this.stories.find((s) => s.id === id);
    if (!story) return null;
    story.likes += 1;
    return story;
  }

  addComment(data: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const comment: Comment = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.comments.unshift(comment);
    return comment;
  }

  getCommentsByStory(storyId: string): Comment[] {
    return this.comments
      .filter((c) => c.storyId === storyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export const store = MockStore.getInstance();
