// ============================================================
// CONSTITUTION CHECKERS — Main App Controller
// Ties together: Engine, Questions, Skill Tree, UI
// ============================================================

(function () {
  "use strict";

  // ── STATE ──────────────────────────────────────────────────
  let engine = null;
  let questionEngine = null;
  let progress = null;
  let activeAbilities = {};
  let questionTimer = null;
  let questionInterval = 50; // seconds
  let timeUntilQuestion = 50;
  let timerPaused = false;
  let currentScreen = "menu"; // menu | game | tree
  let pendingAmendment = null; // For amendment power ability
  let gameXPEarned = 0;
  let gameQuestionsCorrect = 0;
  let gameQuestionsWrong = 0;
  let lastMove = null;
  let animating = false;
  let preAIMoveSnapshot = null; // Engine clone from before last AI move
  let lastAIMove = null;        // The move the AI chose (for judicial review veto)
  let foundingVisionQuestion = null; // Previewed question for founding vision

  // ── INIT ───────────────────────────────────────────────────
  function init() {
    progress = loadProgress();
    renderMenu();
    showScreen("menu");
  }

  // ── SCREEN MANAGEMENT ─────────────────────────────────────
  function showScreen(name) {
    currentScreen = name;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById(`screen-${name}`);
    if (el) el.classList.add("active");
  }

  // ── MENU SCREEN ────────────────────────────────────────────
  function renderMenu() {
    const el = document.getElementById("screen-menu");
    const winRate = progress.gamesPlayed > 0
      ? Math.round((progress.gamesWon / progress.gamesPlayed) * 100)
      : 0;
    el.innerHTML = `
      <div class="menu-screen">
        <div>
          <div class="menu-title">Constitution<br>Checkers</div>
          <div class="menu-subtitle">Learn the Articles ◆ Master the Board</div>
        </div>
        <div class="menu-stats">
          <span>XP: <span class="ms-value">${progress.xp}</span></span>
          <span>Games: <span class="ms-value">${progress.gamesPlayed}</span></span>
          <span>Wins: <span class="ms-value">${progress.gamesWon}</span></span>
          <span>Win Rate: <span class="ms-value">${winRate}%</span></span>
        </div>
        <button class="menu-btn" id="btn-play">Begin Session</button>
        <button class="menu-btn secondary" id="btn-tree">Skill Tree</button>
        <button class="menu-btn secondary" id="btn-mastery">Article Mastery</button>
        <button class="menu-btn danger" id="btn-reset">Reset All Progress</button>
      </div>
    `;
    document.getElementById("btn-play").onclick = startGame;
    document.getElementById("btn-tree").onclick = () => { renderSkillTree(); showScreen("tree"); };
    document.getElementById("btn-mastery").onclick = () => { renderMastery(); showScreen("mastery"); };
    document.getElementById("btn-reset").onclick = () => {
      if (confirm("Reset ALL progress? XP, skill tree, and stats will be wiped.")) {
        progress = resetProgress();
        renderMenu();
      }
    };
  }

  // ── START GAME ─────────────────────────────────────────────
  function startGame() {
    engine = new CheckersEngine();
    questionEngine = new QuestionEngine();
    activeAbilities = getActiveAbilities(progress);
    engine.setDifficulty(progress.unlockedNodes.length);
    gameXPEarned = 0;
    gameQuestionsCorrect = 0;
    gameQuestionsWrong = 0;
    lastMove = null;
    pendingAmendment = null;
    pendingStreakEffect = null;
    preAIMoveSnapshot = null;
    lastAIMove = null;
    foundingVisionQuestion = null;

    renderGameUI();
    showScreen("game");
    renderBoard();
    renderSidebar();
    startQuestionTimer();
    showFoundingVisionPreview();
  }

  // ── GAME UI SCAFFOLD ───────────────────────────────────────
  function renderGameUI() {
    const el = document.getElementById("screen-game");
    el.innerHTML = `
      <div class="app-container">
        <div class="app-header">
          <h1>Constitution Checkers</h1>
          <div class="subtitle">Knowledge is Power ◆ Power is Victory</div>
        </div>
        <div class="stats-bar" id="stats-bar"></div>
        <div class="game-layout">
          <div class="board-container">
            <div class="turn-indicator player-turn" id="turn-indicator">Your Move</div>
            <div class="checkerboard" id="board"></div>
            <div class="timer-bar-container">
              <div class="timer-bar-fill" id="timer-bar" style="width: 100%"></div>
            </div>
            <div class="abilities-bar" id="abilities-bar"></div>
          </div>
          <div class="sidebar" id="sidebar"></div>
        </div>
      </div>
    `;
  }

  // ── STREAK MILESTONES ────────────────────────────────────
  const STREAK_MILESTONES = [
    { at: 3, name: "Liberty Bell", icon: "\uD83D\uDD14", action: "recover" },
    { at: 5, name: "Continental Congress", icon: "\u2696", action: "removeEnemy" },
    { at: 7, name: "We The People", icon: "\uD83D\uDCDC", action: "kingAdvanced" },
  ];
  let pendingStreakEffect = null; // { action, position } — applied on Continue

  function checkStreakMilestone(streak) {
    if (streak < 3) return null;
    const cyclePos = streak % 7;
    return STREAK_MILESTONES.find(m => m.at % 7 === cyclePos) || null;
  }

  function findMostAdvancedPiece() {
    let best = null;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (engine.board[r][c] === PLAYER)
          if (!best || r < best[0]) best = [r, c];
    return best;
  }

  function applyStreakReward(milestone) {
    pendingStreakEffect = null;
    switch (milestone.action) {
      case "recover":
        if (engine.capturedByAI === 0) return null;
        const pos = engine.recoverPiece();
        if (pos) {
          pendingStreakEffect = { action: "recover", position: pos };
          return "Recovered a piece!";
        }
        return null;
      case "removeEnemy":
        const removed = engine.removeEnemyPiece();
        if (removed) {
          pendingStreakEffect = { action: "removeEnemy", position: removed };
          if (engine.getPieceCount(AI) === 0) {
            engine.gameOver = true;
            engine.winner = PLAYER;
          }
          return "Removed an enemy piece!";
        }
        return null;
      case "kingAdvanced":
        const target = findMostAdvancedPiece();
        if (target) {
          engine.forceKing(target[0], target[1]);
          pendingStreakEffect = { action: "kingAdvanced", position: target };
          return "Promoted a piece to King!";
        }
        return null;
    }
    return null;
  }

  function showStreakBanner(milestone) {
    const banner = document.createElement("div");
    banner.className = "streak-banner";
    banner.innerHTML = `
      <span class="streak-icon">${milestone.icon}</span>
      <span class="streak-name">${milestone.name}</span>
      <span class="streak-label">STREAK \u00D7${questionEngine.stats.streak}</span>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 2200);
  }

  function playStreakEffect() {
    if (!pendingStreakEffect) return;
    const m = getBoardMetrics();
    if (!m) return;
    const [r, c] = pendingStreakEffect.position;

    switch (pendingStreakEffect.action) {
      case "recover": {
        const cells = document.querySelectorAll("#board .cell");
        const cell = cells[r * 8 + c];
        const piece = cell && cell.querySelector(".piece");
        if (piece) piece.classList.add("recover-glow");
        break;
      }
      case "removeEnemy":
        burstCapture(AI, m, r, c);
        break;
      case "kingAdvanced":
        crownCeremony(m, r, c);
        break;
    }
    pendingStreakEffect = null;
  }

  // ── ANIMATION SYSTEM ──────────────────────────────────────
  const ANIM_PLAYER_MS = 250;
  const ANIM_AI_MS = 350;
  const ANIM_JUMP_GAP = 150;

  function getBoardMetrics() {
    const b = document.getElementById("board");
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { rect: r, cell: r.width / 8 };
  }

  function cellXY(m, row, col) {
    return {
      x: m.rect.left + (col + 0.5) * m.cell,
      y: m.rect.top  + (row + 0.5) * m.cell
    };
  }

  function mkOverlay(type, m, row, col) {
    const c = cellXY(m, row, col);
    const sz = m.cell * 0.72;
    const el = document.createElement("div");
    const pl = type === PLAYER || type === PLAYER_KING;
    const kg = type === PLAYER_KING || type === AI_KING;
    el.className = `piece anim-piece ${pl ? "player-piece" : "ai-piece"}${kg ? " king" : ""}`;
    Object.assign(el.style, {
      position: "fixed", width: sz + "px", height: sz + "px",
      left: (c.x - sz / 2) + "px", top: (c.y - sz / 2) + "px",
      zIndex: "500", pointerEvents: "none", margin: "0", transition: "none"
    });
    document.body.appendChild(el);
    return el;
  }

  function slideOverlay(el, m, row, col, ms) {
    return new Promise(resolve => {
      const c = cellXY(m, row, col);
      const sz = parseFloat(el.style.width);
      void el.offsetHeight;
      el.style.transition = `left ${ms}ms cubic-bezier(.23,1,.32,1), top ${ms}ms cubic-bezier(.23,1,.32,1)`;
      el.style.left = (c.x - sz / 2) + "px";
      el.style.top = (c.y - sz / 2) + "px";
      setTimeout(() => { el.remove(); resolve(); }, ms);
    });
  }

  function burstCapture(type, m, row, col) {
    const c = cellXY(m, row, col);
    const sz = m.cell * 0.72;
    const pl = type === PLAYER || type === PLAYER_KING;

    const ghost = mkOverlay(type, m, row, col);
    ghost.classList.add("capture-burst");
    setTimeout(() => ghost.remove(), 450);

    const ring = document.createElement("div");
    ring.className = `capture-ring ${pl ? "player-ring" : "ai-ring"}`;
    Object.assign(ring.style, {
      position: "fixed", width: sz + "px", height: sz + "px",
      left: (c.x - sz / 2) + "px", top: (c.y - sz / 2) + "px",
      zIndex: "499", pointerEvents: "none"
    });
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 500);

    const color = pl ? "var(--neon-blue)" : "var(--neon-red)";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const d = sz * 0.8 + Math.random() * sz * 0.5;
      const p = document.createElement("div");
      p.className = "capture-particle";
      p.style.cssText = `left:${c.x}px;top:${c.y}px;background:${color};--tx:${Math.cos(a)*d}px;--ty:${Math.sin(a)*d}px;`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  function crownCeremony(m, row, col) {
    const c = cellXY(m, row, col);
    const sz = m.cell * 0.72;

    const glow = document.createElement("div");
    glow.className = "king-glow";
    Object.assign(glow.style, {
      position: "fixed", width: sz + "px", height: sz + "px",
      left: (c.x - sz / 2) + "px", top: (c.y - sz / 2) + "px",
      zIndex: "599", pointerEvents: "none"
    });
    document.body.appendChild(glow);
    setTimeout(() => glow.remove(), 650);

    const crown = document.createElement("div");
    crown.className = "king-ceremony";
    crown.textContent = "\u265B";
    Object.assign(crown.style, {
      position: "fixed", left: c.x + "px", top: (c.y - m.cell * 0.5) + "px", zIndex: "600"
    });
    document.body.appendChild(crown);
    setTimeout(() => crown.remove(), 750);
  }

  async function animatePieceMove(move, pieceType, capturedType, becameKing, ms) {
    const m = getBoardMetrics();
    if (!m) return;
    animating = true;

    // Hide real piece at destination, animate overlay from source
    const cells = document.querySelectorAll("#board .cell");
    const dest = cells[move.to[0] * 8 + move.to[1]];
    const realPiece = dest && dest.querySelector(".piece");
    if (realPiece) realPiece.style.visibility = "hidden";

    const overlay = mkOverlay(pieceType, m, move.from[0], move.from[1]);

    if (move.captured && capturedType != null) {
      setTimeout(() => burstCapture(capturedType, m, move.captured[0], move.captured[1]), ms * 0.35);
    }

    await slideOverlay(overlay, m, move.to[0], move.to[1], ms);
    if (realPiece) realPiece.style.visibility = "";

    if (becameKing) {
      crownCeremony(m, move.to[0], move.to[1]);
      await new Promise(r => setTimeout(r, 450));
    }

    animating = false;
  }

  function doBonusAIMoveAnimated() {
    setTimeout(async () => {
      if (engine.gameOver) return;
      preAIMoveSnapshot = null; // Don't allow veto on penalty moves
      lastAIMove = null;
      const move = engine.getAIMove();
      if (move) {
        const pt = engine.board[move.from[0]][move.from[1]];
        const ct = move.captured ? engine.board[move.captured[0]][move.captured[1]] : null;
        engine.executeMove(move);
        lastMove = { from: move.from, to: move.to };
        const nt = engine.board[move.to[0]][move.to[1]];
        const kinged = !engine.isKing(pt) && engine.isKing(nt);
        renderBoard();
        const boardEl = document.getElementById("board");
        if (boardEl) boardEl.classList.add("shake");
        setTimeout(() => boardEl && boardEl.classList.remove("shake"), 400);
        await animatePieceMove(move, pt, ct, kinged, ANIM_AI_MS);
      }
      renderBoard();
      if (engine.gameOver) endGame();
    }, 1500);
  }

  // ── RENDER BOARD ───────────────────────────────────────────
  function renderBoard() {
    const boardEl = document.getElementById("board");
    if (!boardEl) return;
    boardEl.innerHTML = "";

    const playerMoves = engine.currentTurn === PLAYER ? (() => {
      if (engine.multiJumpPiece) {
        return engine.getJumpsForPiece(engine.multiJumpPiece[0], engine.multiJumpPiece[1]);
      }
      return engine.getAllMoves(PLAYER).moves;
    })() : [];

    const movablePieces = new Set(playerMoves.map(m => `${m.from[0]},${m.from[1]}`));

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement("div");
        cell.className = `cell ${(r + c) % 2 === 0 ? "light" : "dark"}`;
        cell.dataset.row = r;
        cell.dataset.col = c;

        if (lastMove) {
          if ((r === lastMove.to[0] && c === lastMove.to[1]) ||
              (r === lastMove.from[0] && c === lastMove.from[1])) {
            cell.classList.add("last-move");
          }
        }

        const piece = engine.board[r][c];
        if (piece !== EMPTY) {
          const pieceEl = document.createElement("div");
          const isPlayer = engine.isPlayerPiece(piece);
          pieceEl.className = `piece ${isPlayer ? "player-piece" : "ai-piece"}`;
          if (engine.isKing(piece)) pieceEl.classList.add("king");

          if (isPlayer && engine.currentTurn === PLAYER && movablePieces.has(`${r},${c}`)) {
            pieceEl.classList.add("selectable");
            pieceEl.onclick = (e) => { e.stopPropagation(); selectPiece(r, c); };
          }
          cell.appendChild(pieceEl);
        }

        // Show valid moves for selected piece
        if (engine.selectedPiece) {
          const isValidTarget = engine.validMoves.some(m => m.to[0] === r && m.to[1] === c);
          if (isValidTarget) {
            const isJump = engine.validMoves.some(m => m.to[0] === r && m.to[1] === c && m.captured);
            cell.classList.add(isJump ? "valid-jump" : "valid-move");
            cell.onclick = () => makeMove(r, c);
          }
        }

        boardEl.appendChild(cell);
      }
    }

    updateStatsBar();
    updateTurnIndicator();
    renderAbilities();
  }

  // ── PIECE SELECTION / MOVES ────────────────────────────────
  function selectPiece(r, c) {
    if (engine.currentTurn !== PLAYER || engine.gameOver || timerPaused || animating) return;
    engine.selectedPiece = [r, c];
    engine.validMoves = engine.getMovesForPiece(r, c);

    // Highlight selected cell
    document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("selected"));
    const cells = document.querySelectorAll(".cell");
    const idx = r * 8 + c;
    if (cells[idx]) cells[idx].classList.add("selected");

    renderBoard();
  }

  async function makeMove(r, c) {
    if (engine.currentTurn !== PLAYER || engine.gameOver || animating) return;
    const move = engine.validMoves.find(m => m.to[0] === r && m.to[1] === c);
    if (!move) return;

    // Snapshot before execution
    const pieceType = engine.board[move.from[0]][move.from[1]];
    const capturedType = move.captured ? engine.board[move.captured[0]][move.captured[1]] : null;

    const result = engine.executeMove(move);
    lastMove = { from: move.from, to: move.to };
    engine.selectedPiece = null;
    engine.validMoves = [];
    preAIMoveSnapshot = null;
    lastAIMove = null;

    const newType = engine.board[move.to[0]][move.to[1]];
    const becameKing = !engine.isKing(pieceType) && engine.isKing(newType);

    renderBoard();
    await animatePieceMove(move, pieceType, capturedType, becameKing, ANIM_PLAYER_MS);

    if (engine.gameOver) {
      endGame();
      return;
    }

    if (result.multiJump) {
      // Player continues multi-jump
      renderBoard();
      return;
    }

    // AI turn
    if (engine.currentTurn === AI) {
      setTimeout(doAITurn, 200);
    }
  }

  async function doAITurn() {
    if (engine.gameOver || animating) return;

    const move = engine.getAIMove();
    if (!move) {
      engine.gameOver = true;
      engine.winner = PLAYER;
      endGame();
      return;
    }

    // Save state for Judicial Review (only on first move of chain)
    if (!engine.multiJumpPiece) {
      preAIMoveSnapshot = engine.clone();
      lastAIMove = move;
    }

    // Snapshot before execution (for animation)
    const pieceType = engine.board[move.from[0]][move.from[1]];
    const capturedType = move.captured ? engine.board[move.captured[0]][move.captured[1]] : null;

    const result = engine.executeMove(move);
    lastMove = { from: move.from, to: move.to };

    const newType = engine.board[move.to[0]][move.to[1]];
    const becameKing = !engine.isKing(pieceType) && engine.isKing(newType);

    renderBoard();
    await animatePieceMove(move, pieceType, capturedType, becameKing, ANIM_AI_MS);

    if (engine.gameOver) {
      endGame();
      return;
    }

    if (result.multiJump) {
      // AI continues multi-jump
      setTimeout(doAITurn, ANIM_JUMP_GAP);
      return;
    }

    renderBoard();
  }

  // ── STATS BAR ──────────────────────────────────────────────
  function updateStatsBar() {
    const el = document.getElementById("stats-bar");
    if (!el) return;
    el.innerHTML = `
      <div class="stat-chip">
        <span class="label">You</span>
        <span class="value blue">${engine.getPieceCount(PLAYER)}</span>
      </div>
      <div class="stat-chip">
        <span class="label">AI</span>
        <span class="value red">${engine.getPieceCount(AI)}</span>
      </div>
      <div class="stat-chip">
        <span class="label">XP</span>
        <span class="value">${progress.xp}</span>
      </div>
      <div class="stat-chip">
        <span class="label">Correct</span>
        <span class="value green">${gameQuestionsCorrect}</span>
      </div>
      <div class="stat-chip${(questionEngine && questionEngine.stats.streak >= 3) ? ' streak-active' : ''}">
        <span class="label">Streak</span>
        <span class="value">${questionEngine ? questionEngine.stats.streak : 0}</span>
      </div>
    `;
  }

  function updateTurnIndicator() {
    const el = document.getElementById("turn-indicator");
    if (!el) return;
    if (engine.currentTurn === PLAYER) {
      el.textContent = engine.multiJumpPiece ? "Continue Jump!" : "Your Move";
      el.className = "turn-indicator player-turn";
    } else {
      el.textContent = "AI Thinking...";
      el.className = "turn-indicator ai-turn";
    }
  }

  // ── ABILITIES ──────────────────────────────────────────────
  function renderAbilities() {
    const el = document.getElementById("abilities-bar");
    if (!el) return;
    el.innerHTML = "";

    for (const [id, ability] of Object.entries(activeAbilities)) {
      if (id === "amendment_power") continue; // Used from question modal, not ability bar
      const btn = document.createElement("button");
      btn.className = "ability-btn";
      const contextDisabled = (id === "judicial_review" && !preAIMoveSnapshot);
      btn.disabled = ability.remaining <= 0 || engine.gameOver || contextDisabled;
      btn.innerHTML = `${ability.icon} ${ability.name} <span class="uses">[${ability.remaining}]</span>`;
      btn.onclick = () => useAbility(id);
      el.appendChild(btn);
    }
  }

  function useAbility(id) {
    const ability = activeAbilities[id];
    if (!ability || ability.remaining <= 0) return;

    switch (id) {
      case "constitutional_shield":
        // Passive — used automatically on wrong answer
        break;
      case "judicial_review":
        if (engine.currentTurn === PLAYER && preAIMoveSnapshot && lastAIMove) {
          ability.remaining--;

          // Restore board state from before the AI moved
          const snap = preAIMoveSnapshot;
          engine.board = snap.board.map(row => [...row]);
          engine.currentTurn = snap.currentTurn;
          engine.capturedByPlayer = snap.capturedByPlayer;
          engine.capturedByAI = snap.capturedByAI;
          engine.moveCount = snap.moveCount;
          engine.gameOver = snap.gameOver;
          engine.winner = snap.winner;
          engine.multiJumpPiece = null;
          engine.selectedPiece = null;
          engine.validMoves = [];

          // Get all AI moves, filter out the vetoed one
          const { moves: aiMoves } = engine.getAllMoves(AI);
          const vetoed = lastAIMove;
          const remaining = aiMoves.filter(m =>
            !(m.from[0] === vetoed.from[0] && m.from[1] === vetoed.from[1] &&
              m.to[0] === vetoed.to[0] && m.to[1] === vetoed.to[1])
          );

          if (remaining.length > 0) {
            const altMove = remaining[Math.floor(Math.random() * remaining.length)];
            const pt = engine.board[altMove.from[0]][altMove.from[1]];
            const ct = altMove.captured ? engine.board[altMove.captured[0]][altMove.captured[1]] : null;
            engine.executeMove(altMove);
            lastMove = { from: altMove.from, to: altMove.to };
            const nt = engine.board[altMove.to[0]][altMove.to[1]];
            const kinged = !engine.isKing(pt) && engine.isKing(nt);
            renderBoard();
            showXPPopup("JUDICIAL REVIEW!");
            animatePieceMove(altMove, pt, ct, kinged, ANIM_AI_MS);
          } else {
            // Only one legal move — AI skips turn
            engine.currentTurn = PLAYER;
            renderBoard();
            showXPPopup("JUDICIAL REVIEW \u2014 AI BLOCKED!");
          }

          preAIMoveSnapshot = null;
          lastAIMove = null;
          if (engine.gameOver) endGame();
        }
        break;
      case "executive_order":
        if (engine.currentTurn === PLAYER) {
          // King the first non-king player piece found
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (engine.board[r][c] === PLAYER) {
                engine.forceKing(r, c);
                ability.remaining--;
                showXPPopup("EXECUTIVE ORDER!");
                renderBoard();
                return;
              }
            }
          }
        }
        break;
    }
    renderAbilities();
  }

  // ── FOUNDING VISION PREVIEW ──────────────────────────────
  function showFoundingVisionPreview() {
    if (!hasNode("founding_vision", progress)) return;

    const difficulty = Math.min(3, 1 + Math.floor(progress.unlockedNodes.length / 2));
    const q = questionEngine.getQuestion(difficulty);
    foundingVisionQuestion = q;

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay founding-vision-overlay";
    overlay.innerHTML = `
      <div class="founding-vision-modal">
        <div class="fv-icon">\u2726</div>
        <div class="fv-title">Founding Vision</div>
        <div class="fv-article">${q.article}</div>
        <div class="fv-question">${q.question}</div>
        <div class="fv-hint">Your first challenge awaits...</div>
        <div class="fv-dismiss">Click anywhere to begin</div>
      </div>
    `;

    document.body.appendChild(overlay);
    const dismiss = () => {
      overlay.style.animation = "fadeOut 0.3s ease forwards";
      setTimeout(() => overlay.remove(), 300);
    };
    overlay.onclick = dismiss;
    setTimeout(dismiss, 5000);
  }

  // ── QUESTION TIMER ─────────────────────────────────────────
  function startQuestionTimer() {
    timeUntilQuestion = questionInterval;
    timerPaused = false;
    if (questionTimer) clearInterval(questionTimer);
    questionTimer = setInterval(() => {
      if (timerPaused || engine.gameOver) return;
      timeUntilQuestion--;
      updateTimerBar();
      if (timeUntilQuestion <= 0) {
        triggerQuestion();
      }
    }, 1000);
  }

  function updateTimerBar() {
    const bar = document.getElementById("timer-bar");
    if (!bar) return;
    const pct = (timeUntilQuestion / questionInterval) * 100;
    bar.style.width = pct + "%";
    bar.classList.toggle("urgent", pct < 20);
  }

  function triggerQuestion() {
    timerPaused = true;
    let q;
    if (foundingVisionQuestion) {
      q = foundingVisionQuestion;
      foundingVisionQuestion = null;
    } else {
      const difficulty = Math.min(3, 1 + Math.floor(progress.unlockedNodes.length / 2));
      q = questionEngine.getQuestion(difficulty);
    }
    showQuestionModal(q);
  }

  // ── QUESTION MODAL ─────────────────────────────────────────
  function showQuestionModal(question) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "question-overlay";

    const showArticle = hasNode("scholars_insight", progress);
    const letters = ["A", "B", "C", "D"];

    overlay.innerHTML = `
      <div class="question-modal">
        <div class="question-header">
          <span class="q-label">Constitutional Challenge</span>
          ${showArticle ? `<span class="q-article">${question.article}</span>` : ""}
        </div>
        <div class="question-body">
          <div class="question-text">${question.question}</div>
          <div class="choices-list" id="choices-list">
            ${question.choices.map((choice, i) => `
              <button class="choice-btn" data-index="${i}">
                <span class="choice-letter">${letters[i]}</span>
                <span>${choice}</span>
              </button>
            `).join("")}
          </div>
          <div id="result-area"></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Bind choices
    overlay.querySelectorAll(".choice-btn").forEach(btn => {
      btn.onclick = () => handleAnswer(question, parseInt(btn.dataset.index), overlay);
    });
  }

  function handleAnswer(question, chosenIndex, overlay) {
    const isCorrect = questionEngine.recordAnswer(question, chosenIndex);
    const buttons = overlay.querySelectorAll(".choice-btn");
    buttons.forEach(btn => {
      btn.classList.add("answered");
      btn.onclick = null;
      const idx = parseInt(btn.dataset.index);
      if (idx === question.correct) btn.classList.add("correct", "revealed-correct");
      if (idx === chosenIndex && !isCorrect) btn.classList.add("wrong");
    });

    const resultArea = overlay.querySelector("#result-area");
    let effectText = "";
    let xpGained = 0;

    if (isCorrect) {
      xpGained = XP_CORRECT_ANSWER;
      if (questionEngine.stats.streak > 2) {
        xpGained += XP_CORRECT_STREAK_BONUS * (questionEngine.stats.streak - 2);
      }
      gameQuestionsCorrect++;

      // Determine reward
      const rewards = [];
      if (engine.capturedByAI > 0) {
        rewards.push("recover");
      }
      rewards.push("bonus");

      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      if (reward === "recover" && engine.capturedByAI > 0) {
        engine.recoverPiece();
        effectText = `+${xpGained} XP ◆ Recovered a captured piece!`;
      } else {
        engine.grantBonusMove();
        effectText = `+${xpGained} XP ◆ Bonus move granted!`;
      }

      // Check streak milestone
      const milestone = checkStreakMilestone(questionEngine.stats.streak);
      if (milestone) {
        const streakResult = applyStreakReward(milestone);
        if (streakResult) {
          effectText += ` \u25C6 ${milestone.name}: ${streakResult}`;
        }
        showStreakBanner(milestone);
      }

      addXP(xpGained, progress);
      gameXPEarned += xpGained;
    } else {
      gameQuestionsWrong++;

      // Check for shield
      if (activeAbilities.constitutional_shield && activeAbilities.constitutional_shield.remaining > 0) {
        activeAbilities.constitutional_shield.remaining--;
        effectText = "Constitutional Shield activated — penalty blocked!";
      } else if (activeAbilities.amendment_power && activeAbilities.amendment_power.remaining > 0) {
        // Defer penalty — player can choose to amend
        effectText = "Wrong answer. The AI gains a bonus move... unless you Amend!";
        pendingAmendment = { question };
      } else {
        effectText = "The AI gains a bonus move!";
        doBonusAIMoveAnimated();
      }
    }

    const showAmendBtn = pendingAmendment !== null;
    resultArea.innerHTML = `
      <div class="result-display ${isCorrect ? "correct-result" : "wrong-result"}">
        <div class="result-label">${isCorrect ? "Correct!" : "Incorrect"}</div>
        <div class="result-explanation">${question.explanation}</div>
        <div class="result-effect">${effectText}</div>
        ${showAmendBtn ? `<button class="amend-btn" id="btn-amend">\u2629 Amend Answer [1]</button>` : ""}
        <button class="continue-btn" id="btn-continue">Continue</button>
      </div>
    `;

    if (showAmendBtn) {
      overlay.querySelector("#btn-amend").onclick = () => {
        activeAbilities.amendment_power.remaining--;

        // Reverse wrong stats, apply correct stats
        gameQuestionsWrong--;
        gameQuestionsCorrect++;
        questionEngine.stats.wrong--;
        questionEngine.stats.correct++;
        questionEngine.stats.streak = 1;
        const art = pendingAmendment.question.article;
        if (questionEngine.stats.byArticle[art]) {
          questionEngine.stats.byArticle[art].wrong--;
          questionEngine.stats.byArticle[art].correct++;
        }

        // Grant correct-answer reward
        const xp = XP_CORRECT_ANSWER;
        addXP(xp, progress);
        gameXPEarned += xp;
        engine.grantBonusMove();

        // Update result display
        const rd = resultArea.querySelector(".result-display");
        rd.classList.remove("wrong-result");
        rd.classList.add("correct-result", "amended-result");
        resultArea.querySelector(".result-label").textContent = "Amended!";
        resultArea.querySelector(".result-effect").textContent =
          `\u2629 Amendment Power used! +${xp} XP \u25C6 Bonus move granted!`;
        overlay.querySelector("#btn-amend").remove();

        pendingAmendment = null;
        showXPPopup("AMENDMENT POWER!");
        renderAbilities();
      };
    }

    overlay.querySelector("#btn-continue").onclick = () => {
      // If amendment was available but not used, apply penalty now
      if (pendingAmendment) {
        doBonusAIMoveAnimated();
        pendingAmendment = null;
      }
      overlay.remove();
      timerPaused = false;
      timeUntilQuestion = questionInterval;
      renderBoard();
      updateStatsBar();
      if (pendingStreakEffect) {
        setTimeout(playStreakEffect, 150);
      }
      if (engine.gameOver) endGame();
    };
  }

  // ── XP POPUP ───────────────────────────────────────────────
  function showXPPopup(text) {
    const popup = document.createElement("div");
    popup.className = "xp-popup";
    popup.textContent = text;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1600);
  }

  // ── GAME OVER ──────────────────────────────────────────────
  function endGame() {
    if (questionTimer) clearInterval(questionTimer);

    const won = engine.winner === PLAYER;
    let bonusXP = won ? XP_WIN_GAME : XP_LOSE_GAME;
    if (gameQuestionsWrong === 0 && gameQuestionsCorrect > 0) bonusXP += XP_PERFECT_GAME;
    addXP(bonusXP, progress);
    gameXPEarned += bonusXP;

    progress.gamesPlayed++;
    if (won) progress.gamesWon++;
    if (questionEngine.stats.bestStreak > progress.bestStreak) {
      progress.bestStreak = questionEngine.stats.bestStreak;
    }
    progress.totalCorrect += gameQuestionsCorrect;
    progress.totalWrong += gameQuestionsWrong;

    // Update article mastery
    for (const [article, stats] of Object.entries(questionEngine.stats.byArticle)) {
      if (!progress.articleMastery[article]) {
        progress.articleMastery[article] = { correct: 0, wrong: 0 };
      }
      progress.articleMastery[article].correct += stats.correct;
      progress.articleMastery[article].wrong += stats.wrong;
    }

    saveProgress(progress);

    // Show game over modal
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="question-modal">
        <div class="game-over-modal">
          <h2>${won ? "Victory!" : "Defeat"}</h2>
          <div class="result-text">${won
            ? "The Constitution prevails! Your knowledge carried the day."
            : "The opposition was too strong this time. Study the Articles and return."
          }</div>
          <div class="game-over-stats">
            <div class="game-over-stat">
              <div class="go-label">XP Earned</div>
              <div class="go-value">+${gameXPEarned}</div>
            </div>
            <div class="game-over-stat">
              <div class="go-label">Questions</div>
              <div class="go-value">${gameQuestionsCorrect}/${gameQuestionsCorrect + gameQuestionsWrong}</div>
            </div>
            <div class="game-over-stat">
              <div class="go-label">Best Streak</div>
              <div class="go-value">${questionEngine.stats.bestStreak}</div>
            </div>
            <div class="game-over-stat">
              <div class="go-label">AI Level</div>
              <div class="go-value">${engine.aiDepth}</div>
            </div>
          </div>
          <button class="play-again-btn" id="btn-play-again">Play Again</button>
          <br><br>
          <button class="menu-btn secondary" id="btn-back-menu">Main Menu</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector("#btn-play-again").onclick = () => {
      overlay.remove();
      startGame();
    };
    overlay.querySelector("#btn-back-menu").onclick = () => {
      overlay.remove();
      renderMenu();
      showScreen("menu");
    };
  }

  // ── SIDEBAR ────────────────────────────────────────────────
  function renderSidebar() {
    const el = document.getElementById("sidebar");
    if (!el) return;

    el.innerHTML = `
      <div class="panel">
        <div class="panel-header">Scholar's Progress</div>
        <div class="panel-body">
          <div class="xp-display">
            <div>
              <div class="xp-amount">${progress.xp}</div>
              <div class="xp-label">Available XP</div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="tab-nav">
          <button class="tab-btn active" data-tab="mini-tree">Skill Tree</button>
          <button class="tab-btn" data-tab="mini-stats">Session</button>
        </div>
        <div class="panel-body" id="sidebar-tab-content"></div>
      </div>
      <div class="panel">
        <div class="panel-header">How to Play</div>
        <div class="panel-body" style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5;">
          Move your <span style="color:var(--neon-blue)">teal pieces</span> diagonally forward.
          Jump over <span style="color:var(--neon-red)">red pieces</span> to capture them.
          Reach the far side to become a King.
          <br><br>
          Every ~50 seconds, a <span style="color:var(--neon-gold)">Constitutional Challenge</span> appears.
          Correct = bonus move or recovered piece.
          Wrong = the AI gets a bonus move.
        </div>
      </div>
    `;

    // Tab switching
    el.querySelectorAll(".tab-btn").forEach(btn => {
      btn.onclick = () => {
        el.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderSidebarTab(btn.dataset.tab);
      };
    });

    renderSidebarTab("mini-tree");
  }

  function renderSidebarTab(tab) {
    const el = document.getElementById("sidebar-tab-content");
    if (!el) return;

    if (tab === "mini-tree") {
      const rows = [[], [], [], []];
      SKILL_NODES.forEach(n => rows[n.row].push(n));

      el.innerHTML = `
        <div class="skill-tree-grid">
          ${rows.map(row => `
            <div class="skill-row">
              ${row.map(node => {
                const unlocked = progress.unlockedNodes.includes(node.id);
                const available = canUnlock(node.id, progress);
                const cls = unlocked ? "unlocked" : available ? "available" : "";
                return `
                  <div class="skill-node ${cls}" data-node="${node.id}" title="${node.description}">
                    <span class="node-icon">${node.icon}</span>
                    <span class="node-name">${node.name}</span>
                    <span class="node-cost">${unlocked ? "UNLOCKED" : node.cost + " XP"}</span>
                  </div>
                `;
              }).join("")}
            </div>
          `).join("")}
        </div>
      `;

      // Bind unlock clicks
      el.querySelectorAll(".skill-node.available").forEach(nodeEl => {
        nodeEl.onclick = () => {
          const nodeId = nodeEl.dataset.node;
          const node = SKILL_NODES.find(n => n.id === nodeId);
          if (confirm(`Unlock "${node.name}" for ${node.cost} XP?\n\n${node.description}`)) {
            if (unlockNode(nodeId, progress)) {
              activeAbilities = getActiveAbilities(progress);
              engine.setDifficulty(progress.unlockedNodes.length);
              showXPPopup(`${node.icon} UNLOCKED!`);
              renderSidebar();
              updateStatsBar();
              renderAbilities();
            }
          }
        };
      });
    } else {
      el.innerHTML = `
        <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-secondary);">
          <div style="margin-bottom:8px;">
            <span style="color:var(--neon-green)">Correct:</span> ${gameQuestionsCorrect}
            &nbsp;&nbsp;
            <span style="color:var(--neon-red)">Wrong:</span> ${gameQuestionsWrong}
          </div>
          <div style="margin-bottom:8px;">
            <span style="color:var(--neon-gold)">XP This Game:</span> +${gameXPEarned}
          </div>
          <div style="margin-bottom:8px;">
            <span>Accuracy:</span> ${questionEngine ? questionEngine.getAccuracy() : 0}%
          </div>
          <div>
            <span>AI Depth:</span> ${engine ? engine.aiDepth : 3}
          </div>
        </div>
      `;
    }
  }

  // ── SKILL TREE SCREEN ──────────────────────────────────────
  function renderSkillTree() {
    const el = document.getElementById("screen-tree");
    const rows = [[], [], [], []];
    SKILL_NODES.forEach(n => rows[n.row].push(n));

    el.innerHTML = `
      <div class="app-container">
        <div class="app-header">
          <h1>Skill Tree</h1>
          <div class="subtitle">Spend XP to Unlock Abilities</div>
        </div>
        <div style="text-align:center; margin-bottom:20px;">
          <div class="xp-display" style="justify-content:center;">
            <div>
              <div class="xp-amount" style="font-size:1.5rem;">${progress.xp}</div>
              <div class="xp-label">Available XP</div>
            </div>
            <div style="margin-left:20px;">
              <div class="xp-amount" style="font-size:1.5rem; color:var(--text-secondary);">${progress.totalXP}</div>
              <div class="xp-label">Total Earned</div>
            </div>
          </div>
        </div>
        <div class="skill-tree-grid" style="gap:16px;">
          ${rows.map(row => `
            <div class="skill-row" style="gap:16px;">
              ${row.map(node => {
                const unlocked = progress.unlockedNodes.includes(node.id);
                const available = canUnlock(node.id, progress);
                const cls = unlocked ? "unlocked" : available ? "available" : "";
                return `
                  <div class="skill-node ${cls}" data-node="${node.id}" style="width:120px; padding:12px 8px;">
                    <span class="node-icon" style="font-size:1.8rem;">${node.icon}</span>
                    <span class="node-name" style="font-size:0.65rem;">${node.name}</span>
                    <span class="node-cost">${unlocked ? "UNLOCKED" : node.cost + " XP"}</span>
                    <div style="font-size:0.6rem; color:var(--text-dim); margin-top:4px; line-height:1.2;">${node.description}</div>
                  </div>
                `;
              }).join("")}
            </div>
          `).join("")}
        </div>
        <div style="text-align:center; margin-top:24px;">
          <button class="menu-btn secondary" id="btn-tree-back">Back to Menu</button>
        </div>
      </div>
    `;

    el.querySelector("#btn-tree-back").onclick = () => { renderMenu(); showScreen("menu"); };

    el.querySelectorAll(".skill-node.available").forEach(nodeEl => {
      nodeEl.onclick = () => {
        const nodeId = nodeEl.dataset.node;
        const node = SKILL_NODES.find(n => n.id === nodeId);
        if (confirm(`Unlock "${node.name}" for ${node.cost} XP?\n\n${node.description}`)) {
          if (unlockNode(nodeId, progress)) {
            showXPPopup(`${node.icon} UNLOCKED!`);
            renderSkillTree();
          }
        }
      };
    });
  }

  // ── MASTERY SCREEN ─────────────────────────────────────────
  function renderMastery() {
    const el = document.getElementById("screen-mastery");
    const articles = ["Preamble", "Article I", "Article II", "Article III", "Article IV", "Article V", "Article VI", "Article VII"];

    el.innerHTML = `
      <div class="app-container">
        <div class="app-header">
          <h1>Article Mastery</h1>
          <div class="subtitle">Track Your Knowledge by Section</div>
        </div>
        <div class="panel" style="max-width:600px; margin:0 auto;">
          <div class="panel-header">Mastery Breakdown</div>
          <div class="panel-body">
            <div class="mastery-list">
              ${articles.map(article => {
                const data = progress.articleMastery[article] || { correct: 0, wrong: 0 };
                const total = data.correct + data.wrong;
                const pct = total === 0 ? 0 : Math.round((data.correct / total) * 100);
                const cls = pct >= 70 ? "high" : pct >= 40 ? "mid" : "low";
                return `
                  <div class="mastery-row">
                    <span class="mastery-label">${article}</span>
                    <div class="mastery-bar">
                      <div class="mastery-fill ${cls}" style="width:${pct}%"></div>
                    </div>
                    <span class="mastery-pct">${total === 0 ? "--" : pct + "%"}</span>
                  </div>
                `;
              }).join("")}
            </div>
            <div style="margin-top:16px; font-family:var(--font-mono); font-size:0.7rem; color:var(--text-secondary); text-align:center;">
              Total: ${progress.totalCorrect} correct / ${progress.totalCorrect + progress.totalWrong} attempted
              (${progress.totalCorrect + progress.totalWrong > 0 ? Math.round((progress.totalCorrect / (progress.totalCorrect + progress.totalWrong)) * 100) : 0}%)
            </div>
          </div>
        </div>
        <div style="text-align:center; margin-top:24px;">
          <button class="menu-btn secondary" id="btn-mastery-back">Back to Menu</button>
        </div>
      </div>
    `;

    el.querySelector("#btn-mastery-back").onclick = () => { renderMenu(); showScreen("menu"); };
  }

  // ── BOOT ───────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", init);
})();
