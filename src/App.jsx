import { useState, useCallback, useEffect } from 'react';
import useGameState from './hooks/useGameState';
import GameHeader from './components/GameHeader';
import Dashboard from './components/Dashboard';
import VocabForge from './components/VocabForge';
import GrammarDojo from './components/GrammarDojo';
import ReadingCitadel from './components/ReadingCitadel';
import BossBattle from './components/BossBattle';
import Inventory from './components/Inventory';
import Shop from './components/Shop';
import ProgressView from './components/ProgressView';
import { XPPopups, LevelUpModal, QuestCompleteModal, NameSetupModal } from './components/Overlays';
import InstallBanner from './components/InstallBanner';
import './index.css';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [showLevelUp, setShowLevelUp] = useState(false);

  const {
    state,
    xpPopups,
    levelUpAnim,
    questCompleted,
    setQuestCompleted,
    setPlayerName,
    updateVocabSM2,
    bossAvailableThisWeek,
    claimBossWeek,
    exportSave,
    importSave,
    awardXP,
    recordWrong,
    updateQuestProgress,
    xpToNextLevel,
    xpPercent,
    // RPG
    rpgStats,
    equippedWeaponId,
    equippedArmorId,
    usePotion,
    equipWeapon,
    equipArmor,
    buyItem,
    sellItem,
  } = useGameState();

  // Show the level-up modal whenever the hook fires the level-up animation flag
  useEffect(() => {
    if (levelUpAnim) setShowLevelUp(true);
  }, [levelUpAnim]);

  const needsName = state.player.name === 'Scholar';

  return (
    <div className="min-h-screen bg-gray-950">
      {needsName && <NameSetupModal onSave={setPlayerName} />}

      <GameHeader
        player={state.player}
        state={state}
        xpPercent={xpPercent}
        xpToNextLevel={xpToNextLevel}
        onNavigate={setView}
        view={view}
      />

      <main>
        {view === 'dashboard' && (
          <Dashboard
            state={state}
            xpPercent={xpPercent}
            xpToNextLevel={xpToNextLevel}
            onNavigate={setView}
            bossAvailable={bossAvailableThisWeek}
          />
        )}
        {view === 'vocab' && (
          <VocabForge
            state={state}
            awardXP={awardXP}
            recordWrong={recordWrong}
            updateQuestProgress={updateQuestProgress}
            updateVocabSM2={updateVocabSM2}
          />
        )}
        {view === 'grammar' && (
          <GrammarDojo
            state={state}
            awardXP={awardXP}
            recordWrong={recordWrong}
            updateQuestProgress={updateQuestProgress}
          />
        )}
        {view === 'reading' && (
          <ReadingCitadel
            state={state}
            awardXP={awardXP}
            recordWrong={recordWrong}
            updateQuestProgress={updateQuestProgress}
          />
        )}
        {view === 'boss' && (
          <BossBattle
            state={state}
            awardXP={awardXP}
            recordWrong={recordWrong}
            updateQuestProgress={updateQuestProgress}
            onExit={() => { claimBossWeek(); setView('dashboard'); }}
          />
        )}
        {view === 'inventory' && (
          <Inventory
            state={state}
            rpgStats={rpgStats}
            equippedWeaponId={equippedWeaponId}
            equippedArmorId={equippedArmorId}
            equipWeapon={equipWeapon}
            equipArmor={equipArmor}
            usePotion={usePotion}
            sellItem={sellItem}
          />
        )}
        {view === 'shop' && (
          <Shop
            state={state}
            buyItem={buyItem}
            equippedWeaponId={equippedWeaponId}
            equippedArmorId={equippedArmorId}
          />
        )}
        {view === 'progress' && (
          <ProgressView
            state={state}
            exportSave={exportSave}
            importSave={importSave}
          />
        )}
      </main>

      {/* Overlays */}
      <XPPopups popups={xpPopups} />

      {showLevelUp && (
        <LevelUpModal
          level={state.player.level}
          onClose={() => setShowLevelUp(false)}
        />
      )}

      {questCompleted && (
        <QuestCompleteModal
          quest={questCompleted}
          onClose={() => setQuestCompleted(null)}
        />
      )}

      {/* PWA install banner — shows on mobile when not yet installed */}
      <InstallBanner />
    </div>
  );
}
