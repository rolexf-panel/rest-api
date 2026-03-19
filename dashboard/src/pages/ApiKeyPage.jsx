import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import api from '../lib/api';
import { useNotification } from '../context/NotificationContext';

function ApiKeyPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [newKeyData, setNewKeyData] = useState(null);
  const [formData, setFormData] = useState({ nama: '' });
  const [copiedId, setCopiedId] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});
  const notifikasi = useNotification();

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api-key');
      setKeys(response.data.data);
    } catch (error) {
      notifikasi.error('Gagal memuat daftar API key');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api-key', { nama: formData.nama });
      setNewKeyData(response.data.data);
      setShowCreateModal(false);
      setFormData({ nama: '' });
      notifikasi.suksess('API key berhasil dibuat! Simpan dengan aman.');
      fetchKeys();
    } catch (error) {
      notifikasi.error('Gagal membuat API key');
    }
  };

  const handleDelete = async () => {
    if (!selectedKey) return;
    try {
      await api.delete(`/api-key/${selectedKey.id}`);
      notifikasi.suksess('API key berhasil dihapus');
      fetchKeys();
      setShowDeleteModal(false);
      setSelectedKey(null);
    } catch (error) {
      notifikasi.error('Gagal menghapus API key');
    }
  };

  const handleRegenerate = async (key) => {
    try {
      const response = await api.patch(`/api-key/${key.id}/regenerate`);
      notifikasi.suksess('API key berhasil diregenerasi!');
      setNewKeyData(response.data.data);
      fetchKeys();
    } catch (error) {
      notifikasi.error('Gagal meregenerasi API key');
    }
  };

  const handleToggle = async (key) => {
    const endpoint = key.aktif ? 'nonaktifkan' : 'aktifkan';
    try {
      await api.patch(`/api-key/${key.id}/${endpoint}`);
      notifikasi.suksess(`API key berhasil ${key.aktif ? 'dinonaktifkan' : 'diaktifkan'}`);
      fetchKeys();
    } catch (error) {
      notifikasi.error('Gagal mengubah status API key');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
            API Keys
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
          >
            Kelola API key untuk akses endpoint
          </motion.p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setNewKeyData(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat API Key
        </motion.button>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
      >
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Simpan API Key dengan Aman
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            API key hanya ditampilkan sekali saat dibuat. Simpan di tempat yang aman.
          </p>
        </div>
      </motion.div>

      {/* API Keys List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400">Memuat...</p>
          </div>
        ) : keys.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {keys.map((key, index) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Key className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-slate-900 dark:text-white">{key.nama}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          key.aktif
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {key.aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                        {visibleKeys[key.id] ? 'sk_••••••••••••••••' : key.kunciPrefix + '••••••••'}
                      </code>
                      <button
                        onClick={() =>
                          setVisibleKeys((prev) => ({ ...prev, [key.id]: !prev[key.id] }))
                        }
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                      >
                        {visibleKeys[key.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.kunciPrefix + '••••••••', key.id)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                      >
                        {copiedId === key.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      Terakhir digunakan: {formatDate(key.terakhirDigunakan)} | Dibuat:{' '}
                      {formatDate(key.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggle(key)}
                      className={`p-2 rounded-lg transition-colors ${
                        key.aktif
                          ? 'hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400'
                          : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500'
                      }`}
                      title={key.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <Shield className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRegenerate(key)}
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Regenerasi"
                    >
                      <RefreshCw className="w-4 h-4 text-blue-500" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedKey(key);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Key className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Belum ada API key</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Klik "Buat API Key" untuk membuat yang pertama
            </p>
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Buat API Key Baru
                </h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nama API Key
                    </label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ nama: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Contoh: Production API"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Buat
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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

      {/* Success Modal - Show New API Key */}
      <AnimatePresence>
        {newKeyData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setNewKeyData(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    API Key Dibuat!
                  </h3>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Nama:</p>
                  <p className="font-medium text-slate-900 dark:text-white mb-4">
                    {newKeyData.nama}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">API Key:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm text-slate-900 dark:text-white break-all bg-white dark:bg-slate-900 p-2 rounded border">
                      {newKeyData.kunci}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newKeyData.kunci, 'new')}
                      className="p-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      {copiedId === 'new' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Pastikan salin dan simpan API key ini sekarang. Tidak akan ditampilkan lagi!
                  </p>
                </div>
                <button
                  onClick={() => setNewKeyData(null)}
                  className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Saya Sudah Menyimpan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ApiKeyPage;
