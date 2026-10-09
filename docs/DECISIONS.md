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
- **Home is a village map.** The four learning areas are landmarks (우리 집 · 운동장 · 우리 교실 · 마음쉼터 with the domain name beneath) on a generated map background. The scenario title stays in the button's accessible name and (on tablets and up) under the place name, so tests and screen readers still find the lesson by its story title. Completed areas show a "완료" badge and the star counter at the top counts finished lessons; neither is tied to the answers given.
- **Feedback banner.** A `recommended` idea gets "잘했어요!"; `acceptable` and `reconsider` ideas both get the same gentle "다른 방법도 생각해볼까요?" (from the reference board), never a negative marker. The authored feedback sentence is unchanged and is still the content; the banner is chrome.
- **Contrast.** Button text is 20 px bold (large text), so white on the orange `#ea580c` passes 3:1; body text stays ≥ 4.5:1 on every tint. Axe runs on every screen in `tests/e2e/a11y.spec.ts`.
- **New utility strings** (`place.*`, `character.*`, `guide.name`, `home.stars`, `feedback.great`, `feedback.rethink`, `wrapup.lesson`) are proposed copy for client review, like the other UI strings; no lesson text was added or edited.
- **Removed.** `HeartFriends`, `DomainArt`, `SpeechBubble` (unused after the redesign). The brand wordmark SVGs are unchanged.
