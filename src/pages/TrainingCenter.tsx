import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import {
  CAREGIVER_CERT_LEVEL_LABELS,
  CAREGIVER_CERT_LEVEL_BADGES,
  TRAINING_COURSE_STATUS_LABELS,
} from '../../shared/types';
import type {
  TrainingCourse,
  CaregiverCourseProgress,
  BoardingCaregiver,
  BoardingCaregiverExtended,
  CaregiverCertLevel,
  TrainingCourseStatus,
  TrainingQuiz,
} from '../../shared/types';
import {
  ArrowLeft, BookOpen, Award, CheckCircle, Clock, HelpCircle, ChevronRight,
  GraduationCap, Star, TrendingUp, X, Check, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabKey = 'courses' | 'certification';

interface CertLevelRequirement {
  level: CaregiverCertLevel;
  badge: string;
  label: string;
  minOrders: number;
  minRating: number;
  minCourses: number;
  priceMultiplier: number;
  perks: string[];
}

const CERT_LEVEL_REQUIREMENTS: CertLevelRequirement[] = [
  {
    level: 'junior',
    badge: '🥉',
    label: CAREGIVER_CERT_LEVEL_LABELS.junior,
    minOrders: 5,
    minRating: 4.0,
    minCourses: 1,
    priceMultiplier: 1.0,
    perks: ['基础寄养服务权限'],
  },
  {
    level: 'intermediate',
    badge: '🥈',
    label: CAREGIVER_CERT_LEVEL_LABELS.intermediate,
    minOrders: 20,
    minRating: 4.3,
    minCourses: 3,
    priceMultiplier: 1.2,
    perks: ['价格乘数 1.2x'],
  },
  {
    level: 'senior',
    badge: '🥇',
    label: CAREGIVER_CERT_LEVEL_LABELS.senior,
    minOrders: 50,
    minRating: 4.7,
    minCourses: 5,
    priceMultiplier: 1.5,
    perks: ['价格乘数 1.5x', '优先推荐', '可设置更高报价'],
  },
];

const COURSE_DISPLAY_ICONS: Record<string, string> = {
  'tc-001': '🚑',
  'tc-002': '🥗',
  'tc-003': '🎓',
  'tc-004': '🛁',
  'tc-005': '💚',
};

function getStatusColor(status: TrainingCourseStatus): string {
  switch (status) {
    case 'not_started':
      return 'bg-gray-100 text-gray-600';
    case 'in_progress':
      return 'bg-amber-100 text-amber-700';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
  }
}

export default function TrainingCenter() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('courses');
  const [loading, setLoading] = useState(true);
  const [myCaregiver, setMyCaregiver] = useState<BoardingCaregiver | null>(null);
  const [caregiverExtended, setCaregiverExtended] = useState<BoardingCaregiverExtended | null>(null);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [progressList, setProgressList] = useState<CaregiverCourseProgress[]>([]);

  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<TrainingCourse | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [cg, courseList] = await Promise.all([
        boardingApi.getMyCaregiver(currentUser.id),
        boardingApi.getAllTrainingCourses(),
      ]);
      setMyCaregiver(cg);
      setCourses(courseList);

      if (cg) {
        const [extended, progress] = await Promise.all([
          boardingApi.getCaregiverExtended(cg.id),
          boardingApi.getCaregiverCourseProgress(cg.id),
        ]);
        setCaregiverExtended(extended);
        setProgressList(progress);
      }
    } catch (err) {
      console.error('加载数据失败', err);
    }
    setLoading(false);
  };

  const getProgressForCourse = (courseId: string): CaregiverCourseProgress | undefined => {
    return progressList.find(p => p.courseId === courseId);
  };

  const startQuiz = (course: TrainingCourse) => {
    setCurrentCourse(course);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setQuizFinished(false);
    setQuizScore(0);
    setQuizPassed(false);
    setQuizModalOpen(true);
  };

  const closeQuiz = () => {
    setQuizModalOpen(false);
    setCurrentCourse(null);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setQuizFinished(false);
    setQuizScore(0);
    setQuizPassed(false);
  };

  const handleNextQuestion = () => {
    if (!currentCourse || selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuizIndex + 1 >= currentCourse.quizzes.length) {
      finishQuiz(newAnswers, currentCourse.quizzes);
    } else {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const finishQuiz = async (finalAnswers: number[], quizzes: TrainingQuiz[]) => {
    let correctCount = 0;
    quizzes.forEach((quiz, idx) => {
      if (finalAnswers[idx] === quiz.correctIndex) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / quizzes.length) * 100);
    const passed = score >= 60;

    setQuizScore(score);
    setQuizPassed(passed);
    setQuizFinished(true);

    if (passed && myCaregiver && currentCourse) {
      setSubmittingQuiz(true);
      try {
        await boardingApi.completeTrainingCourse(myCaregiver.id, currentCourse.id, score);
        const [extended, progress] = await Promise.all([
          boardingApi.getCaregiverExtended(myCaregiver.id),
          boardingApi.getCaregiverCourseProgress(myCaregiver.id),
        ]);
        setCaregiverExtended(extended);
        setProgressList(progress);
      } catch (err) {
        console.error('提交测验结果失败', err);
      }
      setSubmittingQuiz(false);
    }
  };

  const calculateUpgradeProgress = (): { percentage: number; nextLevel: CertLevelRequirement | null; currentLevelIndex: number } => {
    if (!caregiverExtended || !myCaregiver) {
      return { percentage: 0, nextLevel: CERT_LEVEL_REQUIREMENTS[1], currentLevelIndex: 0 };
    }

    const currentLevel = caregiverExtended.certLevel;
    const currentLevelIndex = CERT_LEVEL_REQUIREMENTS.findIndex(r => r.level === currentLevel);

    if (currentLevelIndex >= CERT_LEVEL_REQUIREMENTS.length - 1) {
      return { percentage: 100, nextLevel: null, currentLevelIndex };
    }

    const nextLevel = CERT_LEVEL_REQUIREMENTS[currentLevelIndex + 1];

    const ordersProgress = Math.min(100, (myCaregiver.totalOrders / nextLevel.minOrders) * 100);
    const ratingProgress = Math.min(100, (myCaregiver.averageRating / nextLevel.minRating) * 100);
    const coursesProgress = Math.min(100, (caregiverExtended.completedCourses / nextLevel.minCourses) * 100);

    const percentage = Math.round((ordersProgress + ratingProgress + coursesProgress) / 3);

    return { percentage, nextLevel, currentLevelIndex };
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">🎓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">请先登录</h2>
        <p className="text-gray-500">点击右上角"模拟登录"按钮开始使用培训中心</p>
      </div>
    );
  }

  const upgradeInfo = calculateUpgradeProgress();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/boarding')}
          className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-primary-500" />
          寄养人培训与认证
        </h1>
      </div>

      {caregiverExtended && myCaregiver && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 mb-6 text-white shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl backdrop-blur-sm">
                {CAREGIVER_CERT_LEVEL_BADGES[caregiverExtended.certLevel]}
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {CAREGIVER_CERT_LEVEL_LABELS[caregiverExtended.certLevel]}
                </h2>
                <div className="flex items-center gap-4 text-primary-100 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    评分 {myCaregiver.averageRating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    接单 {myCaregiver.totalOrders} 单
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    完成 {caregiverExtended.completedCourses} 门课程
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-primary-100 text-sm mb-1">价格乘数</div>
              <div className="text-2xl font-bold">{caregiverExtended.maxPriceMultiplier.toFixed(1)}x</div>
            </div>
          </div>

          {upgradeInfo.nextLevel && (
            <div className="mt-5 pt-5 border-t border-white/20">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-primary-100">
                  距离 {upgradeInfo.nextLevel.label} 还需努力
                </span>
                <span className="font-semibold">{upgradeInfo.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${upgradeInfo.percentage}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-primary-100">
                <div>
                  接单 {myCaregiver.totalOrders}/{upgradeInfo.nextLevel.minOrders}
                </div>
                <div>
                  评分 {myCaregiver.averageRating.toFixed(1)}/{upgradeInfo.nextLevel.minRating}
                </div>
                <div>
                  课程 {caregiverExtended.completedCourses}/{upgradeInfo.nextLevel.minCourses}
                </div>
              </div>
            </div>
          )}

          {!upgradeInfo.nextLevel && (
            <div className="mt-5 pt-5 border-t border-white/20 text-center">
              <div className="flex items-center justify-center gap-2 text-primary-100">
                <Award className="w-5 h-5" />
                已达到最高认证等级，恭喜！
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-cream-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('courses')}
          className={cn(
            'px-5 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'courses'
              ? 'bg-white text-primary-600 border border-cream-200 border-b-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-cream-50'
          )}
        >
          <BookOpen className="w-4 h-4" />
          培训课程
        </button>
        <button
          onClick={() => setActiveTab('certification')}
          className={cn(
            'px-5 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2',
            activeTab === 'certification'
              ? 'bg-white text-primary-600 border border-cream-200 border-b-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-cream-50'
          )}
        >
          <Award className="w-4 h-4" />
          认证等级说明
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : (
        <>
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {courses.map((course) => {
                const progress = getProgressForCourse(course.id);
                const status: TrainingCourseStatus = progress?.status || 'not_started';
                const displayIcon = COURSE_DISPLAY_ICONS[course.id] || course.icon;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl shadow-sm border border-cream-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => startQuiz(course)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-3xl flex-shrink-0">
                        {displayIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {course.title}
                          </h3>
                          <span
                            className={cn(
                              'text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0',
                              getStatusColor(status)
                            )}
                          >
                            {TRAINING_COURSE_STATUS_LABELS[status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.durationMinutes} 分钟
                          </span>
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-4 h-4" />
                            {course.quizzes.length} 道测验题
                          </span>
                          {progress?.score !== undefined && (
                            <span className="flex items-center gap-1 text-primary-600 font-medium">
                              <Award className="w-4 h-4" />
                              得分 {progress.score}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
                    </div>
                  </div>
                );
              })}

              {courses.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-cream-200">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="text-gray-500">暂无培训课程</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'certification' && (
            <div className="space-y-4">
              {CERT_LEVEL_REQUIREMENTS.map((req, idx) => {
                const isCurrent = caregiverExtended?.certLevel === req.level;
                const isLocked = caregiverExtended
                  ? CERT_LEVEL_REQUIREMENTS.findIndex(r => r.level === caregiverExtended.certLevel) < idx
                  : idx > 0;

                return (
                  <div
                    key={req.level}
                    className={cn(
                      'bg-white rounded-2xl shadow-sm border p-5 transition-all',
                      isCurrent
                        ? 'border-primary-300 ring-2 ring-primary-100'
                        : 'border-cream-200',
                      isLocked && !isCurrent && 'opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0',
                          isCurrent ? 'bg-primary-100' : 'bg-cream-100'
                        )}
                      >
                        {req.badge}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {req.label}
                          </h3>
                          {isCurrent && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 font-medium">
                              当前等级
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          <div className="bg-cream-50 rounded-lg p-3">
                            <div className="text-xs text-gray-400 mb-1">累计接单</div>
                            <div className="text-gray-800 font-semibold">
                              ≥ {req.minOrders} 单
                            </div>
                          </div>
                          <div className="bg-cream-50 rounded-lg p-3">
                            <div className="text-xs text-gray-400 mb-1">平均评分</div>
                            <div className="text-gray-800 font-semibold">
                              ≥ {req.minRating.toFixed(1)}
                            </div>
                          </div>
                          <div className="bg-cream-50 rounded-lg p-3">
                            <div className="text-xs text-gray-400 mb-1">完成课程</div>
                            <div className="text-gray-800 font-semibold">
                              ≥ {req.minCourses} 门
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 font-medium">
                            <TrendingUp className="w-3 h-3" />
                            价格乘数 {req.priceMultiplier.toFixed(1)}x
                          </span>
                          {req.perks.map((perk, perkIdx) => (
                            <span
                              key={perkIdx}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 font-medium"
                            >
                              <Star className="w-3 h-3" />
                              {perk}
                            </span>
                          ))}
                        </div>

                        {myCaregiver && caregiverExtended && (
                          <div className="mt-4 pt-4 border-t border-cream-100">
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <span className="text-gray-400">接单进度：</span>
                                <span className={cn(
                                  'font-medium',
                                  myCaregiver.totalOrders >= req.minOrders ? 'text-emerald-600' : 'text-gray-600'
                                )}>
                                  {myCaregiver.totalOrders}/{req.minOrders}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">评分进度：</span>
                                <span className={cn(
                                  'font-medium',
                                  myCaregiver.averageRating >= req.minRating ? 'text-emerald-600' : 'text-gray-600'
                                )}>
                                  {myCaregiver.averageRating.toFixed(1)}/{req.minRating.toFixed(1)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">课程进度：</span>
                                <span className={cn(
                                  'font-medium',
                                  caregiverExtended.completedCourses >= req.minCourses ? 'text-emerald-600' : 'text-gray-600'
                                )}>
                                  {caregiverExtended.completedCourses}/{req.minCourses}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {quizModalOpen && currentCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-cream-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-xl">
                  {COURSE_DISPLAY_ICONS[currentCourse.id] || currentCourse.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{currentCourse.title}</h3>
                  {!quizFinished && (
                    <p className="text-sm text-gray-500">
                      第 {currentQuizIndex + 1} / {currentCourse.quizzes.length} 题
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeQuiz}
                className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {!quizFinished ? (
                <>
                  {!quizFinished && (
                    <div className="w-full h-1.5 bg-cream-100 rounded-full mb-6 overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentQuizIndex) / currentCourse.quizzes.length) * 100}%`,
                        }}
                      />
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                      {currentCourse.quizzes[currentQuizIndex].question}
                    </h4>
                    <div className="space-y-3">
                      {currentCourse.quizzes[currentQuizIndex].options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => setSelectedAnswer(optIdx)}
                          className={cn(
                            'w-full text-left p-4 rounded-xl border-2 transition-all',
                            selectedAnswer === optIdx
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-medium text-sm',
                                selectedAnswer === optIdx
                                  ? 'border-primary-500 bg-primary-500 text-white'
                                  : 'border-gray-300 text-gray-500'
                              )}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="text-gray-700">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div
                    className={cn(
                      'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
                      quizPassed ? 'bg-emerald-100' : 'bg-rose-100'
                    )}
                  >
                    {quizPassed ? (
                      <Check className="w-10 h-10 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-10 h-10 text-rose-600" />
                    )}
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    {quizPassed ? '恭喜通过！' : '未能通过'}
                  </h4>
                  <p className="text-gray-500 mb-6">
                    {quizPassed
                      ? '您已成功完成本课程，认证等级可能提升'
                      : '未达到及格分数（60分），请重新学习后再次尝试'}
                  </p>
                  <div className="inline-block bg-cream-50 rounded-xl px-8 py-4">
                    <div className="text-sm text-gray-400 mb-1">最终得分</div>
                    <div
                      className={cn(
                        'text-4xl font-bold',
                        quizPassed ? 'text-emerald-600' : 'text-rose-600'
                      )}
                    >
                      {quizScore}
                      <span className="text-xl text-gray-400 font-normal">/100</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                    {currentCourse.quizzes.map((quiz, idx) => {
                      const isCorrect = answers[idx] === quiz.correctIndex;
                      return (
                        <div
                          key={quiz.id}
                          className={cn(
                            'flex items-start gap-2 p-3 rounded-lg text-sm',
                            isCorrect ? 'bg-emerald-50' : 'bg-rose-50'
                          )}
                        >
                          {isCorrect ? (
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              'font-medium',
                              isCorrect ? 'text-emerald-800' : 'text-rose-800'
                            )}>
                              {idx + 1}. {quiz.question}
                            </div>
                            {!isCorrect && (
                              <div className="text-xs text-rose-600 mt-1">
                                正确答案：{String.fromCharCode(65 + quiz.correctIndex)}. {quiz.options[quiz.correctIndex]}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-cream-200 bg-cream-50">
              {!quizFinished ? (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeQuiz}
                    className="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-white transition-colors font-medium"
                  >
                    退出测验
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className={cn(
                      'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2',
                      selectedAnswer === null
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    )}
                  >
                    {currentQuizIndex + 1 >= currentCourse.quizzes.length ? '提交' : '下一题'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-end gap-3">
                  {!quizPassed && (
                    <button
                      onClick={() => {
                        setCurrentQuizIndex(0);
                        setSelectedAnswer(null);
                        setAnswers([]);
                        setQuizFinished(false);
                        setQuizScore(0);
                        setQuizPassed(false);
                      }}
                      className="px-5 py-2.5 rounded-lg bg-white text-gray-700 hover:bg-cream-100 transition-colors font-medium border border-cream-200"
                    >
                      重新测验
                    </button>
                  )}
                  <button
                    onClick={closeQuiz}
                    disabled={submittingQuiz}
                    className={cn(
                      'px-5 py-2.5 rounded-lg font-medium transition-colors',
                      submittingQuiz
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    )}
                  >
                    {submittingQuiz ? '提交中...' : '完成'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
