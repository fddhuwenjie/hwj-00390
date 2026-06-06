import { store } from '../store.js';
import type {
  User,
  Pet,
  Application,
  Story,
  Comment,
  HistoryRecord,
  Favorite,
  Follow,
  Species,
  Gender,
  PersonalityTag,
  ApplicationStatus,
  UserRole,
  PostTag,
  HealthStatus,
} from '../../shared/types.js';
import { ALL_PERSONALITY_TAGS } from '../../shared/types.js';

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinMonths(months: number): string {
  const now = new Date();
  const past = new Date(now);
  past.setMonth(past.getMonth() - months);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime).toISOString();
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = randomInt(min, max);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

const SMALL_DOG_BREEDS = ['泰迪', '博美', '比熊', '柯基'];
const MEDIUM_DOG_BREEDS = ['柴犬', '边境牧羊犬', '萨摩耶'];
const LARGE_DOG_BREEDS = ['金毛寻回犬', '拉布拉多', '哈士奇'];

function generateAgeForSpecies(species: Species): number {
  switch (species) {
    case 'cat':
      return randomFloat(0.2, 18, 1);
    case 'dog':
      return randomFloat(0.2, 15, 1);
    case 'rabbit':
      return randomFloat(0.2, 10, 1);
    case 'bird':
      return randomFloat(0.2, 20, 1);
    case 'other':
      return randomFloat(0.2, 5, 1);
    default:
      return randomFloat(0.2, 10, 1);
  }
}

function generateWeightForPet(species: Species, breed: string): number {
  if (species === 'cat') {
    return randomFloat(3, 7);
  }
  if (species === 'dog') {
    if (SMALL_DOG_BREEDS.includes(breed)) {
      if (breed === '柯基') return randomFloat(8, 14);
      return randomFloat(2, 8);
    }
    if (MEDIUM_DOG_BREEDS.includes(breed)) {
      return randomFloat(10, 25);
    }
    if (LARGE_DOG_BREEDS.includes(breed)) {
      return randomFloat(25, 40);
    }
    return randomFloat(5, 20);
  }
  if (species === 'rabbit') {
    return randomFloat(1, 3);
  }
  if (species === 'bird') {
    return randomFloat(0.02, 1, 2);
  }
  if (species === 'other') {
    if (breed === '仓鼠') return randomFloat(0.05, 0.15, 2);
    if (breed === '龙猫') return randomFloat(0.4, 0.8, 2);
    if (breed === '荷兰猪') return randomFloat(0.7, 1.2, 2);
    if (breed === '刺猬') return randomFloat(0.3, 0.7, 2);
    return randomFloat(0.1, 1.5, 2);
  }
  return randomFloat(1, 10);
}

const CAT_PHOTOS = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600',
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600',
];

const DOG_PHOTOS = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
  'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=600',
  'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=600',
];

const RABBIT_PHOTOS = [
  'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600',
  'https://images.unsplash.com/photo-1535241749838-299277b6305f?w=600',
  'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600',
  'https://images.unsplash.com/photo-1518882605630-8eb582f5d48a?w=600',
];

const BIRD_PHOTOS = [
  'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600',
  'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=600',
  'https://images.unsplash.com/photo-1544923246-77307dd270b5?w=600',
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600',
];

const OTHER_PHOTOS = [
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600',
  'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600',
  'https://images.unsplash.com/photo-1593073600335-9b9ffcc2f562?w=600',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600',
];

const CAT_BREEDS = ['英国短毛猫', '美国短毛猫', '布偶猫', '暹罗猫', '波斯猫', '橘猫', '狸花猫', '缅因猫', '苏格兰折耳猫', '俄罗斯蓝猫'];
const DOG_BREEDS = ['金毛寻回犬', '拉布拉多', '柴犬', '柯基', '哈士奇', '比熊', '泰迪', '边境牧羊犬', '萨摩耶', '博美'];
const RABBIT_BREEDS = ['荷兰垂耳兔', '侏儒兔', '安哥拉兔', '狮子兔'];
const BIRD_BREEDS = ['虎皮鹦鹉', '玄凤鹦鹉', '牡丹鹦鹉', '金丝雀'];
const OTHER_BREEDS = ['仓鼠', '龙猫', '荷兰猪', '刺猬'];

const CAT_NAMES = ['咪咪', '小白', '花花', '橘橘', '灰灰', '豆豆', '团团', '圆圆', '可乐', '奶茶'];
const DOG_NAMES = ['旺财', '豆豆', '大黄', '小黑', '小白', '多多', '乐乐', '球球', '欢欢', 'Lucky'];
const RABBIT_NAMES = ['兔兔', '小白', '灰灰', '跳跳', '棉棉'];
const BIRD_NAMES = ['啾啾', '小黄', '花花', '绿绿', '蓝蓝'];
const OTHER_NAMES = ['团团', '球球', '豆豆', '毛毛'];

function createUsers(): User[] {
  const users: User[] = [
    {
      id: 'user-admin-001',
      name: '管理员小王',
      avatar: '👑',
      role: 'admin' as UserRole,
    },
    {
      id: 'user-pub-001',
      name: '爱心救助站',
      avatar: '🏠',
      role: 'publisher' as UserRole,
    },
    {
      id: 'user-pub-002',
      name: '萌宠之家',
      avatar: '💕',
      role: 'publisher' as UserRole,
    },
    {
      id: 'user-user-001',
      name: '小明同学',
      avatar: '🧑',
      role: 'user' as UserRole,
    },
    {
      id: 'user-user-002',
      name: '爱猫的花花',
      avatar: '👧',
      role: 'user' as UserRole,
    },
  ];
  return users;
}

function createPets(users: User[]): Pet[] {
  const pets: Pet[] = [];
  const publishers = users.filter(u => u.role === 'publisher');

  const speciesConfig: { species: Species; count: number; breeds: string[]; names: string[]; photos: string[] }[] = [
    { species: 'cat', count: 10, breeds: CAT_BREEDS, names: CAT_NAMES, photos: CAT_PHOTOS },
    { species: 'dog', count: 10, breeds: DOG_BREEDS, names: DOG_NAMES, photos: DOG_PHOTOS },
    { species: 'rabbit', count: 3, breeds: RABBIT_BREEDS, names: RABBIT_NAMES, photos: RABBIT_PHOTOS },
    { species: 'bird', count: 4, breeds: BIRD_BREEDS, names: BIRD_NAMES, photos: BIRD_PHOTOS },
    { species: 'other', count: 3, breeds: OTHER_BREEDS, names: OTHER_NAMES, photos: OTHER_PHOTOS },
  ];

  let petIndex = 0;
  for (const config of speciesConfig) {
    for (let i = 0; i < config.count; i++) {
      const publisher = randomChoice(publishers);
      const isAdopted = Math.random() < 0.3;
      const adoptedAt = isAdopted ? randomDateWithinMonths(1) : undefined;
      const photoCount = randomInt(2, 3);
      const shuffledPhotos = [...config.photos].sort(() => Math.random() - 0.5);

      const pet: Pet = {
        id: `pet-${String(petIndex + 1).padStart(3, '0')}`,
        name: config.names[i % config.names.length],
        species: config.species,
        breed: config.breeds[i % config.breeds.length],
        age: generateAgeForSpecies(config.species),
        gender: randomChoice<Gender>(['male', 'female']),
        weight: generateWeightForPet(config.species, config.breeds[i % config.breeds.length]),
        neutered: Math.random() > 0.4,
        healthDescription: '身体健康，已完成基础疫苗接种，定期驱虫。性格温顺，适合家庭饲养。',
        personalityTags: randomSubset<PersonalityTag>(ALL_PERSONALITY_TAGS, 2, 4),
        photoUrls: shuffledPhotos.slice(0, photoCount),
        publisherId: publisher.id,
        publisherName: publisher.name,
        createdAt: randomDateWithinMonths(3),
        viewCount: randomInt(50, 2000),
        favoriteCount: randomInt(5, 200),
        isAdopted,
        adoptedAt,
      };
      pets.push(pet);
      petIndex++;
    }
  }

  return pets;
}

function createStories(users: User[], pets: Pet[]): Story[] {
  const storyContents = [
    '三年前的一个下雨天，我在小区的垃圾桶旁边发现了这只瑟瑟发抖的小奶猫。它浑身湿漉漉的，眼睛还没有完全睁开，看起来出生才几天。我把它抱回家，用温水给它擦干净身子，又用针管一点一点地喂它羊奶。经过一个月的悉心照料，小家伙终于活了下来，现在已经长成了一只健康活泼的大猫咪。每天下班回家，它都会在门口等着我，让我觉得所有的疲惫都值得了。',
    '我家的金毛是从救助站领养的，刚来到家里的时候，它非常胆小，总是躲在角落里，不敢和人亲近。我知道它以前可能受过不好的对待，所以我决定用耐心和爱心慢慢温暖它。每天我都会花时间陪它玩耍，给它讲故事，带它去公园散步。半年过去了，它终于完全信任了我，现在它是我最忠实的伙伴，无论我去哪里，它都会跟在我身边。',
    '兔兔是我在宠物医院门口捡到的，当时它被装在一个纸箱里，旁边还有一张纸条说主人搬家不能带走它了。我看着它红红的眼睛，心里特别难受，就决定把它带回家。一开始我还担心家里的猫会欺负它，没想到它们相处得特别好，经常一起睡觉、一起玩耍。兔兔特别聪明，会自己上厕所，还会听懂自己的名字，真的是太可爱了！',
    '养鹦鹉是我一直以来的梦想，去年终于实现了。我家的小绿是一只虎皮鹦鹉，刚到家的时候特别怕人，一靠近就乱飞。后来我每天都坚持用手喂它吃东西，慢慢的它就不怕我了。现在它会站在我的肩膀上，还会学我说"你好""再见"，有时候甚至会唱歌。每天早上它都会准时叫我起床，有它的日子真的充满了欢乐。',
    '我家的柯基是朋友送的，第一次见到它的时候，它只有两个月大，短短的腿、圆圆的屁股，走路一摇一摆的，萌化了我的心。现在它已经两岁了，虽然腿还是那么短，但跑起来特别快。它最喜欢的事情就是去公园追蝴蝶，还有吃零食。每天看到它开心的样子，我也觉得特别幸福，感谢这个小天使来到我的生命里。',
  ];

  const storyTitles = [
    '雨天捡回的小奶猫，现在成了我的守护神',
    '从救助站到我家，金毛的重生之路',
    '被遗弃的兔兔，成了我家的团宠',
    '鹦鹉小绿，教会我什么是耐心',
    '柯基屁屁的日常幸福生活',
  ];

  const stories: Story[] = [];
  const authors = users.filter(u => u.role !== 'admin');
  const adoptedPets = pets.filter(p => p.isAdopted);

  for (let i = 0; i < 5; i++) {
    const author = authors[i % authors.length];
    const relatedPet = adoptedPets[i % Math.max(adoptedPets.length, 1)];
    const photoPool = [...CAT_PHOTOS, ...DOG_PHOTOS, ...RABBIT_PHOTOS].sort(() => Math.random() - 0.5);

    const story: Story = {
      id: `story-${String(i + 1).padStart(3, '0')}`,
      title: storyTitles[i],
      content: storyContents[i],
      images: photoPool.slice(0, randomInt(2, 3)),
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      petId: relatedPet?.id,
      petName: relatedPet?.name,
      likes: randomInt(20, 150),
      isFeatured: i < 3,
      createdAt: randomDateWithinMonths(2),
    };
    stories.push(story);
  }

  return stories;
}

function createComments(users: User[], stories: Story[]): Comment[] {
  const commentContents = [
    '太感动了！每一个生命都值得被温柔以待。',
    '好可爱的小家伙，感谢你们的付出！',
    '看完眼泪都出来了，希望所有的小动物都能找到家。',
    '我也想领养一只，请问怎么联系？',
    '楼主真的太有爱心了，点赞！',
    '小动物们遇到你真是太幸运了。',
    '我家也有一只类似的，特别懂事儿。',
    '这种故事应该多分享，让更多人关注流浪动物。',
    '看得我心都化了，太萌了！',
    '养宠物真的需要责任心，为你点赞！',
    '感谢分享，祝福你们永远幸福快乐！',
    '希望更多人选择领养代替购买。',
  ];

  const comments: Comment[] = [];
  const commentUsers = users.filter(u => u.role === 'user');

  for (let i = 0; i < 12; i++) {
    const story = stories[i % stories.length];
    const user = commentUsers[i % commentUsers.length];

    const comment: Comment = {
      id: `comment-${String(i + 1).padStart(3, '0')}`,
      storyId: story.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentContents[i % commentContents.length],
      createdAt: randomDateWithinMonths(1),
    };
    comments.push(comment);
  }

  return comments;
}

function createApplications(users: User[], pets: Pet[]): Application[] {
  const applications: Application[] = [];
  const applicants = users.filter(u => u.role === 'user');
  const availablePets = pets.filter(p => !p.isAdopted);
  const statuses: ApplicationStatus[] = ['pending', 'pending', 'pending', 'approved', 'approved', 'rejected', 'rejected', 'pending'];
  const livingEnvs = ['小区公寓，有阳台', '独栋别墅，带院子', '两室一厅，安静小区', '合租但室友都爱宠物', '自有住房，面积宽敞'];
  const companionTimes = ['早上1小时+晚上2小时', '全天在家陪伴', '下班后3小时以上', '周末全天，工作日早晚各1小时', '每天至少4小时'];
  const familyMembers = ['独居', '夫妻二人', '一家三口，孩子8岁', '和父母同住，都喜欢动物', '四口之家，孩子已成年'];

  for (let i = 0; i < 8; i++) {
    const applicant = applicants[i % applicants.length];
    const pet = availablePets[i % Math.max(availablePets.length, 1)];
    const status = statuses[i];
    const reviewedAt = status !== 'pending' ? randomDateWithinMonths(1) : undefined;

    const application: Application = {
      id: `app-${String(i + 1).padStart(3, '0')}`,
      petId: pet.id,
      petName: pet.name,
      petPhoto: pet.photoUrls[0],
      applicantId: applicant.id,
      applicantName: applicant.name,
      contact: `138${String(10000000 + i).padStart(8, '0')}`,
      livingEnvironment: livingEnvs[i % livingEnvs.length],
      hasPetExperience: i % 2 === 0,
      dailyCompanionTime: companionTimes[i % companionTimes.length],
      familyMembers: familyMembers[i % familyMembers.length],
      status,
      createdAt: randomDateWithinMonths(2),
      reviewedAt,
    };
    applications.push(application);
  }

  return applications;
}

function createFavorites(users: User[], pets: Pet[]): Favorite[] {
  const favorites: Favorite[] = [];
  const favUsers = users.filter(u => u.role === 'user');

  for (let i = 0; i < 10; i++) {
    const user = favUsers[i % favUsers.length];
    const pet = pets[i % pets.length];

    const favorite: Favorite = {
      id: `fav-${String(i + 1).padStart(3, '0')}`,
      petId: pet.id,
      userId: user.id,
      addedAt: randomDateWithinMonths(2),
    };
    favorites.push(favorite);
  }

  return favorites;
}

function createFollows(users: User[], pets: Pet[]): Follow[] {
  const follows: Follow[] = [];
  const followUsers = users.filter(u => u.role === 'user');
  const followedPets = pets.slice(0, 10);

  for (let i = 0; i < 5; i++) {
    const user = followUsers[i % followUsers.length];
    const pet = followedPets[i % followedPets.length];

    const follow: Follow = {
      id: `follow-${String(i + 1).padStart(3, '0')}`,
      petId: pet.id,
      userId: user.id,
      followedAt: randomDateWithinMonths(2),
    };
    follows.push(follow);
  }

  return follows;
}

function createHistory(users: User[], pets: Pet[]): HistoryRecord[] {
  const history: HistoryRecord[] = [];
  const historyUsers = users.filter(u => u.role === 'user');

  for (let i = 0; i < 15; i++) {
    const user = historyUsers[i % historyUsers.length];
    const pet = pets[i % pets.length];

    const record: HistoryRecord = {
      id: `history-${String(i + 1).padStart(3, '0')}`,
      petId: pet.id,
      petName: pet.name,
      petPhoto: pet.photoUrls[0],
      viewedAt: randomDateWithinMonths(1),
    };
    history.push(record);
  }

  return history;
}

export function seed(): void {
  const users = createUsers();
  users.forEach(u => store.users.create(u));

  const pets = createPets(users);
  pets.forEach(p => store.pets.create(p));

  const stories = createStories(users, pets);
  stories.forEach(s => store.stories.create(s));

  const comments = createComments(users, stories);
  comments.forEach(c => store.comments.create(c));

  const applications = createApplications(users, pets);
  applications.forEach(a => store.applications.create(a));

  const favorites = createFavorites(users, pets);
  favorites.forEach(f => store.favorites.create(f));

  const follows = createFollows(users, pets);
  follows.forEach(f => store.follows.create(f));

  const history = createHistory(users, pets);
  history.forEach(h => store.history.create(h));

  const firstPet = pets[0];
  if (firstPet) {
    store.addVaccineRecord({
      petId: firstPet.id,
      vaccineName: '猫三联疫苗',
      date: randomDateWithinMonths(3),
      nextDate: (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString();
      })(),
    });
    store.addVaccineRecord({
      petId: firstPet.id,
      vaccineName: '狂犬疫苗',
      date: randomDateWithinMonths(2),
      nextDate: (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString();
      })(),
    });
    store.addDewormingRecord({
      petId: firstPet.id,
      dewormingType: '体内驱虫',
      date: randomDateWithinMonths(1),
    });
    store.addHealthCheckup({
      petId: firstPet.id,
      title: '年度体检',
      description: '血常规正常，体温38.5度，心肺功能良好，体重略有上升建议控制饮食。',
      date: randomDateWithinMonths(2),
      photoUrls: [],
    });
  }

  const secondPet = pets[1];
  if (secondPet) {
    store.addVaccineRecord({
      petId: secondPet.id,
      vaccineName: '六联疫苗',
      date: randomDateWithinMonths(4),
      nextDate: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 8);
        return d.toISOString();
      })(),
    });
    store.addDewormingRecord({
      petId: secondPet.id,
      dewormingType: '体外驱虫',
      date: randomDateWithinMonths(1),
    });
    store.addHealthCheckup({
      petId: secondPet.id,
      title: '疫苗接种前检查',
      description: '身体状况良好，无发烧，可以正常接种疫苗。',
      date: randomDateWithinMonths(4),
      photoUrls: [],
    });
  }

  const lostPetPhotos = [
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600',
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600',
  ];

  store.registerLostPet({
    petName: '豆豆',
    species: 'dog',
    breed: '柴犬',
    photoUrls: [lostPetPhotos[0]],
    features: '黄色短毛，左耳有缺口，脖子上有红色项圈，性格胆小怕人',
    location: '北京市朝阳区望京SOHO附近',
    lostTime: randomDateWithinMonths(1),
    contact: '13800138001',
    reporterId: 'user-user-001',
    reporterName: '小明同学',
  });

  store.registerLostPet({
    petName: '咪咪',
    species: 'cat',
    breed: '英短蓝白',
    photoUrls: [lostPetPhotos[1]],
    features: '蓝白花色，鼻头有个小黑点，尾巴末端是白色的',
    location: '上海市浦东新区陆家嘴环路',
    lostTime: randomDateWithinMonths(1),
    contact: '13800138002',
    reporterId: 'user-user-002',
    reporterName: '爱猫的花花',
  });

  const communityUsers = users.filter(u => u.role !== 'admin');
  const allTags: PostTag[] = ['日常', '求助', '科普', '晒宠', '讨论'];
  const postTitles = [
    '我家猫咪今天居然学会了握手！',
    '新手养猫需要准备什么？求指点',
    '你知道吗？狗狗不能吃巧克力！',
    '晒晒我家柯基的屁屁',
    '大家平时都用什么牌子的猫粮？',
    '我家狗子最近不爱吃饭怎么办？',
    '关于宠物绝育的一些科普知识',
    '带狗狗去海边玩要注意什么？',
  ];
  const postContents = [
    '今天回家发现我家小猫咪居然会握手了！训练了一个月终于有成效了，太感动了！现在它听到指令会主动伸爪子，虽然有时候会伸错，但已经很棒了！',
    '刚领养了一只2个月大的小奶猫，完全不知道要准备什么，除了猫砂盆、猫粮、猫窝，还有什么必须要买的吗？求有经验的铲屎官指点一下！',
    '很多新手铲屎官可能不知道，狗狗是绝对不能吃巧克力的！巧克力中含有的可可碱对狗狗来说是有毒的，严重的可能会危及生命。一定要收好家里的巧克力！',
    '我家柯基的屁屁真的太可爱了！每天回家第一件事就是rua它的屁屁，它还会摇尾巴表示舒服，太治愈了~',
    '最近想给我家猫换个猫粮，之前吃的是皇家，想换个性价比更高的。大家平时都用什么牌子？求推荐！',
  ];

  for (let i = 0; i < 6; i++) {
    const author = communityUsers[i % communityUsers.length];
    const tags = randomSubset<PostTag>(allTags, 1, 2);
    const post = store.createCommunityPost({
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      title: postTitles[i % postTitles.length],
      content: postContents[i % postContents.length],
      images: i % 2 === 0 ? [lostPetPhotos[i % lostPetPhotos.length]] : [],
      tags,
    });
    if (i < 3) {
      const liker = communityUsers[(i + 1) % communityUsers.length];
      store.likeCommunityPost(post.id, liker.id);
    }
  }

  console.log(`[Seed] 数据初始化完成:
  - 用户: ${store.users.list().length}
  - 宠物: ${store.pets.list().length}
  - 故事: ${store.stories.list().length}
  - 评论: ${store.comments.list().length}
  - 申请: ${store.applications.list().length}
  - 收藏: ${store.favorites.list().length}
  - 关注: ${store.follows.list().length}
  - 历史: ${store.history.list().length}`);
}
