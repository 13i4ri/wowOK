import type { StoryConfig } from '../types/story'

export const storyConfig: StoryConfig = {
  title: 'Notebook Reel',
  defaults: {
    transition: 'slide',
    typingSpeedMs: 26,
  },
  scenes: [
    {
      id: 'scene-01',
      imageSrc: 'scenes/scene-01.svg',
      caption:
        'I noticed her laugh before anything else, like it had sunlight stitched into it.',
      transition: 'fade',
    },
    {
      id: 'scene-02',
      imageSrc: 'scenes/scene-02.svg',
      caption:
        'So I drew a tiny stick-man version of myself and gave him one mission: walk toward her.',
    },
    {
      id: 'scene-03',
      imageSrc: 'scenes/scene-03.svg',
      caption:
        'He practiced a calm smile for ten minutes, then forgot it the moment she looked his way.',
    },
    {
      id: 'scene-04',
      imageSrc: 'scenes/scene-04.svg',
      caption:
        'Somehow, awkward became honest, and honest became easy.',
      transition: 'zoom',
    },
    {
      id: 'scene-05',
      imageSrc: 'scenes/scene-05.svg',
      caption:
        'Every message after that felt like a new frame in a film neither of us wanted to pause.',
    },
    {
      id: 'scene-06',
      imageSrc: 'scenes/scene-06.svg',
      caption:
        'I started keeping small moments in my pocket: jokes, glances, and the way she says my name.',
      transition: 'slide',
    },
    {
      id: 'scene-07',
      imageSrc: 'scenes/scene-07.svg',
      caption:
        'Even silence got better, because it stopped feeling empty and started feeling shared.',
      typingSpeedMs: 22,
    },
    {
      id: 'scene-08',
      imageSrc: 'scenes/scene-08.svg',
      caption:
        'Then came the brave part: telling the story out loud, one frame at a time.',
    },
    {
      id: 'scene-09',
      imageSrc: 'scenes/scene-09.svg',
      caption:
        'If this little notebook movie has a favorite scene, it is always the one where she smiles back.',
      transition: 'cut',
    },
    {
      id: 'scene-10',
      imageSrc: 'scenes/scene-10.svg',
      caption:
        'End credits for now, not forever. The next chapter starts when she says, "play again."',
      transition: 'fade',
      typingSpeedMs: 20,
    },
  ],
}
