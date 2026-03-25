# Prompt Workflow

1. You give me the next story beat in plain language.
2. I convert it into an exact image prompt using the locked style template.
3. You generate the image in ChatGPT.
4. Save the image in `public/scenes/` and update `src/content/story.ts`.
5. Repeat per scene.

## Naming Convention

- `public/scenes/scene-01.svg`
- `public/scenes/scene-02.svg`
- Continue zero-padded numbering.

## Scene Data Fields

Each scene entry in `src/content/story.ts` should include:
- `id`
- `imageSrc`
- `caption`
- optional `transition`
- optional `typingSpeedMs`
