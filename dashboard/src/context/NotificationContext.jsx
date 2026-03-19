import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Context untuk notifikasi global
 * Menampilkan toast overlay di atas semua elemen
 */

const NotificationContext = createContext(null);

// Komponen Toast individual
function Toast({ notification, onClose }) {
  const { id, tipe, pesan, durasi = 5000 } = notification;

  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/90',
      border: 'border-green-200 dark:border-green-700',
      text: 'text-green-800 dark:text-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500 dark:text-green-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/90',
      border: 'border-red-200 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
      icon: XCircle,
      iconColor: 'text-red-500 dark:text-red-400',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/90',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-800 dark:text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/90',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-800 dark:text-blue-200',
      icon: Info,
      iconColor: 'text-blue-500 dark:text-blue-400',
    },
  };

  const style = styles[tipe] || styles.info;
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        flex items-center gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md
        ${style.bg} ${style.border} ${style.text}
        min-w-[320px] max-w-[480px]
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 ${style.iconColor}`} />
      <p className="flex-1 text-sm font-medium">{pesan}</p>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 opacity-60" />
      </button>
    </motion.div>
  );
}

// Container untuk semua toast
function ToastContainer({ notifications, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Toast notification={notification} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Tambah notifikasi baru
  const tampil = useCallback((pesan, tipe = 'info', durasi = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, tipe, pesan, durasi };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove setelah durasi
    if (durasi > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, durasi);
    }

    return id;
  }, []);

  // Hapus notifikasi berdasarkan ID
  const hapus = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Hapus semua notifikasi
  const hapusSemua = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper untuk tipe spesifik
  const sukses = useCallback((pesan, durasi) => tampil(pesan, 'success', durasi), [tampil]);
  const error = useCallback((pesan, durasi) => tampil(pesan, 'error', durasi), [tampil]);
  const peringatan = useCallback((pesan, durasi) => tampil(pesan, 'warning', durasi), [tampil]);
  const info = useCallback((pesan, durasi) => tampil(pesan, 'info', durasi), [tampil]);

  const value = {
    notifications,
    tampil,
    hapus,
    hapusSemua,
    sukses,
    suksess: sukses,
    sukes: sukses,
    error,
    peringatan,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer notifications={notifications} onClose={hapus} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification harus digunakan di dalam NotificationProvider');
  }
  return context;
}
