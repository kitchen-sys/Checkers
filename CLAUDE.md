# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Constitution Checkers is a gamified educational SPA that combines checkers gameplay with U.S. Constitution trivia. Players earn XP from correct quiz answers, unlock skill tree abilities, and use them to gain advantages in the checkers game.

## Tech Stack

Vanilla JavaScript (ES6+), HTML5, CSS3 with custom properties. No build tools, no bundler, no package manager, no external dependencies (only Google Fonts loaded via CSS). Open `constitution-checkers/index.html` directly in a browser to run.

## Architecture

All code lives under `constitution-checkers/`. Script load order in `index.html` matters — each file depends on the ones before it:

1. **`js/questions.js`** — `QUESTION_BANK` array (50+ questions by Article, difficulty 1-3) and `QuestionEngine` class (selection, stats tracking, streak logic). To add questions, push objects with `{id, article, difficulty, question, choices[], correct, explanation}`.

2. **`js/checkers-engine.js`** — `CheckersEngine` class. Board state (8×8 array of piece constants `EMPTY/PLAYER/PLAYER_KING/AI/AI_KING`), move generation with mandatory jump rule, multi-jump chains, kinging. AI uses minimax with alpha-beta pruning (depth 3-7, adaptive). Also exposes bonus mechanics (`recoverPiece`, `forceKing`, `removeEnemyPiece`, `grantBonusMove`) used as quiz rewards.

3. **`js/skill-tree.js`** — `SKILL_NODES` array (6 nodes across 4 tiers with prerequisite chains), XP constants, and localStorage persistence layer (`loadProgress`/`saveProgress`/`resetProgress`). Save format is versioned with migration support.

4. **`js/app.js`** — Main controller IIFE. Manages four screens (menu, game, tree, mastery), wires together the engine/questions/skills, handles the animation overlay system, question timer (50s intervals), and all DOM rendering. Board renders via full innerHTML rebuild; piece animations use fixed-position overlay elements that slide over the instant re-render.

**`css/styles.css`** — "Cyberpunk 1776" dark theme with neon accents. Uses CSS custom properties (`--neon-gold`, `--neon-blue`, etc.). Responsive: single column on mobile, two-column grid at 900px+.

## Key Patterns

- **Animation system** (in `app.js`): `animatePieceMove()` snapshots piece types before `executeMove()`, calls `renderBoard()` for instant state update, then overlays a fixed-position clone that slides from source to destination. Capture bursts, particle effects, and kinging ceremonies layer on top. The `animating` flag gates all player input during animations.
- **Quiz-game integration**: Every ~50 seconds a question modal pauses gameplay. Correct → bonus move or piece recovery + XP. Wrong → AI gets a bonus move (animated via `doBonusAIMoveAnimated()`).
- **Persistence**: All progress in `localStorage` under key `constitution_checkers_save`. Schema has a `version` field for forward migration.
