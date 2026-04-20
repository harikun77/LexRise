// ============================================================
// SAT Reading Comprehension Passages
// Source: College Board SAT Practice Tests #5 and #11
// ============================================================
// 10 passages covering all major SAT question types:
//   main_idea, purpose, inference, detail, evidence, structure
// IDs continue from rp3_005 → rp3_006 through rp3_015
// ============================================================

export const SAT_PASSAGES = [

  // ── Test 11 · Module 1 ─────────────────────────────────────
  {
    id: 'rp3_006',
    title: 'Public Art and Its Critics (Paired Texts)',
    tier: 3,
    passage: `TEXT 1
Good art often challenges and disrupts social and aesthetic norms, but the creation of public art—paintings, sculptures, and performance pieces displayed in nonmuseum public settings—typically requires broad agreement among artists, civic officials, and community members about the works' message and artistic goals. Public art that fails to appease everyone by being sufficiently bland almost inevitably provokes backlash.

TEXT 2
Public art is commonly displayed in spaces intended for purposes other than meaningful aesthetic engagement. Some critics of public art therefore note that norm-defying pieces that aren't effectively integrated within their surroundings—in a manner that primes passersby to appreciate the pieces' merits—tend to be regarded more unfavorably than similarly provocative art encountered in museums.`,
    questions: [
      {
        id: 'rp3_006q1',
        type: 'evidence',
        question: "Based on the texts, how would the critics mentioned in Text 2 most likely respond to the claim in Text 1 that unconventional public art 'almost inevitably provokes backlash'?",
        options: [
          'By arguing that the reason members of the general public disagree about a public artwork\'s merits is unrelated to the unconventionality of its appearance',
          'By agreeing that only works of art that are universally appealing are suitable for displaying in public spaces',
          'By disputing that civic leaders are easily placated by art intended mainly to reinforce social norms',
          'By contending that the reactions controversial public artworks receive are not exclusively the result of attributes inherent in the works themselves',
        ],
        answer: 3,
        explanation: 'Text 2\'s critics argue that backlash is partly due to context—spaces not designed for aesthetic engagement, poor integration into surroundings—not only the content of the artwork itself. So reactions aren\'t "exclusively the result of attributes inherent in the works." They would challenge Text 1\'s implication that the art alone causes backlash.',
        xp: 25,
      },
    ],
  },

  {
    id: 'rp3_007',
    title: 'Youth Entrepreneurship',
    tier: 3,
    passage: `The average age at which people in the United States start businesses is 35. Economist Andrés Hincapié studied why young adults are relatively less likely to start businesses and whether there are ways to increase entrepreneurship in early adulthood. Hincapié found that one impediment is lack of knowledge about the practical details of how businesses are started; he further found that simply providing young adults with good informational resources on the topic significantly alleviates this problem.`,
    questions: [
      {
        id: 'rp3_007q1',
        type: 'inference',
        question: 'Based on the text, what would Hincapié most likely say is a promising way to increase entrepreneurship in early adulthood?',
        options: [
          'Creating social networks of young adults who are interested in starting a business',
          'Encouraging young adults to brainstorm business ideas independently',
          'Providing young adults with practical information about how to start a business',
          'Giving young adults paid training opportunities at a variety of existing businesses',
        ],
        answer: 2,
        explanation: 'Hincapié found that the key impediment is "lack of knowledge about practical details" and that "providing young adults with good informational resources significantly alleviates this problem." This directly maps to option C. The other options are not mentioned in the passage.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp3_008',
    title: 'The Gray Wolf Returns to Yellowstone',
    tier: 3,
    passage: `Following the eradication of the gray wolf in Yellowstone National Park in 1926, the population of elk—a primary prey of the gray wolf—exceeded a healthy size for the park's ecosystem. Elk overpopulation led to overgrazing of areas that a multitude of other animals relied on for food and shelter. As scientists began to see how essential the gray wolf was to the Yellowstone food chain, ecological restoration strategies were employed to reintroduce the gray wolf to the park in 1996. The rebound effect in the park's natural ecosystem was noticed almost immediately.`,
    questions: [
      {
        id: 'rp3_008q1',
        type: 'purpose',
        question: 'Which choice best describes the overall structure of the text?',
        options: [
          'It summarizes a problem that developed in Yellowstone in the 1920s and then offers potential solutions.',
          'It mentions the elimination of the gray wolf from Yellowstone and then explains why the wolf was eventually restored to the park.',
          'It presents a claim about the health of the Yellowstone gray wolf population and then gives examples to support that claim.',
          'It explains why Yellowstone allowed the eradication of the gray wolf and then discusses the consequences of reintroducing the wolf.',
        ],
        answer: 1,
        explanation: 'The passage describes the gray wolf\'s elimination (1926), the consequences (elk overpopulation, overgrazing), scientists\' recognition of the wolf\'s ecological role, and the eventual reintroduction (1996). Option B correctly captures this: the passage mentions the elimination and then explains why the wolf was restored.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp3_009',
    title: 'Matabele Ants and Wound Treatment',
    tier: 3,
    passage: `A team of researchers discovered that Matabele ants can identify an infected wound in a member of the colony and then treat the infection by covering the wound with antimicrobial secretions that the ants produce. The team found that the mortality rate for Matabele ants with infected injuries was reduced by 90% with this treatment, and they are hopeful that this discovery could aid in the development of new antibiotics for human use.`,
    questions: [
      {
        id: 'rp3_009q1',
        type: 'purpose',
        question: 'Which choice best describes the overall structure of the text?',
        options: [
          'It summarizes research findings on Matabele ants and then identifies an area for further research.',
          'It introduces a study and then explains the research methods used.',
          'It describes unique properties of Matabele ants and then speculates on how those properties evolved.',
          'It identifies an issue concerning Matabele ants and then proposes a solution.',
        ],
        answer: 0,
        explanation: 'The passage describes the discovery (ants treat infected wounds, reducing mortality by 90%) and then identifies a potential area for further research (developing new antibiotics for humans). Option A is the only choice that correctly identifies both moves: findings + area for further research.',
        xp: 20,
      },
    ],
  },

  // ── Test 5 · Module 1 ──────────────────────────────────────
  {
    id: 'rp3_010',
    title: 'Astrobiologists in the Atacama Desert',
    tier: 3,
    passage: `Chile's Atacama Desert is one of the driest places on Earth. Mary Beth Wilhelm and other astrobiologists search for life, or its remains, in this harsh place because the desert closely mirrors the extreme environment on Mars. The algae and bacteria found in Atacama's driest regions may offer clues about Martian life. By studying how these and other microorganisms survive such extreme conditions on Earth, Wilhelm's team hopes to determine whether similar life might have existed on Mars and to develop the best tools to look for evidence of it.`,
    questions: [
      {
        id: 'rp3_010q1',
        type: 'purpose',
        question: "Which choice best describes the function of the sentence 'The algae and bacteria found in Atacama's driest regions may offer clues about Martian life' in the text as a whole?",
        options: [
          'To contrast the conditions in the Atacama Desert with those on Mars',
          'To explain why many life-forms cannot survive in the Atacama Desert',
          'To indicate why astrobiologists choose to conduct research in the Atacama Desert',
          'To describe certain limitations to conducting scientific study in the Atacama Desert',
        ],
        answer: 2,
        explanation: 'The sentence explains that organisms in the Atacama may offer clues about Martian life—this is precisely the reason astrobiologists go there: the desert mirrors Mars and harbors organisms that illuminate whether Martian life existed. The sentence functions as the rationale for choosing this specific research location.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp3_011',
    title: 'Transit Mode Choice in Mexico City',
    tier: 3,
    passage: `More than 60% of journeys in Mexico City occur via public transit, but simply reproducing a feature of the city's transit system—e.g., its low fares—is unlikely to induce a significant increase in another city's transit ridership. As Erick Guerra et al. have shown, transportation mode choice in urban areas of Mexico is the product of a complex mix of factors, including population density, the spatial distribution of jobs, and demographic characteristics of individuals. System features do affect ridership, of course, but there is an irreducibly contextual dimension of transportation mode choice.`,
    questions: [
      {
        id: 'rp3_011q1',
        type: 'purpose',
        question: "Which choice best describes the function of 'e.g., its low fares' in the text as a whole?",
        options: [
          'It presents an objection to the argument of Guerra et al. about transportation mode choice.',
          'It explains why it is challenging to influence transit ridership solely by altering system characteristics.',
          'It illustrates the claim that a characteristic associated with high transit ridership in Mexico City is not associated with high transit ridership elsewhere.',
          'It substantiates the assertion that population density and the spatial distribution of jobs are important factors in transportation mode choice.',
        ],
        answer: 2,
        explanation: '"e.g., its low fares" is a specific example of a transit system feature. It illustrates the claim that "simply reproducing a feature"—such as low fares, associated with Mexico City\'s high ridership—would not automatically produce the same results elsewhere. The example makes a concrete the abstract point about non-transferable features.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp3_012',
    title: 'Carbon and Nitrogen in Soil',
    tier: 3,
    passage: `Changes to vegetation cover and other human activities influence carbon and nitrogen levels in soil, though how deep these effects extend is unclear. Hypothesizing that differences in land use lead to differences in carbon and nitrogen levels that are not restricted to the topsoil layer (0–30 cm deep), Chukwuebuka Okolo and colleagues sampled soils across multiple land-use types (e.g., grazing land, cropland, forest) within each of several Ethiopian locations. They found, though, that across land-use types, carbon and nitrogen decreased to comparably low levels beyond depths of 30 cm.`,
    questions: [
      {
        id: 'rp3_012q1',
        type: 'purpose',
        question: 'Which choice best describes the overall structure of the text?',
        options: [
          'It describes a phenomenon scientists do not fully understand, explains a research team\'s hypothesis, and then describes a finding that led the team to refine the hypothesis.',
          'It introduces an unresolved scientific question, presents a research team\'s hypothesis, and then describes a finding that conflicts with that hypothesis.',
          'It discusses a process scientists are somewhat unclear about, introduces competing hypotheses, and explains how a team concluded one hypothesis is likely correct.',
          'It explains a hypothesis that has been debated, discusses how a team tested it, and presents data that validate it.',
        ],
        answer: 1,
        explanation: 'The text introduces an unresolved question (how deep land-use effects extend), presents the hypothesis (effects extend beyond topsoil), and then describes a finding that conflicts: carbon and nitrogen decreased to low levels beyond 30 cm regardless of land use—contradicting the hypothesis.',
        xp: 25,
      },
    ],
  },

  // ── Test 5 · Module 2 ──────────────────────────────────────
  {
    id: 'rp3_013',
    title: 'Are Graphic Novels Literature? (Paired Texts)',
    tier: 3,
    passage: `TEXT 1
Graphic novels are increasingly popular in bookstores and libraries, but they shouldn't be classified as literature. By definition, literature tells a story or conveys meaning through language only; graphic novels tell stories through illustrations and use language only sparingly, in captions and dialogue. Graphic novels are experienced as series of images and not as language, making them more similar to film than to literature.

TEXT 2
Graphic novels present their stories through both language and images. Without captions and dialogue, readers would be unable to understand what is depicted in the illustrations: the story results from the interaction of text and image. Moreover, Alison Bechdel's Fun Home and many other graphic novels feature text that is as beautifully written as the prose found in many standard novels. Therefore, graphic novels qualify as literary texts.`,
    questions: [
      {
        id: 'rp3_013q1',
        type: 'evidence',
        question: 'Based on the texts, how would the author of Text 2 most likely respond to the overall argument presented in Text 1?',
        options: [
          'By asserting that language plays a more important role in graphic novels than the author of Text 1 recognizes',
          'By acknowledging that the author of Text 1 has identified a flaw common to all graphic novels',
          'By suggesting that the story lines of certain graphic novels are more difficult to understand than the author of Text 1 claims',
          'By agreeing with the author of Text 1 that most graphic novels aren\'t as well crafted as most literary works',
        ],
        answer: 0,
        explanation: 'Text 1 argues that graphic novels use language only "sparingly" and are experienced primarily as images. Text 2 directly rebuts this: "without captions and dialogue, readers would be unable to understand the illustrations"—language is essential, not sparingly used. Text 2\'s author would say Text 1 dramatically underestimates language\'s role.',
        xp: 25,
      },
    ],
  },

  {
    id: 'rp3_014',
    title: 'Bosco Verticale: Vertical Forest',
    tier: 3,
    passage: `Since its completion in 2014, Bosco Verticale (Vertical Forest)—a pair of residential towers in Milan, Italy, covered by vegetation—has become a striking symbol of environmental sustainability in architecture. Stefano Boeri intended his design, which features balconies home to hundreds of trees, to serve as a model for promoting urban biodiversity. However, the concept has faced skepticism: critics note that although the trees used in Bosco Verticale were specifically cultivated for the project, it's too early to tell if they can thrive in this unusual setting.`,
    questions: [
      {
        id: 'rp3_014q1',
        type: 'detail',
        question: 'According to the text, why are some critics skeptical of the concept behind Bosco Verticale?',
        options: [
          'Some essential aspects of Bosco Verticale\'s design are difficult to adapt to locations other than Milan.',
          'The plant life on Bosco Verticale ended up being less varied than Boeri had envisioned.',
          'The construction of Bosco Verticale was no less environmentally damaging than more conventional buildings.',
          'It is unclear whether Bosco Verticale can support the plant life included in its design.',
        ],
        answer: 3,
        explanation: 'The passage states critics note "it\'s too early to tell if they [the trees] can thrive in this unusual setting." Option D captures this: it is unclear whether the towers can support the plant life. The other options introduce ideas (adaptability to other cities, variety, environmental damage) not mentioned in the passage.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp3_015',
    title: 'Bakhtin on Fabula and Syuzhet',
    tier: 3,
    passage: `Many literary theorists distinguish between fabula, a narrative's content, and syuzhet, a narrative's arrangement and presentation of events. In The Godfather Part II, the fabula is the story of the Corleone family, and the syuzhet is the presentation of the story as it alternates between two timelines. But literary theorist Mikhail Bakhtin maintained that fabula and syuzhet are insufficient to completely describe a narrative—he held that systematic categorizations of artistic phenomena discount the subtle way in which meaning is created by interactions between the artist, the work, and the audience.`,
    questions: [
      {
        id: 'rp3_015q1',
        type: 'main_idea',
        question: 'Which choice best states the main idea of the text?',
        options: [
          'Literary theorist Mikhail Bakhtin argued that there are important characteristics of narratives not fully encompassed by two concepts that other theorists have used to analyze narratives.',
          'Mikhail Bakhtin claimed that meaning is not inherent in a narrative but is created when an audience encounters it, so narratives are interpreted differently by different people.',
          'The storytelling methods used in The Godfather Part II seem complicated but can be understood using two concepts from literary theory.',
          'Narratives told out of chronological order are more difficult for audiences to understand than narratives presented chronologically.',
        ],
        answer: 0,
        explanation: 'The passage introduces fabula and syuzhet as analytical tools, then presents Bakhtin\'s argument that these two concepts are "insufficient to completely describe a narrative." Option A correctly captures this: Bakhtin argued that important characteristics fall outside what fabula and syuzhet can capture. Option B goes further than the text supports; C and D misrepresent the focus.',
        xp: 20,
      },
    ],
  },

];
