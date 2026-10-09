# Todo Life Dashboard

A clean, all-in-one productivity dashboard built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies, no build step.

🔗 **Live Demo:** `https://<your-github-username>.github.io/CodingCamp-5October2026-FarrelDimitri/`

---

## Features

- **Live Clock** — real-time HH:MM:SS display with full date
- **Time-aware Greeting** — good morning / afternoon / evening / night based on your local time
- **Display Name** — personalize the greeting, saved across sessions
- **Focus Timer** — configurable Pomodoro-style countdown (1–180 minutes)
- **Tasks** — add, complete, edit (double-click), and delete tasks
- **Quick Links** — save your most-visited URLs as clickable bookmarks
- **Dark / Light Theme** — toggle with one click, persisted automatically

All data is stored locally in your browser via `localStorage` — nothing is sent to any server.

---

## Getting Started

No installation needed. Just open `index.html` in a browser, or visit the live demo link above.

```
git clone https://github.com/<your-github-username>/CodingCamp-5October2026-FarrelDimitri.git
cd CodingCamp-5October2026-FarrelDimitri
# open index.html in your browser
```

---

## Project Structure

```
├── index.html          # Main entry point
├── css/
│   └── style.css       # All styles (CSS custom properties + dark mode)
├── js/
│   └── app.js          # All feature modules (clock, timer, tasks, links)
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions — auto-deploy to GitHub Pages
```

---

## Deployment

This repo uses GitHub Actions to automatically deploy to GitHub Pages on every push to `main`.

To enable it on your fork:
1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` — the workflow handles the rest

---

## Tech Stack

- HTML5
- CSS3 (custom properties, CSS Grid, Flexbox)
- Vanilla JavaScript (ES5-compatible, IIFE modules)
- `localStorage` for persistence

---

## Author

**Farrel Dimitri** — CodingCamp, October 2026
