import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { Home } from '@/screens/Home'
import { DomainEpisodes } from '@/screens/DomainEpisodes'
import { EpisodePlay } from '@/screens/EpisodePlay'
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
        <Route path="/episode/:episodeId/play" element={<EpisodePlay />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('main flow: start → explorer → map → area → story', () => {
  it('opens a story through start, avatar, map, and the area list', async () => {
    const user = userEvent.setup()
    renderFlow()
    await user.click(screen.getByRole('button', { name: '시작하기' }))
    expect(screen.getByRole('heading', { name: '나의 캐릭터를 선택해요!' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '소라' }))
    await user.click(screen.getByRole('button', { name: '다음' }))
    expect(
      screen.getByRole('heading', { name: '안녕! 오늘은 어느 곳을 탐험할까요?' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status', { name: /전체 5개 중 0퍼센트/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^관계 인식, 운동장, 1개 중 0개 완료/ }))
    expect(screen.getByRole('heading', { name: '관계 인식' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '에피소드 1개' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /친구들과 함께 놀고 싶어요/ }))
    expect(screen.getByRole('heading', { name: '상황을 살펴봐요' })).toBeInTheDocument()
    expect(screen.getByText('이야기 01 · 친구들과 함께 놀고 싶어요')).toBeInTheDocument()
    expect(
      screen.getByText('나는 친구들과 같이 놀고 싶지만 친구들은 아직 나를 부르지 않았어요.'),
    ).toBeInTheDocument()
  })

  it('begins at the start page when no character was chosen yet, even if started was saved', async () => {
    useSettings.setState({ started: true })
    useProfile.setState({ avatarId: null })
    const user = userEvent.setup()
    renderFlow()
    expect(screen.getByRole('button', { name: '시작하기' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '나의 캐릭터를 선택해요!' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '시작하기' }))
    expect(screen.getByRole('heading', { name: '나의 캐릭터를 선택해요!' })).toBeInTheDocument()
  })

  it('goes straight to the map when a character is already chosen', () => {
    useSettings.setState({ started: true })
    useProfile.setState({ avatarId: 'mina' })
    renderFlow()
    expect(
      screen.getByRole('heading', { name: '안녕! 오늘은 어느 곳을 탐험할까요?' }),
    ).toBeInTheDocument()
  })

  it('shows each area with its own scene landmark and the reviewed story scene', async () => {
    const user = userEvent.setup()
    useSettings.setState({ started: true })
    useProfile.setState({ avatarId: 'haru' })
    renderFlow()
    for (const name of ['자기 인식', '관계 인식', '관계 관리', '마음건강관리', '자기관리'])
      expect(screen.getByRole('button', { name: new RegExp(`^${name}, `) })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^자기 인식,/ }))
    expect(screen.getByText('나를 느끼는 여행')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /친구들이 내 발표 실수를/ }))
    expect(screen.getByRole('img', { name: '친구들이 내 발표를 듣고 놀려요.' })).toHaveAttribute(
      'src',
      '/img/v3/scene-self-presentation-teasing-800.webp',
    )
    expect(screen.getByText('친구들이 내 발표를 듣고 웃으며 놀렸어요.')).toBeInTheDocument()
    expect(screen.queryByAltText('안내 강아지')).not.toBeInTheDocument()
  })

  it('holds one reviewed story per social-emotional area', () => {
    expect(episodeIndex.domains.map((d) => d.name)).toEqual([
      '자기 인식',
      '관계 인식',
      '관계 관리',
      '마음건강관리',
      '자기관리',
    ])
    expect(episodeIndex.episodes.map((e) => `${e.domainId}:${e.id}`)).toEqual([
      'A:A01',
      'B:B01',
      'C:C01',
      'D:D01',
      'E:E01',
    ])
  })

  it('keeps progress separate from the previous 1.0 lesson records', () => {
    localStorage.setItem('maumlink.progress.v1', JSON.stringify({ entries: { old: { times: 1 } } }))
    expect(episodeIndex.episodes).toHaveLength(5)
    expect(useMvpProgress.getState().completedEpisodeIds).toEqual([])
    expect(completionPercent(1)).toBe(20)
  })
})

describe('changing the companion from the map', () => {
  it('opens the character pick from the avatar button and keeps the new choice', async () => {
    const user = userEvent.setup()
    useSettings.setState({ started: true })
    useProfile.setState({ avatarId: 'haru' })
    renderFlow()
    await user.click(screen.getByRole('button', { name: '캐릭터 바꾸기' }))
    expect(screen.getByRole('heading', { name: '나의 캐릭터를 선택해요!' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '하루' })).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('radio', { name: '미나' }))
    await user.click(screen.getByRole('button', { name: '다음' }))
    expect(useProfile.getState().avatarId).toBe('mina')
    expect(
      screen.getByRole('heading', { name: '안녕! 오늘은 어느 곳을 탐험할까요?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '캐릭터 바꾸기' }).querySelector('img'),
    ).toHaveAttribute('src', '/img/v3/char-mina-400.webp')
  })
})
