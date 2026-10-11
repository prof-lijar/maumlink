# UI 컴포넌트 명세서 — 개발자가 그대로 활용하는 방법

**범위:** 이 문서에서 정의하는 `컴포넌트`는 화면 이미지를 붙여 넣은 결과물이 아니라 **값/상태에 반응하는 UI**입니다. 그림은 별도 이미지이고, 텍스트/버튼/별/선택 상태는 코드가 렌더링합니다.

## 컴포넌트 소스 위치

- React + TypeScript: `react-example/src/`의 `Icon.tsx`, `StarRating.tsx`, `ProgressStepper.tsx`, `EpisodeCard.tsx`, `ChoiceCard.tsx`, `PrimaryButton.tsx`, `SequenceGame.tsx` 및 `components.tsx`(한꺼번에 export).
- 일반 HTML/JavaScript: `src/mm-ui.js`의 전역 `MMUI` 모듈; 스타일은 `demo/styles.css`.
- 실제 상태와 화면 연결: `react-example/src/App.tsx`, `demo/app.js`.
- 정적 입력 자료: `data/episodes.json`, `data/game-data.json`, `data/tokens.json`, `data/component-contracts.json`.

### 1. `Icon` / `MMUI.icon`

| 항목 | 설명 |
|---|---|
| 역할 | SVG 하나를 독립적으로 표시하는 원자 컴포넌트 |
| 소스 | `assets/icons/{name}.svg` |
| React | `<Icon name="lock" size={24} />` |
| JS | `MMUI.icon('lock', {size:24, alt:''})` |
| 변경 가능한 값 | `name`·`size`; JS만 `alt`, `className` 지원 |
| 대표 상태 | `star-filled`/`star-empty`, `sound-on`/`sound-off`, `lock`/`unlock` |
| 주의 | 이미지에 버튼 기능 없음. 클릭할 경우 상위 `<button>`에 넣기. 의미 없는 장식 아이콘은 `alt=""`. |

### 2. `StarRating` / `MMUI.starRating`

| 항목 | 설명 |
|---|---|
| 역할 | 획득한 별을 `value`만큼 채움. 정해진 별점 개수를 표시하거나 직접 선택 |
| 입력 | `value:number`(0–`max`), `max:number`(기본 4), `size:number`, `label:string` |
| 인터랙션 | React: `onChange(value)` 존재하면 클릭 가능한 별, 없으면 읽기 전용. JS: `interactive:true`, `onChange(value)` |
| 내부 이미지 | `icons/star-filled.svg`, `icons/star-empty.svg` 각각 독립 렌더링 |
| 상태 | `0/4`, `1/4`, `2/4`, `3/4`, `4/4`; 선택 가능/읽기 전용 |
| 이벤트 | 별 `n` 클릭 → `onChange(n)`; React/JS 모두 현재 선택한 별 재클릭 → `0`으로 리셋 |
| 주의 | 점수 계산 로직이 아님. 채울 별 **값은 게임 결과/서버**가 결정해야 함. |

React:
```tsx
const [stars, setStars] = React.useState(2);
<StarRating value={stars} max={4} onChange={setStars} />;
// 서버에서 4점을 내려주면 setStars(4) -> 별 4개가 채워짐
```

Vanilla JS:
```js
const rating = MMUI.starRating({value:2, max:4, interactive:false});
mount.append(rating);
rating.setValue(4);              // UI 업데이트
console.log(rating.getValue());  // 4
```

### 3. `ProgressStepper` / `MMUI.progress`

| 항목 | 설명 |
|---|---|
| 역할 | 미니게임 단계 진행 구간을 숫자에 따라 채움 |
| 입력 | React: `current`, `total=4`, `onChange?`; JS: `current`, `total=4`, `interactive`, `onChange?` |
| 상태 | `current=0` 모두 비어 있음 → `current=total` 모두 채움 |
| 갱신 | React는 state 갱신; JS는 반환 요소의 `.setValue(n)` 호출 |
| 렌더링 | 개별 `<span>`/`<button>`에 `is-filled` 클래스로 색 변경 |
| 주의 | 게임 진행 현황을 보여줄 뿐, 실제 페이지 이동 기능은 외부 화면 로직에서 연결해야 함. |

```tsx
<ProgressStepper current={step} total={4} />
```

### 4. `EpisodeCard` / `MMUI.episodeCard`

| 항목 | 설명 |
|---|---|
| 역할 | 에피소드 리스트 1행. 텍스트·썸네일·별점·상태·네비게이션을 조합 |
| 입력 | `episode:{id,title,status,stars,illustration}`, `selected?`, `onClick?`(React) / `onOpen?`(JS) |
| `locked` | `disabled=true`, 자물쇠 아이콘, 흐린 스타일, 누를 수 없음 |
| `available` | 열 수 있는 행, 오른쪽 화살표 표시 |
| `completed` | 별 0–4개 표시, 다시 들어갈 수 있음 |
| 누름 이벤트 | React `onClick(episode)` / JS `onOpen(episode)` |
| 주의 | 잠금 상태와 별점은 **별도 필드**임. UI 컴포넌트는 다음 에피소드를 자동으로 열지 않음. |

에피소드 1개 모델:
```ts
type EpisodeStatus = 'locked' | 'available' | 'completed';
type Episode = {
  id: string; title: string;
  status: EpisodeStatus; stars: number; // stars = 0..4
  illustration?: 'haru' | 'sun' | 'backpack';
};
```

실제 업데이트 흐름:
1. 게임이 정답 판정을 하고 달성 기준으로 `awardedStars`를 계산.
2. 해당 에피소드의 `stars` 및 `status` 변경.
3. 잠금 해제 정책이 충족된 다음 에피소드의 `status='available'` 설정.
4. 변경된 episodes 배열을 컴포넌트에 전달하면 카드·별·잠금이 자동 갱신됨.
5. 저장/동기화는 UI 외부 `localStorage` 또는 API에서 별도로 처리.

### 5. `ChoiceCard` / `MMUI.choiceCard`

| 항목 | 설명 |
|---|---|
| 역할 | 감정 카드·행동 카드 한 장: 그림 + 라벨 + 선택 상태 |
| 입력 | React: `choice:{id,label,image}`, `selected`, `onSelect`, `disabled?`; JS: `id,label,image,group='mini_game',selected,disabled,onSelect,tint='blue'` |
| 기본 | 선택되지 않은 상태; `mm-choice` CSS |
| 선택됨 | `selected=true`일 때 `is-selected` 테두리 및 `aria-pressed=true` |
| 비활성 | `disabled=true`일 때 클릭 차단 |
| 이벤트 | 눌러서 `onSelect(id)` 호출 |
| 이미지 | `assets/illustrations/mini_game/{image}.png`, 카드 바탕/테두리와 분리됨 |
| 주의 | 선택을 저장하지 않음. React state·Vanilla 앱 상태에서 선택 ID를 보관. |

### 6. `SequenceGame` (React) / `MMUI.slot`과 앱 로직 (JS)

| 항목 | 설명 |
|---|---|
| 역할 | 행동 카드 3개를 정해진 순서로 선택하는 미니게임 |
| React 입력 | `<SequenceGame onSuccess={completeEpisode} />` |
| JS 구성 | `MMUI.choiceCard` × 3, `MMUI.slot` × 3, `demo/app.js` 내 `answer`, `sequence` |
| 정답 예시 | `['think','raise','speak']` = 생각 → 손 들기 → 차례에 말하기 |
| 오답 | `wrong` 피드백 노출 후 재선택 가능 |
| 정답 | `correct` 피드백 노출 + 완료 버튼 활성화 |
| 완료 | React의 `onSuccess()` 또는 JS의 `finish()` 실행. 데모는 별 4개 지급 |
| 주의 | React 예시는 이 순서 게임 하나로 구성된 **샘플 로직**입니다. 콘텐츠별 카드 개수·정답·별 지급 기준 등은 커스터마이징 필요. |

선택 순서 판정 예시:
```js
const answer = ['think', 'raise', 'speak'];
const correct = selected.length === answer.length &&
                answer.every((id, i) => selected[i] === id);
```

### 7. `PrimaryButton` / `MMUI.button`

| 항목 | 설명 |
|---|---|
| 역할 | 큰 CTA·보조 CTA. 배경은 CSS, 텍스트는 DOM |
| React | `<PrimaryButton onClick={goNext} disabled={!correct}>다음</PrimaryButton>` |
| JS | `MMUI.button('다음',{variant:'primary',iconName:'chevron-right',onClick:goNext,disabled:false})` |
| 상태 | 활성 / 비활성 / 보조(`secondary`, JS) / 부가(`ghost`, JS) |
| 이벤트 | 클릭 시 부모가 지정한 `onClick` 실행 |
| 주의 | 완성된 버튼 PNG로 교체하지 말고 HTML 버튼을 권장. 반응형 및 접근성 유리. |

### 8. `MapLocation` (데모 화면 합성형)

이 버전에서 별도 TSX 파일이 아닌 `demo/app.js`의 `map()`에서 조합하는 컴포넌트 패턴입니다.

| 항목 | 설명 |
|---|---|
| 역할 | 건물 그림 + 이름/영역 + 알림 `!`를 각각 DOM으로 구성 |
| 입력 | `id`, `label`, `level`, `badgeCount`, `onClick`에 해당하는 값 |
| 위치 그림 | `assets/places/{classroom,home,playground,rest,notebook}.svg` |
| 알림 | `badgeCount > 0`일 때 `.map-zone__badge` 렌더링; 그림 안에 붙어 있지 않음 |
| 클릭 | 해당 영역의 에피소드 목록으로 이동. 실제 서비스에서 영역별 데이터를 연결해야 함 |
| 주의 | React용 독립 `MapLocation.tsx`는 아직 제공되지 않음. HTML/CSS 구조를 React로 이식 가능. |

### 9. `SpeechBubble` / `MMUI.message` (안내 말풍선)

| 항목 | 설명 |
|---|---|
| 역할 | 캐릭터 아바타 + 지도/에피소드 안내 문장 |
| Vanilla | `MMUI.message('안녕, 하루야!', 'avatar_haru')` |
| React | 독립 컴포넌트 제공 X. `<div className="mm-message">` 안에 `<img>`·`<p>` 조합 |
| 주의 | 문장을 이미지에 넣지 않고 사용자 이름이나 상황에 따라 동적으로 변경 |

### 10. `Counter` / `MMUI.counter` (별·수첩 수치)

| 항목 | 설명 |
|---|---|
| 역할 | 별 총계 또는 완료 에피소드 개수 표시 |
| Vanilla | `MMUI.counter({icon:'star-filled', value:12})` |
| React | 독립 컴포넌트 제공 X. `<div className="mm-counter"><Icon .../><b>{value}</b></div>` |
| 계산 | `episodes.reduce((sum, ep) => sum + ep.stars, 0)` / `episodes.filter(ep => ep.status === 'completed').length` |
| 주의 | 표시 컴포넌트에서 점수 조작하지 않음. 상위 상태에서 합계 계산 |

## 디자인 스타일 정의

- `data/tokens.json`: 색상·간격 등 숫자 기반 스타일 토큰의 단일 참조 파일.
- `demo/styles.css`: 일반 웹에서 쓰는 컴포넌트 스타일(`mm-*` 클래스).
- `react-example/src/styles.css`: React 예제용 CSS.
- 폰트는 기본 시스템 폰트 사용; 특정 상용/외부 폰트는 포함되어 있지 않음.
- `assets/ui_shapes/*.svg`는 **텍스트가 없는 참고 배경**으로 제공됩니다. 동적인 가로폭 및 줄바꿈은 CSS로 구현하는 것이 실용적입니다.

## API/서버 연결 규칙

| 서버 필드 예시 | UI 연결 | 저장 주체 |
|---|---|---|
| `user.avatarId` | 캐릭터 선택 및 말풍선 아바타 | 사용자 프로필 |
| `episodes[].status` | `EpisodeCard` disabled/lock | 학습 진도 모델 |
| `episodes[].stars` | `StarRating` filled/empty | 평가/성취 결과 |
| `game.selectedEmotionId` | `ChoiceCard.selected` | 세션 또는 미션 로그 |
| `game.selectedActionIds` | `SequenceGame` 슬롯/정답 검사 | 세션 또는 미션 로그 |
| `ui.currentStep` | `ProgressStepper` | 화면 내 로컬 상태 |
| `ui.soundMuted` | 음소거 아이콘 전환 | 기기별 앱 설정 |

**중요:** `onSuccess()`가 호출되었다고 무조건 별 4개를 주는 현재 동작은 **개발 예시**입니다. 실제 학습 효과와 성취 판정 로직은 기획한 규칙에 따라 서버·도메인 계층에서 정의해야 합니다.
