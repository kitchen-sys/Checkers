// ============================================================
// CONSTITUTION CHECKERS — Skill Tree + Persistence
// XP earned from correct answers & wins
// Nodes unlock passive/active abilities
// All progress saved to localStorage
// ============================================================

const SKILL_NODES = [
  {
    id: "scholars_insight",
    name: "Scholar's Insight",
    icon: "⚖",
    description: "Reveals the Article each question comes from before you answer.",
    cost: 40,
    type: "passive",
    tier: 1,
    requires: [],
    row: 0, col: 1
  },
  {
    id: "constitutional_shield",
    name: "Constitutional Shield",
    icon: "☆",
    description: "Block 1 penalty per game (wrong answer has no consequences).",
    cost: 75,
    type: "active",
    uses: 1,
    tier: 2,
    requires: ["scholars_insight"],
    row: 1, col: 0
  },
  {
    id: "judicial_review",
    name: "Judicial Review",
    icon: "♜",
    description: "Veto 1 AI move per game — the AI must pick a different move.",
    cost: 100,
    type: "active",
    uses: 1,
    tier: 2,
    requires: ["scholars_insight"],
    row: 1, col: 2
  },
  {
    id: "amendment_power",
    name: "Amendment Power",
    icon: "☩",
    description: "Change 1 wrong answer to correct per game (after seeing result).",
    cost: 150,
    type: "active",
    uses: 1,
    tier: 3,
    requires: ["constitutional_shield"],
    row: 2, col: 0
  },
  {
    id: "executive_order",
    name: "Executive Order",
    icon: "♛",
    description: "Instantly king 1 of your pieces per game.",
    cost: 150,
    type: "active",
    uses: 1,
    tier: 3,
    requires: ["judicial_review"],
    row: 2, col: 2
  },
  {
    id: "founding_vision",
    name: "Founding Vision",
    icon: "✦",
    description: "Start each game with a preview of the first question (but not the answer).",
    cost: 200,
    type: "passive",
    tier: 4,
    requires: ["amendment_power", "executive_order"],
    row: 3, col: 1
  }
];

// XP rewards
const XP_CORRECT_ANSWER = 15;
const XP_CORRECT_STREAK_BONUS = 5; // Per streak beyond 2
const XP_WIN_GAME = 50;
const XP_LOSE_GAME = 10; // Consolation
const XP_PERFECT_GAME = 30; // Bonus: no wrong answers in a game

// ── PERSISTENCE LAYER ────────────────────────────────────────
const STORAGE_KEY = "constitution_checkers_save";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const data = JSON.parse(raw);
    // Migrate if needed
    if (!data.version || data.version < 2) {
      const fresh = getDefaultProgress();
      fresh.xp = data.xp || 0;
      fresh.totalXP = data.totalXP || data.xp || 0;
      fresh.unlockedNodes = data.unlockedNodes || [];
      return fresh;
    }
    return data;
  } catch (e) {
    console.error("Save corrupted, resetting:", e);
    return getDefaultProgress();
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

function getDefaultProgress() {
  return {
    version: 2,
    xp: 0,
    totalXP: 0,
    unlockedNodes: [],
    gamesPlayed: 0,
    gamesWon: 0,
    totalCorrect: 0,
    totalWrong: 0,
    bestStreak: 0,
    articleMastery: {} // { "Article I": { correct: 0, wrong: 0 }, ... }
  };
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaultProgress();
}

// ── SKILL TREE LOGIC ─────────────────────────────────────────
function canUnlock(nodeId, progress) {
  if (progress.unlockedNodes.includes(nodeId)) return false;
  const node = SKILL_NODES.find(n => n.id === nodeId);
  if (!node) return false;
  if (progress.xp < node.cost) return false;
  return node.requires.every(req => progress.unlockedNodes.includes(req));
}

function unlockNode(nodeId, progress) {
  if (!canUnlock(nodeId, progress)) return false;
  const node = SKILL_NODES.find(n => n.id === nodeId);
  progress.xp -= node.cost;
  progress.unlockedNodes.push(nodeId);
  saveProgress(progress);
  return true;
}

function hasNode(nodeId, progress) {
  return progress.unlockedNodes.includes(nodeId);
}

function getActiveAbilities(progress) {
  // Returns abilities available for a game session
  const abilities = {};
  for (const node of SKILL_NODES) {
    if (progress.unlockedNodes.includes(node.id) && node.type === "active") {
      abilities[node.id] = { ...node, remaining: node.uses };
    }
  }
  return abilities;
}

function addXP(amount, progress) {
  progress.xp += amount;
  progress.totalXP += amount;
  saveProgress(progress);
  return amount;
}
