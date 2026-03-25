import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StoryViewer, STORAGE_KEY } from './StoryViewer'
import type { StoryConfig } from '../types/story'

vi.mock('framer-motion', () => {
  const Figure = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'figure'>>(
    (props, ref) => <figure ref={ref} {...props} />,
  )

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      figure: Figure,
    },
  }
})

const testStory: StoryConfig = {
  title: 'Test Story',
  defaults: {
    transition: 'slide',
    typingSpeedMs: 99999,
  },
  scenes: [
    {
      id: 's-1',
      imageSrc: 'scenes/scene-01.svg',
      caption: 'First scene long caption.',
      transition: 'fade',
    },
    {
      id: 's-2',
      imageSrc: 'scenes/scene-02.svg',
      caption: 'Second scene caption.',
    },
    {
      id: 's-3',
      imageSrc: 'scenes/scene-03.svg',
      caption: 'Third scene caption.',
      transition: 'zoom',
    },
  ],
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('StoryViewer', () => {
  it('renders first scene by default', () => {
    render(<StoryViewer story={testStory} />)

    expect(screen.getByRole('heading', { name: 'Test Story' })).toBeInTheDocument()
    expect(screen.getByText('Scene 1 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('completes typewriter on first Next click, then advances on second click', async () => {
    const user = userEvent.setup()
    render(<StoryViewer story={testStory} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    expect(screen.getByText('First scene long caption.')).toBeInTheDocument()

    await user.click(nextButton)
    expect(screen.getByText('Scene 2 / 3')).toBeInTheDocument()
  })

  it('supports previous and keyboard navigation while clamping bounds', async () => {
    const user = userEvent.setup()
    render(<StoryViewer story={testStory} />)

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('Scene 1 / 3')).toBeInTheDocument()

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    await user.click(nextButton)
    expect(screen.getByText('Scene 2 / 3')).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('Scene 1 / 3')).toBeInTheDocument()
  })

  it('uses scene-level transition overrides and falls back to default transition', async () => {
    const user = userEvent.setup()
    const { container } = render(<StoryViewer story={testStory} />)

    const getFrame = () => {
      const frame = container.querySelector('.story-frame')
      expect(frame).not.toBeNull()
      return frame as HTMLElement
    }

    expect(getFrame()).toHaveAttribute('data-transition', 'fade')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    await user.click(nextButton)
    expect(getFrame()).toHaveAttribute('data-transition', 'slide')

    await user.click(nextButton)
    await user.click(nextButton)
    expect(getFrame()).toHaveAttribute('data-transition', 'zoom')
  })

  it('restores the saved scene index from localStorage', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(STORAGE_KEY, '2')

    render(<StoryViewer story={testStory} />)

    expect(screen.getByText('Scene 3 / 3')).toBeInTheDocument()
    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeEnabled()

    await user.click(nextButton)
    expect(nextButton).toBeDisabled()
  })
})
