import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

export const ACHIEVEMENTS = [
  { id: 'first_correct',    icon: '⭐', title: 'First Win',        desc: 'Answer your first question correctly' },
  { id: 'on_a_roll',        icon: '🔥', title: 'On a Roll',        desc: '10 correct answers in a row' },
  { id: 'perfect_score',    icon: '💎', title: 'Flawless',         desc: 'Score 100% on any quiz session' },
  { id: 'chapter_complete', icon: '🏆', title: 'Chapter Complete', desc: 'Master every question in a chapter' },
  { id: 'mastered_100',     icon: '💯', title: 'Centurion',        desc: 'Master 100 questions' },
  { id: 'mastered_500',     icon: '⚡', title: '500 Club',         desc: 'Master 500 questions' },
  { id: 'mastered_all',     icon: '👑', title: 'NCE Ready',        desc: 'Master all 1,099 questions' },
  { id: 'streak_7',         icon: '📅', title: 'Week Warrior',     desc: 'Study 7 days in a row' },
  { id: 'night_owl',        icon: '🌙', title: 'Night Owl',        desc: 'Study after 10pm' },
  { id: 'early_bird',       icon: '🌅', title: 'Early Bird',       desc: 'Study before 7am' },
]

function storageKey(userId) {
  return `nce_achievements_${userId}`
}

function loadFromStorage(userId) {
  try {
    return new Set(JSON.parse(localStorage.getItem(storageKey(userId)) || '[]'))
  } catch {
    return new Set()
  }
}

function saveToStorage(userId, ids) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...ids]))
  } catch {}
}

export function useAchievements(userId) {
  const [earned, setEarned] = useState(new Set())
  const [newlyEarned, setNewlyEarned] = useState([])
  const earnedRef = useRef(new Set())

  useEffect(() => {
    const empty = new Set()
    setEarned(empty)
    earnedRef.current = empty
    setNewlyEarned([])
    if (!userId) return

    // Load from localStorage immediately so achievements don't re-fire on reload
    const cached = loadFromStorage(userId)
    if (cached.size > 0) {
      earnedRef.current = cached
      setEarned(cached)
    }

    // Sync from DB and merge
    if (!supabase) return
    supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (!data) return
        const dbIds = new Set(data.map(r => r.achievement_id))
        const merged = new Set([...cached, ...dbIds])
        earnedRef.current = merged
        setEarned(merged)
        saveToStorage(userId, merged)
      })
  }, [userId])

  const award = useCallback(async (achievementId) => {
    if (earnedRef.current.has(achievementId)) return
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return

    const updated = new Set([...earnedRef.current, achievementId])
    earnedRef.current = updated
    setEarned(updated)
    setNewlyEarned(prev => [...prev, achievement])
    saveToStorage(userId, updated)

    if (!supabase) return
    await supabase.from('user_achievements').upsert(
      { user_id: userId, achievement_id: achievementId },
      { onConflict: 'user_id,achievement_id' }
    )
  }, [userId])

  const check = useCallback((type, ctx = {}) => {
    const hour = new Date().getHours()

    if (type === 'question_correct') {
      const { totalMastered = 0, consecutiveCorrect = 0 } = ctx
      if (totalMastered >= 1)    award('first_correct')
      if (consecutiveCorrect >= 10) award('on_a_roll')
      if (totalMastered >= 100)  award('mastered_100')
      if (totalMastered >= 500)  award('mastered_500')
      if (totalMastered >= 1099) award('mastered_all')
      if (hour >= 22 || hour < 2) award('night_owl')

      if (hour >= 5 && hour < 7)  award('early_bird')
    }

    if (type === 'quiz_complete') {
      const { correct = 0, total = 0, masteredCount = 0, chapterTotal = 0 } = ctx
      if (correct === total && total > 0) award('perfect_score')
      // Check chapter_complete at session end using current masteredCount (accurate after React re-render)
      if (masteredCount > 0 && chapterTotal > 0 && masteredCount >= chapterTotal) award('chapter_complete')
    }

    if (type === 'streak') {
      if ((ctx.streak || 0) >= 7) award('streak_7')
    }
  }, [award])

  const dismissToast = useCallback(() => {
    setNewlyEarned(prev => prev.slice(1))
  }, [])

  return { earned, newlyEarned, dismissToast, check }
}
