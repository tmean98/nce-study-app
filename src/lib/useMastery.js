import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

export function useMastery(userId) {
  const [mastered, setMastered] = useState(new Set())
  const [masteredByChapter, setMasteredByChapter] = useState({})
  const masteredRef = useRef(new Set())

  useEffect(() => {
    const empty = new Set()
    setMastered(empty)
    setMasteredByChapter({})
    masteredRef.current = empty
    if (!userId || !supabase) return
    supabase
      .from('mastered_questions')
      .select('question_id, chapter_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (!data) return
        const ids = new Set(data.map(r => r.question_id))
        masteredRef.current = ids
        const byChapter = {}
        data.forEach(r => {
          byChapter[r.chapter_id] = (byChapter[r.chapter_id] || 0) + 1
        })
        setMastered(ids)
        setMasteredByChapter(byChapter)
      })
  }, [userId])

  const markMastered = useCallback(async (questionId, chapterId) => {
    if (!supabase || masteredRef.current.has(questionId)) return
    masteredRef.current = new Set([...masteredRef.current, questionId])
    setMastered(prev => new Set([...prev, questionId]))
    setMasteredByChapter(prev => ({
      ...prev,
      [chapterId]: (prev[chapterId] || 0) + 1,
    }))
    await supabase.from('mastered_questions').upsert(
      { user_id: userId, question_id: questionId, chapter_id: chapterId },
      { onConflict: 'user_id,question_id' }
    )
  }, [userId])

  return { mastered, masteredByChapter, markMastered }
}
