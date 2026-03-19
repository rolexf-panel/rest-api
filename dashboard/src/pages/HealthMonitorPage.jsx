import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Server,
  Database,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import api from '../lib/api';

// Varian animasi
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

function StatusBadge({ status }) {
  const variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 25 } },
  };

  if (status === 'sehat' || status === 'terhubung') {
    return (
      <motion.span
        variants={variants}
        initial="initial"
        animate="animate"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full"
      >
        <CheckCircle className="w-4 h-4" />
        {status === 'sehat' ? 'Sehat' : 'Terhubung'}
      </motion.span>
    );
  }

  if (status === 'tidak sehat' || status === 'terputus') {
    return (
      <motion.span
        variants={variants}
        initial="initial"
        animate="animate"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium rounded-full"
      >
        <XCircle className="w-4 h-4" />
        {status === 'tidak sehat' ? 'Tidak Sehat' : 'Terputus'}
      </motion.span>
    );
  }

  return (
    <motion.span
      variants={variants}
      initial="initial"
      animate="animate"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-full"
    >
      <AlertTriangle className="w-4 h-4" />
      Tidak Diketahui
    </motion.span>
  );
}

function HealthCard({ title, icon: Icon, status, details }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
          >
            <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </motion.div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      {details && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800"
        >
          {details.map((detail, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-500 dark:text-slate-400">{detail.label}</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{detail.value}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function HealthMonitorPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [checkHistory, setCheckHistory] = useState([]);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/health');
      const data = response.data.data;
      setHealthData(data);
      setLastChecked(new Date());

      setCheckHistory((prev) => [
        {
          time: new Date(),
          status: data.status,
          dbStatus: data.database,
          uptime: data.uptime,
        },
        ...prev.slice(0, 19),
      ]);
    } catch (error) {
      console.error('Gagal mengambil data health:', error);
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchHealth]);

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}j ${minutes}m ${secs}d`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-slate-900 dark:text-white"
          >
            Health Monitor
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
          >
            Pantau status server dan database secara real-time
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {/* Toggle auto-refresh */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Auto-refresh (10s)</span>
          </label>

          {/* Tombol refresh manual */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-500/25"
          >
            <motion.div
              animate={loading ? { rotate: 360 } : {}}
              transition={loading ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            Refresh
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Status cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <HealthCard
          title="Server API"
          icon={Server}
          status={healthData?.status || 'tidak sehat'}
          details={[
            { label: 'Status', value: healthData?.status === 'sehat' ? 'Berjalan' : 'Error' },
            { label: 'Versi', value: healthData?.versi || '-' },
            { label: 'Environment', value: healthData?.environment || '-' },
            { label: 'Uptime', value: healthData ? formatUptime(healthData.uptime) : '-' },
          ]}
        />

        <HealthCard
          title="Database"
          icon={Database}
          status={healthData?.database || 'terputus'}
          details={[
            { label: 'Status', value: healthData?.database === 'terhubung' ? 'Terhubung' : 'Terputus' },
            { label: 'Tipe', value: 'SQLite' },
            { label: 'Mode', value: 'Development' },
          ]}
        />
      </motion.div>

      {/* Informasi tambahan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Informasi Waktu
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Timestamp Server',
              value: healthData?.timestamp
                ? new Date(healthData.timestamp).toLocaleString('id-ID')
                : '-',
            },
            { label: 'Terakhir Dicek', value: lastChecked ? formatTime(lastChecked) : '-' },
            { label: 'Auto-Refresh', value: autoRefresh ? 'Aktif (10s)' : 'Nonaktif' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
              <motion.p
                key={item.value}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-mono text-slate-700 dark:text-slate-300"
              >
                {item.value}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* History checks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Riwayat Pengecekan
        </h3>

        {checkHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">Waktu</th>
                  <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">Server</th>
                  <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">Database</th>
                  <th className="text-left py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">Uptime</th>
                </tr>
              </thead>
              <AnimatePresence>
                <tbody>
                  {checkHistory.map((check) => (
                    <motion.tr
                      key={check.time.getTime()}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {formatTime(check.time)}
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={check.status} />
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={check.dbStatus} />
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {formatUptime(check.uptime)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </AnimatePresence>
            </table>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-400 dark:text-slate-500 text-center py-8"
          >
            Belum ada riwayat pengecekan. Klik Refresh untuk memulai.
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default HealthMonitorPage;
