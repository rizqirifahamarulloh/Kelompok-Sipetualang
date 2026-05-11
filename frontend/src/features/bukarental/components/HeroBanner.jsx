import heroBg from '@/assets/bukarental/image-bg.png'
import { Link } from 'react-router-dom'

const breadcrumbLabels = {
  1: 'Syarat & Ketentuan Kemitraan',
  2: 'Form Pendaftaran Rental',
  3: 'Unggah Foto KTP',
  4: 'Pendaftaran Berhasil',
}

export default function HeroBanner({ currentStep }) {
  return (
    <div className="br-hero-wrapper">
      <div className="br-hero">
        <img src={heroBg} alt="Mountain landscape banner" />
        <div className="br-breadcrumb">
          <Link to="/">Home</Link>
          <span className="br-breadcrumb-sep">&gt;</span>
          <Link to="/buka-rental">Buka Rental</Link>
          <span className="br-breadcrumb-sep">&gt;</span>
          <span className="br-breadcrumb-active">{breadcrumbLabels[currentStep]}</span>
        </div>
      </div>
    </div>
  )
}
