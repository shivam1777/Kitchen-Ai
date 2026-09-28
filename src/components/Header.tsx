import React from 'react';
import { Utensils, Bell, ArrowLeft } from 'lucide-react';
import { ScreenTab } from '../types';

interface HeaderProps {
  currentTab: ScreenTab;
  onNavigate: (tab: ScreenTab) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  unreadNotificationsCount,
  onOpenNotifications,
  canGoBack,
  onBack
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-xl border-b border-stone-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {canGoBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="p-2 -ml-2 text-white bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 shadow-sm shadow-orange-500/25 hover:shadow-md transition-all rounded-xl active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label="Menu"
            >
              <Utensils className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={() => onNavigate('home')}
            className="font-headline text-xl font-black text-stone-900 cursor-pointer tracking-tight uppercase select-none flex items-center gap-1"
          >
            <span>Kitchen</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-500 to-amber-600">.AI</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ZERO-WASTE STUDIO
          </span>
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-all active:scale-95 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-tr from-orange-500 to-rose-500 text-white text-[10px] font-mono font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
