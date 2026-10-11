# 파일별 UI 에셋 설명 (전체 101개)

> 개발용 파일 경로는 **프로젝트 루트 기준**입니다. SVG가 제공되는 아이콘/장소는 SVG 사용을 권장합니다. 동일 이름 PNG는 엔진 호환/빠른 시안용입니다.
> `assets/illustrations`의 PNG는 크기가 비교적 작은 이미지이므로, 원본 크기보다 크게 확대하면 화질이 저하될 수 있습니다.
> 이 에셋들은 렌더링 재료이며 클릭·별 채움·잠금·텍스트 변경 등 동작은 포함하지 않습니다. 동작은 `docs/COMPONENT_GUIDE.md`를 참고하세요.

## 캐릭터

| 파일 (상대 경로) | 요소 | 용도 · 구현 방법 | 크기 |
|---|---|---|---|
| `assets/illustrations/characters/avatar_brown_hair_girl.png` | 여자 친구 아바타 | 캐릭터 선택 썸네일. 선택 배경·테두리는 DOM/CSS에서 처리. | 107×113 |
| `assets/illustrations/characters/avatar_glasses_boy.png` | 안경 쓴 친구 아바타 | 캐릭터 선택 썸네일. 선택 상태는 별도의 boolean. | 107×113 |
| `assets/illustrations/characters/avatar_haru.png` | 하루 얼굴 아바타 | 기본 프로필 이미지, 에피소드/안내 말풍선 좌측에 배치. | 105×114 |
| `assets/illustrations/characters/avatar_pink_girl.png` | 핑크 옷 친구 아바타 | 캐릭터 선택 썸네일. 이름 텍스트는 코드에서 렌더링. | 108×114 |
| `assets/illustrations/characters/dog_guide.png` | 안내 강아지 | 시작 화면 삽화 장식. 터치 필요 시 버튼으로 감싸기. | 154×160 |
| `assets/illustrations/characters/haru_celebrate.png` | 기뻐하는 하루 | 정답 완료/보상 화면 캐릭터. | 149×144 |
| `assets/illustrations/characters/haru_full_body.png` | 전신 하루 | 시작 및 캐릭터 선택 화면의 주인공 삽화. | 174×274 |
| `assets/illustrations/characters/haru_surprised.png` | 놀란 하루 | 감정 선택 상황 설명 중 캐릭터 표정. | 113×143 |
| `assets/illustrations/characters/haru_thinking.png` | 생각하는 하루 | 관찰/행동 탐색 안내 장면. | 113×147 |
| `assets/illustrations/characters/haru_wave.png` | 인사하는 하루 | 에피소드 도입과 안내 장면. | 124×146 |

## 배경

| 파일 (상대 경로) | 요소 | 용도 · 구현 방법 | 크기 |
|---|---|---|---|
| `assets/illustrations/scenes/classroom.png` | 교실 장면 | 상황 제시 화면 배경. 인물·텍스트·버튼은 위에 별도 레이어로 배치. | 207×252 |
| `assets/illustrations/scenes/village_narrow.png` | 세로 마을 풍경 (좁은형) | 시작 화면/모바일 배경의 장식. 원본 래스터이므로 기기 해상도 맞춤 검토. | 126×159 |
| `assets/illustrations/scenes/village_vertical.png` | 세로 마을 풍경 | 마을 배경. 장소 SVG/배지/라벨을 겹쳐 지도 구성. | 166×252 |

## 게임 삽화

| 파일 (상대 경로) | 요소 | 용도 · 구현 방법 | 크기 |
|---|---|---|---|
| `assets/illustrations/mini_game/emotion_angry.png` | 화가 나요 | 감정 카드에 넣는 이미지. 선택/비선택은 ChoiceCard가 처리. | 116×121 |
| `assets/illustrations/mini_game/emotion_sad.png` | 속상해요 | 감정 카드에 넣는 이미지. 카드 문구는 별도 텍스트. | 114×121 |
| `assets/illustrations/mini_game/emotion_shy.png` | 부끄러워요 | 감정 카드에 넣는 이미지. 선택 시 테두리를 CSS로 표시. | 122×121 |
| `assets/illustrations/mini_game/raise_hand.png` | 손을 들어요 | 행동 순서 미니게임 카드. 선택 순서 채점은 정답 ID 배열 비교. | 119×127 |
| `assets/illustrations/mini_game/speak_when_called.png` | 선생님이 부르면 이야기해요 | 행동 순서 미니게임 카드의 세 번째 단계 이미지. | 126×129 |
| `assets/illustrations/mini_game/think_first.png` | 하고 싶은 말이 생겨요 | 행동 순서 미니게임 카드의 첫 번째 단계 이미지. | 122×129 |

## 지도 장소

| 파일 (상대 경로) | 요소 | 용도 · 구현 방법 | 크기 |
|---|---|---|---|
| `assets/places/classroom.png` | 우리 교실 건물 | 지도 영역 버튼의 건물 그림. 느낌표·영역명은 별도 UI. | 540×435 |
| `assets/places/classroom.svg` | 우리 교실 건물 | 지도 영역 버튼의 건물 그림. 느낌표·영역명은 별도 UI. | VB 0 0 180 145 |
| `assets/places/home.png` | 우리 집 건물 | 지도 영역 버튼의 건물 그림. 클릭 처리는 앱 상태 내비게이션. | 540×435 |
| `assets/places/home.svg` | 우리 집 건물 | 지도 영역 버튼의 건물 그림. 클릭 처리는 앱 상태 내비게이션. | VB 0 0 180 145 |
| `assets/places/notebook.png` | 나의 수첩 건물 | 학습 결과 모음 영역 표시. 진행률은 별도 데이터. | 540×435 |
| `assets/places/notebook.svg` | 나의 수첩 건물 | 학습 결과 모음 영역 표시. 진행률은 별도 데이터. | VB 0 0 180 145 |
| `assets/places/playground.png` | 운동장 | 지도 영역 버튼의 운동장 삽화. | 540×435 |
| `assets/places/playground.svg` | 운동장 | 지도 영역 버튼의 운동장 삽화. | VB 0 0 180 145 |
| `assets/places/rest.png` | 마음쉼터 | 지도 영역 버튼의 마음쉼터 삽화. | 540×435 |
| `assets/places/rest.svg` | 마음쉼터 | 지도 영역 버튼의 마음쉼터 삽화. | VB 0 0 180 145 |

## UI 아이콘

| 파일 (상대 경로) | 요소 | 용도 · 구현 방법 | 크기 |
|---|---|---|---|
| `assets/icons/arrow-left.png` | 왼쪽 이동 화살표 | 상단 뒤로 가기/이전 화면 버튼. 클릭은 부모 button의 onClick에서 처리. | 128×128 |
| `assets/icons/arrow-left.svg` | 왼쪽 이동 화살표 | 상단 뒤로 가기/이전 화면 버튼. 클릭은 부모 button의 onClick에서 처리. | VB 0 0 24 24 |
| `assets/icons/arrow-right.png` | 오른쪽 이동 화살표 | 다음 이동을 암시하는 아이콘. 버튼 텍스트는 HTML로 생성. | 128×128 |
| `assets/icons/arrow-right.svg` | 오른쪽 이동 화살표 | 다음 이동을 암시하는 아이콘. 버튼 텍스트는 HTML로 생성. | VB 0 0 24 24 |
| `assets/icons/backpack.png` | 가방 | 가방 챙기기 에피소드 썸네일 또는 학습 보상 아이콘. | 128×128 |
| `assets/icons/backpack.svg` | 가방 | 가방 챙기기 에피소드 썸네일 또는 학습 보상 아이콘. | VB 0 0 24 24 |
| `assets/icons/book.png` | 책 | 에피소드 완료 개수/나의 수첩 아이콘. | 128×128 |
| `assets/icons/book.svg` | 책 | 에피소드 완료 개수/나의 수첩 아이콘. | VB 0 0 24 24 |
| `assets/icons/check.png` | 체크 | 정답 확인/완료 작업 아이콘. 완료 상태는 별도 코드로 제어. | 128×128 |
| `assets/icons/check.svg` | 체크 | 정답 확인/완료 작업 아이콘. 완료 상태는 별도 코드로 제어. | VB 0 0 24 24 |
| `assets/icons/chevron-left.png` | 작은 왼쪽 꺾쇠 | 뒤로 이동하는 버튼의 보조 아이콘. | 128×128 |
| `assets/icons/chevron-left.svg` | 작은 왼쪽 꺾쇠 | 뒤로 이동하는 버튼의 보조 아이콘. | VB 0 0 24 24 |
| `assets/icons/chevron-right.png` | 작은 오른쪽 꺾쇠 | 에피소드 카드·다음 버튼 끝쪽 아이콘. | 128×128 |
| `assets/icons/chevron-right.svg` | 작은 오른쪽 꺾쇠 | 에피소드 카드·다음 버튼 끝쪽 아이콘. | VB 0 0 24 24 |
| `assets/icons/close.png` | 닫기 | 팝업/모달 닫기 버튼의 아이콘. | 128×128 |
| `assets/icons/close.svg` | 닫기 | 팝업/모달 닫기 버튼의 아이콘. | VB 0 0 24 24 |
| `assets/icons/exclamation.png` | 느낌표 | 미학습 알림 배지 안 아이콘. 배지 숫자/노출 여부는 별도 상태로 제어. | 128×128 |
| `assets/icons/exclamation.svg` | 느낌표 | 미학습 알림 배지 안 아이콘. 배지 숫자/노출 여부는 별도 상태로 제어. | VB 0 0 24 24 |
| `assets/icons/heart.png` | 하트 | 마음쉼터·마음건강 장식/상징. | 128×128 |
| `assets/icons/heart.svg` | 하트 | 마음쉼터·마음건강 장식/상징. | VB 0 0 24 24 |
| `assets/icons/home.png` | 집 아이콘 | 우리 집 영역이나 홈 이동 표시. | 128×128 |
| `assets/icons/home.svg` | 집 아이콘 | 우리 집 영역이나 홈 이동 표시. | VB 0 0 24 24 |
| `assets/icons/lock.png` | 잠금 | locked 상태인 에피소드 카드에 표시. disabled와 함께 사용. | 128×128 |
| `assets/icons/lock.svg` | 잠금 | locked 상태인 에피소드 카드에 표시. disabled와 함께 사용. | VB 0 0 24 24 |
| `assets/icons/map.png` | 지도 | 지도 화면으로 돌아가는 버튼에 사용. | 128×128 |
| `assets/icons/map.svg` | 지도 | 지도 화면으로 돌아가는 버튼에 사용. | VB 0 0 24 24 |
| `assets/icons/pause.png` | 일시정지 | 실제 오디오/비디오 플레이어에 연결하는 보조 아이콘. | 128×128 |
| `assets/icons/pause.svg` | 일시정지 | 실제 오디오/비디오 플레이어에 연결하는 보조 아이콘. | VB 0 0 24 24 |
| `assets/icons/pencil.png` | 연필 | 학습/기록 표시 아이콘. | 128×128 |
| `assets/icons/pencil.svg` | 연필 | 학습/기록 표시 아이콘. | VB 0 0 24 24 |
| `assets/icons/play.png` | 재생 | 실제 오디오/비디오 플레이어의 재생 아이콘. | 128×128 |
| `assets/icons/play.svg` | 재생 | 실제 오디오/비디오 플레이어의 재생 아이콘. | VB 0 0 24 24 |
| `assets/icons/question.png` | 물음표 | 도움말/안내 배지. | 128×128 |
| `assets/icons/question.svg` | 물음표 | 도움말/안내 배지. | VB 0 0 24 24 |
| `assets/icons/refresh.png` | 다시 시작 | 미니게임 선택 초기화 기능과 연결. | 128×128 |
| `assets/icons/refresh.svg` | 다시 시작 | 미니게임 선택 초기화 기능과 연결. | VB 0 0 24 24 |
| `assets/icons/settings.png` | 설정 | 설정 또는 개발용 UI 상태 갤러리 진입 버튼. | 128×128 |
| `assets/icons/settings.svg` | 설정 | 설정 또는 개발용 UI 상태 갤러리 진입 버튼. | VB 0 0 24 24 |
| `assets/icons/sound-off.png` | 소리 끔 | muted=true 상태를 표시. 실제 음성 재생 처리와 별개. | 128×128 |
| `assets/icons/sound-off.svg` | 소리 끔 | muted=true 상태를 표시. 실제 음성 재생 처리와 별개. | VB 0 0 24 24 |
| `assets/icons/sound-on.png` | 소리 켬 | muted=false 상태를 표시. 실제 음성 재생 처리와 별개. | 128×128 |
| `assets/icons/sound-on.svg` | 소리 켬 | muted=false 상태를 표시. 실제 음성 재생 처리와 별개. | VB 0 0 24 24 |
| `assets/icons/sparkle.png` | 반짝임 | 정답·보상 연출 장식. | 128×128 |
| `assets/icons/sparkle.svg` | 반짝임 | 정답·보상 연출 장식. | VB 0 0 24 24 |
| `assets/icons/star-empty.png` | 빈 별 | StarRating에서 획득하지 않은 점수를 나타냄. | 128×128 |
| `assets/icons/star-empty.svg` | 빈 별 | StarRating에서 획득하지 않은 점수를 나타냄. | VB 0 0 24 24 |
| `assets/icons/star-filled.png` | 채워진 별 | StarRating에서 획득한 별 개수를 표시. | 128×128 |
| `assets/icons/star-filled.svg` | 채워진 별 | StarRating에서 획득한 별 개수를 표시. | VB 0 0 24 24 |
| `assets/icons/star-outline.png` | 별 윤곽 | 미획득·꾸밈 상태 표현. 점수 표시는 star-empty 권장. | 128×128 |
| `assets/icons/star-outline.svg` | 별 윤곽 | 미획득·꾸밈 상태 표현. 점수 표시는 star-empty 권장. | VB 0 0 24 24 |
| `assets/icons/sun.png` | 해 | 아침 준비 에피소드의 대표 썸네일. | 128×128 |
| `assets/icons/sun.svg` | 해 | 아침 준비 에피소드의 대표 썸네일. | VB 0 0 24 24 |
| `assets/icons/trophy.png` | 트로피 | 전체 보상/성취 아이콘. | 128×128 |
| `assets/icons/trophy.svg` | 트로피 | 전체 보상/성취 아이콘. | VB 0 0 24 24 |
| `assets/icons/unlock.png` | 잠금 해제 | 다음 에피소드가 열렸을 때 보조 알림. | 128×128 |
| `assets/icons/unlock.svg` | 잠금 해제 | 다음 에피소드가 열렸을 때 보조 알림. | VB 0 0 24 24 |
| `assets/icons/user.png` | 사람 | 선택 캐릭터/프로필 기능. | 128×128 |
| `assets/icons/user.svg` | 사람 | 선택 캐릭터/프로필 기능. | VB 0 0 24 24 |
| `assets/icons/volume.png` | 볼륨 | 음량 관련 표시. 오디오 엔진은 별도 구현. | 128×128 |
| `assets/icons/volume.svg` | 볼륨 | 음량 관련 표시. 오디오 엔진은 별도 구현. | VB 0 0 24 24 |

## UI 기본 형태

| 파일 (상대 경로) | 요소 | 용도 · 구현 방법 | 크기 |
|---|---|---|---|
| `assets/ui_shapes/button-disabled.svg` | 비활성 버튼 외형 | 텍스트 없는 비활성 버튼용 디자인 참조. 실제 disabled 속성과 짝지음. | VB 0 0 240 64 |
| `assets/ui_shapes/button-primary.svg` | 기본 CTA 버튼 배경 | 색상·둥근 모서리를 재현할 때 사용. 가변 글자는 위에 얹음. | VB 0 0 240 64 |
| `assets/ui_shapes/button-secondary.svg` | 보조 버튼 배경 | 취소·이전 등 보조 행동의 디자인 참조. | VB 0 0 240 64 |
| `assets/ui_shapes/choice-card-selected.svg` | 선택된 카드 배경 | 선택된 ChoiceCard의 시각 상태를 보여주는 빈 프레임. | VB 0 0 160 198 |
| `assets/ui_shapes/choice-card.svg` | 기본 선택 카드 배경 | 그림·라벨·이벤트를 넣을 빈 카드 컨테이너. | VB 0 0 160 198 |
| `assets/ui_shapes/episode-row-selected.svg` | 선택 에피소드 행 배경 | 선택되었지만 잠금이 아닌 에피소드의 시각 상태. | VB 0 0 360 91 |
| `assets/ui_shapes/episode-row.svg` | 에피소드 행 배경 | 상태별 요소를 담는 텍스트 없는 행 배경. | VB 0 0 360 91 |
| `assets/ui_shapes/location-label.svg` | 지도 장소 라벨 배경 | 지도 건물 아래 장소명과 역량 분류 텍스트를 별도 배치. | VB 0 0 190 68 |
| `assets/ui_shapes/order-slot.svg` | 순서 맞추기 슬롯 배경 | 순서 카드 드롭/선택 위치. 번호와 선택 이미지는 분리. | VB 0 0 120 148 |
| `assets/ui_shapes/pill.svg` | 알약형 라벨 배경 | 상태/카테고리/서브타이틀 라벨 외형. | VB 0 0 160 52 |
| `assets/ui_shapes/progress-track.svg` | 진행 바 트랙 배경 | CSS 진행률/단계 표시를 겹칠 바탕. 진행도는 JS 상태. | VB 0 0 320 25 |
| `assets/ui_shapes/speech-bubble.svg` | 말풍선 배경 | 안내·피드백 텍스트를 올릴 컨테이너. | VB 0 0 320 120 |

## 레이어링 및 상태 분리 예시

```html
<button class="map-zone" aria-label="우리 교실 열기">
  <img src="/assets/places/classroom.svg" alt="" />
  <span class="map-zone__name">우리 교실 <small>(대인관계)</small></span>
  <span class="map-zone__badge" aria-hidden="true">!</span>
</button>
```

```tsx
<StarRating value={2} max={4} /> {/* 채운 별 두 개 + 빈 별 두 개 */}
<EpisodeCard episode={{id:"raise-hand", title:"나도 할 말이 있어요!", status:"locked", stars:0, illustration:"haru"}} />
```

## 파일 형식 추천

- 인물·배경·감정/행동 삽화: PNG (`illustrations/`). 주로 `<img>` 또는 CSS `background-image`.
- 가변 크기의 단색/심볼: SVG (`icons/`). 상태별로 이름을 전환.
- 지도 장소 건물: SVG (`places/`). 부모 버튼에 뱃지와 라벨을 별도 추가.
- 카드·버튼 배경: 구현 환경에선 CSS를 기본으로, `ui_shapes/`의 빈 SVG는 화면 디자인 참고용으로 선택 사용.

## 폴더 내 PNG의 투명 배경 관련

PNG의 alpha 채널은 존재하지만, 생성 원본의 가장자리 투명도/색 번짐이 있을 수 있습니다. 실제 앱의 배경색에서 시각 검수를 권장합니다.
