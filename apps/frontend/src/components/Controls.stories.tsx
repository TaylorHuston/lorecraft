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

function DisabledFieldsPreview() {
  return (
    <div className={styles.fields}>
      <TextField
        defaultValue="Stormbound Chapel"
        disabled
        label="Disabled World name"
        supportingText="This value cannot be changed."
      />
      <Textarea
        defaultValue="Rain taps against warped shutters."
        disabled
        label="Disabled description"
        supportingText="This description cannot be changed."
      />
    </div>
  )
}

function PendingFieldsPreview() {
  return (
    <div className={styles.fields}>
      <TextField
        defaultValue="Stormbound Chapel"
        label="Pending World name"
        pending
        supportingText="Lorecraft is saving this value."
      />
      <Textarea
        defaultValue="Rain taps against warped shutters."
        label="Pending description"
        pending
        supportingText="Lorecraft is saving this description."
      />
    </div>
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

export const DisabledFields: Story = {
  render: () => <DisabledFieldsPreview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const name = canvas.getByLabelText('Disabled World name')
    const description = canvas.getByLabelText('Disabled description')
    await expect(name).toBeDisabled()
    await expect(name).toHaveValue('Stormbound Chapel')
    await expect(name).toHaveAccessibleDescription('This value cannot be changed.')
    await expect(description).toBeDisabled()
    await expect(description).toHaveValue('Rain taps against warped shutters.')
    await expect(description).toHaveAccessibleDescription('This description cannot be changed.')
  },
}

export const PendingFields: Story = {
  render: () => <PendingFieldsPreview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const name = canvas.getByLabelText('Pending World name')
    const description = canvas.getByLabelText('Pending description')
    await expect(name).toHaveAttribute('aria-busy', 'true')
    await expect(name).not.toBeDisabled()
    await expect(name).toHaveValue('Stormbound Chapel')
    await expect(name).toHaveAccessibleDescription('Lorecraft is saving this value.')
    await expect(description).toHaveAttribute('aria-busy', 'true')
    await expect(description).not.toBeDisabled()
    await expect(description).toHaveValue('Rain taps against warped shutters.')
    await expect(description).toHaveAccessibleDescription(
      'Lorecraft is saving this description.'
    )
  },
}
