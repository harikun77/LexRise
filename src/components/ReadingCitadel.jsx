import { useState, useCallback } from 'react';
import { ALL_PASSAGES } from '../data/reading/index';

const TIER_NAMES  = { 1: '8th Grade', 2: '9th-10th Grade', 3: 'SAT Level' };
const TIER_COLORS = {
  1: 'text-green-400 bg-green-900/30 border-green-700/50',
  2: 'text-blue-400 bg-blue-900/30 border-blue-700/50',
  3: 'text-purple-400 bg-purple-900/30 border-purple-700/50',
};
const QUESTION_TYPE_LABELS = {
  main_idea:    { label: 'Main Idea',   color: 'text-amber-400',  bg: 'bg-amber-900/30 border-amber-700/50' },
  inference:    { label: 'Inference',   color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-700/50' },
  vocab_context:{ label: 'Vocab in Context', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700/50' },
  detail:       { label: 'Detail',      color: 'text-green-400',  bg: 'bg-green-900/30 border-green-700/50' },
  purpose:      { label: 'Purpose',     color: 'text-pink-400',   bg: 'bg-pink-900/30 border-pink-700/50' },
  evidence:     { label: 'Evidence',    color: 'text-cyan-400',   bg: 'bg-cyan-900/30 border-cyan-700/50' },
};

function getPool(masteredIds, playerLevel) {
  const tierCap = playerLevel < 8 ? 1 : playerLevel < 15 ? 2 : 3;
  return ALL_PASSAGES.filter(p => p.tier <= tierCap);
}

function pickPassage(masteredQuestionIds, playerLevel) {
  const pool = getPool(masteredQuestionIds, playerLevel);
  // Prefer passages with un-mastered questions
  const partial = pool.filter(p =>
    p.questions.some(q => !masteredQuestionIds.includes(q.id))
  );
  const source = partial.length > 0 ? partial : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export default function ReadingCitadel({ state, awardXP, recordWrong, updateQuestProgress }) {
  const { player, skills } = state;
  const masteredIds = skills.reading.masteredIds;
  const tierCap = player.level < 8 ? 1 : player.level < 15 ? 2 : 3;

  const [passage, setPassage]           = useState(() => pickPassage(masteredIds, player.level));
  const [currentQIdx, setCurrentQIdx]   = useState(0);
  const [selected, setSelected]         = useState(null);
  const [feedback, setFeedback]         = useState(null);
  const [roundStreak, setRoundStreak]   = useState(0);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [passageRead, setPassageRead]   = useState(false);
  const [passageCount, setPassageCount] = useState(0);

  const currentQ = passage?.questions[currentQIdx];
  const qTypeInfo = currentQ ? (QUESTION_TYPE_LABELS[currentQ.type] || QUESTION_TYPE_LABELS.detail) : null;
  const isLastQ = passage && currentQIdx === passage.questions.length - 1;

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === currentQ.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    setSessionScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));

    if (correct) {
      setRoundStreak(s => s + 1);
      awardXP(currentQ.xp, 'reading', currentQ.id);
      updateQuestProgress('reading');
      if (roundStreak + 1 >= 3) updateQuestProgress('streak');
      if (passage.tier === 3)   updateQuestProgress('tier3');
      updateQuestProgress('any');
    } else {
      setRoundStreak(0);
      recordWrong('reading');
    }
  };

  const nextQuestion = useCallback(() => {
    setSelected(null);
    setFeedback(null);
    setCurrentQIdx(i => i + 1);
  }, []);

  const nextPassage = useCallback(() => {
    setSelected(null);
    setFeedback(null);
    setCurrentQIdx(0);
    setPassageRead(false);
    setPassage(pickPassage(skills.reading.masteredIds, player.level));
    setPassageCount(c => c + 1);
  }, [skills.reading.masteredIds, player.level]);

  const totalPassageQuestions = ALL_PASSAGES.flatMap(p => p.questions).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 flex items-center justify-center text-2xl shadow-lg"
             style={{ boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}>
          📜
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Reading Citadel</h1>
          <div className="text-sm text-gray-400">{masteredIds.length} / {totalPassageQuestions} questions mastered</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-lg font-bold text-orange-400">🔥 {roundStreak}</div>
          <div className="text-xs text-gray-500">streak</div>
        </div>
      </div>

      {/* Mastery bar */}
      <div className="bg-gray-800/50 rounded-xl p-3 mb-5 border border-gray-700">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Question Mastery</span>
          <span>{Math.round((masteredIds.length / totalPassageQuestions) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full xp-bar-fill"
            style={{ width: `${(masteredIds.length / totalPassageQuestions) * 100}%` }}
          />
        </div>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3].map(tier => (
            <span key={tier} className={`text-xs px-2 py-0.5 rounded-full border ${
              tier <= tierCap ? TIER_COLORS[tier] : 'text-gray-600 bg-gray-800/30 border-gray-700/30'
            }`}>
              {tier <= tierCap ? TIER_NAMES[tier] : `🔒 ${TIER_NAMES[tier]}`}
            </span>
          ))}
        </div>
      </div>

      {passage && (
        <div key={passage.id + passageCount} className="animate-bounce-in">

          {/* Passage Card */}
          {!passageRead ? (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-4">
              {/* Title row */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TIER_COLORS[passage.tier]}`}>
                  {TIER_NAMES[passage.tier]}
                </span>
                <span className="text-xs text-gray-400">{passage.questions.length} questions</span>
              </div>

              <h2 className="text-lg font-bold text-white mb-4">{passage.title}</h2>

              {/* Passage text */}
              <div className="bg-gray-800/70 border border-gray-600 rounded-xl p-4 mb-5 max-h-72 overflow-y-auto">
                <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                  {passage.passage}
                </div>
              </div>

              {/* Tip */}
              <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-3 mb-5">
                <div className="text-xs text-amber-400 font-semibold mb-1">💡 SAT Reading Strategy</div>
                <div className="text-xs text-gray-300 leading-relaxed">
                  Read the questions before re-reading for detail. For each question, locate specific evidence in the passage — never answer from memory alone.
                </div>
              </div>

              <button
                onClick={() => setPassageRead(true)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-bold text-lg hover:from-cyan-500 hover:to-teal-400 transition-all btn-press"
                style={{ boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
              >
                📖 I've Read It — Start Questions →
              </button>
            </div>
          ) : (
            /* Question Card */
            <div>
              {/* Progress within passage */}
              <div className="flex items-center gap-2 mb-4">
                {passage.questions.map((_, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
                    i < currentQIdx ? 'bg-green-500'
                    : i === currentQIdx ? 'bg-cyan-400'
                    : 'bg-gray-700'
                  }`} />
                ))}
                <span className="text-xs text-gray-400 ml-1">{currentQIdx + 1}/{passage.questions.length}</span>
              </div>

              {/* Passage excerpt (collapsible) */}
              <details className="mb-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <summary className="px-4 py-3 text-sm text-gray-300 cursor-pointer hover:text-white">
                  📄 Re-read passage: <span className="text-cyan-400 font-semibold">{passage.title}</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-300 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto border-t border-gray-700 pt-3 mt-1">
                  {passage.passage}
                </div>
              </details>

              <div className={`bg-gradient-to-br from-gray-900 to-gray-800 border rounded-2xl p-6 mb-4 ${
                feedback === 'correct' ? 'border-green-500 animate-correct'
                : feedback === 'wrong'   ? 'border-red-500'
                : 'border-gray-700'
              }`}>
                {/* Q type + XP */}
                <div className="flex items-center justify-between mb-4">
                  {qTypeInfo && (
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${qTypeInfo.bg} ${qTypeInfo.color}`}>
                      {qTypeInfo.label}
                    </span>
                  )}
                  <span className="text-xs text-amber-400 font-semibold">+{currentQ.xp} XP</span>
                </div>

                {/* Question */}
                <div className="text-gray-100 font-semibold text-sm mb-4 leading-relaxed">
                  🤔 {currentQ.question}
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {currentQ.options.map((opt, idx) => {
                    let style = 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500';
                    if (selected !== null) {
                      if (idx === currentQ.answer)
                        style = 'bg-green-900/60 border-green-500 text-green-200';
                      else if (idx === selected && selected !== currentQ.answer)
                        style = 'bg-red-900/60 border-red-500 text-red-200 animate-wrong';
                      else
                        style = 'bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed';
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
                    <div className="text-xs leading-relaxed opacity-90">{currentQ.explanation}</div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              {selected !== null && (
                <button
                  onClick={isLastQ ? nextPassage : nextQuestion}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-bold text-lg hover:from-cyan-500 hover:to-teal-400 transition-all btn-press animate-bounce-in"
                  style={{ boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
                >
                  {isLastQ
                    ? (feedback === 'correct' ? '📜 Next Passage →' : '📜 Try Another Passage →')
                    : (feedback === 'correct' ? '⚡ Next Question →' : '💪 Keep Going →')
                  }
                </button>
              )}

              {/* Session score when done with passage */}
              {selected !== null && isLastQ && (
                <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center animate-fade-in">
                  <div className="text-xs text-gray-400 mb-1">Passage Complete!</div>
                  <div className="text-2xl font-bold text-white">
                    {sessionScore.correct + (feedback === 'correct' ? 1 : 0)} / {sessionScore.total + 1}
                  </div>
                  <div className="text-xs text-gray-400">questions correct this passage</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Strategy tip at bottom */}
      <div className="mt-6 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
        <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-2">💡 SAT Reading Tip</div>
        <div className="text-xs text-gray-400 leading-relaxed">
          The SAT never tests opinion — every correct answer is directly supported by the text.
          For inference questions, look for the answer that is <span className="text-white">necessarily true</span> based
          on the passage, not merely possible. When in doubt, find the line numbers.
        </div>
      </div>
    </div>
  );
}
