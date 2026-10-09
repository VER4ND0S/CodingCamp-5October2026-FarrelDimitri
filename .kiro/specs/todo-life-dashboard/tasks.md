# Implementation Plan: Todo Life Dashboard

## Overview

Build a zero-dependency, single-page dashboard that runs entirely in the browser as a local `file://` HTML page. Implementation proceeds in ten phases: scaffold → clock/greeting → display name → storage → timer → tasks → links → theme → layout/polish → final verification. Each phase produces working, integrated code before the next phase begins.

Files:
- `index.html` — single HTML entry point
- `css/styles.css` — all styles, design tokens, dark-mode overrides
- `js/app.js` — all application logic

---

## Tasks

- [x] 1. Project scaffold — HTML structure, CSS tokens, JS skeleton
  - [x] 1.1 Create `index.html` with semantic skeleton
    - Create the file at the workspace root
    - Add `<!DOCTYPE html>`, `<html lang="en" data-theme="light">`, `<head>`, `<body>`
    - Add `<link rel="stylesheet" href="css/styles.css" />` and `<script src="js/app.js"></script>`
    - Add `<header id="header-card" class="card">`, `<main class="main-grid">`, `<footer>` with `<section id="links-card" class="card">` as structural placeholders
    - Add flash-prevention inline `<script>` inside `<head>` that reads `localStorage.getItem('theme')` and sets `data-theme="dark"` on `<html>` before first paint
    - Add `<div id="error-toast" class="error-toast" aria-live="assertive" hidden></div>` inside `<body>`
    - _Requirements: 12.3, 12.5, 11.4_

  - [x] 1.2 Create `css/styles.css` with design tokens and base layout
    - Create `css/` directory and `css/styles.css`
    - Declare all CSS custom properties on `:root` — `--bg-gradient`, `--card-bg`, `--text-primary`, `--text-secondary`, `--accent-color`, `--accent-hover`, `--danger-color`, `--danger-hover`, `--neutral-btn`, `--neutral-btn-text`, `--border-color`, `--card-shadow`, `--card-radius`
    - Add `[data-theme="dark"]` block with dark-mode token overrides
    - Add base reset (`box-sizing`, `margin`, `padding`, font-family sans-serif, minimum 14px)
    - Add `body` rule with `--bg-gradient` as background, `min-height: 100vh`
    - Add `.card` rule: `background: var(--card-bg)`, `border-radius: var(--card-radius)`, `box-shadow: var(--card-shadow)`, padding
    - Add `.error-toast` rule (fixed position, hidden by default)
    - _Requirements: 12.5, 13.4, 13.5, 13.6, 11.6, 11.7_

  - [x] 1.3 Create `js/app.js` with module skeleton and `DOMContentLoaded` boot sequence
    - Create `js/` directory and `js/app.js`
    - Declare module-scoped sections as IIFE-style comment blocks: `storage`, `clock`, `greeting`, `displayName`, `timer`, `tasks`, `links`, `theme`
    - Add `document.addEventListener('DOMContentLoaded', () => { /* init calls here */ })` at the bottom
    - _Requirements: 12.2_

- [ ] 2. Clock and greeting widgets (Requirements 1 and 2)
  - [ ] 2.1 Implement `storage` module — `loadFromStorage` and `saveToStorage`
    - Write `loadFromStorage(key)`: wraps `localStorage.getItem` + `JSON.parse` in try/catch; returns parsed value or `null` on any error
    - Write `saveToStorage(key, value)`: wraps `localStorage.setItem(key, JSON.stringify(value))` in try/catch; on error calls `showToast()` with a descriptive message
    - Write `showToast(message)`: sets `#error-toast` text, removes `hidden`, auto-hides after 4 000 ms via `setTimeout`
    - _Requirements: 12.1, 12.6_

  - [ ]* 2.2 Write property test for storage round-trip (P14)
    - **Property 14: Storage Round-Trip** — for any serializable value `v`, `saveToStorage(key, v)` then `loadFromStorage(key)` returns a deeply equal value
    - **Validates: Requirements 12.1, 5.6, 6.2, 9.2, 11.3**
    - Use fast-check: `fc.oneof(fc.array(fc.anything()), fc.string(), fc.integer())` as the arbitrary
    - File: `tests/property/storage.prop.test.js`

  - [ ] 2.3 Implement `clock` module — `formatTime`, `formatDate`, `tick`, `init`
    - Write `formatTime(date)`: returns `"HH:MM:SS"` using zero-padded `getHours`, `getMinutes`, `getSeconds`
    - Write `formatDate(date)`: returns full locale string in the format `"Monday, July 14, 2025"` using `toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })`
    - Write `tick()`: creates `new Date()`, writes to `#clock` and `#date`
    - Write `init()`: calls `tick()` immediately, starts `setInterval(tick, 1000)`, adds `visibilitychange` listener that calls `tick()` when `document.visibilityState === 'visible'`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.4 Write property tests for clock format (P1, P2)
    - **Property 1: Time Format Correctness** — `formatTime(date)` always returns a string matching `/^\d{2}:\d{2}:\d{2}$/` with HH 00–23, MM 00–59, SS 00–59
    - **Property 2: Date Format Completeness** — `formatDate(date)` always contains a full weekday name, full month name, numeric day, and four-digit year
    - **Validates: Requirements 1.1, 1.2**
    - File: `tests/property/clock.prop.test.js`

  - [ ] 2.5 Implement `greeting` module — `getPrefix`, `formatGreeting`, `render`, `init`
    - Write `getPrefix(hour)`: returns `"Good morning"` for `[5,12)`, `"Good afternoon"` for `[12,17)`, `"Good evening"` for `[17,21)`, `"Good night"` for `[0,5)` and `[21,24)`
    - Write `formatGreeting(prefix, name)`: returns `"${prefix}, ${name}!"`
    - Write `render(name)`: reads the module-level cached prefix, calls `formatGreeting`, writes to `#greeting`
    - Write `init()`: computes and caches prefix from `new Date().getHours()`, calls `render(displayName.getEffectiveName())`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 2.6 Write property tests for greeting (P3, P4)
    - **Property 3: Greeting Prefix Mapping** — `getPrefix(hour)` returns the correct string for every integer in `[0, 24)` with no other return value
    - **Property 4: Greeting Format String** — `formatGreeting(p, n)` always returns `"${p}, ${n}!"` exactly
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
    - Use `fc.integer({ min: 0, max: 23 })` for hour; `fc.string({ minLength: 1 })` for prefix/name
    - File: `tests/property/greeting.prop.test.js`

  - [ ] 2.7 Add clock and greeting HTML markup to `index.html` header card and call `clock.init()` + `greeting.init()` from `DOMContentLoaded`
    - Add `<div id="clock">`, `<div id="date">`, `<div id="greeting">` inside `<header id="header-card">`
    - Add `clock.init()` and `greeting.init()` to the boot sequence
    - _Requirements: 1.1, 1.2, 2.5, 13.1_

- [ ] 3. Checkpoint — clock and greeting working
  - Ensure clock ticks every second, date shows correct format, greeting reflects time of day. Ask the user if questions arise.

- [ ] 4. Custom display name (Requirement 3 — Challenge)
  - [ ] 4.1 Add name editor HTML markup to `index.html` header card
    - Add inside `<header>`: `<input id="name-input" type="text" maxlength="50">`, `<button id="name-save-btn">Save</button>`, `<span id="name-error" class="field-error" hidden>`, `<span id="name-confirm" class="field-confirm" hidden>`
    - _Requirements: 3.1_

  - [ ] 4.2 Implement `displayName` module — `save`, `load`, `getEffectiveName`, `init`
    - Write `load()`: returns `loadFromStorage('displayName')` or `null`
    - Write `getEffectiveName()`: returns loaded name or `"Friend"`
    - Write `save(rawValue)`: trims input; if empty/whitespace → `removeItem('displayName')`, revert greeting to "Friend"; if trimmed length > 50 → show `#name-error`, return; else → `saveToStorage('displayName', trimmed)`, update greeting, show `#name-confirm` for 2 s
    - Write `init()`: calls `load()`, pre-fills `#name-input` with stored value (or leaves empty), calls `greeting.render(getEffectiveName())`
    - Wire `#name-save-btn` click and `#name-input` keydown Enter to `save()`
    - Wire `#name-input` input event to clear `#name-error` and `#name-confirm`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 4.3 Write property test for display name round-trip (P5)
    - **Property 5: Display Name Round-Trip Persistence** — for any string `s` where `s.trim().length` is in `[1, 50]`, `save(s)` then `load()` returns `s.trim()`
    - **Validates: Requirements 3.2, 3.4**
    - Mock `localStorage` with a `Map`-backed stub
    - File: `tests/property/displayName.prop.test.js`

- [ ] 5. Focus timer (Requirements 4, 5 — includes Challenge)
  - [ ] 5.1 Add timer HTML markup to `index.html` and wire DOM references in `timer` module
    - Add `<section id="timer-card" class="card">` inside `<main>` with: `<div id="timer-display">25:00</div>`, `<div id="timer-complete" hidden>⏰ Time's up!</div>`, `<label>`+`<input id="duration-input" type="number" min="1" max="180" value="25">`, `<span id="duration-error" class="field-error" hidden>`, buttons `#timer-start`, `#timer-stop`, `#timer-reset`
    - _Requirements: 4.1, 5.1, 13.2_

  - [ ] 5.2 Implement `timer` core — `formatTimer`, `timerState`, `init`, `tick`
    - Declare `timerState = { duration: 25, remaining: 1500, intervalId: null, isRunning: false }`
    - Write `formatTimer(seconds)`: returns `"MM:SS"` zero-padded
    - Write `init()`: reads `loadFromStorage('pomodoroDuration')`; if valid integer in `[1,180]` use it, else default 25; set `timerState.duration` and `timerState.remaining`; update `#timer-display`
    - Write `tick()`: decrements `timerState.remaining`; updates `#timer-display`; if `remaining === 0` → call `stop()`, un-hide `#timer-complete`
    - _Requirements: 4.1, 4.5, 5.7, 5.8_

  - [ ] 5.3 Implement `timer.start`, `timer.stop`, `timer.reset`
    - Write `start()`: no-op if `isRunning`; set `isRunning = true`; hide `#timer-complete`; start `setInterval(tick, 1000)`; store handle in `timerState.intervalId`
    - Write `stop()`: `clearInterval(timerState.intervalId)`; set `isRunning = false`
    - Write `reset()`: call `stop()`; restore `remaining` to `duration * 60`; update `#timer-display`; hide `#timer-complete`
    - Wire button clicks: `#timer-start` → `timer.start()`, `#timer-stop` → `timer.stop()`, `#timer-reset` → `timer.reset()`
    - _Requirements: 4.2, 4.3, 4.4, 4.6_

  - [ ]* 5.4 Write property tests for timer (P6, P7)
    - **Property 6: Timer Monotonic Decrease** — each `tick()` call decrements `remaining` by exactly 1 and never below 0
    - **Property 7: Timer Start Idempotence** — calling `start()` when `isRunning === true` leaves all `timerState` fields unchanged
    - **Validates: Requirements 4.2, 4.4, 4.5, 4.6**
    - Mock `setInterval`/`clearInterval` with no-op stubs
    - File: `tests/property/timer.prop.test.js`

  - [ ] 5.5 Implement `timer.setDuration` and wire duration input events
    - Write `setDuration(min)`: parse input as integer; if not integer or outside `[1,180]` → show `#duration-error`, return; if `isRunning` → call `stop()`; update `timerState.duration` and `remaining`; update `#timer-display`; hide `#duration-error`; call `saveToStorage('pomodoroDuration', min)`
    - Wire `#duration-input` `change` and `blur` events to `setDuration(Number(e.target.value))`
    - Wire `#duration-input` `input` event to clear `#duration-error`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 5.6 Write property test for duration validation (P8)
    - **Property 8: Duration Validation** — `validateDuration(v)` (or inline guard in `setDuration`) returns error for any non-integer or value outside `[1, 180]`, and succeeds for all integers in `[1, 180]`
    - **Validates: Requirements 5.5**
    - Use `fc.integer()` and `fc.float()` with boundary exploration
    - File: `tests/property/timer.prop.test.js` (append to same file)

- [ ] 6. Checkpoint — timer working end-to-end
  - Start, stop, reset, and duration change all work; `pomodoroDuration` persists in localStorage after refresh. Ask the user if questions arise.

- [ ] 7. To-do list — add, display, complete, delete, edit (Requirements 6, 7, 8)
  - [ ] 7.1 Add tasks HTML markup to `index.html` and task CSS
    - Add `<section id="tasks-card" class="card">` inside `<main>` with: `<input id="task-input" type="text" maxlength="100">`, `<button id="task-add-btn">Add</button>`, `<span id="task-error" class="field-error" hidden>`, `<ul id="task-list" aria-label="Task list">`
    - Add CSS for `.task-item`, `.task-checkbox`, `.task-text`, `.strikethrough`, `.edit-btn`, `.delete-btn`, `.task-edit-input`, edit-mode layout
    - _Requirements: 6.1, 6.7, 13.2_

  - [ ] 7.2 Implement `tasks.validateTaskText`, `tasks.add`, `tasks.saveTasks`, `tasks.init`
    - Write `validateTaskText(raw)`: trims; if empty → error "Task cannot be empty"; if trimmed length > 100 → error "Task exceeds 100 characters"; else return trimmed text
    - Write `add(rawText)`: calls `validateTaskText`; on error show `#task-error`, return; on success push `{ id: Date.now(), text: trimmed, completed: false }`, call `saveTasks()`, call `render()`
    - Write `saveTasks()`: `saveToStorage('tasks', tasks)` in try/catch
    - Write `init()`: `tasks = loadFromStorage('tasks') || []`; call `render()`
    - Wire `#task-add-btn` click and `#task-input` keydown Enter to `add()`
    - Wire `#task-input` input event to clear `#task-error`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8_

  - [ ]* 7.3 Write property tests for task validation and addition (P9, P10)
    - **Property 9: Task Text Validation** — empty/whitespace input returns error; input where `trim().length > 100` returns error; input where `trim().length ∈ [1,100]` succeeds and returns trimmed string
    - **Property 10: Task Addition Grows List** — after `add(s)` with valid `s`, list length is `n+1` and last element has `text === s.trim()` and `completed === false`
    - **Validates: Requirements 6.3, 6.4, 6.2**
    - File: `tests/property/tasks.prop.test.js`

  - [ ] 7.4 Implement `tasks.render`, `tasks.renderTaskItem`, and event delegation
    - Write `renderTaskItem(task)`: creates `<li data-id>` with checkbox (checked when completed), `<span class="task-text">` (add strikethrough class when completed), edit button `✏️`, delete button `🗑`; returns element
    - Write `render()`: clears `#task-list`; if `tasks.length === 0` show `<li class="empty-placeholder">No tasks yet</li>`; else `tasks.forEach(t => list.appendChild(renderTaskItem(t)))`
    - Add click event delegation on `#task-list`: `.delete-btn` → `deleteTask(id)`, `.task-checkbox` → `toggle(id)`, `.edit-btn` → `enterEditMode(id)`, `.save-edit-btn` → `confirmEdit(id)`, `.cancel-edit-btn` → `cancelEdit(id)`
    - _Requirements: 6.7, 7.2, 7.5_

  - [ ]* 7.5 Write property test for task render completeness (P11)
    - **Property 11: Task Render Completeness** — `renderTaskItem(task)` always produces a DOM element containing a checkbox, text label with `task.text`, edit button, delete button; when `completed === true` the text label carries the strikethrough class
    - **Validates: Requirements 6.7, 7.2**
    - File: `tests/property/tasks.prop.test.js` (append)

  - [ ] 7.6 Implement `tasks.toggle`, `tasks.deleteTask`, and persistence
    - Write `toggle(id)`: find task by id, flip `completed`, call `saveTasks()`, call `render()`
    - Write `deleteTask(id)`: filter out task with matching id, call `saveTasks()`, call `render()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

  - [ ]* 7.7 Write property tests for toggle round-trip and deletion (P12, P13)
    - **Property 12: Task Completion Toggle Round-Trip** — calling `toggle(id)` twice returns task to original `completed` state
    - **Property 13: List Item Deletion** — after `deleteTask(id)` no element with that id remains; all other elements are unchanged
    - **Validates: Requirements 7.1, 7.3, 7.4**
    - File: `tests/property/tasks.prop.test.js` (append)

  - [ ] 7.8 Implement task edit mode — `enterEditMode`, `confirmEdit`, `cancelEdit`
    - Write `enterEditMode(id)`: find `<li data-id>`, replace `<span>` with `<input class="task-edit-input" value="currentText">`, replace edit+delete buttons with Save/Cancel buttons; add `editing` class; focus the input; add `keydown` listener for Enter (confirm) and Escape (cancel)
    - Write `confirmEdit(id)`: read input value, call `validateTaskText`; if empty → cancel (restore original); if valid → update `tasks[i].text`, call `saveTasks()`, call `render()`
    - Write `cancelEdit(id)`: call `render()` to restore original state
    - Wire `dblclick` on `#task-list` to `enterEditMode` for `.task-text` targets
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 8. Checkpoint — tasks working end-to-end
  - Add, complete, delete, and edit tasks all work; task list persists after refresh; edit mode Enter/Escape/Cancel all behave correctly. Ask the user if questions arise.

- [ ] 9. Quick links — add, display, open, remove (Requirements 9, 10)
  - [ ] 9.1 Add links HTML markup to `index.html` and links CSS
    - Add inside `<section id="links-card">`: `<input id="link-name-input" type="text" maxlength="100">`, `<input id="link-url-input" type="url">`, `<button id="link-add-btn">Add Link</button>`, `<span id="link-error" class="field-error" hidden>`, `<div id="links-list" class="links-list" aria-label="Quick links">`
    - Add CSS for `.link-item`, `.link-btn`, `.remove-link-btn`
    - _Requirements: 9.1, 13.3_

  - [ ] 9.2 Implement `links.validateLink`, `links.add`, `links.saveLinks`, `links.init`
    - Write `validateLink(name, url)`: name must be non-empty after trim and ≤ 100 chars; url must begin with `http://` or `https://`; returns descriptive error string or null on success
    - Write `add(name, url)`: call `validateLink`; on error show `#link-error`, return; on success push `{ id: Date.now(), name: name.trim(), url }`, call `saveLinks()`, call `render()`, clear inputs
    - Write `saveLinks()`: `saveToStorage('quickLinks', links)` in try/catch
    - Write `init()`: `links = loadFromStorage('quickLinks') || []`; call `render()`
    - Wire `#link-add-btn` click to `add()`, wire inputs `input` event to clear `#link-error`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7_

  - [ ]* 9.3 Write property test for link URL validation (P16)
    - **Property 16: Link URL Validation** — `validateLink(name, url)` rejects any url not starting with `"http://"` or `"https://"`; accepts any url starting with either prefix when name is non-empty
    - **Validates: Requirements 9.3, 9.4**
    - File: `tests/property/links.prop.test.js`

  - [ ] 9.4 Implement `links.renderLinkItem`, `links.removeLink`, `links.render`, and event delegation
    - Write `renderLinkItem(link)`: creates `<div class="link-item" data-id>` containing `<a href target="_blank" rel="noopener noreferrer" class="btn btn-primary link-btn">` and `<button class="remove-link-btn" aria-label="Remove link">×</button>`; returns element
    - Write `render()`: clears `#links-list`; if empty show placeholder; else `links.forEach(l => container.appendChild(renderLinkItem(l)))`
    - Write `removeLink(id)`: filter out matching id, call `saveLinks()`, call `render()`
    - Add click event delegation on `#links-list`: `.remove-link-btn` → `removeLink(id)`
    - _Requirements: 9.6, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 9.5 Write property test for list item deletion on links (P13 — links)
    - **Property 13: List Item Deletion (links)** — after `removeLink(id)`, no element with that id remains and all other elements are unchanged
    - **Validates: Requirements 10.2**
    - File: `tests/property/links.prop.test.js` (append)

- [ ] 10. Light / dark mode toggle (Requirement 11 — Challenge)
  - [ ] 10.1 Add theme toggle button HTML to `index.html`
    - Add `<button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">🌙</button>` as first child of `<body>` (fixed position via CSS)
    - _Requirements: 11.1_

  - [ ] 10.2 Implement `theme` module — `apply`, `toggle`, `init`
    - Write `apply(theme)`: sets `document.documentElement.setAttribute('data-theme', theme)`; updates `#theme-toggle` icon (`🌙` for light, `☀️` for dark)
    - Write `toggle()`: reads current `data-theme`; flips to opposite; calls `saveToStorage('theme', newTheme)`; calls `apply(newTheme)`
    - Write `init()`: reads `loadFromStorage('theme')` or defaults to `'light'`; calls `apply(theme)`
    - Wire `#theme-toggle` click to `toggle()`
    - Call `theme.init()` early in boot sequence (before other `init()` calls)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 10.3 Write property test for theme toggle parity (P15)
    - **Property 15: Theme Toggle Parity** — after toggling `n` times from initial theme `t₀`, active theme equals `t₀` if `n` is even, opposite if `n` is odd
    - **Validates: Requirements 11.1, 11.3**
    - File: `tests/property/theme.prop.test.js`

  - [ ] 10.4 Add dark-mode CSS overrides to `css/styles.css`
    - Ensure `[data-theme="dark"]` overrides cover: all `.card` elements, inputs, buttons (primary, neutral, danger), `#clock`, `#date`, `#greeting`, `#timer-display`, task items, link items, error toast, field-error spans
    - Verify text-to-background contrast ≥ 4.5:1 for `--text-primary` on `--card-bg` in dark mode
    - _Requirements: 11.6, 11.7, 13.6_

- [ ] 11. Checkpoint — theme toggle working
  - Toggle switches between light and dark correctly; theme persists after refresh; no flash of incorrect theme on load. Ask the user if questions arise.

- [ ] 12. Responsive layout and visual polish (Requirement 13)
  - [ ] 12.1 Implement CSS Grid two-column layout for main row and responsive breakpoint
    - Add `.main-grid` rule: `display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;`
    - Add `@media (max-width: 768px)` block: `.main-grid { grid-template-columns: 1fr; }` to stack timer and tasks vertically
    - _Requirements: 13.2, 13.7_

  - [ ] 12.2 Apply full visual polish — typography, buttons, spacing, card styles
    - Set `#clock` font-size to `3.5rem`, font-weight bold
    - Set `#date` font-size to `1rem`, color `var(--text-secondary)`
    - Set `#greeting` font-size to `1.5rem`, font-weight bold
    - Set `.card-title` font-size to `1.25rem`, font-weight 600
    - Style `.btn.btn-primary` with `background: var(--accent-color)`, white text, hover → `var(--accent-hover)`
    - Style `.btn.btn-danger` with `background: var(--danger-color)`, white text, hover → `var(--danger-hover)`
    - Style `.btn.btn-neutral` with `background: var(--neutral-btn)`, color `var(--neutral-btn-text)`
    - Add consistent padding and margin across header, main, footer sections
    - Style name editor, duration row, and add-row inputs to flex layout
    - Add `.field-error` style (red text, small font) and `.field-confirm` style (green text)
    - _Requirements: 13.1, 13.3, 13.4, 13.5, 13.6_

- [ ] 13. Final verification
  - Verify `clock.init()`, `greeting.init()`, `displayName.init()`, `timer.init()`, `tasks.init()`, `links.init()`, `theme.init()` are all called in `DOMContentLoaded` in correct order (theme first)
  - Verify light/dark mode persists after browser refresh
  - Verify custom display name persists after refresh and appears in greeting
  - Verify `pomodoroDuration` persists — timer initializes to saved value after refresh
  - Verify all task operations (add, complete, delete, edit) persist correctly in `tasks` key
  - Verify quick links (add, open in new tab, remove) persist in `quickLinks` key
  - Verify no JavaScript console errors on fresh load in Chrome, Firefox, and Edge
  - Verify responsive layout: at viewport width < 768px all cards stack into a single column
  - Verify the `file://` protocol constraint — open `index.html` directly from disk and confirm all localStorage operations succeed

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- The design uses Vanilla JS with no bundler — all functions must be accessible from within `app.js`'s module scope via the `DOMContentLoaded` closure; no ES module `import`/`export` is needed
- Property-based tests require fast-check loaded via CDN or npm in a separate test harness; the app itself has zero runtime dependencies
- Each property test file must include a comment referencing the design property number: `// Feature: todo-life-dashboard, Property N: Title`
- All five localStorage keys are fixed: `tasks`, `quickLinks`, `displayName`, `pomodoroDuration`, `theme`
- Checkpoints ensure each phase is stable before proceeding; never leave unreachable or unintegrated code

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.3", "2.5"] },
    { "id": 2, "tasks": ["2.2", "2.4", "2.6", "2.7"] },
    { "id": 3, "tasks": ["4.1", "5.1", "7.1", "9.1", "10.1"] },
    { "id": 4, "tasks": ["4.2", "5.2", "7.2", "9.2", "10.2"] },
    { "id": 5, "tasks": ["4.3", "5.3", "7.4", "9.4", "10.3"] },
    { "id": 6, "tasks": ["5.4", "5.5", "7.3", "7.6", "9.3", "10.4"] },
    { "id": 7, "tasks": ["5.6", "7.5", "7.8", "9.5"] },
    { "id": 8, "tasks": ["7.7", "12.1"] },
    { "id": 9, "tasks": ["12.2"] }
  ]
}
```
