# Job Search Dashboard — Interactive (SRE / DevOps / Cloud / Apigee)

A lightweight, framework-free dashboard to search jobs across top portals with role toggles, filters, and utilities.

## Features
- Role toggles: **SRE**, **DevOps**, **Cloud**, **Apigee** (Observability merged into SRE/DevOps/Cloud)
- Filters: location, recency (24h/week/month), quick chips (Remote, Sponsorship, etc.), extra keywords
- Copy query buttons, "Open selected" portals, Dark mode
- Collapsible filter bar, floating toolbar, subtle animations
- No build step; just static files (ideal for GitHub Pages)

## Run Locally
Just open `index.html` in your browser. No server needed.

## Deploy on GitHub Pages
1. Upload this folder to your repo root.
2. Settings → Pages → Deploy from a branch → Branch: `main` (root).
3. Your site will be live at: `https://<username>.github.io/<repo>/`.

## Customize
- Add filters to the query logic in `assets/js/main.js`
- Edit styles in `assets/css/style.css`
