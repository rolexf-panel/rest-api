import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Zap,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const notifikasi = useNotification();

  const [formData, setFormData] = useState({ email: '', kataSandi: '', nama: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState([]);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setErrorDetails([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorDetails([]);

    try {
      const result = await register(formData.email, formData.kataSandi, formData.nama);
      setSuccess(result);
      notifikasi.suksess('Registrasi berhasil! Silakan verifikasi melalui Telegram.');
    } catch (err) {
      const response = err.response?.data;
      const pesan = response?.pesan || 'Registrasi gagal. Silakan coba lagi.';
      setError(pesan);
      notifikasi.error(pesan);
      if (response?.errors && Array.isArray(response.errors)) {
        setErrorDetails(response.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (success?.verifikasiLink) {
      navigator.clipboard.writeText(success.verifikasiLink);
      setCopied(true);
      notifikasi.suksess('Link verifikasi berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(formData.kataSandi);
  const strengthLabels = ['', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Registrasi Berhasil!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Silakan verifikasi akun Anda melalui Telegram
            </p>

            {/* Verification Link */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Link Verifikasi:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-indigo-600 dark:text-indigo-400 font-mono truncate">
                  {success.verifikasiLink}
                </code>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyLink}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Telegram Button */}
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={success.verifikasiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0088cc] text-white font-medium rounded-xl hover:bg-[#0077b5] transition-colors shadow-lg shadow-[#0088cc]/25 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.094.034.306.019.472z" />
              </svg>
              Buka Telegram untuk Verifikasi
              <ExternalLink className="w-4 h-4" />
            </motion.a>

            {/* Info */}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Link verifikasi berlaku selama 24 jam
            </p>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Link
                to="/login"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Kembali ke halaman login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Buat Akun Baru</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Daftar untuk mengakses REST API Dashboard
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                    {/* Tampilkan detail error validasi */}
                    {errorDetails.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {errorDetails.map((err, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-red-500 rounded-full shrink-0" />
                            <span className="font-medium">{err.field}:</span> {err.pesan}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Budi Santoso"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Kata Sandi */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="kataSandi"
                  value={formData.kataSandi}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.kataSandi && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= strength
                            ? strengthColors[strength]
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kekuatan: <span className="font-medium">{strengthLabels[strength]}</span>
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Minimal 8 karakter, huruf besar, huruf kecil, dan angka
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Daftar
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">atau</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Sudah punya akun?{' '}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Masuk sekarang
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">REST API Dashboard v1.0.0</p>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
