import type { StoryConfig } from '../types/story'

export const storyConfig: StoryConfig = {
  title: '',
  defaults: {
    transition: 'slide',
    typingSpeedMs: 26,
  },
  scenes: [
    {
      id: 'scene-01',
      imageSrc: 'scenes/scene-01.svg',
      caption: 'so this is me',
      transition: 'fade',
    },
    {
      id: 'scene-02',
      imageSrc: 'scenes/scene-02.png',
      caption: 'i had an idea',
      transition: 'cut'
    },
    {
      id: 'scene-03',
      imageSrc: 'scenes/scene-03.png',
      caption:
        '',
      transition: 'cut',
    },
    {
      id: 'scene-04',
      imageSrc: 'scenes/scene-04.png',
      caption:
        '',
      transition: 'cut',
    },
    {
      id: 'scene-05',
      imageSrc: 'scenes/scene-05.png',
      caption: 'so i took my phone',
      transition: 'cut',
    },
    {
      id: 'scene-06',
      imageSrc: 'scenes/scene-06.png',
      caption: 'and i swiped',
      transition: 'swipe',
    },
    {
      id: 'scene-07',
      imageSrc: 'scenes/scene-07.png',
      caption:
        '',
      transition: 'swipe'
    },
    {
      id: 'scene-08',
      imageSrc: 'scenes/scene-08.png',
      caption:
        '',
      transition: 'swipe'
    },
    {
      id: 'scene-09',
      imageSrc: 'scenes/scene-09.png',
      caption:
        '',
      transition: 'cut',
    },
    {
      id: 'scene-10',
      imageSrc: 'scenes/scene-10.png',
      caption: 'but then..',
      transition: 'fade',
      typingSpeedMs: 20,
      audioSrc: 'scenes/and-there-she-was.mp3',
      //audioSrc: 'scenes/there-she-was-2.mp3',
      autoAdvanceOnAudioEnd: true,
    },
    {
      id: 'scene-11',
      imageSrc: 'scenes/scene-11.png',
      caption:
        'wow',
      transition: 'slide',
    },
    {
      id: 'scene-12',
      imageSrc: 'scenes/scene-12.png',
      caption:
        '*like*',
      transition: 'cut',
      typingSpeedMs: 23,
    },
    {
      id: 'scene-13',
      imageSrc: 'scenes/scene-13.png',
      caption:
        '*prays*',
      transition: 'fade',
    },
    {
      id: 'scene-14',
      imageSrc: 'scenes/scene-14.png',
      caption:
        '',
      audioSrc: 'scenes/notification.mp3',
      transition: 'cut',
      typingSpeedMs: 21,
    },
    {
      id: 'scene-15',
      imageSrc: 'scenes/scene-15.png',
      caption: '',
    },
    {
      id: 'scene-16',
      imageSrc: 'scenes/scene-16.png',
      caption: 'i wanna take her on a date',
    },
    {
      id: 'scene-17',
      imageSrc: 'scenes/scene-17.png',
      caption: 'but i hate how we sit in dates',
      transition: 'cut',
    },
    {
      id: 'scene-18',
      imageSrc: 'scenes/scene-18.png',
      caption: 'exhibit A',
      transition: 'cut',
    },
    {
      id: 'scene-19',
      imageSrc: 'scenes/scene-19.png',
      caption: 'exhibit B',
    },
    {
      id: 'scene-20',
      imageSrc: 'scenes/scene-20.png',
      caption: 'how i think we should sit:',
    },
  ],
}
