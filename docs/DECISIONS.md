# 현재 제품 결정과 기존 구현 이력

이 파일의 **2026-10-09 결정**은 현재 행동 중심 MVP의 작업 기준이다. 아래 `기존 결정 이력`은 이전 감정 중심 버전의 맥락을 보존한다. 두 내용이 상충하면 현재 결정과 [SPEC.md](./SPEC.md)를 따른다. `확정 요구`와 `작업 기본값`을 구분해 기록한다.

## 2026-10-09 — 행동 중심 MVP 전환

| ID | 결정 | 구분 | 이유와 영향 |
| --- | --- | --- | --- |
| D-NEW-01 | 학습 목표를 `상황에서 어떻게 행동하는가`로 바꾸고 감정 알아차리기·감정 선택 활동을 새 경로에서 제외 | 확정 요구 | 사용자의 최신 지시. 기존 `feeling`, `step3` 화면/스키마/콘텐츠의 학습 규칙을 대체한다. 기존 이력은 보존한다. |
| D-NEW-02 | 미니게임은 `행동 선택하기`와 `행동/대화 순서 맞추기` 두 종류 | 확정 요구 | 범위를 좁혀 반복 가능한 학습을 제공한다. 옛 감정 카드·몸 반응·이유 비교는 최종 게임이 아니다. |
| D-NEW-03 | 자기관리 B02에서 `말이 생기면 잠깐 멈추기 → 차례 기다리기 → 내 차례에 말하기`를 필수로 다룸 | 확정 요구 | 사용자가 특정 행동 목표를 명시했다. 다침·위험·긴급 도움은 기다리지 않고 바로 알린다. 눈맞춤/자세 강요는 채점하지 않는다. |
| D-NEW-04 | 4영역×3편 총 12편을 MVP로 작성하고 B02부터 종단 개발 | 4영역·12편은 확정, 세부 편성과 순서는 작업 기본값 | 첫 편에서 엔진·저장·피드백을 검증한 뒤 콘텐츠를 확장한다. 영역/원고는 교육 검토에 따라 조정 가능하다. |
| D-NEW-05 | 현재 React/TypeScript/Vite PWA와 가능한 UI·오프라인 자산을 재사용 | 작업 기본값 | 기존 저장소에 기능/테스트가 있다. 새 앱을 중복 구축하지 않는다. 현행 코드 실행 상태는 PLAN 1-1에서 검증한다. |
| D-NEW-06 | 새 완료는 `mvp-v1`의 고유 완료 편 ID 수 / 12, 반올림 정수% | 작업 기본값 | 점수·실패 횟수보다 학습 진행을 명료하게 보여 준다. 두 활동 해결+완료 화면에서 한 번 기록한다. 옛 `maumlink.progress.v1`과 키를 분리하고 근거 없는 자동 이관은 하지 않는다. |
| D-NEW-07 | 모든 편을 처음부터 열고 완료는 중립적 `완료`로 표시 | 작업 기본값 | 첨부 그림의 별·잠금·재화가 경쟁/차단으로 읽힐 수 있다. 지도와 목록의 정보 구조만 참고한다. |
| D-NEW-08 | 첨부한 2장의 동화책풍 UI를 시각 기준으로 사용하되 감정 선택 부분은 폐기 | 사용자가 UI 방향을 지시; 구체 수치/배치는 작업 기본값 | 지도, 큰 카드, 밝은 색, 음성 버튼, 단계 표시를 반영한다. 그림 안의 가상 텍스트·달성률·별 수는 구현 데이터가 아니다. |
| D-NEW-09 | 사용자의 안전한 다른 답, 도움 요청, 쉬기, 거절, 긴급 예외를 수용하도록 문항·피드백을 설계 | 작업 기본값, 아동 안전 원칙 | 단일 답 강요와 수치심을 줄인다. 특히 D02에서 말로 거절하지 않고 먼저 안전한 곳으로 피하는 선택을 오답으로 만들지 않는다. |
| D-NEW-10 | 익명 로컬 프로필, 외부 분석/계정 없이 시작; 기존 녹음은 새 문구·사용권 확인 후 재사용 | 작업 기본값 | 불필요한 아동 데이터 수집을 줄이고 오프라인 특성을 유지한다. 음성 재제작 또는 라이선스 결정은 6-2에서 기록한다. |

## 이번 전환에서 대체되는 기존 규칙

- 기존 README/PRD의 `상황→감정→생각→행동→피드백`, 4개 시나리오, 감정 선택/몸 반응/비교/멀티선택은 새 학습 흐름과 콘텐츠 수를 결정하지 않는다.
- 기존 `Feeling.tsx`, `Step3.tsx`, `EmotionTile.tsx`, 감정 JSON과 관련 검사는 이전 버전 자료다. 새 구현에서 도달 불가능하게 하고, 삭제 여부는 회귀/자산 검토 후 결정한다.
- 과거의 그림/표현/글자 크기/녹음 보존 결정은 새 콘텐츠 정확성, 접근성, 사용권 확인보다 우선하지 않는다. 구체 토큰과 최종 문구는 6단계에서 검증해 갱신한다.
- 과거 `validate:final-content`의 PDF 전사 통과는 과거 4편에만 해당한다. 새 12편에는 새 원고 검토와 검증기가 필요하다.
- 아래 기록에서 사용자 요청이라고 서술한 것은 해당 시점의 요청이다. 최신 행동 중심 변경으로 관련 범위가 대체되었다.

## 아직 결정을 기록해야 할 항목

실제 목표 기기/화면 크기 우선순위, 새 12편 원고 최종 승인자와 검토 절차, 새 음성 녹음의 사용권/목소리, 어른 설정 진입 방식, 저장 장애 시 사용자 문구, 실제 배포 환경과 아동 대상 관찰 방법. 개발을 막지 않는 부분은 `SPEC.md`의 작업 기본값으로 진행하고, 확정되면 이 표 아래에 날짜·선택지·이유·영향을 추가한다.

---

## 2026-10-09 — 메인 사용자 흐름 F1 구현

- 기존 React/Vite 앱에서 `시작→익명 아바타→지도→영역별 목록→상황 도입`을 새 라우트로 연결했다. 과거 `lesson/:scenarioId` 라우트는 앱에서 제거했으며 과거 파일·진도 데이터는 보존한다. 직접 입력한 옛 주소는 지도로 돌아간다.
- `content/episode-index.json`은 `mvp-v1`의 4영역×3편 탐색용 데이터다. 여기의 상황·목표·안전 메모는 새 명세의 작업 원고다. 학습 활동의 정답·피드백 계약은 1-3에서 만든다.
- 캐릭터는 실명 입력 없이 4개 아바타 중 하나를 로컬에 저장한다. 새 완료 수는 별도 `maumlink.progress.mvp-v1`에서 읽고 12편 기준으로 계산한다. 이전 4편 기록은 자동 이관하지 않는다.
- 첨부 시안의 지도·큰 카드·색감·음성 버튼·진도 배치를 화면 구조에 반영했다. 이 단계의 장소/상황 그림은 맞는 의미의 간단한 상징 그림이다. 정식 삽화와 캐릭터 표현은 6-1에서 교체·검토한다. 화면의 아동용 문구에서 개발 단계 설명을 제외했다.
- 기존 `storybook.test.tsx`의 옛 홈 진입 기대는 새 라우트와 충돌하므로, 과거 학습 엔진만 직접 확인하도록 조정했다. 새 사용자 흐름은 별도 `main-flow.test.tsx`로 검사한다. 과거 E2E/시각 스냅샷은 새 흐름 검증으로 해석하지 않는다.
- 이 환경의 pnpm 명령은 설치 후 빌드 스크립트 정책 오류(`ERR_PNPM_IGNORED_BUILDS`)가 났다. 설치된 실행 파일로 타입·단위 검사·빌드를 통과했고, 로컬 Chrome에서 두 뷰포트를 확인했다. 의존성 정책은 앱 구현과 별도로 정리할 사항이다.

## 2026-10-09 — B02 행동 활동과 제공 컴포넌트 적용

- `src/design/`의 실제 재사용 코드를 확인해 `ChoiceCard`, `Card`, `SpeechBubble`, `VoiceToggle`을 B02에 적용했다. 사용자 제공 `COMPONENT_GUIDE.md`와 `component/ASSET_CATALOG.md`의 `assets/`·`react-example/` 경로에는 현재 실제 파일이 없으므로, 존재하지 않는 이미지 자산은 끼워 넣지 않았다. `ProgressLink`는 감정 단계에 묶여 있어 새 행동 흐름에는 별도 단순 단계 표시를 쓴다.
- B02 데이터는 `content/episodes/B02.json`의 버전 1, 검토 상태 `draft`인 작업 원고다. 선택 정답과 예시 답, 순서의 카드 전체 사용·순열을 스키마로 검사한다. 급한 도움·위험 상황은 차례 기다리기 예외로 화면에 명시한다. 교육자/아동 관찰 검토 전 원고 승인을 주장하지 않는다.
- 선택은 카드를 누른 뒤 명시적으로 확인한다. 틀린 선택은 비난 없이 이유·힌트를 보여 주고 다시 고를 수 있다. 두 번 틀리거나 아이가 원하면 예시를 본 뒤 이어갈 수 있다. 순서는 드래그 대신 버튼 탭으로 놓고, 놓은 카드를 눌러 뺀다. 오답도 배치를 보존한다. 두 활동을 직접 해결하거나 예시로 마쳐야 완료된다.
- 중단 상태는 `maumlink.session.mvp-v1.B02` 등 편별 키에 편 ID·콘텐츠 버전과 함께 저장한다. 이전 B02 단일 키는 읽기 호환한다. 버전이 바뀌거나 데이터가 손상되면 조용히 채점하지 않고 다시 시작하도록 설명한다. `maumlink.progress.mvp-v1`의 완료 ID는 고유하게 유지하며, 재학습해도 달성률은 늘지 않는다. 저장 실패는 화면에 알린다.
- 기존 별·잠금·감정 카드·가상의 수치·재화는 새 활동에 쓰지 않았다. 아동 화면은 실제 `완료 편 수/12`와 반올림한 비율만 보여 준다. 새 B02의 음성은 기존 `VoiceToggle`과 텍스트 읽기 버튼을 사용하며, 새 원고용 녹음·자동 읽기 정책은 6-2에서 검토한다.

## 2026-10-09 — 12편 기능 연결과 미리보기 범위 정정

- A01 등 11편이 도입 화면의 `다른 이야기 보기`로 끝나던 상태를 확인했다. 이것은 12편을 둘러볼 수 있다는 안내와 맞지 않았다. `SPEC.md` 5.1의 선택 보기·허용 답·피드백·순서 예시·안전 메모를 각 편의 버전 1 작업 원고로 옮겨 12편 모두 같은 두 활동을 실행한다. 새 문구는 모두 `draft`이며 교육자 승인이나 아동 대상 효과를 뜻하지 않는다.
- 세션 저장은 편별 키로 분리해 다른 편에 들어가도 진행 중인 카드 배치를 잃지 않게 했다. 기존 B02 단일 키는 읽기 호환하며, 완료 기록은 여전히 고유 편 ID 12개 기준이다.
- `src/design/`의 공통 카드·말풍선·음성 조작은 12편 게임에 적용됐다. 그러나 지도·목록·도입의 최종 삽화는 이 저장소에 제공되지 않은 자산 경로를 전제로 하므로 현재는 CSS/상징 그림이다. 따라서 첨부 시안의 최종 시각 구현은 6-1에 남아 있다. 이 범위를 완성된 디자인이라고 설명하지 않는다.

## 2026-10-09 — 사용자 제공 devkit 삽화로 6-1 진행

- 사용자가 `/Users/young/Downloads/maeum_maeul_devkit/`의 이미 있는 컴포넌트와 그림을 사용하도록 요청했다. 앞서 문서만 확인해 실제 자산이 없다고 한 판단은 이 제공 폴더가 들어오기 전의 상태다. 이 폴더의 `assets/illustrations`, `assets/places`, `assets/icons`에서 필요한 파일만 `public/devkit/`에 복사해 현재 React 화면에 연결했다. 새 그림을 생성하지 않았다.
- 시작은 마을 배경·하루·안내 강아지, 캐릭터 선택은 네 아바타, 지도는 마을 배경과 장소 SVG, 목록은 관련 그림, B02 도입·행동 선택·순서 맞추기·피드백은 제공된 전용 그림을 쓴다. 11편에 없는 전용 장면은 다른 편의 B02 그림을 잘못 재사용하지 않고 영역별 공통 장소·캐릭터로 보여 준다.
- 게임 상태·허용 정답·실제 완료율은 기존 데이터/엔진에서 유지한다. devkit의 예제 코드는 별·잠금·감정 선택을 포함할 수 있어 완제품으로 가져오지 않고 시각 요소만 적용했다. 지도 장소 버튼은 그림 주변의 투명한 누르기 범위가 겹치지 않도록 세 화면 폭에서 배치한다.
- 자산의 외부 배포 사용권과 11편 전용 장면의 교육적 정확성은 확인 전이다. 화면에 삽화가 보이는 것만으로 6-1 최종 완료 또는 콘텐츠 승인을 뜻하지 않는다.

## 2026-10-09 — 생활 정원 핸드오프 디자인 적용 (6-1a~6-1c)

- 사용자가 `design_handoff_life_garden/README.md`의 색·간격·문구·상호작용을 그대로 맞추도록 요청했다. HTML 프로토타입은 참고만 하고, 기존 `DomainEpisodes`·`BehaviorGame`·`ChoiceCard`(`variant="garden"`)·`VoiceToggle`·게임 엔진·편별 저장을 유지한 채 `src/design/life-garden.css`로 다시 구현했다. 기본 글자 크기에서 README 픽셀 값과 같고, 큰 글자 설정에서는 `--gs` 배율로 커진다. 12편 모두 같은 화면을 쓰며 영역 히어로·목록 타일·장면 그림만 편별로 다르다.
- **순서 맞추기 판정 방식 변경(사용자 지시).** README대로 카드를 누를 때마다 바로 판정한다. 맞는 카드만 칸에 들어가고, 틀린 카드는 흔들림과 "앗, 그건 조금 나중에 해요" 안내를 보이며 배치는 그대로 둔다. SPEC 4.2의 `확인` 버튼·되돌리기는 이 방식으로 대체된다. `acceptedOrders`의 여러 허용 순서는 접두사 비교로 계속 받는다. 두 번 틀리면 순서 힌트를 연다.
- **행동 선택 오답은 같은 화면에 머문다.** README의 "다시 한 번 생각해 볼까요?" 상자 아래에 고른 보기의 이유 문장을 함께 보여 주고(SPEC 4.1 "이유+작은 힌트"), 첫 오답에 힌트, 두 번째 오답에 예시를 연다. 힌트·예시는 README처럼 열고 닫을 수 있다. README의 힌트·예시 문구는 임시 문구라고 명시되어 있어 편별 데이터(`choice.hint`, 예시 행동)를 쓴다. 이전의 "예시를 보고 다음으로" 바로가기(`modeled`)는 새 흐름에서 쓰지 않는다.
- **상황 도입 화면을 질문 화면에 합침.** README 목록은 탭하면 바로 질문으로 간다. 질문 화면이 장면 그림·상황 문장·읽어주기를 모두 보여 주므로 `/episode/:id`는 `/episode/:id/play`로 넘긴다. `EpisodeIntro.tsx`는 보존했지만 연결하지 않는다.
- A02 순서 안내 문장을 README 문구에 맞춰 `물을 쏟았을 때 어떻게 하면 좋을까요?`로 바꿨다. 화면은 여기에 "알맞은 순서로 카드를 골라 보세요."를 붙인다. 채점 구조가 바뀌지 않아 콘텐츠 버전은 그대로 두었다.
- 글꼴: README의 Jua와 Noto Sans KR 500/800을 오프라인에서도 쓰도록 `pnpm fonts`로 직접 만든다(모두 OFL). Jua는 콘텐츠와 화면 코드에 나오는 글자만 담아 241KB이며, 새 제목 문구를 넣으면 다시 실행해야 한다. 미리 캐시하는 용량은 약 1.2MB 늘었다.
- 그림: README가 임시라고 한 house·dog·cheer 대신 devkit 원본(`home.svg`, `dog_guide.png`, `haru_celebrate.png`)을 쓴다. 다만 `haru_celebrate.png`는 149px라 210px 원형에서 흐리게 보이므로 고해상도 원본이 필요하다. 사용자가 제공한 A02 장면 `spill.png`는 WebP(57KB)로 바꿔 `public/scenes/`에 두었다.

## 2026-10-09 — Capacitor로 Android 앱 패키징

- 사용자가 브라우저 PWA가 아닌 앱 형태를 요구했다. React Native로 다시 짜는 대신 Capacitor 8로 같은 React 빌드를 감싸는 방식을 사용자가 골랐다. 화면·엔진·테스트를 그대로 쓰고 Android 프로젝트는 `android/`에 둔다. iOS는 아직 추가하지 않았다.
- `pnpm build:native`는 `vite build --mode native` 뒤에 `cap sync android`를 실행한다. 이 모드에서는 PWA 서비스워커를 만들지 않는다(자산이 APK 안에 들어 있다). `pnpm android:apk`가 디버그 APK를 만들며, Gradle에는 JDK 21(Android Studio 내장 JBR)이 필요하다.
- appId `com.maumlink.app`, 앱 이름 `마음잇다`는 임시값이다. 스토어에 처음 올리기 전에 확정해야 하며, 올린 뒤에는 바꿀 수 없다. WebView 원격 디버깅은 Capacitor 기본값대로 디버그 빌드에서만 켜진다.
- Android 뒤로가기 버튼은 앱 안의 이전 화면으로 이동하고, 처음 화면에서는 앱을 닫는다(`@capacitor/app`).
- **알려진 차이:** Android WebView는 Web Speech API(`speechSynthesis`)를 지원하지 않는다. 그래서 앱에서는 TTS 읽어주기가 없고, 화면은 글자만으로 진행된다. 녹음 파일이 있는 문구는 재생된다. 네이티브 TTS 플러그인 연결은 6-2에서 결정한다.

## 2026-10-10 — 탐험 지도 홈 핸드오프 적용 (6-1d 일부)

- 사용자가 `handoff/`(index.html·README.md·그림 5장)를 지도 홈 화면에 구현하도록 요청했다. HTML을 복사하지 않고 기존 `Home.tsx`의 `ExploreMap`을 README 배치(생활 정원 위 가운데 → 우리 집·학교 좌우 → 도움 쉼터 아래 가운데, 2열 격자)와 수치로 다시 만들었다. 장소를 누르면 기존처럼 `/area/:id`로 가고(`onPlaceSelect`), 소리는 `VoiceToggle`, 설정은 `SettingsSheet`을 그대로 쓴다. 진행 카드·장소별 점은 실제 `maumlink.progress.mvp-v1` 완료 기록에서 계산한다.
- **콘텐츠 필드 추가:** 지도 이름표는 README처럼 짧게 써야 해서(`우리 학교와 운동장` → `학교`) 영역 데이터에 필수 `mapName`을 추가했다. 목록 화면 제목과 버튼의 음성 이름(aria-label)은 계속 `place`를 쓴다. 채점 구조가 바뀌지 않아 콘텐츠 버전은 그대로 두었다.
- 그림 매핑은 README를 따른다: 생활 정원 `playground`, 우리 집 `home`, 학교 `classroom`, 도움 쉼터 `tree`. 투명 배경 PNG 4장과 지도 배경은 WebP로 바꿔 `public/map/`에 두었다(3.3MB → 180KB). 지도 홈에서만 쓰고, 목록·게임 화면의 devkit 그림은 바꾸지 않았다. 옛 마을 배경 지도 CSS는 지웠다.
- 인사 카드에는 아이가 고른 아바타를 보여 준다(README의 "캐릭터 이미지 추가"). README의 900 굵기 글자는 자체 호스팅한 Noto Sans KR에서 가장 굵은 800으로 대신하며, Google Fonts는 불러오지 않는다(오프라인 유지). 320px 같은 좁은 화면에서는 인사말이 잘리지 않도록 두 줄로 줄바꿈을 허용한다.

## 2026-10-10 — 음성 버튼 제거와 아동용 에피소드 설명

- **사용자 지시로 지도 홈과 게임 화면의 음성 버튼을 모두 뺐다.** 지도 헤더의 소리 켜기/끄기, 게임 헤더의 소리 켜기/끄기, `현재 내용 듣기`, 행동 카드마다 있던 읽어주기 버튼이 없어졌다. 지금 새 흐름에서는 소리를 켤 방법이 없고, 모든 내용은 글자로 진행된다. `VoiceToggle`·`useSpeak`·녹음 코드는 지우지 않아 6-2에서 음성 방식을 정하면 다시 붙일 수 있다. `ChoiceCard`의 `onSpeak`는 선택값이 되어, 넘기지 않으면 읽어주기 버튼을 그리지 않는다.
- **목록 설명을 아동용 문장으로 분리했다.** 지금까지 목록에 보이던 `objective`는 교사용 학습 목표 문장이라 2~3학년이 읽기 어려웠다. 에피소드마다 필수 `summary`(한 줄, 구체적 행동, `~해요` 말투)를 추가해 목록에 쓰고, `objective`는 학습 목표 기록으로 남긴다. D02는 안전 원칙(D-NEW-09)에 맞춰 "계속되면 어른에게 알려요"를 넣었다. 새 문장도 교육 검토(7-2) 전 초안이다.
- 목록 카드 오른쪽의 화살표 원과 `모두 살펴볼 수 있어요` 문구를 지웠다. 카드 전체가 계속 버튼이라 누르는 방법은 같다.

## 2026-10-10 — 목록 화면을 지도 이름·그림에 맞춤, 완료 표시 강화

- **사용자 지시:** 지도에서 누른 장소 이름이 목록 화면에도 같은 이름으로 나와야 한다. 그래서 목록 제목, 그림의 대체 텍스트, 지도 버튼의 음성 이름(aria-label)을 모두 `mapName`으로 통일했다(예: `학교`). 앞서 기록한 "목록은 `place`를 쓴다"는 이 결정으로 대체된다. `place`(`우리 학교와 운동장` 등)는 데이터에 남지만 새 화면에는 쓰지 않는다.
- 목록 맨 위 그림은 지도와 같은 `mapPlaces` 그림을 쓴다. 쓰이지 않게 된 `domainHeroArt`는 지웠다. 게임 화면의 장면 그림은 바꾸지 않았다.
- 완료 배지는 진한 초록(`#17774a`) 바탕에 흰 글자 `✓ 완료`로 바꾸고 `이야기 01` 옆에 둔다(흰 글자 대비 약 5.5:1). 카드 배경을 초록으로 칠하는 방식도 시도했지만, 선택된 것처럼 보인다는 사용자 의견에 따라 되돌렸다. 카드는 완료 여부와 관계없이 흰 바탕이다.

## 2026-10-10 — A03을 학교(C)로 이동, A03 장면 그림, 안내 강아지 제거

- **사용자 결정:** `A03 하던 일이 잘 안돼요`(교실 종이 접기)는 학교에 더 맞는다. 맞바꾸기 대신 그대로 옮기는 방식을 사용자가 골라 A 2편·B 3편·C 4편·D 3편, 총 12편이 되었다. 이 결정으로 D-NEW-04의 "4영역×3편"은 "4영역 총 12편"으로 바뀐다. 색인 검사는 "영역마다 3편" 대신 "영역마다 1편 이상, 총 12편"을 확인한다.
- **ID는 `A03`을 유지한다.** 완료 기록(`maumlink.progress.mvp-v1`)과 편별 이어하기 저장 키가 ID를 쓰기 때문이다. 그래서 "ID 첫 글자 = 영역" 규칙을 지웠다. 영역은 `episode-index.json`과 편 JSON의 `domainId`로 정하고, 두 값이 같은지는 기존 교차 검사가 확인한다. 기존 A03 완료 기록은 옮기지 않아도 학교의 완료로 계산된다. 학교 목록에서는 C03 다음 `이야기 04`로 나온다. 채점 구조는 그대로라 콘텐츠 버전은 1로 둔다.
- 사용자가 준 교실 종이 접기 그림(1024×572)을 WebP(84KB)로 바꿔 `public/scenes/a03-origami.webp`에 두고 A03 장면으로 연결했다. 대체 텍스트는 상황 문장 대신 그림을 설명하는 문장으로 바꿨다.
- **사용자 지시로 게임 화면의 안내 강아지 그림을 지웠다.** 상황 말풍선과 순서 맞추기 안내에 있던 두 곳이다. 시작 화면의 강아지는 이번 범위가 아니라 그대로 두었다.

## 2026-10-10 — C02 장면 그림

- 사용자가 준 교실 색연필 그림을 `C02 친구 물건을 쓰고 싶어요` 장면으로 연결했다. 원본에는 연한 파란 여백과 둥근 흰 테두리가 함께 그려져 있었다. 화면의 장면 틀에 이미 흰 테두리가 있어 두 겹으로 보이므로, 가장자리를 잘라 낸 뒤 1024×572로 맞춰 `public/scenes/c02-crayon.webp`(71KB)에 두었다. 대체 텍스트는 그림을 설명하는 문장으로 바꿨다.

## 2026-10-10 — 지도 홈 머리말·설정 버튼 제거, 인사말 강조

- **사용자 지시:** 지도 홈의 `오늘은 어디로 가볼까요?` 제목과 설정(⚙) 버튼을 지웠다. 아바타와 인사말은 흰 카드 밖, 화면 맨 위에 두고 글자를 키웠다(15px → 22px, 아바타 48px → 64px에 흰 테두리). 인사말이 이 화면의 제목(h1)을 맡아 화면 읽기 프로그램의 제목 탐색이 계속 된다. 상단 안전 영역 여백은 본문 첫 줄로 옮겼다.
- **영향:** 새 흐름에서 어른 설정(`SettingsSheet`)을 여는 곳은 지도 홈의 ⚙ 하나뿐이었다. 그래서 지금은 앱 안에서 글자 크기·초기화 같은 어른 설정을 열 수 없다. 설정 화면 코드는 남아 있다. 어른 설정 진입 방식은 6-3(어른 설정)에서 다시 정한다. 예를 들어 길게 누르기나 보호자 확인 뒤 진입하는 방식을 검토한다.

## 2026-10-10 — 장소 중심으로 영역 재구성

- **사용자 결정:** 주제별 4영역(생활 속 상황 대처 / 자기관리 / 대인관계 / 안전하게 쉬고 도움받기)을 지도 장소에 맞춰 다시 묶었다. 영역 이름은 `밖에서 친구와 놀기 / 집에서 스스로 하기 / 교실에서 지내기 / 쉬고 도움받기`이고, 영역 ID(A·B·C·D)와 장소 이름(생활 정원·우리 집·학교·도움 쉼터)은 그대로다. 영역 소개 문장도 새 이름에 맞게 고쳤다.
- **배치:** 생활 정원 C01·C03 / 우리 집 B01·A02·B03 / 학교 A01·B02·C02·A03 / 도움 쉼터 D01·D02·D03(2·3·4·3편). 그대로 옮긴 이야기는 A01·B02이고, 배경 문구를 고친 이야기는 A02(내 방, 가족에게 알리기)·B03(블록 정리 후 저녁)·C01(놀이터 모래 놀이)·C03(그네·미끄럼틀)이다. 배우는 행동, 정답 보기, 순서 구조는 바꾸지 않았다. 문구를 고친 4편은 콘텐츠 버전을 2로 올려, 예전 문구로 하다 만 진행은 기존 버전 불일치 복구를 거쳐 새로 시작된다. 이야기 ID는 바꾸지 않아 완료 기록은 그대로 새 장소에 계산된다.
- B02의 "선생님이 말할 때 차례 기다리기"(확정 요구 D-NEW-03)는 그대로 다루고, 위치만 학교로 바뀌었다. SPEC 1절에 이 사실을 덧붙였다.
- 전용 장면 그림이 없는 이야기에 쓰는 장소별 기본 그림(`placeArt`)이 생활 정원 = 교실, 학교 = 놀이터로 뒤바뀌어 있었다. 지도 장소에 맞게 생활 정원 = 놀이터, 학교 = 교실로 바로잡았다.
- 새 문구에 나온 글자(그네, 미끄럼틀, 씻고 등 19자)가 Jua 글꼴 조각에 없어 `scripts/build-fonts.py`로 글꼴을 다시 만들었다(Jua 247KB → 251KB). 고친 문구와 새 배치는 교육 검토(7-2) 전 초안이다.

## 2026-10-10 — 1차 개선 요청: B02 교체, C04 추가, 공통 완료 화면

- 사용자가 「1차 개선: 자기인식·자기관리」 요청서를 주었다. 요청서의 감정 알아보기, 몸의 반응, 감정–신체 반응 연결 미션은 D-NEW-01(감정 활동 제외)과 충돌했다. 사용자에게 확인한 결과는 다음과 같다.
  - **감정 단계는 넣지 않는다.** D-NEW-01을 유지한다. `EmotionBodyMatchMission`은 만들지 않았다.
  - **B02는 요청서 내용으로 교체한다.** 민수 상황 이야기, 행동 선택 보기 3개와 각 피드백, 힌트, 마무리 문장을 반영했다(버전 +1). 요청서의 "민수는 왜 말하고 싶었을까요?"는 생각 고르기 단계라 넣지 않았다. 미션은 순서 맞추기 대신 6-1f의 **좋은 행동 나누기를 유지**한다(사용자 선택). 요청서의 순서 카드·정답·힌트는 보존용 `sequence` 데이터에만 남겼다.
  - **C04 「친구들이 내 발표를 놀렸어요」를 학교에 추가했다.** 요청서의 상황을 감정 단계 없이 행동 중심으로 다시 쓴 초안이다. 행동 선택: 같이 놀리기 / "놀리지 마." 말하고 계속되면 선생님께 알리기(정답) / 말없이 교실 밖으로 나가기. 분류 카드 4장에서는 멈춰 달라고 말하기, 선생님께 알리기, 쉬고 싶다고 말하기를 모두 "이렇게 해요"로 둔다. 전체는 13편이 되어 진행률 분모도 13이다. 색인, 행동 콘텐츠 로더, `validate-behavior-content`(`EPISODE_COUNT`)가 13편을 확인한다. 전용 장면 그림은 아직 없어 학교 기본 그림을 쓴다.
  - **아동용 영역명은 태그로만 보여 준다.** 색인에 선택값 `skillTag`를 두고, 목록 카드와 게임 화면 위쪽에 작은 태그로 표시한다. B02는 `내 행동 조절하기`다. C04는 감정 단계를 빼서 요청서의 `내 마음 알아보기`가 맞지 않으므로 태그를 붙이지 않았다. 장소별 구성과 장소 주제 이름은 그대로다.
- **공통 완료 화면(모든 이야기, 사용자 선택):** 제목 `잘했어요! 오늘도 새로운 방법을 배웠어요.`, 그 아래 `마무리` 카드에 이야기별 `takeaway`, 진행률, 버튼 세 개(`다시 연습하기` / `다른 이야기 만나기` → 같은 장소의 목록 / `탐험 지도로 돌아가기`)를 둔다.
- **미션 다시 해보기:** 분류 미션에 `다시 해보기`를 추가했다. 카드를 1장 이상 나눈 뒤와 분류 결과 화면에서 보인다. 엔진 `resetSort` 이벤트는 배치·선택·오답 표시·힌트/예시 열림만 지우고, 첫 행동 선택 결과와 시도·도움 기록은 남긴다.

## 2026-10-10 — 2차 개선 요청: 단계형 이야기 C01·C05, 생각 구분하기·순서 맞추기

- 사용자가 「2차 개선: 관계인식·관계관리」 요청서를 주었다. 1차와 달리 이번에는 사용자가 다음을 선택했다.
  - **감정 단계를 넣는다.** D-NEW-01의 예외로, 이 두 이야기에서만 정답 없는 감정 고르기를 쓴다. AGENTS.md도 같은 내용으로 고쳤다.
  - **`친구의 생각 알아보기`와 새 미션 `생각 구분하기`(PerspectiveSortMission)를 만든다.**
  - **관계관리 미션은 `순서 맞추기`(SequenceOrderMission)로 다시 만든다.**
  - **C01을 요청서의 「친구들과 함께 놀고 싶어요」로 교체한다.** 이야기 ID와 완료 기록은 이어지고, 이전 C01(v3)은 `docs/reference/C01-v3-before-2026-10-10.json`에 보존했다.
- **새 이야기 형식 `format: "steps"`(`src/content/stepSchema.ts`):** 상황 문장 목록 + 단계 목록으로 이루어진다. 단계 종류는 `reflect`(정답 없는 고르기 + 보기별 피드백 + 공통 마무리), `choice`(정답 있는 고르기, 오답 이유 + 다시 고르기 + 선택 힌트), `dialogue`(말풍선 대화), `perspective_sort`, `sequence`, `note`(추가 안내)다. 기존 행동 선택 + 분류 이야기 12편과 그 엔진·화면은 바꾸지 않았다. 로더가 `format`으로 두 형식을 나누고, 게임 경로(`/episode/:id/play`)가 이야기 형식에 맞는 화면을 보여 준다.
- **엔진(`src/engine/stepGame.ts`):** 두 미션은 각자 독립된 상태와 처리 함수(`reducePerspective`, `reduceSequence`)를 가져 다른 이야기에서도 쓸 수 있다.
  - 생각 구분하기: 카드를 누른 뒤 사람 칸을 누르면 놓인다. 확인 전까지는 자유롭게 옮길 수 있다. 오답이면 배치를 그대로 두고, 두 번 틀리면 대화 힌트가 저절로 열린다.
  - 순서 맞추기: 카드는 무작위로 섞되 처음부터 정답 순서로 나오지 않게 한다. 다 놓아야 확인할 수 있다. 다른 순서면 배치를 유지한 채 힌트를 연다. 놓인 카드를 누르면 다시 빠진다.
  - 다시 해보기: 그 미션의 배치만 지운다.
  - 진행 저장: 단계별 상태를 `maumlink.steps.mvp-v1.<id>`에 저장한다. 버전이나 구조가 다르면 새로 시작한다. `이전으로` 버튼은 앞 단계로 돌아가며 그때 고른 답을 유지한다.
- **C05 관계 회복 순서:** 요청서의 교육적 유의사항(사과와 마음 묻기의 순서는 바뀔 수 있음)에 따라, 연필을 먼저 돌려주는 두 순서(돌려주기→사과→마음 묻기, 돌려주기→마음 묻기→사과)를 모두 정답으로 받는다. 요청서에 행동 선택 힌트가 없어 `숨긴 물건을 어떻게 하면 좋을지 생각해 봐요.`를 초안으로 넣었다.
- **배치:** C01은 생활 정원, C05 「나는 장난이었는데 친구는 속상해요」는 학교에 둔다. 태그는 C01 `친구 마음 알아보기`, C05 `친구와 함께하기`다. 전체 14편(2·3·6·3)이고 검증기(`EPISODE_COUNT`)도 14편을 확인한다.
- **공통 부분 분리:** 완료 화면·주 버튼·안전 약속을 `src/screens/gameParts.tsx`로 옮겨 두 형식이 함께 쓴다(화면은 그대로).
- **알려진 문제:** 기존 공통 색 일부(이야기 번호 칩, 힌트·다시 하기 버튼, 안전 약속 칩, 마무리 칩)는 흰 바탕 대비가 4.5:1에 못 미친다(axe 기준 3.4~4.1). 새 브라우저 검사는 이 부분을 빼고 새 요소만 검사한다. 디자인 색을 바꾸는 일이라 사용자 확인 뒤 6-2/7-1에서 고친다. C01·C05 전용 장면 그림은 아직 없다.

## 2026-10-10 — 좋은 행동 나누기: 넓은 칸 안에 카드 담기, `안돼요`

- **사용자 요청:** 분류 이름 `다시 생각해요`를 `안돼요`(✋)로 바꾸었다. 가로로 좁은 두 바구니 대신 돌아보기 화면처럼 화면 너비를 쓰는 두 칸(👍 이렇게 해요 / ✋ 안돼요)을 위아래로 둔다. 끌어 놓거나 카드→칸을 차례로 누르면 카드가 그 칸 안으로 들어가 보인다. 칸 안의 카드는 다시 눌러 다른 칸으로 옮길 수 있다. 엔진·저장 구조와 판정은 바뀌지 않았다.
- 칸이 길어져 화면 위에 고정할 수 없으므로 고정(sticky)을 없앴다. 대신 끄는 동안 손가락이나 포인터가 화면 위·아래 끝에 가까우면 페이지가 그쪽으로 스크롤된다. 누르기만으로도 모든 조작이 가능하다.

## 2026-10-10 — 재구성 요청서 중 5개 항목만 반영

- 사용자가 재구성 요청서(12편·2·3·5·2) 가운데 다음 다섯 가지만 반영하라고 정했다. 이야기 재배치, 내용 교체, 순서 맞추기 전환, C04·C05·D04 정리는 하지 않았다.
  1. **`잘 모르겠어요.`:** 정답 없는 고르기(`reflect`) 7곳 모두에 넷째 보기(D)로 추가했다. 피드백은 "잘 모르겠어도 괜찮아요. 천천히 생각해 봐도 돼요."이고, 다른 보기처럼 고르면 바로 다음으로 갈 수 있다.
  2. **상황별 미션 건너뛰기:** 단계형 미션(`perspective_sort`, `emotion_body_match`, `expression_choice`, B02·C05의 `sequence`)에 `skippable: true`를 두고 `이 미션 건너뛰기` 버튼을 단다. 건너뛰어도 마무리와 완료 기록까지 간다. 기존 10편의 `좋은 행동 나누기`는 행동 선택과 함께 그 이야기의 본 활동이라 건너뛰기를 붙이지 않았다.
  3. **자기관리 아동용 이름:** `내 행동 조절하기` → `차근차근 해보기`(B02 태그).
  4. **이전·새 완료 기록 구분:** 완료 기록을 새 키 `maumlink.progress.mvp-v2`에 저장한다. 이전 키 `mvp-v1`의 기록은 지우거나 옮기지 않고 그대로 둔다. 따라서 업데이트 뒤 진행률은 0부터 다시 쌓인다. 이야기별 이어하기 저장은 기존처럼 콘텐츠 버전으로 구분한다. 1·5번 변경으로 B02·C01·C04·C05·D04의 콘텐츠 버전을 1씩 올렸다.
  5. **이전 버튼:** 기존 10편에도 `이전으로`를 넣었다(선택 결과 → 질문, 나누기 → 선택 결과, 나누기 결과 → 나누기). 고른 답과 나눈 카드는 남기고, 질문으로 돌아가면 선택을 다시 확인해야 한다. 이 이동이 저장 복구에서 무효가 되지 않도록 "앞 화면에 나누기 기록이 있으면 무효" 규칙을 "선택 중인 카드만 무효"로 완화했다. 단계형 이야기의 `이전으로`는 그대로다.

## 2026-10-10 — 친구와 대화하기 미션

- **사용자 요청:** C01의 `친구에게 물어보기`(정해진 대화 보기)와 `누구의 생각일까요?`(생각 분류)를 하나로 합쳤다. 아이가 직접 말을 골라 친구와 대화하는 단계다. 목표는 아이가 자신감을 갖고 올바른 말을 하는 힘을 기르는 것이다.
- **방식(`src/content/conversation.ts`, `src/engine/conversation.ts`, `ConversationMission`):**
  - 내 차례마다 말 2~4개(보통 3개)가 나온다. 고른 말마다 친구의 대답이 다르다.
  - 좋은 말을 고르면 "자신 있게 말했어요!"와 칭찬이 나오고 대화가 다음 차례로 이어진다.
  - 다른 말을 고르면 친구의 솔직한 반응과 부드러운 도움말("…해 볼까요?")이 나오고, 같은 차례에서 바로 다른 말을 고를 수 있다. 틀렸다는 표현은 쓰지 않는다.
  - 괄호 안의 보기는 말이 아닌 행동이다(예: `(말없이 색연필을 가져가요.)`). 위험 행동을 따라 하게 연출하지 않고, 결과와 대안만 보여 준다.
  - 대화가 끝나면 마무리 문장이 나온다. C01은 "나는 같이 놀고 싶었지만, 친구는 내 마음을 몰랐어요. 나와 친구의 생각은 다를 수 있어요…"로, 이전 생각 구분하기의 학습 내용을 담는다.
  - `대화 처음부터 다시 하기`를 누를 수 있고, 상황별 미션이므로 건너뛸 수 있다.
- **적용 범위(친구에게 말하거나 빌리는 이야기):**
  - C01(같이 놀기), C05(장난 후 사과, 순서 맞추기 앞): 단계형 이야기의 `conversation` 단계로 넣었다.
  - C02(색연필 빌리고 돌려주기), C03(그네/미끄럼틀 정하기), D02(그만해 줘): 기본형 이야기에 선택값 `conversation`을 두었다. 흐름은 행동 선택 → 선택 확인 → **친구와 대화** → 좋은 행동 나누기다. 이전으로·저장 복구·진행 표시가 이 단계를 포함한다.
  - D04(새치기)는 이미 말 고르기 미션이 있어 바꾸지 않았다. 다섯 편 모두 콘텐츠 버전을 1 올렸다.
- C01에서 생각 구분하기를 뺐기 때문에 지금 `PerspectiveSortMission`을 쓰는 이야기는 없다. 컴포넌트와 엔진은 다른 이야기에서 다시 쓸 수 있도록 남기고, 단위 검사는 예시 데이터로 유지한다.
- **화면 다듬기(사용자 요청):** 대화는 연한 하늘색 `대화창` 상자 안에 친구가 왼쪽, 내가 오른쪽에 나온다. 내 말을 보내면 친구 말풍선에 `입력 중` 점이 약 1.5초 보인 뒤 답이 나온다. 도움말, 다음 선택지, 바깥의 `다음` 버튼은 답이 나온 뒤 함께 보인다. 저장에서 복원한 대화는 기다림 없이 바로 보인다. 단위 검사에서는 기다림을 0으로 둔다(`conversationTiming`).
- 대화 문장은 모두 교육 검토 전 초안이다. 친구 대답이 실제 상황보다 늘 너그러울 수 있으므로, 거절·계속되는 괴롭힘은 안전 약속과 마무리 문장(선생님께 알리기)로 다룬다.

## 기존 결정 이력 (원문 보존)

# Decisions log

Decisions made during implementation that the PRD left open or that deviate from it.
Format: date · decision · why · PRD reference.

## 2026-10-03 — M0

- **Why SPA, not Next (D13).** Fully static, offline-first PWA with two routes, no server, no data fetching, no SEO. A meta-framework adds a server mental model and PWA friction with no benefit. Revisit only if v2 adds accounts or a teacher dashboard with a backend.
- **Pinned versions at M0** (verified with `pnpm view`): React 19.2.x, Vite 8.3, TypeScript ~6.0 (the official Vite template pins 6; TS 7 native compiler is available but the template has not adopted it — follow the template for build stability), Tailwind 4.3 via `@tailwindcss/vite`, React Router 8.4 (data mode, `createBrowserRouter`), Zustand 5, Zod 4, vite-plugin-pwa 1.3, Vitest 5, Playwright 1.63.
- **oxlint instead of ESLint.** The official Vite React template now ships oxlint; it covers rules-of-hooks and TypeScript rules at a fraction of the setup. Prettier kept for formatting. PRD D13 named ESLint; tooling choice, no product impact.
- **Fonts: custom subset, not fontsource.** fontsource's unicode-range slices meant 248 woff2 files (~5 MB) in the offline precache. `pnpm fonts` (scripts/build-fonts.py, run via `uv`) downloads the OFL Noto Sans KR variable font, instances 400/700 and subsets to the 2,350 KS X 1001 syllables + jamo + Latin + symbols + every code point found in `content/*.json` → two ~480 KB woff2 files committed under `public/fonts`. Precache is now 22 entries / ~2.1 MB. Re-run `pnpm fonts` if content ever introduces a syllable outside KS X 1001 (the script reports it).
- **Breakpoint naming.** Tailwind `md:` is remapped to 640 px and `lg:` stays 1024 px so classes read `base / md: / lg:` matching the PRD's `sm / md / lg` tiers. A `short:` variant covers phone-landscape (height < 500 px).
- **Emotion label mapping (PRD §7.1 note).** 창피해요 → "Embarrassed", 당황스러워요 → "Flustered", 부끄러워요 → "Shy" (differs from the `eng-ver` PDFs; English is dev-only under D17 so this has no child-facing effect).
- **Validator severity.** Missing *emotion* icon files are warnings during M0–M1 (icons are produced in M1/M2); missing *outcome* icon files are errors as the PRD specifies. Missing `en` is a warning (D17).
- **Repo location.** The app lives in `maumlink/` beside the client's original decks; the three planning documents are copied into the repo root per PRD §11.2 so the agent and CI have them in-tree.

## 2026-10-03 — M1

- **UI sounds are synthesized (WebAudio), not MP3 files.** Three tones (tick/chime/turn) per §6.11, generated at runtime with an envelope at ≤ −12 dBFS. No assets to precache, works offline from the first visit. `public/sounds/` is unused; the schema's `audio` fields for *speech* clips are untouched.
- **64 px tap targets win over 56 px phone-landscape bars.** PRD §6.2.1 shrank bars at height < 500 px; FR-RES-02 requires ≥ 64 px targets at every viewport. Bars stay 72/96 px; the content zone scrolls. The `short:` variant is still used to shrink the S1 illustration to a thumbnail.
- **"Fresh start" is explicit, not a navigation flag.** `location.state` survives reloads (it lives in `history.state`), which made a `{fresh:true}` flag restart the lesson on refresh. Home and Wrap-up now call `useLesson.reset()` before navigating; the Lesson screen always restores a matching session.
- **Sheets portal to `<body>` and set `inert` on `#root`.** Real focus/pointer isolation for the hint, settings and confirm dialogs (keyboard + screen readers), beyond the JS focus trap.
- **Korean particle in `feeling.chose`.** PRD §7.3 had "{emotion} 를 골랐어요."; shipped as "'{emotion}'를 골랐어요." — natural Korean, same meaning.
- **E2E server hygiene.** The preview server is a single process launched by Playwright with `reuseExistingServer: false`, and the build runs in `globalSetup`. A leaked server had silently served a stale bundle during M1 development.
- **Icon polish deferred to M3:** `unfair` and `frustrated` faces are subtle; `relation`/`self` domain pictograms could read more clearly.

## 2026-10-03 — M3/M4

- **Accessibility gate is axe-core per screen, Lighthouse for budgets.** Lighthouse CLI cannot set the `started` flag, so it audits the start gate (perf/best-practices/CLS); `tests/e2e/a11y.spec.ts` runs axe (WCAG 2.x A/AA + best-practice) on every screen of every scenario and fails on *any* violation — stricter and more relevant than a page score.
- **Caption/label color.** `--ink-soft` (#5B6B7B) passes 4.5:1 on the page background and white cards but not on the domain tints; captions and card labels on tinted surfaces now use `--ink`. Token set unchanged.
- **Headings.** Every lesson screen exposes exactly one `<h1>` (visible question on S1–S4, visually hidden "피드백" on S5, "잘했어요!" on S6) so screen-reader users can jump to the task.
- **No deployment performed.** No hosting credentials were provided; the README documents the three one-command options and the required cache headers.

## 2026-10-03 — Senior UI and reliability review

- **PRD scope retained.** No backend, accounts, tracking, scores, new teaching text or runtime AI. Existing 18 draft strings stay flagged. Review findings and verification limits are in `REVIEW.md`.
- **Accessible action green takes precedence over the erroneous contrast claim.** PRD §6.3's #3E9B6E measures 3.43:1 against white, not 4.6:1. The single green action token is now #28794F (5.33:1); domain colors remain unchanged. This resolves the conflict with §6.12.
- **Home composition.** Four active domain cards retain their names, counts, order and actions; the fifth reserved domain becomes a compact secondary row. This deliberately refines §6.2's reserved-card size without changing the available learning choices.
- **Illustrations.** The user authorized generated artwork. Two placeholders and the text-baked presentation slide now use locally stored, text-free illustrations made from their PRD briefs. Original assets remain intact. Exact prompts and review status are in `ILLUSTRATIONS.md`.
- **Scrolling remains available when needed.** Auto margins center short lesson content, while tall or large-text content starts at a reachable top edge. We do not hide overflow to simulate a no-scroll desktop pass.
- **URL mirrors state, never authorizes progression.** `?step=` and `/done` describe validated store state. Reload uses session state; a manually entered future-step URL cannot bypass choices.
- **Dependency pinning.** Pin exact versions already installed in this checkout (including React 19.3.0, Vite 8.3.2, TypeScript 6.0.3), rather than changing the runtime during a UI review. Node's `--import tsx` runs content tooling without the CLI's unnecessary IPC listener.
- **Acceptance status.** Preserve old screenshot baselines until they can be regenerated and reviewed with a working browser. The sandbox prevents the server/browser launch, and no computer-use surface is enabled. This revision has unit/build verification, not a new browser/a11y/performance sign-off.

## 2026-10-03 — User-requested professional visual redesign

- **The user explicitly reopened visual identity.** They requested a substantial change, including the color theme, after viewing the previous deployment. Teal/ivory replaces the original pastel-led palette; radii, composition and branding are updated throughout. This is an authorized exception to the original PRD §6.3/6.5 values; pedagogy and product scope remain unchanged. See `REDESIGN.md`.
- **Illustration-led Home.** The four domain choices now display scene covers and their existing key sentences, with no new child-facing strings. The reserved fifth item stays secondary. The generated playground image aligns all four scene styles; client originals remain intact.
- **Production identity parity.** Browser theme, favicon and installed-app icons match the interface. `vercel.json` adds the documented SPA fallback and HTML/SW revalidation headers. No deployment or cache issue is claimed to have been diagnosed because live access is blocked.
- **Verification boundary retained.** Unit/build checks pass; browser acceptance and the Vercel deployment state require verification outside the current restricted environment.


## 2026-10-03 — Child-centered storybook direction

- The user rejected the enterprise visual direction and explicitly authorized replacing the entire design and content presentation. The earlier teal identity and PRD's original visual token/layout values are superseded by the storybook theme documented in `REDESIGN.md`.
- Preserve the educational model: all four scenarios, the five-step sequence, exact lesson content, single-sentence storytelling, narration, hints and neutral feedback. No competitive or evaluative game mechanics were added.
- Concrete story titles take precedence over abstract domain labels on Home. Domain names stay visible and accessible; the domain picker still supports additional scenarios.
- A contextual scene thumbnail bridges questions across steps; the ending shows the actual chosen emotion and action instead of abstract recap symbols. Audio replay includes this recap.
- Reuse the existing school illustrations and introduce small local vector companions derived from the linked-heart identity. No new dependency, external service or runtime asset network was introduced.
- Verification remains unit/integration/build plus asset inspection. Chrome and local preview are blocked in this environment; visual/browser acceptance is explicitly pending.


## 2026-10-03 — Smaller default typography

- User reported that default text was too large. Default story/question type is now 22–26px (previously 28–32px), body 18–20px (22–24px), buttons 18px (22px), emotion labels 18px (20px), and captions 14px (16px). Brand and introductory headings are reduced proportionally. This explicitly supersedes the original normal-size values in PRD §6.4.
- The existing large-text setting and 64px minimum touch targets remain unchanged. Only visual sizing changes; lesson content and behavior stay intact.


## 2026-10-03 — Header voice toggle

- User requested tapping the voice icon to turn narration off/on and update its status. Home, lesson and completion headers now share one persistent voice toggle instead of a replay-only control. An outlined/muted speaker and `aria-pressed=false` indicate off; the highlighted speaker and `aria-pressed=true` indicate on. Accessible label is stable; tooltip states the available action.
- Turning off synchronously cancels current browser speech or recorded audio and suppresses subsequent narration until enabled. Turning on unlocks playback and reads the current screen once. The separate auto-read and UI sound preferences retain their meaning; screen-reader announcements remain available.
- `voiceEnabled` defaults to true for older stored settings and persists with the existing preferences. Three UI labels added for this explicitly requested control; scenario content is unchanged.


## 2026-10-03 — Desktop automatic speech and Home cleanup

- User confirmed manual speaker playback works on Mac Chrome; only automatic reading is silent. This narrows the issue to automatic startup rather than proving a missing voice or hardware issue. No live Mac Chrome diagnosis is claimed.
- Automatic narration now checks document activation, retains the current request until click/keyboard interaction, and recovers from a browser `not-allowed` speech error. Navigation and mute cancel pending narration. The header shows a startable/off state while activation is needed, and clicking it starts playback rather than inadvertently muting the waiting voice.
- Evidence references: [Chrome's speech synthesis introduction](https://developer.chrome.com/blog/web-apps-that-talk-introduction-to-the-speech-synthesis-api) and [speech error codes](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error). Browser permission policy still controls whether speech can start before any interaction.
- At the user's explicit request, Home no longer renders the fifth reserved `준비 중` item. The four playable domains remain; original content data is retained. This supersedes the original reserved-card presentation requirement.


## 2026-10-03 — Korean voice startup and truthful playback status

- User reported continued silence even though the default icon appeared on, and clarified no English/default audio was audible either. Earlier activation handling was insufficient evidence of audible playback.
- Confirmed implementation defects: the service emitted `speaking=true` before a browser `start` event, retained a potentially empty initial voice inventory, and silently discarded most synthesis errors. Voice ranking could favor a named remote voice over a local voice.
- Voice inventory is now refreshed per request, waits up to 1.5s for locale-matching voices, prioritizes local voices, and retains the actual utterance until completion. An attempt that fails or never starts within 4s tries another matching voice, then a locale-aware browser default (at most three attempts). Korean requests always keep `ko-KR`; an English voice is never explicitly substituted. Navigation/mute cancels discovery, retries and playback.
- Browser `start` and recorded-audio `playing` events control the speaking status. The toggle uses separate ready, speaking and muted/error appearances; failure leaves a retryable button and readable message. Removed the silent, immediately cancelled unlock utterance; the real requested text now activates speech.
- Settings includes `음성 확인`, current status, and the chosen voice name when known. This provides a direct playback check without rewriting auto-read or sound preferences.
- Primary references: [voice inventory changes](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event), [local vs remote voices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService), and [speech errors](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error).
- Native `say -v '?'` lists Yuna/ko_KR on this machine. That is not a browser inventory or audible test. Chrome tool connection still fails with `CUA_REPL_ENABLED_SURFACES is required`; do not claim the user's Mac is fixed until actual playback is confirmed.


## 2026-10-04 — Domain design documents drive per-lesson features (자기 인식 first)

- User directed shipping each domain's requested features from its design document, starting with 자기 인식. Features are optional, data-driven scenario fields (`stepTitles`, `situation.bubbles`, `situation.emphasis`, `step3.explore`, `action.explore`) so other domains opt in from their own documents without code forks. Lessons without them behave exactly as before.
- Every new child-facing string is a PDF transcription recorded with its page in `pdf-transcriptions.json`; `validate:final-content` enforces it. Only one UI instruction string was added (`step3.explore`).
- Explore-mode narration: the STEP 3 opening is read once at mount; each feeling press speaks only that feeling and reaction, so automatic reading never talks over the child's own exploration.
- Explore-mode retry is offered until every option has been tried; "reconsider" retry semantics are unchanged for other lessons.
- Visual-regression baselines in `tests/e2e/responsive.spec.ts-snapshots` predate this change (and the storybook redesign); they were not regenerated.

## 2026-10-04 — 관계 인식 design document

- `step3.explore` now also applies to `reason` lessons: the child's own documented reason is acknowledged first, then the other documented feelings open one by one under the lesson title (the core value). This implements the document's developer-facing feedback principle as behavior rather than new child-facing text.
- `action.explore` enabled for comparison. In explore recaps, `reconsider` options are listed only when they were the final choice, so the ending never presents the angry option as a kept strategy.
- The document's own inserted illustration replaces the generated v2 playground image, per the instruction to use the provided content. It is text-free, so no regeneration was needed.
- Quote spacing follows the md transcription (verified against the source PPTX), replacing earlier PDF-extraction spacing.

## 2026-10-04 — 관계 관리 design document

- `feeling.multiSelect` turned on as the document permits; the engine, persistence and recap already supported it.
- New optional `step3.principleAfterChoice` (multiple-choice only): the principle is the document's “핵심 피드백”, so it appears and is read only after a reason is chosen. Other lessons keep the always-visible principle.
- Action semantics unchanged (A/B reconsider → try another; C/D end), matching the document's design intent of checking with the friend. The cover's leftover template subtitle is not used.

## 2026-10-04 — 마음건강관리 design document

- Reason comparison enabled (same developer principle as 관계 인식). The comparison heading became optional document data (`step3.compareHeading`): 관계 인식 uses its title; 마음건강관리 shows none because no document sentence fits, rather than inventing one.
- `action.explore` enabled: all four options are recommended ways to express feelings or ask for help, so the child may try each and the ending lists them.
- With this, all four domains follow their md transcriptions exactly; each lesson's Korean text is checked against its md and recorded in the PDF ledger.


## 2026-10-06 — Recorded narration instead of browser speech synthesis

- User requested natural voices generated with ElevenLabs, downloaded once and shipped, replacing the browser voice. The free plan rejects library voices through the API (`paid_plan_required`), so the 128 clips were generated through the ElevenLabs web Text to Speech page (voice `Kyung - Warm, Calm & Clear`, `JQaWvPoEUkcuOTfxFYpJ`, Eleven v4) and downloaded. No runtime API call, key or network dependency was added; the local-first/offline architecture is unchanged.
- Clips are whole phrases, keyed by punctuation-insensitive text (`narrationKey`). Screens that concatenate phrases (STEP 3 opening, ending recap, replay) are resolved into a clip sequence played back to back. If any part has no clip the whole request falls back to browser synthesis, so recorded and synthetic voices never mix in one utterance.
- `feeling.chose` / `feeling.notSureTwice` are recorded per emotion (15 each) rather than spliced from the emotion word, keeping natural Korean prosody. Downloads are re-encoded to 64 kbps mono MP3 by `pnpm narration:import` when ffmpeg is available, halving the offline precache; speech stays clear at that rate. Full-width quotation marks (`＂`) were normalised to `"` only in the text sent to the synthesiser; the reviewed content JSON is unchanged.
- The ElevenLabs API key created for this work (`maumlink-narration`, Text to Speech / Voices read / Models) lives only in the gitignored `.env.local`; it is not used by the app or the build.

## 2026-10-09 — Kid-first cartoon redesign (마음마을)

- **Direction.** The user supplied two reference boards (`content-source/art/refs/ui-ref-*.png`) and asked for a cartoon/character UI that children find appealing. The app now reads as a bright picture-book village: a sky-to-cream wash, chunky white cards, one sunny orange "go" button, a blue outline + check for every selection, and two characters — a puppy guide (마음이) who asks the questions and gives feedback, and a companion the child chooses (하루 · 소라 · 미나 · 준). Lesson wording, emotion ids, option order and feedback text are unchanged; only chrome, layout and artwork changed.
- **Artwork generated with Codex, offline at runtime.** 33 pictures (4 companions, 4 guide poses, 1 celebration, 1 village map, 4 landmarks, 15 emotion faces, 4 scenes) were produced once with the Codex CLI's built-in image tool from `content-source/art/manifest.json` (`pnpm art:generate`, reference images attached for style consistency) and optimised with Sharp (`pnpm art:build`) into `public/img/v3`. Sprites keep alpha as 400/800 px WebP; scenes ship 800/1600 px WebP with an 800 px PNG fallback. Nothing is fetched from a network at runtime; the PWA precaches the set (about 11.7 MiB in total). Earlier illustration sets stay on disk for provenance but are excluded from the precache.
- **Emotion faces are the companion boy (하루) in every lesson**, regardless of which companion the child picked, so the 15 expressions stay one consistent set. The line icons in `public/icons/emotions` remain as the automatic fallback if a face file is missing.
- **Companion pick is one extra first-run tap, with a safe default.** Start → "나의 캐릭터를 선택해요!" (하루 preselected) → Home. It can be changed later in Settings. Existing installs keep `started` and simply get 하루. No name entry: typing is a barrier for the target learners.
- **Home is a village map.** The four learning areas are landmarks on a generated map background. A first pass used generic buildings (house · playground · school · heart pavilion); the user found them disconnected from the lessons, so each landmark is now a vignette of that area's own scene (발표 교실 · 운동장 · 쉬는 시간 교실 · 급식실, with the domain name beneath). If a domain gains a second scenario, the landmark should become a shared place for both. The scenario title stays in the button's accessible name and (on tablets and up) under the place name, so tests and screen readers still find the lesson by its story title. Completed areas show a "완료" badge and the star counter at the top counts finished lessons; neither is tied to the answers given.
- **Feedback banner.** A `recommended` idea gets "잘했어요!"; `acceptable` and `reconsider` ideas both get the same gentle "다른 방법도 생각해볼까요?" (from the reference board), never a negative marker. The authored feedback sentence is unchanged and is still the content; the banner is chrome.
- **Contrast.** Button text is 20 px bold (large text), so white on the orange `#ea580c` passes 3:1; body text stays ≥ 4.5:1 on every tint. Axe runs on every screen in `tests/e2e/a11y.spec.ts`.
- **New utility strings** (`place.*`, `character.*`, `guide.name`, `home.stars`, `feedback.great`, `feedback.rethink`, `wrapup.lesson`) are proposed copy for client review, like the other UI strings; no lesson text was added or edited.
- **Removed.** `HeartFriends`, `DomainArt`, `SpeechBubble` (unused after the redesign). The brand wordmark SVGs are unchanged.

## 2026-10-10 — 6-1f: 첫 행동 선택 이후 좋은 행동 나누기

- 사용자가 드래그·과한 인터랙션을 피하고, 첫 행동 선택/정답 확인 뒤 순서 맞추기를 분류 또는 결과 예측 중 하나로 교체하도록 요청했다. 더 추천한 분류를 12편에 적용한다. 기존 두 게임 제한의 두 번째 종류를 분류로 변경하고 AGENTS/SPEC에 반영한다. 결과 그림과 불확실한 인과관계 원고를 새로 도입할 필요가 없어 분류를 우선한다.
- 장소/이야기에 맞는 4장씩 총 48장을 버전 있는 JSON `sorting`에 작성했다. 안전한 대안은 좋은 행동에 포함하고, 위험 행동은 따라 하도록 시연하지 않는다. 카드별 판정 이유·대안, 힌트, 정리 문장과 원고 배치표(`SORTING-CONTENT.md`)를 제공한다. 교육 검토 상태는 draft다.
- 드래그 없이 카드→바구니 두 번 누르기. 카드의 화면 위치는 고정하고 배치 바구니를 문자로 표시한다. 배치 수정, 전체 배치 후 명시 확인, 오답 배치 보존, 이유·힌트·예시를 지원한다. 예시를 적용한 뒤에도 직접 확인하며 완료에 불이익이 없다. 흔들림/타이머/실패음은 없다.
- 엔진 단계는 choice→choiceFeedback→sorting→sortingFeedback→complete. 저장에 카드별 분류·선택 카드·시도/지원 상태를 기록한다. 12편의 콘텐츠 버전을 각각 1 올렸다. 옛 순서 JSON은 보존하되 실행 화면에서 제거한다. 버전이 다른 진행 세션은 자동 전환하거나 덮어쓰지 않고 재시작 안내를 띄운다. 기존 이야기 완료 기록은 유지하며 분류 활동 완료를 별도로 소급 기록하지 않는다. 옛 감정 진도 키는 건드리지 않는다.
- 순수 데이터 스키마를 `behaviorSchema.ts`로 분리하여 CLI/빌드가 실제 새 12편의 분류 원고도 검사한다. 이전 PDF 검사는 새 문항 검증 근거로 사용하지 않는다. 새 문구를 위한 자체 호스팅 글꼴을 기존 캐시 원본에서 다시 생성한다.
- 음성 UI는 이전 사용자 요청으로 제거된 현재 상태를 유지한다. 새 분류 문구는 모두 화면 문자이며 외부 음성 생성·개인정보·분석·배포를 추가하지 않는다. 음성 재설계와 교육자/아동 검토는 기존 6-2/7-2 과제다.


## 2026-10-10 — 6-1g: 상단 바구니와 직접 끌어 놓기

- 사용자가 바구니가 위에 있어야 하고 드래그가 더 자연스럽겠다고 요청했다. 6-1f의 드래그 제외 결정을 이 범위에서 변경한다. 두 바구니를 카드 위에 배치하고 스크롤 시 헤더 아래에 고정해 아래 카드도 같은 화면에서 놓을 수 있게 한다.
- 별도 라이브러리 없이 Pointer Events와 pointer capture로 마우스·터치·펜을 처리한다. 8px 이상 움직였을 때만 드래그로 보고 작은 손떨림은 탭으로 유지한다. 끄는 카드 미리보기와 대상 바구니 테두리를 표시하며 놓을 때만 엔진의 `dropCard` 이벤트로 분류한다. 바구니 밖, Escape, pointercancel, capture 유실, 창 포커스 이탈 시 배치를 바꾸지 않는다. 드래그 직후 발생하는 클릭은 재선택으로 처리하지 않는다.
- 카드 원래 자리는 유지하고 분류 글자·바구니 개수를 갱신한다. 기존 분류 카드도 다시 끌어 수정할 수 있다. 누르기 대안 유지, 키보드에서 카드를 선택하면 첫 바구니로 초점을 옮겨 선택을 이어간다. 카드 밖 여백에서는 화면을 스크롤할 수 있다. 최종 정답 확인·힌트/예시·저장 형식·콘텐츠 버전·완료 기준은 바꾸지 않는다.


## 2026-10-10 — 8-1: 3차 개선 이어서 마무리

- 첨부 3차 요청과 작업 트리를 비교했다. D04·ExpressionChoiceMission·EmotionBodyMatchMission·B02 단계형 전환·대표 5편 테스트가 이미 코드에 있었으나 PLAN/SPEC/AGENTS에는 2차까지만 반영되어 있었다. 새 앱을 만들지 않고 이 구현을 이어서 검증한다. 요청서의 5개 대표 영역 요구가 이전 1차의 B02/C04 감정 활동 제외 결정을 해당 편에서 갱신하며, 다른 10편에는 감정 활동을 확장하지 않는다.
- 표현 미션의 `recommended`는 권장 설명이며 통과 조건이 아니다. 기존 코드는 권장 답만 다음으로 허용했으나 요청의 선택별 설명 후 다음 상황 이동·자기표현 비강요에 맞춰 유효한 선택이면 진행한다. 대처 선택 단계의 허용 답(B/C) 판정은 유지한다. D04에 상황별 힌트를 넣고 버전 2로 올렸다.
- 음성은 기존 speech 모듈/로컬 녹음·브라우저 합성을 재사용한다. 연습 화면/미션 이탈 시 해당 재생 요청만 취소한다. 합성 API가 없거나 사용할 수 없는 기기도 오류 안내와 읽기만으로 완료할 수 있다. 외부 음성 생성과 새 수집은 없다.
- 기존 `public/img/generated/mind-lunch-line-800.webp`를 눈으로 확인하여 D04 급식실 장면으로 재사용했다. 기존 `learning-teacher.png`를 연습의 듣는 사람 그림으로 연결했다. 새 그림 생성이나 다른 이야기 자산 교체는 하지 않았다. 삽화의 교육적 적합성과 사용권 최종 확인은 7-2/7-3에 남는다.
- 단계형 저장 복구를 기본형과 일치시켰다. 버전 불일치·잘못된 보기/순서/분류 참조·불가능한 완료 상태는 자동 덮어쓰거나 완료로 인정하지 않는다. 기존 키와 완료 ID는 유지하고 명시적 처음부터 시작하기 때 해당 세션만 초기화한다. `hintVisible`은 기존 형식에서도 기본 false로 읽는다.
- 주황색 버튼은 배경/형태를 유지하고 흰 글자를 진한 갈색으로 바꿔 대비를 개선했다. 초록 연습 완료 버튼은 흰 글자를 유지한다. 대표 이야기의 axe 검사에서 주요 버튼 제외를 제거했다.

- 저장 공간 부족으로 Zustand의 영구 저장이 실패해도 현재 세션의 완료 화면은 유지한다. `completionStored()`로 실제 저장 여부를 확인하여 완료 화면에 실패 안내를 표시한다. 재시도/다른 이야기 이동을 막지 않으며, 디스크에 저장됐다고 표시하지 않는다.


## 2026-10-11 — 9-1: Maumlink2 행동 중심 MVP를 카툰 리디자인 저장소에 합치기

- **합치는 방향.** `paintedblue/Maumlink2`는 이 저장소의 `7e91b21`(아동 목소리 녹음)에서 갈라져 행동 중심 MVP(장소 지도·15편·미션·친구와 대화)를 만들었고, 이 저장소는 같은 지점 이후 Codex 생성 카툰 그림(캐릭터 4명, 안내 강아지, 마을 지도, 감정 얼굴 15장, 장면 4장)으로 리디자인했다. 사용자 요청(2026-10-11)대로 Maumlink2의 **설계·UI/UX·README·TODO**를 기준으로 삼되, **문구는 이 저장소의 교육자 설계서 원문**을 쓴다. Git 병합(`m2/master` → `upgrade/behavior-mvp`)으로 두 이력을 모두 보존했다. 충돌은 새 지도/시작/선택 카드 화면은 Maumlink2 쪽을, 그림 파이프라인·녹음 목소리·UI 문구 파일은 이 저장소 쪽을 택해 해결했다.
- **원문 문구가 있는 4편.** C04(자기 인식)·C01(관계 인식)·C05(관계 관리)·D04(마음건강관리)는 설계서 PDF 전사(`content-source/reviewed/scenarios/*.json`)의 상황·감정 보기·이유·행동 보기·피드백·마무리를 글자 그대로 옮겼다(원문 오탈자 보존). 단계 구성, "잘 모르겠어요" 보기, 친구와 대화하기·순서 맞추기·표현 미션·안전 약속 같은 Maumlink2의 추가 요소는 "관련 문구 추가" 범위로 유지했다. 제목은 목록에 맞는 Maumlink2 제목을 쓰고, 원문 제목은 첫 상황 문장으로 보여 준다. `review.source`에 출처를 적었다. 나머지 11편은 Maumlink2 초안을 그대로 쓴다.
- **감정 보기는 감정 id를 가진다.** `reflect` 보기의 선택적 `emotionId`로 기존 감정 얼굴 카드(`face-<id>`)를 보여 준다. 설계서 감정 순서를 그대로 쓰며 정답은 없다. 단계형 `situation.bubbles`로 설계서의 말풍선(ㅋㅋㅋ 등)을 장면 위에 표시할 수 있다.
- **그림은 전부 Codex 생성 한 세트.** 제공 devkit(저해상도 PNG/SVG)과 `public/map`, `public/scenes`, 옛 generated 그림을 쓰지 않고, manifest에 장면 11장·목록 그림 15장·B02 활동 그림 5장·선생님 1장을 추가해 생성했다. 장소 4곳은 이전 "일반 건물" 렌더(집·놀이터·학교·하트 정자)를 다시 썼다. 모든 경로는 `src/design/devkitAssets.ts` 한 곳에 있다.
- **탐험가 id.** 프로필의 `sun/sky/leaf/peach`를 `haru/sora/mina/jun`(하루·소라·미나·준)으로 바꾸고, 저장된 옛 값은 읽을 때 변환한다. 친구와 대화하기의 친구 얼굴은 다른 캐릭터다.
- **TODO 처리.** 저장 버전 불일치·손상은 안내 화면 없이 조용히 처음부터 시작한다(엔진이 키를 지우고 `empty`를 돌려준다). 화면 진입 시 상황·질문, 보기 선택 시 보기를 읽어 주며 헤더의 스피커 버튼으로 끈다. 지도 홈에 어른 설정 버튼을 두었다. 감정 중심 1.0 화면·엔진·검사·스크립트·e2e를 제거했고 `pnpm lint`가 통과한다. 교육자 검토와 새 문장 녹음은 남는다.


## 2026-10-11 — 9-2: 이야기는 설계서 4편만

- 사용자 결정: 이 저장소에는 설계서 4편(자기 인식·관계 인식·관계 관리·마음건강관리)만 실제 콘텐츠이고, Maumlink2는 설계·UI/UX 참고일 뿐이다. 9-1에서 병합한 Maumlink2의 11편 초안(A01~D03 등)과 기본형(행동 선택+좋은 행동 나누기) 엔진·화면·검사를 제거했다.
- 지도의 영역 4곳은 사회정서 영역 그대로다(자기 인식 = 발표 교실, 관계 인식 = 운동장, 관계 관리 = 쉬는 시간 교실, 마음건강관리 = 급식실). 랜드마크는 1.0의 장면 비네트(`place-self/social/relation/mind`)를 다시 쓴다. 영역마다 이야기 1편이며 ID는 `A01·B01·C01·D01`로 다시 매겼다(저장 키도 새로 시작; 9-1 중간 상태의 완료 기록은 호환하지 않는다).
- 이야기 제목은 설계서의 상황 제목을 그대로 쓰고(마침표 포함), 목록 요약은 핵심 문장, 태그는 설계서 프로그램명이다. 그 밖의 안내 문구(영역 설명 한 줄)는 추가 문구다.


## 2026-10-11 — 9-3: 다섯 번째 영역 자기관리(E01)

- 새 설계서(자기관리, 국지우 수정본 PPTX)를 `docs/content-design/ko/05_자기관리_국지우.md`로 전사하고 영역 `E` 자기관리(지도 장소 "수업 교실")에 이야기 E01로 넣었다. 설계서 흐름대로 감정 → 이유 → 마음과 행동(A~D 선택별 설명) → 나도 해볼 수 있어요(자기조절 말 고르기)이며 모두 정답 없는 고르기다. 상황은 설계서 제작 요청대로 두 컷(마음이 드는 장면·말을 시작하는 장면)으로 나눠 `situation.panels`로 표시한다.
- 스키마의 영역 id와 이야기 id 패턴을 `E`까지 넓혔다(색인 5영역·5편, 검증기 `EPISODE_COUNT = 5`). 지도는 자기 인식을 넓게 두고 나머지 네 영역을 2열로 배치한다.
- 감정 얼굴에 아쉬워요(`face-disappointed`)·괜찮아요(`face-okay`)를 Codex로 추가했다. 1.0의 감정 15개 전사(`content-source/reviewed/emotions.json`)는 그대로 두고 그림 id만 더했다.

## 2026-10-12 — 9-4: 이야기 목록에서 이어서/다시 묻기

- **결정:** 목록에서 이야기를 누를 때 저장 상태를 먼저 봅니다. 하던 중(`stepGameStatus` = `in_progress`)이면 「이어서 할까요?」(이어서 하기 / 처음부터 다시 하기), 완료 기록이 있거나 저장이 마무리 화면에 있으면 「다시 해볼까요?」(처음부터 다시 하기 / 아니요)를 묻고, 처음이면 바로 엽니다. 상황 화면에서 멈춘 저장(screen 0)은 고른 것이 없으므로 처음으로 봅니다.
- **이유:** 아이가 실수로 눌러도 진행 중인 활동을 잃지 않고, 완료한 이야기를 다시 할지 스스로 정하게 합니다.
- **구현:** `src/screens/StoryDialog.tsx`(포털, role=dialog, 첫 버튼 포커스, Escape/배경 탭 = 아니요, 음성 자동 읽기), `DomainEpisodes`에서 분기. 다시 하기는 `clearStepGame` 뒤 이동.

## 2026-10-12 — 9-5: 말로 이야기하기(음성 입력)는 선택 기능, 키는 서버에만

- **결정:** 아이가 원하면 보기를 고르는 대신 마이크로 말할 수 있게 합니다(감정·이유·행동 고르기 화면). Gemini 3.5 Transcribe(글로 바꾸기, Interactions API) → Gemini → ElevenLabs TTS(녹음 음성과 같은 voice id·모델 Eleven v4) 순서입니다(2026-10-12 저녁: ElevenLabs Scribe 품질이 낮다는 사용자 판단으로 Google로 바꿈; Scribe는 `VOICE_STT_PROVIDER=elevenlabs`로 남김). 사용자가 말한 `gemini-3.5-transcribe-live`는 WebSocket 스트리밍 모델이라 녹음 후 전송 구조에는 같은 계열의 파일 모델을 씁니다, 세 제공자는 서버(`server/voice`, Vercel 함수 `api/voice/[action].ts`)에서만 부릅니다. 어른 설정의 「말로 이야기하기」는 기본 켜짐(2026-10-12 사용자 결정 "it should be default")이며 끌 수 있고, 마이크 API가 있는 기기에서는 서버 키와 관계없이 버튼이 보입니다(키가 없으면 아이에게 알림). 전사된 말은 단계 상태 `spoken`에 저장되어 보기 선택과 같은 답으로 인정되고 「다음」이 열립니다(2026-10-12 사용자 요청). 대답 뒤 자동으로 넘어가지 않고 「다음」을 아이가 누릅니다(자동 넘김은 2026-10-13 시도 후 사용자 요청으로 제거). 화면마다 마이크는 처음 상태입니다. 마무리는 말한 적이 없으면 설계서 문장 그대로, 말한 적이 있으면 `/api/voice/wrapup`이 아이의 말을 인용한 두 문장을 쓰고 그 뒤에 설계서 마무리 문장을 **원문 그대로** 붙입니다(검토 문구 보존). 결과는 `StepGame.wrapup`에 저장됩니다(2026-10-13). 두 프롬프트 모두 사람 이름(아이·등장인물)을 쓰지 않도록 했습니다.
- **이유:** 로컬 우선·무계정 원칙을 지키면서 음성 표현을 더하려면, 외부 전송은 어른의 선택이어야 하고 키는 앱 번들에 들어가면 안 됩니다. 녹음은 Web Audio로 PCM을 받아 16 kHz WAV로 보내 브라우저·WebView 간 코덱 차이를 없앴습니다.
- **구현 메모:** `pnpm dev`/`preview`는 `.env.dev`를 읽는 Vite 미들웨어로 같은 라우터를 띄웁니다. TTS 실패 시 글은 그대로 두고 브라우저 음성으로 읽습니다. Android는 `RECORD_AUDIO` 권한을 추가했습니다. "앱은 실행 중에 음성 서비스를 호출하지 않는다"는 기존 원칙은 녹음 내레이션에만 해당하고, 이 기능은 켠 경우에만 호출합니다.


## 2026-10-13 — 9-7: 상황 문장은 사실만, 감정 보기는 4개 + 잘 모르겠어요

- **결정:** 상황 문장에는 일어난 일과 눈에 보이는 것만 해요체로 씁니다. 감정·이유는 뒤에서 고르는 문제의 답이므로 상황에 넣지 않습니다(A01·D01 다시 씀, E01 마지막 문장 삭제). 감정 고르기 화면은 감정 최대 4개와 잘 모르겠어요로 줄입니다(A01 부끄러워요·무서워요, B01 짜증나요, C01 당황스러워요 제외). E01은 질문이 민수 기준이라 3인칭을 유지합니다.
- **이유:** 느린학습자가 상황에서 답을 미리 읽으면 감정을 스스로 떠올리는 연습이 되지 않고, 보기가 많으면 고르기 어렵습니다. A01은 남은 4개가 마음–몸 연결 카드와 같습니다.
- **원문 보호:** C01은 설계서 원문 보호 대상이지만 사용자 승인으로 명백한 오타(연칠→연필, 바과→사과, 용기있는→용기 있는, 마침표)만 고쳤습니다. 새 상황 문장과 감정 보기 축소는 설계자 확인이 필요합니다.
- **저장:** 진행 키는 그대로입니다. 삭제한 감정 id를 골라 둔 저장은 검증에서 무효가 되어 그 이야기만 조용히 처음부터 시작합니다.
- **정답 노출 제거:** A01 감정 단계 도움말과 목록 요약에 있던 「속상한 마음을 혼자 해결하고 싶어」는 감정 정답을 알려 주므로 「친구들이 놀렸을 때 내 마음이 어땠을지 떠올려 봐요.」(도움말)·「발표하다가 실수를 했어요.」(요약)로 바꿨습니다.
- **녹음:** 바뀐 문장은 녹음 클립이 없어 기기 음성으로 읽힙니다. 녹음 갱신과 읽기 속도 조정은 다음 작업에서 합니다.


## 2026-10-17 — 9-7: 평가 대신 응원, 수정 문장과 녹음 일치

- 고객 피드백에 따라 5편 공통 완료를 `멋져요! 오늘도 새로운 방법을 배웠어요.`로 변경했다. C01 순서 미션·D01 말하기 연습 완료와 공통 UI/녹음 안내의 `잘했어요!`도 교체했다. 개인 맞춤 대답/마무리 프롬프트에 평가 표현 대신 응원 표현을 쓰도록 명시했다. 생성 모델의 모든 응답을 강제로 보장하는 필터는 아니다.
- 공통 완료 문구를 `content/game-copy.json`(version 1)로 옮겨 화면과 녹음 인벤토리의 별도 하드코딩을 없앴다. 현재 화면에 쓰이는 문장 및 조합 문장의 전체 녹음 검사를 유지하고, 약한 일부 녹음 개수 검사를 전체 인벤토리 검사로 강화했다.
- 사용자의 맞춤법·변경 문장 검토 요청을 명백한 오탈자 교정 범위로 적용했다. 별도 수정 목록은 받지 않았으며, 변경 전후는 `CONTENT_REVIEW.md`에 기록한다. 원본 PDF 전사/과거 음성 생성 이력은 보존한다. D01 목록 요약도 본문과 맞췄다.
- 응원 5개·오탈자 교정 5개 문장을 기존 Lulu 음성(voice id `ocZQ262SsZb9RIxcQBOj`, `eleven_v4`)으로 새로 생성하고 64kbps mono MP3로 가져왔다. 문장 키가 바뀌어 새 URL이 할당되므로 기존 문장 녹음을 새 문장으로 잘못 재사용하지 않는다. 과거 파일과 매핑은 이력으로 남아 있으나 현재 수정 문장에서는 호출되지 않는다.
- 단계/보기 ID, 완료 조건, 저장 구조는 그대로이며 콘텐츠의 저장 호환 버전은 올리지 않았다. 문구 교정 때문에 학습 중 기록을 조용히 초기화하는 일을 피한다. 완료 시점에 현행 JSON의 문구를 읽는다. 기존에 저장된 개인 맞춤 마무리와 음성은 사용자 이력이므로 덮어쓰지 않는다.
- 생성 API는 개발 작업에서만 사용했다. 이번 작업에는 배포·APK 재생성·실기기 검토가 포함되지 않는다. 검증 결과는 `PLAN.md` 9-7에 기록한다.


### 9-7 PR #2 통합 보완 (2026-10-17)

- `commit and push to PR` 요청으로 조회한 기존 PR #2의 `content/sentence-cleanup`은 master보다 두 커밋 앞서 있었다. 기존 사실 중심 상황 문장/감정 보기 축소/오탈자/핵심 문장과 15개 녹음을 우선 보존하고, 고객 응원 문구와 A01 `기분 전환` 교정을 더했다. D01 master 기준 교정 상황으로 PR의 사실 중심 문장을 되돌리지 않는다. 최종 인벤토리는 250/250이다.
- 기존 PR의 삭제된 감정 ID를 선택한 저장이 재시작되는 동작과 설계자 검토 대기는 그대로다. 위 “단계/보기 ID 그대로”는 이번 응원 교정의 추가 변경만 뜻하며, PR 전체의 감정 보기 축소를 취소하지 않는다.
- 최종 PR 원고/음성을 기준으로 웹·브라우저 검사와 APK 재빌드를 다시 실행한다. 이전 master 기준 APK 검증은 이력으로 구분한다.
