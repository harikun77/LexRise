// ============================================================
// Reading Citadel — Tier 2 Passages (9th–10th Grade Level)
// Medium passages (250-350 words), evidence-based questions,
// vocabulary in context, author's purpose, tone, structure
// ============================================================

export const READING_T2 = [
  {
    id: 'rp2_001',
    title: 'The Paradox of Choice',
    tier: 2,
    passage: `In 1956, psychologist George Miller published a landmark paper arguing that the human mind can only hold approximately seven items in working memory at once. Decades later, psychologist Barry Schwartz extended this insight to consumer culture in his 2004 book The Paradox of Choice, arguing that the explosion of options available to modern consumers does not increase happiness — it undermines it.

Schwartz observed that supermarkets in the United States now typically carry over 45,000 products. Electronics stores offer hundreds of variations of the same device. Where previous generations had limited options, today's consumers face a dizzying array of choices for almost every purchase. Schwartz contended that rather than liberating people, this abundance generates anxiety, regret, and paralysis.

His central argument rests on two observations. First, abundant choice raises expectations: when dozens of options exist, we expect the one we select to be perfect, which sets us up for disappointment. Second, more options increase "opportunity cost" — the nagging sense that whichever choice we made, another option might have been better.

Not all researchers agree. Critics argue that Schwartz overstates the problem, and that choice overload primarily affects people in certain personality types or cultural contexts. A large-scale review of studies found that the effect of too many options on decision-making is smaller and less consistent than Schwartz claimed.

Nevertheless, the concept has influenced product designers, policymakers, and businesses — many of which have deliberately reduced the options they offer, betting that a curated selection will lead to more satisfied customers and more confident decisions.`,
    questions: [
      {
        id: 'rp2_001q1',
        type: 'main_idea',
        question: 'Which of the following best summarizes the central argument of the passage?',
        options: [
          'Barry Schwartz proved that consumer choice always causes unhappiness',
          'Modern supermarkets carry too many products',
          'Abundant consumer choice may paradoxically reduce satisfaction, though the effect is debated',
          'People should reduce the number of products they buy',
        ],
        answer: 2,
        explanation: 'The passage presents Schwartz\'s argument, acknowledges the research critics, and notes its practical influence. The key word "paradoxically" captures the central tension, and "debated" reflects the inclusion of counterarguments. Choices A and D are too absolute.',
        xp: 15,
      },
      {
        id: 'rp2_001q2',
        type: 'purpose',
        question: 'What is the purpose of paragraph 4 (beginning "Not all researchers agree")?',
        options: [
          'To disprove Schwartz\'s theory entirely',
          'To introduce a counterargument that complicates the passage\'s main claim',
          'To explain why choice overload only affects certain personality types',
          'To show that consumer research is unreliable',
        ],
        answer: 1,
        explanation: 'Paragraph 4 presents a counterargument — critics who dispute the scale and consistency of Schwartz\'s findings. It doesn\'t disprove the theory, but complicates the simple version of it. Recognizing the rhetorical function of a paragraph is a key SAT skill.',
        xp: 20,
      },
      {
        id: 'rp2_001q3',
        type: 'vocab_context',
        question: 'As used in paragraph 3, "opportunity cost" most nearly refers to',
        options: [
          'the financial cost of a missed investment',
          'the regret of believing another option might have been better',
          'the time wasted making decisions',
          'the satisfaction gained from making a good choice',
        ],
        answer: 1,
        explanation: 'The passage defines "opportunity cost" in context as "the nagging sense that whichever choice we made, another option might have been better." This is a psychological cost, not a financial one.',
        xp: 15,
      },
      {
        id: 'rp2_001q4',
        type: 'evidence',
        question: 'Which detail from the passage best supports the claim that Schwartz\'s ideas have had practical impact?',
        options: [
          'Supermarkets carry over 45,000 products',
          'George Miller showed working memory holds about seven items',
          'Businesses have deliberately reduced their options based on Schwartz\'s concept',
          'A large-scale review found the effect of choice overload smaller than claimed',
        ],
        answer: 2,
        explanation: 'The final paragraph states that product designers, policymakers, and businesses have been influenced by Schwartz\'s concept — this is direct evidence of practical, real-world impact. The other choices are background details or counterarguments.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp2_002',
    title: 'Henrietta Lacks and Medical Ethics',
    tier: 2,
    passage: `In 1951, a 31-year-old Black woman named Henrietta Lacks was admitted to Johns Hopkins Hospital in Baltimore with an aggressive form of cervical cancer. Without her knowledge or consent, a surgeon removed a sample of her tumor cells and sent them to a research laboratory. What happened next changed medicine forever.

Unlike nearly every human cell sample researchers had studied before, Lacks's cells did not die in the lab. They divided and multiplied with extraordinary vigor, surviving indefinitely under proper conditions. Researchers named the cell line "HeLa" — derived from the first two letters of her name — and within months were shipping samples worldwide. HeLa cells became the cornerstone of some of the twentieth century's most important medical advances, including the polio vaccine, cancer research, and early HIV studies.

Henrietta Lacks died just eight months after her diagnosis, never knowing that her cells would outlive her by decades. Her family did not learn of HeLa's existence until the 1970s, and they received no financial compensation despite the fact that HeLa cells had generated billions of dollars in commercial value.

The story raises profound questions about medical consent, bodily autonomy, and racial justice. At the time, it was common practice to use patient tissue for research without informing patients. The fact that Lacks was an uninsured Black woman treated at a hospital that largely served African Americans adds a layer of racial context to her exploitation that cannot be ignored. Her story became widely known through Rebecca Skloot's 2010 biography The Immortal Life of Henrietta Lacks, prompting renewed debates about who owns human biological material.`,
    questions: [
      {
        id: 'rp2_002q1',
        type: 'inference',
        question: 'The passage implies that the use of Lacks\'s cells without consent was',
        options: [
          'illegal under the laws of the time',
          'unusual for medical practice in that era',
          'common practice, but still ethically problematic in retrospect',
          'fully justified because of the scientific benefits that resulted',
        ],
        answer: 2,
        explanation: 'The passage states "it was common practice to use patient tissue for research without informing patients" — so it was not illegal or unusual at the time. But the passage also frames it as raising "profound questions about medical consent" and calls it "exploitation," implying ethical problems despite its commonness.',
        xp: 20,
      },
      {
        id: 'rp2_002q2',
        type: 'purpose',
        question: 'Why does the author mention that Lacks was "an uninsured Black woman treated at a hospital that largely served African Americans"?',
        options: [
          'To explain why her cells were biologically unique',
          'To suggest that race and class may have made her more vulnerable to exploitation',
          'To argue that Johns Hopkins Hospital was uniquely unethical',
          'To show that she had no access to legal resources',
        ],
        answer: 1,
        explanation: 'The author states this racial and economic context "adds a layer of racial context to her exploitation that cannot be ignored." The purpose is to suggest her vulnerability was not random — her race and socioeconomic status are relevant to understanding why she was treated the way she was.',
        xp: 20,
      },
      {
        id: 'rp2_002q3',
        type: 'vocab_context',
        question: 'As used in paragraph 2, "cornerstone" most nearly means',
        options: [
          'a decorative feature of a building',
          'a minor contributing factor',
          'a fundamental and essential foundation',
          'the final piece of a completed project',
        ],
        answer: 2,
        explanation: 'A cornerstone is the first stone laid in construction, upon which the rest of a building depends — making it the foundational element. In context, HeLa cells were the fundamental foundation of many key twentieth-century medical advances.',
        xp: 15,
      },
    ],
  },

  {
    id: 'rp2_003',
    title: 'The Case for Handwriting',
    tier: 2,
    passage: `As tablets and laptops have colonized classrooms, the age-old practice of handwriting has quietly retreated. Many school districts have reduced or eliminated cursive instruction altogether, reasoning that keyboard proficiency is more practical in a digital world. However, a growing body of neuroscience research suggests this trade-off may come at a significant cognitive cost.

Studies conducted at Princeton University and UCLA found that students who took handwritten notes learned material more deeply than those who typed. The explanation lies in the constraints of writing by hand: because you cannot transcribe everything a lecturer says, you are forced to process information and rephrase it in your own words — a cognitively demanding activity that promotes understanding rather than mere recording.

Typing, by contrast, facilitates a kind of "mindless transcription." Students who typed notes captured nearly three times as many words, but when tested on conceptual understanding — not just factual recall — they performed significantly worse than their handwriting peers.

The benefits extend beyond note-taking. Research in developmental psychology shows that children who learn to write by hand develop stronger letter recognition, reading fluency, and even mathematical reasoning than those who begin primarily on keyboards. The physical act of forming letters appears to activate neural pathways associated with literacy in ways that pressing keys does not.

None of this suggests that digital tools should be abandoned. Rather, the evidence calls for a more intentional approach: using keyboards for tasks that benefit from speed and organization, while preserving handwriting for learning activities where depth of understanding is the goal.`,
    questions: [
      {
        id: 'rp2_003q1',
        type: 'main_idea',
        question: 'The author\'s main argument is that',
        options: [
          'typing should be banned from classrooms',
          'handwriting should replace digital tools entirely',
          'handwriting offers cognitive benefits that digital tools do not replicate, and should be preserved for learning',
          'students who take typed notes are fundamentally less intelligent',
        ],
        answer: 2,
        explanation: 'The final paragraph explicitly states the author\'s position: neither abandon digital tools nor abandon handwriting, but use each intentionally for its strengths. The argument is nuanced, not an absolute rejection of typing.',
        xp: 15,
      },
      {
        id: 'rp2_003q2',
        type: 'evidence',
        question: 'According to the passage, why did handwriting students outperform typing students on conceptual tests?',
        options: [
          'They wrote more complete notes',
          'They were forced to paraphrase and process information rather than transcribe it',
          'The act of forming letters activates memory more effectively',
          'They were less distracted by their devices',
        ],
        answer: 1,
        explanation: 'The passage explains: "because you cannot transcribe everything... you are forced to process information and rephrase it in your own words — a cognitively demanding activity that promotes understanding." The advantage comes from processing, not volume.',
        xp: 15,
      },
      {
        id: 'rp2_003q3',
        type: 'vocab_context',
        question: 'In context, "mindless transcription" (paragraph 3) refers to',
        options: [
          'writing without paying attention',
          'copying text from one document to another',
          'recording words without deeply processing their meaning',
          'a method of note-taking recommended for fast learners',
        ],
        answer: 2,
        explanation: 'The passage contrasts typing (which produces "mindless transcription") with handwriting (which forces cognitive engagement). "Mindless" here means processing is bypassed — words are recorded without real understanding.',
        xp: 15,
      },
      {
        id: 'rp2_003q4',
        type: 'purpose',
        question: 'What is the function of the final paragraph in the context of the passage?',
        options: [
          'It introduces new evidence supporting handwriting',
          'It acknowledges counterarguments and qualifies the main argument',
          'It proposes a nuanced conclusion that avoids a false either/or choice',
          'It undermines the research cited earlier in the passage',
        ],
        answer: 2,
        explanation: 'The final paragraph avoids the extreme of "abandon digital tools" and instead proposes using each method intentionally. This is a rhetorical move to make the argument more reasonable and avoid a straw-man conclusion.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp2_004',
    title: 'The Architecture of Memory',
    tier: 2,
    passage: `Memory is not a filing cabinet. That analogy, while intuitive, fundamentally misrepresents how the brain stores and retrieves information. Rather than passively recording events and replaying them like a video, memory is an active, reconstructive process — one that is susceptible to distortion at every stage.

When you recall a memory, you are not simply retrieving a stored recording. You are rebuilding the experience from fragments, filling in gaps with inference, expectations, and information you have acquired since the original event. This reconstruction is influenced by your current beliefs, emotional state, and even what others have told you about the event. Every time you remember something, you subtly alter it.

This phenomenon has profound implications for the legal system. Eyewitness testimony has historically been treated as among the most powerful forms of evidence in courtrooms. Yet decades of research by psychologist Elizabeth Loftus have demonstrated that eyewitness memory is remarkably unreliable. In her famous "misinformation effect" studies, Loftus showed that simply asking a witness a question with a false embedded assumption — such as "How fast was the car going when it smashed into the other vehicle?" versus "when it hit" — altered what they later claimed to remember.

Of the more than 375 wrongful convictions overturned by DNA evidence in the United States, over 70% involved mistaken eyewitness identification. The lesson is not that witnesses are dishonest, but that memory itself — like all reconstructive processes — is fallible.`,
    questions: [
      {
        id: 'rp2_004q1',
        type: 'inference',
        question: 'The author begins the passage by rejecting the "filing cabinet" analogy to suggest that',
        options: [
          'filing cabinets are outdated compared to modern technology',
          'the common understanding of memory is fundamentally flawed',
          'memory is more reliable than most people believe',
          'analogies are generally unhelpful in scientific writing',
        ],
        answer: 1,
        explanation: 'The author immediately calls the filing cabinet analogy a "misrepresentation," then builds an alternative model of memory as reconstructive and fallible. The opening move is to displace a flawed popular assumption before replacing it with a more accurate one.',
        xp: 20,
      },
      {
        id: 'rp2_004q2',
        type: 'vocab_context',
        question: 'As used in paragraph 4, "fallible" most nearly means',
        options: [
          'dishonest',
          'subject to error',
          'permanently unreliable',
          'emotionally influenced',
        ],
        answer: 1,
        explanation: 'The passage makes clear that witnesses are not dishonest — so "fallible" cannot mean dishonest. "Fallible" means capable of being wrong or making errors. The passage uses it to say memory can fail without any intent to deceive.',
        xp: 15,
      },
      {
        id: 'rp2_004q3',
        type: 'evidence',
        question: 'Which detail most directly supports the claim that eyewitness memory is unreliable?',
        options: [
          'Memory is a reconstructive rather than a recording process',
          'Loftus showed that the phrasing of a question can change what a witness remembers',
          'Over 375 wrongful convictions have been overturned by DNA evidence',
          'Every time you remember something, you subtly alter it',
        ],
        answer: 1,
        explanation: 'The Loftus misinformation effect is the most direct experimental evidence cited for eyewitness unreliability. While the other options are relevant, choice B describes a controlled study specifically demonstrating that memory can be altered by external input — the strongest empirical evidence given.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp2_005',
    title: 'The Value of Failure',
    tier: 2,
    passage: `In American schools, failure carries a stigma that may itself be a barrier to learning. Students who receive low grades often internalize those grades as statements about their fixed intelligence rather than temporary gaps in their understanding. Psychologist Carol Dweck's research on "mindset" suggests that this interpretation — what she calls a "fixed mindset" — actively inhibits academic growth.

Dweck found that students who believe intelligence is malleable and can grow through effort (a "growth mindset") consistently outperform peers with comparable ability but a fixed mindset, particularly when facing challenging material. Students with a growth mindset interpret failure as feedback: evidence of what they need to learn, not evidence of who they are.

This distinction has measurable neurological correlates. Studies using EEG technology found that growth-mindset students show greater brain activity when processing their own errors than fixed-mindset students — they literally pay more attention to what went wrong. This heightened attention to failure translates into better error correction and stronger performance over time.

The implications for education are significant. Traditional grading systems — which attach permanent numerical values to performance at a single point in time — may inadvertently reinforce a fixed mindset by treating grades as verdicts rather than progress reports. Some schools have begun replacing traditional grades with detailed narrative feedback and revision opportunities, explicitly framing evaluation as part of the learning process rather than its endpoint.

Critics of this approach worry that eliminating numerical grades removes important feedback signals and may leave students unprepared for competitive environments where performance is quantified. The debate reflects a deeper tension between two goals of education: building confident, resilient learners versus preparing students for the measurable demands of the wider world.`,
    questions: [
      {
        id: 'rp2_005q1',
        type: 'vocab_context',
        question: 'As used in paragraph 3, "correlates" most nearly means',
        options: [
          'corrections',
          'corresponding measurements or indicators',
          'errors or mistakes',
          'improvements',
        ],
        answer: 1,
        explanation: '"Neurological correlates" means measurable brain activity that corresponds to (and thus provides evidence for) the psychological difference between mindsets. A correlate is something that has a mutual or corresponding relationship with something else.',
        xp: 15,
      },
      {
        id: 'rp2_005q2',
        type: 'purpose',
        question: 'What is the purpose of the final paragraph?',
        options: [
          'To refute Dweck\'s growth mindset research',
          'To show that traditional grading is always better',
          'To present a counterargument that complicates the case for narrative feedback',
          'To argue that students should be graded more frequently',
        ],
        answer: 2,
        explanation: 'The final paragraph introduces critics who worry that eliminating grades removes useful feedback and leaves students unprepared. This is a counterargument — it does not refute the earlier evidence, but adds complexity by highlighting a real tension in the reform debate.',
        xp: 20,
      },
      {
        id: 'rp2_005q3',
        type: 'inference',
        question: 'Based on the EEG research described in paragraph 3, what can be inferred about fixed-mindset students?',
        options: [
          'They are less intelligent than growth-mindset students',
          'They pay less neurological attention to errors, which may reduce their ability to learn from them',
          'They experience more anxiety when they fail',
          'They have structurally different brains from growth-mindset students',
        ],
        answer: 1,
        explanation: 'The study shows growth-mindset students have "greater brain activity when processing their own errors" — implying fixed-mindset students show less activity. The passage then connects this attention to "better error correction," so the inference is that less attention → less correction → less improvement.',
        xp: 20,
      },
    ],
  },
];
