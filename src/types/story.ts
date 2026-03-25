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
  defaults?: {
    transition?: SceneTransition
    typingSpeedMs?: number
  }
}
