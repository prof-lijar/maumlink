# 화면별 구현 가이드 — 시안의 5개 화면과 미니게임 2개

기본 원칙은 **배경(비인터랙티브) → 그림/캐릭터(비인터랙티브) → 카드·배지·텍스트·버튼(인터랙티브 DOM)** 순서로 쌓는 것입니다. 조작되는 콘텐츠를 큰 배경 이미지 속에 미리 합치지 않습니다.

| 시안 영역 | 사용할 리소스 / 컴포넌트 | 바뀌는 데이터/이벤트 | 구현한 데모 경로 |
|---|---|---|---|
| 1. 시작 화면 | `village_vertical.png`, `haru_full_body.png`, `dog_guide.png`, HTML 제목, `PrimaryButton` | 시작 클릭 시 `screen='avatar'` | `demo/app.js` → `welcome()` |
| 2. 캐릭터 선택 | 4개 `avatar_*.png`, `haru_full_body.png`, `Choice` 형태의 아바타 버튼 | `avatarId`, 버튼 `aria-pressed`, 다음 이동 | `avatar()` |
| 3. 메인 지도 | `village_vertical.png` + `places/*.svg` + HTML 라벨/배지 | 영역 ID, 새 미션 배지, 이동 | `map()` |
| 4. 에피소드 목록 | `EpisodeCard`, `StarRating`, `lock.svg`, `chevron-right.svg` | `status`, `stars`; locked 클릭 차단 | `list()` |
| 5. 에피소드 시작 | `classroom.png`, `haru_wave.png`, 말풍선, 진행바, 버튼 | 에피소드 ID, 음소거 표시, 다음 이동 | `story()` |
| 6. 미니게임 ① 감정 선택 | `emotion_*.png`, `ChoiceCard`, `ProgressStepper` | `selectedEmotionId`, 카드 선택 테두리 | `emotion()` |
| 7. 미니게임 ② 행동 순서 | `raise_hand.png`, `think_first.png`, `speak_when_called.png`, `SequenceSlot` | 선택 순서, 정답/오답, 다음 버튼 활성화 | `order()` |
| 8. 성공/별 획득 | `haru_celebrate.png`, `star-filled.svg`, HTML 피드백 | 완료 결과, 별 0–4개 갱신, 다음 미션 해금 | `result()` |
| 9. 나의 수첩 | `book.svg`, `EpisodeCard` 별점 재사용 | 완료 수와 별점 합계 | `notebook()` |

### 상태 전이 예시

`welcome → avatar → map → list → story → emotion → order → result → list`

- **별점:** 현재 `stars=2`라면 `StarRating(value=2,max=4)`가 `채운 별×2 + 빈 별×2`를 렌더링. 게임 완료 후 `stars=4`를 반영하면 자동으로 네 개가 채워짐.
- **잠금:** `status=locked`라면 `EpisodeCard`의 버튼 비활성 + 자물쇠. 해금 후 `available`로 바꾸면 같은 카드가 활성화됨.
- **진행바:** `current=1,2,3,4`에 따라 채운 단계가 달라짐. 단계 값만 페이지별 state로 넘김.
- **감정 선택:** 이미지 그대로, 선택 시 그림 위 바탕 카드에 테두리. 감정 피드백 문구는 선택 값에 따라 바뀜.
- **행동 순서:** 선택한 ID들을 길이 3의 배열로 축적하고 `['think','raise','speak']`와 비교. 맞을 때만 완료 버튼 활성화.
- **알림 배지:** 지도 장소 그림에는 `!`가 포함되지 않음. 해당 장소에 새 활동이 있는 경우에만 부모 DOM에서 노출.

### 데모 범위의 한계

- 동작하는 학습 콘텐츠는 현재 **나도 할 말이 있어요!** 예시 1개에 집중되어 있습니다. 다른 에피소드 카드에 진입해도 동일한 상황/미니게임이 나타나는 것은 **샘플 데모의 간소화된 동작**입니다. 실제 프로젝트에서는 `episodeId`에 따라 씬·문항·정답을 로드하도록 교체해야 합니다.
- 지도 각 영역도 현재 공통 에피소드 목록을 공유하는 데모입니다. 서비스에서는 영역별 에피소드 필터링과 잠금 정책을 연결해야 합니다.
- 음성 버튼은 음소거 표시만 바뀌며 TTS/녹음/미디어는 포함하지 않았습니다.
- 이 패키지는 네이티브 Flutter/Unity/SwiftUI 구현이 아닌 웹/React 소스입니다. 에셋과 데이터는 다른 프레임워크에서도 재사용 가능합니다.
