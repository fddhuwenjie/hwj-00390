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
  InsurancePolicy,
  InsuranceClaim,
  InsurancePlanType,
  InsuranceClaimStatus,
  TrainingCourse,
  CaregiverCourseProgress,
  CaregiverCertLevel,
  PetLocationRecord,
  GeoFence,
  GeoFenceAlert,
  BoardingAgreement,
  AgreementStatus,
  BoardingDashboardStats,
  TrainingCourseStatus,
  TrainingQuiz,
  BoardingCaregiverExtended,
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

  insurancePolicies: Collection<InsurancePolicy> = new Collection<InsurancePolicy>();
  insuranceClaims: Collection<InsuranceClaim> = new Collection<InsuranceClaim>();
  trainingCourses: Collection<TrainingCourse> = new Collection<TrainingCourse>();
  caregiverCourseProgress: Collection<CaregiverCourseProgress> = new Collection<CaregiverCourseProgress>();
  petLocationRecords: Collection<PetLocationRecord> = new Collection<PetLocationRecord>();
  geoFences: Collection<GeoFence> = new Collection<GeoFence>();
  geoFenceAlerts: Collection<GeoFenceAlert> = new Collection<GeoFenceAlert>();
  boardingAgreements: Collection<BoardingAgreement> = new Collection<BoardingAgreement>();

  private static instance: MockStore;

  static DEFAULT_TRAINING_COURSES: TrainingCourse[] = [
    {
      id: 'tc-001',
      title: '宠物急救',
      description: '学习宠物常见急症的识别与急救处理，包括心肺复苏、止血、中毒处理等关键技能',
      icon: '🚑',
      durationMinutes: 45,
      quizzes: [
        { id: 'q1-1', question: '宠物发生窒息时，首先应该做什么？', options: ['等待观察', '尝试清除异物并进行急救', '直接送医院', '给宠物喝水'], correctIndex: 1 },
        { id: 'q1-2', question: '宠物外伤出血时，最有效的紧急止血方法是？', options: ['冰敷', '压迫止血', '涂抹药膏', '用绳子捆扎'], correctIndex: 1 },
        { id: 'q1-3', question: '怀疑宠物中毒，以下哪项是正确的？', options: ['立即催吐', '保留可疑物品并尽快送医', '给宠物大量饮水', '观察几小时再说'], correctIndex: 1 },
        { id: 'q1-4', question: '进行心肺复苏时，按压频率大约是？', options: ['30次/分钟', '60次/分钟', '100-120次/分钟', '200次/分钟'], correctIndex: 2 },
      ],
    },
    {
      id: 'tc-002',
      title: '营养喂养',
      description: '掌握宠物科学喂养知识，了解不同阶段营养需求、食材选择和喂食禁忌',
      icon: '🍖',
      durationMinutes: 40,
      quizzes: [
        { id: 'q2-1', question: '以下哪种食物对犬猫是有毒的？', options: ['鸡肉', '葡萄', '胡萝卜', '米饭'], correctIndex: 1 },
        { id: 'q2-2', question: '幼犬每日喂食次数通常建议为？', options: ['1次', '2次', '3-4次', '随时都可以吃'], correctIndex: 2 },
        { id: 'q2-3', question: '宠物最主要的营养来源应该是？', options: ['人类剩菜', '优质商业宠物粮', '自制生肉', '零食'], correctIndex: 1 },
        { id: 'q2-4', question: '以下关于换粮的说法，正确的是？', options: ['直接突然换', '逐渐过渡7-10天', '新旧粮各一半即可', '不需要过渡期'], correctIndex: 1 },
        { id: 'q2-5', question: '宠物必需的营养成分不包括？', options: ['蛋白质', '脂肪', '碳水化合物', '膳食纤维'], correctIndex: 3 },
      ],
    },
    {
      id: 'tc-003',
      title: '行为管理',
      description: '了解宠物常见行为问题的成因与矫正方法，建立良好的人宠沟通',
      icon: '🐾',
      durationMinutes: 50,
      quizzes: [
        { id: 'q3-1', question: '正面强化训练的核心是？', options: ['惩罚错误行为', '奖励期望的行为', '忽视所有行为', '体罚'], correctIndex: 1 },
        { id: 'q3-2', question: '狗狗出现拆家行为，最可能的原因是？', options: ['报复主人', '精力过剩或焦虑', '饿了', '天气原因'], correctIndex: 1 },
        { id: 'q3-3', question: '以下哪种方法有助于减少分离焦虑？', options: ['出门前做告别仪式', '建立出门的固定程序', '回家后立即安抚', '惩罚宠物的焦虑行为'], correctIndex: 1 },
        { id: 'q3-4', question: '宠物行为矫正训练应遵循的原则是？', options: ['短时多次', '长时集中', '一次到位', '只在出现问题时训练'], correctIndex: 0 },
      ],
    },
    {
      id: 'tc-004',
      title: '基础护理',
      description: '学习宠物日常护理技能，包括梳毛、洗澡、修剪指甲、清洁耳道等',
      icon: '🛁',
      durationMinutes: 35,
      quizzes: [
        { id: 'q4-1', question: '给宠物洗澡的正确水温约为？', options: ['冷水', '30-35℃', '37-40℃', '45℃以上'], correctIndex: 2 },
        { id: 'q4-2', question: '修剪指甲时应避免剪到？', options: ['指甲尖', '血线', '指甲根部', '肉垫'], correctIndex: 1 },
        { id: 'q4-3', question: '宠物牙齿护理，正确的做法是？', options: ['不需要护理', '定期刷牙', '只用咬胶', '吃软粮即可'], correctIndex: 1 },
        { id: 'q4-4', question: '耳道清洁的频率一般建议是？', options: ['每天', '每周1-2次', '每月1次', '有问题时才清洁'], correctIndex: 1 },
      ],
    },
    {
      id: 'tc-005',
      title: '心理健康',
      description: '关注宠物心理健康，识别压力信号，提供情感支持和环境丰富化',
      icon: '💚',
      durationMinutes: 30,
      quizzes: [
        { id: 'q5-1', question: '以下哪个是宠物压力信号？', options: ['摇尾巴', '打哈欠、舔鼻子', '趴下休息', '玩玩具'], correctIndex: 1 },
        { id: 'q5-2', question: '环境丰富化的目的是？', options: ['装饰家居', '提供宠物精神刺激和活动', '让环境更干净', '吸引客人注意'], correctIndex: 1 },
        { id: 'q5-3', question: '宠物出现过度舔毛（非皮肤病原因）可能是？', options: ['正常现象', '压力或焦虑的表现', '太无聊', '习惯问题'], correctIndex: 1 },
      ],
    },
  ];

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
    insurancePlan?: InsurancePlanType;
  }): BoardingOrder {
    const days = this.calculateDays(data.startDate, data.endDate);
    const baseFee = days * data.pricePerDay;
    const extraFees = data.extraFees || 0;
    const discount = data.discount || 0;
    const insurancePlan = data.insurancePlan || 'basic';
    const premiumPerDay = insurancePlan === 'comprehensive' ? 12 : 5;
    const insuranceFee = days * premiumPerDay;
    const totalAmount = baseFee + extraFees + insuranceFee - discount;

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
      cost: { baseFee, insuranceFee, extraFees, discount, totalAmount, days },
      handoverNotes: data.handoverNotes,
      status: 'pending_confirm',
      insurancePlan,
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

  createInsurancePolicy(orderId: string, planType: InsurancePlanType): InsurancePolicy {
    const order = this.boardingOrders.getById(orderId);
    const days = order ? this.calculateDays(order.startDate, order.endDate) : 1;
    const premiumPerDay = planType === 'comprehensive' ? 12 : 5;
    const totalPremium = days * premiumPerDay;
    const maxPayout = planType === 'comprehensive' ? 5000 : 2000;

    const policy: InsurancePolicy = {
      id: generateId(),
      orderId,
      planType,
      premiumPerDay,
      totalPremium,
      maxPayout,
      startDate: order?.startDate || now(),
      endDate: order?.endDate || now(),
      createdAt: now(),
    };
    this.insurancePolicies.unshift(policy);
    return policy;
  }

  getInsurancePolicyByOrder(orderId: string): InsurancePolicy | undefined {
    return this.insurancePolicies.find(p => p.orderId === orderId);
  }

  createInsuranceClaim(data: Omit<InsuranceClaim, 'id' | 'status' | 'createdAt'>): InsuranceClaim {
    const claim: InsuranceClaim = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: now(),
    };
    this.insuranceClaims.unshift(claim);
    return claim;
  }

  getInsuranceClaimsByOrder(orderId: string): InsuranceClaim[] {
    return this.insuranceClaims
      .filter(c => c.orderId === orderId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getAllInsuranceClaims(status?: InsuranceClaimStatus): InsuranceClaim[] {
    let result = [...this.insuranceClaims];
    if (status) {
      result = result.filter(c => c.status === status);
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  reviewInsuranceClaim(claimId: string, approved: boolean, reviewNote?: string): InsuranceClaim | null {
    const claim = this.insuranceClaims.getById(claimId);
    if (!claim) return null;
    return this.insuranceClaims.update(claimId, {
      status: approved ? 'approved' : 'rejected',
      reviewNote,
      reviewedAt: now(),
    }) || null;
  }

  markClaimPaid(claimId: string): InsuranceClaim | null {
    return this.insuranceClaims.update(claimId, {
      status: 'paid',
      paidAt: now(),
    }) || null;
  }

  getAllTrainingCourses(): TrainingCourse[] {
    if (this.trainingCourses.length === 0) {
      MockStore.DEFAULT_TRAINING_COURSES.forEach(course => {
        this.trainingCourses.create(course);
      });
    }
    return [...this.trainingCourses];
  }

  getTrainingCourse(id: string): TrainingCourse | undefined {
    this.getAllTrainingCourses();
    return this.trainingCourses.getById(id);
  }

  getCaregiverCourseProgress(caregiverId: string): CaregiverCourseProgress[] {
    return this.caregiverCourseProgress.filter(p => p.caregiverId === caregiverId);
  }

  completeTrainingCourse(caregiverId: string, courseId: string, score: number): CaregiverCourseProgress {
    const existing = this.caregiverCourseProgress.find(p => p.caregiverId === caregiverId && p.courseId === courseId);
    if (existing) {
      return this.caregiverCourseProgress.update(existing.id, {
        status: 'completed',
        score,
        completedAt: now(),
      }) || existing;
    }
    const progress: CaregiverCourseProgress = {
      id: generateId(),
      caregiverId,
      courseId,
      status: 'completed',
      score,
      completedAt: now(),
    };
    this.caregiverCourseProgress.unshift(progress);
    return progress;
  }

  calculateCaregiverCertLevel(caregiverId: string): CaregiverCertLevel {
    const caregiver = this.boardingCaregivers.getById(caregiverId);
    if (!caregiver) return 'junior';

    const totalOrders = caregiver.totalOrders;
    const avgRating = caregiver.averageRating;
    const completedCourses = this.caregiverCourseProgress.filter(
      p => p.caregiverId === caregiverId && p.status === 'completed'
    ).length;

    const meetsSenior = totalOrders >= 50 && avgRating >= 4.7 && completedCourses >= 5;
    const meetsIntermediate = totalOrders >= 20 && avgRating >= 4.3 && completedCourses >= 3;
    const meetsJunior = totalOrders >= 5 && avgRating >= 4.0 && completedCourses >= 1;

    if (meetsSenior) return 'senior';
    if (meetsIntermediate) return 'intermediate';
    if (meetsJunior) return 'junior';
    return 'junior';
  }

  getCaregiverExtended(caregiverId: string): BoardingCaregiverExtended | undefined {
    const caregiver = this.boardingCaregivers.getById(caregiverId);
    if (!caregiver) return undefined;

    const certLevel = this.calculateCaregiverCertLevel(caregiverId);
    const completedCourses = this.caregiverCourseProgress.filter(
      p => p.caregiverId === caregiverId && p.status === 'completed'
    ).length;

    let maxPriceMultiplier = 1.0;
    if (certLevel === 'intermediate') maxPriceMultiplier = 1.2;
    if (certLevel === 'senior') maxPriceMultiplier = 1.5;

    return {
      ...caregiver,
      certLevel,
      completedCourses,
      isPriorityRecommended: certLevel !== 'junior',
      maxPriceMultiplier,
    };
  }

  getAllCaregiversExtended(status?: CaregiverStatus): BoardingCaregiverExtended[] {
    let caregivers = [...this.boardingCaregivers];
    if (status) {
      caregivers = caregivers.filter(c => c.status === status);
    }
    return caregivers
      .map(c => this.getCaregiverExtended(c.id))
      .filter((c): c is BoardingCaregiverExtended => c !== undefined)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  addPetLocation(data: Omit<PetLocationRecord, 'id' | 'createdAt'>): PetLocationRecord {
    const record: PetLocationRecord = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.petLocationRecords.unshift(record);
    return record;
  }

  getLocationsByOrder(orderId: string): PetLocationRecord[] {
    return this.petLocationRecords
      .filter(l => l.orderId === orderId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  getLocationsByOrderAndDate(orderId: string, date: string): PetLocationRecord[] {
    return this.petLocationRecords
      .filter(l => l.orderId === orderId && l.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  createGeoFence(data: Omit<GeoFence, 'id' | 'createdAt'>): GeoFence {
    const fence: GeoFence = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.geoFences.unshift(fence);
    return fence;
  }

  getGeoFenceByOrder(orderId: string): GeoFence | undefined {
    return this.geoFences.find(f => f.orderId === orderId);
  }

  checkGeoFenceBreach(location: { latitude: number; longitude: number }, fence: GeoFence): boolean {
    const R = 6371000;
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const dLat = toRad(location.latitude - fence.centerLatitude);
    const dLon = toRad(location.longitude - fence.centerLongitude);
    const lat1 = toRad(fence.centerLatitude);
    const lat2 = toRad(location.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance > fence.radiusMeters;
  }

  createGeoFenceAlert(data: Omit<GeoFenceAlert, 'id' | 'createdAt'>): GeoFenceAlert {
    const alert: GeoFenceAlert = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    this.geoFenceAlerts.unshift(alert);
    return alert;
  }

  getAlertsByOrder(orderId: string): GeoFenceAlert[] {
    return this.geoFenceAlerts
      .filter(a => a.orderId === orderId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  generateAgreementHtml(order: BoardingOrder, request: BoardingRequest): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>宠物寄养服务协议</title>
  <style>
    body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; padding: 40px; color: #333; }
    h1 { text-align: center; font-size: 24px; margin-bottom: 30px; color: #1a1a1a; }
    h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; color: #2d5016; border-bottom: 2px solid #a3d977; padding-bottom: 6px; }
    .section { margin-bottom: 20px; line-height: 1.8; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px dashed #e5e5e5; }
    .info-label { width: 120px; color: #666; flex-shrink: 0; }
    .info-value { flex: 1; color: #1a1a1a; font-weight: 500; }
    .clause { padding: 10px 15px; background: #f9f9f9; border-left: 4px solid #a3d977; margin: 10px 0; border-radius: 0 6px 6px 0; }
    .signature { display: flex; justify-content: space-between; margin-top: 60px; }
    .sig-block { text-align: center; width: 45%; }
    .sig-line { border-bottom: 1px solid #333; margin-top: 40px; padding-bottom: 8px; }
    .date { color: #999; font-size: 14px; }
  </style>
</head>
<body>
  <h1>宠物寄养服务协议</h1>

  <h2>一、双方信息</h2>
  <div class="section">
    <h3 style="font-size: 16px; color: #444;">宠物主人</h3>
    <div class="info-row"><div class="info-label">姓名：</div><div class="info-value">${order.ownerName}</div></div>
    <div class="info-row"><div class="info-label">用户ID：</div><div class="info-value">${order.ownerId}</div></div>
    <div class="info-row"><div class="info-label">紧急联系人：</div><div class="info-value">${request.emergencyContact || '无'}</div></div>
    <h3 style="font-size: 16px; color: #444; margin-top: 16px;">寄养人</h3>
    <div class="info-row"><div class="info-label">姓名：</div><div class="info-value">${order.caregiverName}</div></div>
    <div class="info-row"><div class="info-label">用户ID：</div><div class="info-value">${order.caregiverId}</div></div>
  </div>

  <h2>二、宠物信息</h2>
  <div class="section">
    <div class="info-row"><div class="info-label">宠物姓名：</div><div class="info-value">${order.petName}</div></div>
    <div class="info-row"><div class="info-label">物种：</div><div class="info-value">${request.petSpecies}</div></div>
    <div class="info-row"><div class="info-label">宠物ID：</div><div class="info-value">${order.petId}</div></div>
    <div class="info-row"><div class="info-label">饮食偏好：</div><div class="info-value">${request.specialCare.dietPreference || '无特殊要求'}</div></div>
    <div class="info-row"><div class="info-label">用药说明：</div><div class="info-value">${request.specialCare.medication || '无'}</div></div>
    <div class="info-row"><div class="info-label">注意事项：</div><div class="info-value">${request.specialCare.restrictions || '无'}</div></div>
  </div>

  <h2>三、服务内容</h2>
  <div class="section">
    <div class="info-row"><div class="info-label">寄养方式：</div><div class="info-value">${order.boardingMethod === 'home_visit' ? '上门照料' : order.boardingMethod === 'foster_home' ? '送至寄养家庭' : '宠物旅馆'}</div></div>
    <div class="info-row"><div class="info-label">开始日期：</div><div class="info-value">${order.startDate}</div></div>
    <div class="info-row"><div class="info-label">结束日期：</div><div class="info-value">${order.endDate}</div></div>
    <div class="info-row"><div class="info-label">寄养天数：</div><div class="info-value">${order.cost.days} 天</div></div>
    <div class="info-row"><div class="info-label">交接说明：</div><div class="info-value">${order.handoverNotes || '无'}</div></div>
  </div>

  <h2>四、费用明细</h2>
  <div class="section">
    <div class="info-row"><div class="info-label">基础费用：</div><div class="info-value">¥${order.cost.baseFee}</div></div>
    <div class="info-row"><div class="info-label">保险费用：</div><div class="info-value">¥${order.cost.insuranceFee}</div></div>
    <div class="info-row"><div class="info-label">其他费用：</div><div class="info-value">¥${order.cost.extraFees}</div></div>
    <div class="info-row"><div class="info-label">优惠折扣：</div><div class="info-value">-¥${order.cost.discount}</div></div>
    <div class="info-row" style="font-weight: 700; font-size: 16px; color: #2d5016;"><div class="info-label">总计金额：</div><div class="info-value">¥${order.cost.totalAmount}</div></div>
  </div>

  <h2>五、免责条款</h2>
  <div class="section">
    <div class="clause">1. 寄养人承诺以善良管理人的注意义务照顾宠物，因不可抗力或宠物自身健康原因导致的意外，寄养人不承担赔偿责任。</div>
    <div class="clause">2. 主人应如实告知宠物的健康状况、性格特点及特殊需求，因隐瞒信息导致的损失由主人承担。</div>
    <div class="clause">3. 寄养期间宠物出现疾病或受伤，寄养人应及时通知主人并协助就医，医疗费用由主人承担。</div>
    <div class="clause">4. 若因主人原因延迟接回宠物，寄养人有权按实际天数加收寄养费用。</div>
    <div class="clause">5. 保险理赔事宜按照保险公司相关条款执行，本平台仅提供协助办理服务。</div>
  </div>

  <h2>六、紧急联系人</h2>
  <div class="section">
    <div class="info-row"><div class="info-label">紧急联系人：</div><div class="info-value">${request.emergencyContact || '未提供'}</div></div>
    <div class="info-row"><div class="info-label">备用联系人：</div><div class="info-value">主人 ${order.ownerName}</div></div>
  </div>

  <div class="signature">
    <div class="sig-block">
      <div>宠物主人签字：</div>
      <div class="sig-line">${order.ownerName}（电子签名）</div>
      <div class="date">签署日期：_____________</div>
    </div>
    <div class="sig-block">
      <div>寄养人签字：</div>
      <div class="sig-line">${order.caregiverName}（电子签名）</div>
      <div class="date">签署日期：_____________</div>
    </div>
  </div>
</body>
</html>`;
  }

  createBoardingAgreement(orderId: string): BoardingAgreement | null {
    const order = this.boardingOrders.getById(orderId);
    if (!order) return null;
    const request = this.boardingRequests.getById(order.requestId);
    if (!request) return null;

    const htmlContent = this.generateAgreementHtml(order, request);
    const agreement: BoardingAgreement = {
      id: generateId(),
      orderId,
      ownerId: order.ownerId,
      ownerName: order.ownerName,
      caregiverId: order.caregiverId,
      caregiverName: order.caregiverName,
      htmlContent,
      status: 'pending_owner',
      createdAt: now(),
    };
    this.boardingAgreements.unshift(agreement);
    return agreement;
  }

  getAgreementByOrder(orderId: string): BoardingAgreement | undefined {
    return this.boardingAgreements.find(a => a.orderId === orderId);
  }

  signAgreement(agreementId: string, signerRole: 'owner' | 'caregiver'): BoardingAgreement | null {
    const agreement = this.boardingAgreements.getById(agreementId);
    if (!agreement) return null;

    const updates: Partial<BoardingAgreement> = {};
    if (signerRole === 'owner') {
      updates.ownerSignedAt = now();
      if (agreement.status === 'pending_owner') {
        updates.status = 'pending_caregiver';
      }
    } else {
      updates.caregiverSignedAt = now();
      if (agreement.status === 'pending_caregiver' || agreement.status === 'pending_owner') {
        updates.status = 'signed';
      }
    }

    if (signerRole === 'owner' && agreement.caregiverSignedAt) {
      updates.status = 'signed';
    }
    if (signerRole === 'caregiver' && agreement.ownerSignedAt) {
      updates.status = 'signed';
    }

    const signed = this.boardingAgreements.update(agreementId, updates);
    if (signed && signed.status === 'signed') {
      this.boardingOrders.update(agreement.orderId, { agreementStatus: 'signed', agreementSignedAt: now() });
    }
    return signed || null;
  }

  rejectAgreement(agreementId: string, reason: string, rejectorRole: 'owner' | 'caregiver'): BoardingAgreement | null {
    const agreement = this.boardingAgreements.getById(agreementId);
    if (!agreement) return null;

    const result = this.boardingAgreements.update(agreementId, {
      status: 'rejected',
      rejectReason: reason,
    });
    if (result) {
      this.boardingOrders.update(agreement.orderId, { agreementStatus: 'rejected' });
    }
    return result || null;
  }

  calculateCancelDeduction(order: BoardingOrder, cancelDate: string): number {
    const start = new Date(order.startDate);
    const cancel = new Date(cancelDate);
    const diffMs = start.getTime() - cancel.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 7) return 0;
    if (diffDays >= 3) return 0.3;
    if (diffDays >= 1) return 0.5;
    return 0.8;
  }

  cancelOrderWithDeduction(orderId: string, cancelDate: string): BoardingOrder | null {
    const order = this.boardingOrders.getById(orderId);
    if (!order) return null;

    const deductionPercentage = this.calculateCancelDeduction(order, cancelDate);
    const result = this.boardingOrders.update(orderId, {
      status: 'cancelled',
      cancelledAt: now(),
      cancelDeductionPercentage: deductionPercentage,
    });
    return result || null;
  }

  getBoardingDashboardStats(): BoardingDashboardStats {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nowYear = today.getFullYear();
    const nowMonth = today.getMonth();

    const activeInProgressOrders = this.boardingOrders.filter(o => o.status === 'in_progress').length;
    const todayNewOrders = this.boardingOrders.filter(o => o.createdAt.split('T')[0] === todayStr).length;

    let monthTotalRevenue = 0;
    this.boardingOrders.forEach(o => {
      if (o.status === 'completed') {
        const completed = new Date(o.completedAt || o.createdAt);
        if (completed.getFullYear() === nowYear && completed.getMonth() === nowMonth) {
          monthTotalRevenue += o.cost.totalAmount;
        }
      }
    });

    const activeCaregiverCount = this.boardingCaregivers.filter(c => c.status === 'approved').length;

    const heatMapData: { month: string; year: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(nowYear, nowMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = `${y}-${String(m + 1).padStart(2, '0')}`;
      let count = 0;
      this.boardingOrders.forEach(o => {
        const od = new Date(o.createdAt);
        if (od.getFullYear() === y && od.getMonth() === m) count++;
      });
      heatMapData.push({ month: label, year: y, count });
    }

    const caregiverOrderMap = new Map<string, { orders: number; revenue: number }>();
    this.boardingOrders.forEach(o => {
      if (o.status === 'completed') {
        const existing = caregiverOrderMap.get(o.caregiverId) || { orders: 0, revenue: 0 };
        existing.orders += 1;
        existing.revenue += o.cost.totalAmount;
        caregiverOrderMap.set(o.caregiverId, existing);
      }
    });

    const topCaregiversArr: { caregiverId: string; orders: number; revenue: number }[] = [];
    caregiverOrderMap.forEach((v, k) => topCaregiversArr.push({ caregiverId: k, ...v }));
    topCaregiversArr.sort((a, b) => b.orders - a.orders);
    const topCaregivers = topCaregiversArr.slice(0, 10).map(item => {
      const c = this.boardingCaregivers.getById(item.caregiverId);
      return {
        caregiverId: item.caregiverId,
        caregiverName: c?.userName || '未知',
        avatar: c?.userAvatar || '',
        orders: item.orders,
        rating: c?.averageRating || 0,
        revenue: item.revenue,
      };
    });

    const speciesCountMap = new Map<string, number>();
    let totalForSpecies = 0;
    this.boardingOrders.forEach(o => {
      const req = this.boardingRequests.getById(o.requestId);
      if (req) {
        speciesCountMap.set(req.petSpecies, (speciesCountMap.get(req.petSpecies) || 0) + 1);
        totalForSpecies++;
      }
    });
    const speciesDistribution: { species: Species; count: number; percentage: number }[] = [];
    speciesCountMap.forEach((count, sp) => {
      speciesDistribution.push({
        species: sp as Species,
        count,
        percentage: totalForSpecies > 0 ? Number(((count / totalForSpecies) * 100).toFixed(1)) : 0,
      });
    });

    const completedOrders = this.boardingOrders.filter(o => o.status === 'completed');
    let totalDays = 0;
    completedOrders.forEach(o => { totalDays += o.cost.days; });
    const avgBoardingDays = completedOrders.length > 0 ? Number((totalDays / completedOrders.length).toFixed(1)) : 0;

    const avgOrderAmountTrend: { month: string; avgAmount: number; avgDays: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(nowYear, nowMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = `${y}-${String(m + 1).padStart(2, '0')}`;
      const monthOrders = completedOrders.filter(o => {
        const od = new Date(o.completedAt || o.createdAt);
        return od.getFullYear() === y && od.getMonth() === m;
      });
      const monthTotalAmount = monthOrders.reduce((s, o) => s + o.cost.totalAmount, 0);
      const monthTotalDays = monthOrders.reduce((s, o) => s + o.cost.days, 0);
      avgOrderAmountTrend.push({
        month: label,
        avgAmount: monthOrders.length > 0 ? Number((monthTotalAmount / monthOrders.length).toFixed(2)) : 0,
        avgDays: monthOrders.length > 0 ? Number((monthTotalDays / monthOrders.length).toFixed(1)) : 0,
      });
    }

    return {
      activeInProgressOrders,
      todayNewOrders,
      monthTotalRevenue,
      activeCaregiverCount,
      heatMapData,
      topCaregivers,
      speciesDistribution,
      avgBoardingDays,
      avgOrderAmountTrend,
    };
  }
}

export const store = MockStore.getInstance();