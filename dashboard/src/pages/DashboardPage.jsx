import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Clock, HardDrive, Globe, Zap, RefreshCw } from 'lucide-react';
import api from '../lib/api';

// Varian animasi untuk container stagger
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Komponen skeleton loading
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  );
}

// Komponen kartu statistik dengan animasi
function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-slate-900 dark:text-white mt-1"
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`p-2.5 rounded-lg ${colorClasses[color]}`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Komponen kartu endpoint dengan animasi hover
function EndpointCard({ method, path, description, index = 0 }) {
  const methodColors = {
    GET: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    POST: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    PUT: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    PATCH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <motion.span
        whileHover={{ scale: 1.05 }}
        className={`px-2 py-0.5 text-xs font-bold rounded ${methodColors[method]}`}
      >
        {method}
      </motion.span>
      <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{path}</code>
      <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
        {description}
      </span>
    </motion.div>
  );
}

function DashboardPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await api.get('/health');
      setHealthData(response.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Gagal mengambil data health:', error);
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header halaman */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-slate-900 dark:text-white"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
          >
            Ringkasan status dan aktivitas REST API
          </motion.p>
        </div>
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

      {/* Kartu statistik dengan loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            title="Status API"
            value={healthData?.status === 'sehat' ? 'Sehat' : 'Error'}
            subtitle={healthData?.environment}
            icon={Activity}
            color={healthData?.status === 'sehat' ? 'green' : 'amber'}
          />
          <StatCard
            title="Uptime"
            value={healthData ? formatUptime(healthData.uptime) : '-'}
            subtitle="Sejak server dimulai"
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="Database"
            value={healthData?.database === 'terhubung' ? 'Terhubung' : 'Terputus'}
            subtitle="SQLite (Development)"
            icon={HardDrive}
            color={healthData?.database === 'terhubung' ? 'green' : 'amber'}
          />
          <StatCard
            title="Versi"
            value={healthData?.versi || '-'}
            subtitle="REST API Publik"
            icon={Zap}
            color="indigo"
          />
        </motion.div>
      )}

      {/* Info terakhir diupdate */}
      {lastUpdated && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-slate-400 dark:text-slate-500 text-right"
        >
          Terakhir diupdate: {lastUpdated.toLocaleTimeString('id-ID')}
        </motion.p>
      )}

      {/* Dua kolom: Endpoints & Quick Info */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Endpoints yang tersedia */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-500" />
            Endpoints Tersedia
          </h3>
          <div className="space-y-2">
            <EndpointCard method="GET" path="/api/v1/health" description="Health check" index={0} />
            <EndpointCard
              method="GET"
              path="/api/v1/broadcast"
              description="Broadcast aktif"
              index={1}
            />
            <EndpointCard
              method="POST"
              path="/api/v1/url/shorten"
              description="Singkat URL"
              index={2}
            />
            <EndpointCard
              method="POST"
              path="/api/v1/tools/hash"
              description="Hash teks"
              index={3}
            />
            <EndpointCard
              method="GET"
              path="/api/v1/tools/uuid"
              description="Generate UUID"
              index={4}
            />
            <EndpointCard
              method="POST"
              path="/api/v1/qr/generate"
              description="Generate QR"
              index={5}
            />
            <EndpointCard
              method="GET"
              path="/api/v1/cuaca/saat-ini"
              description="Info cuaca"
              index={6}
            />
            <EndpointCard
              method="POST"
              path="/api/v1/mata-uang/konversi"
              description="Konversi mata uang"
              index={7}
            />
          </div>
        </motion.div>

        {/* Quick Info */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Informasi API
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Base URL', value: healthData ? `http://localhost:3000/api/v1` : '-' },
              { label: 'Rate Limit (Free)', value: '100 request / 15 menit' },
              { label: 'Rate Limit (Paid)', value: '1000 request / 15 menit' },
              { label: 'Autentikasi', value: 'JWT Bearer Token' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ x: 4 }}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </p>
                <code className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                  {item.value}
                </code>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default DashboardPage;
