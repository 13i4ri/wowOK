import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from 'framer-motion'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'
import type { SceneTransition, StoryConfig } from '../types/story'

const STORAGE_KEY = 'romantic_story:last_scene'
const SCENE_28_ID = 'scene-28'
const SCENE_28_TOTAL_SECONDS = 20
const SCENE_28_SLIDE_COUNT = 9
const QUESTION_REPLY_CAPTION =
  'oh yea i cant see your answer youre gonna have to send me a message'
const DEFAULT_CREDITS_AUDIO_SRC = 'scenes/believe.mp3'
const DEFAULT_CREDITS_SCRIPT_WORD_TARGET = 450

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

function playAudioSafely(audio: HTMLAudioElement): void {
  const playResult = audio.play()
  if (playResult && typeof playResult.catch === 'function') {
    void playResult.catch(() => {
      // Browsers can block autoplay before user interaction.
    })
  }
}

function wordCount(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) {
    return 0
  }

  return trimmed.split(/\s+/).length
}

function buildScriptExcerptLines(scriptText: string, targetWordCount: number): string[] {
  const outputLines: string[] = []
  const normalizedTarget = Math.max(targetWordCount, 1)
  let accumulatedWords = 0

  for (const rawLine of scriptText.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line) {
      if (outputLines.length > 0 && outputLines[outputLines.length - 1] !== '') {
        outputLines.push('')
      }
      continue
    }

    outputLines.push(line)
    accumulatedWords += wordCount(line)

    if (accumulatedWords >= normalizedTarget) {
      break
    }
  }

  return outputLines
}

export function StoryViewer({ story }: StoryViewerProps) {
  const hasScenes = story.scenes.length > 0
  const lastIndex = hasScenes ? story.scenes.length - 1 : 0
  const [sceneIndex, setSceneIndex] = useState(() => readSavedIndex(lastIndex))
  const [direction, setDirection] = useState<1 | -1>(1)
  const [showDateQuestion, setShowDateQuestion] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [showQuestionReplyCaption, setShowQuestionReplyCaption] = useState(false)
  const [creditsScriptLines, setCreditsScriptLines] = useState<string[] | null>(null)
  const [scene28FallbackSeconds, setScene28FallbackSeconds] = useState(0)
  const [scene28AudioSeconds, setScene28AudioSeconds] = useState(0)
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)
  const scene28StartMsRef = useRef(0)
  const [, forceScene28Render] = useState(0)

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
  const creditsIntroLines = story.credits?.lines ?? []
  const creditsDurationMs = story.credits?.scrollDurationMs ?? 20000
  const creditsAudioSrc = story.credits?.audioSrc ?? DEFAULT_CREDITS_AUDIO_SRC
  const creditsScriptSrc = story.credits?.scriptSrc
  const creditsScriptWordTarget =
    story.credits?.scriptWordTarget ?? DEFAULT_CREDITS_SCRIPT_WORD_TARGET
  const resolvedScriptLines = creditsScriptSrc
    ? (creditsScriptLines ?? ['loading titanic script...'])
    : []
  const creditsDisplayLines = [
    ...creditsIntroLines,
    ...(creditsIntroLines.length > 0 && resolvedScriptLines.length > 0 ? [''] : []),
    ...resolvedScriptLines,
  ]
  const creditsLinesToRender = creditsDisplayLines.length > 0 ? creditsDisplayLines : ['THE END']
  const creditsRollStyle = {
    '--credits-duration': `${Math.max(creditsDurationMs, 1)}ms`,
  } as CSSProperties
  const isDateQuestionFrame = hasScenes && showDateQuestion && sceneIndex === lastIndex
  const isCreditsFrame = isDateQuestionFrame && showCredits
  const isScene28 = activeScene?.id === SCENE_28_ID
  const frameKey = activeScene
    ? isCreditsFrame
      ? 'story-credits'
      : isDateQuestionFrame
      ? `${activeScene.id}-date-question`
      : activeScene.id
    : 'empty-scene'
  const frameTransition: SceneTransition = isDateQuestionFrame ? 'fade' : activeTransition
  const scene28ProgressSeconds = isScene28
    ? Math.max(scene28AudioSeconds, scene28FallbackSeconds)
    : 0
  const scene28SlideIndex = isScene28
    ? clamp(
        Math.floor(
          (scene28ProgressSeconds / SCENE_28_TOTAL_SECONDS) *
            SCENE_28_SLIDE_COUNT,
        ),
        0,
        SCENE_28_SLIDE_COUNT - 1,
      )
    : 0
  const scene28SlideSrc = `${import.meta.env.BASE_URL}scenes/scene-28-${
    scene28SlideIndex + 1
  }.png`
  const isPdfScene = activeScene ? isPdfSource(activeScene.imageSrc) : false
  const isCutTransition = frameTransition === 'cut'
  const hideNextButton = Boolean(
    activeScene?.audioSrc &&
      activeScene?.autoAdvanceOnAudioEnd &&
      sceneIndex < lastIndex &&
      !isDateQuestionFrame,
  )
  const showCreditsButton = isDateQuestionFrame && showQuestionReplyCaption && !isCreditsFrame
  const activeAudioSrc = isCreditsFrame
    ? creditsAudioSrc
    : isDateQuestionFrame
    ? null
    : (activeScene?.audioSrc ?? null)
  const captionText = hasScenes
    ? isCreditsFrame
      ? ''
      : isDateQuestionFrame
      ? showQuestionReplyCaption
        ? QUESTION_REPLY_CAPTION
        : ''
      : typedText
    : 'No scenes yet. Update src/content/story.ts to start your story.'

  useEffect(() => {
    if (!creditsScriptSrc) {
      return
    }

    let isDisposed = false

    fetch(`${import.meta.env.BASE_URL}${creditsScriptSrc}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load credits script: ${response.status}`)
        }

        return response.text()
      })
      .then((scriptText) => {
        if (isDisposed) {
          return
        }

        const excerptLines = buildScriptExcerptLines(scriptText, creditsScriptWordTarget)
        setCreditsScriptLines(excerptLines)
      })
      .catch(() => {
        if (isDisposed) {
          return
        }

        setCreditsScriptLines(['unable to load script text.'])
      })

    return () => {
      isDisposed = true
    }
  }, [creditsScriptSrc, creditsScriptWordTarget])

  useEffect(() => {
    if (!isScene28) {
      return
    }

    scene28StartMsRef.current = Date.now()
    // Reset scene-28 timing when it becomes active.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScene28AudioSeconds(0)
    setScene28FallbackSeconds(0)

    const intervalId = window.setInterval(() => {
      setScene28FallbackSeconds((Date.now() - scene28StartMsRef.current) / 1000)
    }, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isScene28, activeScene?.id])

  useEffect(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
      activeAudioRef.current.currentTime = 0
      activeAudioRef.current = null
    }

    if (!activeAudioSrc) {
      return
    }

    const audio = new Audio(`${import.meta.env.BASE_URL}${activeAudioSrc}`)
    audio.preload = 'auto'
    const onTimeUpdate = () => {
      if (!isScene28) {
        return
      }

      setScene28AudioSeconds(audio.currentTime)
      forceScene28Render((tick) => tick + 1)
    }
    audio.addEventListener('play', onTimeUpdate)
    audio.addEventListener('timeupdate', onTimeUpdate)

    if (!isCreditsFrame && activeScene?.autoAdvanceOnAudioEnd && sceneIndex < lastIndex) {
      const onEnded = () => {
        setDirection(1)
        setSceneIndex((currentIndex) => Math.min(currentIndex + 1, lastIndex))
      }
      audio.addEventListener('ended', onEnded)

      activeAudioRef.current = audio
      playAudioSafely(audio)

      return () => {
        audio.removeEventListener('play', onTimeUpdate)
        audio.removeEventListener('timeupdate', onTimeUpdate)
        audio.removeEventListener('ended', onEnded)
        audio.pause()
        audio.currentTime = 0
        if (activeAudioRef.current === audio) {
          activeAudioRef.current = null
        }
      }
    }

    activeAudioRef.current = audio
    playAudioSafely(audio)

    return () => {
      audio.removeEventListener('play', onTimeUpdate)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.pause()
      audio.currentTime = 0
      if (activeAudioRef.current === audio) {
        activeAudioRef.current = null
      }
    }
  }, [
    activeAudioSrc,
    activeScene?.autoAdvanceOnAudioEnd,
    activeScene?.id,
    isCreditsFrame,
    isDateQuestionFrame,
    isScene28,
    lastIndex,
    sceneIndex,
  ])

  useEffect(() => {
    if (!hasScenes) {
      return
    }

    const nearIndexes = [sceneIndex + 1, sceneIndex - 1].filter(
      (index) => index >= 0 && index <= lastIndex,
    )

    nearIndexes.forEach((index) => {
      const nearScene = story.scenes[index]
      const nearImageSources =
        nearScene.id === SCENE_28_ID
          ? Array.from(
              { length: SCENE_28_SLIDE_COUNT },
              (_, slideIndex) =>
                `${import.meta.env.BASE_URL}scenes/scene-28-${
                  slideIndex + 1
                }.png`,
            )
          : [`${import.meta.env.BASE_URL}${nearScene.imageSrc}`]

      nearImageSources.forEach((source) => {
        if (isPdfSource(source)) {
          return
        }

        const nearImage = new Image()
        nearImage.decoding = 'async'
        nearImage.src = source
      })
    })
  }, [hasScenes, lastIndex, sceneIndex, story.scenes])

  const handleNext = useCallback(() => {
    if (!hasScenes) {
      return
    }

    if (showCredits) {
      return
    }

    if (showDateQuestion) {
      return
    }

    if (!isComplete) {
      completeImmediately()
      return
    }

    if (sceneIndex === lastIndex) {
      setDirection(1)
      setShowDateQuestion(true)
      setShowQuestionReplyCaption(false)
      setShowCredits(false)
      return
    }

    setDirection(1)
    setShowQuestionReplyCaption(false)
    setShowCredits(false)
    setSceneIndex((currentIndex) => Math.min(currentIndex + 1, lastIndex))
  }, [completeImmediately, hasScenes, isComplete, lastIndex, sceneIndex, showCredits, showDateQuestion])

  const handlePrevious = useCallback(() => {
    if (!hasScenes) {
      return
    }

    if (showCredits) {
      return
    }

    if (showDateQuestion) {
      setDirection(-1)
      setShowDateQuestion(false)
      setShowQuestionReplyCaption(false)
      setShowCredits(false)
      return
    }

    setDirection(-1)
    setShowQuestionReplyCaption(false)
    setShowCredits(false)
    setSceneIndex((currentIndex) => Math.max(currentIndex - 1, 0))
  }, [hasScenes, showCredits, showDateQuestion])

  const handleQuestionYes = useCallback(() => {
    if (!isDateQuestionFrame) {
      return
    }

    setShowQuestionReplyCaption(true)
  }, [isDateQuestionFrame])

  const handleQuestionNo = useCallback(() => {
    if (!isDateQuestionFrame) {
      return
    }

    setShowQuestionReplyCaption(true)
  }, [isDateQuestionFrame])

  const handleGoToCredits = useCallback(() => {
    if (!isDateQuestionFrame) {
      return
    }

    setShowCredits(true)
  }, [isDateQuestionFrame])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (showCredits) {
        return
      }

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
  }, [handleNext, handlePrevious, showCredits])

  const showTypeCursor = !isDateQuestionFrame && !isCreditsFrame && !isComplete
  const sceneMedia = isCreditsFrame ? (
    <div className="story-credits-screen">
      <div className="story-credits-roll" style={creditsRollStyle}>
        {creditsLinesToRender.map((line, lineIndex) => (
          <p key={`credit-line-${lineIndex}`} className="story-credits-line">
            {line}
          </p>
        ))}
      </div>
    </div>
  ) : isDateQuestionFrame ? (
    <div className="story-question-screen">
      <p className="story-question-text">do you wanna go out</p>
    </div>
  ) : isScene28 ? (
    <img
      className="story-image"
      src={scene28SlideSrc}
      alt={`Story scene ${sceneIndex + 1} slide ${scene28SlideIndex + 1}`}
      loading="eager"
    />
  ) : isPdfScene ? (
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
              key={frameKey}
              className="story-frame"
              data-transition={frameTransition}
            >
              {sceneMedia}
            </figure>
          ) : (
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.figure
                key={frameKey}
                className="story-frame"
                custom={direction}
                data-transition={frameTransition}
                variants={transitionVariants[frameTransition]}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transitionTiming[frameTransition]}
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
          {captionText}
          <span
            className={`typing-cursor${showTypeCursor ? ' is-visible' : ''}`}
            aria-hidden="true"
          >
            |
          </span>
        </p>
        {showCreditsButton && (
          <button type="button" className="credits-button" onClick={handleGoToCredits}>
            go to credits
          </button>
        )}
      </section>

      {!isCreditsFrame && (
        <footer className="story-controls" aria-label="Story controls">
          <button
            type="button"
            className="nav-button"
            onClick={showDateQuestion ? handleQuestionNo : handlePrevious}
            disabled={!hasScenes || (sceneIndex === 0 && !showDateQuestion)}
          >
            {!showDateQuestion && (
              <span className="nav-arrow nav-arrow-left" aria-hidden="true">
                {'<--'}
              </span>
            )}
            <span>{showDateQuestion ? 'no' : 'Previous'}</span>
          </button>

          {hideNextButton ? (
            <div />
          ) : (
            <button
              type="button"
              className="nav-button"
              onClick={showDateQuestion ? handleQuestionYes : handleNext}
              disabled={!hasScenes}
            >
              <span>{showDateQuestion ? 'yes' : 'Next'}</span>
              {!showDateQuestion && (
                <span className="nav-arrow nav-arrow-right" aria-hidden="true">
                  {'-->'}
                </span>
              )}
            </button>
          )}
        </footer>
      )}
    </main>
  )
}

export { STORAGE_KEY }
