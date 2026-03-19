import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
  Link,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Code2,
  Activity,
  Menu,
  Zap,
  Globe,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  Server,
  Users,
  Shield,
  Crown,
  Radio,
  Key,
  Settings,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { BroadcastProvider } from './context/BroadcastContext';
import DashboardPage from './pages/DashboardPage';
import ApiExplorerPage from './pages/ApiExplorerPage';
import HealthMonitorPage from './pages/HealthMonitorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServerManagementPage from './pages/ServerManagementPage';
import AccountManagementPage from './pages/AccountManagementPage';
import BroadcastManagementPage from './pages/BroadcastManagementPage';
import ApiKeyPage from './pages/ApiKeyPage';
import ApiKeySettingsPage from './pages/ApiKeySettingsPage';

// Konfigurasi navigasi sidebar
const navigasi = [
  { nama: 'Dashboard', path: '/', icon: LayoutDashboard },
  { nama: 'API Explorer', path: '/api-explorer', icon: Code2 },
  { nama: 'Health Monitor', path: '/health', icon: Activity },
];

// Navigasi khusus user yang login
const navigasiUser = [{ nama: 'API Keys', path: '/api-keys', icon: Key }];

// Navigasi khusus owner
const navigasiOwner = [
  { nama: 'Manajemen Server', path: '/owner/server', icon: Server },
  { nama: 'Pengaturan API Key', path: '/owner/api-keys', icon: Key },
  { nama: 'Manajemen Akun', path: '/owner/accounts', icon: Users },
  { nama: 'Broadcast', path: '/owner/broadcast', icon: Radio },
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.06, duration: 0.3, ease: 'easeOut' },
  }),
};

// Hook untuk tema
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      let isDark = false;

      if (theme === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = theme === 'dark';
      }

      setResolvedTheme(isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDark);
    };

    updateTheme();

    const handler = () => updateTheme();
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return { theme, resolvedTheme, toggleTheme };
}

// Komponen toggle tema
function ThemeToggle({ resolvedTheme, onToggle }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title={resolvedTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
    >
      <AnimatePresence mode="wait">
        {resolvedTheme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-5 h-5 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-5 h-5 text-slate-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Komponen User Menu di header
function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Masuk
        </Link>
        <Link
          to="/register"
          className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {(user.nama || user.email)?.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-24">
          {user.nama || user.email}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
            >
              {/* User Info */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.nama}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded">
                    {user.peran}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                    {user.tier}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 dark:bg-slate-950 text-white
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen || isDesktop ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700 dark:border-slate-800">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center cursor-pointer"
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold leading-tight">REST API</h1>
            <p className="text-xs text-slate-400">Dashboard</p>
          </div>
        </div>

        {/* User Info di Sidebar (Mobile) */}
        {user && (
          <div className="p-4 border-b border-slate-700 dark:border-slate-800 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {(user.nama || user.email)?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.nama}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigasi */}
        <nav className="p-4 space-y-1">
          {navigasi.map((item, index) => (
            <motion.div
              key={item.path}
              custom={index}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <NavLink
                to={item.path}
                onClick={() => !isDesktop && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 ease-out
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800/80 hover:text-white hover:pl-5'
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.nama}
              </NavLink>
            </motion.div>
          ))}

          {/* User Menu - API Keys */}
          {user && (
            <>
              <div className="pt-4 pb-2">
                <div className="flex items-center gap-2 px-4">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                    API
                  </span>
                </div>
              </div>
              {navigasiUser.map((item, index) => (
                <motion.div
                  key={item.path}
                  custom={navigasi.length + index}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <NavLink
                    to={item.path}
                    onClick={() => !isDesktop && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200 ease-out
                      ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                          : 'text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800/80 hover:text-white hover:pl-5'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {item.nama}
                  </NavLink>
                </motion.div>
              ))}
            </>
          )}

          {/* Owner Menu */}
          {(user?.peran === 'owner' || user?.peran === 'admin') && (
            <>
              <div className="pt-4 pb-2">
                <div className="flex items-center gap-2 px-4">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                    Owner Panel
                  </span>
                </div>
              </div>
              {navigasiOwner.map((item, index) => (
                <motion.div
                  key={item.path}
                  custom={navigasi.length + index}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <NavLink
                    to={item.path}
                    onClick={() => !isDesktop && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200 ease-out
                      ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                          : 'text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800/80 hover:text-white hover:pl-5'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {item.nama}
                  </NavLink>
                </motion.div>
              ))}
            </>
          )}
        </nav>

        {/* Footer sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Globe className="w-4 h-4" />
            <span>v1.0.0</span>
            <span className="ml-auto flex items-center gap-1.5">
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ onToggleSidebar, resolvedTheme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </motion.button>

        <div className="hidden lg:block">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            REST API Publik Universal
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle resolvedTheme={resolvedTheme} onToggle={onToggleTheme} />

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            API Aktif
          </span>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}

// Layout untuk halaman yang memerlukan auth
function DashboardLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Dashboard bisa diakses tanpa login, tapi fitur terbatas
  return children;
}

// Komponen Protected Route untuk owner/admin
function OwnerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.peran !== 'owner' && user.peran !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Akses Ditolak</h2>
        <p className="text-slate-500 dark:text-slate-400">Halaman ini hanya untuk owner/admin.</p>
      </div>
    );
  }

  return children;
}

// Komponen wrapper untuk animasi page transition
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route path="/api-explorer" element={<ApiExplorerPage />} />
          <Route path="/health" element={<HealthMonitorPage />} />
          {/* User Routes - API Keys */}
          <Route
            path="/api-keys"
            element={
              <DashboardLayout>
                <ApiKeyPage />
              </DashboardLayout>
            }
          />
          {/* Owner Routes */}
          <Route
            path="/owner/server"
            element={
              <OwnerRoute>
                <ServerManagementPage />
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/api-keys"
            element={
              <OwnerRoute>
                <ApiKeySettingsPage />
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/accounts"
            element={
              <OwnerRoute>
                <AccountManagementPage />
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/broadcast"
            element={
              <OwnerRoute>
                <BroadcastManagementPage />
              </OwnerRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  // Cek apakah halaman auth (tidak perlu sidebar/header)
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) {
    return <AnimatedRoutes />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen(true)}
          resolvedTheme={resolvedTheme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatedRoutes />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <BroadcastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BroadcastProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
