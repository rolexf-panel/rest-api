import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Info,
  Wrench,
} from 'lucide-react';
import api from '../lib/api';
import { useNotification } from '../context/NotificationContext';

const tipeOptions = [
  { value: 'info', label: 'Informasi', icon: Info, color: 'blue' },
  { value: 'success', label: 'Sukses', icon: CheckCircle, color: 'green' },
  { value: 'warning', label: 'Peringatan', icon: AlertTriangle, color: 'amber' },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'slate' },
];

function TipeBadge({ tipe }) {
  const option = tipeOptions.find((t) => t.value === tipe) || tipeOptions[0];
  const Icon = option.icon;

  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${colors[option.color]}`}
    >
      <Icon className="w-3 h-3" />
      {option.label}
    </span>
  );
}

function BroadcastManagementPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ judul: '', konten: '', tipe: 'info' });
  const notifikasi = useNotification();

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/owner/broadcasts');
      setBroadcasts(response.data.data);
    } catch (error) {
      notifikasi.error('Gagal memuat data broadcast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await api.patch(`/owner/broadcasts/${editData.id}`, formData);
        notifikasi.suksess('Broadcast berhasil diupdate');
      } else {
        await api.post('/owner/broadcasts', formData);
        notifikasi.suksess('Broadcast berhasil dibuat');
      }
      fetchBroadcasts();
      setShowModal(false);
      setEditData(null);
      setFormData({ judul: '', konten: '', tipe: 'info' });
    } catch (error) {
      notifikasi.error(error.response?.data?.pesan || 'Gagal menyimpan broadcast');
    }
  };

  const handleEdit = (broadcast) => {
    setEditData(broadcast);
    setFormData({ judul: broadcast.judul, konten: broadcast.konten, tipe: broadcast.tipe });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus broadcast ini?')) return;
    try {
      await api.delete(`/owner/broadcasts/${id}`);
      notifikasi.suksess('Broadcast berhasil dihapus');
      fetchBroadcasts();
    } catch (error) {
      notifikasi.error('Gagal menghapus broadcast');
    }
  };

  const handleToggle = async (broadcast) => {
    try {
      await api.patch(`/owner/broadcasts/${broadcast.id}`, { aktif: !broadcast.aktif });
      notifikasi.suksess(`Broadcast ${broadcast.aktif ? 'dinonaktifkan' : 'diaktifkan'}`);
      fetchBroadcasts();
    } catch (error) {
      notifikasi.error('Gagal mengubah status broadcast');
    }
  };

  const formatDate = (dateString) => {
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
            Manajemen Broadcast
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
          >
            Kelola pengumuman yang ditampilkan ke semua pengguna
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchBroadcasts}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditData(null);
              setFormData({ judul: '', konten: '', tipe: 'info' });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Buat Broadcast
          </motion.button>
        </div>
      </motion.div>

      {/* Broadcast List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400">Memuat data...</p>
          </div>
        ) : broadcasts.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {broadcasts.map((bc, index) => (
              <motion.div
                key={bc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <TipeBadge tipe={bc.tipe} />
                      {bc.aktif ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                          <CheckCircle className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                          <XCircle className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {bc.judul}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {bc.konten}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      {formatDate(bc.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggle(bc)}
                      className={`p-2 rounded-lg transition-colors ${
                        bc.aktif
                          ? 'hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={bc.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {bc.aktif ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(bc)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-slate-500" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(bc.id)}
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
            <Radio className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Belum ada broadcast</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Klik "Buat Broadcast" untuk membuat pengumuman baru
            </p>
          </div>
        )}
      </motion.div>

      {/* Modal Form */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {editData ? 'Edit Broadcast' : 'Buat Broadcast Baru'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Judul */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Judul
                    </label>
                    <input
                      type="text"
                      value={formData.judul}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Judul pengumuman..."
                    />
                  </div>

                  {/* Tipe */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tipe
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {tipeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, tipe: option.value })}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors ${
                              formData.tipe === option.value
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Konten */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Konten
                    </label>
                    <textarea
                      value={formData.konten}
                      onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Isi pengumuman..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {editData ? 'Simpan Perubahan' : 'Buat Broadcast'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default BroadcastManagementPage;
