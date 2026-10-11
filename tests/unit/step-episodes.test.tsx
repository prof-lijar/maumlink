import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { BehaviorGame } from '@/screens/BehaviorGame'
import { getStepEpisode, stepEpisodes } from '@/content/behaviorEpisode'
import type { PerspectiveSortMissionData, SequenceMissionData } from '@/content/stepSchema'
import {
  initialPerspective,
  initialSequence,
  loadStepGame,
  reducePerspective,
  reduceSequence,
  shuffleCards,
} from '@/engine/stepGame'
import { useMvpProgress } from '@/services/mvpProgress'
import { useProfile } from '@/services/profile'
import { useSettings } from '@/services/settings'

const c01 = getStepEpisode('C01')!
const c05 = getStepEpisode('C05')!
// No story uses the perspective sort any more (C01 now talks it through); the reusable
// mission is still checked with a small fixture.
const perspective: PerspectiveSortMissionData = {
  kind: 'perspective_sort',
  label: '생각 구분하기',
  title: '누구의 생각일까요?',
  instruction: '생각 카드를 알맞은 친구에게 놓아보세요.',
  characters: [
    { id: 'me', name: '나의 생각' },
    { id: 'friend', name: '친구의 생각' },
  ],
  cards: [
    { id: 'thought1', text: '나도 친구들과 함께 놀고 싶어.', characterId: 'me' },
    { id: 'thought2', text: '친구가 함께 놀고 싶은 줄 몰랐어.', characterId: 'friend' },
  ],
  correctFeedback: '잘했어요!',
  retryFeedback: '다시 살펴보아요.',
  hint: '대화를 다시 읽어 보세요.',
  hintLines: [{ speaker: 'me', text: '나도 같이 놀아도 돼?' }],
}
const sequence = c05.steps.find((s) => s.kind === 'sequence') as SequenceMissionData

beforeEach(() => {
  localStorage.clear()
  useSettings.setState({ started: true })
  useProfile.setState({ avatarId: 'sun' })
  useMvpProgress.setState({ completedEpisodeIds: [] })
})

function play(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/episode/${id}/play`]}>
      <Routes>
        <Route path="/episode/:episodeId/play" element={<BehaviorGame />} />
        <Route path="/area/:domainId" element={<p>목록 화면</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('step episode data and mission engines', () => {
  it('loads the step episodes', () => {
    expect(stepEpisodes.map((episode) => episode.id).sort()).toEqual([
      'B02',
      'C01',
      'C04',
      'C05',
      'D04',
    ])
    expect(c01.domainId).toBe('A')
    expect(c05.domainId).toBe('C')
  })

  it('perspective sort: free moves before checking, retry keeps cards, two misses open the hint', () => {
    let state = initialPerspective()
    const [a, b] = perspective.cards
    state = reducePerspective(state, { type: 'selectCard', id: a!.id }, perspective)
    state = reducePerspective(state, { type: 'place', characterId: 'friend' }, perspective)
    state = reducePerspective(state, { type: 'selectCard', id: b!.id }, perspective)
    state = reducePerspective(state, { type: 'place', characterId: 'me' }, perspective)
    state = reducePerspective(state, { type: 'check' }, perspective)
    expect(state.result).toBe('wrong')
    expect(state.placements).toEqual({ [a!.id]: 'friend', [b!.id]: 'me' })
    expect(state.hintVisible).toBe(false)
    state = reducePerspective(state, { type: 'check' }, perspective)
    expect(state.hintVisible).toBe(true)
    // Move each card to the other person, then check again.
    state = reducePerspective(state, { type: 'selectCard', id: a!.id }, perspective)
    state = reducePerspective(state, { type: 'place', characterId: 'me' }, perspective)
    state = reducePerspective(state, { type: 'selectCard', id: b!.id }, perspective)
    state = reducePerspective(state, { type: 'place', characterId: 'friend' }, perspective)
    state = reducePerspective(state, { type: 'check' }, perspective)
    expect(state.result).toBe('correct')
    expect(reducePerspective(state, { type: 'reset' }, perspective).placements).toEqual({})
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
  it('C01: feeling and thought picks have no wrong answer; friend conversation with retry; check question', async () => {
    const user = userEvent.setup()
    play('C01')
    expect(screen.getByText('친구 마음 알아보기')).toBeInTheDocument()
    expect(screen.getByText('그런데 친구들은 아직 나를 부르지 않았어요.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    expect(screen.queryByRole('button', { name: /다음/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /괜찮아요/ }))
    expect(screen.getByText('친구들이 부르지 않아도 괜찮다고 느낄 수 있어요.')).toBeInTheDocument()
    expect(screen.getByText('같은 상황에서도 사람마다 마음이 다를 수 있어요.')).toBeInTheDocument()
    expect(screen.queryByText('다시 한 번 생각해 볼까요?')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    await user.click(screen.getByRole('radio', { name: /싫어해서/ }))
    expect(screen.getByText(/정말 나를 싫어하는지는 아직 몰라요/)).toBeInTheDocument()
    expect(screen.getByText(/직접 물어보면 더 잘 알 수 있어요/)).toBeInTheDocument()
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

    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['C01']))
    expect(screen.getByText(c01.takeaway)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다른 이야기 만나기' }))
    expect(screen.getByText('목록 화면')).toBeInTheDocument()
  })

  it('C05: friend feeling, action feedback, repair sequence with hint, extra guidance, back and resume', async () => {
    const user = userEvent.setup()
    const view = play('C05')
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /화가 날 수도/ }))
    expect(screen.getByText(/친구는 속상하거나 걱정할 수 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    await user.click(screen.getByRole('radio', { name: /아무 말도 하지 않고/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText(/기다리는 것보다 연필을 돌려주고/)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /돌려주고 미안하다고/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText(/좋은 방법이에요!/)).toBeInTheDocument()
    // 이전으로 keeps the earlier answer.
    await user.click(screen.getByRole('button', { name: '이전으로' }))
    expect(screen.getByRole('radio', { name: /화가 날 수도/ })).toHaveAttribute(
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
    expect(loadStepGame(c05)?.screen).toBe(4)
    play('C05')
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
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['C05']))
    expect(screen.getByText(c05.takeaway)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 연습하기' }))
    expect(screen.getByRole('heading', { name: '상황을 살펴봐요' })).toBeInTheDocument()
    expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['C05'])
  })
})

describe('3차: emotion–body match, expression choice, restored B02', () => {
  it('C04: feeling and body picks, any emotion–body link is explained, links change and reset', async () => {
    const user = userEvent.setup()
    play('C04')
    expect(screen.getByText('내 마음 알아보기')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /부끄러워요/ }))
    expect(screen.getByText('친구들 앞에서 실수하면 부끄러울 수 있어요.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /가슴이 쿵쿵/ }))
    expect(screen.getByText(/사람마다 몸의 반응은 다를 수 있답니다/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))

    expect(screen.getByRole('heading', { name: '내 마음의 신호를 찾아요!' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /완료하기/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '가슴이 두근거려요.' })).toBeDisabled()
    // A non-typical pair is explained, not marked wrong.
    await user.click(screen.getByRole('button', { name: '화가 나요.' }))
    await user.click(screen.getByRole('button', { name: '가슴이 두근거려요.' }))
    expect(
      screen.getByText(
        '화가 날 때 가슴이 두근거리는 사람이 있어요. 내 몸에서는 어떤 변화가 생기는지 살펴보아요.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /화가 나요., 가슴이 두근거려요.와 연결됨/ }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 해보기' }))
    expect(screen.queryByRole('button', { name: /완료하기/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '화가 나요.' }))
    await user.click(screen.getByRole('button', { name: '얼굴이 뜨거워져요.' }))
    await user.click(screen.getByRole('button', { name: '완료하기' }))
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['C04']))
    expect(
      screen.getByText('내 마음과 몸의 변화를 알아차리면 나를 더 잘 이해할 수 있어요!'),
    ).toBeInTheDocument()
  })

  it('B02: ungraded reasons, action feedback, sequence with wrong order → hint → retry', async () => {
    const user = userEvent.setup()
    play('B02')
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /잊어버릴까 봐요/ }))
    expect(screen.getByText(/어떻게 행동으로 표현할지는 선택할 수 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /선생님 말씀 중에도/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText(/설명을 듣기 어려울 수 있어요/)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /손을 들고 내 차례를/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    await user.click(screen.getByRole('button', { name: /다음/ }))
    expect(screen.getByRole('heading', { name: '말하기 전에 잠깐!' })).toBeInTheDocument()
    for (const text of ['손을 들어요.', '잠깐 멈춰요.', '내 차례에 이야기해요.'])
      await user.click(screen.getByRole('button', { name: text }))
    await user.click(screen.getByRole('button', { name: /확인하기/ }))
    expect(screen.getByText('먼저 무엇을 하면 좋을지 다시 생각해 볼까요?')).toBeInTheDocument()
    expect(screen.getByText('하고 싶은 말이 생기면 먼저 잠깐 멈춰요.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 해보기' }))
    for (const text of ['잠깐 멈춰요.', '손을 들어요.', '내 차례에 이야기해요.'])
      await user.click(screen.getByRole('button', { name: text }))
    await user.click(screen.getByRole('button', { name: /확인하기/ }))
    expect(screen.getByText(/잠깐 멈추고 기다리면 내 차례에/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /마무리하기/ }))
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['B02']))
  })

  it('D04: feelings, both 말하기 and 도움 요청 accepted, two linked situations, practice without audio', async () => {
    const user = userEvent.setup()
    play('D04')
    expect(screen.getByText('내 마음 돌보기')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /억울해요/ }))
    expect(screen.getByText(/힘든 마음을 혼자 참지 않아도 괜찮아요/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /계속 참고/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText(/도움을 요청해도 괜찮아요/)).toBeInTheDocument()
    // Asking a teacher first is a full answer, not a fallback.
    await user.click(screen.getByRole('radio', { name: /선생님에게 도움을 요청해요/ }))
    await user.click(screen.getByRole('button', { name: /선택 확인하기/ }))
    expect(screen.getByText(/믿을 만한 어른에게 도움을 요청할 수 있어요/)).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: /다시 듣기/ })).toBeEnabled()
    expect(screen.queryByRole('button', { name: /마무리하기/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /연습했어요/ }))
    expect(screen.getByText(/잘했어요! 힘든 일이 생기면/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /마무리하기/ }))
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['D04']))
    expect(
      screen.getByText('내 마음을 표현하고 도움을 요청하는 것은 나를 지키는 좋은 방법이에요!'),
    ).toBeInTheDocument()
  })
})

describe('잘 모르겠어요, 미션 건너뛰기, 이전으로, 새 완료 기록', () => {
  it('every ungraded pick offers 잘 모르겠어요 and accepts it', async () => {
    for (const episode of stepEpisodes)
      for (const step of episode.steps)
        if (step.kind === 'reflect')
          expect(step.options.some((option) => option.text === '잘 모르겠어요.')).toBe(true)
    const user = userEvent.setup()
    play('C04')
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /잘 모르겠어요/ }))
    expect(screen.getByText(/잘 모르겠어도 괜찮아요/)).toBeInTheDocument()
    expect(screen.queryByText('다시 한 번 생각해 볼까요?')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /다음/ })).toBeInTheDocument()
  })

  it('a 상황별 미션 can be skipped and the episode still completes', async () => {
    const user = userEvent.setup()
    play('C04')
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /속상해요/ }))
    await user.click(screen.getByRole('button', { name: /다음/ }))
    await user.click(screen.getByRole('radio', { name: /얼굴이/ }))
    // Non-mission steps cannot be skipped.
    expect(screen.queryByRole('button', { name: '이 미션 건너뛰기' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /다음/ }))
    expect(screen.getByRole('heading', { name: '내 마음의 신호를 찾아요!' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '이 미션 건너뛰기' }))
    await waitFor(() => expect(useMvpProgress.getState().completedEpisodeIds).toEqual(['C04']))
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
    useMvpProgress.getState().markCompleted('C01')
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)!).state.completedEpisodeIds).toEqual([
      'C01',
    ])
    expect(JSON.parse(localStorage.getItem('maumlink.progress.mvp-v1')!).state).toEqual({
      completedEpisodeIds: ['A01', 'B02'],
    })
  })
})
