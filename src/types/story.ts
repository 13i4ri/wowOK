export type SceneTransition = 'slide' | 'fade' | 'cut' | 'zoom' | 'swipe'

export type Scene = {
  id: string
  imageSrc: string
  caption: string
  transition?: SceneTransition
  typingSpeedMs?: number
  audioSrc?: string
  autoAdvanceOnAudioEnd?: boolean
}

export type StoryConfig = {
  title: string
  scenes: Scene[]
  credits?: {
    lines: string[]
    audioSrc?: string
    scrollDurationMs?: number
    scriptSrc?: string
    scriptWordTarget?: number
  }
  defaults?: {
    transition?: SceneTransition
    typingSpeedMs?: number
  }
}
