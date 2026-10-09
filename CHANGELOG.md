# Changelog

## Unreleased — 마음마을 cartoon redesign (2026-10-09)

- Whole-app kid-first visual redesign: bright picture-book palette, puppy guide (마음이) speech bubbles on every question and feedback, a companion character chosen on first run (하루 · 소라 · 미나 · 준, changeable in Settings), village-map Home with four landmarks and a star counter, "잘했어요!" ribbon and "오늘의 배움" card on feedback/wrap-up, cartoon emotion faces on every emotion card.
- 33 new illustrations generated with the Codex CLI (`pnpm art:generate` / `pnpm art:build`, see docs/ILLUSTRATIONS.md); the four situation scenes were re-illustrated in the same style. Legacy image sets stay on disk but leave the offline precache.
- Lesson wording, emotion ids, option order, feedback and narration are unchanged. New utility strings (place names, character names, banner text) await client review.
- Tests: unit suite updated for the recap numbering and companion setting; e2e start-gate, a11y and home specs cover the character pick and the village map.

## Unreleased — 자기 인식 design-document features

- Feedback step on phones: the outcome icon moves up beside the "내가 고른 방법" label, so the chosen method text keeps the card width (259px instead of 175px at 375px) and no longer breaks into cramped lines.
- Natural Korean narration: 128 recorded clips (ElevenLabs voice "Kyung", generated once and shipped offline in `public/audio/ko/`) replace the browser voice; browser synthesis remains only as a fallback.

- STEP titles from the design document appear under the progress track (e.g. "그 때 나의 몸의 반응은?").
- The situation picture shows the document's scene-card speech bubbles; "속상해" is emphasised as in the source; the picture description is the card caption.
- STEP 3 body-reaction explorer: press each documented feeling to see its body reaction highlighted on the body outline.
- STEP 4/5 coping exploration: the child can try every coping method; the ending lists all methods tried.
- New optional content fields and validator rules; 11 new unit/screen tests; happy-path e2e updated for explore mode.

### 관계 인식

- Document step titles, the document's own playground illustration, and exact quote spacing from the md transcription.
- STEP 3 reason comparison: my reason first, then other feelings' reasons under "나와 너의 생각이 다를 수 있어!".
- STEP 4/5 action comparison; the ending keeps only the ways worth repeating.

### 관계 관리

- Document step titles and exact quote spacing from the md transcription.
- Several feelings can be chosen for the friend, as the document permits.
- STEP 3 key feedback appears after the child chooses a reason.

### 마음건강관리

- Document step titles and exact quote spacing from the md transcription.
- STEP 3 reason comparison (no heading, as the document provides none that fits).
- STEP 4/5: try every way to express feelings or ask for help; the ending lists them.

## 1.0.0 — 2026-10-03

First versioned release of 마음잇다 (Maum:Link), a Korean social-emotional learning app.

### Included

- Four illustrated scenarios following 상황 → 감정 → 생각 → 행동 → 피드백, with a personal learning recap.
- A cream and blueberry storybook design, linked-heart characters, illustrated story shelf, contextual questions and expressive choices.
- Compact lesson navigation, smaller default typography, a separate large-text setting and completion badges at the top right.
- Voice on/off controls, automatic narration, Korean voice loading and fallback, playback status and an 음성 확인 control in Settings.
- Keyboard navigation, focus management, reduced-motion support, large touch targets and responsive layouts.
- Local progress and lesson recovery, bundled artwork and fonts, and an installable offline-first PWA. No accounts, backend or analytics.

### Release checks

- 85 unit, component and integration tests pass.
- Lint, content validation, TypeScript and production/PWA build pass.
- Four scenarios validate; 18 existing draft lesson strings remain marked for content-team approval.

### Known limitations

- The reported silent automatic Korean narration on Mac Chrome has not been verified as resolved on a real device. This release includes playback recovery and diagnostics; an enabled voice icon does not establish audible output.
- Browser rendering, responsive viewport checks, accessibility scans, offline behavior and real-device acceptance need revalidation for the current design. This environment cannot start the preview server or connect to Chrome; historical browser results and screenshots do not certify this release.
- Content-team approval of the 18 draft lesson strings and generated illustrations remains pending.
- A pushed release does not confirm that the Vercel deployment is live; production deployment must be checked separately.
