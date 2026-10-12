# 마음잇다 (Maum:Link) — 마음마을 탐험대

초등 2~3학년 느린학습자가 일상 속 사회적 상황에서 **어떻게 행동하고 말할지** 연습하는 사회정서교육 앱입니다. 아이는 탐험 지도에서 장소를 고르고, 짧은 이야기 속 상황을 보며 행동을 고르고, 친구와 대화하고, 좋은 행동을 정리합니다.

- 계정·서버·분석 없이 기기 안에서만 동작하는 오프라인 우선 웹앱(PWA)이며, 같은 빌드를 Android 앱으로도 묶습니다.
- 점수·시간 제한·별점이 없습니다. 실수에 수치심을 주지 않고, 쉬기·도움 요청·거절·위험할 때 바로 알리기를 좋은 행동으로 다룹니다.
- 내용은 교육자 콘텐츠설계서 5편(자기 인식·관계 인식·관계 관리·마음건강관리·자기관리)뿐이며, 상황·감정·이유·행동·피드백·마무리 문구를 원문 그대로 씁니다. 화면 구성과 미션 흐름은 `paintedblue/Maumlink2`의 설계를 참고했습니다.
- 그림은 모두 Codex CLI로 한 번 생성한 같은 그림체의 카툰 삽화(캐릭터 4명, 안내 강아지, 마을 지도, 영역 장소 5곳, 이야기 장면 6장, 목록 그림 5장, 감정 얼굴 17장)이고, 문제와 보기는 한국어 음성으로 읽어 줍니다.
- **현재 상태:** 원문 문장은 검토된 것이지만, 단계 구성·"잘 모르겠어요" 보기·친구 대답·안전 약속 같은 추가 문구는 교육자 검토 전 초안(`draft`)입니다. 출시 전에 교육자 검토와 아동 관찰이 필요합니다.

## 학습 흐름

```
시작 → 탐험가(캐릭터) 고르기 → 탐험 지도(영역 5곳) → 영역의 이야기 → 마무리
```

이야기 안의 활동은 편마다 다릅니다. 공통 뼈대는 설계서의 **상황 보기 → 감정 알아보기 → 왜 그런 기분이 들까요? → 어떻게 하면 좋을까요?**이고, 편에 따라 친구와 대화, 순서 맞추기, 마음–몸 신호 연결, 말하기 연습 미션이 붙습니다.

- 모든 이야기는 처음부터 열려 있고, 순서와 상관없이 할 수 있습니다.
- 모든 화면에 **이전으로**가 있고, 중간에 나가도 진행 상태가 저장되어 이어서 할 수 있습니다. 콘텐츠가 바뀌어 저장된 진행과 버전이 다르면 안내 없이 조용히 처음부터 시작합니다.
- 목록에서 하던 중인 이야기를 누르면 **이어서 할까요?**(이어서 하기 / 처음부터 다시 하기), 완료한 이야기를 누르면 **다시 해볼까요?**(처음부터 다시 하기 / 아니요)를 먼저 묻습니다.
- 상황별 미션은 **건너뛰어도** 이야기를 마칠 수 있습니다.
- 화면에 들어가면 상황과 질문을, 보기를 누르면 그 보기를 한국어 음성으로 읽어 줍니다. 상단의 스피커 버튼으로 끌 수 있습니다.
- 마무리 화면은 모든 이야기가 같습니다: "잘했어요! 오늘도 새로운 방법을 배웠어요." + 이야기별 마무리 문장 + 다시 연습하기 / 다른 이야기 만나기 / 탐험 지도로 돌아가기. 이야기 중에 말로 이야기한 적이 있으면, 아이가 한 말을 떠올리는 두 문장을 AI가 써서 설계서 마무리 문장 앞에 붙이고 같은 목소리로 읽어 줍니다(「오늘 내가 한 말」). 말한 적이 없으면 설계서 문장만 보입니다. 만든 문장은 그 이야기의 저장 상태에 남아 다시 열어도 새로 만들지 않습니다.

## 영역과 이야기 (5편)

| 영역(지도 장소) | ID | 이야기 | 활동 | 문구 출처 |
| --- | --- | --- | --- | --- |
| 자기 인식 (발표 교실) | A01 | 친구들이 내 발표 실수를 듣고 놀린다 | 감정 고르기 → 몸의 반응 고르기 → 마음–몸 신호 연결 → 나를 도와주는 방법 | 자기 인식 설계서(홍은비) |
| 관계 인식 (운동장) | B01 | 친구들과 함께 놀고 싶어요 | 감정 고르기 → 이유 고르기 → 행동 선택 → 친구와 대화하기 → 확인 질문 | 관계 인식 설계서(양수정) |
| 관계 관리 (쉬는 시간 교실) | C01 | 나는 장난이었는데, 친구는 속상해요 | 친구 마음 고르기 → 이유 고르기 → 행동 선택 → 친구와 대화하기 → 순서 맞추기 → 더 알아보기 | 관계 관리 설계서(박수빈) |
| 마음건강관리 (급식실) | D01 | 내 차례인데 친구가 새치기를 했어요. | 감정 고르기 → 이유 고르기 → 대처 고르기 → 말 고르기·도움 요청·말하기 연습 | 마음건강관리 설계서(김시은) |
| 자기관리 (수업 교실) | E01 | 선생님 설명 중 하고 싶은 말이 떠올랐어요 | 두 컷 상황 → 감정 고르기 → 이유 고르기 → 마음과 행동 알아보기(A~D 설명) → 나도 해볼 수 있어요 | 자기관리 설계서(국지우, `docs/content-design/ko/05_자기관리_국지우.md`) |

문장은 `content-source/reviewed/scenarios/*.json`(PDF 전사)과 자기관리 설계서 전사(md)를 그대로 쓰며, 원문 오탈자(연칠, 바과하는, 새채기 등)도 검토 기록대로 보존합니다. 각 편의 `review.source`에 출처를, `docs/CONTENT_REVIEW.md`에 어떤 문장이 원문이고 어떤 요소가 추가 구성인지 적어 두었습니다.

## 활동 종류

| 활동 | 하는 일 | 판정 |
| --- | --- | --- |
| 행동 선택 | 설계서의 보기 4개 중 할 행동을 고르고 "선택 확인하기" | 원문이 권장하는 보기는 여러 개일 수 있음. 다시 생각해 보게 하는 보기는 원문 피드백을 보여 주고 다시 고르게 함. 확인한 뒤에도 다른 보기를 누르면 바꿀 수 있고, 다시 확인하면 됨 |
| 감정·생각 고르기 | 그때의 마음이나 이유를 고름. 감정 보기는 카툰 얼굴 카드로 보이고, "잘 모르겠어요"도 있음 | 정답 없음. 고른 보기의 설명 + 공통 마무리 |
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
pnpm validate            # 콘텐츠(5편 + UI 문구) 스키마·참조 검사
pnpm typecheck
pnpm test                # 단위 검사
pnpm lint                # oxlint + prettier
pnpm test:e2e            # 현재 흐름 브라우저 검사(tests/behavior, 시스템 Chrome; 처음에는 pnpm test:e2e:install)
```

### Android

```bash
pnpm build:native        # 네이티브용 웹 빌드 + cap sync android
pnpm android:apk         # 디버그 APK (JDK 21 필요. Android Studio가 없으면 JAVA_HOME을 JDK 21로, ANDROID_HOME을 SDK로 지정)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

appId(`com.maumlink.app`)와 앱 이름은 임시값입니다. Android WebView에는 브라우저 음성 합성이 없어서, 녹음이 없는 문장은 글자만 보여 줍니다.

## 폴더 구조

```
content/
  episode-index.json     영역 5곳, 이야기 5편의 목록·요약·태그
  episodes/<ID>.json     이야기별 내용(상황, 보기, 피드백, 카드, 대화, 안전 약속), 버전 관리
  ui.json                설정 화면 등 공통 UI 문구
content-source/
  reviewed/              교육자 콘텐츠설계서 PDF 전사(시나리오 4편, 감정 15개) — 원문 보존용
  art/manifest.json      그림 생성 목록·프롬프트 (refs/ 참고 그림, raw/ 원본 PNG는 커밋하지 않음)
  narration/             음성 문구 목록과 생성 기록
src/
  content/               콘텐츠 스키마(Zod)와 로더 — 단계형(stepSchema)·대화(conversation)·목록(episodeIndex)
  engine/                활동 진행 로직과 저장 복구 — stepGame, conversation
  screens/               시작(StartGate), 탐험가 고르기(AvatarSelect), 지도(Home), 영역 목록(DomainEpisodes),
                         이야기(EpisodePlay → StepEpisodeGame), 어른 설정(SettingsSheet)
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

이야기는 단계형(`"format": "steps"`) 하나의 형식입니다. `steps` 배열에 `reflect`, `choice`, `conversation`, `sequence`, `emotion_body_match`, `expression_choice`, `note`를 순서대로 둡니다. `reflect` 보기에 `emotionId`를 주면 감정 얼굴 카드가 보이고, `situation.bubbles`는 장면 위 말풍선, `situation.panels`는 장면 컷 수(그림 `scene-<ID>-…`)입니다.

원문 문장은 `docs/CONTENT_REVIEW.md`의 규칙대로 바꾸지 않습니다. 원문을 바꾸려면 설계서 작성자 검토가 먼저입니다. 새 이야기를 더하려면 설계서가 먼저 있어야 하고, 그다음 `content/episodes/`와 `episode-index.json`, 검증기의 편수(`scripts/validate-behavior-content.ts`)를 함께 늘립니다.

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

## 말로 이야기하기 (선택 기능)

아이가 보기를 고르는 대신 **마이크로 말해 볼 수 있는** 선택 기능입니다. 기본으로 켜져 있어 감정·이유·행동 고르기 화면마다 「말로 이야기해 볼래요」 버튼이 보이며, 어른 설정(톱니 버튼)의 **말로 이야기하기**에서 끌 수 있습니다. 말하기는 언제나 선택이며, 말한 내용이 들리면 그 화면의 답으로 인정되고, 대답을 들려준 뒤 잠깐 쉬었다가(음성이 꺼져 있으면 읽을 시간을 두고) 다음 화면으로 넘어갑니다. 새 화면의 마이크는 접힌 처음 상태로 시작합니다.

```
마이크 녹음(16 kHz WAV) → Gemini 3.5 Transcribe(글로 바꾸기, ko-KR) → Google AI(Gemini) 짧은 대답 → ElevenLabs TTS(녹음 음성과 같은 목소리·모델)로 읽기
```

- 키는 서버에만 있습니다. 브라우저는 같은 출처의 `/api/voice/*`만 부르고, 서버는 녹음이나 글을 저장하지 않습니다.
- 서버 코드는 `server/voice/`(제공자 호출 + 라우터)이고, Vercel 함수 `api/voice/[action].ts`와 Vite 개발 서버 미들웨어(`scripts/voice-dev-server.ts`)가 같은 라우터를 씁니다. 엔드포인트: `health`, `transcribe`, `respond`, `speak`, `turn`(한 번에 처리).
- 화면 쪽은 `src/voice/`에 재사용 부품으로 있습니다: `VoiceTalk`(버튼 + 패널), `useVoiceTurn`(녹음 → 전송 → 재생 상태), `useVoiceAvailable`(설정 + 서버 상태), `recorder.ts`/`wav.ts`(PCM 녹음), `voiceApi.ts`(호출).
- 글로 바꾸기는 Google의 `gemini-3.5-transcribe`(Interactions API, 녹음 파일용)를 씁니다. 키는 `GOOGLE_STT_API_KEY`(비우면 `GOOGLE_AI_API_KEY` 재사용), 모델은 `GOOGLE_STT_MODEL`입니다. 실시간 `gemini-3.5-transcribe-live`는 WebSocket 스트리밍이라 말하는 동안 글자를 띄우려면 별도 작업이 필요합니다. `VOICE_STT_PROVIDER=elevenlabs`로 ElevenLabs Scribe와 비교할 수 있습니다(무보존 `ELEVENLABS_ZERO_RETENTION=1`은 엔터프라이즈·체험 플랜 전용). 읽기가 실패하면 대답 글은 그대로 보이고 브라우저 음성이 읽습니다. 인터넷이 없거나 서버에 키가 없으면 버튼은 보이되 아이에게 "지금은 대답을 들을 수 없어요"라고 알리고, 보기 고르기는 그대로 됩니다.
- 사용할 키: `.env.dev.example`을 `.env.dev`로 복사해 채웁니다(`pnpm dev`·`pnpm preview`가 읽음). Vercel에서는 같은 이름을 프로젝트 환경 변수로 넣습니다. Android 빌드는 `.env.native`에 `VITE_VOICE_API_BASE=https://<배포 주소>/api/voice`를 둡니다.
- 대답 규칙(초3 느린학습자, 두 문장 이내, 감정 수용, 개인정보 질문 금지, 위험 신호 시 어른에게 알리기)은 `server/voice/providers.ts`의 `SYSTEM_PROMPT`에 있고, 아이에게 보이는 문구는 `src/voice/copy.ts`에 있습니다(교육자 검토 전 초안).

## 저장과 개인정보

이름이나 개인정보를 받지 않습니다. 탐험가 선택, 설정, 완료 기록, 하다 만 진행은 그 기기의 브라우저 저장소에만 남습니다.

**말로 이야기하기**를 켠 경우에만 아이가 마이크로 말한 소리가 Google AI(글로 바꾸기·짧은 대답)로, 대답 글이 ElevenLabs(읽어 주기)로 전송됩니다. 전송은 그 순간뿐이며 서버·기기에 녹음과 대화를 남기지 않습니다. 이 기능은 기본으로 켜져 있고 어른 설정에서 끌 수 있습니다.

| 저장 내용 | 키 |
| --- | --- |
| 완료 기록 | `maumlink.progress.mvp-v2` (이야기 ID A01·B01·C01·D01·E01) |
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

- [x] **이미지 생성:** 이야기 장면(자기관리는 두 컷), 목록 그림, 영역 장소 5곳(발표 교실·운동장·쉬는 시간 교실·급식실·수업 교실), 감정 얼굴(아쉬워요·괜찮아요 추가), 선생님 그림을 같은 그림체로 생성해 연결했습니다.
- [x] **"활동을 이어갈 수 없어요" 화면 제거:** 버전이 다르거나 손상된 진행은 조용히 처음부터 시작합니다.
- [x] **음성 읽어주기:** 화면 진입 시 상황·질문, 보기 선택 시 보기를 읽어 줍니다. 녹음이 없는 새 문장은 브라우저 음성 합성을 씁니다.
- [x] **예전 코드 정리:** 감정 중심 1.0 화면·엔진·검사·스크립트를 제거했고 `pnpm lint`가 통과합니다. 설계서 전사는 `content-source/reviewed/`에 보존합니다.
- [x] **어른 설정 진입:** 지도 홈 오른쪽 위의 설정 버튼으로 엽니다(탐험가 바꾸기, 글자 크기, 소리, 음성).
- [ ] **교육자 검토:** 원문 외 문구(단계 구성, "잘 모르겠어요", 친구 대답, 안전 약속)는 `review.state: "draft"`입니다. 검토 결과를 `content/episodes/*.json`에 반영하고 `version`과 `review.state`를 갱신합니다.
- [ ] **새 문장 녹음:** `pnpm narration:inventory` 목록의 미녹음 문장을 아동 목소리로 생성해 가져옵니다. Android WebView는 녹음 없이는 음성이 나오지 않습니다.
- [ ] 그림 사용권 확인, 실제 기기에서 스크린리더·오프라인·태블릿 검증, 아동 관찰
- [ ] **말로 이야기하기:** `.env.dev`/Vercel에 키를 넣고 실제 키로 Scribe·Gemini·ElevenLabs TTS 응답을 확인합니다(ElevenLabs 무료 플랜은 라이브러리 목소리 API 사용이 막힐 수 있음). `src/voice/copy.ts`의 문구와 `SYSTEM_PROMPT`를 교육자가 검토합니다.
