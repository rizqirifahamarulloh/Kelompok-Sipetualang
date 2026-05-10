import { useState, useRef } from 'react'
import { Sparkles, Camera, Upload, X, CheckCircle2 } from 'lucide-react'

export default function StepUnggahKTP({ onNext, onBack, onSkip, ktpFile, setKtpFile }) {
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (!file) return
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
    if (!validTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan JPG, PNG, atau HEIC.')
      return
    }
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.')
      return
    }

    setKtpFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleRemove = () => {
    setKtpFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="py-10 px-6 max-w-[700px] mx-auto">
      <div className="br-step-badge">
        <Sparkles size={16} />
        LANGKAH KETIGA
      </div>

      <h2 className="br-section-title">Unggah Foto KTP</h2>
      <p className="br-section-desc">
        Kami perlu memverifikasi identitas Anda untuk memastikan ekosistem persewaan gear tetap aman dan tepercaya bagi semua mitra.
      </p>

      {/* Upload Zone */}
      <div
        className={`br-upload-zone ${preview ? 'has-file' : ''} ${dragOver ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="KTP Preview" className="br-upload-preview" />
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove() }}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center border-none cursor-pointer hover:bg-red-600 transition-colors"
              title="Hapus foto"
            >
              <X size={16} />
            </button>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-600 font-medium">
              <CheckCircle2 size={18} />
              Foto berhasil diunggah
            </div>
          </div>
        ) : (
          <>
            <div className="br-upload-icon">
              <Camera size={24} className="text-gray-400" />
            </div>
            <h4>Klik atau tarik foto ke sini</h4>
            <p>Format file yang didukung: JPG, PNG, atau HEIC.</p>
            <p>Ukuran maksimal 5MB.</p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />
      </div>

      {!preview && (
        <button
          className="br-btn-upload"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} />
          Pilih File KTP
        </button>
      )}

      {/* Tips Card */}
      <div className="br-tips-card">
        <div className="br-tips-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <h4>Tips Agar Verifikasi Berhasil</h4>
        </div>
        <ul>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Gunakan KTP asli, bukan fotokopi atau scan hitam putih.
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Pastikan seluruh bagian KTP masuk ke dalam bingkai foto.
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Pencahayaan cukup dan hindari pantulan cahaya pada kartu.
          </li>
        </ul>
        <a href="#" className="br-tips-link">
          Lihat Contoh Foto Benar →
        </a>
      </div>

      {/* Navigation */}
      <div className="br-upload-nav">
        <button className="br-btn-back" onClick={onBack}>
          ← Kembali
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="br-btn-skip" onClick={onSkip}>
            Upload Nanti (Lewati)
          </button>
          <button
            className="br-btn-next"
            onClick={onNext}
          >
            Lanjut Ke Selesai
          </button>
        </div>
      </div>
    </div>
  )
}
