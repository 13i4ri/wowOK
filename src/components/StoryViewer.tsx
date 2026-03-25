import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'
import type { SceneTransition, StoryConfig } from '../types/story'

const STORAGE_KEY = 'romantic_story:last_scene'

type StoryViewerProps = {
  story: StoryConfig
}

const transitionVariants: Record<SceneTransition, Variants> = {
  slide: {
    enter: (direction: number) => ({ x: direction > 0 ? 70 : -70, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -70 : 70, opacity: 0 }),
  },
  fade: {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  },
  cut: {
    enter: { opacity: 1 },
    center: { opacity: 1 },
    exit: { opacity: 1 },
  },
  zoom: {
    enter: { opacity: 0, scale: 0.92 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  swipe: {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      y: direction > 0 ? 24 : -24,
      rotate: direction > 0 ? 10 : -10,
      scale: 0.96,
      opacity: 0.86,
    }),
    center: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -320 : 320,
      y: direction > 0 ? -40 : 40,
      rotate: direction > 0 ? -16 : 16,
      scale: 0.9,
      opacity: 0,
    }),
  },
}

const transitionTiming: Record<SceneTransition, Transition> = {
  slide: { duration: 0.45, ease: 'easeOut' },
  fade: { duration: 0.42, ease: 'easeInOut' },
  cut: { duration: 0.01, ease: 'linear' },
  zoom: { duration: 0.5, ease: 'easeInOut' },
  swipe: { duration: 0.36, ease: 'easeOut' },
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function isPdfSource(source: string): boolean {
  return /\.pdf($|[?#])/i.test(source)
}

function readSavedIndex(maxIndex: number): number {
  if (maxIndex < 0) {
    return 0
  }

  if (typeof window === 'undefined') {
    return 0
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return 0
  }

  const parsedValue = Number.parseInt(rawValue, 10)
  if (Number.isNaN(parsedValue)) {
    return 0
  }

  return clamp(parsedValue, 0, maxIndex)
}

export function StoryViewer({ story }: StoryViewerProps) {
  const hasScenes = story.scenes.length > 0
  const lastIndex = hasScenes ? story.scenes.length - 1 : 0
  const [sceneIndex, setSceneIndex] = useState(() => readSavedIndex(lastIndex))
  const [direction, setDirection] = useState<1 | -1>(1)
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (hasScenes) {
      window.localStorage.setItem(STORAGE_KEY, String(sceneIndex))
    }
  }, [hasScenes, sceneIndex])

  const activeScene = hasScenes ? story.scenes[sceneIndex] : null
  const activeTransition =
    activeScene?.transition ?? story.defaults?.transition ?? 'slide'

  const typingSpeedMs =
    activeScene?.typingSpeedMs ?? story.defaults?.typingSpeedMs ?? 26

  const { typedText, isComplete, completeImmediately } = useTypewriter(
    activeScene?.caption ?? '',
    typingSpeedMs,
  )

  const frameSrc = activeScene
    ? `${import.meta.env.BASE_URL}${activeScene.imageSrc}`
    : ''
  const isPdfScene = activeScene ? isPdfSource(activeScene.imageSrc) : false
  const isCutTransition = activeTransition === 'cut'
  const hideNextButton = Boolean(
    activeScene?.audioSrc &&
      activeScene?.autoAdvanceOnAudioEnd &&
      sceneIndex < lastIndex,
  )

  useEffect(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
      activeAudioRef.current.currentTime = 0
      activeAudioRef.current = null
    }

    const audioSrc = activeScene?.audioSrc
    if (!audioSrc) {
      return
    }

    const audio = new Audio(`${import.meta.env.BASE_URL}${audioSrc}`)
    audio.preload = 'auto'

    if (activeScene?.autoAdvanceOnAudioEnd && sceneIndex < lastIndex) {
      audio.addEventListener('ended', () => {
        setDirection(1)
        setSceneIndex((currentIndex) => Math.min(currentIndex + 1, lastIndex))
      })
    }

    activeAudioRef.current = audio
    void audio.play().catch(() => {
      // Browsers can block autoplay before user interaction.
    })

    return () => {
      audio.pause()
      audio.currentTime = 0
      if (activeAudioRef.current === audio) {
        activeAudioRef.current = null
      }
    }
  }, [activeScene?.audioSrc, activeScene?.autoAdvanceOnAudioEnd, activeScene?.id, lastIndex, sceneIndex])

  useEffect(() => {
    if (!hasScenes) {
      return
    }

    const nearIndexes = [sceneIndex + 1, sceneIndex - 1].filter(
      (index) => index >= 0 && index <= lastIndex,
    )

    nearIndexes.forEach((index) => {
      const nearScene = story.scenes[index]
      if (isPdfSource(nearScene.imageSrc)) {
        return
      }

      const nearImage = new Image()
      nearImage.decoding = 'async'
      nearImage.src = `${import.meta.env.BASE_URL}${nearScene.imageSrc}`
    })
  }, [hasScenes, lastIndex, sceneIndex, story.scenes])

  const handleNext = useCallback(() => {
    if (!hasScenes) {
      return
    }

    if (!isComplete) {
      completeImmediately()
      return
    }

    setDirection(1)
    setSceneIndex((currentIndex) => Math.min(currentIndex + 1, lastIndex))
  }, [completeImmediately, hasScenes, isComplete, lastIndex])

  const handlePrevious = useCallback(() => {
    if (!hasScenes) {
      return
    }

    setDirection(-1)
    setSceneIndex((currentIndex) => Math.max(currentIndex - 1, 0))
  }, [hasScenes])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleNext()
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handlePrevious()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleNext, handlePrevious])

  const showTypeCursor = !isComplete
  const sceneMedia = isPdfScene ? (
    <object
      className="story-pdf"
      data={frameSrc}
      type="application/pdf"
      aria-label={`Story scene ${sceneIndex + 1} PDF`}
    >
      <p className="story-pdf-fallback">
        PDF preview is not supported here.{' '}
        <a href={frameSrc} target="_blank" rel="noreferrer">
          Open PDF
        </a>
      </p>
    </object>
  ) : (
    <img
      className="story-image"
      src={frameSrc}
      alt={`Story scene ${sceneIndex + 1}`}
      loading="eager"
    />
  )

  return (
    <main className="story-page">
      <header className="story-header">
        <p className="story-overline"></p>
        <h1>{story.title}</h1>
      </header>

      <section className="story-frame-shell" aria-label="Story frame">
        {hasScenes && activeScene ? (
          isCutTransition ? (
            <figure
              key={activeScene.id}
              className="story-frame"
              data-transition={activeTransition}
            >
              {sceneMedia}
            </figure>
          ) : (
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.figure
                key={activeScene.id}
                className="story-frame"
                custom={direction}
                data-transition={activeTransition}
                variants={transitionVariants[activeTransition]}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transitionTiming[activeTransition]}
              >
                {sceneMedia}
              </motion.figure>
            </AnimatePresence>
          )
        ) : (
          <figure className="story-frame" data-transition={activeTransition}>
            <div className="story-image story-image-empty">Add your first scene to begin.</div>
          </figure>
        )}
      </section>

      <section className="story-caption-wrap" aria-live="polite">
        <p className="story-caption">
          {hasScenes ? typedText : 'No scenes yet. Update src/content/story.ts to start your story.'}
          <span
            className={`typing-cursor${showTypeCursor ? ' is-visible' : ''}`}
            aria-hidden="true"
          >
            |
          </span>
        </p>
      </section>

      <footer className="story-controls" aria-label="Story controls">
        <button
          type="button"
          className="nav-button"
          onClick={handlePrevious}
          disabled={!hasScenes || sceneIndex === 0}
        >
          <span className="nav-arrow nav-arrow-left" aria-hidden="true">
            {'<--'}
          </span>
          <span>Previous</span>
        </button>

        <p className="progress-text" role="status" aria-live="polite">
          {hasScenes ? `Scene ${sceneIndex + 1} / ${story.scenes.length}` : 'No scenes yet'}
        </p>

        {hideNextButton ? (
          <div />
        ) : (
          <button
            type="button"
            className="nav-button"
            onClick={handleNext}
            disabled={!hasScenes || (sceneIndex === lastIndex && isComplete)}
          >
            <span>Next</span>
            <span className="nav-arrow nav-arrow-right" aria-hidden="true">
              {'-->'}
            </span>
          </button>
        )}
      </footer>
    </main>
  )
}

export { STORAGE_KEY }
