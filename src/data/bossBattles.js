// ============================================================
// Boss Battles — Weekly Challenge Question Pool
// Each battle draws 10 questions randomly from this pool.
// Mix of vocab, grammar, and reading — all harder (tier 2-3).
// Boss battles unlock at player level 5.
//
// HOW TO ADD: append to BOSS_QUESTIONS below.
// IDs: bb001, bb002... Never reuse an ID.
// type: 'vocab' | 'grammar' | 'reading'
// ============================================================

export const BOSS_QUESTIONS = [
  // ── Vocabulary ──────────────────────────────────────────
  {
    id: 'bb001', type: 'vocab', xp: 30,
    prompt: 'Choose the word that best matches the definition:',
    word: 'Obfuscate',
    question: 'Which sentence uses "obfuscate" correctly?',
    options: [
      'The politician obfuscated the issue with clear, direct answers.',
      'The lawyer\'s jargon served to obfuscate the contract\'s true meaning.',
      'She obfuscated her friend with a generous compliment.',
      'The bright light obfuscated the darkness completely.',
    ],
    answer: 1,
    explanation: '"Obfuscate" means to make something unclear or confusing. Choice B correctly shows language being used to cloud rather than clarify meaning.',
  },
  {
    id: 'bb002', type: 'vocab', xp: 30,
    word: 'Equivocate',
    question: 'What does "equivocate" mean in context: "When asked about the missing funds, the treasurer equivocated, giving vague, non-committal answers"?',
    options: [
      'To speak loudly and confidently',
      'To use ambiguous language to avoid commitment or deceive',
      'To calculate precisely',
      'To apologize formally',
    ],
    answer: 1,
    explanation: '"Equivocate" means to use ambiguous or unclear language, typically to avoid committing to a position or to mislead. The treasurer\'s vague, non-committal answers perfectly illustrate this.',
  },
  {
    id: 'bb003', type: 'vocab', xp: 30,
    word: 'Sanguine',
    question: '"Despite the setbacks, she remained sanguine about their chances of success." What does "sanguine" mean here?',
    options: [
      'Deeply worried and anxious',
      'Optimistic and positive',
      'Angry and resentful',
      'Cautious and uncertain',
    ],
    answer: 1,
    explanation: '"Sanguine" means optimistic, especially in difficult situations. Do not confuse with its older meaning (relating to blood) — in modern usage it almost always means cheerfully optimistic.',
  },
  {
    id: 'bb004', type: 'vocab', xp: 30,
    word: 'Tendentious',
    question: 'A "tendentious" argument is one that is',
    options: [
      'Carefully balanced and objective',
      'Promoting a particular point of view; biased',
      'Based on factual evidence',
      'Difficult to understand',
    ],
    answer: 1,
    explanation: '"Tendentious" describes writing or speech that promotes a particular cause or point of view in a way that is not balanced. It\'s a key SAT rhetoric word — recognizing tendentious framing in passages is an SAT skill.',
  },
  {
    id: 'bb005', type: 'vocab', xp: 30,
    word: 'Turpitude',
    question: '"The official was dismissed for moral turpitude." What does "turpitude" mean?',
    options: [
      'Excellence and virtue',
      'Wickedness or depravity',
      'Carelessness or negligence',
      'Stubbornness',
    ],
    answer: 1,
    explanation: '"Turpitude" refers to wickedness or moral corruption. The phrase "moral turpitude" is commonly used in legal and formal contexts to describe conduct that violates accepted moral standards.',
  },
  {
    id: 'bb006', type: 'vocab', xp: 30,
    word: 'Inimical',
    question: '"Policies inimical to economic growth were reversed." What does "inimical" mean?',
    options: [
      'Supportive of',
      'Unrelated to',
      'Harmful or hostile to',
      'Necessary for',
    ],
    answer: 2,
    explanation: '"Inimical" means harmful or hostile. It describes things that are opposed to or damaging to something else. "Inimical to growth" = working against growth.',
  },
  {
    id: 'bb007', type: 'vocab', xp: 30,
    word: 'Laconic',
    question: 'A "laconic" response is characterized by',
    options: [
      'Long, elaborate sentences',
      'Emotional intensity',
      'Using very few words; brief and concise',
      'Technical vocabulary',
    ],
    answer: 2,
    explanation: '"Laconic" comes from the ancient Spartans (from Laconia) who were famous for terse, blunt speech. "Yes" is a laconic answer. It means brief to the point of seeming rude or mysterious.',
  },
  {
    id: 'bb008', type: 'vocab', xp: 30,
    word: 'Verisimilitude',
    question: 'A novel praised for its "verisimilitude" is one that',
    options: [
      'Has a very complex plot',
      'Appears realistic and true to life',
      'Is morally instructive',
      'Is written in verse form',
    ],
    answer: 1,
    explanation: '"Verisimilitude" means the quality of appearing to be true or real. From Latin "verus" (true) + "similis" (similar). A story with verisimilitude feels authentic even if fictional.',
  },

  // ── Grammar ──────────────────────────────────────────────
  {
    id: 'bb009', type: 'grammar', xp: 30,
    sentence: 'Neither the manager nor the employees was informed about the policy change.',
    question: 'Identify the grammatical error and choose the correct version:',
    options: [
      '"was" is correct — "neither" always takes a singular verb',
      '"was" should be "were" — when "nor" connects a plural noun closest to the verb, use a plural verb',
      'The sentence is correct as written',
      '"was" should be "are" — present tense is required',
    ],
    answer: 1,
    explanation: 'With "neither/nor" constructions, the verb agrees with the noun closest to it. "Employees" (plural) is closest to the verb, so "were" is correct: "Neither the manager nor the employees WERE informed."',
  },
  {
    id: 'bb010', type: 'grammar', xp: 30,
    sentence: 'To write well, clarity and precision must be demonstrated in one\'s prose.',
    question: 'What error does this sentence contain?',
    options: [
      'Incorrect punctuation after "well"',
      'A dangling modifier — "to write well" should modify a person, not "clarity and precision"',
      'Incorrect use of "one\'s"',
      'No error — the sentence is correct',
    ],
    answer: 1,
    explanation: '"To write well" is an infinitive phrase that should describe whoever is doing the writing. But the subject is "clarity and precision" — which cannot write. Fix: "To write well, a writer must demonstrate clarity and precision in their prose."',
  },
  {
    id: 'bb011', type: 'grammar', xp: 30,
    sentence: 'The data suggests that the hypothesis is incorrect.',
    question: 'Which statement about this sentence is most accurate?',
    options: [
      'Correct — "data" is commonly treated as singular in modern usage',
      'Incorrect — "data" is always plural; it should be "data suggest"',
      'Incorrect — "suggests" should be "suggested" (past tense)',
      'Incorrect — "hypothesis" should be "hypotheses"',
    ],
    answer: 0,
    explanation: 'This is a nuanced usage question. Technically "data" is plural (singular: datum), but in modern American English — including on the SAT — "data" is widely accepted as a collective singular noun, and "suggests" is correct. Both forms appear in published writing; context and style guide matter.',
  },
  {
    id: 'bb012', type: 'grammar', xp: 30,
    sentence: 'Whomever finishes first will receive the prize.',
    question: 'Is "whomever" used correctly here?',
    options: [
      'Yes — "whomever" is always used as the object of a preposition',
      'No — "whoever" is correct because it is the subject of "finishes"',
      'Yes — "whomever" is correct because it precedes "will receive"',
      'No — "whoever" is correct because it follows a verb',
    ],
    answer: 1,
    explanation: '"Whoever/whomever" follows the same rule as "who/whom": use "whoever" when it acts as a subject (doing the action), "whomever" when it\'s an object. Here, the pronoun is the subject of "finishes" — so "whoever" is correct.',
  },
  {
    id: 'bb013', type: 'grammar', xp: 30,
    sentence: 'The committee, comprised of five members, voted unanimously.',
    question: 'Which word is commonly misused in this sentence?',
    options: [
      '"unanimously" — should be "unanimous"',
      '"comprised" — "comprise" means "to contain"; the correct form is "composed of"',
      '"voted" — should be in present tense',
      'No error — the sentence is correct',
    ],
    answer: 1,
    explanation: '"Comprise" means "to consist of" or "to contain" — the whole comprises the parts. So "The committee comprises five members" is correct. "Comprised of" is widely considered incorrect; use "composed of" instead. This is a classic SAT usage trap.',
  },
  {
    id: 'bb014', type: 'grammar', xp: 30,
    sentence: 'Each of the students in the advanced class have submitted their projects.',
    question: 'What is the error?',
    options: [
      '"have" should be "has" — "each" is singular and takes a singular verb',
      '"their" should be "his or her"',
      'Both A and B are errors',
      'No error — collective noun "each" allows plural verbs',
    ],
    answer: 0,
    explanation: '"Each" is an indefinite pronoun that always takes a singular verb. "Each of the students HAS submitted..." is correct. The use of "their" as a gender-neutral singular pronoun is now widely accepted, so only the verb is an error here.',
  },
  {
    id: 'bb015', type: 'grammar', xp: 30,
    sentence: 'The research paper, as well as the supplemental materials, are due Friday.',
    question: 'What error does this sentence contain?',
    options: [
      '"are" should be "is" — phrases introduced by "as well as" do not change the number of the subject',
      '"are" is correct because "paper" and "materials" are both subjects',
      '"supplemental" should be "supplementary"',
      'No error',
    ],
    answer: 0,
    explanation: 'Phrases like "as well as," "along with," and "together with" are not coordinating conjunctions. They don\'t create compound subjects. "The research paper" is still the singular subject, so the verb should be "is."',
  },

  // ── Reading Comprehension ─────────────────────────────────
  {
    id: 'bb016', type: 'reading', xp: 35,
    passage: `The concept of "cultural appropriation" has generated fierce debate. Critics argue that members of dominant groups adopting elements of marginalized cultures — fashion, music, cuisine, spiritual practices — without acknowledgment or understanding amounts to exploitation. Proponents of a more permissive view counter that all culture is fundamentally hybrid, built through exchange and borrowing across groups, and that attempts to police cultural exchange risk reinforcing the very divisions they seek to heal.`,
    question: 'The passage is best described as',
    options: [
      'An argument in favor of cultural appropriation',
      'A condemnation of cultural exchange between groups',
      'A balanced presentation of two opposing views on cultural exchange',
      'A historical account of how cultures influence each other',
    ],
    answer: 2,
    explanation: 'The passage presents both sides — critics who see it as exploitation, and those who view cultural exchange as natural and positive. Neither view is endorsed; the passage describes the debate rather than resolving it.',
  },
  {
    id: 'bb017', type: 'reading', xp: 35,
    passage: `In 1905, Albert Einstein published four papers that transformed physics. One introduced special relativity; another proposed that light exists in discrete packets of energy — quanta — rather than continuous waves. This second paper, explaining the photoelectric effect, was the one for which Einstein received the Nobel Prize in 1921, not his theory of relativity. The photoelectric effect had direct technological applications; relativity, while more famous, was considered too abstract by the Nobel committee at the time.`,
    question: 'Which inference is best supported by the passage?',
    options: [
      'Einstein considered the photoelectric effect more important than relativity',
      'The Nobel committee in 1921 prioritized theories with practical applications over purely theoretical ones',
      'Special relativity had been proven incorrect by 1921',
      'Einstein published only two significant papers in 1905',
    ],
    answer: 1,
    explanation: 'The passage states that relativity "was considered too abstract by the Nobel committee" and that the photoelectric effect "had direct technological applications." This supports the inference that the committee favored practical applicability. The other choices contradict or go beyond what the passage states.',
  },
  {
    id: 'bb018', type: 'reading', xp: 35,
    passage: `Confirmation bias — the tendency to seek, interpret, and remember information in a way that confirms one's existing beliefs — is not merely an intellectual failing. It serves a psychological function: maintaining a coherent worldview is cognitively efficient and emotionally reassuring. Recognizing confirmation bias in oneself is notoriously difficult precisely because the very mechanism that causes it also filters out the evidence that would expose it.`,
    question: 'What does the passage suggest about why confirmation bias is hard to overcome?',
    options: [
      'People are not intelligent enough to recognize their biases',
      'The same process that creates bias also prevents us from seeing evidence against our beliefs',
      'Confirmation bias only affects people who actively seek to confirm their views',
      'It requires specialized training to detect bias in others',
    ],
    answer: 1,
    explanation: 'The passage explicitly states: "the very mechanism that causes it also filters out the evidence that would expose it." This is the self-reinforcing nature of confirmation bias — it blocks the information that would reveal its existence.',
  },
  {
    id: 'bb019', type: 'reading', xp: 35,
    passage: `The term "meritocracy" was coined by British sociologist Michael Young in 1958 — as a warning. Young's satirical novel depicted a dystopian future where society had sorted people ruthlessly by measured intelligence and achievement, creating a new elite that justified its privilege not by birth but by test scores. Today the word is used without irony as a term of praise, an ideal to strive for. Young spent his later years dismayed that his cautionary tale had been repackaged as an aspiration.`,
    question: 'The author includes the detail about Young\'s reaction primarily to',
    options: [
      'Show that Young was a pessimistic person who disliked success',
      'Argue that meritocracy is an impossible ideal',
      'Highlight the irony that a word coined as a warning became a term of praise',
      'Suggest that intelligence testing is fundamentally flawed',
    ],
    answer: 2,
    explanation: 'The detail about Young\'s dismay is used to underline the central irony: the word "meritocracy" was invented to critique the concept, but has since been adopted enthusiastically as an ideal — the opposite of its creator\'s intent.',
  },
  {
    id: 'bb020', type: 'reading', xp: 35,
    passage: `In classical rhetoric, three modes of persuasion are identified: ethos (appeal to the speaker's credibility), pathos (appeal to the audience's emotions), and logos (appeal to logic and evidence). Effective persuasion typically combines all three. An argument relying exclusively on logos may be technically correct but fail to move an audience; one relying entirely on pathos may be emotionally compelling but collapse under scrutiny. The most persuasive communicators understand when each mode is most powerful.`,
    question: 'Based on the passage, which of the following would be the strongest example of effective persuasion?',
    options: [
      'A speech by a renowned doctor citing statistics about vaccine safety and sharing a patient\'s story of recovery',
      'An emotional plea with no reference to facts or the speaker\'s qualifications',
      'A purely statistical presentation with no emotional content',
      'An argument that relies entirely on the speaker\'s personal authority',
    ],
    answer: 0,
    explanation: 'Choice A combines all three modes: ethos (renowned doctor = credibility), logos (statistics = evidence), and pathos (patient\'s story = emotional appeal). The passage explicitly states that "effective persuasion typically combines all three."',
  },
];

// Boss names and lore for each encounter
export const BOSS_ENCOUNTERS = [
  { id: 'boss_1', name: 'The Grammar Wraith',   emoji: '👻', level: 5,  description: 'A spectral force that corrupts sentences and twists meaning.',  xpReward: 300, gemReward: 25 },
  { id: 'boss_2', name: 'The Vocabulary Sphinx', emoji: '🦁', level: 8,  description: 'An ancient creature that guards the gates of advanced language.', xpReward: 400, gemReward: 35 },
  { id: 'boss_3', name: 'The Logic Lich',        emoji: '💀', level: 12, description: 'A master of deception who twists arguments and hides the truth.', xpReward: 500, gemReward: 45 },
  { id: 'boss_4', name: 'The SAT Overlord',      emoji: '⚡', level: 20, description: 'The ultimate test — the final guardian before SAT mastery.',      xpReward: 750, gemReward: 60 },
];

export function getCurrentBoss(playerLevel) {
  const available = BOSS_ENCOUNTERS.filter(b => playerLevel >= b.level);
  return available[available.length - 1] || null;
}

export function generateBossQuestions(count = 10) {
  const shuffled = [...BOSS_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
