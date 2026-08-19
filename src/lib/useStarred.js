import { useState, useCallback } from 'react'

const KEY = 'nce-starred-cards'

function load() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) }
  catch { return new Set() }
}

export function useStarred() {
  const [starred, setStarred] = useState(load)

  const toggle = useCallback((id) => {
    setStarred(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem(KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  return { starred, toggle }
}
