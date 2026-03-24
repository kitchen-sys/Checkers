# Constitution Checkers

**Learn the U.S. Constitution by playing checkers against an adaptive AI.**

Constitution Checkers is a single-page web game that fuses classic checkers with trivia about the U.S. Constitution. Every ~50 seconds a multiple-choice question interrupts play — answer correctly to earn bonus moves and recover captured pieces, answer wrong and the AI gets an extra turn. XP from correct answers feeds a skill tree of abilities themed after constitutional powers: veto AI moves with *Judicial Review*, reverse a wrong answer with *Amendment Power*, or instantly king a piece with *Executive Order*.

> **Zero dependencies.** No build step, no framework, no package manager. Open `index.html` in any modern browser.

---

## Quick Start

```bash
git clone https://github.com/kitchen-sys/Checkers.git
cd Checkers/constitution-checkers
# Open index.html in your browser — that's it
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

No server required. All progress saves to `localStorage`.

---

## Gameplay

| Your Turn | AI Turn |
|:---------:|:-------:|
| Move teal pieces diagonally forward | AI plays via minimax with alpha-beta pruning |
| Jump over red pieces to capture (mandatory) | Depth adapts to your skill tree progress (3–7) |
| Multi-jumps are forced — a gold ring highlights the piece | Occasional random blunders at lower depths |
| Reach row 0 to become a King (moves in all directions) | Kings for AI work the same way |

### Questions & Rewards

Every ~50 seconds, a **Constitutional Challenge** pauses the board:

- **Correct** — bonus move or piece recovery + 15 XP (+ streak bonuses)
- **Wrong** — the AI gets a bonus move (unless you have a shield or amendment)

### Streak Combos

Consecutive correct answers trigger escalating milestone rewards:

| Streak | Name | Reward |
|:------:|------|--------|
| 3 | Liberty Bell | Recover a captured piece |
| 5 | Continental Congress | Remove a random enemy piece |
| 7 | We The People | King your most-advanced piece |

Milestones repeat every 7 (streak 10 triggers Liberty Bell again, etc.).

---

## Skill Tree

Earn XP from questions and game outcomes. Spend it to unlock abilities across 4 tiers:

```
            [Scholar's Insight]         Tier 1 — 40 XP
               /           \
   [Constitutional    [Judicial            Tier 2 — 75/100 XP
      Shield]          Review]
        |                 |
   [Amendment        [Executive            Tier 3 — 150 XP each
     Power]           Order]
               \     /
          [Founding Vision]              Tier 4 — 200 XP
```

| Ability | Type | Effect |
|---------|------|--------|
| Scholar's Insight | Passive | Reveals which Article the question covers |
| Constitutional Shield | Active (1/game) | Blocks one wrong-answer penalty |
| Judicial Review | Active (1/game) | Vetoes the AI's last move — forces a different one |
| Amendment Power | Active (1/game) | Retroactively changes a wrong answer to correct |
| Executive Order | Active (1/game) | Instantly promotes one piece to King |
| Founding Vision | Passive | Previews the first question at game start (no answers shown) |

---

## Question Bank

47 questions covering the full Constitution:

| Section | Questions | Topics |
|---------|:---------:|--------|
| Preamble | 5 | Popular sovereignty, goals of the Constitution |
| Article I | 12 | Congress, bicameralism, powers, Elastic Clause |
| Article II | 9 | Presidency, Electoral College, veto, treaties |
| Article III | 6 | Supreme Court, judicial review, lifetime tenure |
| Article IV | 4 | Full Faith and Credit, new states, republican government |
| Article V | 4 | Amendment process, supermajority requirements |
| Article VI | 3 | Supremacy Clause, no religious test |
| Article VII | 4 | Ratification, Federalists vs Anti-Federalists |

Each question is tagged with a difficulty level (1 = recall, 2 = understanding, 3 = application). Difficulty scales with skill tree progress.

**Adding questions:** push a new object to `QUESTION_BANK` in `js/questions.js`:

```js
{
  id: "a1-13",
  article: "Article I",
  difficulty: 2,
  question: "Your question here?",
  choices: ["A", "B", "C", "D"],
  correct: 0,          // 0-indexed
  explanation: "Why A is correct."
}
```

---

## Architecture

```
constitution-checkers/
├── index.html              Entry point — 4 screen containers + script tags
├── css/
│   └── styles.css          "Cyberpunk 1776" theme — dark bg, neon accents
└── js/
    ├── questions.js         QUESTION_BANK array + QuestionEngine class
    ├── checkers-engine.js   Board state, move gen, minimax AI, bonus mechanics
    ├── skill-tree.js        SKILL_NODES, XP constants, localStorage persistence
    └── app.js               Main controller — UI, animations, game loop
```

**Load order matters.** Each script depends on the ones before it in `index.html`.

### Key Design Decisions

- **Full DOM rebuild per render** — `renderBoard()` wipes and rebuilds the 64-cell grid. Piece animations use a fixed-position overlay layer that masks the instant re-render (250ms player / 350ms AI slide transitions).
- **Engine is pure state** — `CheckersEngine` has no DOM awareness. `app.js` orchestrates between engine state and UI.
- **Persistence is versioned** — save format has a `version` field. `loadProgress()` migrates old schemas forward.
- **AI difficulty is implicit** — minimax depth (3–7) scales with skill tree unlocks. No explicit difficulty selector.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Vanilla JavaScript (ES6+) |
| Styling | CSS3 custom properties, no preprocessor |
| Fonts | Cinzel, EB Garamond, JetBrains Mono (Google Fonts) |
| AI | Minimax with alpha-beta pruning |
| Storage | localStorage (JSON, versioned) |
| Build | None — static files, no bundling |
| Dependencies | None |

---

## License

This project does not currently include a license. All rights reserved by default.
