import type {
  User,
  Pet,
  Application,
  Story,
  Comment,
  HistoryRecord,
  Favorite,
  Follow,
  UserPreference,
  PetWithMatchScore,
  VaccineRecord,
  DewormingRecord,
  HealthCheckup,
  FollowUpTask,
  FollowUpReport,
  LostPet,
  LostPetSighting,
  CommunityPost,
  PostComment,
  UserFollow,
  FollowUpStatus,
  DogSize,
  HealthStatus,
  LostPetStatus,
  PostTag,
  BoardingCaregiver,
  BoardingCaregiverWithScore,
  BoardingRequest,
  BoardingOrder,
  BoardingOrderStatus,
  BoardingDiary,
  BoardingReview,
  BoardingStats,
  Species,
  BoardingMethod,
  CaregiverIncomeStats,
  DiaryAlertType,
  CaregiverStatus,
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

  userPreferences: Collection<UserPreference> = new Collection<UserPreference>();
  vaccines: Collection<VaccineRecord> = new Collection<VaccineRecord>();
  dewormings: Collection<DewormingRecord> = new Collection<DewormingRecord>();
  healthCheckups: Collection<HealthCheckup> = new Collection<HealthCheckup>();
  followUpTasks: Collection<FollowUpTask> = new Collection<FollowUpTask>();
  followUpReports: Collection<FollowUpReport> = new Collection<FollowUpReport>();
  lostPets: Collection<LostPet> = new Collection<LostPet>();
  lostPetSightings: Collection<LostPetSighting> = new Collection<LostPetSighting>();
  communityPosts: Collection<CommunityPost> = new Collection<CommunityPost>();
  postComments: Collection<PostComment> = new Collection<PostComment>();
  postLikes: Collection<{ id: string; postId: string; userId: string; createdAt: string }> = new Collection();
  userFollows: Collection<UserFollow> = new Collection<UserFollow>();

  boardingCaregivers: Collection<BoardingCaregiver> = new Collection<BoardingCaregiver>();
  boardingRequests: Collection<BoardingRequest> = new Collection<BoardingRequest>();
  boardingOrders: Collection<BoardingOrder> = new Collection<BoardingOrder>();
  boardingDiaries: Collection<BoardingDiary> = new Collection<BoardingDiary>();
  boardingReviews: Collection<BoardingReview> = new Collection<BoardingReview>();

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
      this.createFollowUpTask(app);
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

  private getDogSize(breed: string): DogSize {
    const large = ['金毛寻回犬', '拉布拉多', '哈士奇', '萨摩耶', '边境牧羊犬'];
    const medium = ['柴犬', '柯基'];
    const small = ['泰迪', '博美', '比熊'];
    if (large.includes(breed)) return 'large';
    if (medium.includes(breed)) return 'medium';
    if (small.includes(breed)) return 'small';
    return 'unknown';
  }

  private calculateCompanionTimeHours(time: string): number {
    if (time.includes('<2')) return 1;
    if (time.includes('2-4')) return 3;
    if (time.includes('4-8')) return 6;
    if (time.includes('>8')) return 10;
    return 3;
  }

  private isLargeSpace(env: string): boolean {
    return env.includes('别墅') || env.includes('院子') || env.includes('宽敞') || env.includes('自有住房');
  }

  calculateMatchScore(pet: Pet, pref: UserPreference): number {
    let score = 50;

    const isGentle = pet.personalityTags.includes('亲人') || pet.personalityTags.includes('安静') || pet.personalityTags.includes('粘人');
    const isIndependent = pet.personalityTags.includes('独立') || pet.personalityTags.includes('高冷') || pet.personalityTags.includes('安静');
    const companionHours = this.calculateCompanionTimeHours(pref.dailyCompanionTime);
    const largeSpace = this.isLargeSpace(pref.livingEnvironment);

    if (pref.hasPetExperience) {
      score += 10;
      if (pet.species === 'dog') {
        const size = this.getDogSize(pet.breed);
        if (size === 'large' && largeSpace) {
          score += 20;
        } else if (size === 'large' && !largeSpace) {
          score -= 10;
        }
      }
    } else {
      if (isGentle) {
        score += 20;
      }
      if (pet.personalityTags.includes('活泼') || pet.personalityTags.includes('勇敢')) {
        score -= 5;
      }
    }

    if (companionHours >= 4) {
      score += 10;
    } else if (companionHours < 2) {
      if (isIndependent) {
        score += 15;
      } else {
        score -= 15;
      }
    }

    if (largeSpace) {
      score += 5;
    }

    if (pref.familyMembers && (pref.familyMembers.includes('小孩') || pref.familyMembers.includes('孩子'))) {
      if (isGentle && pet.personalityTags.includes('亲人')) {
        score += 15;
      }
      if (pet.personalityTags.includes('胆小')) {
        score -= 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  getMatchedPets(userId: string, limit: number = 6): PetWithMatchScore[] {
    const pref = this.userPreferences.find((p) => p.userId === userId);
    if (!pref) {
      return this.pets
        .filter((p) => !p.isAdopted)
        .slice(0, limit)
        .map((p) => ({ ...p, matchScore: 0 }));
    }

    const scored: PetWithMatchScore[] = this.pets
      .filter((p) => !p.isAdopted)
      .map((pet) => ({
        ...pet,
        matchScore: this.calculateMatchScore(pet, pref),
      }));

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, limit);
  }

  setUserPreference(userId: string, data: Omit<UserPreference, 'id' | 'userId' | 'updatedAt'>): UserPreference {
    const existing = this.userPreferences.find((p) => p.userId === userId);
    if (existing) {
      const updated = this.userPreferences.update(existing.id, {
        ...data,
        updatedAt: now(),
      });
      return updated!;
    }
    const pref: UserPreference = {
      id: generateId(),
      userId,
      ...data,
      updatedAt: now(),
    };
    this.userPreferences.unshift(pref);
    return pref;
  }

  getUserPreference(userId: string): UserPreference | undefined {
    return this.userPreferences.find((p) => p.userId === userId);
  }

  addVaccineRecord(data: Omit<VaccineRecord, 'id' | 'createdAt'>): VaccineRecord {
    const record: VaccineRecord = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.vaccines.unshift(record);
    return record;
  }

  getVaccinesByPet(petId: string): VaccineRecord[] {
    return this.vaccines
      .filter((v) => v.petId === petId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  addDewormingRecord(data: Omit<DewormingRecord, 'id' | 'createdAt'>): DewormingRecord {
    const record: DewormingRecord = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.dewormings.unshift(record);
    return record;
  }

  getDewormingsByPet(petId: string): DewormingRecord[] {
    return this.dewormings
      .filter((d) => d.petId === petId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  addHealthCheckup(data: Omit<HealthCheckup, 'id' | 'createdAt'>): HealthCheckup {
    const checkup: HealthCheckup = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.healthCheckups.unshift(checkup);
    return checkup;
  }

  getHealthCheckupsByPet(petId: string): HealthCheckup[] {
    return this.healthCheckups
      .filter((c) => c.petId === petId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  createFollowUpTask(application: Application): FollowUpTask {
    const adoptionDate = application.reviewedAt || application.createdAt;
    const due = new Date(adoptionDate);
    due.setDate(due.getDate() + 30);

    const task: FollowUpTask = {
      id: generateId(),
      applicationId: application.id,
      petId: application.petId,
      petName: application.petName,
      petPhoto: application.petPhoto,
      adopterId: application.applicantId,
      adopterName: application.applicantName,
      adoptionDate,
      dueDate: due.toISOString(),
      status: 'pending',
      createdAt: now(),
    };
    this.followUpTasks.unshift(task);
    return task;
  }

  refreshFollowUpStatuses(): void {
    const nowTime = new Date();
    for (let i = 0; i < this.followUpTasks.length; i++) {
      const task = this.followUpTasks[i];
      if (task.status === 'pending' && new Date(task.dueDate) < nowTime) {
        task.status = 'overdue';
      }
    }
  }

  getFollowUpTasksByAdopter(adopterId: string): FollowUpTask[] {
    this.refreshFollowUpStatuses();
    return this.followUpTasks
      .filter((t) => t.adopterId === adopterId)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .map(t => ({
        ...t,
        report: t.reportId ? this.followUpReports.find(r => r.id === t.reportId) : undefined,
      }));
  }

  getAllFollowUpTasks(): FollowUpTask[] {
    this.refreshFollowUpStatuses();
    return [...this.followUpTasks]
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .map(t => ({
        ...t,
        report: t.reportId ? this.followUpReports.find(r => r.id === t.reportId) : undefined,
      }));
  }

  submitFollowUpReport(taskId: string, data: {
    description: string;
    photoUrls: string[];
    healthStatus: HealthStatus;
    adopterId: string;
  }): FollowUpReport | null {
    const task = this.followUpTasks.find((t) => t.id === taskId);
    if (!task) return null;

    const report: FollowUpReport = {
      id: generateId(),
      taskId,
      petId: task.petId,
      adopterId: data.adopterId,
      description: data.description,
      photoUrls: data.photoUrls,
      healthStatus: data.healthStatus,
      submittedAt: now(),
    };
    this.followUpReports.unshift(report);
    this.followUpTasks.update(taskId, { status: 'submitted', reportId: report.id });
    return report;
  }

  getFollowUpReport(taskId: string): FollowUpReport | undefined {
    return this.followUpReports.find((r) => r.taskId === taskId);
  }

  registerLostPet(data: Omit<LostPet, 'id' | 'status' | 'sightingCount' | 'createdAt'>): LostPet {
    const lost: LostPet = {
      ...data,
      id: generateId(),
      status: 'lost',
      sightingCount: 0,
      createdAt: now(),
    };
    this.lostPets.unshift(lost);
    return lost;
  }

  markLostPetFound(lostPetId: string): LostPet | null {
    const pet = this.lostPets.find((p) => p.id === lostPetId);
    if (!pet) return null;
    pet.status = 'found';
    pet.foundAt = now();
    return pet;
  }

  getLostPets(status?: LostPetStatus): LostPet[] {
    let result = [...this.lostPets];
    if (status) {
      result = result.filter((p) => p.status === status);
    }
    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return result;
  }

  addLostPetSighting(data: Omit<LostPetSighting, 'id' | 'createdAt'>): LostPetSighting {
    const sighting: LostPetSighting = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.lostPetSightings.unshift(sighting);

    const lost = this.lostPets.find((p) => p.id === data.lostPetId);
    if (lost) {
      lost.sightingCount += 1;
    }
    return sighting;
  }

  getSightingsByLostPet(lostPetId: string): LostPetSighting[] {
    return this.lostPetSightings
      .filter((s) => s.lostPetId === lostPetId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  createCommunityPost(data: Omit<CommunityPost, 'id' | 'likeCount' | 'commentCount' | 'likedBy' | 'isLiked' | 'createdAt'>): CommunityPost {
    const post: CommunityPost = {
      ...data,
      id: generateId(),
      likeCount: 0,
      commentCount: 0,
      likedBy: [],
      isLiked: false,
      createdAt: now(),
    };
    this.communityPosts.unshift(post);
    return post;
  }

  getCommunityPosts(sort: 'newest' | 'hot' = 'newest', currentUserId?: string, tag?: PostTag): CommunityPost[] {
    let result = [...this.communityPosts];
    if (tag) {
      result = result.filter((p) => p.tags.includes(tag));
    }
    if (currentUserId) {
      const followedUserIds = this.userFollows
        .filter((f) => f.followerId === currentUserId)
        .map((f) => f.followingId);
      result = result.map((p) => ({
        ...p,
        isLiked: this.postLikes.some((l) => l.postId === p.id && l.userId === currentUserId),
        likedBy: this.postLikes.filter((l) => l.postId === p.id).map((l) => l.userId),
        _isFollowing: followedUserIds.includes(p.authorId),
      } as CommunityPost & { _isFollowing: boolean }));
      result.sort((a, b) => {
        const af = (a as CommunityPost & { _isFollowing: boolean })._isFollowing ? 1 : 0;
        const bf = (b as CommunityPost & { _isFollowing: boolean })._isFollowing ? 1 : 0;
        if (af !== bf) return bf - af;
        if (sort === 'hot') {
          return (b.likeCount + b.commentCount * 2) - (a.likeCount + a.commentCount * 2)
            || b.createdAt.localeCompare(a.createdAt);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
    } else if (sort === 'hot') {
      result.sort((a, b) => (b.likeCount + b.commentCount * 2) - (a.likeCount + a.commentCount * 2)
        || b.createdAt.localeCompare(a.createdAt));
    } else {
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    result = result.map(p => {
      const lp = this.postLikes.filter(l => l.postId === p.id).map(l => l.userId);
      return { ...p, likedBy: lp };
    });
    return result.map(({ _isFollowing, ...rest }: CommunityPost & { _isFollowing?: boolean }) => rest as CommunityPost);
  }

  likeCommunityPost(postId: string, userId: string): CommunityPost | null {
    const post = this.communityPosts.find((p) => p.id === postId);
    if (!post) return null;
    const existing = this.postLikes.find((l) => l.postId === postId && l.userId === userId);
    if (existing) {
      const idx = this.postLikes.findIndex((l) => l.id === existing.id);
      if (idx !== -1) this.postLikes.splice(idx, 1);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      this.postLikes.unshift({
        id: generateId(),
        postId,
        userId,
        createdAt: now(),
      });
      post.likeCount += 1;
    }
    post.likedBy = this.postLikes.filter(l => l.postId === post.id).map(l => l.userId);
    return post;
  }

  addPostComment(data: Omit<PostComment, 'id' | 'createdAt'>): PostComment {
    const comment: PostComment = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.postComments.unshift(comment);
    const post = this.communityPosts.find((p) => p.id === data.postId);
    if (post) {
      post.commentCount += 1;
    }
    return comment;
  }

  getPostComments(postId: string): PostComment[] {
    return this.postComments
      .filter((c) => c.postId === postId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  followUser(followerId: string, followingId: string): UserFollow | null {
    if (followerId === followingId) return null;
    if (this.userFollows.some((f) => f.followerId === followerId && f.followingId === followingId)) {
      return null;
    }
    const uf: UserFollow = {
      id: generateId(),
      followerId,
      followingId,
      createdAt: now(),
    };
    this.userFollows.unshift(uf);
    return uf;
  }

  unfollowUser(followerId: string, followingId: string): boolean {
    const idx = this.userFollows.findIndex((f) => f.followerId === followerId && f.followingId === followingId);
    if (idx === -1) return false;
    this.userFollows.splice(idx, 1);
    return true;
  }

  isFollowingUser(followerId: string, followingId: string): boolean {
    return this.userFollows.some((f) => f.followerId === followerId && f.followingId === followingId);
  }

  getFollowingIds(followerId: string): string[] {
    return this.userFollows
      .filter((f) => f.followerId === followerId)
      .map((f) => f.followingId);
  }

  registerCaregiver(data: Omit<BoardingCaregiver, 'id' | 'status' | 'createdAt' | 'totalOrders' | 'averageRating'>): BoardingCaregiver {
    const existing = this.boardingCaregivers.find(c => c.userId === data.userId);
    if (existing) {
      return this.boardingCaregivers.update(existing.id, { ...data, status: 'pending' }) || existing;
    }
    const caregiver: BoardingCaregiver = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: now(),
      totalOrders: 0,
      averageRating: 0,
    };
    this.boardingCaregivers.unshift(caregiver);
    return caregiver;
  }

  getCaregiverByUser(userId: string): BoardingCaregiver | undefined {
    return this.boardingCaregivers.find(c => c.userId === userId);
  }

  getCaregiverById(id: string): BoardingCaregiver | undefined {
    return this.boardingCaregivers.getById(id);
  }

  getAllCaregivers(status?: CaregiverStatus): BoardingCaregiver[] {
    let result = [...this.boardingCaregivers];
    if (status) {
      result = result.filter(c => c.status === status);
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  reviewCaregiver(id: string, approved: boolean, reviewNote?: string): BoardingCaregiver | null {
    const caregiver = this.boardingCaregivers.getById(id);
    if (!caregiver) return null;
    return this.boardingCaregivers.update(id, {
      status: approved ? 'approved' : 'rejected',
      reviewNote,
      reviewedAt: now(),
    }) || null;
  }

  updateCaregiverAvailability(id: string, availableDates: string[]): BoardingCaregiver | null {
    return this.boardingCaregivers.update(id, { availableDates }) || null;
  }

  createBoardingRequest(data: Omit<BoardingRequest, 'id' | 'status' | 'createdAt'>): BoardingRequest {
    const request: BoardingRequest = {
      ...data,
      id: generateId(),
      status: 'open',
      createdAt: now(),
    };
    this.boardingRequests.unshift(request);
    return request;
  }

  getBoardingRequestsByOwner(ownerId: string): BoardingRequest[] {
    return this.boardingRequests
      .filter(r => r.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getAllBoardingRequests(status?: BoardingRequest['status']): BoardingRequest[] {
    let result = [...this.boardingRequests];
    if (status) {
      result = result.filter(r => r.status === status);
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getBoardingRequestById(id: string): BoardingRequest | undefined {
    return this.boardingRequests.getById(id);
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  private isDateInRange(dateStr: string, startStr: string, endStr: string): boolean {
    const date = new Date(dateStr);
    const start = new Date(startStr);
    const end = new Date(endStr);
    return date >= start && date <= end;
  }

  private datesOverlap(dates: string[], start: string, end: string): boolean {
    return dates.some(d => this.isDateInRange(d, start, end));
  }

  calculateCaregiverMatchScore(caregiver: BoardingCaregiver, request: BoardingRequest): number {
    let score = 0;

    if (!caregiver.acceptedSpecies.includes(request.petSpecies)) return 0;

    const requestStart = new Date(request.startDate);
    const requestEnd = new Date(request.endDate);
    const allDatesAvailable = caregiver.availableDates.some(d => {
      const dt = new Date(d);
      return dt >= requestStart && dt <= requestEnd;
    });
    if (!allDatesAvailable && caregiver.availableDates.length > 0) {
      score -= 20;
    } else {
      score += 25;
    }

    if (caregiver.pricePerDay >= request.budgetMin && caregiver.pricePerDay <= request.budgetMax) {
      score += 30;
    } else if (caregiver.pricePerDay < request.budgetMin) {
      score += 20;
    } else if (caregiver.pricePerDay <= request.budgetMax * 1.2) {
      score += 10;
    } else {
      score -= 30;
    }

    score += Math.min(caregiver.petExperienceYears * 2, 20);
    score += caregiver.averageRating * 3;

    if (caregiver.hasYard && (request.petSpecies === 'dog')) {
      score += 10;
    }

    if (caregiver.livingArea >= 80) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  findMatchingCaregivers(requestId: string): BoardingCaregiverWithScore[] {
    const request = this.boardingRequests.getById(requestId);
    if (!request) return [];

    const approvedCaregivers = this.boardingCaregivers.filter(c => c.status === 'approved');

    const scored: BoardingCaregiverWithScore[] = approvedCaregivers.map(c => ({
      ...c,
      matchScore: this.calculateCaregiverMatchScore(c, request),
    }));

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.filter(c => c.matchScore > 0);
  }

  createBoardingOrder(data: {
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
    pricePerDay: number;
    handoverNotes: string;
    extraFees?: number;
    discount?: number;
  }): BoardingOrder {
    const days = this.calculateDays(data.startDate, data.endDate);
    const baseFee = days * data.pricePerDay;
    const extraFees = data.extraFees || 0;
    const discount = data.discount || 0;
    const totalAmount = baseFee + extraFees - discount;

    const order: BoardingOrder = {
      id: generateId(),
      requestId: data.requestId,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      caregiverId: data.caregiverId,
      caregiverName: data.caregiverName,
      caregiverAvatar: data.caregiverAvatar,
      petId: data.petId,
      petName: data.petName,
      petPhoto: data.petPhoto,
      startDate: data.startDate,
      endDate: data.endDate,
      boardingMethod: data.boardingMethod,
      cost: { baseFee, extraFees, discount, totalAmount, days },
      handoverNotes: data.handoverNotes,
      status: 'pending_confirm',
      createdAt: now(),
    };
    this.boardingOrders.unshift(order);

    this.boardingRequests.update(data.requestId, { status: 'matched' });

    return order;
  }

  getBoardingOrdersByOwner(ownerId: string): BoardingOrder[] {
    return this.boardingOrders
      .filter(o => o.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getBoardingOrdersByCaregiver(caregiverId: string): BoardingOrder[] {
    return this.boardingOrders
      .filter(o => o.caregiverId === caregiverId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getAllBoardingOrders(status?: BoardingOrderStatus): BoardingOrder[] {
    let result = [...this.boardingOrders];
    if (status) {
      result = result.filter(o => o.status === status);
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getBoardingOrderById(id: string): BoardingOrder | undefined {
    return this.boardingOrders.getById(id);
  }

  updateBoardingOrderStatus(id: string, status: BoardingOrderStatus, disputeReason?: string): BoardingOrder | null {
    const order = this.boardingOrders.getById(id);
    if (!order) return null;

    const updates: Partial<BoardingOrder> = { status };
    const nowTime = now();
    if (status === 'confirmed') updates.confirmedAt = nowTime;
    if (status === 'in_progress') updates.startedAt = nowTime;
    if (status === 'completed') {
      updates.completedAt = nowTime;
      const caregiver = this.boardingCaregivers.getById(order.caregiverId);
      if (caregiver) {
        const newTotal = caregiver.totalOrders + 1;
        this.boardingCaregivers.update(caregiver.id, { totalOrders: newTotal });
      }
    }
    if (status === 'cancelled') updates.cancelledAt = nowTime;
    if (status === 'disputed' && disputeReason) updates.disputeReason = disputeReason;

    return this.boardingOrders.update(id, updates) || null;
  }

  markOrderDisputed(id: string, reason: string): BoardingOrder | null {
    return this.updateBoardingOrderStatus(id, 'disputed', reason);
  }

  addBoardingDiary(data: Omit<BoardingDiary, 'id' | 'createdAt'>): BoardingDiary {
    const diary: BoardingDiary = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.boardingDiaries.unshift(diary);
    return diary;
  }

  getDiariesByOrder(orderId: string): BoardingDiary[] {
    return this.boardingDiaries
      .filter(d => d.orderId === orderId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  addBoardingReview(data: Omit<BoardingReview, 'id' | 'createdAt'>): BoardingReview {
    const review: BoardingReview = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.boardingReviews.unshift(review);

    const caregiver = this.boardingCaregivers.find(c => c.userId === data.targetUserId);
    if (caregiver) {
      const allReviews = this.boardingReviews.filter(r => r.targetUserId === data.targetUserId);
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      this.boardingCaregivers.update(caregiver.id, { averageRating: Number(avg.toFixed(1)) });
    }

    return review;
  }

  getReviewsByOrder(orderId: string): BoardingReview[] {
    return this.boardingReviews
      .filter(r => r.orderId === orderId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getReviewsByUser(userId: string): BoardingReview[] {
    return this.boardingReviews
      .filter(r => r.targetUserId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getCaregiverIncomeStats(caregiverUserId: string): CaregiverIncomeStats[] {
    const caregiver = this.boardingCaregivers.find(c => c.userId === caregiverUserId);
    if (!caregiver) return [];

    const orders = this.boardingOrders.filter(
      o => o.caregiverId === caregiver.id && o.status === 'completed'
    );

    const monthlyMap = new Map<string, CaregiverIncomeStats>();

    orders.forEach(order => {
      const date = new Date(order.completedAt || order.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existing = monthlyMap.get(month) || { month, orders: 0, income: 0, rating: 0 };
      existing.orders += 1;
      existing.income += order.cost.totalAmount;
      monthlyMap.set(month, existing);
    });

    const result: CaregiverIncomeStats[] = [];
    monthlyMap.forEach((value, key) => {
      result.push({ ...value, rating: caregiver.averageRating });
    });

    return result.sort((a, b) => b.month.localeCompare(a.month));
  }

  getBoardingStats(): BoardingStats {
    const monthlyMap = new Map<string, { count: number; revenue: number }>();
    const speciesMap = new Map<string, number>();

    this.boardingOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(month) || { count: 0, revenue: 0 };
      existing.count += 1;
      if (order.status === 'completed') {
        existing.revenue += order.cost.totalAmount;
      }
      monthlyMap.set(month, existing);

      const request = this.boardingRequests.getById(order.requestId);
      if (request) {
        speciesMap.set(request.petSpecies, (speciesMap.get(request.petSpecies) || 0) + 1);
      }
    });

    const monthlyOrders: { month: string; count: number; revenue: number }[] = [];
    monthlyMap.forEach((value, key) => {
      monthlyOrders.push({ month: key, ...value });
    });
    monthlyOrders.sort((a, b) => a.month.localeCompare(b.month));

    const speciesDistribution: { species: Species; count: number }[] = [];
    speciesMap.forEach((count, species) => {
      speciesDistribution.push({ species: species as Species, count });
    });

    const totalRevenue = this.boardingOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.cost.totalAmount, 0);

    return {
      monthlyOrders,
      speciesDistribution,
      activeCaregivers: this.boardingCaregivers.filter(c => c.status === 'approved').length,
      totalRevenue,
      totalOrders: this.boardingOrders.length,
      pendingCaregivers: this.boardingCaregivers.filter(c => c.status === 'pending').length,
      disputedOrders: this.boardingOrders.filter(o => o.status === 'disputed').length,
    };
  }

  getAdoptedPetsByUser(userId: string): Pet[] {
    const approvedApps = this.applications.filter(
      a => a.applicantId === userId && a.status === 'approved'
    );
    const petIds = approvedApps.map(a => a.petId);
    return this.pets.filter(p => petIds.includes(p.id));
  }
}

export const store = MockStore.getInstance();
