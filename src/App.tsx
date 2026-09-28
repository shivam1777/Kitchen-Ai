/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ScreenTab,
  IdentifiedItem,
  Recipe,
  RecipeCollection,
  PantryItem,
  UserProfile
} from './types';
import {
  INITIAL_IDENTIFIED_ITEMS,
  INITIAL_RECIPES,
  INITIAL_RECIPE_COLLECTIONS,
  INITIAL_PANTRY_ITEMS,
  INITIAL_USER_PROFILE
} from './data/mockData';
import { safeStorage, calculateDaysLeft } from './utils/storage';
import { soundFx } from './utils/audio';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { ScanScreen } from './components/ScanScreen';
import { RecipeResultsScreen } from './components/RecipeResultsScreen';
import { PantryScreen } from './components/PantryScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { CookingModeModal } from './components/CookingModeModal';
import { NotificationModal } from './components/NotificationModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [tabHistory, setTabHistory] = useState<ScreenTab[]>(['home']);

  // Persistent States
  const [identifiedItems, setIdentifiedItems] = useState<IdentifiedItem[]>(() =>
    safeStorage.getIdentified()
  );
  const [recipes, setRecipes] = useState<Recipe[]>(() => safeStorage.getRecipes());
  const [collections, setCollections] = useState<RecipeCollection[]>(() =>
    safeStorage.getCollections()
  );
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => safeStorage.getPantry());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => safeStorage.getProfile());

  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    safeStorage.setIdentified(identifiedItems);
  }, [identifiedItems]);

  useEffect(() => {
    safeStorage.setRecipes(recipes);
  }, [recipes]);

  useEffect(() => {
    safeStorage.setCollections(collections);
  }, [collections]);

  useEffect(() => {
    safeStorage.setPantry(pantryItems);
  }, [pantryItems]);

  useEffect(() => {
    safeStorage.setProfile(userProfile);
  }, [userProfile]);

  // Tab Navigation with history stack
  const handleNavigate = (tab: ScreenTab) => {
    if (tab !== currentTab) {
      soundFx.playTap();
      setTabHistory((prev) => [...prev, tab]);
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    soundFx.playTap();
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop(); // Remove current
      const prevTab = nextHistory[nextHistory.length - 1] || 'home';
      setTabHistory(nextHistory);
      setCurrentTab(prevTab);
    } else {
      setCurrentTab('home');
    }
  };

  // Toggle saved recipe
  const handleToggleSaveRecipe = (recipeId: string) => {
    soundFx.playTap();
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, isSaved: !r.isSaved } : r))
    );
  };

  // Custom Recipe Collections Management Handlers
  const handleCreateCollection = (
    colData: Omit<RecipeCollection, 'id' | 'createdAt'>
  ): string => {
    const id = `col-${Date.now()}`;
    const newCol: RecipeCollection = {
      ...colData,
      id,
      createdAt: new Date().toISOString()
    };
    setCollections((prev) => [newCol, ...prev]);
    return id;
  };

  const handleUpdateCollection = (id: string, updates: Partial<RecipeCollection>) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteCollection = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleRecipeInCollection = (collectionId: string, recipeId: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const exists = c.recipeIds.includes(recipeId);
        return {
          ...c,
          recipeIds: exists
            ? c.recipeIds.filter((id) => id !== recipeId)
            : [...c.recipeIds, recipeId]
        };
      })
    );
    // Mark as saved if added into any collection
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, isSaved: true } : r))
    );
  };

  const handleBatchUpdateCollectionRecipes = (collectionId: string, recipeIds: string[]) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, recipeIds } : c))
    );
    const idSet = new Set(recipeIds);
    setRecipes((prev) =>
      prev.map((r) => (idSet.has(r.id) ? { ...r, isSaved: true } : r))
    );
  };

  const handleAddGroundedRecipe = (recipe: Recipe, targetCollectionId?: string) => {
    setRecipes((prev) => {
      const existing = prev.find((r) => r.id === recipe.id);
      if (existing) return prev;
      return [recipe, ...prev];
    });
    if (targetCollectionId) {
      handleToggleRecipeInCollection(targetCollectionId, recipe.id);
    }
  };

  // Generate AI recipes via backend Express Gemini route
  const handleGenerateRecipes = async (customIngredients?: string[]) => {
    setIsLoading(true);
    const ingredientsToUse =
      customIngredients && customIngredients.length > 0
        ? customIngredients
        : identifiedItems.map((i) => i.name);

    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredientsToUse,
          dietaryPreferences: userProfile.dietaryPreferences,
          allergies: userProfile.allergies
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recipes && data.recipes.length > 0) {
          setRecipes(data.recipes);
          soundFx.playSuccessTone();
        }
      }
    } catch (err) {
      console.warn('Backend recipe generation fallback:', err);
    } finally {
      setIsLoading(false);
      handleNavigate('recipes');
    }
  };

  // Batch Add Scanned Items to Virtual Pantry
  const handleAddScannedToPantry = (newItems: PantryItem[]) => {
    setPantryItems((prev) => {
      // Merge by name or append
      const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
      const filteredNew = newItems.filter((i) => !existingNames.has(i.name.toLowerCase()));
      return [...filteredNew, ...prev];
    });
  };

  // Cook with selected pantry items
  const handleCookWithPantryItems = (selectedIngredientNames: string[]) => {
    // Update identified items to reflect user's selection
    const formatted: IdentifiedItem[] = selectedIngredientNames.map((name, idx) => ({
      id: `selected-${Date.now()}-${idx}`,
      name,
      alertLevel: 'normal',
      category: 'Pantry Selection'
    }));
    setIdentifiedItems(formatted);
    handleGenerateRecipes(selectedIngredientNames);
  };

  // Reset demo data to defaults
  const handleResetData = () => {
    localStorage.clear();
    setPantryItems(INITIAL_PANTRY_ITEMS);
    setIdentifiedItems(INITIAL_IDENTIFIED_ITEMS);
    setRecipes(INITIAL_RECIPES);
    setCollections(INITIAL_RECIPE_COLLECTIONS);
    setUserProfile(INITIAL_USER_PROFILE);
    soundFx.playSuccessTone();
  };

  const savedRecipesCount = recipes.filter((r) => r.isSaved).length;

  // Unread alerts count
  const unreadAlertsCount =
    identifiedItems.filter((i) => i.alertLevel === 'expiring' || i.alertLevel === 'danger').length +
    pantryItems.filter((i) => {
      const days = calculateDaysLeft(i.expiryDate);
      return (days !== null && days <= 3) || i.status === 'Running Low' || i.status === 'Out of Stock';
    }).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900 selection:bg-orange-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background ambient glowing colorful light accents */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-amber-300/40 via-orange-300/30 to-rose-300/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] left-[-150px] w-[450px] h-[450px] bg-gradient-to-tr from-emerald-300/30 via-teal-300/25 to-sky-300/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[10%] w-[500px] h-[500px] bg-gradient-to-tl from-rose-200/40 via-amber-200/35 to-yellow-200/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        unreadNotificationsCount={unreadAlertsCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        canGoBack={tabHistory.length > 1 && currentTab !== 'home'}
        onBack={handleBack}
      />

      {/* Main Screen Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeScreen
            recentlyCookedRecipes={recipes}
            onStartScan={() => handleNavigate('scan')}
            onOpenPantry={() => handleNavigate('pantry')}
            onSelectRecipe={(recipe) => {
              setActiveCookingRecipe(recipe);
            }}
            onViewAllRecipes={() => handleNavigate('recipes')}
          />
        )}

        {currentTab === 'scan' && (
          <ScanScreen
            identifiedItems={identifiedItems}
            onUpdateItems={setIdentifiedItems}
            onGenerateRecipes={() => handleGenerateRecipes()}
            onAddToPantry={handleAddScannedToPantry}
            isLoading={isLoading}
          />
        )}

        {currentTab === 'recipes' && (
          <RecipeResultsScreen
            recipes={recipes}
            collections={collections}
            onSelectRecipe={(recipe) => setActiveCookingRecipe(recipe)}
            onToggleSaveRecipe={handleToggleSaveRecipe}
            onStartCooking={(recipe) => setActiveCookingRecipe(recipe)}
            onRefreshRecipes={() => handleGenerateRecipes()}
            isGenerating={isLoading}
            onCreateCollection={handleCreateCollection}
            onUpdateCollection={handleUpdateCollection}
            onDeleteCollection={handleDeleteCollection}
            onToggleRecipeInCollection={handleToggleRecipeInCollection}
            onBatchUpdateCollectionRecipes={handleBatchUpdateCollectionRecipes}
            onAddGroundedRecipe={handleAddGroundedRecipe}
          />
        )}

        {currentTab === 'pantry' && (
          <PantryScreen
            pantryItems={pantryItems}
            onUpdatePantry={setPantryItems}
            onStartFreshScan={() => handleNavigate('scan')}
            onCookWithIngredients={handleCookWithPantryItems}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            pantryItems={pantryItems}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Interactive Step-By-Step Cooking Mode Modal */}
      {activeCookingRecipe && (
        <CookingModeModal
          recipe={activeCookingRecipe}
          onClose={() => setActiveCookingRecipe(null)}
          onFinishCooking={() => {
            setActiveCookingRecipe(null);
            // Increment user cooked count in stats
            setUserProfile((prev) => ({
              ...prev,
              stats: {
                wasteDivertedLbs: +( (prev.stats?.wasteDivertedLbs || 18.4) + 0.8 ).toFixed(1),
                moneySaved: (prev.stats?.moneySaved || 142) + 6,
                recipesCooked: (prev.stats?.recipesCooked || 24) + 1
              }
            }));
          }}
        />
      )}

      {/* Notifications / Expiration Alert Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        identifiedItems={identifiedItems}
        pantryItems={pantryItems}
        onGoToScan={() => handleNavigate('scan')}
        onGoToPantry={() => handleNavigate('pantry')}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={handleNavigate}
        savedCount={savedRecipesCount}
      />
    </div>
  );
}
