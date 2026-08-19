import { useEffect } from 'react'

export default function AchievementToast({ achievement, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [achievement, onDismiss])

  return (
    <div className="achievement-toast" onClick={onDismiss}>
      <div className="achievement-toast-icon">{achievement.icon}</div>
      <div className="achievement-toast-body">
        <div className="achievement-toast-label">Achievement Unlocked</div>
        <div className="achievement-toast-title">{achievement.title}</div>
        <div className="achievement-toast-desc">{achievement.desc}</div>
      </div>
    </div>
  )
}
