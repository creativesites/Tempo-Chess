import React from 'react';
import { Home, Play, GraduationCap, TrendingUp, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export type NavTab = 'home' | 'play' | 'learn' | 'progress' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { tokens } = useTheme();

  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'play' as NavTab, label: 'Play', icon: Play },
    { id: 'learn' as NavTab, label: 'Learn', icon: GraduationCap },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as NavTab, label: 'Profile', icon: User }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 ${tokens.navBg} border-t ${tokens.navBorder} backdrop-blur-md pb-safe transition-colors duration-200`}>
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? `${tokens.navActiveText} font-bold scale-105`
                  : tokens.navInactiveText
              }`}
            >
              <div className={`p-1 rounded-lg transition ${isActive ? tokens.navActiveBg : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
