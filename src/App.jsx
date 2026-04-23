import { useState, useCallback, useEffect } from 'react';
import useGameState from './hooks/useGameState';
import GameHeader from './components/GameHeader';
import Dashboard from './components/Dashboard';
import VocabForge from './components/VocabForge';
import GrammarDojo from './components/GrammarDojo';
import ReadingCitadel from './components/ReadingCitadel';
import BossBattle from './components/BossBattle';
import DungeonExplore from './components/DungeonExplore';
import Inventory from './components/Inventory';
import Shop from './components/Shop';
import ProgressView from './components/ProgressView';
import { XPPopups, LevelUpModal, NameSetupModal } from './components/Overlays';
import InstallBanner from './components/InstallBanner';
import BottomNav from './components/BottomNav';
import StudyHub from './components/StudyHub';
import './index.css';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [showLevelUp, setShowLevelUp] = useState(false);

  const {
    state,
    xpPopups,
    levelUpAnim,
    questCompleted,
    setPlayerName,
    updateVocabSM2,
    bossAvailableThisWeek,
    claimBossWeek,
    exportSave,
    importSave,
    awardXP,
    awardGems,
    recordWrong,
    updateQuestProgress,
    xpToNextLevel,
    xpPercent,
    dungeonsCleared,
    // RPG
    rpgStats,
    equippedWeaponId,
    equippedArmorId,
    usePotion,
    equipWeapon,
    equipArmor,
    buyItem,
    sellItem,
    healPlayer,
    takeDamage,
    startDungeonRun,
    completeDungeonNode,
    finishDungeonRun,
    abandonDungeonRun,
  } = useGameState();

  // Show the level-up modal whenever the hook fires the level-up animation flag
  useEffect(() => {
    if (levelUpAnim) setShowLevelUp(true);
  }, [levelUpAnim]);

  const needsName = state.player.name === 'Scholar';

  // ── Dungeon lock ────────────────────────────────────────────
  // When an active dungeon run exists, the player is committed — they
  // cannot leave the Dungeon view via the bottom nav or header shortcuts
  // until they either finish or abandon the run.
  const navLocked = state.activeDungeon != null;

  // Defensive: if something put the view out of sync with lock state
  // (e.g., restored save with activeDungeon), force view back to 'dungeon'.
  useEffect(() => {
    if (navLocked && view !== 'dungeon') setView('dungeon');
  }, [navLocked, view]);

  const handleNavigate = useCallback((dest) => {
    if (navLocked && dest !== 'dungeon') return; // swallow nav attempts
    setView(dest);
  }, [navLocked]);

  return (
    <div className="bg-gray-950" style={{ minHeight: '100dvh' }}>
      {needsName && <NameSetupModal onSave={setPlayerName} />}

      <GameHeader
        player={state.player}
        state={state}
        xpPercent={xpPercent}
        xpToNextLevel={xpToNextLevel}
        onNavigate={handleNavigate}
        view={view}
        locked={navLocked}
      />

      {/* Extra bottom padding so content never hides behind the fixed bottom nav */}
      <main className="pb-24">
        {view === 'dashboard' && (
          <Dashboard
            state={state}
            xpPercent={xpPercent}
            xpToNextLevel={xpToNextLevel}
            onNavigate={setView}
            bossAvailable={bossAvailableThisWeek}
          />
        )}
        {view === 'study' && (
          <StudyHub state={state} onNavigate={setView} />
        )}
        {view === 'vocab' && (
          <VocabForge
            state={state}
            awardXP={awardXP}
            awardGems={awardGems}
            dungeonsCleared={dungeonsCleared}
            recordWrong={recordWrong}
            updateQuestProgress={updateQuestProgress}
            updateVocabSM2={updateVocabSM2}
          />
        )}
        {view === 'grammar' && (
          <GrammarDojo
            state={state}
            awardXP={awardXP}
            awardGems={awardGems}
            dungeonsCleared={dungeonsCleared}
            recordWrong={recordWrong}
            updateQuestProgress={updateQuestProgress}
          />
        )}
        {view === 'reading' && (
          <ReadingCitadel
            state={state}
            awardXP={awardXP}
            awardGems={awardGems}
            dungeonsCleared={dungeonsCleared}
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
        {view === 'dungeon' && (
          <DungeonExplore
            state={state}
            rpgStats={rpgStats}
            awardXP={awardXP}
            recordWrong={recordWrong}
            updateQuestProgress={updateQuestProgress}
            takeDamage={takeDamage}
            healPlayer={healPlayer}
            usePotion={usePotion}
            startDungeonRun={startDungeonRun}
            completeDungeonNode={completeDungeonNode}
            finishDungeonRun={finishDungeonRun}
            abandonDungeonRun={abandonDungeonRun}
            equippedWeaponId={equippedWeaponId}
            equippedArmorId={equippedArmorId}
            onBack={() => setView('dashboard')}
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

      {/* PWA install banner — shows on mobile when not yet installed */}
      <InstallBanner />

      {/* Sticky bottom nav — always visible */}
      <BottomNav view={view} onNavigate={handleNavigate} locked={navLocked} />
    </div>
  );
}
