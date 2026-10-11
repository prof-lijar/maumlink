import type { Dispatch, RefObject } from 'react'
import { useSortingDrag } from './useSortingDrag'
import type { BehaviorEpisode } from '@/content/behaviorEpisode'
import type { GameEvent, GameState, SortCategory } from '@/engine/behaviorGame'

const categories: { id: SortCategory; label: string; icon: string }[] = [
  { id: 'do', label: '이렇게 해요', icon: '👍' },
  { id: 'rethink', label: '안돼요', icon: '✋' },
]
const categoryLabel = (id: SortCategory) => categories.find((c) => c.id === id)!.label

export function SortingReview({ episode }: { episode: BehaviorEpisode }) {
  return (
    <div className="garden-sort-review">
      {categories.map((category) => (
        <section
          key={category.id}
          className="garden-sort-review__group"
          data-category={category.id}
        >
          <h2>
            <span aria-hidden="true">{category.icon} </span>
            {category.label}
          </h2>
          <ul>
            {episode.sorting.cards
              .filter((card) => card.category === category.id)
              .map((card) => (
                <li key={card.id}>
                  {card.text}
                  <small>{card.feedback}</small>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function BehaviorSorting({
  episode,
  state,
  dispatch,
  headingRef,
}: {
  episode: BehaviorEpisode
  state: GameState
  dispatch: Dispatch<GameEvent>
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  const { drag, baskets, handlers, suppressClick } = useSortingDrag((id, category) =>
    dispatch({ type: 'dropCard', id, category }),
  )
  const cards = episode.sorting.cards
  const placed = Object.keys(state.placements).length
  const selected = cards.find((card) => card.id === state.selectedCardId)
  const unplaced = cards.filter((card) => !state.placements[card.id])
  const cardButton = (card: (typeof cards)[number]) => {
    const category = state.placements[card.id]
    const wrong = state.sortWrongIds.includes(card.id)
    return (
      <button
        key={card.id}
        type="button"
        className="garden-sort-card"
        data-placed={category || undefined}
        aria-label={card.text}
        aria-pressed={state.selectedCardId === card.id}
        aria-describedby={`sort-placement-${card.id}${wrong ? ` sort-feedback-${card.id}` : ''}`}
        disabled={Boolean(state.sortOutcome)}
        data-review={wrong || undefined}
        data-dragging={drag?.id === card.id || undefined}
        {...handlers(card.id)}
        onDragStart={(event) => event.preventDefault()}
        onClick={(event) => {
          if (suppressClick.current && event.detail !== 0) {
            suppressClick.current = false
            return
          }
          dispatch({ type: 'selectCard', id: card.id })
          if (event.detail === 0)
            requestAnimationFrame(() =>
              baskets.current.do?.querySelector<HTMLButtonElement>('button')?.focus(),
            )
        }}
      >
        <span className="garden-sort-card__text">{card.text}</span>
        <span id={`sort-placement-${card.id}`} className="garden-sort-card__label">
          {state.selectedCardId === card.id
            ? category
              ? '선택한 카드 · 옮길 칸을 눌러요'
              : '선택한 카드'
            : category
              ? ''
              : '아직 안 나눴어요'}
          {wrong ? ' · 다시 살펴봐요' : ''}
        </span>
      </button>
    )
  }
  return (
    <>
      <div className="garden-card garden-guide garden-sort-guide">
        <h1 ref={headingRef} tabIndex={-1}>
          행동을 나눠 봐요
        </h1>
        <p>{episode.sorting.prompt}</p>
      </div>
      <p className="garden-sort-instruction" id="sort-instruction">
        카드를 위 칸으로 끌어 놓아요.
        <br />
        카드를 누르고 칸을 눌러도 돼요.
      </p>
      <div className="garden-sort-zones" role="group" aria-label="행동을 나눠 담을 칸">
        {categories.map((category) => {
          const inside = cards.filter((card) => state.placements[card.id] === category.id)
          return (
            <section
              key={category.id}
              ref={(element) => {
                baskets.current[category.id] = element
              }}
              className="garden-sort-zone"
              data-category={category.id}
              data-over={drag?.target === category.id || undefined}
              data-ready={(selected && !state.sortOutcome) || undefined}
            >
              <button
                type="button"
                className="garden-sort-zone__head"
                aria-label={category.label}
                aria-describedby={`basket-count-${category.id}`}
                disabled={!selected || Boolean(state.sortOutcome)}
                onClick={() => dispatch({ type: 'categorize', category: category.id })}
              >
                <span className="garden-sort-zone__icon" aria-hidden="true">
                  {category.icon}
                </span>
                <strong>{category.label}</strong>
                <small id={`basket-count-${category.id}`}>{inside.length}장</small>
              </button>
              {inside.length === 0 ? (
                <p className="garden-sort-zone__empty">여기에 카드를 담아요.</p>
              ) : (
                <div className="garden-sort-zone__cards">{inside.map(cardButton)}</div>
              )}
            </section>
          )
        })}
      </div>
      {unplaced.length > 0 && (
        <div
          className="garden-sort-cards"
          role="group"
          aria-label="나눌 행동 카드"
          aria-describedby="sort-instruction"
        >
          {unplaced.map(cardButton)}
        </div>
      )}
      <p className="garden-sort-status" role="status">
        {drag?.target
          ? `${categoryLabel(drag.target)}에 놓아요.`
          : state.sortOutcome
            ? '모두 알맞게 나눴어요!'
            : selected
              ? `“${selected.text}” 어디에 담을까요?`
              : `${cards.length}장 중 ${placed}장을 나눴어요.`}
      </p>
      {drag && (
        <div
          className="garden-sort-ghost"
          aria-hidden="true"
          style={{
            left: Math.max(8, Math.min(drag.x - 130, window.innerWidth - 288)),
            top: Math.max(8, drag.y - 42),
          }}
        >
          {cards.find((card) => card.id === drag.id)?.text}
        </div>
      )}
      {state.sortWrongIds.length > 0 && (
        <div className="garden-sort-feedback" role="status">
          <p>이 카드를 다시 살펴봐요.</p>
          <ul>
            {cards
              .filter((card) => state.sortWrongIds.includes(card.id))
              .map((card) => (
                <li key={card.id} id={`sort-feedback-${card.id}`}>
                  <strong>{card.text}</strong>
                  <span>{card.feedback}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
      {!state.sortOutcome && (
        <>
          <div className="garden-help">
            <button
              type="button"
              aria-expanded={state.hintVisible}
              aria-controls="sort-hint"
              onClick={() => dispatch({ type: 'toggleHint' })}
            >
              힌트 보기
            </button>
            <button
              type="button"
              aria-expanded={state.modelVisible}
              aria-controls="sort-model"
              onClick={() => dispatch({ type: 'toggleModel' })}
            >
              예시 보기
            </button>
          </div>
          {state.hintVisible && (
            <p className="garden-note" id="sort-hint">
              {episode.sorting.hint}
            </p>
          )}
          {placed > 0 && (
            <button
              type="button"
              className="garden-finish__again garden-retry"
              onClick={() => dispatch({ type: 'resetSort' })}
            >
              다시 해보기
            </button>
          )}
          {state.modelVisible && (
            <div id="sort-model" className="garden-sort-model">
              <p>이렇게 나눌 수 있어요.</p>
              <SortingReview episode={episode} />
              <button
                className="garden-finish__again"
                type="button"
                onClick={() => dispatch({ type: 'applySortModel' })}
              >
                예시대로 나누기
              </button>
            </div>
          )}
        </>
      )}
      <button
        type="button"
        className="garden-cta"
        disabled={!state.sortOutcome && placed !== cards.length}
        onClick={() => dispatch({ type: state.sortOutcome ? 'next' : 'submitSort' })}
      >
        {state.sortOutcome ? '다음' : '나눈 내용 확인하기'}
        <span aria-hidden="true">›</span>
      </button>
    </>
  )
}
