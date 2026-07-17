import type { Meta, StoryObj } from '@storybook/react-vite'
import { Eye, EyeOff, Settings } from 'lucide-react'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from './Button/Button'
import { ConfirmDialog } from './Dialog/ConfirmDialog'
import { IconButton } from './IconButton/IconButton'
import { Textarea } from './Textarea/Textarea'
import { TextField } from './TextField/TextField'
import styles from './Controls.stories.module.css'

function ControlsPreview() {
  return (
    <div className={styles.preview}>
      <section>
        <h2>Actions</h2>
        <div className={styles.row}>
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Quiet action</Button>
          <Button variant="destructive">Delete</Button>
          <Button pending pendingLabel="Saving…">
            Save
          </Button>
          <IconButton label="Adventure settings">
            <Settings aria-hidden="true" size={18} />
          </IconButton>
        </div>
      </section>
      <section className={styles.fields}>
        <TextField
          label="World name"
          supportingText="Visible throughout the World bible."
          defaultValue="Stormbound Chapel"
        />
        <TextField label="Canon key" error="Use a unique key." defaultValue="chapel" />
        <Textarea
          label="Description"
          supportingText="Write a concise objective description."
          defaultValue="Rain taps against warped shutters."
        />
      </section>
    </div>
  )
}

function PasswordPreview() {
  const [visible, setVisible] = useState(false)
  return (
    <div className={styles.narrow}>
      <TextField
        autoComplete="current-password"
        defaultValue="correct horse"
        label="Password"
        type={visible ? 'text' : 'password'}
        trailingAction={
          <IconButton
            label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </IconButton>
        }
      />
    </div>
  )
}

function ConfirmationPreview() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="destructive">
        Delete Adventure
      </Button>
      <ConfirmDialog
        confirmLabel="Delete Adventure"
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        open={open}
        pendingLabel="Deleting Adventure…"
        title="Delete Adventure?"
      >
        <p>This permanently removes this Adventure. The World is unchanged.</p>
      </ConfirmDialog>
    </>
  )
}

const meta = {
  title: 'Application/Foundations/Controls',
  component: ControlsPreview,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof ControlsPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PasswordDisclosure: Story = {
  render: () => <PasswordPreview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const password = canvas.getByLabelText('Password')
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }))
    await expect(password).toHaveAttribute('type', 'text')
    await expect(password).toHaveValue('correct horse')
  },
}

export const DestructiveConfirmation: Story = {
  render: () => <ConfirmationPreview />,
}
