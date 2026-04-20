// ============================================================
// Reading Citadel — Tier 3 Passages (SAT Level)
// Longer passages (350-500 words), full SAT question types:
// evidence pairing, rhetorical analysis, extended inference,
// data interpretation, paired passages (future)
// ============================================================

export const READING_T3 = [
  {
    id: 'rp3_001',
    title: 'On the Limits of Expertise',
    tier: 3,
    passage: `The twentieth century produced a peculiar faith: that every problem, no matter how complex, could be solved by applying the right expertise. The rise of professional specialization — doctors, economists, engineers, psychologists — created a class of credentialed authorities whose pronouncements carried the weight of scientific objectivity. We built institutions around this faith, granting specialized experts enormous power to shape policy, medicine, law, and daily life.

That faith has been shaken. Phillip Tetlock's landmark twenty-year study of expert political forecasters found that experts performed only marginally better than chance when predicting geopolitical events, and in many cases, highly credentialed specialists performed worse than generalists. The reason, Tetlock argued, is that deep expertise often produces overconfidence: the specialist knows a great deal about a narrow domain and begins to interpret everything through that lens, even when other frameworks would be more illuminating.

This is not an argument against expertise. Surgeons are better at surgery than non-surgeons; epidemiologists better understand disease transmission than the general public. The value of domain-specific knowledge is real and irreplaceable. The problem arises when expertise migrates beyond its legitimate domain — when an economist speaks as if their models of rational behavior fully capture human motivation, or when a neuroscientist implies that understanding the brain resolves questions that are fundamentally philosophical.

Philosopher Isaiah Berlin famously divided thinkers into "foxes" and "hedgehogs." The hedgehog knows one big thing and organizes the world around it; the fox knows many small things and resists reducing complexity to a single organizing principle. Tetlock found that foxes made significantly better forecasts than hedgehogs. The implication is uncomfortable: the depth of specialization that makes an expert authoritative in one domain may, paradoxically, make them less reliable as a judge of the larger world.

A more intellectually honest culture of expertise would require specialists to articulate clearly where their authority ends — and to resist the temptation to speak beyond it. That is a difficult discipline for anyone trained to project confidence. But it may be essential for restoring the public's reasonably calibrated trust in the people it most needs to believe.`,
    questions: [
      {
        id: 'rp3_001q1',
        type: 'main_idea',
        question: 'The central argument of the passage is that',
        options: [
          'experts are generally unreliable and should not be trusted',
          'specialized expertise is most valuable when clearly bounded by its legitimate domain',
          'generalists are superior to specialists in all fields',
          'Tetlock\'s research proves that political forecasting is impossible',
        ],
        answer: 1,
        explanation: 'The author explicitly states "This is not an argument against expertise" — so choices A and C are too extreme. The final paragraph calls for experts to "articulate clearly where their authority ends." The argument is about the proper scope of expertise, not its rejection.',
        xp: 20,
      },
      {
        id: 'rp3_001q2',
        type: 'purpose',
        question: 'The author introduces Berlin\'s fox/hedgehog distinction primarily to',
        options: [
          'provide a historical example that predates Tetlock\'s research',
          'offer a conceptual framework that explains why generalists outperform specialists in prediction',
          'argue that philosophy is more reliable than social science',
          'criticize the tendency of intellectuals to use metaphors',
        ],
        answer: 1,
        explanation: 'The fox/hedgehog distinction explains why foxes (generalists who resist single frameworks) made better forecasts — because the hedgehog\'s deep commitment to one organizing idea distorts judgment. It provides theoretical grounding for Tetlock\'s empirical finding.',
        xp: 25,
      },
      {
        id: 'rp3_001q3',
        type: 'vocab_context',
        question: 'As used in paragraph 5, "calibrated" (as in "calibrated trust") most nearly means',
        options: [
          'enthusiastic and unconditional',
          'skeptical and dismissive',
          'appropriately proportioned and carefully adjusted',
          'publicly expressed and politically motivated',
        ],
        answer: 2,
        explanation: '"Calibrated" comes from calibration — the process of fine-tuning an instrument for accuracy. "Calibrated trust" means trust that is proportioned correctly to the actual reliability of experts — neither blind faith nor blanket rejection.',
        xp: 20,
      },
      {
        id: 'rp3_001q4',
        type: 'evidence',
        question: 'Which of the following, if true, would most directly challenge the author\'s argument?',
        options: [
          'Deep specialists in medicine have saved more lives than generalist practitioners',
          'Tetlock\'s study focused only on political forecasting, where domain expertise is less well-defined than in technical fields',
          'Isaiah Berlin was himself a historian, not a scientist',
          'Some expert economists have accurately predicted major recessions',
        ],
        answer: 1,
        explanation: 'The author uses Tetlock\'s political forecasting study as a central piece of evidence. If the study\'s domain (political prediction) is uniquely unsuited to specialized expertise — unlike medicine or engineering — then the broader argument about expertise overconfidence is weakened. This is a classic "limits of evidence" SAT question.',
        xp: 25,
      },
    ],
  },

  {
    id: 'rp3_002',
    title: 'Two Views on Urban Green Space',
    tier: 3,
    passage: `PASSAGE A
Urban planners have long debated the proper balance between developed land and green space in cities. A growing body of research supports what landscape architects have argued for decades: access to parks, gardens, and tree canopy is not a luxury for urban dwellers — it is a measurable component of public health.

A 2019 meta-analysis of over 140 studies found that access to green space was associated with significant reductions in rates of depression, anxiety, and cardiovascular disease. The mechanisms appear to include reduced heat stress (urban trees lower ambient temperature by up to 8°C), improved air quality, opportunities for physical activity, and the documented psychological effects of exposure to natural environments — what environmental psychologist Stephen Kaplan called "restorative attention."

Critics argue that green space investment crowds out affordable housing in dense urban areas. But this represents a false dilemma. Dense, livable cities in Amsterdam, Singapore, and Seoul demonstrate that thoughtful urban design can integrate abundant green space without sacrificing housing density. The question is not whether to prioritize green space or housing, but how to design urban environments that provide both.

PASSAGE B
The case for urban green space is compelling in theory but complicated in practice by what researchers call the "green gentrification" problem. When a city invests in a new park or green corridor, surrounding property values rise — a welcome outcome for existing property owners, but potentially catastrophic for renters who may be displaced by the very improvements meant to benefit them.

A study of 14 American cities found that low-income neighborhoods gained less green space per capita than wealthier areas, even when controlling for total city investment. The park that improves public health for some residents may simultaneously signal to real estate markets that a neighborhood is being upgraded — accelerating displacement of the residents who needed the health benefits most.

This is not an argument against green space. It is an argument that green space investment, absent complementary policies — rent stabilization, community land trusts, inclusive zoning — may widen the very inequalities it seeks to address. The environmental justice movement has long insisted that who benefits from environmental improvements is as important a question as whether those improvements occur at all.`,
    questions: [
      {
        id: 'rp3_002q1',
        type: 'main_idea',
        question: 'The two passages primarily differ in their',
        options: [
          'conclusions about whether green space improves physical health',
          'focus — Passage A emphasizes benefits of green space, Passage B emphasizes its unintended distributional consequences',
          'assessment of whether cities should invest in parks at all',
          'use of research evidence — Passage A uses studies, Passage B does not',
        ],
        answer: 1,
        explanation: 'Both passages agree that green space has health benefits ("This is not an argument against green space," says Passage B). They differ in that Passage A focuses on the case for investment while Passage B focuses on who actually benefits and who may be displaced.',
        xp: 20,
      },
      {
        id: 'rp3_002q2',
        type: 'inference',
        question: 'The author of Passage B would most likely respond to Passage A\'s final paragraph by saying that',
        options: [
          'Amsterdam, Singapore, and Seoul do not face green gentrification problems',
          'the design challenge of integrating green space and housing still does not address who benefits from the resulting improvements',
          'housing density is a more important goal than green space',
          'Passage A\'s evidence about health outcomes is methodologically flawed',
        ],
        answer: 1,
        explanation: 'Passage B\'s core concern is not whether green space and housing can coexist (Passage A\'s claim) but whether investment reaches the people who need it most or instead accelerates their displacement. Even well-designed cities integrating both could still face gentrification effects.',
        xp: 25,
      },
      {
        id: 'rp3_002q3',
        type: 'vocab_context',
        question: 'As used in Passage B, "complementary policies" most nearly means',
        options: [
          'policies that praise or celebrate green space investment',
          'policies that duplicate or repeat the same investment',
          'additional measures that work together with green space investment to address its side effects',
          'substitute policies that replace green space investment',
        ],
        answer: 2,
        explanation: '"Complementary" means completing or enhancing something else. Passage B argues green space must be paired with rent stabilization, land trusts, and inclusive zoning — policies that address displacement. These work alongside (not replace) the green space investment.',
        xp: 20,
      },
      {
        id: 'rp3_002q4',
        type: 'evidence',
        question: 'Which claim from Passage A is most directly complicated by evidence in Passage B?',
        options: [
          'Green space reduces rates of depression and anxiety',
          'Urban trees lower ambient temperature by up to 8°C',
          'Dense cities can integrate green space without sacrificing housing',
          'Investment in green space benefits urban dwellers broadly',
        ],
        answer: 3,
        explanation: 'Passage A implies green space investment is broadly beneficial to urban residents. Passage B\'s study showing low-income neighborhoods gain less green space per capita directly complicates the assumption that benefits are broadly distributed — some residents benefit while others may be displaced.',
        xp: 25,
      },
    ],
  },

  {
    id: 'rp3_003',
    title: 'The Ethics of Algorithmic Decision-Making',
    tier: 3,
    passage: `When a judge sentences a defendant, a doctor recommends a treatment, or an insurer sets a premium, we expect human judgment — shaped by experience, context, and an implicit ethical framework. Increasingly, however, these decisions are made or heavily influenced by algorithms: statistical models trained on historical data to predict outcomes such as recidivism risk, disease progression, or creditworthiness.

Proponents argue that algorithms represent a meaningful improvement over unaided human judgment. Humans are susceptible to fatigue, mood, implicit bias, and inconsistency; an algorithm, by contrast, applies the same criteria to every case. A 2016 study by researchers at Harvard found that a recidivism prediction tool was roughly as accurate as a random sample of humans — but far more consistent. Consistency, the argument goes, is a form of fairness.

Critics, however, have identified a deeper problem. Algorithms are trained on historical data, which encodes historical inequities. A tool trained to predict recidivism based on factors correlated with prior arrest rates will inherit the racial biases embedded in those arrest records. ProPublica's 2016 analysis of the COMPAS risk assessment tool found that Black defendants were nearly twice as likely as white defendants to be incorrectly labeled as high risk. The algorithm was not programmed to discriminate; it learned to discriminate from data that reflected discrimination.

This tension reveals a fundamental question about the nature of fairness itself. Statistical fairness (equal error rates across groups) and individual fairness (treating similar individuals similarly) can be mathematically incompatible — it is provably impossible to satisfy both simultaneously when base rates of outcomes differ across groups. Algorithmic systems must therefore make choices between competing definitions of fairness, and those choices are inherently political, not merely technical.

The lesson is not that algorithms are categorically worse than human judges. It is that "objective" is not a property that algorithms possess by virtue of being computational. An algorithm launders human value choices through mathematics, giving them the appearance of neutrality. Recognizing this — and demanding transparency about the assumptions embedded in automated systems — is essential for any democratic society that deploys them.`,
    questions: [
      {
        id: 'rp3_003q1',
        type: 'vocab_context',
        question: 'As used in paragraph 5, "launders" most nearly means',
        options: [
          'cleanses of impurities',
          'disguises the true origin or nature of',
          'spreads widely through a population',
          'translates from one language to another',
        ],
        answer: 1,
        explanation: '"Launders" is used metaphorically (like money laundering). An algorithm "launders" human value choices by running them through a mathematical process that makes them appear neutral and objective — concealing their true origin in human decisions.',
        xp: 20,
      },
      {
        id: 'rp3_003q2',
        type: 'inference',
        question: 'Based on paragraph 4, which of the following best describes the author\'s view of algorithmic fairness?',
        options: [
          'Algorithms cannot be fair because they always favor the majority group',
          'Perfect fairness is achievable if algorithms are carefully designed',
          'Choosing between competing definitions of fairness is an unavoidable political decision',
          'Statistical fairness is always preferable to individual fairness',
        ],
        answer: 2,
        explanation: 'The passage states it is "provably impossible" to satisfy both statistical and individual fairness when base rates differ. This means algorithm designers must choose — and that choice is "inherently political, not merely technical." The author is not saying fairness is impossible, but that it requires explicit value choices.',
        xp: 25,
      },
      {
        id: 'rp3_003q3',
        type: 'purpose',
        question: 'What is the rhetorical function of the phrase "it learned to discriminate from data that reflected discrimination" (paragraph 3)?',
        options: [
          'It shifts blame from the algorithm\'s creators to the historical justice system',
          'It emphasizes that discriminatory outcomes can emerge from technically neutral processes applied to biased inputs',
          'It proves that algorithms are programmed to be racially biased',
          'It introduces a counterargument to the ProPublica analysis',
        ],
        answer: 1,
        explanation: 'This phrasing makes the key argument of paragraph 3: the algorithm\'s designers didn\'t intend discrimination, but discriminatory outputs emerged from historically biased training data. The sentence highlights the mechanism — unintentional bias through historical data — which is the passage\'s central technical concern.',
        xp: 25,
      },
      {
        id: 'rp3_003q4',
        type: 'main_idea',
        question: 'Which of the following best captures the author\'s central claim?',
        options: [
          'Algorithmic decision-making should be banned from criminal sentencing',
          'Algorithms are less biased than human judges and should replace them',
          'Algorithmic systems embed value choices that must be recognized and subjected to democratic scrutiny',
          'The mathematical impossibility of fairness makes algorithmic justice inherently futile',
        ],
        answer: 2,
        explanation: 'The final paragraph explicitly states the lesson: not that algorithms are categorically worse, but that "objective" is not what they are. The call to action is for "transparency" and democratic accountability — demanding recognition of the values embedded in these systems, not abandoning them.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp3_004',
    title: 'The Science and Politics of Geoengineering',
    tier: 3,
    passage: `Among the more unsettling ideas circulating in climate policy discussions is stratospheric aerosol injection — the deliberate release of reflective particles into the upper atmosphere to scatter incoming sunlight and reduce global temperatures. The concept is scientifically plausible; large volcanic eruptions have demonstrated that atmospheric particles can produce measurable global cooling. Mount Pinatubo's 1991 eruption temporarily reduced global temperatures by approximately 0.5°C. The question of whether humans should deliberately replicate and sustain such an effect raises scientific, ethical, and geopolitical questions that researchers are only beginning to systematically address.

Proponents argue that aerosol injection could buy crucial time — slowing temperature increases while the world deploys renewable energy infrastructure and removes existing carbon dioxide from the atmosphere. Modeling studies suggest that even modest aerosol injection could significantly reduce extreme heat events and slow glacial melt. Given the pace of climate change and the political obstacles to rapid decarbonization, some researchers argue that refusing to seriously study geoengineering is itself a form of moral negligence.

Opponents raise several objections. The most fundamental is that aerosol injection treats a symptom — rising temperatures — rather than the cause: accumulating greenhouse gases. If injection were to stop suddenly, temperatures would rebound rapidly, potentially causing "termination shock" — a faster warming rate than if nothing had been done. A second objection concerns governance: who decides whether to deploy technology that would alter the climate experienced by every human on Earth? Countries that bear the greatest risk from climate change — low-lying island nations, regions dependent on monsoon patterns that aerosols might disrupt — would have no guaranteed voice in such decisions.

A third concern is moral hazard: the availability of a technological fix may reduce political pressure to undertake the harder work of reducing emissions. If governments and industries believe that geoengineering provides a safety net, they may invest less urgently in the fundamental changes required.

Researchers generally agree that the technology warrants serious scientific study. The deeper dispute is whether studying it — and demonstrating its feasibility — inevitably normalizes it as a policy option, creating momentum that outpaces our ability to govern it wisely.`,
    questions: [
      {
        id: 'rp3_004q1',
        type: 'vocab_context',
        question: 'As used in paragraph 3, "termination shock" refers to',
        options: [
          'the economic cost of ending a geoengineering program',
          'a sudden, rapid warming if aerosol injection were abruptly stopped',
          'the political fallout from a failed climate agreement',
          'the environmental damage caused by volcanic eruptions',
        ],
        answer: 1,
        explanation: 'The passage defines "termination shock" in context: "if injection were to stop suddenly, temperatures would rebound rapidly... a faster warming rate than if nothing had been done." This is the specific risk of abrupt program termination, not economic or political consequences.',
        xp: 20,
      },
      {
        id: 'rp3_004q2',
        type: 'inference',
        question: 'The author mentions Mount Pinatubo in paragraph 1 primarily to',
        options: [
          'argue that volcanic eruptions prove geoengineering is safe',
          'establish that atmospheric aerosols can cool the planet, lending scientific credibility to the concept',
          'show that natural events are more effective than human intervention',
          'introduce the concept of termination shock',
        ],
        answer: 1,
        explanation: 'The Pinatubo example provides a natural proof of concept — aerosols do cool the planet. The author is not arguing it\'s safe or comparing it to human intervention. The purpose is to establish scientific plausibility before moving to the ethical debate.',
        xp: 20,
      },
      {
        id: 'rp3_004q3',
        type: 'purpose',
        question: 'The concept of "moral hazard" (paragraph 4) is introduced to suggest that geoengineering',
        options: [
          'is inherently unethical and should never be studied',
          'might reduce incentives to address the root cause of climate change',
          'will only benefit wealthy countries at the expense of poorer ones',
          'has already influenced some governments to slow their emissions reductions',
        ],
        answer: 1,
        explanation: '"Moral hazard" describes the risk that having a safety net reduces motivation to avoid the underlying risk. Applied here: if geoengineering exists as an option, governments and industries may feel less urgency to reduce emissions — thus undermining the fundamental solution.',
        xp: 20,
      },
      {
        id: 'rp3_004q4',
        type: 'inference',
        question: 'The final paragraph suggests that the most difficult aspect of geoengineering research is',
        options: [
          'the technical challenge of delivering aerosols to the stratosphere',
          'the risk that demonstrating feasibility may make deployment politically inevitable before governance is ready',
          'persuading climate scientists to take the concept seriously',
          'measuring the precise cooling effect of aerosol injection',
        ],
        answer: 1,
        explanation: 'The final paragraph shifts from technical to meta-level: "the deeper dispute is whether studying it... inevitably normalizes it... creating momentum that outpaces our ability to govern it wisely." The concern is not the science but the political and governance implications of the science being done at all.',
        xp: 25,
      },
    ],
  },

  {
    id: 'rp3_005',
    title: 'What We Owe Each Other: Social Contract Theory',
    tier: 3,
    passage: `The idea that political authority derives from the consent of the governed is so familiar that it has lost its original power to shock. In the seventeenth and eighteenth centuries, however, social contract theory was profoundly radical — a direct challenge to the dominant view that rulers derived their authority from God or hereditary right.

Thomas Hobbes, writing in Leviathan (1651) amid the chaos of the English Civil War, argued that human life in a "state of nature" — absent government — would be "solitary, poor, nasty, brutish, and short." Self-interested individuals, without a common authority to enforce agreements, would inevitably fall into conflict. Hobbes's social contract was therefore not a free agreement but a rational necessity: people surrender their natural freedom to a sovereign authority in exchange for security. Crucially, Hobbes's sovereign faced no obligation to govern well; the contract was between citizens, not between citizens and their ruler.

John Locke arrived at a very different conclusion using much of the same framework. Writing in the relatively stable aftermath of England's Glorious Revolution (1688), Locke argued that the state of nature, while inconvenient, was not the war of all against all that Hobbes described. Natural rights — to life, liberty, and property — existed before government and were given by God, not created by the state. Government's legitimate purpose was to protect those pre-existing rights. Crucially for Locke, if a government violated those rights, citizens retained the right of revolution.

Jean-Jacques Rousseau complicated both accounts in 1762 with The Social Contract. Where Hobbes saw natural humanity as self-interested and dangerous, and Locke saw it as rational but inconvenient, Rousseau argued that humans were naturally free and good — corrupted by civilization and inequality. Rousseau's social contract was not about managing self-interest but about achieving collective self-governance through the "general will" — a concept he acknowledged was difficult to define and potentially dangerous to invoke.

These three thinkers share a common structure — natural state, contract, political authority — but arrive at radically different conclusions about what citizens owe their governments and what governments owe their citizens. That these debates remain unresolved is not a failure of philosophy but evidence of how genuinely contested the foundations of political life remain.`,
    questions: [
      {
        id: 'rp3_005q1',
        type: 'inference',
        question: 'The author notes that Hobbes wrote "amid the chaos of the English Civil War" and that Locke wrote "in the relatively stable aftermath" of the Glorious Revolution primarily to suggest that',
        options: [
          'political philosophy is unreliable because it is shaped by historical context',
          'the historical circumstances facing each thinker likely influenced the relative optimism or pessimism of their views',
          'Locke\'s theory is superior because it was written in calmer times',
          'philosophy written during wartime cannot be objective',
        ],
        answer: 1,
        explanation: 'Hobbes\'s brutal view of the state of nature (written during civil war) and Locke\'s more temperate view (written in stability) suggest historical context shaped their philosophical conclusions. The author is not saying this makes either view wrong — just noting the connection.',
        xp: 20,
      },
      {
        id: 'rp3_005q2',
        type: 'vocab_context',
        question: 'As used in the passage, the "general will" (paragraph 4) is best understood as',
        options: [
          'the opinion of the majority of citizens at any given time',
          'a concept referring to collective self-governance that is deliberately left difficult to define',
          'Rousseau\'s term for the sovereign authority',
          'the natural rights that exist prior to government',
        ],
        answer: 1,
        explanation: 'The passage describes the general will as Rousseau\'s concept for achieving "collective self-governance" — and explicitly notes that Rousseau "acknowledged was difficult to define." It is not a simple majority vote, not the sovereign, and not natural rights (those are Locke\'s concept).',
        xp: 20,
      },
      {
        id: 'rp3_005q3',
        type: 'main_idea',
        question: 'The final paragraph primarily serves to',
        options: [
          'argue that Rousseau\'s social contract theory is the most correct',
          'suggest that philosophy has failed to resolve political questions',
          'frame the disagreements among the three thinkers as reflecting genuine, ongoing tensions in political thought',
          'call for a new social contract theory that synthesizes all three views',
        ],
        answer: 2,
        explanation: 'The final paragraph explicitly reframes the unresolved debates as "not a failure of philosophy but evidence of how genuinely contested the foundations of political life remain." The purpose is not to declare a winner but to frame continued disagreement as meaningful in itself.',
        xp: 25,
      },
      {
        id: 'rp3_005q4',
        type: 'evidence',
        question: 'According to the passage, which aspect of Hobbes\'s contract theory most distinguishes it from Locke\'s?',
        options: [
          'Hobbes believed humans were naturally good; Locke did not',
          'Hobbes\'s sovereign had no obligation to govern well; Locke\'s government could be overthrown if it violated rights',
          'Hobbes believed in natural rights; Locke did not',
          'Hobbes wrote later than Locke and had access to more evidence',
        ],
        answer: 1,
        explanation: 'The passage explicitly contrasts these two points: Hobbes\'s sovereign "faced no obligation to govern well; the contract was between citizens, not between citizens and their ruler." For Locke, "if a government violated those rights, citizens retained the right of revolution." This is the core structural difference.',
        xp: 20,
      },
    ],
  },
];
