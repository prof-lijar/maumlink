import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EpisodePlay } from '@/screens/EpisodePlay'
import { getStepEpisode, stepEpisodes } from '@/content/episodes'
import type { SequenceMissionData } from '@/content/stepSchema'
import { initialSequence, loadStepGame, reduceSequence, shuffleCards } from '@/engine/stepGame'
import { speech } from '@/services/speech'
import { useMvpProgress } from '@/services/mvpProgress'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'

const b01 = getStepEpisode('B01')!
const c01 = getStepEpisode('C01')!
const sequence = c01.steps.find((s) => s.kind === 'sequence') as SequenceMissionData

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ started: true })
  useProfile.setState({ avatarId: 'haru' })
  useMvpProgress.setState({ completedEpisodeIds: [] })
})

function play(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/episode/${id}/play`]}>
      <Routes>
        <Route path="/episode/:episodeId/play" element={<EpisodePlay />} />
        <Route path="/area/:domainId" element={<p>목록 화면</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('step episode data and mission engines', () => {
  it('loads the step episodes', () => {
    expect(stepEpisodes.map((episode) => episode.id).sort()).toEqual([
      'A01',
      'B01',
      'C01',
      'D01',
      'E01',
    ])
    expect(b01.domainId).toBe('B')
    expect(c01.domainId).toBe('C')
  })

  it('sequence: shuffled start, incomplete orders cannot be checked, both repair orders are accepted', () => {
    const start = shuffleCards(sequence, () => 0)
    expect(sequence.acceptedOrders.map((o) => o.join())).not.toContain(start.join())
    let state = initialSequence(sequence)
    state = reduceSequence(state, { type: 'place', id: 'sorry' }, sequence)
    expect(reduceSequence(state, { type: 'check' }, sequence).result).toBeNull()
    state = reduceSequence(state, { type: 'place', id: 'return' }, sequence)
    state = reduceSequence(state, { type: 'place', id: 'ask' }, sequence)
    state = reduceSequence(state, { type: 'check' }, sequence)
    expect(state.result).toBe('wrong')
    expect(state.hintVisible).toBe(true)
    expect(state.placed).toEqual(['sorry', 'return', 'ask'])
    state = reduceSequence(state, { type: 'reset' }, sequence)
    for (const id of ['return', 'ask', 'sorry'])
      state = reduceSequence(state, { type: 'place', id }, sequence)
    expect(reduceSequence(state, { type: 'check' }, sequence).result).toBe('correct')
  })
})

describe('step episode screens', () => {
  it('B01: feeling and thought picks have no wrong answer; friend conversation with retry; check question', async () => {
    const user = userEvent.setup()
    play('B01')
    expect(screen.getByText('나와 너의 생각이 다를 수 있어!')).toBeInTheDocument()
    expect(
      screen.getByText('나는 친구들과 같이 놀고 싶지만 친구들은 아직 나를 부르지 않았어요.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    expect(screen.queryByRole('button', { name: /다음/ })).not.toBeInTheDocument()
    // Reviewed emotion words show the cartoon face card and the source key sentence as a hint.
    expect(screen.getByText('“나도 같이 놀고 싶어!”')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '서운해요' }).querySelector('img')).toHaveAttribute(
      'src',
      '/img/v3/face-hurt-400.webp',
    )
    await user.click(screen.getByRole('radio', { name: '서운해요' }))
    expect(screen.getByText('같은 상황에서도 사람마다 마음이 다를 수 있어요.')).toBeInTheDocument()
    expect(screen.queryByText('다시 한 번 생각해 볼까요?')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    await user.click(screen.getByRole('radio', { name: /놀기 싫어한다고 생각해서/ }))
    expect(screen.getByText(/친구의 생각은 겉으로 보이는 행동만으로/)).toBeInTheDocument()
    expect(screen.getByText(/직접 물어보면 더 잘 알 수 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    // 행동 선택 with the reviewed options: A asks to rethink, C is the recommended answer.
    await user.click(screen.getByRole('radio', { name: /화를 내며/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText('다시 한 번 생각해 볼까요?')).toBeInTheDocument()
    expect(screen.getByText(/친구들이 놀라거나 속상할 수 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /나도 같이 놀아도 돼\?”라고 물어봐요/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText(/함께하고 싶은 마음을 말로 표현하면/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    // 친구와 대화하기: each line gets its own reply; a line that did not go well can be retried.
    expect(screen.getByRole('heading', { name: '친구에게 말해 봐요' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /다음/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '“왜 나만 안 불러?”' }))
    expect(
      screen.getByText('어? 일부러 그런 거 아니야. 네가 놀고 싶은 줄 몰랐어.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/함께 놀고 싶다고 말해 볼까요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '“나도 같이 놀아도 돼?”' }))
    expect(screen.getByText('응! 네가 함께 놀고 싶은 줄 몰랐어. 같이 하자!')).toBeInTheDocument()
    expect(screen.getByText('자신 있게 말했어요!')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '“고마워! 나는 뭐 하면 돼?”' }))
    expect(screen.getByText(/나와 친구의 생각은 다를 수 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '대화 처음부터 다시 하기' }))
    expect(screen.queryByText(/같이 하자!/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '“나도 같이 놀아도 돼?”' }))
    await user.click(screen.getByRole('button', { name: '“좋아!”' }))
    await user.click(screen.getByRole('button', { name: /다음/ }))

    await user.click(screen.getByRole('radio', { name: /알 수 있어요/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText('다시 한 번 생각해 볼까요?')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /아직 알 수 없어요/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText(/맞아요! 친구의 생각을 정확히 알려면/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /마무리하기/ }))

    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['B01']))
    expect(screen.getByText(b01.takeaway)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다른 이야기 만나기' }))
    expect(screen.getByText('목록 화면')).toBeInTheDocument()
  })

  it('C01: friend feeling, action feedback, repair sequence with hint, extra guidance, back and resume', async () => {
    const user = userEvent.setup()
    const view = play('C01')
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: '화가 나요' }))
    expect(screen.getByText(/친구의 마음은 나와 다를 수 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /연필을 찾지 못해 속상했어요/ }))
    expect(screen.getByText(/친구는 속상하거나 걱정할 수 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    await user.click(screen.getByRole('radio', { name: /아무 말도 하지 않아요/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText(/없어진 물건이 있다면 속상하겠죠/)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /연필을 돌려주고/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText(/용기있는 선택이네요/)).toBeInTheDocument()
    // 이전으로 keeps the earlier answer.
    await user.click(screen.getByRole('button', { name: '이전으로' }))
    expect(screen.getByRole('radio', { name: /연필을 찾지 못해 속상했어요/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('button', { name: /다음/ }))

    // 친구와 대화하기 before the repair sequence.
    await user.click(screen.getByRole('button', { name: '“장난이었어! 왜 그렇게 심각해?”' }))
    expect(screen.getByText(/연필이 없어서 걱정됐단 말이야/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '“연필 여기 있어. 숨겨서 미안해.”' }))
    await user.click(screen.getByRole('button', { name: '“마음이 풀릴 때까지 기다릴게.”' }))
    await user.click(screen.getByRole('button', { name: /다음/ }))

    expect(
      screen.getByRole('heading', { name: '친구와 다시 사이좋게 지내요!' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '미안하다고 말해요.' }))
    await user.click(screen.getByRole('button', { name: '연필을 돌려줘요.' }))
    await user.click(screen.getByRole('button', { name: '친구의 마음을 물어봐요.' }))
    await user.click(screen.getByRole('button', { name: /확인하기/ }))
    expect(screen.getByText('친구가 잃어버린 연필을 먼저 돌려주면 어떨까요?')).toBeInTheDocument()
    expect(screen.getByText('친구의 물건을 숨겼다면 먼저 무엇을 해야 할까요?')).toBeInTheDocument()
    // Saved mid-mission: a remount restores the placed cards.
    view.unmount()
    expect(loadStepGame(c01)?.screen).toBe(5)
    play('C01')
    expect(screen.getByRole('button', { name: /1번째: 미안하다고 말해요/ })).toBeInTheDocument()
    // Tap a placed card to take it back, then 다시 해보기 clears the rest.
    await user.click(screen.getByRole('button', { name: /3번째: 친구의 마음을/ }))
    expect(screen.getByText('3번째 카드')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 해보기' }))
    for (const text of ['연필을 돌려줘요.', '미안하다고 말해요.', '친구의 마음을 물어봐요.'])
      await user.click(screen.getByRole('button', { name: text }))
    await user.click(screen.getByRole('button', { name: /확인하기/ }))
    expect(screen.getByText(/관계를 회복하는 좋은 방법이에요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    expect(screen.getByText(/마음이 풀릴 때까지 기다려 줄 수도 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /마무리하기/ }))
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['C01']))
    expect(screen.getByText(c01.takeaway)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 연습하기' }))
    expect(screen.getByRole('heading', { name: '상황을 살펴봐요' })).toBeInTheDocument()
    expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['C01'])
  })
})

describe('자기 인식·마음건강관리: emotion–body match, expression choice', () => {
  it('A01: feeling and body picks, any emotion–body link is explained, links change and reset', async () => {
    const user = userEvent.setup()
    play('A01')
    expect(screen.getByText('나를 느끼는 여행')).toBeInTheDocument()
    // The source document's speech bubbles sit on the scene.
    expect(screen.getByText('발표 진짜 못하나~')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: '부끄러워요' }))
    expect(
      screen.getByText('같은 상황에서도 사람마다 다른 감정을 느낄 수 있어요.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /가슴이 쿵쿵/ }))
    expect(screen.getByText('긴장될 때 이런 반응이 나타날 수 있어요.')).toBeInTheDocument()
    expect(screen.getByText('내 몸의 반응을 보고 내 마음을 알 수 있어요.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    expect(screen.getByRole('heading', { name: '내 마음의 신호를 찾아요!' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /완료하기/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '가슴이 쿵쿵 뛴다, 입술이 마른다.' })).toBeDisabled()
    // A non-typical pair is explained, not marked wrong.
    await user.click(screen.getByRole('button', { name: '화가 나요' }))
    await user.click(screen.getByRole('button', { name: '가슴이 쿵쿵 뛴다, 입술이 마른다.' }))
    expect(
      screen.getByText(
        '화가 날 때 가슴이 쿵쿵 뛰고 입술이 마르는 사람이 있어요. 내 몸의 반응을 보고 내 마음을 알 수 있어요.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /화가 나요, 가슴이 쿵쿵 뛴다, 입술이 마른다.와 연결됨/ }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 해보기' }))
    expect(screen.queryByRole('button', { name: /완료하기/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '화가 나요' }))
    await user.click(
      screen.getByRole('button', { name: '머리에 열이 오르고 눈이 뜨거워지고, 목소리가 커진다.' }),
    )
    await user.click(screen.getByRole('button', { name: '완료하기' }))

    // 나를 도와주는 방법: every reviewed option is a good one.
    await user.click(screen.getByRole('radio', { name: /그림을 그려보기/ }))
    expect(screen.getByText(/그림을 그린다면 어떤 마음이 들까요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /마무리하기/ }))
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['A01']))
    expect(screen.getByText(/우리 모두는 소중하니까요/)).toBeInTheDocument()
  })

  it('D01: feelings, both 말하기 and 도움 요청 accepted, two linked situations, practice without audio', async () => {
    const user = userEvent.setup()
    // Every phrase has a recorded clip now (2026-10-13) and jsdom never fires 'playing', so
    // stub the read: otherwise the first card read stays 'loading' and disables 문장 듣기.
    const speak = vi.spyOn(speech, 'speak').mockResolvedValue(undefined)
    play('D01')
    expect(screen.getByText('내 마음을 표현하고 도움을 요청해요')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: '억울해요' }))
    expect(screen.getByText(/힘든 마음을 혼자 참지 않아도 괜찮아요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /내 순서가 뒤로 밀려서/ }))
    await user.click(screen.getByRole('button', { name: /다음/ }))
    // Every reviewed coping option is accepted; asking a teacher first is a full answer.
    await user.click(screen.getByRole('radio', { name: /도움 요청하기/ }))
    expect(screen.getByText(/선생님께 도움을 요청했군요/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /선택 확인하기/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    expect(screen.getByRole('heading', { name: '내 마음을 말해요!' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /너 때문에 너무 화가 나/ }))
    expect(screen.getByText(/차분하게 말해볼까요/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /다음 상황 보기/ })).toBeEnabled()
    await user.click(screen.getByRole('radio', { name: /순서를 지켜줘/ }))
    await user.click(screen.getByRole('button', { name: /다음 상황 보기/ }))
    expect(screen.getByText('하지만 친구가 또 새치기를 했어요.')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /친구를 밀어요/ }))
    expect(screen.getByText(/서로 다칠 수 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /선생님에게 도움을 요청해요/ }))
    await user.click(screen.getByRole('button', { name: /말하기 연습하기/ }))

    expect(screen.getByRole('heading', { name: '이렇게 말해보아요!' })).toBeInTheDocument()
    expect(screen.getByText(/친구가 계속 새치기해서 힘들어요. 도와주세요./)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /다시 듣기/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /문장 듣기/ }))
    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('친구가 계속 새치기해서 힘들어요') }),
    )
    expect(screen.queryByText(/이 기기에서는 소리를 들을 수 없어요/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /다시 듣기/ })).toBeEnabled()
    speak.mockRestore()
    expect(screen.queryByRole('button', { name: /마무리하기/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /연습했어요/ }))
    expect(screen.getByText(/잘했어요! 힘든 일이 생기면/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /마무리하기/ }))
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['D01']))
    expect(screen.getByText(/믿을 만한 어른에게 이야기해요/)).toBeInTheDocument()
  })
})

describe('잘 모르겠어요, 미션 건너뛰기, 이전으로, 새 완료 기록', () => {
  it('every ungraded pick offers 잘 모르겠어요 and accepts it', async () => {
    // Every feeling or reason pick offers it; the reviewed coping lists (every option is a
    // good one) are the only reflect steps without it.
    for (const episode of stepEpisodes)
      for (const step of episode.steps)
        if (
          step.kind === 'reflect' &&
          ![
            '나를 도와주는 방법',
            '어떻게 하면 좋을까요?',
            '친구의 마음과 행동 알아보기',
            '나도 해볼 수 있어요',
          ].includes(step.label)
        )
          expect(step.options.some((option) => /^잘 모르겠어요\.?$/.test(option.text))).toBe(true)
    const user = userEvent.setup()
    play('A01')
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /잘 모르겠어요/ }))
    expect(screen.getByText(/잘 모르겠어도 괜찮아요/)).toBeInTheDocument()
    expect(screen.queryByText('다시 한 번 생각해 볼까요?')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /다음/ })).toBeInTheDocument()
  })

  it('a 상황별 미션 can be skipped and the episode still completes', async () => {
    const user = userEvent.setup()
    play('A01')
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: '속상해요' }))
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /눈이 뜨거워지고/ }))
    // Non-mission steps cannot be skipped.
    expect(screen.queryByRole('button', { name: '이 미션 건너뛰기' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    expect(screen.getByRole('heading', { name: '내 마음의 신호를 찾아요!' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '이 미션 건너뛰기' }))
    await user.click(screen.getByRole('radio', { name: /숨을 크게/ }))
    await user.click(screen.getByRole('button', { name: /마무리하기/ }))
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['A01']))
    expect(
      screen.getByRole('heading', { name: '잘했어요! 오늘도 새로운 방법을 배웠어요.' }),
    ).toBeInTheDocument()
  })

  it('completion is stored under the new key and old records stay separate', async () => {
    localStorage.setItem(
      'maumlink.progress.mvp-v1',
      JSON.stringify({ state: { completedEpisodeIds: ['A01', 'B02'] }, version: 0 }),
    )
    const { PROGRESS_KEY } = await import('@/services/mvpProgress')
    expect(PROGRESS_KEY).toBe('maumlink.progress.mvp-v2')
    useMvpProgress.getState().markCompleted('B01')
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)!).state.completedEpisodeIds).toEqual([
      'B01',
    ])
    expect(JSON.parse(localStorage.getItem('maumlink.progress.mvp-v1')!).state).toEqual({
      completedEpisodeIds: ['A01', 'B02'],
    })
  })
})

describe('E01 자기관리: every pick is accepted and the two-panel scene shows', () => {
  it('walks feelings, reasons, 마음과 행동 feedback and self-talk to completion', async () => {
    const user = userEvent.setup()
    play('E01')
    expect(screen.getByText('하고 싶은 말이 생겼을 때')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /교실에서 선생님이 설명 중임/ }).querySelectorAll('img'),
    ).toHaveLength(2)
    expect(
      screen.getByText('선생님이 “설명이 끝나면 말해주렴”이라고 하셨어요.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    expect(screen.getByRole('radio', { name: '아쉬워요' }).querySelector('img')).toHaveAttribute(
      'src',
      '/img/v3/face-disappointed-400.webp',
    )
    await user.click(screen.getByRole('radio', { name: '괜찮아요' }))
    expect(screen.getByText(/그 때 마음이 어떤지 알아차리는 것이 중요해요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /잊어버릴까 봐/ }))
    expect(screen.getByText(/민수는 하고 싶은 말이 많았군요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /기다리는 것이 어려워요/ }))
    expect(
      screen.getByText(
        '그래요. 기다리는 것은 민수에게 어려울 수 있어요. 조금씩 연습하면 도움이 돼요.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('다시 한 번 생각해 볼까요?')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /손을 들고 내 차례를/ }))
    expect(screen.getByText(/내가 할 수 있는 방법을 선택해 보아요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /마무리하기/ }))
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['E01']))
  })
})
