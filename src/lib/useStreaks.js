import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

function today() { return new Date().toISOString().split('T')[0] }
function yesterday() { return new Date(Date.now() - 86400000).toISOString().split('T')[0] }

export function useStreaks(userId) {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setStreak(0)
    if (!userId || !supabase) return
    supabase
      .from('user_streaks')
      .select('streak, last_studied_date')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (!data) return
        // Streak is broken if last study was before yesterday
        const active = data.last_studied_date >= yesterday()
        setStreak(active ? (data.streak || 0) : 0)
      })
  }, [userId])

  const recordActivity = useCallback(async (onUpdate) => {
    if (!supabase || !userId) return
    const todayStr = today()

    const { data } = await supabase
      .from('user_streaks')
      .select('streak, last_studied_date')
      .eq('user_id', userId)
      .single()

    if (data?.last_studied_date === todayStr) return // already recorded today

    const newStreak = data?.last_studied_date === yesterday()
      ? (data.streak || 0) + 1
      : 1

    await supabase.from('user_streaks').upsert(
      { user_id: userId, streak: newStreak, last_studied_date: todayStr },
      { onConflict: 'user_id' }
    )
    setStreak(newStreak)
    onUpdate?.(newStreak)
  }, [userId])

  return { streak, recordActivity }
}
