import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './LoadingScreen.css'

function LoadingScreen({ onComplete }) {
    const [progress, setProgress] = useState(0)
    const [isFinished, setIsFinished] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(() => setIsFinished(true), 300)
                    setTimeout(() => onComplete(), 1200)
                    return 100
                }
                return prev + 1
            })
        }, 25)
        return () => clearInterval(interval)
    }, [onComplete])

    return (
        <motion.div
            className="loading-screen"
            animate={{ opacity: isFinished ? 0 : 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
        >
            <motion.div
                className="loading-wrapper"
                animate={{
                    scale: isFinished ? 15 : 1,
                    opacity: isFinished ? 0 : 1
                }}
                transition={{ duration: 0.6, ease: 'easeIn' }}
            >
                <h1
                    className="loading-title"
                    style={{ '--fill-level': progress + '%' }}
                >
                    SIPETUALANG
                </h1>
                <div className="loading-info">
                    <span>Tunggu Sebentar Yaw...</span>
                    <span className="loading-percentage">{progress}%</span>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default LoadingScreen