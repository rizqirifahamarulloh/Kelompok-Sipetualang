import { useState, useEffect } from 'react'
import { Sparkles, UserRound, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const equipmentOptions = [
  'DSLR & Mirrorless',
  'Lensa Pro',
  'Lighting & Studio',
  'Drone',
  'Action Cam',
  'Audio Gear',
]

export default function StepFormPendaftaran({ onNext, onBack, formData, setFormData }) {
  const { user } = useAuth()

  // Auto-fill dari data user yang sudah terdaftar
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        telepon: prev.telepon || user.no_telepon || user.phone || '',
      }))
    }
  }, [user, setFormData])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleEquipment = (item) => {
    setFormData(prev => {
      const current = prev.equipment || []
      if (current.includes(item)) {
        return { ...prev, equipment: current.filter(e => e !== item) }
      }
      return { ...prev, equipment: [...current, item] }
    })
  }

  const canProceed =
    formData.namaLengkap?.trim() &&
    formData.email?.trim() &&
    formData.telepon?.trim() &&
    formData.tanggalLahir?.trim() &&
    (formData.equipment || []).length > 0

  return (
    <div className="py-10 px-6 max-w-[700px] mx-auto">
      <div className="br-step-badge">
        <Sparkles size={16} />
        LANGKAH KEDUA
      </div>

      <h2 className="br-section-title">Form Pendaftaran Rental</h2>
      <p className="br-section-desc">
        Lengkapi data diri Kamu. Informasi ini akan digunakan untuk proses verifikasi dan ditampilkan pada profil publik Kamu.
      </p>

      {/* Data Diri Header */}
      <div className="br-data-diri-header">
        <UserRound size={20} />
        Data Diri
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-6 gap-y-0">
        <div className="br-form-group">
          <label className="br-form-label">Nama Lengkap (Sesuai KTP)</label>
          <input
            type="text"
            className="br-form-input"
            placeholder="Contoh: Andi Wijaya"
            value={formData.namaLengkap || ''}
            onChange={(e) => handleChange('namaLengkap', e.target.value)}
          />
        </div>

        <div className="br-form-group">
          <label className="br-form-label">Email Aktif</label>
          <input
            type="email"
            className="br-form-input"
            placeholder="andi@example.com"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={!!user?.email}
          />
        </div>

        <div className="br-form-group">
          <label className="br-form-label">Nomor Telepon (WhatsApp)</label>
          <div className="br-form-input-phone">
            <span className="br-phone-prefix">+62</span>
            <input
              type="tel"
              placeholder="81234567890"
              value={formData.telepon || ''}
              onChange={(e) => handleChange('telepon', e.target.value)}
              disabled={!!user?.no_telepon || !!user?.phone}
            />
          </div>
        </div>

        <div className="br-form-group">
          <label className="br-form-label">Tanggal Lahir</label>
          <input
            type="date"
            className="br-form-input"
            value={formData.tanggalLahir || ''}
            onChange={(e) => handleChange('tanggalLahir', e.target.value)}
          />
        </div>
      </div>

      {/* Jenis Peralatan */}
      <div className="mt-4 mb-2">
        <label className="br-form-label">Jenis Peralatan Tersedia</label>
        <div className="br-equipment-tags">
          {equipmentOptions.map((item) => {
            const isSelected = (formData.equipment || []).includes(item)
            return (
              <button
                key={item}
                type="button"
                className={`br-equipment-tag ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleEquipment(item)}
              >
                {item}
                {isSelected && <Check size={14} strokeWidth={3} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="br-nav-buttons">
        <button className="br-btn-back" onClick={onBack}>
          ← Kembali
        </button>
        <button
          className="br-btn-next"
          disabled={!canProceed}
          onClick={onNext}
        >
          Simpan & Lanjutkan →
        </button>
      </div>
    </div>
  )
}
