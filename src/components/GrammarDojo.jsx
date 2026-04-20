import { useState, useCallback } from 'react';
import { GRAMMAR_CHALLENGES } from '../data/index';

const TIER_NAMES = { 1: '8th Grade', 2: '9th-10th Grade', 3: 'SAT Level' };
const TIER_COLORS = {
  1: 'text-green-400 bg-green-900/30 border-green-700/50',
  2: 'text-blue-400 bg-blue-900/30 border-blue-700/50',
  3: 'text-purple-400 bg-purple-900/30 border-purple-700/50',
};

function getPool(masteredIds, playerLevel) {
  const tierCap = playerLevel < 5 ? 1 : playerLevel < 12 ? 2 : 3;
  return GRAMMAR_CHALLENGES.filter(c => c.tier <= tierCap);
}

function pickChallenge(masteredIds, playerLevel) {
  const pool = getPool(masteredIds, playerLevel);
  const unseen = pool.filter(c => !masteredIds.includes(c.id));
  const source = unseen.length > 0 ? unseen : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export default function GrammarDojo({ state, awardXP, recordWrong, updateQuestProgress }) {
  const { player, skills } = state;
  const masteredIds = skills.grammar.masteredIds;
  const [challenge, setChallenge] = useState(() => pickChallenge(masteredIds, player.level));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [roundStreak, setRoundStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  const nextChallenge = useCallback(() => {
    setSelected(null);
    setFeedback(null);
    setChallenge(pickChallenge(skills.grammar.masteredIds, player.level));
    setQuestionCount(c => c + 1);
  }, [skills.grammar.masteredIds, player.level]);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === challenge.answer;
    if (correct) {
      setFeedback('correct');
      setRoundStreak(s => s + 1);
      awardXP(challenge.xp, 'grammar', challenge.id);
      updateQuestProgress('grammar');
      if (roundStreak + 1 >= 3) updateQuestProgress('streak');
      if (challenge.tier === 3) updateQuestProgress('tier3');
      updateQuestProgress('any');
    } else {
      setFeedback('wrong');
      setRoundStreak(0);
      recordWrong('grammar');
    }
  };

  const tierCap = player.level < 5 ? 1 : player.level < 12 ? 2 : 3;
  const total = GRAMMAR_CHALLENGES.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-lg glow-purple">
          ✍️
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Grammar Dojo</h1>
          <div className="text-sm text-gray-400">{masteredIds.length} / {total} rules mastered</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-lg font-bold text-orange-400">🔥 {roundStreak}</div>
          <div className="text-xs text-gray-500">streak</div>
        </div>
      </div>

      {/* Mastery bar */}
      <div className="bg-gray-800/50 rounded-xl p-3 mb-6 border border-gray-700">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Rule Mastery</span>
          <span>{Math.round((masteredIds.length / total) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full xp-bar-fill"
            style={{ width: `${(masteredIds.length / total) * 100}%` }}
          />
        </div>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3].map(tier => (
            <span key={tier} className={`text-xs px-2 py-0.5 rounded-full border ${tier <= tierCap ? TIER_COLORS[tier] : 'text-gray-600 bg-gray-800/30 border-gray-700/30'}`}>
              {tier <= tierCap ? TIER_NAMES[tier] : `🔒 ${TIER_NAMES[tier]}`}
            </span>
          ))}
        </div>
      </div>

      {/* Challenge Card */}
      {challenge && (
        <div key={challenge.id + questionCount} className="animate-bounce-in">
          <div className={`bg-gradient-to-br from-gray-900 to-gray-800 border rounded-2xl p-6 mb-4 ${
            feedback === 'correct' ? 'border-green-500 animate-correct' :
            feedback === 'wrong' ? 'border-red-500' : 'border-gray-700'
          }`}>
            {/* Tier + XP */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TIER_COLORS[challenge.tier]}`}>
                {TIER_NAMES[challenge.tier]}
              </span>
              <span className="text-xs text-amber-400 font-semibold">+{challenge.xp} XP</span>
            </div>

            {/* Sentence */}
            <div className="bg-gray-800/70 border border-gray-600 rounded-xl p-4 mb-5">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sentence</div>
              <div className="text-white font-medium text-base leading-relaxed italic">
                "{challenge.sentence}"
              </div>
            </div>

            {/* Question */}
            <div className="text-gray-200 font-semibold text-sm mb-4">
              🤔 {challenge.question}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {challenge.options.map((opt, idx) => {
                let style = 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500';
                if (selected !== null) {
                  if (idx === challenge.answer) {
                    style = 'bg-green-900/60 border-green-500 text-green-200';
                  } else if (idx === selected && selected !== challenge.answer) {
                    style = 'bg-red-900/60 border-red-500 text-red-200 animate-wrong';
                  } else {
                    style = 'bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed';
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border font-medium text-sm transition-all btn-press ${style}`}
                  >
                    <span className="inline-block w-6 text-center mr-2 opacity-60">
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {feedback && (
              <div className={`mt-4 p-4 rounded-xl text-sm animate-fade-in ${
                feedback === 'correct'
                  ? 'bg-green-900/40 border border-green-700/50 text-green-200'
                  : 'bg-red-900/40 border border-red-700/50 text-red-200'
              }`}>
                <div className="font-semibold mb-1">
                  {feedback === 'correct' ? '✅ Correct!' : '❌ Not quite —'}
                </div>
                <div className="text-xs leading-relaxed opacity-90">{challenge.explanation}</div>
              </div>
            )}
          </div>

          {/* Next button */}
          {selected !== null && (
            <button
              onClick={nextChallenge}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg hover:from-purple-500 hover:to-pink-400 transition-all btn-press animate-bounce-in glow-purple"
            >
              {feedback === 'correct' ? '⚡ Next Challenge →' : '💪 Keep Going →'}
            </button>
          )}
        </div>
      )}

      {/* Grammar tip */}
      <div className="mt-6 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
        <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">💡 Quick Tip</div>
        <div className="text-xs text-gray-400 leading-relaxed">
          On the SAT Writing section, most errors fall into 5 categories: <span className="text-white">subject-verb agreement</span>, <span className="text-white">pronoun case</span>, <span className="text-white">misplaced modifiers</span>, <span className="text-white">parallel structure</span>, and <span className="text-white">punctuation</span>. Mastering these covers ~80% of grammar questions.
        </div>
      </div>
    </div>
  );
}
