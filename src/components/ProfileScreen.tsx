import React, { useState } from 'react';
import {
  User,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Plus,
  X,
  Check,
  Sparkles,
  Pencil,
  TrendingDown,
  DollarSign,
  ChefHat,
  Download,
  RotateCcw
} from 'lucide-react';
import { UserProfile, PantryItem } from '../types';
import { soundFx } from '../utils/audio';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  pantryItems?: PantryItem[];
  onResetData?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onUpdateProfile,
  pantryItems = [],
  onResetData
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const allPreferencesList = [
    'Vegan',
    'Vegetarian',
    'Keto',
    'Paleo',
    'Gluten-Free',
    'Dairy-Free'
  ];

  const commonAllergiesList = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle dietary preference
  const handleTogglePreference = (pref: string) => {
    soundFx.playTap();
    const exists = userProfile.dietaryPreferences.includes(pref);
    const updated = exists
      ? userProfile.dietaryPreferences.filter((p) => p !== pref)
      : [...userProfile.dietaryPreferences, pref];

    onUpdateProfile({ ...userProfile, dietaryPreferences: updated });
  };

  // Toggle allergy
  const handleToggleAllergy = (allergy: string) => {
    soundFx.playTap();
    const exists = userProfile.allergies.includes(allergy);
    const updated = exists
      ? userProfile.allergies.filter((a) => a !== allergy)
      : [...userProfile.allergies, allergy];

    onUpdateProfile({ ...userProfile, allergies: updated });
  };

  const handleAddCustomAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergyInput.trim()) return;
    soundFx.playTap();
    if (!userProfile.allergies.includes(newAllergyInput.trim())) {
      onUpdateProfile({
        ...userProfile,
        allergies: [...userProfile.allergies, newAllergyInput.trim()]
      });
      showToast(`Added "${newAllergyInput.trim()}" to aversions.`);
    }
    setNewAllergyInput('');
  };

  const handleSaveProfileInfo = () => {
    soundFx.playSuccessTone();
    onUpdateProfile({ ...userProfile, name, email });
    setIsEditing(false);
    showToast('Profile information updated.');
  };

  // Export Pantry & Settings Data
  const handleExportData = () => {
    soundFx.playTap();
    const dataObj = {
      userProfile,
      pantryItems,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitchenai_inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Pantry inventory exported as JSON!');
  };

  return (
    <div className="pb-36 pt-6 max-w-xl mx-auto px-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* User Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm mb-8 text-center flex flex-col items-center">
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center overflow-hidden shadow-md">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="absolute bottom-0 right-0 bg-gradient-to-tr from-orange-500 to-amber-500 text-white p-1.5 rounded-full shadow-md border-2 border-white">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {isEditing ? (
          <div className="w-full space-y-3 mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-50 text-center font-headline font-bold text-lg p-2.5 rounded-xl border border-stone-200 text-stone-900 focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-50 text-center font-body text-sm p-2.5 rounded-xl border border-stone-200 text-stone-700 focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-5 py-2 rounded-full font-headline font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfileInfo}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-full font-headline font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-headline font-black text-2xl text-stone-900 mb-1 uppercase tracking-tight">
              {userProfile.name}
            </h1>
            <p className="font-body text-sm text-stone-500 mb-5">{userProfile.email}</p>

            <button
              onClick={() => {
                soundFx.playTap();
                setIsEditing(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-headline font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-500/25 active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Zero-Waste Sustainability Stats */}
      <div className="mb-8">
        <div className="mb-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600">
            [ IMPACT SUMMARY ]
          </span>
          <h2 className="font-headline font-black text-lg text-stone-900 uppercase tracking-tight">
            Zero-Waste Milestones
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Money Saved */}
          <div className="bg-emerald-50/80 p-4 rounded-3xl border border-emerald-200/80 text-center shadow-xs">
            <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="font-headline text-2xl font-black text-emerald-900">
              ${userProfile.stats?.moneySaved || 142}
            </div>
            <div className="text-[9px] font-mono font-bold uppercase text-emerald-700 tracking-wider mt-0.5">
              Saved / Month
            </div>
          </div>

          {/* Waste Diverted */}
          <div className="bg-orange-50/80 p-4 rounded-3xl border border-orange-200/80 text-center shadow-xs">
            <TrendingDown className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <div className="font-headline text-2xl font-black text-orange-900">
              {userProfile.stats?.wasteDivertedLbs || 18.4}
              <span className="text-xs font-normal text-stone-500"> lbs</span>
            </div>
            <div className="text-[9px] font-mono font-bold uppercase text-orange-700 tracking-wider mt-0.5">
              Food Diverted
            </div>
          </div>

          {/* Meals Cooked */}
          <div className="bg-amber-50/80 p-4 rounded-3xl border border-amber-200/80 text-center shadow-xs">
            <ChefHat className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="font-headline text-2xl font-black text-amber-900">
              {userProfile.stats?.recipesCooked || 24}
            </div>
            <div className="text-[9px] font-mono font-bold uppercase text-amber-700 tracking-wider mt-0.5">
              Meals Cooked
            </div>
          </div>
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="mb-8">
        <div className="mb-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600">
            [ NUTRITIONAL FILTER ]
          </span>
          <h2 className="font-headline font-black text-lg text-stone-900 uppercase tracking-tight">
            Dietary Preferences
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {allPreferencesList.map((pref) => {
            const isSelected = userProfile.dietaryPreferences.includes(pref);
            return (
              <button
                key={pref}
                onClick={() => handleTogglePreference(pref)}
                className={`py-3 px-4 rounded-2xl font-headline font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-orange-200 shadow-2xs'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
                {pref}
              </button>
            );
          })}
        </div>
      </div>

      {/* Allergies & Aversions */}
      <div className="mb-8">
        <div className="mb-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600">
            [ HEALTH CONSTRAINTS ]
          </span>
          <h2 className="font-headline font-black text-lg text-stone-900 uppercase tracking-tight">
            Allergies & Aversions
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5 mb-4">
          {userProfile.allergies.map((allergy) => (
            <button
              key={allergy}
              onClick={() => handleToggleAllergy(allergy)}
              className="px-4 py-2 rounded-full font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 bg-rose-500 text-white shadow-xs"
            >
              {allergy} <X className="w-3.5 h-3.5" />
            </button>
          ))}
          {commonAllergiesList
            .filter((a) => !userProfile.allergies.includes(a))
            .map((allergy) => (
              <button
                key={allergy}
                onClick={() => handleToggleAllergy(allergy)}
                className="px-4 py-2 rounded-full font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 shadow-2xs"
              >
                + {allergy}
              </button>
            ))}
        </div>

        {/* Custom Allergy Form */}
        <form onSubmit={handleAddCustomAllergy} className="flex gap-2">
          <input
            type="text"
            value={newAllergyInput}
            onChange={(e) => setNewAllergyInput(e.target.value)}
            placeholder="Add custom aversion (e.g. Cilantro, Mushrooms)..."
            className="flex-1 bg-white text-stone-900 placeholder:text-stone-400 text-xs px-4 py-2.5 rounded-full border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider hover:from-orange-600 hover:to-amber-600 cursor-pointer shadow-md shadow-orange-500/20"
          >
            Add
          </button>
        </form>
      </div>

      {/* Data Management Actions */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden divide-y divide-stone-100 shadow-sm mb-6">
        <div
          onClick={handleExportData}
          className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-100 text-orange-600">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="font-headline font-bold text-sm text-stone-900 uppercase tracking-wide block">
                Export Inventory Backup
              </span>
              <span className="text-[10px] font-mono text-stone-500">
                Download JSON file with your current pantry and dietary settings
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </div>

        {onResetData && (
          <div
            onClick={() => {
              soundFx.playTap();
              if (window.confirm('Reset pantry and scan history to demo defaults?')) {
                onResetData();
                showToast('Pantry reset to default mock state.');
              }
            }}
            className="p-4 flex items-center justify-between hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-stone-100 text-stone-600">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <span className="font-headline font-bold text-sm text-stone-900 uppercase tracking-wide block">
                  Reset Demo Data
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  Restore original sample items and recipes
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </div>
        )}
      </div>
    </div>
  );
};
