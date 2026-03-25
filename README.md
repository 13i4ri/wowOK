# Notebook Reel

A static React + Vite story website designed as a romantic notebook-film experience.

## Stack

- React + TypeScript + Vite
- Framer Motion for scene transitions
- GitHub Pages deployment via GitHub Actions
- Vitest + Testing Library smoke tests

## Features

- 16:9 cinematic frame on notebook-style background
- Typewriter narration under each frame
- Next / Previous buttons + keyboard arrows
- Scene-level transition overrides (`slide`, `fade`, `cut`, `zoom`)
- localStorage resume of last viewed scene

## Development

```bash
npm install
npm run dev
```

## Testing and Quality

```bash
npm run lint
npm run test
npm run build
```

## Content Editing

Story content lives in `src/content/story.ts`.

Each scene supports:

```ts
{
  id: string
  imageSrc: string // supports .png, .jpg, .webp, .svg, .pdf
  caption: string
  transition?: 'slide' | 'fade' | 'cut' | 'zoom'
  typingSpeedMs?: number
}
```

## GitHub Pages Deployment

Deployment is automated by `.github/workflows/deploy.yml`.

- Push to `main` triggers build + publish
- Base path is set automatically from repository name
- Final URL format: `https://<username>.github.io/<repo-name>/`

## Prompt Workflow

See:
- `docs/prompt-template.md`
- `docs/scene-prompt-workflow.md`
