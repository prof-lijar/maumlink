# 마음잇다 (Maum:Link) — 마음마을 탐험대

초등 2~3학년 느린학습자가 일상 속 사회적 상황에서 **어떻게 행동하고 말할지** 연습하는 사회정서교육 앱입니다. 아이는 탐험 지도에서 장소를 고르고, 짧은 이야기 속 상황을 보며 행동을 고르고, 친구와 대화하고, 좋은 행동을 정리합니다.

- 계정·서버·분석 없이 기기 안에서만 동작하는 오프라인 우선 웹앱(PWA)이며, 같은 빌드를 Android 앱으로도 묶습니다.
- 점수·시간 제한·별점이 없습니다. 실수에 수치심을 주지 않고, 쉬기·도움 요청·거절·위험할 때 바로 알리기를 좋은 행동으로 다룹니다.
- 그림은 모두 Codex CLI로 한 번 생성한 같은 그림체의 카툰 삽화(캐릭터 4명, 안내 강아지, 마을 지도, 장소 4곳, 이야기 15편 장면, 목록 그림 15장, 감정 얼굴 15장)이고, 문제와 보기는 한국어 음성으로 읽어 줍니다.
- **현재 상태:** 대표 이야기 4편(C01·C04·C05·D04)의 상황·감정·이유·행동·피드백·마무리 문구는 교육자 콘텐츠설계서(PDF) 원문을 그대로 옮겼고, 나머지 문구와 단계 구성은 교육자 검토 전 초안(`draft`)입니다. 출시 전에 교육자 검토와 아동 관찰이 필요합니다.

## 학습 흐름

```
시작 → 탐험가(캐릭터) 고르기 → 탐험 지도(장소 4곳) → 장소별 이야기 목록 → 이야기 → 마무리
```

이야기 안의 활동은 편마다 다릅니다. 기본 형태는 **상황 보기 → 행동 선택 → 좋은 행동 나누기**이고, 대표 이야기 5편은 감정·생각 탐색, 친구와 대화, 순서 맞추기, 마음–몸 신호 연결, 말하기 연습 같은 단계를 더 가집니다.

- 모든 이야기는 처음부터 열려 있고, 순서와 상관없이 할 수 있습니다.
- 모든 화면에 **이전으로**가 있고, 중간에 나가도 진행 상태가 저장되어 이어서 할 수 있습니다. 콘텐츠가 바뀌어 저장된 진행과 버전이 다르면 안내 없이 조용히 처음부터 시작합니다.
- 상황별 미션은 **건너뛰어도** 이야기를 마칠 수 있습니다.
- 화면에 들어가면 상황과 질문을, 보기를 누르면 그 보기를 한국어 음성으로 읽어 줍니다. 상단의 스피커 버튼으로 끌 수 있습니다.
- 마무리 화면은 모든 이야기가 같습니다: "잘했어요! 오늘도 새로운 방법을 배웠어요." + 이야기별 마무리 문장 + 다시 연습하기 / 다른 이야기 만나기 / 탐험 지도로 돌아가기.

## 장소와 이야기 (15편)

| 장소 | 주제 | 편수 |
| --- | --- | --- |
| 생활 정원 | 밖에서 친구와 놀기 | 2 |
| 우리 집 | 집에서 스스로 하기 | 3 |
| 학교 | 교실에서 지내기 | 6 |
| 도움 쉼터 | 쉬고 도움받기 | 4 |

| 장소 | ID | 이야기 | 활동 | 문구 출처 |
| --- | --- | --- | --- | --- |
| 생활 정원 | C01 | 친구들과 함께 놀고 싶어요 | 감정 고르기 → 이유 고르기 → 행동 선택 → 친구와 대화하기 → 확인 질문 | 관계 인식 설계서 원문 |
| 생활 정원 | C03 | 서로 다른 놀이를 하고 싶어요 | 행동 선택 → 친구와 대화하기 → 좋은 행동 나누기 | 초안 |
| 우리 집 | B01 | 내 가방을 챙겨요 | 행동 선택 → 좋은 행동 나누기 | 초안 |
| 우리 집 | A02 | 실수했어요 | 행동 선택 → 좋은 행동 나누기 | 초안 |
| 우리 집 | B03 | 다음 활동을 준비해요 | 행동 선택 → 좋은 행동 나누기 | 초안 |
| 학교 | A01 | 잘 모르겠어요 | 행동 선택 → 좋은 행동 나누기 | 초안 |
| 학교 | B02 | 나도 할 말이 있어요 | 생각 고르기 → 행동 선택 → 순서 맞추기 | 초안 |
| 학교 | C02 | 친구 물건을 쓰고 싶어요 | 행동 선택 → 친구와 대화하기 → 좋은 행동 나누기 | 초안 |
| 학교 | A03 | 하던 일이 잘 안돼요 | 행동 선택 → 좋은 행동 나누기 | 초안 |
| 학교 | C04 | 친구들이 내 발표를 놀렸어요 | 감정 고르기 → 몸의 반응 고르기 → 마음–몸 신호 연결 → 나를 도와주는 방법 | 자기 인식 설계서 원문 |
| 학교 | C05 | 나는 장난이었는데 친구는 속상해요 | 친구 마음 고르기 → 이유 고르기 → 행동 선택 → 친구와 대화하기 → 순서 맞추기 → 더 알아보기 | 관계 관리 설계서 원문 |
| 도움 쉼터 | D01 | 잠깐 쉬고 싶어요 | 행동 선택 → 좋은 행동 나누기 | 초안 |
| 도움 쉼터 | D02 | 그만해 주세요 | 행동 선택 → 친구와 대화하기 → 좋은 행동 나누기 | 초안 |
| 도움 쉼터 | D03 | 어디로 가야 할까요 | 행동 선택 → 좋은 행동 나누기 | 초안 |
| 도움 쉼터 | D04 | 친구가 자꾸 새치기해요 | 감정 고르기 → 이유 고르기 → 대처 고르기 → 말 고르기·도움 요청·말하기 연습 | 마음건강관리 설계서 원문 |

이야기 ID의 첫 글자(A~D)는 처음 기획한 주제 영역에서 온 것입니다. 장소를 옮긴 뒤에도 저장 기록을 지키려고 ID를 바꾸지 않았습니다. "설계서 원문"인 4편은 `content-source/reviewed/scenarios/*.json`(PDF 전사)의 문장을 그대로 쓰며, 원문 오탈자(연칠, 바과하는, 새채기 등)도 검토 기록대로 보존합니다. 각 편의 `review.source`에 출처를 적어 두었습니다.

## 활동 종류

| 활동 | 하는 일 | 판정 |
| --- | --- | --- |
| 행동 선택 | 보기 3~4개 중 할 행동을 고르고 "선택 확인하기" | 정답이 여러 개일 수 있음. 다른 보기는 결과를 설명하고 다시 고르게 함. 힌트·예시 제공 |
| 감정·생각 고르기 | 그때의 마음이나 이유를 고름. 감정 보기는 카툰 얼굴 카드로 보이고, "잘 모르겠어요"도 있음 | 정답 없음. 고른 보기의 설명 + 공통 마무리 |
| 좋은 행동 나누기 | 행동 카드 4장을 👍 이렇게 해요 / ✋ 안돼요 칸에 끌어 놓거나 눌러서 담기 | 다 담은 뒤 확인. 다시 볼 카드에 이유 표시. 힌트·예시·다시 해보기 |
| 친구와 대화하기 | 내 차례에 말 3개 중 하나를 고르면 친구가 "입력 중" 뒤에 답함 | 좋은 말은 칭찬과 함께 대화가 이어짐. 다른 말은 친구 반응 + 도움말 후 다시 말하기 |
| 순서 맞추기 | 행동 카드 3장을 할 순서대로 놓기(놓은 카드는 눌러서 빼기) | 허용 순서 여러 개 가능. 다른 순서면 배치 유지 + 힌트 |
| 마음–몸 신호 연결 | 감정 카드와 몸의 반응 카드를 선으로 연결 | 모든 연결을 인정하고 설명 |
| 말 고르기·말하기 연습 | 이어지는 두 상황에서 할 말 고르기 → 도움 요청 문장 듣기·따라 말하기 | 권장 표현 안내. 듣기 없이 읽기만으로도 완료 |

모든 활동은 터치·마우스·키보드로 할 수 있고, 드래그는 필수가 아닙니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 화면 | React 19, TypeScript, React Router 7 |
| 빌드 | Vite 8, Tailwind CSS 4, vite-plugin-pwa(오프라인 캐시) |
| 상태·저장 | Zustand 5(브라우저 localStorage에 저장), Zod 4(콘텐츠·저장 데이터 검증) |
| 앱 패키징 | Capacitor 8(Android) |
| 그림 | Codex CLI 이미지 생성(`pnpm art:generate`) + Sharp 최적화(`pnpm art:build`) |
| 음성 | 녹음 MP3(ElevenLabs 아동 목소리, 1.0 문구) + 브라우저 음성 합성 대체 |
| 품질 | Vitest + Testing Library, Playwright(시스템 Chrome) + axe-core(접근성), oxlint, Prettier |
| 글꼴 | Noto Sans KR, Jua(직접 호스팅, `pnpm fonts`로 필요한 글자만 생성) |

## 실행하기

Node 20 이상과 pnpm 10이 필요합니다.

```bash
pnpm install
pnpm dev                 # http://localhost:5173
pnpm build               # 콘텐츠 검사 → 타입 검사 → 웹 빌드(dist/)
pnpm preview             # 빌드 결과 미리보기 http://localhost:4173
```

### 검사

```bash
pnpm validate            # 콘텐츠(15편 + UI 문구) 스키마·참조 검사
pnpm typecheck
pnpm test                # 단위 검사
pnpm lint                # oxlint + prettier
pnpm test:e2e            # 현재 흐름 브라우저 검사(tests/behavior, 시스템 Chrome; 처음에는 pnpm test:e2e:install)
```

### Android

```bash
pnpm build:native        # 네이티브용 웹 빌드 + cap sync android
pnpm android:apk         # 디버그 APK (JDK 21 필요, 예: Android Studio 내장 JBR)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

appId(`com.maumlink.app`)와 앱 이름은 임시값입니다. Android WebView에는 브라우저 음성 합성이 없어서, 녹음이 없는 문장은 글자만 보여 줍니다.

## 폴더 구조

```
content/
  episode-index.json     장소 4곳, 이야기 15편의 목록·요약·태그
  episodes/<ID>.json     이야기별 내용(상황, 보기, 피드백, 카드, 대화, 안전 약속), 버전 관리
  ui.json                설정 화면 등 공통 UI 문구
content-source/
  reviewed/              교육자 콘텐츠설계서 PDF 전사(시나리오 4편, 감정 15개) — 원문 보존용
  art/manifest.json      그림 생성 목록·프롬프트 (refs/ 참고 그림, raw/ 원본 PNG는 커밋하지 않음)
  narration/             음성 문구 목록과 생성 기록
src/
  content/               콘텐츠 스키마(Zod)와 로더 — 기본형(behaviorSchema)·단계형(stepSchema)·대화(conversation)
  engine/                활동 진행 로직과 저장 복구 — behaviorGame, stepGame, conversation
  screens/               시작(StartGate), 탐험가 고르기(AvatarSelect), 지도(Home), 목록(DomainEpisodes),
                         기본형 게임(BehaviorGame), 단계형 게임(StepEpisodeGame), 어른 설정(SettingsSheet)
  screens/missions/      재사용 미션 — Conversation, SequenceOrder, EmotionBodyMatch, ExpressionChoice
  services/              완료 기록(mvpProgress), 프로필, 설정, 음성(speech, 녹음 매핑)
  design/                공통 스타일(life-garden.css, main-flow.css), 그림 경로(devkitAssets.ts)
public/img/v3/           생성된 그림(WebP), public/audio/ 녹음 음성, public/fonts/ 글꼴
scripts/                 콘텐츠 검증, 그림 생성·최적화, 음성 목록·가져오기, 글꼴 생성
tests/unit/              단위 검사      tests/behavior/   현재 흐름 브라우저 검사
android/                 Capacitor Android 프로젝트
docs/                    SPEC(요구), PLAN(작업·검증 기록), DECISIONS(결정 이력), CONTENT_REVIEW(원문 반영 기록)
```

## 콘텐츠 고치기

문구와 보기는 화면 코드가 아니라 `content/`의 JSON에 있습니다.

1. `content/episodes/<ID>.json`을 고치고, 내용이 바뀌면 `version`을 1 올립니다. 예전 버전으로 하다 만 진행은 조용히 처음부터 시작합니다.
2. 목록에 보이는 제목·요약은 `content/episode-index.json`도 함께 고칩니다.
3. `pnpm validate`로 검사합니다.
4. 제목용 글꼴(Jua)은 쓰인 글자만 담고 있으므로, 새 글자가 들어가면 `pnpm fonts`로 다시 만듭니다.
5. 새 문구의 음성은 `pnpm narration:inventory`로 목록을 갱신한 뒤 녹음 파일을 만들어 `pnpm narration:import`로 넣습니다(아래 참고). 녹음이 없으면 브라우저 음성 합성으로 읽습니다.

이야기는 두 형식이 있습니다.
- **기본형:** `choice` + `sorting` + 선택 `conversation`
- **단계형(`"format": "steps"`):** `steps` 배열에 `reflect`, `choice`, `conversation`, `sequence`, `emotion_body_match`, `expression_choice`, `note` 등을 순서대로 둡니다. `reflect` 보기에 `emotionId`를 주면 감정 얼굴 카드가 보입니다.

대표 4편(C01·C04·C05·D04)의 원문 문장은 `docs/CONTENT_REVIEW.md`의 규칙대로 바꾸지 않습니다. 원문을 바꾸려면 설계서 작성자 검토가 먼저입니다.

## 그림 만들기

모든 삽화는 `content-source/art/manifest.json`에 적힌 프롬프트로 Codex CLI(`codex exec`, 내장 이미지 생성 도구)가 한 번 생성한 것입니다. 참고 그림(`refs/characters-ref.png`)을 함께 보내 캐릭터와 그림체를 맞춥니다. 앱은 실행 중에 어떤 그림도 외부에서 받지 않습니다.

```bash
pnpm art:generate --only scene-A01 --force   # 특정 그림 다시 생성 (raw/<id>.png)
pnpm art:build                                # raw/ → public/img/v3 (400/800 px 스프라이트, 800/1600 px 장면)
```

그림을 추가하려면 manifest에 항목을 넣고 두 명령을 실행한 뒤 `src/design/devkitAssets.ts`에 경로를 연결합니다.

## 음성

녹음 음성은 `src/services/narration/<voice>.json`이 문장과 MP3를 짝지어 두며, 기본 목소리는 ElevenLabs 아동 목소리 `lulu-lolipop`입니다(`public/audio/ko-lulu/`). 녹음된 문장은 녹음을, 나머지는 브라우저 음성 합성을 씁니다. 앱은 실행 중에 음성 서비스를 호출하지 않습니다.

새 문장을 녹음하려면 `pnpm narration:inventory`로 `content-source/narration/inventory.json`을 갱신하고, 빠진 문장을 음성 서비스 웹에서 그대로 생성해 `<clip id>.mp3`로 저장한 뒤 `pnpm narration:import <폴더> --voice lulu-lolipop`을 실행합니다. 자세한 방법은 [docs/README-v1.md](./docs/README-v1.md)에 있습니다.

## 저장과 개인정보

이름이나 개인정보를 받지 않습니다. 탐험가 선택, 설정, 완료 기록, 하다 만 진행은 그 기기의 브라우저 저장소에만 남습니다.

| 저장 내용 | 키 |
| --- | --- |
| 완료 기록 | `maumlink.progress.mvp-v2` |
| 탐험가 | `maumlink.profile.mvp-v1` (이전 색 이름 `sun/sky/leaf/peach`는 `haru/sora/mina/jun`으로 읽음) |
| 설정 | `maumlink.settings.v1` |
| 이야기별 진행 | `maumlink.session.mvp-v1.<ID>`, `maumlink.steps.mvp-v1.<ID>` |

## 문서

- [docs/SPEC.md](./docs/SPEC.md): 확정 요구와 작업 기본값
- [docs/PLAN.md](./docs/PLAN.md): 작업 단계와 실제 검증 기록
- [docs/DECISIONS.md](./docs/DECISIONS.md): 결정과 이유
- [docs/CONTENT_REVIEW.md](./docs/CONTENT_REVIEW.md): 설계서 원문 반영 규칙과 오탈자 보존 기록
- [AGENTS.md](./AGENTS.md): 이 저장소에서 작업할 때의 규칙
- [docs/README-v1.md](./docs/README-v1.md): 이전 감정 중심 1.0 버전 README(녹음 음성 제작 방법 포함)

## 할 일 (TODO)

- [x] **이미지 생성:** 15편 장면, 목록 그림 15장, 장소 4곳, B02 활동 그림, 선생님 그림을 같은 그림체로 생성해 연결했습니다.
- [x] **"활동을 이어갈 수 없어요" 화면 제거:** 버전이 다르거나 손상된 진행은 조용히 처음부터 시작합니다.
- [x] **음성 읽어주기:** 화면 진입 시 상황·질문, 보기 선택 시 보기를 읽어 줍니다. 녹음이 없는 새 문장은 브라우저 음성 합성을 씁니다.
- [x] **예전 코드 정리:** 감정 중심 1.0 화면·엔진·검사·스크립트를 제거했고 `pnpm lint`가 통과합니다. 설계서 전사는 `content-source/reviewed/`에 보존합니다.
- [x] **어른 설정 진입:** 지도 홈 오른쪽 위의 설정 버튼으로 엽니다(탐험가 바꾸기, 글자 크기, 소리, 음성).
- [ ] **교육자 검토:** 대표 4편의 원문 외 문구(단계 구성, 친구 대답, 11편 초안)는 `review.state: "draft"`입니다. 검토 결과를 `content/episodes/*.json`에 반영하고 `version`과 `review.state`를 갱신합니다.
- [ ] **새 문장 녹음:** `pnpm narration:inventory` 목록의 미녹음 문장을 아동 목소리로 생성해 가져옵니다. Android WebView는 녹음 없이는 음성이 나오지 않습니다.
- [ ] 그림 사용권 확인, 실제 기기에서 스크린리더·오프라인·태블릿 검증, 아동 관찰
