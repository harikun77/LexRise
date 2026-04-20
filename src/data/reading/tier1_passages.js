// ============================================================
// Reading Citadel — Tier 1 Passages (8th Grade Level)
// Short passages (150-250 words), straightforward comprehension,
// main idea, basic inference, vocabulary in context
// Question types: main_idea | inference | vocab_context | detail | purpose
// ============================================================

export const READING_T1 = [
  {
    id: 'rp1_001',
    title: 'The Science of Sleep',
    tier: 1,
    passage: `Sleep is not simply a time when the body shuts down. Scientists have discovered that the sleeping brain is extraordinarily active, performing critical tasks that keep us healthy and functioning well.

During sleep, the brain processes the information gathered throughout the day. Memories are strengthened, and unnecessary data is cleared away — a process researchers compare to defragmenting a computer's hard drive. Without adequate sleep, this consolidation cannot occur, which is why students who pull all-nighters often perform worse on exams than those who sleep.

Sleep also plays a vital role in physical health. The body releases growth hormones primarily during deep sleep, repairing muscle tissue and reinforcing the immune system. Chronic sleep deprivation has been linked to increased risk of diabetes, heart disease, and obesity.

Despite these well-documented benefits, surveys show that nearly one-third of adults regularly sleep fewer than seven hours per night — the minimum most experts recommend. Teenagers require even more, typically between eight and ten hours, yet school start times and academic pressures frequently cut their sleep short.

Understanding the biology of sleep has led researchers to advocate for later school start times and workplace policies that discourage overworking. The science is clear: sacrificing sleep does not produce more — it produces less.`,
    questions: [
      {
        id: 'rp1_001q1',
        type: 'main_idea',
        question: 'The central claim of this passage is that sleep',
        options: [
          'is mainly important for physical growth in teenagers',
          'is an active, essential biological process with serious consequences when neglected',
          'should be regulated by government policy',
          'affects memory but has little impact on physical health',
        ],
        answer: 1,
        explanation: 'The passage argues across multiple paragraphs that sleep is active (not passive), critical for memory and physical health, and that neglecting it has documented negative consequences. This makes choice B the most complete central claim.',
        xp: 15,
      },
      {
        id: 'rp1_001q2',
        type: 'detail',
        question: 'According to the passage, what happens to memories during sleep?',
        options: [
          'They are permanently erased to make room for new information',
          'They are transferred from short-term to long-term storage',
          'They are strengthened and unnecessary data is cleared away',
          'They are unaffected — memory consolidation happens while awake',
        ],
        answer: 2,
        explanation: 'The passage directly states: "Memories are strengthened, and unnecessary data is cleared away." This is a detail question — the answer is explicitly in the text.',
        xp: 10,
      },
      {
        id: 'rp1_001q3',
        type: 'vocab_context',
        question: 'As used in the passage, "consolidation" (paragraph 2) most nearly means',
        options: [
          'the merging of two separate organizations',
          'the process of strengthening and organizing stored information',
          'the act of sleeping for an extended period',
          'a method of studying more efficiently',
        ],
        answer: 1,
        explanation: 'In context, "consolidation" refers to the brain\'s process of strengthening memories during sleep. The passage uses the computer defragmentation metaphor to clarify this meaning.',
        xp: 15,
      },
      {
        id: 'rp1_001q4',
        type: 'inference',
        question: 'Based on the final paragraph, what can be inferred about the author\'s view?',
        options: [
          'People should be legally required to sleep eight hours per night',
          'Cultural attitudes about productivity contribute to widespread sleep deprivation',
          'Sleep deprivation only affects teenagers, not adults',
          'Researchers disagree about how much sleep people need',
        ],
        answer: 1,
        explanation: 'The final paragraph mentions "workplace policies that discourage overworking" and notes that school pressures cut sleep short. This implies the author believes societal/cultural pressures on productivity are a root cause of the problem.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp1_002',
    title: 'The History of Public Libraries',
    tier: 1,
    passage: `The public library as we know it today is a relatively recent invention. For most of human history, books were scarce and expensive, accessible only to the wealthy. The first true public libraries — ones open to all citizens free of charge — emerged in the United States during the mid-nineteenth century.

The movement gained momentum largely through the philanthropy of industrialists who believed that an educated working class would benefit society as a whole. Andrew Carnegie, the Scottish-American steel magnate, funded the construction of over 2,500 libraries across the English-speaking world between 1883 and 1929. Carnegie believed that libraries gave ambitious individuals the tools to improve their circumstances through self-education.

However, the history of public libraries is not without its contradictions. Many early libraries in the American South were racially segregated, denying Black citizens access to the very institution meant to serve everyone. The struggle to desegregate libraries, which continued into the 1960s, forms an important but often overlooked chapter in the Civil Rights Movement.

Today, public libraries have evolved far beyond their book-lending origins. They provide internet access, job training programs, social services, and community gathering spaces — especially critical in low-income neighborhoods. Their ongoing relevance demonstrates that the original vision — equal access to knowledge — remains both radical and necessary.`,
    questions: [
      {
        id: 'rp1_002q1',
        type: 'main_idea',
        question: 'What is the primary purpose of this passage?',
        options: [
          'To argue that Andrew Carnegie deserves more credit for funding libraries',
          'To trace the origins, contradictions, and continuing relevance of public libraries',
          'To explain why libraries are more important than schools',
          'To describe the racial segregation of libraries in the American South',
        ],
        answer: 1,
        explanation: 'The passage covers the historical origins of public libraries, Carnegie\'s role, the contradiction of segregation, and their modern evolution. Choice B best captures this full arc.',
        xp: 15,
      },
      {
        id: 'rp1_002q2',
        type: 'vocab_context',
        question: 'As used in paragraph 2, "philanthropy" most nearly means',
        options: [
          'government funding',
          'religious charity',
          'the donation of money or resources to benefit society',
          'investment intended to generate profit',
        ],
        answer: 2,
        explanation: 'The passage uses "philanthropy" to describe Carnegie\'s funding of libraries for public benefit. It is neither government funding (public) nor profit-driven (investment), making "donation for social benefit" the best choice.',
        xp: 15,
      },
      {
        id: 'rp1_002q3',
        type: 'inference',
        question: 'The author describes the desegregation of libraries as "often overlooked" most likely to suggest that',
        options: [
          'the Civil Rights Movement was not very important',
          'historians have ignored the Civil Rights Movement entirely',
          'this aspect of the struggle for equality deserves more attention',
          'libraries were not really important to Black citizens',
        ],
        answer: 2,
        explanation: 'By calling the library desegregation movement "an important but often overlooked chapter," the author implies it should receive more historical attention than it typically does — a subtle argument for its significance.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp1_003',
    title: 'Plastic in the Ocean',
    tier: 1,
    passage: `Every year, an estimated eight million metric tons of plastic enter the world's oceans. Unlike organic materials, most plastics do not biodegrade — they simply break into smaller and smaller fragments called microplastics. These particles, often invisible to the naked eye, have been found everywhere from the deepest ocean trenches to Arctic sea ice.

Marine animals frequently mistake plastic debris for food. Sea turtles consume plastic bags that resemble jellyfish. Seabirds feed plastic fragments to their chicks, mistaking them for fish. Studies have found plastic in the digestive systems of over 700 marine species, often causing internal injuries, starvation, and death.

The impact extends to humans as well. Microplastics have been detected in drinking water, sea salt, and even human blood. While scientists are still studying the health effects, early research suggests that some plastic compounds can disrupt hormones and cause inflammation.

Solving the plastic crisis requires action at multiple levels. Individual choices — reducing single-use plastic, recycling properly — can help, but experts emphasize that systemic change is equally essential. Without policies that hold manufacturers responsible for the plastic they produce, individual efforts alone will be insufficient.`,
    questions: [
      {
        id: 'rp1_003q1',
        type: 'detail',
        question: 'According to the passage, why do sea turtles consume plastic bags?',
        options: [
          'They cannot detect the smell of plastic',
          'Plastic bags resemble their natural prey, jellyfish',
          'Plastic bags float at the surface where turtles feed',
          'Turtles are attracted to the color of plastic',
        ],
        answer: 1,
        explanation: 'The passage explicitly states: "Sea turtles consume plastic bags that resemble jellyfish." This is a direct detail question.',
        xp: 10,
      },
      {
        id: 'rp1_003q2',
        type: 'vocab_context',
        question: 'In the context of the passage, "systemic" (final paragraph) most nearly means',
        options: [
          'relating to the human digestive system',
          'affecting the entire structure or organization, not just individual parts',
          'based on scientific research',
          'gradual and difficult to detect',
        ],
        answer: 1,
        explanation: '"Systemic change" is contrasted with individual choices, meaning change at the level of the whole system (manufacturing, policy, industry) rather than personal behavior. This is a vocabulary-in-context question.',
        xp: 15,
      },
      {
        id: 'rp1_003q3',
        type: 'inference',
        question: 'What does the final paragraph imply about individual recycling efforts?',
        options: [
          'They are pointless and should be abandoned',
          'They are helpful but not sufficient on their own to solve the plastic crisis',
          'They are more effective than government policy',
          'They have already significantly reduced ocean plastic',
        ],
        answer: 1,
        explanation: 'The author says individual choices "can help" but adds that systemic change is "equally essential" and that individual efforts "alone will be insufficient." This means recycling helps but is not enough by itself.',
        xp: 20,
      },
    ],
  },

  {
    id: 'rp1_004',
    title: 'The Wright Brothers and the Press',
    tier: 1,
    passage: `On December 17, 1903, Orville and Wilbur Wright made the first powered airplane flight near Kitty Hawk, North Carolina. The longest of their four flights that day lasted just 59 seconds. Yet when the brothers telegraphed news of their achievement to their father, expecting headlines, they were met with almost total silence from the press.

Most newspapers either ignored the story or dismissed it as a hoax. Reporters who had not witnessed the event could not believe that two bicycle mechanics from Ohio — men without formal engineering degrees or government funding — had accomplished what so many well-financed experts had failed to do. The dismissal was as much about social assumptions as it was about skepticism.

It was not until 1908, when the Wright brothers demonstrated powered flight publicly in France, that the world fully accepted the reality of their achievement. The French crowds were so astonished that newspapers across Europe finally gave the story the attention it deserved.

The Wright brothers' story illustrates a pattern common in the history of innovation: genuine breakthroughs are frequently met with disbelief, especially when the inventors defy expectations about who is qualified to make them.`,
    questions: [
      {
        id: 'rp1_004q1',
        type: 'inference',
        question: 'According to the passage, why did many reporters dismiss the Wright brothers\' claim?',
        options: [
          'The flight was too short to be considered significant',
          'Reporters assumed that uneducated bicycle mechanics could not have achieved what trained experts had not',
          'The Wright brothers refused to allow reporters to photograph the flight',
          'The telegraph message was garbled and unclear',
        ],
        answer: 1,
        explanation: 'The passage states reporters "could not believe that two bicycle mechanics from Ohio — men without formal engineering degrees... had accomplished what so many well-financed experts had failed to do." The dismissal was rooted in assumptions about class and credentials.',
        xp: 20,
      },
      {
        id: 'rp1_004q2',
        type: 'purpose',
        question: 'What is the main purpose of the final paragraph?',
        options: [
          'To criticize reporters who did not cover the Kitty Hawk flight',
          'To place the Wright brothers\' story within a broader pattern about how innovations are received',
          'To argue that the French were more open-minded than Americans',
          'To summarize the technical details of the 1903 flight',
        ],
        answer: 1,
        explanation: 'The final paragraph uses the phrase "a pattern common in the history of innovation" to zoom out from the specific story and make a general claim — placing the anecdote into a larger argument about how breakthroughs are typically received.',
        xp: 15,
      },
      {
        id: 'rp1_004q3',
        type: 'vocab_context',
        question: 'As used in the passage, "dismissal" (paragraph 2) most nearly means',
        options: [
          'firing an employee',
          'the act of sending someone away',
          'a refusal to take something seriously',
          'a formal rejection by a court',
        ],
        answer: 2,
        explanation: 'In context, "dismissal" describes how the press rejected and ignored the Wright brothers\' claim without seriously investigating it. Choice C best captures this meaning of treating something as unworthy of attention.',
        xp: 15,
      },
    ],
  },

  {
    id: 'rp1_005',
    title: 'The Language of Bees',
    tier: 1,
    passage: `In the 1940s, Austrian zoologist Karl von Frisch made a discovery so surprising that it took decades for the scientific community to fully accept it: honeybees communicate the location of food sources to their hivemates through elaborate dances.

When a forager bee finds a rich patch of flowers, it returns to the hive and performs one of two dances. If the food source is nearby — within about 80 meters — the bee performs a "round dance," circling in alternating directions. For more distant sources, the bee performs a "waggle dance," a figure-eight pattern in which the bee vibrates its abdomen. The angle of the waggle run relative to vertical indicates the direction of the food source relative to the sun, while the duration of the waggle indicates distance.

Von Frisch's research demonstrated that honeybees possess a form of symbolic communication — one of very few non-human species known to do so. The "language" of bees is even more remarkable because it operates in complete darkness inside the hive, relying entirely on touch and vibration rather than vision.

Von Frisch was awarded the Nobel Prize in Physiology or Medicine in 1973 for this discovery, sharing the prize with Konrad Lorenz and Nikolaas Tinbergen for their collective contributions to behavioral biology.`,
    questions: [
      {
        id: 'rp1_005q1',
        type: 'detail',
        question: 'According to the passage, what does the duration of the waggle run communicate?',
        options: [
          'The quality of the food source',
          'The direction of the food source relative to the sun',
          'The distance to the food source',
          'The type of flower at the food source',
        ],
        answer: 2,
        explanation: 'The passage states clearly: "the duration of the waggle indicates distance." The direction is communicated by the angle, not the duration.',
        xp: 10,
      },
      {
        id: 'rp1_005q2',
        type: 'inference',
        question: 'Why does the author note that "it took decades for the scientific community to fully accept" von Frisch\'s discovery?',
        options: [
          'To suggest that von Frisch made errors in his research',
          'To imply that the idea of animal symbolic communication challenged existing scientific assumptions',
          'To explain why it took so long for von Frisch to win the Nobel Prize',
          'To argue that scientists are generally slow to adopt new ideas',
        ],
        answer: 1,
        explanation: 'The discovery was "so surprising" that it faced resistance — this suggests it contradicted prevailing beliefs that symbolic communication was uniquely human. The delay reflects how disruptive the idea was, not flaws in the research.',
        xp: 20,
      },
      {
        id: 'rp1_005q3',
        type: 'vocab_context',
        question: 'As used in paragraph 3, "symbolic" communication most nearly means',
        options: [
          'communication using written symbols like letters',
          'communication using representations that stand for something else',
          'communication that involves physical contact',
          'communication between members of the same family',
        ],
        answer: 1,
        explanation: 'The waggle dance is "symbolic" because the movements represent real-world information (direction, distance) rather than directly demonstrating it. This is the core meaning of symbolic communication — one thing stands for another.',
        xp: 15,
      },
    ],
  },
];
