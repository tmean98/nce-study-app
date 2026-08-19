import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

export function useMissedFlashcards(userId) {
  const [missedByChapter, setMissedByChapter] = useState({})
  const missedIdsRef = useRef(new Set())

  useEffect(() => {
    setMissedByChapter({})
    missedIdsRef.current = new Set()
    if (!userId || !supabase) return
    supabase
      .from('missed_flashcards')
      .select('*')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (!data) return
        missedIdsRef.current = new Set(data.map(r => r.question_id))
        const byChapter = {}
        data.forEach(r => {
          if (!byChapter[r.chapter_id]) byChapter[r.chapter_id] = []
          byChapter[r.chapter_id].push({
            id: r.question_id,
            front: r.question_text,
            back: r.correct_answer,
            rationale: r.rationale,
            type: 'missed',
          })
        })
        setMissedByChapter(byChapter)
      })
  }, [userId])

  const addMissed = useCallback(async (q, chapterId) => {
    if (!supabase || missedIdsRef.current.has(q.id)) return
    missedIdsRef.current = new Set([...missedIdsRef.current, q.id])
    const card = {
      id: q.id,
      front: q.question,
      back: q.options[q.correct_index],
      rationale: q.rationale,
      type: 'missed',
    }
    setMissedByChapter(prev => ({
      ...prev,
      [chapterId]: [...(prev[chapterId] || []), card],
    }))
    await supabase.from('missed_flashcards').upsert({
      user_id: userId,
      question_id: q.id,
      chapter_id: chapterId,
      question_text: q.question,
      correct_answer: q.options[q.correct_index],
      rationale: q.rationale,
    }, { onConflict: 'user_id,question_id' })
  }, [userId])

  return { missedByChapter, addMissed }
}
