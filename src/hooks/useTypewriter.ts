import { useCallback, useEffect, useState } from 'react'

type UseTypewriterResult = {
  typedText: string
  isComplete: boolean
  completeImmediately: () => void
}

export function useTypewriter(text: string, speedMs: number): UseTypewriterResult {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    // Scene changes intentionally restart the typewriter from zero.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(0)
  }, [text])

  useEffect(() => {
    if (visibleCount >= text.length) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 1, text.length))
    }, Math.max(speedMs, 8))

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [speedMs, text.length, visibleCount])

  const completeImmediately = useCallback(() => {
    setVisibleCount(text.length)
  }, [text.length])

  return {
    typedText: text.slice(0, visibleCount),
    isComplete: visibleCount >= text.length,
    completeImmediately,
  }
}
