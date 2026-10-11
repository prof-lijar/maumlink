# 미니게임 ① — 행동 선택하기: 개발자 가이드

**목적:** 화면 5장을 이미지로 붙이는 대신, 원본 시안의 **삽화만 PNG**로 사용하고 나머지(안내문, 버튼, 카드, 진행바, 정답, 오답, 배움 정리)는 **개별 UI 컴포넌트**로 구현합니다. 텍스트는 PNG 안에 넣지 않았습니다. 제공된 클립 이미지는 원본 시안에서 잘라낸 래스터 이미지이므로 배경·등장인물 같은 그림 내부 구조를 개별적으로 편집할 수는 없습니다.

## 1. 실행과 통합

### React + TypeScript (기존 개발 키트 포함)

```bash
cd maeum_maeul_devkit/react-example
npm install
npm run dev
```

목록에서 **나도 할 말이 있어요!** 에피소드를 선택하면 5단계 행동 선택 게임이 열립니다. 모든 컴포넌트는 React 19 기준 TSX로 제공되며 새로운 UI 라이브러리 의존성이 없습니다. 다른 React 앱에서도 다음 두 부분을 프로젝트에 복사하고 경로를 조정하면 활용할 수 있습니다.

- 소스: `react-example/src/mini-game-1/` (+ 기존 `react-example/src/Icon.tsx`와 `assets/icons/`)
- 삽화: `assets/illustrations/mini_game_1/` (+ 강아지 안내 캐릭터 `assets/illustrations/characters/dog_guide.png`)

**React 앱 이외의 일반 웹앱**은 `mini-game-1-demo/index.html`을 참고하세요. React 미설치 데모:

```bash
cd maeum_maeul_devkit
python3 -m http.server 8000
# 브라우저: http://localhost:8000/mini-game-1-demo/
```

브라우저 데모 오른쪽의 JSON 편집기에서 문구를 바꿔 즉시 동작을 확인할 수 있습니다. 단순히 HTML 파일을 `file://`로 여는 것은 JSON 로딩 때문에 권장하지 않습니다.

## 2. 파일 구조

| 위치 | 용도 |
|---|---|
| `react-example/src/mini-game-1/MiniGameOne.tsx` | 전체 게임의 상태 전환·선택 판정·콜백 관리 |
| `react-example/src/mini-game-1/MiniGamePanels.tsx` | 디자인 요소별 독립 컴포넌트 |
| `react-example/src/mini-game-1/mini-game-one.css` | 버튼, 카드, 텍스트박스, 진행 상태 디자인 |
| `react-example/src/mini-game-1/types.ts` | 외부에서 전달하는 props와 콘텐츠 타입 |
| `react-example/src/mini-game-1/index.ts` | 한 줄로 import하는 배럴 export |
| `data/mini-game-1.json` | 설명 문구, 선택지, 정답, 결과 및 학습 정리 데이터(단독 데모 사용) |
| `react-example/src/mini-game-1/default-config.json` | 위 JSON의 React 번들용 복사본; 수정 시 두 파일 모두 갱신하거나 `config` prop으로 주입 |
| `assets/illustrations/mini_game_1/` | 텍스트 없는 장면 삽화/선택 그림 PNG 8장 |
| `mini-game-1-demo/` | JSON을 바꿔볼 수 있는 인터랙티브 일반 웹 데모 |

## 3. 개별 컴포넌트 API

| 컴포넌트 | 입력값 (props) | 동작·상태·개발 팁 |
|---|---|---|
| `MiniGameOne` | `config?`, `assetBaseUrl?`, `initialStage?`, `soundEnabled?`, `onSoundToggle?`, `onSelect?`, `onStageChange?`, `onComplete?`, `onExit?` | 5화면 상태 관리 컨테이너. 내부에서 `correctOptionId`와 선택 `id`를 비교. 결과는 콜백으로 상위에 전달. |
| `GameTopBar` | `progress`, `total?`, `soundEnabled?`, `onBack`, `onSoundToggle?` | 진행칸 수·채움색을 값에 따라 렌더링. 뒤로가기 버튼과 음소거 상태 버튼 제공. |
| `GameProgressRail` | `progress`, `total?` | 독립 진행바. `progress=2, total=4`면 두 칸만 채워짐. |
| `GameRoundIconButton` | `icon`, `label`, `onClick`, `pressed?` | SVG 아이콘 변경/버튼 클릭 분리. |
| `GameLearningStep` | `number`, `label`, `color` | 개별 단계 번호/텍스트/배경 강조색 데이터로 제어. |
| `GameTextBox` | `text?`, `children?`, `tone?`, `className?` | **비어 있는 텍스트박스 틀**. `text`나 JSX `children`을 전달. 줄바꿈 `\n` 지원. |
| `GameIllustration` | `src`, `alt?`, `className?` | 교체 가능한 삽화 `<img>`. 그림 바꿀 때 `src`만 변경. |
| `GameActionButton` | `children`, `onClick`, `kind?`, `disabled?` | **라벨 없는 버튼 틀**. 색상·글자·클릭 처리 분리. `kind='primary'|'outline'`. |
| `GameOptionCard` | `option`, `imageUrl`, `selected?`, `disabled?`, `onClick(id)` | 그림과 문구 분리. 상태에 따라 선택 테두리. 각 선택의 정오 판단은 **부모 컴포넌트**에서 함. |
| `GamePrompt` | `avatarUrl`, `prompt`, `hint?` | 안내 강아지 이미지와 질문 문구를 따로 받음. |
| `GameOutcome` | `headline`, `illustrationUrl`, `illustrationAlt`, `body`, `buttonLabel`, `tone`, `onNext` | **정답/오답 공통 화면 틀**. 제목·본문·그림·버튼 문구를 매번 수정할 수 있음. `tone='success'|'retry'`. |
| `GameLearningSummary` | `summary`, `imageUrl(filename)`, `onNext` | **오늘의 배움 화면 틀**. 이미지 2개와 단계 배열을 받아 N개 카드 동적 생성. 번호/색도 데이터로 결정. |

각 컴포넌트의 스타일은 `.mg1-` 접두사가 붙어서 다른 화면 클래스와 충돌을 줄였습니다. 모든 선택 요소는 실제 `<button>`으로 구현되어 키보드 및 터치 조작이 가능합니다.

## 4. 예제 코드 (외부 프로젝트에서 재사용)

```tsx
import {useState} from 'react';
import {MiniGameOne, GameTextBox, GameActionButton} from './mini-game-1';
import type {MiniGameConfig} from './mini-game-1';
import base from './mini-game-1/default-config.json';

export function BehaviorEpisode(){
  const [soundEnabled,setSoundEnabled] = useState(true);
  const [earnedStars,setEarnedStars] = useState(0);
  const game = {
    ...base,
    intro:{...base.intro,text:'새 학급 상황을 설명하는 나만의 문구'},
    question:{...base.question, prompt:'하루는 어떤 행동을 하면 좋을까요?'},
    summary:{...base.summary,headline:'오늘 기억할 것'}
  } as MiniGameConfig;
  return <>
    <MiniGameOne
      config={game}
      assetBaseUrl="/assets/illustrations/mini_game_1"
      soundEnabled={soundEnabled}
      onSoundToggle={setSoundEnabled}
      onSelect={(option,correct)=>console.log(option.id,correct)}
      onComplete={({stars})=>setEarnedStars(stars)}
      onExit={()=>history.back()}
    />
    <div aria-live="polite">획득한 별: {earnedStars}</div>
  </>;
}

// 개별 디자인 요소는 전체 미니게임과 독립적으로도 사용 가능합니다.
<GameTextBox text={'자유롭게 바꾸는 안내문\n두 번째 줄'} />
<GameActionButton onClick={()=>alert('클릭')}>계속하기</GameActionButton>
```

**React 외부에서 삽화 경로를 변경하면** `config.question.guideAvatar`도 새 앱의 정적 에셋 경로로 함께 변경해야 합니다. React 예제의 `public/assets/`는 원본 `assets/`의 복사본입니다.

## 5. 실제 게임 흐름과 상태 전이

```text
intro (설명)
  다음 → question (선택)
  question -> correctOptionId 일치: success (긍정 피드백)
           -> 그 외: retry (다른 방법 생각하기) -> 다시 선택하기 -> question
  success -> 다음 -> summary (오늘의 배움)
  summary -> 다음 -> onComplete({episodeId, stars, correctOptionId})
```

`onComplete`가 실행될 때 실제 별 수를 서버·학습 기록에 저장하거나 부모 상태를 변경해야 합니다. **별을 채우는 그래픽 자체**는 기존 키트 `StarRating(value,max)`을 함께 사용하면 됩니다. `onComplete` 호출만으로 서버 저장이나 자동 로그인이 진행되지는 않습니다.

단계별 헤더 진행표시 기본값: `intro=1`, `question=2`, `success=3`, `retry=2`, `summary=4` / `totalSteps=4`. 단계 매핑은 `MiniGameOne.tsx`의 `progressFor()`에서 수정할 수 있습니다. 5화면은 4진행칸 중 **성공/재시도 분기 화면**을 공유하는 방식입니다.

## 6. 문구/정답 교체 방법

| 바꾸고 싶은 요소 | JSON 키 (React에서는 `config` prop) |
|---|---|
| 도입 본문 | `intro.text` |
| 도입 삽화 | `intro.scene` |
| 강아지 질문 | `question.prompt`, `question.hint`, `question.guideAvatar` |
| 3개 선택지 텍스트·삽화 | `question.options[*].label`, `.image` |
| 정답 | `question.correctOptionId` = 정확히 하나의 `question.options[*].id` |
| 정답 제목·설명 | `success.headline`, `success.text` |
| 오답 제목·설명 | `retry.headline`, `retry.text` |
| 배움 제목 및 항목 N개 | `summary.headline`, `summary.steps[*].label`, `.color` |
| 배움 그림 두 장 | `summary.leftImage`, `summary.rightImage` |
| CTA 버튼 라벨 | `intro.buttonLabel`, `success.buttonLabel`, `retry.buttonLabel`, `summary.buttonLabel` |
| 보상 별 수 | `rewards.stars` (기존 `StarRating` 최대 4개에 맞추려면 0~4 권장) |

아이콘 바꾸기: `assets/icons/sound-on.svg`, `sound-off.svg`, `arrow-left.svg`, `chevron-right.svg`, `lightbulb.svg`, `flow-arrow.svg`.
색상·둥근 모서리 바꾸기: `mini-game-one.css`의 `.mg1-...` 셀렉터 및 `--mg1-...` CSS 변수.

## 7. 통합·QA 체크리스트

- [ ] React 프로젝트의 `public/assets/`에 신규 삽화와 기존 아이콘/강아지 이미지가 존재
- [ ] 3개 옵션 선택 → 정답/오답 분기와 다시 선택하기 동작
- [ ] 정답 선택 후 오늘의 배움 → `onComplete` 호출 1회
- [ ] 부모 컴포넌트의 별점/잠금 상태 및 저장소 연결
- [ ] 실제 음성/화면 읽기 기능 필요 시 `onSoundToggle`에 TTS 연동
- [ ] 모바일 320–440px, 키보드, 긴 한국어 텍스트, 사용자 글자 크기 테스트
- [ ] 앱 실제 배포 전 삽화 화질 및 라이선스·접근성 확인

**범위 한계:** 원본 화면 기반 PNG 그림은 화질이 원본 크기 수준입니다. 디자인과 기능의 토대가 되는 코드이지 백엔드·TTS·학습 분석·로그인까지 완성된 배포용 앱은 아닙니다.
