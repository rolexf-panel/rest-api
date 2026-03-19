import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  Save,
  Check,
  X,
  Users,
  TrendingUp,
  RefreshCw,
  Trash2,
  Ban,
  Play,
  Eye,
} from 'lucide-react';
import api from '../lib/api';
import { useNotification } from '../context/NotificationContext';

const paketOptions = [
  { id: 'free', nama: 'Free', deskripsi: 'Untuk penggunaan ringan', limit: 100, warna: 'slate' },
  { id: 'basic', nama: 'Basic', deskripsi: 'Untuk penggunaan moderate', limit: 500, warna: 'blue' },
  {
    id: 'premium',
    nama: 'Premium',
    deskripsi: 'Untuk penggunaan tinggi',
    limit: 1000,
    warna: 'indigo',
  },
  {
    id: 'enterprise',
    nama: 'Enterprise',
    deskripsi: 'Untuk penggunaan sangat tinggi',
    limit: 5000,
    warna: 'purple',
  },
];

const warnaStyles = {
  slate: 'border-slate-200 dark:border-slate-700',
  blue: 'border-blue-200 dark:border-blue-800',
  indigo: 'border-indigo-200 dark:border-indigo-800',
  purple: 'border-purple-200 dark:border-purple-800',
};

const warnaBg = {
  slate: 'bg-slate-50 dark:bg-slate-900',
  blue: 'bg-blue-50 dark:bg-blue-900',
  indigo: 'bg-indigo-50 dark:bg-indigo-900',
  purple: 'bg-purple-50 dark:bg-purple-900',
};

function ApiKeySettingsPage() {
  const [stats, setStats] = useState(null);
  const [allKeys, setAllKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paket, setPaket] = useState('free');
  const [customLimits, setCustomLimits] = useState({
    free: 100,
    basic: 500,
    premium: 1000,
    enterprise: 5000,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [meta, setMeta] = useState({ halaman: 1, total: 0 });
  const notifikasi = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, keysRes, limitsRes] = await Promise.all([
        api.get('/owner/api-keys/stats'),
        api.get('/owner/api-keys'),
        api.get('/owner/api-keys/rate-limits'),
      ]);
      setStats(statsRes.data.data);
      setAllKeys(keysRes.data.data);
      setMeta(keysRes.data.meta);

      if (limitsRes.data.data.limits && limitsRes.data.data.limits.length > 0) {
        const newLimits = {};
        limitsRes.data.data.limits.forEach((l) => {
          newLimits[l.paket] = l.limit;
        });
        setCustomLimits(newLimits);
      }

      if (limitsRes.data.data.defaultTier) {
        setPaket(limitsRes.data.data.defaultTier);
      }
    } catch (error) {
      notifikasi.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRateLimits = async () => {
    setSaving(true);
    try {
      const limits = Object.entries(customLimits).map(([paketId, limit]) => ({
        paket: paketId,
        nama: paketOptions.find((p) => p.id === paketId)?.nama || paketId,
        limit,
      }));

      await api.put('/owner/api-keys/rate-limits', {
        limits,
        defaultTier: paket,
      });

      notifikasi.suksess('Pengaturan rate limit berhasil disimpan');
      fetchData();
    } catch (error) {
      notifikasi.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (key) => {
    try {
      await api.patch(`/owner/api-keys/${key.id}/revoke`);
      notifikasi.suksess('API key berhasil direvoke');
      fetchData();
    } catch (error) {
      notifikasi.error('Gagal revoke API key');
    }
  };

  const handleActivate = async (key) => {
    try {
      await api.patch(`/owner/api-keys/${key.id}/aktifkan`);
      notifikasi.suksess('API key berhasil diaktifkan');
      fetchData();
    } catch (error) {
      notifikasi.error('Gagal mengaktifkan API key');
    }
  };

  const handleDelete = () => {
    if (!selectedKey) return;
    const keyId = selectedKey.id;

    api
      .delete(`/owner/api-keys/${keyId}`)
      .then(() => {
        notifikasi.suksess('API key berhasil dihapus');
        setShowDeleteModal(false);
        setSelectedKey(null);
        fetchData();
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          notifikasi.suksess('API key berhasil dihapus');
          setShowDeleteModal(false);
          setSelectedKey(null);
          fetchData();
        } else {
          console.error('Delete error:', error);
          notifikasi.error('Gagal menghapus API key');
        }
      });
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-slate-900 dark:text-white"
        >
          Pengaturan API Key
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-500 dark:text-slate-400 mt-1"
        >
          Kelola paket, limit, dan semua API key
        </motion.p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              title="Total API Keys"
              value={stats?.totalKeys || 0}
              icon={Key}
              color="indigo"
            />
            <StatCard
              title="Keys Aktif"
              value={stats?.activeKeys || 0}
              icon={Shield}
              color="green"
            />
            <StatCard
              title="Total Request"
              value={stats?.totalRequests?.toLocaleString() || '0'}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Request Hari Ini"
              value={stats?.requestsToday?.toLocaleString() || '0'}
              icon={Clock}
              color="amber"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" />
                  Semua API Keys ({meta.total})
                </h3>
                <button
                  onClick={fetchData}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {allKeys.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {allKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {key.nama}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              key.aktif
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {key.aktif ? 'Aktif' : 'Revoked'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <code className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {key.kunciPrefix}••••••••
                          </code>
                          {key.pengguna && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {key.pengguna.email}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mt-1">
                          <span>Dibuat: {formatDate(key.createdAt)}</span>
                          <span>Terakhir: {formatDate(key.terakhirDigunakan)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {key.aktif ? (
                          <button
                            onClick={() => handleRevoke(key)}
                            className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Revoke"
                          >
                            <Ban className="w-4 h-4 text-amber-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(key)}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Aktifkan"
                          >
                            <Play className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedKey(key);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Key className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">Belum ada API key</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              Paket Rate Limit
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Pilih paket default untuk pengguna baru
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {paketOptions.map((opt) => (
                <motion.button
                  key={opt.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaket(opt.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paket === opt.id
                      ? `${warnaStyles[opt.warna]} ${warnaBg[opt.warna]}`
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{opt.nama}</span>
                    {paket === opt.id && (
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{opt.deskripsi}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {opt.limit}{' '}
                    <span className="text-xs font-normal text-slate-500">req/15 menit</span>
                  </p>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveRateLimits}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Simpan Paket
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Custom Limit per Paket
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Atur limit rate kustom untuk setiap paket (req/15 menit)
            </p>

            <div className="space-y-4 mb-6">
              {paketOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{opt.nama}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Request per 15 menit
                    </p>
                  </div>
                  <input
                    type="number"
                    min="10"
                    max="100000"
                    value={customLimits[opt.id]}
                    onChange={(e) =>
                      setCustomLimits((prev) => ({
                        ...prev,
                        [opt.id]: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-32 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveRateLimits}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Simpan Limits
              </motion.button>
            </div>
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {showDeleteModal && selectedKey && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Hapus API Key
                  </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Apakah Anda yakin ingin menghapus API key "{selectedKey.nama}"? Tindakan ini tidak
                  dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color = 'indigo' }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  };

  return (
    <motion.div
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

export default ApiKeySettingsPage;
