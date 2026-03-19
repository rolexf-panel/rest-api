import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Database,
  Activity,
  Clock,
  RefreshCw,
  Settings,
  HardDrive,
  Key,
  Shield,
  Zap,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '../lib/api';
import { useNotification } from '../context/NotificationContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function StatCard({ title, value, icon: Icon, color = 'indigo' }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

function ServerManagementPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const notifikasi = useNotification();

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await api.get('/health');
      setHealthData(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data server:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}j ${minutes}m ${secs}d`;
  };

  const handleBackup = async () => {
    setActionLoading('backup');
    try {
      const response = await api.post('/owner/backup', {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString().slice(0, 10)}.db`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notifikasi.suksess('Backup database berhasil diunduh!');
    } catch (error) {
      notifikasi.error('Gagal backup database');
    } finally {
      setActionLoading('');
    }
  };

  const handleClearCache = async () => {
    setActionLoading('cache');
    try {
      await api.post('/owner/clear-cache');
      notifikasi.suksess('Cache berhasil dibersihkan!');
    } catch (error) {
      notifikasi.error('Gagal membersihkan cache');
    } finally {
      setActionLoading('');
    }
  };

  const handleViewStats = async () => {
    setActionLoading('stats');
    try {
      const response = await api.get('/owner/stats');
      console.log('Server Stats:', response.data.data);
      notifikasi.info('Statistik dimuat! Cek console (F12)');
    } catch (error) {
      notifikasi.error('Gagal memuat statistik');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
            Manajemen Server
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
          >
            Monitor dan kelola konfigurasi server
          </motion.p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Status Server"
          value={healthData?.status === 'sehat' ? 'Online' : 'Offline'}
          icon={Server}
          color={healthData?.status === 'sehat' ? 'green' : 'red'}
        />
        <StatCard
          title="Database"
          value={healthData?.database === 'terhubung' ? 'Terhubung' : 'Terputus'}
          icon={Database}
          color={healthData?.database === 'terhubung' ? 'green' : 'red'}
        />
        <StatCard
          title="Uptime"
          value={healthData ? formatUptime(healthData.uptime) : '-'}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Environment"
          value={healthData?.environment || '-'}
          icon={Settings}
          color="indigo"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Konfigurasi Server
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">Versi API</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {healthData?.versi || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">Environment</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {healthData?.environment || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">Database</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">SQLite</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">Rate Limit (Free)</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                100 req/15 menit
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">Rate Limit (Paid)</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                1000 req/15 menit
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Aksi Cepat
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBackup}
            disabled={actionLoading === 'backup'}
            className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Database className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {actionLoading === 'backup' ? 'Mengunduh...' : 'Backup Database'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Export data SQLite</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearCache}
            disabled={actionLoading === 'cache'}
            className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <HardDrive className="w-5 h-5 text-green-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {actionLoading === 'cache' ? 'Membersihkan...' : 'Clear Cache'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bersihkan cache server</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewStats}
            disabled={actionLoading === 'stats'}
            className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Activity className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {actionLoading === 'stats' ? 'Memuat...' : 'View Stats'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lihat statistik server</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ServerManagementPage;
