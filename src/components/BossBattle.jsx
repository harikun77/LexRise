import { useState, useEffect, useCallback, useRef } from 'react';
import { generateBossQuestions, getCurrentBoss } from '../data/bossBattles';

const TOTAL_TIME   = 180; // 3 minutes in seconds
const QUESTION_COUNT = 10;
const TYPE_COLORS  = { vocab: 'text-indigo-400', grammar: 'text-purple-400', reading: 'text-cyan-400' };
const TYPE_LABELS  = { vocab: '📖 Vocab', grammar: '✍️ Grammar', reading: '📜 Reading' };

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function BossBattle({ state, awardXP, recordWrong, updateQuestProgress, onExit }) {
  const { player } = state;
  const boss = getCurrentBoss(player.level);

  // ── Phase: 'intro' | 'battle' | 'result'
  const [phase, setPhase]         = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx]           = useState(0);
  const [selected, setSelected]   = useState(null);
  const [feedback, setFeedback]   = useState(null);
  const [score, setScore]         = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft]   = useState(TOTAL_TIME);
  const [timedOut, setTimedOut]   = useState(false);
  const timerRef                  = useRef(null);

  // Countdown timer — only runs during 'battle' phase
  useEffect(() => {
    if (phase !== 'battle') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startBattle = useCallback(() => {
    setQuestions(generateBossQuestions(QUESTION_COUNT));
    setQIdx(0);
    setSelected(null);
    setFeedback(null);
    setScore({ correct: 0, total: 0 });
    setTimeLeft(TOTAL_TIME);
    setTimedOut(false);
    setPhase('battle');
  }, []);

  const handleAnswer = (idx) => {
    if (selected !== null || phase !== 'battle') return;
    setSelected(idx);
    const q       = questions[qIdx];
    const correct = idx === q.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));

    if (correct) {
      awardXP(q.xp, q.type === 'vocab' ? 'vocabulary' : q.type === 'grammar' ? 'grammar' : 'reading', q.id);
      updateQuestProgress(q.type === 'vocab' ? 'vocab' : q.type);
      updateQuestProgress('any');
    } else {
      recordWrong(q.type === 'vocab' ? 'vocabulary' : q.type);
    }
  };

  const nextQuestion = useCallback(() => {
    if (qIdx + 1 >= questions.length) {
      clearInterval(timerRef.current);
      setPhase('result');
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
      setFeedback(null);
    }
  }, [qIdx, questions.length]);

  const currentQ   = questions[qIdx];
  const timePct    = (timeLeft / TOTAL_TIME) * 100;
  const timerColor = timeLeft > 60 ? 'bg-green-500' : timeLeft > 30 ? 'bg-yellow-500' : 'bg-red-500';

  // ── Result scoring
  const pct      = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const victory  = pct >= 60 && !timedOut;
  const perfect  = pct === 100 && !timedOut;
  const bonusXP  = victory ? (perfect ? 500 : 250) : 50;
  const bonusGems= victory ? (perfect ? 40  : 20 ) : 5;

  // Award boss bonus once on result phase
  const bonusAwardedRef = useRef(false);
  useEffect(() => {
    if (phase !== 'result' || bonusAwardedRef.current) return;
    bonusAwardedRef.current = true;
    if (victory) {
      awardXP(bonusXP, null, null);
      updateQuestProgress('any', 0); // just ping state
    }
  }, [phase]);

  // ── INTRO SCREEN
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-900/50 rounded-2xl p-8 text-center"
             style={{ boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}>
          {/* Boss */}
          <div className="text-8xl mb-4 animate-float">{boss?.emoji ?? '👿'}</div>
          <div className="text-xs text-red-400 font-bold uppercase tracking-widest mb-2">⚔️ Weekly Boss Battle</div>
          <h1 className="text-3xl font-bold text-white mb-2">{boss?.name ?? 'The Language Beast'}</h1>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">{boss?.description}</p>

          {/* Rules */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-8 text-left space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">⚔️ Battle Rules</div>
            {[
              ['❓', `${QUESTION_COUNT} mixed questions (vocab, grammar, reading)`],
              ['⏱️', `${TOTAL_TIME / 60}-minute time limit — answer fast!`],
              ['🎯', 'Score 60%+ to defeat the boss and earn bonus XP'],
              ['💎', `Bonus rewards: ${bonusXP} XP + ${bonusGems} gems for victory`],
              ['🏆', 'Perfect score: double bonus XP!'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="flex-shrink-0">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={startBattle}
            className="w-full py-5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-xl hover:from-red-500 hover:to-orange-400 transition-all btn-press"
            style={{ boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}
          >
            ⚔️ Begin Battle!
          </button>

          <button onClick={onExit} className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT SCREEN
  if (phase === 'result') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className={`bg-gradient-to-br from-gray-900 to-gray-800 border rounded-2xl p-8 text-center ${
          victory ? 'border-yellow-600/60' : 'border-red-900/50'
        }`} style={{ boxShadow: victory ? '0 0 40px rgba(234,179,8,0.2)' : '0 0 40px rgba(239,68,68,0.15)' }}>

          {/* Result emoji */}
          <div className="text-8xl mb-4">{perfect ? '🏆' : victory ? '⚔️' : timedOut ? '⏰' : '💀'}</div>

          <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${
            victory ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {perfect ? '🎉 Perfect Victory!' : victory ? '⚔️ Boss Defeated!' : timedOut ? '⏰ Time\'s Up!' : '💀 Defeated...'}
          </div>

          <h2 className="text-3xl font-bold text-white mb-1">
            {score.correct} / {score.total}
          </h2>
          <p className="text-gray-400 text-sm mb-6">{pct}% correct</p>

          {/* Score breakdown */}
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                pct >= 80 ? 'bg-gradient-to-r from-yellow-500 to-green-400'
                : pct >= 60 ? 'bg-gradient-to-r from-green-600 to-green-400'
                : 'bg-gradient-to-r from-red-700 to-red-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Rewards */}
          {victory && (
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4 mb-6">
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-2">
                {perfect ? '🏆 Perfect Score Bonus!' : '⚔️ Victory Rewards!'}
              </div>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">+{bonusXP}</div>
                  <div className="text-xs text-gray-400">Bonus XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">+{bonusGems}</div>
                  <div className="text-xs text-gray-400">Gems</div>
                </div>
              </div>
            </div>
          )}

          {!victory && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6 text-sm text-gray-400">
              {timedOut
                ? 'You ran out of time. Practice more and come back next week!'
                : 'Score 60% or higher to defeat the boss. Keep training!'}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onExit}
              className="flex-1 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold hover:bg-gray-700 transition-all btn-press"
            >
              🏠 Dashboard
            </button>
            <button
              onClick={startBattle}
              className={`flex-1 py-4 rounded-xl font-bold text-white transition-all btn-press ${
                victory
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400'
                  : 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400'
              }`}
            >
              {victory ? '⚔️ Fight Again' : '💪 Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── BATTLE SCREEN
  if (!currentQ) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Battle header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{boss?.emoji ?? '👿'}</span>
          <div>
            <div className="text-xs text-red-400 font-bold uppercase tracking-wider">Boss Battle</div>
            <div className="text-sm font-bold text-white">{boss?.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold tabular-nums ${timeLeft <= 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <div className="text-xs text-gray-500">{qIdx + 1} / {questions.length} questions</div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
          style={{ width: `${timePct}%` }}
        />
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-5">
        {questions.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
            i < qIdx     ? (score.correct > i ? 'bg-green-500' : 'bg-red-500')
            : i === qIdx ? 'bg-white'
            : 'bg-gray-700'
          }`} />
        ))}
      </div>

      {/* Question card */}
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 border rounded-2xl p-6 mb-4 ${
        feedback === 'correct' ? 'border-green-500 animate-correct'
        : feedback === 'wrong'   ? 'border-red-500'
        : 'border-red-900/50'
      }`} style={{ boxShadow: '0 0 20px rgba(239,68,68,0.1)' }}>

        {/* Type badge + XP */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium bg-gray-800 border-gray-700 ${TYPE_COLORS[currentQ.type]}`}>
            {TYPE_LABELS[currentQ.type]}
          </span>
          <span className="text-xs text-amber-400 font-semibold">+{currentQ.xp} XP</span>
        </div>

        {/* Passage (reading questions) */}
        {currentQ.passage && (
          <div className="bg-gray-800/70 border border-gray-600 rounded-xl p-4 mb-4 text-sm text-gray-200 leading-relaxed italic">
            "{currentQ.passage}"
          </div>
        )}

        {/* Sentence (grammar questions) */}
        {currentQ.sentence && (
          <div className="bg-gray-800/70 border border-gray-600 rounded-xl p-4 mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sentence</div>
            <div className="text-white font-medium italic">"{currentQ.sentence}"</div>
          </div>
        )}

        {/* Word (vocab questions) */}
        {currentQ.word && !currentQ.sentence && (
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-white">{currentQ.word}</div>
          </div>
        )}

        {/* Question text */}
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
                  {['A','B','C','D'][idx]}
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

      {/* Next button */}
      {selected !== null && (
        <button
          onClick={nextQuestion}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-lg hover:from-red-500 hover:to-orange-400 transition-all btn-press animate-bounce-in"
          style={{ boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
        >
          {qIdx + 1 >= questions.length
            ? '⚔️ See Results'
            : feedback === 'correct' ? '⚡ Next →' : '💪 Keep Fighting →'}
        </button>
      )}
    </div>
  );
}
