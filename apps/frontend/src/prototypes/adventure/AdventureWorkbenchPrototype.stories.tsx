import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { AdventureWorkbenchPrototype } from './AdventureWorkbenchPrototype'

const meta = {
  title: 'Prototypes/Adventure Workbench',
  component: AdventureWorkbenchPrototype,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AdventureWorkbenchPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const DesktopCenterAnchored: Story = {
  args: {
    layout: 'desktop',
    initialPane: 'story',
    initialMode: 'act',
  },
}

export const ComposerModeInteraction: Story = {
  args: {
    layout: 'desktop',
    initialPane: 'story',
    initialMode: 'act',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const storyMode = canvas.getByRole('button', { name: 'Story' })

    await userEvent.click(storyMode)
    await expect(storyMode).toHaveAttribute('aria-pressed', 'true')
    await expect(canvas.getByPlaceholderText('Add accepted scene prose...')).toBeVisible()
  },
}

export const DesktopGenerating: Story = {
  args: {
    layout: 'desktop',
    initialMode: 'guide',
    generating: true,
  },
}

export const MobileStory: Story = {
  args: {
    layout: 'mobile',
    initialPane: 'story',
    initialMode: 'act',
  },
}

export const MobilePlayer: Story = {
  args: {
    layout: 'mobile',
    initialPane: 'player',
  },
}

export const MobileScene: Story = {
  args: {
    layout: 'mobile',
    initialPane: 'scene',
  },
}

export const MobileTabNavigation: Story = {
  args: {
    layout: 'mobile',
    initialPane: 'story',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const storyTab = canvas.getByRole('tab', { name: 'Story' })
    storyTab.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('tab', { name: 'Player' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await expect(canvas.getByRole('heading', { name: 'Elara Vance' })).toBeVisible()

    await userEvent.click(canvas.getByRole('tab', { name: /^Scene/ }))
    await expect(canvas.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'adventure-tab-scene'
    )
    await expect(canvas.getByRole('heading', { name: 'Stormbound Chapel' })).toBeVisible()
  },
}
