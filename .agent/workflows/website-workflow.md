---
description: Workflow for local development and GitHub Pages deployment of the OnlyTime app
---

# OnlyTime Development & Deployment Workflow

OnlyTime is a client-side Vite + React app that runs entirely in the browser.

## 1. Local Development
Run the dev server:
```bash
npm run dev
```

## 2. Adding Legal Pages
Legal pages (Imprint, Privacy) are implemented as internal React components in `src/screens/`.
- [ImprintScreen.tsx](file:///c:/Users/Prueg/SofDev/Only-Time/src/screens/ImprintScreen.tsx)
- [PrivacyScreen.tsx](file:///c:/Users/Prueg/SofDev/Only-Time/src/screens/PrivacyScreen.tsx)

To update them, edit the TSX directly. There is no separate i18n system for legal pages in this MVP.

## 3. GitHub Pages Deployment
Deployment is automated via GitHub Actions.

- **Workflow**: [.github/workflows/deploy.yml](file:///c:/Users/Prueg/SofDev/Only-Time/.github/workflows/deploy.yml)
- **Base Path**: The app is configured to run at `/only-time/` in [vite.config.ts](file:///c:/Users/Prueg/SofDev/Only-Time/vite.config.ts).
- **Repo**: `SwissInnovationStudios/only-time`

### Deployment Steps:
1. **Secret anlegen**: Da in ein externes Repo (`SwissInnovationStudios/only-time`) gepusht wird, musst du in deinem **privaten** Repo unter *Settings -> Secrets and variables -> Actions* ein Secret namens `GHP_TOKEN` anlegen. Der Wert muss dein Personal Access Token (PAT) sein.
2. Push changes to the `main` branch of your **private** repo.
3. GitHub Actions will automatically:
   - Install dependencies.
   - Build the project (`npm run build`).
   - Deploy the `dist` folder directly into the `main` branch of the public `only-time` repo.
4. Ensure GitHub Pages is enabled in the **public** repo settings and set to deploy from the `main` branch.

## 4. Verification
Before pushing:
- Run `npm run build` locally to ensure no build errors.
- Check the footer links in the dev server.
