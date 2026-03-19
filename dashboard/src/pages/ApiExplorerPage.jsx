import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Play,
  Copy,
  Check,
  ChevronDown,
  Code2,
  AlertCircle,
  X,
  Key,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import axios from 'axios';
import api from '../lib/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const endpoints = [
  {
    grup: 'System',
    icon: Code2,
    items: [
      { method: 'GET', path: '/health', deskripsi: 'Health check API', aktif: true, publik: true },
    ],
  },
  {
    grup: 'URL Shortener',
    icon: Code2,
    items: [
      {
        method: 'POST',
        path: '/url/shorten',
        deskripsi: 'Buat URL pendek',
        aktif: true,
        body: { urlAsli: 'https://example.com/panjang' },
      },
      { method: 'GET', path: '/url/info/:kode', deskripsi: 'Info statistik URL', aktif: true },
    ],
  },
  {
    grup: 'Tools Teks',
    icon: Code2,
    items: [
      {
        method: 'POST',
        path: '/tools/hash',
        deskripsi: 'Hash teks (MD5, SHA256, bcrypt)',
        aktif: true,
        body: { teks: 'contoh teks', algoritma: 'sha256' },
      },
      {
        method: 'POST',
        path: '/tools/encode',
        deskripsi: 'Base64 / URL encode',
        aktif: true,
        body: { teks: 'contoh', tipe: 'base64' },
      },
      {
        method: 'POST',
        path: '/tools/decode',
        deskripsi: 'Base64 / URL decode',
        aktif: true,
        body: { teks: 'Y29udG9o', tipe: 'base64' },
      },
      { method: 'GET', path: '/tools/uuid', deskripsi: 'Generate UUID v4', aktif: true },
    ],
  },
  {
    grup: 'QR Code',
    icon: Code2,
    items: [
      {
        method: 'POST',
        path: '/qr/generate',
        deskripsi: 'Generate QR code dari teks/URL',
        aktif: true,
        body: { teks: 'https://example.com', format: 'png' },
      },
    ],
  },
  {
    grup: 'Catatan',
    icon: Code2,
    items: [
      { method: 'GET', path: '/catatan', deskripsi: 'Daftar catatan', aktif: true },
      {
        method: 'POST',
        path: '/catatan',
        deskripsi: 'Buat catatan baru',
        aktif: true,
        body: { judul: 'Judul Catatan', konten: 'Isi catatan...', publik: true },
      },
      { method: 'GET', path: '/catatan/:id', deskripsi: 'Ambil catatan', aktif: true },
    ],
  },
  {
    grup: 'Jaringan',
    icon: Code2,
    items: [
      { method: 'GET', path: '/jaringan/ip', deskripsi: 'IP address caller', aktif: true },
      { method: 'GET', path: '/jaringan/user-agent', deskripsi: 'Info user-agent', aktif: true },
      {
        method: 'GET',
        path: '/jaringan/cek-url',
        deskripsi: 'Cek status URL',
        aktif: true,
        params: '?url=https://google.com',
      },
    ],
  },
  {
    grup: 'Cuaca',
    icon: Code2,
    items: [
      {
        method: 'GET',
        path: '/cuaca/saat-ini',
        deskripsi: 'Cuaca saat ini',
        aktif: true,
        params: '?kota=Jakarta',
      },
      {
        method: 'GET',
        path: '/cuaca/prakiraan',
        deskripsi: 'Prakiraan cuaca 5 hari',
        aktif: true,
        params: '?kota=Jakarta',
      },
    ],
  },
  {
    grup: 'Mata Uang',
    icon: Code2,
    items: [
      { method: 'GET', path: '/mata-uang/kurs', deskripsi: 'Daftar kurs mata uang', aktif: true },
      {
        method: 'POST',
        path: '/mata-uang/konversi',
        deskripsi: 'Konversi mata uang',
        aktif: true,
        body: { dari: 'USD', ke: 'IDR', jumlah: 100 },
      },
    ],
  },
  {
    grup: 'Password Generator',
    icon: Code2,
    items: [
      {
        method: 'POST',
        path: '/password/generate',
        deskripsi: 'Generate kata sandi',
        aktif: true,
        body: { panjang: 16, hurufBesar: true, angka: true, simbol: true },
      },
      {
        method: 'POST',
        path: '/password/cek-kekuatan',
        deskripsi: 'Cek kekuatan kata sandi',
        aktif: true,
        body: { kataSandi: 'Password123' },
      },
    ],
  },
  {
    grup: 'Lorem Ipsum',
    icon: Code2,
    items: [
      {
        method: 'GET',
        path: '/lorem/kata',
        deskripsi: 'Generate kata Lorem Ipsum',
        aktif: true,
        params: '?jumlah=10',
      },
      {
        method: 'GET',
        path: '/lorem/kalimat',
        deskripsi: 'Generate kalimat Lorem Ipsum',
        aktif: true,
        params: '?jumlah=3',
      },
      {
        method: 'GET',
        path: '/lorem/paragraf',
        deskripsi: 'Generate paragraf Lorem Ipsum',
        aktif: true,
        params: '?jumlah=2',
      },
    ],
  },
  {
    grup: 'Timestamp',
    icon: Code2,
    items: [
      { method: 'GET', path: '/timestamp/now', deskripsi: 'Timestamp saat ini', aktif: true },
      {
        method: 'POST',
        path: '/timestamp/konversi',
        deskripsi: 'Konversi timestamp ke tanggal',
        aktif: true,
        body: { timestamp: 1773910502 },
      },
      {
        method: 'POST',
        path: '/timestamp/durasi',
        deskripsi: 'Hitung durasi',
        aktif: true,
        body: { mulai: 1773910502, selesai: 1773914102 },
      },
    ],
  },
  {
    grup: 'JSON Tools',
    icon: Code2,
    items: [
      {
        method: 'POST',
        path: '/json/format',
        deskripsi: 'Format JSON',
        aktif: true,
        body: { json: { name: 'test', age: 25 } },
      },
      {
        method: 'POST',
        path: '/json/minify',
        deskripsi: 'Minify JSON',
        aktif: true,
        body: { json: { name: 'test', age: 25 } },
      },
      {
        method: 'POST',
        path: '/json/validasi',
        deskripsi: 'Validasi JSON',
        aktif: true,
        body: { json: { name: 'test' } },
      },
      {
        method: 'POST',
        path: '/json/escape',
        deskripsi: 'Escape string',
        aktif: true,
        body: { teks: 'Hello "World"' },
      },
    ],
  },
  {
    grup: 'String Utils',
    icon: Code2,
    items: [
      {
        method: 'POST',
        path: '/string/hitung',
        deskripsi: 'Hitung karakter, kata, baris',
        aktif: true,
        body: { teks: 'Hello World' },
      },
      {
        method: 'POST',
        path: '/string/ubah-case',
        deskripsi: 'Ubah case teks',
        aktif: true,
        body: { teks: 'Hello World', tipe: 'uppercase' },
      },
      {
        method: 'POST',
        path: '/string/balik',
        deskripsi: 'Balik teks',
        aktif: true,
        body: { teks: 'Hello World' },
      },
      {
        method: 'POST',
        path: '/string/truncate',
        deskripsi: 'Potong teks',
        aktif: true,
        body: { teks: 'Teks panjang', panjang: 20 },
      },
      {
        method: 'POST',
        path: '/string/slug',
        deskripsi: 'Buat slug',
        aktif: true,
        body: { teks: 'Judul Artikel Blog' },
      },
    ],
  },
  {
    grup: 'Color Tools',
    icon: Code2,
    items: [
      {
        method: 'POST',
        path: '/color/hex-ke-rgb',
        deskripsi: 'Konversi HEX ke RGB',
        aktif: true,
        body: { hex: '#6366f1' },
      },
      {
        method: 'POST',
        path: '/color/rgb-ke-hex',
        deskripsi: 'Konversi RGB ke HEX',
        aktif: true,
        body: { r: 99, g: 102, b: 241 },
      },
      { method: 'GET', path: '/color/random', deskripsi: 'Generate warna random', aktif: true },
      {
        method: 'POST',
        path: '/color/palet',
        deskripsi: 'Generate palet warna',
        aktif: true,
        body: { jumlah: 5 },
      },
    ],
  },
  {
    grup: 'Number Tools',
    icon: Code2,
    items: [
      {
        method: 'POST',
        path: '/number/random',
        deskripsi: 'Generate angka random',
        aktif: true,
        body: { min: 1, max: 100 },
      },
      {
        method: 'POST',
        path: '/number/format',
        deskripsi: 'Format angka',
        aktif: true,
        body: { angka: 1500000, tipe: 'rupiah' },
      },
      {
        method: 'POST',
        path: '/number/kalkulasi',
        deskripsi: 'Kalkulasi matematika',
        aktif: true,
        body: { operasi: 'tambah', a: 10, b: 5 },
      },
      {
        method: 'GET',
        path: '/number/fibonacci/:n',
        deskripsi: 'Generate Fibonacci',
        aktif: true,
        params: '?n=10',
      },
    ],
  },
  {
    grup: 'Brat Generator',
    icon: Code2,
    items: [
      {
        method: 'POST',
        path: '/brat/brat',
        deskripsi: 'Generate brat image (PNG)',
        aktif: true,
        body: { teks: 'HELLO' },
      },
      {
        method: 'POST',
        path: '/brat/bratvid',
        deskripsi: 'Generate brat sticker (WebP)',
        aktif: true,
        body: { teks: 'BRAT' },
      },
    ],
  },
];

const methodColors = {
  GET: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  POST: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  PUT: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  PATCH:
    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  DELETE:
    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

function TestResultInline({ result, onClose }) {
  const mediaUrl = result.data?.data?.url;
  const isImage =
    mediaUrl &&
    (mediaUrl.endsWith('.png') ||
      mediaUrl.endsWith('.jpg') ||
      mediaUrl.endsWith('.jpeg') ||
      mediaUrl.endsWith('.gif') ||
      mediaUrl.endsWith('.webp'));
  const isVideo = mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm'));
  const fullMediaUrl = mediaUrl
    ? mediaUrl.startsWith('http')
      ? mediaUrl
      : `${window.location.origin}${mediaUrl}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div
        className={`rounded-lg border p-4 ${
          result.error
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold ${
                result.error
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-green-700 dark:text-green-400'
              }`}
            >
              {result.loading ? 'Memuat...' : result.error ? 'Error' : `Status: ${result.status}`}
            </span>
            {result.duration > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                {result.duration}ms
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </motion.button>
        </div>

        {result.error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{result.error}</p>
        )}

        {mediaUrl && !result.loading && !result.error && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              {isVideo ? 'Video:' : 'Gambar:'}
            </p>
            {isVideo ? (
              <video
                src={fullMediaUrl}
                controls
                className="max-w-full rounded-lg border border-slate-200 dark:border-slate-700"
                style={{ maxHeight: '300px' }}
              />
            ) : (
              <img
                src={fullMediaUrl}
                alt="Result"
                className="max-w-full rounded-lg border border-slate-200 dark:border-slate-700"
                style={{ maxHeight: '300px' }}
              />
            )}
          </div>
        )}

        {result.data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Response:</p>
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto max-h-60 overflow-y-auto p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function EndpointItem({ endpoint, testResult, onTest, onCloseResult }) {
  const [copied, setCopied] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [customBody, setCustomBody] = useState(
    endpoint.body ? JSON.stringify(endpoint.body, null, 2) : ''
  );
  const [hasCustomBody, setHasCustomBody] = useState(false);

  const copyPath = () => {
    const fullPath = endpoint.params
      ? `/api/v1${endpoint.path}${endpoint.params}`
      : `/api/v1${endpoint.path}`;
    navigator.clipboard.writeText(fullPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = () => {
    const bodyToSend = hasCustomBody && customBody ? JSON.parse(customBody) : endpoint.body;
    const endpointWithCustomBody = { ...endpoint, body: bodyToSend };
    onTest(endpointWithCustomBody);
  };

  const handleCustomBodyChange = (e) => {
    setCustomBody(e.target.value);
    try {
      JSON.parse(e.target.value);
      setHasCustomBody(e.target.value !== JSON.stringify(endpoint.body, null, 2));
    } catch {
      setHasCustomBody(true);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
        <span
          className={`px-2.5 py-1 text-xs font-bold rounded border ${methodColors[endpoint.method]}`}
        >
          {endpoint.method}
        </span>

        <div className="flex-1 min-w-0">
          <code className="text-sm font-mono break-all text-slate-800 dark:text-slate-200">
            {endpoint.path}
            {endpoint.params && (
              <span className="text-indigo-500 dark:text-indigo-400">{endpoint.params}</span>
            )}
          </code>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">{endpoint.deskripsi}</p>
            {endpoint.publik && (
              <span className="px-1.5 py-0.5 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                Publik
              </span>
            )}
            {hasCustomBody && (
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded">
                Custom
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={copyPath}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Salin path"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {endpoint.body && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEditor(!showEditor)}
              className={`p-1.5 rounded transition-colors ${
                showEditor
                  ? 'bg-indigo-100 dark:bg-indigo-900/30'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Edit request body"
            >
              <Code2 className={`w-4 h-4 ${showEditor ? 'text-indigo-500' : 'text-slate-400'}`} />
            </motion.button>
          )}

          {endpoint.aktif && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleTest}
              className="p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              title="Test endpoint"
            >
              <Play className="w-4 h-4 text-indigo-500" />
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showEditor && endpoint.body && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Request Body (editable):
              </p>
              <button
                onClick={() => {
                  setCustomBody(JSON.stringify(endpoint.body, null, 2));
                  setHasCustomBody(false);
                }}
                className="text-xs text-indigo-500 hover:text-indigo-600"
              >
                Reset
              </button>
            </div>
            <textarea
              value={customBody}
              onChange={handleCustomBodyChange}
              className="w-full h-32 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Masukkan JSON body..."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!showEditor && endpoint.body && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden"
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            Request Body (klik icon <Code2 className="w-3 h-3 inline" /> untuk edit):
          </p>
          <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
            {hasCustomBody ? customBody : JSON.stringify(endpoint.body, null, 2)}
          </pre>
        </motion.div>
      )}

      <AnimatePresence>
        {testResult && <TestResultInline result={testResult} onClose={onCloseResult} />}
      </AnimatePresence>
    </div>
  );
}

function GrupEndpoints({ grup, isOpen, onToggle, testResults, onTest, onCloseResult }) {
  const aktifCount = grup.items.filter((i) => i.aktif).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <motion.button
        whileTap={{ scale: 0.995 }}
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <grup.icon className="w-5 h-5 text-indigo-500" />
        <span className="font-semibold text-slate-900 dark:text-white">{grup.grup}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
          ({grup.items.length} endpoint{aktifCount > 0 ? `, ${aktifCount} aktif` : ''})
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              {grup.items.map((endpoint, idx) => {
                const key = `${endpoint.method}-${endpoint.path}`;
                return (
                  <EndpointItem
                    key={idx}
                    endpoint={endpoint}
                    testResult={testResults[key]}
                    onTest={onTest}
                    onCloseResult={() => onCloseResult(key)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ApiExplorerPage() {
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState(new Set([0, 1]));
  const [testResults, setTestResults] = useState({});
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('explorer_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const { user } = useAuth();
  const notifikasi = useNotification();

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('explorer_api_key', apiKey);
    }
  }, [apiKey]);

  const toggleGroup = (index) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const testEndpoint = async (endpoint) => {
    const key = `${endpoint.method}-${endpoint.path}`;

    if (!endpoint.publik && !apiKey) {
      setTestResults((prev) => ({
        ...prev,
        [key]: {
          error: 'API key diperlukan. Masukkan API key di kolom di atas.',
          duration: 0,
        },
      }));
      return;
    }

    setTestResults((prev) => ({
      ...prev,
      [key]: { loading: true },
    }));

    try {
      const axiosInstance = axios.create({
        baseURL: '/api/v1',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        },
      });

      const startTime = Date.now();
      let path = endpoint.path.replace(':id', 'contoh-id-123').replace(':n', '10');

      if (endpoint.params) {
        path += endpoint.params;
      }

      let response;
      if (endpoint.method === 'GET') {
        response = await axiosInstance.get(path);
      } else {
        response = await axiosInstance.post(path, endpoint.body || {});
      }

      const duration = Date.now() - startTime;

      setTestResults((prev) => ({
        ...prev,
        [key]: {
          status: response.status,
          duration,
          data: response.data,
          error: null,
        },
      }));
    } catch (error) {
      const status = error.response?.status;
      let pesan = error.message;

      if (status === 401) pesan = 'API key tidak valid atau tidak aktif';
      else if (status === 404) pesan = 'Endpoint tidak ditemukan';
      else if (status === 429) pesan = 'Rate limit tercapai. Coba lagi nanti.';
      else if (status === 400) pesan = error.response?.data?.pesan || 'Request tidak valid';
      else if (!error.response) pesan = 'Tidak dapat terhubung ke server';

      setTestResults((prev) => ({
        ...prev,
        [key]: {
          status: status || 'Error',
          duration: 0,
          data: error.response?.data || null,
          error: pesan,
        },
      }));
    }
  };

  const closeResult = (key) => {
    setTestResults((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const filteredEndpoints = endpoints
    .map((grup) => ({
      ...grup,
      items: grup.items.filter(
        (item) =>
          item.path.toLowerCase().includes(search.toLowerCase()) ||
          item.deskripsi.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((grup) => grup.items.length > 0);

  const totalEndpoints = endpoints.reduce((acc, g) => acc + g.items.length, 0);
  const aktifEndpoints = endpoints.reduce(
    (acc, g) => acc + g.items.filter((i) => i.aktif).length,
    0
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-slate-900 dark:text-white"
        >
          API Explorer
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-500 dark:text-slate-400 mt-1"
        >
          Jelajahi dan test semua endpoint ({aktifEndpoints} aktif dari {totalEndpoints})
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showApiKey ? 'text' : 'password'}
            placeholder="Masukkan API Key (X-API-Key)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            {showApiKey ? (
              <EyeOff className="w-4 h-4 text-slate-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
        {apiKey && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => {
              setApiKey('');
              localStorage.removeItem('explorer_api_key');
              notifikasi.info('API key dihapus');
            }}
            className="px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            Hapus
          </motion.button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari endpoint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
      >
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Endpoint Berbeda Tergantung Akses
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            Klik <Play className="w-3 h-3 inline" /> untuk test. Endpoint publik (hijau) tidak butuh
            API key. Endpoint privat memerlukan API key yang valid.
          </p>
        </div>
      </motion.div>

      <div className="space-y-4">
        {filteredEndpoints.length > 0 ? (
          filteredEndpoints.map((grup, index) => (
            <GrupEndpoints
              key={grup.grup}
              grup={grup}
              isOpen={openGroups.has(index)}
              onToggle={() => toggleGroup(index)}
              testResults={testResults}
              onTest={testEndpoint}
              onCloseResult={closeResult}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Code2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            </motion.div>
            <p className="text-slate-500 dark:text-slate-400">Tidak ada endpoint yang cocok</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default ApiExplorerPage;
