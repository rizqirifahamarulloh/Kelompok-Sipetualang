import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/features/landing/components/Navbar'
import Footer from '@/features/landing/components/Footer'
import HeroBanner from '@/features/bukarental/components/HeroBanner'
import Stepper from '@/features/bukarental/components/Stepper'
import StepSyaratKetentuan from '@/features/bukarental/components/StepSyaratKetentuan'
import StepFormPendaftaran from '@/features/bukarental/components/StepFormPendaftaran'
import StepUnggahKTP from '@/features/bukarental/components/StepUnggahKTP'
import StepPendaftaranBerhasil from '@/features/bukarental/components/StepPendaftaranBerhasil'
import '@/features/landing/landing.css'
import '@/features/bukarental/bukarental.css'

const stepVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

export default function BukaRental() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    telepon: '',
    tanggalLahir: '',
    equipment: [],
  })
  const [ktpFile, setKtpFile] = useState(null)
  const navigate = useNavigate()

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/')
      return
    }
    setCurrentStep(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSkipKTP = () => {
    toast.info('Upload KTP dapat dilakukan nanti di halaman profil.')
    setCurrentStep(4)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinish = () => {
    // In a real implementation, this would submit data to the backend API
    toast.success('Pendaftaran rental berhasil!')
    setCurrentStep(4)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepSyaratKetentuan
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 2:
        return (
          <StepFormPendaftaran
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 3:
        return (
          <StepUnggahKTP
            onNext={handleFinish}
            onBack={handleBack}
            onSkip={handleSkipKTP}
            ktpFile={ktpFile}
            setKtpFile={setKtpFile}
          />
        )
      case 4:
        return <StepPendaftaranBerhasil />
      default:
        return null
    }
  }

  return (
    <div className="landing-scrollbar">
      <main className="w-full max-w-full overflow-x-hidden text-[#333] bg-white min-h-screen">
        <Navbar />

        {/* Hero Banner — Navbar overlays on top */}
        <HeroBanner currentStep={currentStep} />

        {/* Stepper */}
        <div className="max-w-[800px] mx-auto px-6">
          <Stepper currentStep={currentStep} />
        </div>

        {/* Step Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Footer spacing */}
        <div className="mt-10" />
        <Footer />
      </main>
    </div>
  )
}
