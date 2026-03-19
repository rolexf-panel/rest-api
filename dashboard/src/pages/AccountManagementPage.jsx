import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Shield,
  Crown,
  User,
  CheckCircle,
  XCircle,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
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

function RoleBadge({ role }) {
  const styles = {
    owner:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    admin:
      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    user: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const icons = { owner: Crown, admin: Shield, user: User };
  const Icon = icons[role] || User;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${styles[role] || styles.user}`}
    >
      <Icon className="w-3 h-3" />
      {role}
    </span>
  );
}

function AccountManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const notifikasi = useNotification();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/owner/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data pengguna:', error);
      notifikasi.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.nama?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Ubah role
  const handleChangeRole = async (newRole) => {
    if (!selectedUser) return;
    try {
      await api.patch(`/owner/users/${selectedUser.id}/role`, { peran: newRole });
      notifikasi.suksess(`Role ${selectedUser.email} berhasil diubah ke ${newRole}`);
      fetchUsers();
      setShowEditModal(false);
    } catch (error) {
      notifikasi.error(error.response?.data?.pesan || 'Gagal mengubah role');
    }
  };

  // Hapus user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/owner/users/${selectedUser.id}`);
      notifikasi.suksess(`${selectedUser.email} berhasil dihapus`);
      fetchUsers();
      setShowDeleteModal(false);
    } catch (error) {
      notifikasi.error(error.response?.data?.pesan || 'Gagal menghapus pengguna');
    }
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
            Manajemen Akun
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
          >
            Kelola semua akun pengguna
          </motion.p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Pengguna</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {users.filter((u) => u.emailTerverifikasi).length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Terverifikasi</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {users.filter((u) => u.peran === 'admin' || u.peran === 'owner').length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Admin/Owner</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari pengguna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </motion.div>

      {/* User List */}
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
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Pengguna
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    Bergabung
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {(user.nama || user.email)?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.nama || '-'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <RoleBadge role={user.peran} />
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {user.emailTerverifikasi ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                          <XCircle className="w-4 h-4" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {user.peran !== 'owner' ? (
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Edit Role"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </motion.button>
                        </div>
                      ) : (
                        <span className="text-xs text-purple-500 dark:text-purple-400 font-medium">
                          Owner
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Tidak ada pengguna ditemukan</p>
          </div>
        )}
      </motion.div>

      {/* Modal Edit Role */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Ubah Role Pengguna
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Pilih role baru untuk{' '}
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedUser.email}
                  </span>
                </p>
                <div className="space-y-2">
                  {['user', 'admin'].map((role) => (
                    <motion.button
                      key={role}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleChangeRole(role)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectedUser.peran === role
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <RoleBadge role={role} />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {role === 'admin' ? 'Administrator dengan akses penuh' : 'Pengguna biasa'}
                      </span>
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
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
                    Hapus Pengguna
                  </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Apakah Anda yakin ingin menghapus pengguna ini?
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {selectedUser.nama}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleDeleteUser}
                    className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Ya, Hapus
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AccountManagementPage;
