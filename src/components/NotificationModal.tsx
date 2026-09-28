import React from 'react';
import { X, AlertTriangle, Bell, Clock, ArrowRight, Calendar } from 'lucide-react';
import { IdentifiedItem, PantryItem } from '../types';
import { calculateDaysLeft, getExpiryBadge } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  identifiedItems: IdentifiedItem[];
  pantryItems: PantryItem[];
  onGoToScan: () => void;
  onGoToPantry: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  identifiedItems,
  pantryItems,
  onGoToScan,
  onGoToPantry
}) => {
  if (!isOpen) return null;

  const expiringScanItems = identifiedItems.filter(
    (i) => i.alertLevel === 'expiring' || i.alertLevel === 'danger'
  );

  const expiringPantryItems = pantryItems.filter((i) => {
    const days = calculateDaysLeft(i.expiryDate);
    return days !== null && days <= 3;
  });

  const runningLowPantry = pantryItems.filter(
    (i) => i.status === 'Running Low' || i.status === 'Out of Stock' || i.quantity <= 1
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-stone-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2 text-orange-600">
            <Bell className="w-5 h-5" />
            <h2 className="font-headline font-black text-xl text-stone-900 uppercase tracking-tight">
              Smart Kitchen Alerts
            </h2>
          </div>
          <button
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Expiring Pantry Items */}
          {expiringPantryItems.length > 0 && (
            <div className="bg-rose-50 p-4.5 rounded-3xl border border-rose-200 shadow-xs">
              <div className="flex items-center gap-2 text-rose-700 font-headline font-black text-xs uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                Pantry Items Expiring Soon ({expiringPantryItems.length})
              </div>
              <div className="space-y-2 mb-3">
                {expiringPantryItems.map((item) => {
                  const badge = getExpiryBadge(item.expiryDate);
                  return (
                    <div key={item.id} className="text-xs font-mono font-bold text-stone-800 flex justify-between items-center">
                      <span>• {item.name} ({item.location || 'Fridge'})</span>
                      <span className="text-rose-700 font-black uppercase text-[10px] tracking-wider bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                        {badge.text}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  soundFx.playTap();
                  onClose();
                  onGoToPantry();
                }}
                className="text-xs font-headline font-bold text-rose-700 hover:text-rose-800 uppercase tracking-wider underline flex items-center gap-1 cursor-pointer"
              >
                View in Pantry & Cook <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Expiring Scanned Items */}
          {expiringScanItems.length > 0 && (
            <div className="bg-amber-50 p-4.5 rounded-3xl border border-amber-200 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-headline font-black text-xs uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4" />
                Expiring Scanned Ingredients ({expiringScanItems.length})
              </div>
              <div className="space-y-1.5 mb-3">
                {expiringScanItems.map((item) => (
                  <div key={item.id} className="text-xs font-mono font-bold text-stone-800 flex justify-between">
                    <span>• {item.name}</span>
                    <span className="text-amber-800 font-black uppercase text-[10px] tracking-wider bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {item.alertLevel === 'danger' ? 'Expires Today!' : 'Expires Soon'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  soundFx.playTap();
                  onClose();
                  onGoToScan();
                }}
                className="text-xs font-headline font-bold text-amber-800 hover:text-amber-900 uppercase tracking-wider underline flex items-center gap-1 cursor-pointer"
              >
                Use in Recipes Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Running Low Pantry Items */}
          {runningLowPantry.length > 0 && (
            <div className="bg-stone-50 p-4.5 rounded-3xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-2 text-stone-800 font-headline font-black text-xs uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Running Low in Pantry ({runningLowPantry.length})
              </div>
              <div className="space-y-1.5 mb-3">
                {runningLowPantry.map((item) => (
                  <div key={item.id} className="text-xs font-mono font-bold text-stone-800 flex justify-between">
                    <span>• {item.name} ({item.category})</span>
                    <span className="text-orange-600 font-mono font-bold text-[10px] uppercase bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      {item.quantity <= 0 ? 'Out of Stock' : `${item.quantity} ${item.unit || 'pcs'}`}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  soundFx.playTap();
                  onClose();
                  onGoToPantry();
                }}
                className="text-xs font-headline font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider underline flex items-center gap-1 cursor-pointer"
              >
                Manage Shopping List <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {expiringScanItems.length === 0 && expiringPantryItems.length === 0 && runningLowPantry.length === 0 && (
            <div className="text-center py-8 text-stone-600">
              <p className="font-headline font-black text-base text-stone-900 mb-1 uppercase tracking-tight">
                All good in your kitchen! 🎉
              </p>
              <p className="font-body text-xs text-stone-500">
                No ingredients are currently expiring or running low.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-3 border-t border-stone-100">
          <button
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-headline font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer shadow-md shadow-orange-500/25"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
