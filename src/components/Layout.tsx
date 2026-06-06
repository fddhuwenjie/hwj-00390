import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { User } from '../../shared/types';

const MOCK_USERS: User[] = [
  { id: 'user-user-001', name: '小明同学', avatar: '🧑', role: 'user' },
  { id: 'user-pub-001', name: '爱心救助站', avatar: '🏠', role: 'publisher' },
  { id: 'user-admin-001', name: '管理员小王', avatar: '👑', role: 'admin' },
  { id: 'user-care-001', name: '宠物保姆小李', avatar: '👨‍🦱', role: 'user' },
  { id: 'user-care-002', name: '狗狗爱好者王哥', avatar: '👨', role: 'user' },
  { id: 'user-care-003', name: '猫咪之家张姐', avatar: '👩', role: 'user' },
];

export default function Layout() {
  const { currentUser, setUser, logout } = useAppStore();

  const handleToggleLogin = () => {
    if (currentUser) {
      logout();
    } else {
      setUser(MOCK_USERS[0]);
    }
  };

  const handleCycleUser = () => {
    if (!currentUser) {
      setUser(MOCK_USERS[0]);
      return;
    }
    const currentIndex = MOCK_USERS.findIndex((u) => u.id === currentUser.id);
    const nextIndex = (currentIndex + 1) % MOCK_USERS.length;
    setUser(MOCK_USERS[nextIndex]);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-100 text-primary-600'
        : 'text-gray-600 hover:bg-cream-200 hover:text-primary-500'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cream-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl text-primary-500">爪爪之家 🐾</span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" className={navLinkClass} end>
                首页
              </NavLink>
              <NavLink to="/boarding" className={navLinkClass}>
                寄养服务
              </NavLink>
              <NavLink to="/community" className={navLinkClass}>
                社区广场
              </NavLink>
              <NavLink to="/lost" className={navLinkClass}>
                走失寻回
              </NavLink>
              <NavLink to="/stories" className={navLinkClass}>
                故事
              </NavLink>
              <NavLink to="/publish" className={navLinkClass}>
                发布宠物
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                个人中心
              </NavLink>
              {currentUser?.role === 'admin' && (
                <NavLink to="/admin" className={navLinkClass}>
                  管理后台
                </NavLink>
              )}
            </nav>

            <div className="flex items-center gap-2">
              {currentUser && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cream-100 rounded-full">
                  <span className="text-lg">{currentUser.avatar}</span>
                  <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full">
                    {currentUser.role === 'admin' ? '管理员' : currentUser.role === 'publisher' ? '发布者' : '用户'}
                  </span>
                </div>
              )}
              <button
                onClick={handleCycleUser}
                className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                {currentUser ? '切换用户' : '模拟登录'}
              </button>
              {currentUser && (
                <button
                  onClick={handleToggleLogin}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  退出
                </button>
              )}
            </div>
          </div>

          <nav className="md:hidden flex items-center gap-1 mt-3 overflow-x-auto pb-1">
            <NavLink to="/" className={navLinkClass} end>
              首页
            </NavLink>
            <NavLink to="/boarding" className={navLinkClass}>
              寄养
            </NavLink>
            <NavLink to="/community" className={navLinkClass}>
              社区
            </NavLink>
            <NavLink to="/lost" className={navLinkClass}>
              走失
            </NavLink>
            <NavLink to="/stories" className={navLinkClass}>
              故事
            </NavLink>
            <NavLink to="/publish" className={navLinkClass}>
              发布
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              中心
            </NavLink>
            {currentUser?.role === 'admin' && (
              <NavLink to="/admin" className={navLinkClass}>
                管理
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-cream-200 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © 2024 爪爪之家 🐾 宠物领养平台 - 用爱给每一个毛孩子一个家
          </p>
        </div>
      </footer>
    </div>
  );
}
