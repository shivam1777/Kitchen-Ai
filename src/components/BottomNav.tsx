import React from 'react';
import { Home, Bookmark, User, Refrigerator, Camera } from 'lucide-react';
import { ScreenTab } from '../types';
import { soundFx } from '../utils/audio';

interface BottomNavProps {
  currentTab: ScreenTab;
  onNavigate: (tab: ScreenTab) => void;
  savedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  savedCount = 0
}) => {
  const handleNav = (tab: ScreenTab) => {
    soundFx.playTap();
    onNavigate(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center px-4 pb-3 pt-2 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 rounded-t-3xl max-w-lg mx-auto shadow-2xl">
      {/* Home Tab */}
      <button
        onClick={() => handleNav('home')}
        className={`flex flex-col items-center justify-center min-h-[44px] min-w-[54px] px-2.5 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
          currentTab === 'home'
            ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white font-bold shadow-md shadow-orange-500/25'
            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 active:scale-95'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-headline uppercase tracking-wider">Home</span>
      </button>

      {/* Pantry Tab */}
      <button
        onClick={() => handleNav('pantry')}
        className={`flex flex-col items-center justify-center min-h-[44px] min-w-[54px] px-2.5 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
          currentTab === 'pantry'
            ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white font-bold shadow-md shadow-orange-500/25'
            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 active:scale-95'
        }`}
      >
        <Refrigerator className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-headline uppercase tracking-wider">Pantry</span>
      </button>

      {/* Center Camera Scan Tab */}
      <button
        onClick={() => handleNav('scan')}
        className={`relative -top-4 flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200 cursor-pointer shadow-xl active:scale-95 border-2 ${
          currentTab === 'scan'
            ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white border-white ring-4 ring-orange-200 shadow-orange-500/40 scale-110'
            : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white border-white shadow-orange-500/35 hover:scale-105'
        }`}
        aria-label="Scan Fridge"
      >
        <Camera className="w-6 h-6 stroke-[2.2]" />
      </button>

      {/* Saved Recipes Tab */}
      <button
        onClick={() => handleNav('recipes')}
        className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[54px] px-2.5 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
          currentTab === 'recipes'
            ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white font-bold shadow-md shadow-orange-500/25'
            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 active:scale-95'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-headline uppercase tracking-wider">Recipes</span>
        {savedCount > 0 && currentTab !== 'recipes' && (
          <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
        )}
      </button>

      {/* Profile Tab */}
      <button
        onClick={() => handleNav('profile')}
        className={`flex flex-col items-center justify-center min-h-[44px] min-w-[54px] px-2.5 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
          currentTab === 'profile'
            ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white font-bold shadow-md shadow-orange-500/25'
            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 active:scale-95'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-headline uppercase tracking-wider">Profile</span>
      </button>
    </nav>
  );
};
