import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { Home } from '@/screens/Home'
import { DomainEpisodes } from '@/screens/DomainEpisodes'
import { BehaviorGame } from '@/screens/BehaviorGame'
import { episodeIndex } from '@/content/episodeIndex'
import { useProfile } from '@/services/profile'
import { useMvpProgress, completionPercent } from '@/services/mvpProgress'
import { useSettings } from '@/services/settings'

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ started: false })
  useProfile.setState({ avatarId: null })
  useMvpProgress.setState({ completedEpisodeIds: [] })
})

function renderFlow() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/area/:domainId" element={<DomainEpisodes />} />
        <Route path="/episode/:episodeId/play" element={<BehaviorGame />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('new main flow', () => {
  it('opens the question screen through start, avatar, map, and episode list', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: '시작하기' }))
    expect(screen.getByRole('heading', { name: '나의 탐험가를 골라요' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '하늘 탐험가' }))
    await user.click(screen.getByRole('button', { name: '다음' }))
    expect(
      screen.getByRole('heading', { name: '안녕! 오늘은 어느 곳을 탐험할까요?' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status', { name: /전체 15개 중 0퍼센트/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^학교, 교실에서 지내기/ }))
    expect(screen.getByRole('heading', { name: '학교' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '에피소드 6개' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /나도 할 말이 있어요/ }))
    expect(screen.getByRole('heading', { name: '상황을 살펴봐요' })).toBeInTheDocument()
    expect(screen.getByText('이야기 02 · 나도 할 말이 있어요')).toBeInTheDocument()
    expect(screen.getByText(/선생님이 수업 내용을 설명하고 있어요/)).toBeInTheDocument()
  })

  it('lists A03 under the school with its scene and no guide dog', async () => {
    const user = userEvent.setup()
    useSettings.setState({ started: true })
    useProfile.setState({ avatarId: 'sky' })
    renderFlow()
    expect(
      screen.getByRole('button', { name: /^생활 정원, .*2개 중 0개 완료/ }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: /^학교, 교실에서 지내기, 6개 중 0개 완료/ }),
    )
    expect(screen.getByRole('heading', { name: '학교' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '에피소드 6개' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /하던 일이 잘 안돼요/ }))
    expect(screen.getByText('이야기 04 · 하던 일이 잘 안돼요')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /종이 접기/ })).toHaveAttribute(
      'src',
      '/scenes/a03-origami.webp',
    )
    expect(screen.queryByAltText('안내 강아지')).not.toBeInTheDocument()
  })

  it('shows the crayon scene for C02', async () => {
    useSettings.setState({ started: true })
    useProfile.setState({ avatarId: 'sky' })
    render(
      <MemoryRouter initialEntries={['/episode/C02/play']}>
        <Routes>
          <Route path="/episode/:episodeId/play" element={<BehaviorGame />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('img', { name: /빨간 색연필로 그림/ })).toHaveAttribute(
      'src',
      '/scenes/c02-crayon.webp',
    )
  })

  it('shows skill tags in the school list and opens the presentation story', async () => {
    const user = userEvent.setup()
    useSettings.setState({ started: true })
    useProfile.setState({ avatarId: 'sky' })
    renderFlow()
    await user.click(screen.getByRole('button', { name: /^학교,/ }))
    for (const tag of ['차근차근 해보기', '내 마음 알아보기', '친구와 함께하기'])
      expect(screen.getByText(tag)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /친구들이 내 발표를 놀렸어요/ }))
    expect(screen.getByText('이야기 05 · 친구들이 내 발표를 놀렸어요')).toBeInTheDocument()
    expect(screen.getByText('마음이 속상하고 얼굴도 뜨거워지는 것 같아요.')).toBeInTheDocument()
  })

  it('groups episodes by place after the 2026-10-10 reshuffle', () => {
    const byDomain = (id: string) =>
      episodeIndex.episodes.filter((e) => e.domainId === id).map((e) => e.id)
    expect(byDomain('A')).toEqual(['C01', 'C03'])
    expect(byDomain('B')).toEqual(['B01', 'A02', 'B03'])
    expect(byDomain('C')).toEqual(['A01', 'B02', 'C02', 'A03', 'C04', 'C05'])
    expect(byDomain('D')).toEqual(['D01', 'D02', 'D03', 'D04'])
    expect(episodeIndex.domains.map((d) => d.name)).toEqual([
      '밖에서 친구와 놀기',
      '집에서 스스로 하기',
      '교실에서 지내기',
      '쉬고 도움받기',
    ])
  })

  it('keeps progress separate from the previous four lessons', () => {
    localStorage.setItem('maumlink.progress.v1', JSON.stringify({ entries: { old: { times: 1 } } }))
    expect(episodeIndex.episodes).toHaveLength(15)
    expect(useMvpProgress.getState().completedEpisodeIds).toEqual([])
    expect(completionPercent(1)).toBe(7)
  })
})
