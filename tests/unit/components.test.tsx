import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChoiceCard } from '../../src/design/ChoiceCard'
import { Sheet } from '../../src/design/Sheet'
import { PrimaryButton } from '../../src/design/Button'

describe('ChoiceCard', () => {
  it('select and speak are separate controls', async () => {
    const onSelect = vi.fn()
    const onSpeak = vi.fn()
    render(
      <ChoiceCard
        id="B"
        domain="social"
        text="가까이에 가서 기다려요"
        selected={false}
        onSelect={onSelect}
        onSpeak={onSpeak}
      />,
    )
    await userEvent.click(screen.getByRole('radio'))
    expect(onSelect).toHaveBeenCalledWith('B')
    await userEvent.click(screen.getByRole('button', { name: '읽어주기' }))
    expect(onSpeak).toHaveBeenCalled()
  })
})

describe('Sheet', () => {
  it('renders as a dialog, closes on Escape and via the close button', async () => {
    const onClose = vi.fn()
    render(
      <Sheet open onClose={onClose} title="힌트">
        <button type="button">안</button>
      </Sheet>,
    )
    expect(screen.getByRole('dialog', { name: '힌트' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
  it('renders nothing when closed', () => {
    render(
      <Sheet open={false} onClose={() => {}} title="x">
        y
      </Sheet>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('PrimaryButton soft-disabled', () => {
  it('stays clickable and focusable but is marked aria-disabled (FR-S2-02)', async () => {
    const onClick = vi.fn()
    render(
      <PrimaryButton softDisabled onClick={onClick}>
        다음
      </PrimaryButton>,
    )
    const b = screen.getByRole('button', { name: '다음' })
    expect(b).toHaveAttribute('aria-disabled', 'true')
    expect(b).not.toBeDisabled()
    await userEvent.click(b)
    expect(onClick).toHaveBeenCalled()
  })
})
