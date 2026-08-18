import React, { useState } from 'react';
import { PlayerModel, DailyTrainingPlan } from './types';
import { AppStorage } from './database/storage';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { HomeScreen } from './features/home/HomeScreen';
import { PlayScreen } from './features/play/PlayScreen';
import { LearnScreen } from './features/learn/LearnScreen';
import { ProgressScreen } from './features/progress/ProgressScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { DesignShowcaseModal } from './components/theme/DesignShowcaseModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [playerModel, setPlayerModel] = useState<PlayerModel>(AppStorage.getPlayerModel());
  const [dailyTraining, setDailyTraining] = useState<DailyTrainingPlan>(AppStorage.getDailyTraining());
  const { tokens, isDesignModalOpen, closeDesignModal } = useTheme();

  // Reload model whenever updated
  const handleUpdatePlayerModel = (updated: PlayerModel) => {
    setPlayerModel(updated);
  };

  const handleUpdateDailyTraining = (updated: DailyTrainingPlan) => {
    setDailyTraining(updated);
  };

  return (
    <div className={`min-h-screen ${tokens.appBg} ${tokens.appText} flex flex-col items-center selection:bg-emerald-500/20 selection:text-emerald-800 transition-colors duration-200`}>
      {/* App Shell Container */}
      <div className={`w-full max-w-lg min-h-screen flex flex-col ${tokens.appBg} relative shadow-xl border-x ${tokens.headerBorder}`}>
        {/* Dynamic Viewport */}
        <main className="flex-1 w-full overflow-x-hidden">
          {activeTab === 'home' && (
            <HomeScreen
              playerModel={playerModel}
              dailyTraining={dailyTraining}
              onNavigatePlay={() => setActiveTab('play')}
              onNavigateLearn={() => setActiveTab('learn')}
              onNavigateProgress={() => setActiveTab('progress')}
            />
          )}

          {activeTab === 'play' && (
            <PlayScreen
              playerModel={playerModel}
              onUpdatePlayerModel={handleUpdatePlayerModel}
            />
          )}

          {activeTab === 'learn' && (
            <LearnScreen
              dailyTraining={dailyTraining}
              onUpdateDailyTraining={handleUpdateDailyTraining}
              playerModel={playerModel}
              onUpdatePlayerModel={handleUpdatePlayerModel}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressScreen
              playerModel={playerModel}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileScreen
              playerModel={playerModel}
              onUpdatePlayerModel={handleUpdatePlayerModel}
            />
          )}
        </main>

        {/* Bottom Mobile Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Theme / Design Style Picker Modal */}
        <DesignShowcaseModal
          isOpen={isDesignModalOpen}
          onClose={closeDesignModal}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
