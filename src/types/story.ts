export type SceneTransition = 'slide' | 'fade' | 'cut' | 'zoom'

export type Scene = {
  id: string
  imageSrc: string
  caption: string
  transition?: SceneTransition
  typingSpeedMs?: number
}

export type StoryConfig = {
  title: string
  scenes: Scene[]
  defaults?: {
    transition?: SceneTransition
    typingSpeedMs?: number
  }
}
