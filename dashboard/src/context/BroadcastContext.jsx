import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import api from '../lib/api';

/**
 * Context untuk Broadcast
 * Menampilkan broadcast overlay saat refresh browser
 */

const BroadcastContext = createContext(null);

// Tipe broadcast dengan warna & ikon
const tipeStyles = {
  info: {
    bg: 'from-blue-600 to-indigo-700',
    icon: Info,
    border: 'border-blue-400',
  },
  success: {
    bg: 'from-green-600 to-emerald-700',
    icon: CheckCircle,
    border: 'border-green-400',
  },
  warning: {
    bg: 'from-amber-500 to-orange-600',
    icon: AlertTriangle,
    border: 'border-amber-400',
  },
  maintenance: {
    bg: 'from-slate-600 to-slate-800',
    icon: Wrench,
    border: 'border-slate-400',
  },
};

function BroadcastModal({ broadcast, onClose, onDontShow }) {
  const [dontShow, setDontShow] = useState(false);
  const style = tipeStyles[broadcast.tipe] || tipeStyles.info;
  const Icon = style.icon;

  const handleClose = () => {
    if (dontShow) {
      onDontShow(broadcast.id);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
    >
      {/* Backdrop blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`relative w-full max-w-lg bg-gradient-to-br ${style.bg} rounded-2xl shadow-2xl overflow-hidden`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="p-8 text-white">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6"
          >
            <Icon className="w-8 h-8" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-3"
          >
            {broadcast.judul}
          </motion.h2>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 leading-relaxed mb-6 whitespace-pre-wrap"
          >
            {broadcast.konten}
          </motion.div>

          {/* Don't show again checkbox */}
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 cursor-pointer mb-6"
          >
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 bg-white/20 text-white focus:ring-white/50"
            />
            <span className="text-sm text-white/80">Jangan tampilkan lagi</span>
          </motion.label>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClose}
            className="w-full py-3 px-6 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
          >
            Mengerti, Tutup
          </motion.button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </motion.div>
    </motion.div>
  );
}

export function BroadcastProvider({ children }) {
  const [broadcast, setBroadcast] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch broadcast aktif saat mount
  useEffect(() => {
    const fetchBroadcast = async () => {
      try {
        const response = await api.get('/broadcast');
        const data = response.data.data;

        if (data) {
          // Cek apakah user memilih "jangan tampilkan lagi"
          const hiddenIds = JSON.parse(localStorage.getItem('hiddenBroadcasts') || '[]');

          if (!hiddenIds.includes(data.id)) {
            setBroadcast(data);
            setShowModal(true);
          }
        }
      } catch (error) {
        // Silent fail - broadcast tidak wajib
        console.log('Broadcast tidak tersedia');
      }
    };

    // Delay sedikit agar tidak mengganggu loading halaman
    const timer = setTimeout(fetchBroadcast, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleDontShow = useCallback((broadcastId) => {
    const hiddenIds = JSON.parse(localStorage.getItem('hiddenBroadcasts') || '[]');
    hiddenIds.push(broadcastId);
    localStorage.setItem('hiddenBroadcasts', JSON.stringify(hiddenIds));
  }, []);

  // Reset hidden broadcasts (untuk testing)
  const resetHiddenBroadcasts = useCallback(() => {
    localStorage.removeItem('hiddenBroadcasts');
  }, []);

  const value = {
    broadcast,
    showModal,
    handleClose,
    resetHiddenBroadcasts,
  };

  return (
    <BroadcastContext.Provider value={value}>
      {children}

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showModal && broadcast && (
          <BroadcastModal broadcast={broadcast} onClose={handleClose} onDontShow={handleDontShow} />
        )}
      </AnimatePresence>
    </BroadcastContext.Provider>
  );
}

export function useBroadcast() {
  const context = useContext(BroadcastContext);
  if (!context) {
    throw new Error('useBroadcast harus digunakan di dalam BroadcastProvider');
  }
  return context;
}
