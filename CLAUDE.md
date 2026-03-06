# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 14 party games platform hosting 10 digital board/card games. Each game displays questions loaded from CSV files and manages state via local storage. Deployed on Vercel.

## Commands

```bash
npm run dev      # Development server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
npm run tsc      # TypeScript type check (no emit)
```

No test framework is configured.

## Tech Stack

- **Next.js 14.2.3** with App Router, React 18, TypeScript 5 (strict mode)
- **Tailwind CSS** + **Material UI (@mui/material)** for styling
- **Firebase** (configured but lightly used in current games)
- **Sentry** for error tracking, **Vercel Analytics** for usage metrics
- **csvtojson** for loading question data from CSV files

## Architecture

### Game Pattern

Every game follows the same two-component structure:

1. **`src/app/[game]/page.tsx`** — Async server component that reads `data/questions.csv` via `csvtojson` and passes questions as props
2. **`src/app/[game]/Main.tsx`** — `"use client"` component containing all game logic, UI, and state management
3. **`src/app/[game]/Constants.ts`** — Exports `GAME_NAME`, `GAME_PATH`, `GAME_ICON_PATH`
4. **`src/app/[game]/data/questions.csv`** — Question database (columns: `category`, `word`, optionally `options`)

All pages use `export const dynamic = "force-dynamic"`.

### Shared Code

- **`src/app/global/Data.ts`** — Game registry array used by the home page grid
- **`src/app/global/Types.ts`** — `Question` and `MainProps` interfaces
- **`src/app/global/Utils.ts`** — `usePopRandomQuestion` hook (random non-repeating question selection with local storage persistence) and `shuffle` utility
- **`src/app/hooks/useLocalStorage.ts`** — Typed local storage hook used by all games for session persistence
- **`src/app/components/`** — Shared UI: `Navbar`, `BigButton`, `Rules`, `Modal`, `CircularTimer`, `Footer`, etc.
- **`src/app/utils/Dedup*.ts`** — Per-game deduplication logic for question selection

### State Management

All game state is persisted in `localStorage` keyed by game path (e.g., `herd-mentalityz.questions`, `herd-mentalityz.currentQuestion`). Questions are popped randomly from a shrinking pool and reset when exhausted.

## Adding a New Game

1. Create `src/app/[gamename]/` with `page.tsx`, `Main.tsx`, `Constants.ts`
2. Add `data/questions.csv` in that directory
3. Add game icon to `public/[gamename]/icon.png`
4. Insert entry at the **beginning** of the `games` array in `src/app/global/Data.ts`

## Games

caution-signz, mandaminaz, insiderz, tapplez, wavelengthz, herd-mentalityz, just-onez, fake-artistz, poetryz, monikerz, subjectivez
