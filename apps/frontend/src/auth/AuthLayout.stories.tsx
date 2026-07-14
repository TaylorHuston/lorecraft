import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'

const meta = {
  title: 'Application/Authentication/Auth Layout',
  component: AuthLayout,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    title: 'Sign in to Lorecraft',
    description: 'Return to your private World workspace.',
    children: <p>Form content appears here.</p>,
    footer: <p>Account navigation appears here.</p>,
  },
} satisfies Meta<typeof AuthLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
