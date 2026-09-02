import { useState, useEffect } from 'react'

const EXAM_DATE = new Date('2026-09-19T09:00:00')

function getTimeLeft() {
  const diff = EXAM_DATE - new Date()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { days, hours, minutes }
}

export default function ExamCountdown({ variant = 'dashboard' }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 60_000)
    return () => clearInterval(id)
  }, [])

  if (!timeLeft) return null

  return (
    <div className={`exam-countdown exam-countdown--${variant}`}>
      <div className="exam-countdown-top">
        <span className="exam-countdown-eyebrow">QUALIFYING EXAM</span>
        <span className="exam-countdown-date-label">Sat, Sep 19 · 9:00 AM</span>
      </div>
      <div className="exam-countdown-units">
        <div className="exam-countdown-unit">
          <span className="exam-countdown-num">{timeLeft.days}</span>
          <span className="exam-countdown-unit-label">days</span>
        </div>
        <span className="exam-countdown-sep">:</span>
        <div className="exam-countdown-unit">
          <span className="exam-countdown-num">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="exam-countdown-unit-label">hrs</span>
        </div>
        <span className="exam-countdown-sep">:</span>
        <div className="exam-countdown-unit">
          <span className="exam-countdown-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="exam-countdown-unit-label">min</span>
        </div>
      </div>
    </div>
  )
}
