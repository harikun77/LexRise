import { useState, useCallback } from 'react';
import { VOCAB_WORDS } from '../data/index';
import { pickWordSM2, getScheduleSummary } from '../utils/sm2';

const TIER_NAMES = { 1: '8th Grade', 2: '9th-10th Grade', 3: 'SAT Level' };
const TIER_COLORS = {
  1: 'text-green-400 bg-green-900/30 border-green-700/50',
  2: 'text-blue-400 bg-blue-900/30 border-blue-700/50',
  3: 'text-purple-400 bg-purple-900/30 border-purple-700/50',
};

function getAvailableWords(masteredIds, playerLevel) {
  const tierCap = playerLevel < 5 ? 1 : playerLevel < 12 ? 2 : 3;
  return VOCAB_WORDS.filter(w => w.tier <= tierCap);
}

export default function VocabForge({ state, awardXP, recordWrong, updateQuestProgress, updateVocabSM2 }) {
  const { player, skills, vocabSM2 = {} } = state;
  const masteredIds = skills.vocabulary.masteredIds;
  const pool = getAvailableWords(masteredIds, player.level);
  const [question, setQuestion]   = useState(() => pickWordSM2(pool, vocabSM2) || pool[0]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [showExplanation, setShowExplanation] = useState(false);
  const [roundStreak, setRoundStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  const nextQuestion = useCallback(() => {
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    const freshPool = getAvailableWords(skills.vocabulary.masteredIds, player.level);
    setQuestion(pickWordSM2(freshPool, state.vocabSM2 || {}) || freshPool[0]);
    setQuestionCount(c => c + 1);
  }, [skills.vocabulary.masteredIds, player.level, state.vocabSM2]);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === question.answer;

    // Update SM-2 schedule for this word
    if (updateVocabSM2) updateVocabSM2(question.id, correct);

    if (correct) {
      setFeedback('correct');
      setRoundStreak(s => s + 1);
      awardXP(question.xp, 'vocabulary', question.id);
      updateQuestProgress('vocab');
      if (roundStreak + 1 >= 3) updateQuestProgress('streak');
      if (question.tier === 3) updateQuestProgress('tier3');
      updateQuestProgress('any');
    } else {
      setFeedback('wrong');
      setRoundStreak(0);
      recordWrong('vocabulary');
    }
    setShowExplanation(true);
  };

  const tierPool = getAvailableWords(masteredIds, player.level);
  const tierCap  = player.level < 5 ? 1 : player.level < 12 ? 2 : 3;
  const sm2Stats = getScheduleSummary(vocabSM2);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-2xl shadow-lg glow-blue">
          📖
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Vocabulary Forge</h1>
          <div className="text-sm text-gray-400">{masteredIds.length} / {VOCAB_WORDS.length} words mastered</div>
        </div>
        <div className="ml-auto text-right">
          {sm2Stats.dueToday > 0 && (
            <div className="text-xs bg-red-900/40 border border-red-700/50 text-red-300 rounded-lg px-2 py-1 mb-1">
              📅 {sm2Stats.dueToday} due for review
            </div>
          )}
          <div className="text-lg font-bold text-orange-400">🔥 {roundStreak}</div>
          <div className="text-xs text-gray-500">streak</div>
        </div>
      </div>

      {/* Mastery bar */}
      <div className="bg-gray-800/50 rounded-xl p-3 mb-6 border border-gray-700">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Word Mastery</span>
          <span>{Math.round((masteredIds.length / VOCAB_WORDS.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full xp-bar-fill"
            style={{ width: `${(masteredIds.length / VOCAB_WORDS.length) * 100}%` }}
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

      {/* Question Card */}
      {question && (
        <div key={question.id + questionCount} className={`animate-bounce-in`}>
          <div className={`bg-gradient-to-br from-gray-900 to-gray-800 border rounded-2xl p-6 mb-4 ${
            feedback === 'correct' ? 'border-green-500 animate-correct' :
            feedback === 'wrong' ? 'border-red-500' : 'border-gray-700'
          }`}>
            {/* Tier badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TIER_COLORS[question.tier]}`}>
                {TIER_NAMES[question.tier]}
              </span>
              <span className="text-xs text-amber-400 font-semibold">+{question.xp} XP</span>
            </div>

            {/* Word */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white mb-2">{question.word}</div>
              <div className="text-gray-400 text-sm italic">"{question.example}"</div>
            </div>

            <div className="text-center text-gray-300 text-sm font-medium mb-4">
              What does <span className="text-amber-300 font-bold">"{question.word}"</span> mean?
            </div>

            {/* Options */}
            <div className="space-y-2">
              {question.options.map((opt, idx) => {
                let style = 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500';
                if (selected !== null) {
                  if (idx === question.answer) {
                    style = 'bg-green-900/60 border-green-500 text-green-200';
                  } else if (idx === selected && selected !== question.answer) {
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
            {showExplanation && (
              <div className={`mt-4 p-3 rounded-xl text-sm animate-fade-in ${
                feedback === 'correct'
                  ? 'bg-green-900/40 border border-green-700/50 text-green-200'
                  : 'bg-red-900/40 border border-red-700/50 text-red-200'
              }`}>
                <div className="font-semibold mb-1">
                  {feedback === 'correct' ? '✅ Correct!' : '❌ Not quite —'}
                </div>
                <div className="text-xs opacity-90">
                  <strong>Definition:</strong> {question.definition}
                </div>
              </div>
            )}
          </div>

          {/* Next button */}
          {selected !== null && (
            <button
              onClick={nextQuestion}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold text-lg hover:from-indigo-500 hover:to-blue-400 transition-all btn-press animate-bounce-in glow-blue"
            >
              {feedback === 'correct' ? '⚡ Next Word →' : '💪 Try Another →'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
