import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

export const ACHIEVEMENTS = [
  { id: 'first_correct',   icon: '⭐', title: 'First Win',        desc: 'Answer your first question correctly' },
  { id: 'on_a_roll',       icon: '🔥', title: 'On a Roll',        desc: '10 correct answers in a row' },
  { id: 'perfect_score',   icon: '💎', title: 'Flawless',         desc: 'Score 100% on any quiz session' },
  { id: 'chapter_complete',icon: '🏆', title: 'Chapter Complete', desc: 'Master every question in a chapter' },
  { id: 'mastered_100',    icon: '💯', title: 'Centurion',        desc: 'Master 100 questions' },
  { id: 'mastered_500',    icon: '⚡', title: '500 Club',         desc: 'Master 500 questions' },
  { id: 'mastered_all',    icon: '👑', title: 'NCE Ready',        desc: 'Master all 1,099 questions' },
  { id: 'streak_7',        icon: '📅', title: 'Week Warrior',     desc: 'Study 7 days in a row' },
  { id: 'night_owl',       icon: '🌙', title: 'Night Owl',        desc: 'Study after 10pm' },
  { id: 'early_bird',      icon: '🌅', title: 'Early Bird',       desc: 'Study before 7am' },
]

export function useAchievements(userId) {
  const [earned, setEarned] = useState(new Set())
  const [newlyEarned, setNewlyEarned] = useState([])
  const earnedRef = useRef(new Set())

  useEffect(() => {
    const empty = new Set()
    setEarned(empty)
    earnedRef.current = empty
    setNewlyEarned([])
    if (!userId || !supabase) return
    supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (!data) return
        const ids = new Set(data.map(r => r.achievement_id))
        earnedRef.current = ids
        setEarned(ids)
      })
  }, [userId])

  const award = useCallback(async (achievementId) => {
    if (earnedRef.current.has(achievementId) || !supabase) return
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return
    earnedRef.current = new Set([...earnedRef.current, achievementId])
    setEarned(prev => new Set([...prev, achievementId]))
    setNewlyEarned(prev => [...prev, achievement])
    await supabase.from('user_achievements').upsert(
      { user_id: userId, achievement_id: achievementId },
      { onConflict: 'user_id,achievement_id' }
    )
  }, [userId])

  const check = useCallback((type, ctx = {}) => {
    const hour = new Date().getHours()

    if (type === 'question_correct') {
      const { totalMastered = 0, consecutiveCorrect = 0, chapterId, chapterMastered = 0, chapterTotal = 0 } = ctx
      if (totalMastered >= 1)    award('first_correct')
      if (consecutiveCorrect >= 10) award('on_a_roll')
      if (totalMastered >= 100)  award('mastered_100')
      if (totalMastered >= 500)  award('mastered_500')
      if (totalMastered >= 1099) award('mastered_all')
      if (chapterId && chapterMastered >= chapterTotal && chapterTotal > 0) award('chapter_complete')
      if (hour >= 22 || hour < 2) award('night_owl')
      if (hour >= 5 && hour < 7)  award('early_bird')
    }

    if (type === 'quiz_complete') {
      const { correct = 0, total = 0 } = ctx
      if (correct === total && total > 0) award('perfect_score')
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
