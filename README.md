# 🏰 LexRise — SAT English RPG

A gamified SAT English preparation app for rising high school students.
Master Vocabulary, Grammar, and Reading Comprehension through daily quests,
XP progression, spaced repetition, and weekly boss battles.

**Live app:** `https://harikun77.github.io/LexRise/`

---

## 🚀 Deploy to GitHub Pages (one-time setup)

### Step 1 — Push to GitHub

```bash
cd /Users/harikumar/Documents/ClaudeCode_LocalProjects/lexrise

git init
git add .
git commit -m "LexRise v1 — SAT English RPG"
git remote add origin https://github.com/harikun77/LexRise.git
git branch -M main
git push -u origin main
```

### Step 2 — Enable GitHub Actions permissions

1. Go to your repo on **github.com**
2. Click **Settings** → **Actions** → **General**
3. Under **Workflow permissions** → select **"Read and write permissions"**
4. Click **Save**

### Step 3 — Enable GitHub Pages

1. In the same repo, go to **Settings** → **Pages**
2. Under **Source** → select **"Deploy from a branch"**
3. Under **Branch** → select **`gh-pages`** / **`/ (root)`**
4. Click **Save**

### Step 4 — Trigger the first deploy

Push any change to `main` (or just re-push):

```bash
git commit --allow-empty -m "trigger deploy"
git push
```

GitHub Actions will automatically:
- Install dependencies
- Build the app with `VITE_BASE_PATH=/lexrise/`
- Deploy `dist/` to the `gh-pages` branch

### Step 5 — Open the app

After the Actions workflow finishes (~1 min), open:

```
https://harikun77.github.io/LexRise/
```

Every subsequent `git push origin main` triggers a new deploy automatically.

---

## 📱 Install as iPhone/Android App (PWA)

Once deployed, open the URL in **Safari on iPhone**:

1. Tap the **Share** button ⎙
2. Scroll down and tap **"Add to Home Screen"** ➕
3. Tap **Add**

LexRise will appear on the home screen as a full-screen app.

---

## 💾 Backing Up Progress

iOS Safari may clear data after 7 days of inactivity.

**Back up regularly:**
1. Open LexRise → **Progress** tab → **Save Management**
2. Tap **"Download Save File"** — save the `.json` to iCloud Drive
3. To restore: tap **"Restore from File"** and select the saved file

---

## 🛠 Local Development

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # production build
npm run preview    # preview the production build locally
```

---

## 📁 Project Structure

```
lexrise/
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service worker (offline cache)
│   ├── favicon.svg
│   ├── icon-192.svg
│   ├── icon-512.svg
│   └── apple-touch-icon.svg
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx        # Home screen + daily quests
│   │   ├── VocabForge.jsx       # Vocabulary practice (SM-2)
│   │   ├── GrammarDojo.jsx      # Grammar challenges
│   │   ├── ReadingCitadel.jsx   # SAT reading comprehension
│   │   ├── BossBattle.jsx       # Weekly timed challenge
│   │   ├── ProgressView.jsx     # Stats + save management
│   │   ├── GameHeader.jsx       # Sticky nav header
│   │   ├── Overlays.jsx         # XP popups, level-up modal
│   │   └── InstallBanner.jsx    # PWA install prompt
│   ├── data/
│   │   ├── index.js             # Master question bank import
│   │   ├── vocab/               # 230 vocab words (3 tiers)
│   │   ├── grammar/             # 137 grammar questions (5 domains)
│   │   ├── reading/             # 15 SAT passages, 57 questions
│   │   ├── bossBattles.js       # 20 boss battle questions
│   │   └── quests.js            # Daily quest templates
│   ├── hooks/
│   │   └── useGameState.js      # All game state + persistence
│   └── utils/
│       └── sm2.js               # Spaced repetition algorithm
└── .github/
    └── workflows/
        └── deploy.yml           # Auto-deploy to GitHub Pages
```

---

## ➕ Adding New Content

**Add vocab words** → `src/data/vocab/tier3_sat.js`
```js
{ id: 't3v081', word: 'Ephemeral', definition: '...', example: '...',
  options: ['...','...','...','...'], answer: 0, tier: 3, xp: 25 }
```

**Add grammar questions** → `src/data/grammar/usage.js`
```js
{ id: 'guse026', sentence: '...', question: '...', options: [...],
  answer: 1, explanation: '...', tier: 2, xp: 15, domain: 'usage' }
```

**Add a reading passage** → `src/data/reading/tier2_passages.js`
```js
{ id: 'rp2_006', title: '...', tier: 2, passage: `...`,
  questions: [{ id: 'rp2_006q1', type: 'main_idea', question: '...',
    options: [...], answer: 0, explanation: '...', xp: 15 }] }
```

> ⚠️ **Never rename or reuse existing IDs.** Progress is tracked by ID.
> Always append new entries — never modify existing ones.

---

## 🗺 Roadmap

- [ ] Rhetoric Guild (tone, purpose, argument structure)
- [ ] Writing Arena (sentence clarity, transitions)
- [ ] Streak shields
- [ ] Supabase backend (cross-device sync, leaderboard)
- [ ] React Native mobile app
