# Illustration provenance

The teal/ivory redesign also replaces the displayed playground image with a matching illustration. The original remains intact. Its new paths are `public/img/generated/social-playground-v2.png`, `social-playground-v2-800.webp` and `social-playground-v2-1600.webp` in the same directory. Created with the built-in image-generation tool; inspected for the separate observer, three playing classmates, calm expressions and absence of embedded text.

**2026-10-04:** the lesson again shows the design document's inserted illustration (`public/img/social-playground.png`); the v2 file is kept but unused.

## Playground redesign prompt

Use case: illustration-story. Landscape 16:10 picture-book educational illustration for Maum:Link, a calm Korean social-emotional learning app. Korean elementary school playground at recess. A nine-year-old child in a muted purple shirt stands a little apart on the left, watching three classmates playing together with a ball on the right, wanting to join but not yet invited. Keep all four children fully within the central 80 percent so they remain visible in a 4:3 center crop. Include the observer's face in three-quarter view, subtle hesitant expression, no tears. The playing children have small friendly smiles, not exaggerated cartoon faces. Do not show exclusion or deliberate bullying. Style: refined hand-painted children's picture book, soft pencil outlines, delicate gouache texture on warm ivory paper, natural child proportions, muted sage green, buttery yellow, dusty pink and powder blue. Friendly daylight, rounded simple shapes, readable hands and faces, sparse school building and tree in background. No text, lettering, speech balloons, signage, badges, borders, UI, scores or exaggerated expressions. Single full-canvas scene, not collage.

Generated with the built-in image-generation tool on 2026-10-03; no runtime image service. The client originals are preserved. New assets are provisional illustrations for content-team review, not commissioned final art. The classroom presentation image replaces the displayed source slide; the original remains in public/img and content-source.

Assets are in `public/img/generated/`: each base name has an 800px PNG fallback and 800/1600px WebP sources. Optimized with the project's Sharp dependency. They are included in the PWA precache.

## Final prompts

### relation-pencil-prank

Use case: illustration-story. Create a finished landscape 16:10 educational story illustration for Maum:Link, a calm Korean social-emotional learning app. Elementary Korean classroom at break time. Two Korean children aged 9–10 near a pale wooden school desk: one quietly holds the other child's pencil behind their back, while that friend looks for the missing pencil on the desk, subtly unhappy, not laughing. The hidden pencil must be visible to the viewer. Calm neutral expressions, no malicious grin. One clear readable scene. Style: refined hand-painted children's picture book, soft pencil outlines, delicate gouache texture on warm ivory paper, natural child proportions, muted sage green, buttery yellow, dusty pink and powder blue. Friendly daylight, rounded simple shapes, readable hands and faces, generous quiet space. Frame all important action within the central 80% to survive responsive cropping. No text, lettering, speech balloons, signage, badges, borders, UI, scores, tears, exaggerated expressions or judgmental symbols. This is a single full-canvas illustration, not a collage.

### mind-lunch-line

Use case: illustration-story. Create a finished landscape 16:10 educational story illustration for Maum:Link, a calm Korean social-emotional learning app. Korean elementary school lunchroom. Children aged 9–10 queue toward a serving counter. One child is stepping sideways into the line ahead of another child. The child immediately behind pauses, uncertain what to say. Show the interrupted queue clearly through spacing and poses. Trays, simple school lunch counter, very spare background. Calm subtle expressions, no malicious grin. One clear readable scene. Style: refined hand-painted children's picture book, soft pencil outlines, delicate gouache texture on warm ivory paper, natural child proportions, muted sage green, buttery yellow, dusty pink and powder blue. Friendly daylight, rounded simple shapes, readable hands and faces, generous quiet space. Frame all important action within the central 80% to survive responsive cropping. No text, lettering, speech balloons, signage, badges, borders, UI, scores, tears, exaggerated expressions or judgmental symbols. This is a single full-canvas illustration, not a collage.

### self-presentation-teasing-v2

Use case: illustration-story. Landscape 16:10 picture-book educational illustration for Maum:Link, a calm Korean social-emotional learning app. A Korean elementary school classroom. A nine-year-old girl stands at the front holding her presentation paper with both hands, looking shy and a little uneasy. Two classmates at their desks behind her quietly laugh and whisper to each other about her presentation. Subtle recognizable expressions, no tears, no exaggerated laughing, no pointing or villain faces. All main action in central 80% of frame. Soft pencil outlines, refined hand-painted gouache, warm ivory paper texture, muted sage green, buttery yellow, dusty pink, powder blue. Natural child proportions. Friendly daylight, spare uncluttered background. Single scene. No text, letters, speech balloons, numbers, signage, borders, UI or scores.

## Review

Inspected all three generated outputs. Pencil is visibly hidden, lunch queue is interrupted, presentation classmates whisper while the presenter appears uneasy. No UI text, tears, or failure markers. Illustration briefs and all lesson strings are unchanged. The original playground scene is preserved as a source asset; the later teal/ivory redesign displays the new matching playground illustration described above.

## 2026-10-03 — 현재 삽화 검토

사용자의 체크리스트 후속 작업 요청에 따라 현재 네 PNG를 다시 확인했다. 연필 장면은 숨긴 연필과 찾는 친구가 보이고, 운동장 장면은 떨어진 관찰자와 함께 노는 세 아이가 보인다. 발표 장면은 발표자와 웃으며 이야기하는 두 친구가 보인다. 급식실 장면은 줄 사이로 들어오는 아이를 보여주지만 새치기라는 의미는 원문 이야기와 함께 전달된다. 포함된 UI 글자나 정오답 표시가 없다.

현재 앱에서 계속 사용할 수 있다는 개발 검토 판단이며 원문 작성자·교육 전문가 승인 또는 아동 대상 이해도 검증은 아니다. 최신 사용 지시에 따라 한국어 학습 문구는 PDF 원문으로 복원했고 기존 삽화는 유지했다. 앞선 “문구 변경 없음”은 당시 변경의 기록이다.

## 2026-10-09 — Cartoon set (v3) generated with the Codex CLI

All pictures the redesigned screens show live in `public/img/v3` and were generated once from `content-source/art/manifest.json` with `pnpm art:generate` (Codex CLI `codex exec` + its built-in image tool, 1024–1536 px, transparent PNG for sprites) and converted with `pnpm art:build` (Sharp). Raw renders land in `content-source/art/raw` (gitignored, about 39 MB; regenerate with `pnpm art:generate`); style references (the two client boards and a first boy + puppy render) are in `content-source/art/refs` and are attached to every generation so the set stays consistent.

| Group | Files | Used on |
|---|---|---|
| Companions | `char-haru`, `char-sora`, `char-mina`, `char-jun` | Start, character pick, Home greeting, wrap-up |
| Guide (마음이) | `guide-wave`, `guide-point`, `guide-think`, `guide-cheer`, `celebrate` | Every question bubble, hint, feedback, wrap-up |
| Village | `bg-village`, `place-self`, `place-social`, `place-relation`, `place-mind` (scene vignettes; the earlier generic buildings were replaced on 2026-10-09 at the user's request) | Start background, Home map |
| Faces | `face-<emotion id>` × 15 | Emotion cards, chosen-feeling chip, explorers, recap |
| Scenes | `scene-self-presentation-teasing`, `scene-social-playground`, `scene-relation-pencil-prank`, `scene-mind-lunch-line` | Situation screen and the small scene peek on later steps |

Prompts are the manifest entries plus the shared `style` sentence; they ask for no text, no tears in scenes, no villain faces, and keep the action inside the central 80 %. The speech-bubble positions for the presentation scene were re-tuned to the new picture (`situation.bubbles`).

Review (developer, 2026-10-09): every scene matches its brief — the presentation classmates whisper behind the presenter, the playground shows the observer apart from three players, the hidden pencil is visible behind the prankster's back, the lunch queue is visibly cut in front of the main character. Faces are distinct and readable at 72 px. No embedded text or right/wrong symbols. As with earlier sets, these are provisional illustrations for the content team's pedagogical review, not commissioned final art. To regenerate one item: `pnpm art:generate --only face-shy --force && pnpm art:build`.
