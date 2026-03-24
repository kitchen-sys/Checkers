// ============================================================
// CONSTITUTION CHECKERS — Question Bank
// Organized by Article (Preamble, I–VII)
// Difficulty: 1 (recall) | 2 (understanding) | 3 (application)
//
// TO ADD QUESTIONS: Just push new objects to QUESTION_BANK.
// Format: { id, article, difficulty, question, choices[], correct (0-3), explanation }
// ============================================================

const QUESTION_BANK = [
  // ── PREAMBLE ──────────────────────────────────────────────
  {
    id: "pre-01", article: "Preamble", difficulty: 1,
    question: "What are the first three words of the Constitution?",
    choices: ["We the People", "In Order to", "The United States", "Congress Shall Make"],
    correct: 0,
    explanation: "\"We the People\" establishes that the government's power comes from the citizens — popular sovereignty."
  },
  {
    id: "pre-02", article: "Preamble", difficulty: 2,
    question: "Which goal of the Preamble refers to keeping peace within the country?",
    choices: ["Provide for the common defense", "Insure domestic tranquility", "Promote the general welfare", "Establish justice"],
    correct: 1,
    explanation: "\"Insure domestic tranquility\" means maintaining peace and order among the states and citizens."
  },
  {
    id: "pre-03", article: "Preamble", difficulty: 2,
    question: "The Preamble says the Constitution was created to form a 'more perfect' what?",
    choices: ["Nation", "Democracy", "Union", "Republic"],
    correct: 2,
    explanation: "The Founders wanted to improve upon the weak Articles of Confederation by forming a stronger Union."
  },
  {
    id: "pre-04", article: "Preamble", difficulty: 3,
    question: "Why does the Preamble say 'We the People' instead of 'We the States'?",
    choices: [
      "The states didn't exist yet",
      "To show the government serves the people, not just the states",
      "It was a printing error",
      "The states refused to sign"
    ],
    correct: 1,
    explanation: "This was a deliberate choice to establish popular sovereignty — government power comes from the people."
  },
  {
    id: "pre-05", article: "Preamble", difficulty: 1,
    question: "Which of these is NOT a goal listed in the Preamble?",
    choices: ["Establish justice", "Promote the general welfare", "Guarantee free education", "Secure the blessings of liberty"],
    correct: 2,
    explanation: "The Preamble lists six goals, but free education is not one of them."
  },

  // ── ARTICLE I — LEGISLATIVE BRANCH ────────────────────────
  {
    id: "a1-01", article: "Article I", difficulty: 1,
    question: "Article I establishes which branch of government?",
    choices: ["Executive", "Judicial", "Legislative", "Military"],
    correct: 2,
    explanation: "Article I creates Congress — the Senate and the House of Representatives."
  },
  {
    id: "a1-02", article: "Article I", difficulty: 1,
    question: "How many chambers does Congress have?",
    choices: ["One", "Two", "Three", "Four"],
    correct: 1,
    explanation: "Congress is bicameral: the Senate and the House of Representatives."
  },
  {
    id: "a1-03", article: "Article I", difficulty: 1,
    question: "How long is a term for a member of the House of Representatives?",
    choices: ["2 years", "4 years", "6 years", "For life"],
    correct: 0,
    explanation: "Representatives serve 2-year terms, keeping them closely accountable to voters."
  },
  {
    id: "a1-04", article: "Article I", difficulty: 1,
    question: "How long is a term for a U.S. Senator?",
    choices: ["2 years", "4 years", "6 years", "8 years"],
    correct: 2,
    explanation: "Senators serve 6-year terms, giving them more stability for long-term policy."
  },
  {
    id: "a1-05", article: "Article I", difficulty: 2,
    question: "What is the minimum age to serve in the House of Representatives?",
    choices: ["18", "21", "25", "30"],
    correct: 2,
    explanation: "You must be at least 25 years old to serve in the House."
  },
  {
    id: "a1-06", article: "Article I", difficulty: 2,
    question: "What is the minimum age to serve in the Senate?",
    choices: ["25", "30", "35", "40"],
    correct: 1,
    explanation: "Senators must be at least 30 — older than the House requirement."
  },
  {
    id: "a1-07", article: "Article I", difficulty: 2,
    question: "Which power does Article I give ONLY to the House?",
    choices: ["Declare war", "Impeach federal officials", "Approve treaties", "Confirm judges"],
    correct: 1,
    explanation: "The House has the sole power of impeachment — bringing formal charges against officials."
  },
  {
    id: "a1-08", article: "Article I", difficulty: 2,
    question: "Which body holds the trial for impeachments?",
    choices: ["The House", "The Senate", "The Supreme Court", "The President"],
    correct: 1,
    explanation: "While the House impeaches, the Senate conducts the actual trial."
  },
  {
    id: "a1-09", article: "Article I", difficulty: 3,
    question: "The 'Great Compromise' created two chambers of Congress. Why?",
    choices: [
      "To give the President more power",
      "To balance the interests of large and small states",
      "To save money on building costs",
      "To copy the British Parliament exactly"
    ],
    correct: 1,
    explanation: "Large states wanted representation by population (House), small states wanted equal representation (Senate)."
  },
  {
    id: "a1-10", article: "Article I", difficulty: 2,
    question: "Which of these is a power of Congress listed in Article I?",
    choices: ["Command the army", "Declare war", "Negotiate treaties", "Appoint judges"],
    correct: 1,
    explanation: "Congress declares war; the President commands the military."
  },
  {
    id: "a1-11", article: "Article I", difficulty: 3,
    question: "Article I, Section 8 is called the 'Elastic Clause.' Why?",
    choices: [
      "It stretches Congress's powers to cover new situations",
      "It lets Congress change the Constitution easily",
      "It makes laws flexible and temporary",
      "It lets states override federal law"
    ],
    correct: 0,
    explanation: "The Necessary and Proper Clause lets Congress make laws needed to carry out its listed powers."
  },
  {
    id: "a1-12", article: "Article I", difficulty: 2,
    question: "Representation in the House is based on what?",
    choices: ["State size by area", "State population", "Equal per state", "Governor's choice"],
    correct: 1,
    explanation: "More people = more Representatives. Every state gets exactly 2 Senators regardless of size."
  },

  // ── ARTICLE II — EXECUTIVE BRANCH ─────────────────────────
  {
    id: "a2-01", article: "Article II", difficulty: 1,
    question: "Article II establishes which branch of government?",
    choices: ["Legislative", "Executive", "Judicial", "State"],
    correct: 1,
    explanation: "Article II creates the presidency and the executive branch."
  },
  {
    id: "a2-02", article: "Article II", difficulty: 1,
    question: "How long is one presidential term?",
    choices: ["2 years", "4 years", "6 years", "8 years"],
    correct: 1,
    explanation: "The President serves a 4-year term."
  },
  {
    id: "a2-03", article: "Article II", difficulty: 2,
    question: "What is the minimum age to become President?",
    choices: ["25", "30", "35", "40"],
    correct: 2,
    explanation: "Must be at least 35, a natural-born citizen, and a 14-year U.S. resident."
  },
  {
    id: "a2-04", article: "Article II", difficulty: 2,
    question: "The President is Commander in Chief of what?",
    choices: ["Congress", "The Supreme Court", "The military", "The states"],
    correct: 2,
    explanation: "The President commands the armed forces, but only Congress can declare war."
  },
  {
    id: "a2-05", article: "Article II", difficulty: 2,
    question: "The President's power to reject a bill is called a:",
    choices: ["Override", "Filibuster", "Veto", "Pardon"],
    correct: 2,
    explanation: "The veto lets the President reject legislation, though Congress can override with a 2/3 vote."
  },
  {
    id: "a2-06", article: "Article II", difficulty: 3,
    question: "Why did the Founders create the Electoral College?",
    choices: [
      "They didn't trust ordinary citizens at all",
      "It was a compromise between Congress choosing and a popular vote",
      "To save time counting votes",
      "Only landowners could vote anyway"
    ],
    correct: 1,
    explanation: "The Electoral College was a compromise — some wanted Congress to pick, others wanted direct election."
  },
  {
    id: "a2-07", article: "Article II", difficulty: 2,
    question: "Who has the power to make treaties with foreign nations?",
    choices: ["Congress alone", "The President with Senate approval", "The Supreme Court", "The Vice President"],
    correct: 1,
    explanation: "The President negotiates treaties, but the Senate must approve with a 2/3 vote."
  },
  {
    id: "a2-08", article: "Article II", difficulty: 2,
    question: "The President can grant pardons EXCEPT in cases of:",
    choices: ["Murder", "Treason", "Impeachment", "Tax evasion"],
    correct: 2,
    explanation: "The President cannot pardon someone who has been impeached."
  },
  {
    id: "a2-09", article: "Article II", difficulty: 3,
    question: "Why is the President required to give a 'State of the Union' address?",
    choices: [
      "It's a tradition, not a requirement",
      "Article II requires the President to inform Congress about the nation's condition",
      "The Supreme Court demands it",
      "The Vice President writes it"
    ],
    correct: 1,
    explanation: "Article II, Section 3 requires the President to report to Congress on the state of the union."
  },

  // ── ARTICLE III — JUDICIAL BRANCH ─────────────────────────
  {
    id: "a3-01", article: "Article III", difficulty: 1,
    question: "Article III establishes which branch?",
    choices: ["Legislative", "Executive", "Judicial", "State"],
    correct: 2,
    explanation: "Article III creates the Supreme Court and the federal court system."
  },
  {
    id: "a3-02", article: "Article III", difficulty: 1,
    question: "What is the highest court in the United States?",
    choices: ["District Court", "Appeals Court", "Supreme Court", "State Supreme Court"],
    correct: 2,
    explanation: "The Supreme Court is the final authority on interpreting the Constitution."
  },
  {
    id: "a3-03", article: "Article III", difficulty: 2,
    question: "How long do federal judges serve?",
    choices: ["4 years", "8 years", "Until age 70", "For life (during good behavior)"],
    correct: 3,
    explanation: "Federal judges serve for life to keep them independent from political pressure."
  },
  {
    id: "a3-04", article: "Article III", difficulty: 3,
    question: "Why did the Founders give federal judges lifetime appointments?",
    choices: [
      "To reward them for their service",
      "To protect them from political pressure so they could be impartial",
      "Because elections were too expensive",
      "To make sure only experienced people became judges"
    ],
    correct: 1,
    explanation: "Lifetime tenure means judges can focus on the law without worrying about being popular."
  },
  {
    id: "a3-05", article: "Article III", difficulty: 2,
    question: "Article III defines treason carefully. How many witnesses are needed to convict?",
    choices: ["One", "Two", "Three", "A jury decides"],
    correct: 1,
    explanation: "Two witnesses to the same overt act, or a confession in open court."
  },
  {
    id: "a3-06", article: "Article III", difficulty: 2,
    question: "The power of 'judicial review' lets courts do what?",
    choices: [
      "Write new laws",
      "Declare laws unconstitutional",
      "Elect the President",
      "Impeach Congress members"
    ],
    correct: 1,
    explanation: "Judicial review (established by Marbury v. Madison) lets courts strike down unconstitutional laws."
  },

  // ── ARTICLE IV — STATES' RELATIONS ────────────────────────
  {
    id: "a4-01", article: "Article IV", difficulty: 1,
    question: "Article IV deals with the relationship between what?",
    choices: ["The branches", "The states", "Citizens and government", "The U.S. and foreign nations"],
    correct: 1,
    explanation: "Article IV sets rules for how states interact with each other and the federal government."
  },
  {
    id: "a4-02", article: "Article IV", difficulty: 2,
    question: "The 'Full Faith and Credit' clause means states must:",
    choices: [
      "Pay each other's debts",
      "Respect each other's laws, records, and court decisions",
      "Share tax revenue equally",
      "Allow free travel"
    ],
    correct: 1,
    explanation: "A court ruling or legal document in one state must be recognized by all other states."
  },
  {
    id: "a4-03", article: "Article IV", difficulty: 2,
    question: "Article IV guarantees every state what form of government?",
    choices: ["A democracy", "A republic", "A monarchy", "A confederation"],
    correct: 1,
    explanation: "The Guarantee Clause promises every state a republican form of government."
  },
  {
    id: "a4-04", article: "Article IV", difficulty: 3,
    question: "Can Congress admit new states under Article IV?",
    choices: [
      "No, only the original 13 are allowed",
      "Yes, but a new state can't be formed from an existing one without consent",
      "Yes, with no restrictions",
      "Only the President can admit new states"
    ],
    correct: 1,
    explanation: "Congress can admit new states but cannot carve one from an existing state without that state's permission."
  },

  // ── ARTICLE V — AMENDMENT PROCESS ─────────────────────────
  {
    id: "a5-01", article: "Article V", difficulty: 1,
    question: "Article V describes how to do what to the Constitution?",
    choices: ["Interpret it", "Enforce it", "Amend (change) it", "Replace it"],
    correct: 2,
    explanation: "Article V lays out exactly how the Constitution can be amended."
  },
  {
    id: "a5-02", article: "Article V", difficulty: 2,
    question: "What fraction of Congress must vote to propose an amendment?",
    choices: ["Simple majority (1/2)", "Two-thirds (2/3)", "Three-fourths (3/4)", "Unanimous"],
    correct: 1,
    explanation: "Two-thirds of both chambers must agree to propose an amendment."
  },
  {
    id: "a5-03", article: "Article V", difficulty: 2,
    question: "How many states must ratify an amendment for it to pass?",
    choices: ["Half (1/2)", "Two-thirds (2/3)", "Three-fourths (3/4)", "All of them"],
    correct: 2,
    explanation: "Three-fourths of state legislatures must ratify an amendment."
  },
  {
    id: "a5-04", article: "Article V", difficulty: 3,
    question: "Why did the Founders make amending the Constitution so difficult?",
    choices: [
      "To prevent frequent, reckless changes",
      "They didn't want anyone to change it",
      "They thought it was already perfect",
      "They wanted only the President to make changes"
    ],
    correct: 0,
    explanation: "The high threshold ensures amendments have broad, lasting support — not just a slim majority."
  },

  // ── ARTICLE VI — SUPREMACY CLAUSE ─────────────────────────
  {
    id: "a6-01", article: "Article VI", difficulty: 1,
    question: "Article VI declares the Constitution is the _______ law of the land.",
    choices: ["Oldest", "Supreme", "Only", "First"],
    correct: 1,
    explanation: "The Supremacy Clause makes the Constitution the highest law — no state law can override it."
  },
  {
    id: "a6-02", article: "Article VI", difficulty: 2,
    question: "If a state law conflicts with the Constitution, what happens?",
    choices: [
      "The state law wins in that state",
      "The President decides",
      "The Constitution wins — the state law is invalid",
      "Citizens vote on which to follow"
    ],
    correct: 2,
    explanation: "Federal law is supreme. Conflicting state laws are struck down."
  },
  {
    id: "a6-03", article: "Article VI", difficulty: 2,
    question: "Article VI says there can be NO religious test for office. This means:",
    choices: [
      "Officials must pass a test about all religions",
      "No one can be required to follow a specific religion to serve",
      "Religion can't be discussed in government",
      "Officials must be atheists"
    ],
    correct: 1,
    explanation: "Anyone can hold office regardless of religious beliefs."
  },

  // ── ARTICLE VII — RATIFICATION ────────────────────────────
  {
    id: "a7-01", article: "Article VII", difficulty: 1,
    question: "Article VII explained how many states needed to ratify to adopt the Constitution?",
    choices: ["All 13", "9 out of 13", "7 out of 13", "A simple majority"],
    correct: 1,
    explanation: "Nine of the thirteen states had to ratify for the Constitution to take effect."
  },
  {
    id: "a7-02", article: "Article VII", difficulty: 2,
    question: "The debate over ratification split people into which two groups?",
    choices: [
      "Democrats and Republicans",
      "Federalists and Anti-Federalists",
      "Northerners and Southerners",
      "Patriots and Loyalists"
    ],
    correct: 1,
    explanation: "Federalists supported the Constitution; Anti-Federalists feared it gave too much power to the central government."
  },
  {
    id: "a7-03", article: "Article VII", difficulty: 3,
    question: "Which state was the first to ratify the Constitution?",
    choices: ["Virginia", "Massachusetts", "Delaware", "Pennsylvania"],
    correct: 2,
    explanation: "Delaware ratified on December 7, 1787 — earning it the nickname 'The First State.'"
  },
  {
    id: "a7-04", article: "Article VII", difficulty: 3,
    question: "The Constitution replaced which earlier document?",
    choices: [
      "The Declaration of Independence",
      "The Articles of Confederation",
      "The Magna Carta",
      "The Bill of Rights"
    ],
    correct: 1,
    explanation: "The Articles of Confederation were too weak — the Constitution created a stronger federal government."
  },
];

// ── QUESTION ENGINE ─────────────────────────────────────────
class QuestionEngine {
  constructor() {
    this.asked = new Set();
    this.stats = { correct: 0, wrong: 0, streak: 0, bestStreak: 0, byArticle: {} };
  }

  getQuestion(difficulty = null) {
    let pool = QUESTION_BANK.filter(q => !this.asked.has(q.id));
    if (pool.length === 0) {
      this.asked.clear();
      pool = [...QUESTION_BANK];
    }
    if (difficulty) {
      const filtered = pool.filter(q => q.difficulty <= difficulty);
      if (filtered.length > 0) pool = filtered;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  recordAnswer(question, chosenIndex) {
    this.asked.add(question.id);
    const isCorrect = chosenIndex === question.correct;
    if (isCorrect) {
      this.stats.correct++;
      this.stats.streak++;
      if (this.stats.streak > this.stats.bestStreak) this.stats.bestStreak = this.stats.streak;
    } else {
      this.stats.wrong++;
      this.stats.streak = 0;
    }
    if (!this.stats.byArticle[question.article]) {
      this.stats.byArticle[question.article] = { correct: 0, wrong: 0 };
    }
    this.stats.byArticle[question.article][isCorrect ? "correct" : "wrong"]++;
    return isCorrect;
  }

  getAccuracy() {
    const total = this.stats.correct + this.stats.wrong;
    return total === 0 ? 0 : Math.round((this.stats.correct / total) * 100);
  }
}
