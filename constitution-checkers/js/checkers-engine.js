// ============================================================
// CONSTITUTION CHECKERS — Checkers Engine
// Full rules: moves, jumps, multi-jumps, kinging
// AI: Minimax with alpha-beta pruning, adaptive depth
// ============================================================

const EMPTY = 0;
const PLAYER = 1;
const PLAYER_KING = 2;
const AI = 3;
const AI_KING = 4;

class CheckersEngine {
  constructor() {
    this.board = this.createBoard();
    this.currentTurn = PLAYER; // Player always goes first
    this.selectedPiece = null;
    this.validMoves = [];
    this.mustJump = false;
    this.multiJumpPiece = null; // Track piece in multi-jump sequence
    this.gameOver = false;
    this.winner = null;
    this.moveCount = 0;
    this.movesSinceCapture = 0;
    this.capturedByPlayer = 0;
    this.capturedByAI = 0;
    this.aiDepth = 3; // Base depth, adjusted by skill tree
  }

  createBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
    // AI pieces on top (rows 0-2)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) board[r][c] = AI;
      }
    }
    // Player pieces on bottom (rows 5-7)
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) board[r][c] = PLAYER;
      }
    }
    return board;
  }

  clone() {
    const copy = new CheckersEngine();
    copy.board = this.board.map(row => [...row]);
    copy.currentTurn = this.currentTurn;
    copy.gameOver = this.gameOver;
    copy.winner = this.winner;
    copy.capturedByPlayer = this.capturedByPlayer;
    copy.capturedByAI = this.capturedByAI;
    copy.moveCount = this.moveCount;
    copy.movesSinceCapture = this.movesSinceCapture;
    copy.aiDepth = this.aiDepth;
    return copy;
  }

  isPlayerPiece(piece) { return piece === PLAYER || piece === PLAYER_KING; }
  isAIPiece(piece) { return piece === AI || piece === AI_KING; }
  isKing(piece) { return piece === PLAYER_KING || piece === AI_KING; }
  isOwnPiece(piece, side) {
    return side === PLAYER ? this.isPlayerPiece(piece) : this.isAIPiece(piece);
  }
  isEnemyPiece(piece, side) {
    return side === PLAYER ? this.isAIPiece(piece) : this.isPlayerPiece(piece);
  }

  getMoveDirs(piece) {
    if (piece === PLAYER) return [[-1, -1], [-1, 1]]; // Up
    if (piece === AI) return [[1, -1], [1, 1]]; // Down
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // King: all
  }

  inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

  getJumpsForPiece(r, c, board = this.board) {
    const piece = board[r][c];
    const side = this.isPlayerPiece(piece) ? PLAYER : AI;
    const dirs = this.getMoveDirs(piece);
    const jumps = [];
    for (const [dr, dc] of dirs) {
      const mr = r + dr, mc = c + dc;
      const lr = r + 2 * dr, lc = c + 2 * dc;
      if (this.inBounds(lr, lc) && this.isEnemyPiece(board[mr][mc], side) && board[lr][lc] === EMPTY) {
        jumps.push({ from: [r, c], to: [lr, lc], captured: [mr, mc] });
      }
    }
    return jumps;
  }

  getSimpleMovesForPiece(r, c, board = this.board) {
    const piece = board[r][c];
    const dirs = this.getMoveDirs(piece);
    const moves = [];
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (this.inBounds(nr, nc) && board[nr][nc] === EMPTY) {
        moves.push({ from: [r, c], to: [nr, nc], captured: null });
      }
    }
    return moves;
  }

  getAllMoves(side, board = this.board) {
    let allJumps = [];
    let allSimple = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isOwnPiece(board[r][c], side)) {
          allJumps.push(...this.getJumpsForPiece(r, c, board));
          allSimple.push(...this.getSimpleMovesForPiece(r, c, board));
        }
      }
    }
    // Mandatory jump rule
    if (allJumps.length > 0) return { moves: allJumps, mustJump: true };
    return { moves: allSimple, mustJump: false };
  }

  getMovesForPiece(r, c) {
    const piece = this.board[r][c];
    const side = this.isPlayerPiece(piece) ? PLAYER : AI;
    const { moves: allMoves, mustJump } = this.getAllMoves(side);

    if (this.multiJumpPiece) {
      // In multi-jump, only the jumping piece can move, and only jumps
      if (r !== this.multiJumpPiece[0] || c !== this.multiJumpPiece[1]) return [];
      return this.getJumpsForPiece(r, c);
    }

    if (mustJump) {
      return allMoves.filter(m => m.from[0] === r && m.from[1] === c);
    }
    return allMoves.filter(m => m.from[0] === r && m.from[1] === c);
  }

  applyMoveWithChain(move, board) {
    const newBoard = board.map(row => [...row]);
    this.applyMove(move, newBoard);

    if (!move.captured) return [newBoard];

    const furtherJumps = this.getJumpsForPiece(move.to[0], move.to[1], newBoard);
    if (furtherJumps.length === 0) return [newBoard];

    const results = [];
    for (const jump of furtherJumps) {
      results.push(...this.applyMoveWithChain(jump, newBoard));
    }
    return results;
  }

  applyMove(move, board = this.board) {
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    board[tr][tc] = board[fr][fc];
    board[fr][fc] = EMPTY;
    if (move.captured) {
      const [cr, cc] = move.captured;
      board[cr][cc] = EMPTY;
    }
    // Kinging
    if (board[tr][tc] === PLAYER && tr === 0) board[tr][tc] = PLAYER_KING;
    if (board[tr][tc] === AI && tr === 7) board[tr][tc] = AI_KING;
    return board;
  }

  executeMove(move) {
    const side = this.isPlayerPiece(this.board[move.from[0]][move.from[1]]) ? PLAYER : AI;
    this.applyMove(move);

    if (move.captured) {
      if (side === PLAYER) this.capturedByPlayer++;
      else this.capturedByAI++;

      // Check for multi-jump
      const furtherJumps = this.getJumpsForPiece(move.to[0], move.to[1]);
      if (furtherJumps.length > 0) {
        this.multiJumpPiece = move.to;
        return { multiJump: true, from: move.from, to: move.to, captured: move.captured };
      }
    }

    this.multiJumpPiece = null;
    this.moveCount++;
    if (move.captured) {
      this.movesSinceCapture = 0;
    } else {
      this.movesSinceCapture++;
    }
    this.currentTurn = side === PLAYER ? AI : PLAYER;
    this.checkGameOver();
    return { multiJump: false, from: move.from, to: move.to, captured: move.captured };
  }

  checkGameOver() {
    const playerMoves = this.getAllMoves(PLAYER);
    const aiMoves = this.getAllMoves(AI);
    let playerPieces = 0, aiPieces = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isPlayerPiece(this.board[r][c])) playerPieces++;
        if (this.isAIPiece(this.board[r][c])) aiPieces++;
      }
    }
    if (playerPieces === 0 || playerMoves.moves.length === 0) {
      this.gameOver = true;
      this.winner = AI;
    } else if (aiPieces === 0 || aiMoves.moves.length === 0) {
      this.gameOver = true;
      this.winner = PLAYER;
    } else if (this.movesSinceCapture >= 80) {
      this.gameOver = true;
      this.winner = null;
    }
  }

  getPieceCount(side) {
    let count = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (this.isOwnPiece(this.board[r][c], side)) count++;
    return count;
  }

  // ── AI: MINIMAX WITH ALPHA-BETA ────────────────────────────
  setDifficulty(skillTreeNodes) {
    // Base depth 3, +1 per 2 skill nodes, cap at 7
    this.aiDepth = Math.min(7, 3 + Math.floor(skillTreeNodes / 2));
  }

  evaluate(board) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p === AI) score += 10 + r; // Advance bonus
        else if (p === AI_KING) score += 18;
        else if (p === PLAYER) score -= 10 + (7 - r);
        else if (p === PLAYER_KING) score -= 18;
      }
    }
    return score;
  }

  minimax(board, depth, alpha, beta, maximizing) {
    if (depth === 0) return { score: this.evaluate(board) };

    const side = maximizing ? AI : PLAYER;
    const { moves } = this.getAllMoves(side, board);

    if (moves.length === 0) {
      return { score: maximizing ? -1000 : 1000 };
    }

    let bestMove = null;

    if (maximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        const boards = this.applyMoveWithChain(move, board);
        for (const newBoard of boards) {
          const result = this.minimax(newBoard, depth - 1, alpha, beta, false);
          if (result.score > maxScore) {
            maxScore = result.score;
            bestMove = move;
          }
          alpha = Math.max(alpha, maxScore);
          if (beta <= alpha) break;
        }
        if (beta <= alpha) break;
      }
      return { score: maxScore, move: bestMove };
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        const boards = this.applyMoveWithChain(move, board);
        for (const newBoard of boards) {
          const result = this.minimax(newBoard, depth - 1, alpha, beta, true);
          if (result.score < minScore) {
            minScore = result.score;
            bestMove = move;
          }
          beta = Math.min(beta, minScore);
          if (beta <= alpha) break;
        }
        if (beta <= alpha) break;
      }
      return { score: minScore, move: bestMove };
    }
  }

  getAIMove() {
    // Occasionally make suboptimal moves at lower depths for fun
    const blunderChance = Math.max(0, 0.15 - (this.aiDepth * 0.02));
    if (Math.random() < blunderChance) {
      const { moves } = this.getAllMoves(AI);
      if (moves.length > 0) {
        return moves[Math.floor(Math.random() * moves.length)];
      }
    }
    const result = this.minimax(this.board, this.aiDepth, -Infinity, Infinity, true);
    return result.move;
  }

  // ── BONUS MECHANICS ────────────────────────────────────────
  grantBonusMove() {
    // Returns true if player gets to go again
    this.currentTurn = PLAYER;
    return true;
  }

  grantAIBonusMove() {
    // AI gets an extra move
    const move = this.getAIMove();
    if (move) {
      this.executeMove(move);
      return move;
    }
    return null;
  }

  recoverPiece() {
    // Find an empty dark square in rows 5-7 and place a player piece
    for (let r = 7; r >= 5; r--) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1 && this.board[r][c] === EMPTY) {
          this.board[r][c] = PLAYER;
          this.capturedByAI = Math.max(0, this.capturedByAI - 1);
          return [r, c];
        }
      }
    }
    return null;
  }

  forceKing(r, c) {
    if (this.board[r][c] === PLAYER) {
      this.board[r][c] = PLAYER_KING;
      return true;
    }
    return false;
  }

  removeEnemyPiece() {
    // Remove a random non-king AI piece
    const targets = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (this.board[r][c] === AI) targets.push([r, c]);
    if (targets.length === 0) {
      // Try kings if no regular pieces
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          if (this.board[r][c] === AI_KING) targets.push([r, c]);
    }
    if (targets.length > 0) {
      const [r, c] = targets[Math.floor(Math.random() * targets.length)];
      this.board[r][c] = EMPTY;
      this.capturedByPlayer++;
      return [r, c];
    }
    return null;
  }
}
