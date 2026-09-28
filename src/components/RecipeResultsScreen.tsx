import React, { useState } from 'react';
import {
  Bookmark,
  Plus,
  Clock,
  Flame,
  AlertTriangle,
  Check,
  ChefHat,
  Sparkles,
  Info,
  RefreshCw,
  Layers,
  Settings2,
  FolderPlus,
  Share2,
  ExternalLink,
  Search,
  Globe,
  X
} from 'lucide-react';
import { Recipe, RecipeCollection } from '../types';
import { CollectionManagerModal } from './CollectionManagerModal';
import { AddToCollectionModal } from './AddToCollectionModal';
import { soundFx } from '../utils/audio';

interface RecipeResultsScreenProps {
  recipes: Recipe[];
  collections?: RecipeCollection[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleSaveRecipe: (recipeId: string) => void;
  onStartCooking: (recipe: Recipe) => void;
  onRefreshRecipes?: () => void;
  isGenerating?: boolean;
  onCreateCollection?: (collection: Omit<RecipeCollection, 'id' | 'createdAt'>) => string;
  onUpdateCollection?: (id: string, updates: Partial<RecipeCollection>) => void;
  onDeleteCollection?: (id: string) => void;
  onToggleRecipeInCollection?: (collectionId: string, recipeId: string) => void;
  onBatchUpdateCollectionRecipes?: (collectionId: string, recipeIds: string[]) => void;
  onAddGroundedRecipe?: (recipe: Recipe, targetCollectionId?: string) => void;
}

export const RecipeResultsScreen: React.FC<RecipeResultsScreenProps> = ({
  recipes,
  collections = [],
  onSelectRecipe,
  onToggleSaveRecipe,
  onStartCooking,
  onRefreshRecipes,
  isGenerating = false,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onToggleRecipeInCollection,
  onBatchUpdateCollectionRecipes,
  onAddGroundedRecipe
}) => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'all' | 'saved'>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('All Meals');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [targetRecipeForOrganize, setTargetRecipeForOrganize] = useState<Recipe | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const mealCategories = ['All Meals', 'Breakfast', 'Lunch', 'Dinner'];

  const savedRecipes = recipes.filter((r) => r.isSaved);
  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  // Filter recipes based on viewMode, collection, mealCategory, and search
  const filteredRecipes = recipes.filter((r) => {
    // 1. View Mode & Collection Filtering
    if (activeCollectionId && activeCollection) {
      if (!activeCollection.recipeIds.includes(r.id)) return false;
    } else if (viewMode === 'saved') {
      if (!r.isSaved) return false;
    }

    // 2. Meal Category Filtering
    if (selectedFilter !== 'All Meals') {
      const matchMeal = r.mealType?.toLowerCase() === selectedFilter.toLowerCase();
      const matchTag = r.dietaryTags.some((tag) => tag.toLowerCase() === selectedFilter.toLowerCase());
      if (!matchMeal && !matchTag) return false;
    }

    // 3. Search Query Filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchIngredient = r.ingredientsUsed.some((i) => i.name.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchIngredient) return false;
    }

    return true;
  });

  const showToast = (text: string) => {
    setCopiedNotification(text);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleShareCollection = (col: RecipeCollection) => {
    soundFx.playTap();
    const colRecipes = recipes.filter((r) => col.recipeIds.includes(r.id));
    const summary = `${col.emoji} ${col.name} (${colRecipes.length} recipes)\n\n` +
      colRecipes.map((r, i) => `${i + 1}. ${r.title} (${r.prepTimeMinutes} min, ${r.calories} kcal)`).join('\n') +
      `\n\nShared via KitchenAI Zero-Waste Studio`;

    navigator.clipboard?.writeText(summary);
    showToast(`Copied "${col.name}" recipe list to clipboard!`);
  };

  // Get collections a recipe belongs to
  const getCollectionsForRecipe = (recipeId: string): RecipeCollection[] => {
    return collections.filter((col) => col.recipeIds.includes(recipeId));
  };

  return (
    <div className="pb-36 pt-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Toast Alert */}
      {copiedNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          {copiedNotification}
        </div>
      )}

      {/* Page Title & Stats */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-2 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-800">
            [ AI RECIPE CURATION &bull; ZERO-WASTE COLLECTIONS ]
          </span>
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-black text-stone-900 mb-2 leading-tight uppercase tracking-tight">
          Ready-To-Cook Meals
        </h1>
        <p className="font-body text-sm md:text-base text-stone-600 max-w-lg mx-auto">
          Tailored to your pantry inventory and organized into personalized collections like Breakfast Favorites and Quick Dinners.
        </p>
      </div>

      {/* Main View Mode Switcher: Live Recipes vs Saved Collections */}
      <div className="flex justify-center mb-6">
        <div className="bg-stone-200/80 p-1 rounded-full border border-stone-300/80 flex gap-1 shadow-2xs">
          <button
            onClick={() => {
              soundFx.playTap();
              setViewMode('all');
              setActiveCollectionId(null);
            }}
            className={`px-5 py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'all' && !activeCollectionId
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            Live Pantry Meals ({recipes.length})
          </button>

          <button
            onClick={() => {
              soundFx.playTap();
              setViewMode('saved');
            }}
            className={`px-5 py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'saved' || activeCollectionId
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved & Collections ({savedRecipes.length})
          </button>
        </div>
      </div>

      {/* COLLECTIONS CAROUSEL & MANAGEMENT BAR */}
      <div className="mb-6 p-4 rounded-3xl bg-white border border-stone-200/90 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <h3 className="font-headline font-black text-sm uppercase tracking-wide text-stone-900">
              Custom Recipe Collections
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
              {collections.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onCreateCollection && (
              <button
                onClick={() => {
                  soundFx.playTap();
                  setIsManagerModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Manage Collections
              </button>
            )}

            {onRefreshRecipes && viewMode === 'all' && (
              <button
                onClick={onRefreshRecipes}
                disabled={isGenerating}
                className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-orange-500' : ''}`} />
                Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Collections Pill Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
          <button
            onClick={() => {
              soundFx.playTap();
              setActiveCollectionId(null);
            }}
            className={`px-3.5 py-2 rounded-2xl font-headline font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              !activeCollectionId
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>✨</span>
            <span>{viewMode === 'saved' ? 'All Saved Recipes' : 'All Pantry Recipes'}</span>
            <span className="text-[10px] font-mono opacity-70">
              ({viewMode === 'saved' ? savedRecipes.length : recipes.length})
            </span>
          </button>

          {collections.map((col) => {
            const isSelected = activeCollectionId === col.id;
            const count = col.recipeIds.length;

            return (
              <button
                key={col.id}
                onClick={() => {
                  soundFx.playTap();
                  if (isSelected) {
                    setActiveCollectionId(null);
                  } else {
                    setActiveCollectionId(col.id);
                  }
                }}
                className={`px-3.5 py-2 rounded-2xl font-headline font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/90'
                }`}
              >
                <span>{col.emoji}</span>
                <span>{col.name}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {onCreateCollection && (
            <button
              onClick={() => {
                soundFx.playTap();
                setIsManagerModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl font-headline font-bold text-xs uppercase tracking-wider whitespace-nowrap text-orange-600 hover:text-orange-700 bg-orange-50/80 hover:bg-orange-100 border border-dashed border-orange-300 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Collection
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE COLLECTION HERO BANNER (When a collection is actively selected) */}
      {activeCollection && (
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50/70 to-rose-50 border border-orange-200/90 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="text-3xl p-3 bg-white rounded-2xl shadow-sm border border-orange-200 shrink-0">
                {activeCollection.emoji}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline font-black text-xl sm:text-2xl text-stone-900 uppercase tracking-tight">
                    {activeCollection.name}
                  </h2>
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    {activeCollection.recipeIds.length} {activeCollection.recipeIds.length === 1 ? 'Recipe' : 'Recipes'}
                  </span>
                </div>
                <p className="font-body text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                  {activeCollection.description}
                </p>
              </div>
            </div>

            {/* Quick Actions for this collection */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleShareCollection(activeCollection)}
                className="p-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 shadow-2xs transition-all cursor-pointer"
                title="Share Collection List"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundFx.playTap();
                  setIsManagerModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-headline font-bold uppercase tracking-wider shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5 text-orange-600" />
                Edit / Organize
              </button>

              <button
                onClick={() => {
                  soundFx.playTap();
                  setActiveCollectionId(null);
                }}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-white transition-all cursor-pointer"
                title="Clear Filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH ROW */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center w-full sm:w-auto">
          {mealCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundFx.playTap();
                setSelectedFilter(cat);
              }}
              className={`px-4 py-2 rounded-full font-headline font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-2xs'
              }`}
            >
              {selectedFilter === cat && <Check className="w-3 h-3 text-orange-400" />}
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes, tags, ingredients..."
            className="w-full pl-9 pr-4 py-2 bg-white text-xs text-stone-900 rounded-full border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-stone-400 shadow-2xs font-body"
          />
        </div>
      </div>

      {/* RECIPE LIST */}
      <div className="space-y-8">
        {filteredRecipes.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-stone-200 text-stone-600 shadow-xs">
            <ChefHat className="w-12 h-12 mx-auto text-orange-500 mb-3" />
            <h3 className="font-headline font-bold text-lg mb-1 text-stone-900 uppercase">
              No recipes found
            </h3>
            <p className="font-body text-sm text-stone-500 mb-6 max-w-md mx-auto">
              {activeCollection
                ? `The "${activeCollection.name}" collection is currently empty. Tap below to batch assign recipes to it!`
                : 'No meals match the selected filters or search terms.'}
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              {activeCollection && (
                <button
                  onClick={() => {
                    soundFx.playTap();
                    setIsManagerModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-headline font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-full hover:from-orange-600 hover:to-amber-600 cursor-pointer shadow-md shadow-orange-500/25 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Recipes to {activeCollection.name}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedFilter('All Meals');
                  setActiveCollectionId(null);
                  setSearchQuery('');
                  setViewMode('all');
                }}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-headline font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-full cursor-pointer transition-all"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          filteredRecipes.map((recipe) => {
            const recipeCollections = getCollectionsForRecipe(recipe.id);

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden flex flex-col hover:border-orange-300 transition-all duration-300 relative group shadow-sm hover:shadow-xl"
              >
                {/* Recipe Image with Badges */}
                <div className="h-56 md:h-64 w-full bg-stone-100 relative overflow-hidden">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-transparent opacity-80" />

                  {/* Top Left Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10 max-w-[80%]">
                    {recipe.savesExpiring && (
                      <span className="bg-rose-500 text-white px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Saves Expiring Items
                      </span>
                    )}
                    <span className="bg-white/90 backdrop-blur-md text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      {recipe.pantryMatchPercent}% Match
                    </span>
                    {recipe.dietaryTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-white/90 backdrop-blur-md text-orange-700 border border-orange-200 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Top Right Actions: Bookmark & Organize */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playTap();
                        setTargetRecipeForOrganize(recipe);
                      }}
                      className="bg-white/90 backdrop-blur-md text-stone-700 p-2.5 rounded-full hover:scale-110 active:scale-95 transition-all cursor-pointer border border-stone-200 shadow-sm"
                      title="Organize into Collections"
                      aria-label="Organize recipe"
                    >
                      <Layers className="w-4 h-4 text-orange-600" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playTap();
                        onToggleSaveRecipe(recipe.id);
                      }}
                      className="bg-white/90 backdrop-blur-md text-stone-700 p-2.5 rounded-full hover:scale-110 active:scale-95 transition-all cursor-pointer border border-stone-200 shadow-sm"
                      aria-label="Bookmark Recipe"
                      title={recipe.isSaved ? 'Remove from Saved' : 'Save Recipe'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          recipe.isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-600'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Quick Cook Floating Icon Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecipe(recipe);
                    }}
                    className="absolute bottom-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer"
                    aria-label="View Recipe Details"
                  >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    {/* Collection Assignment Badges (if any) */}
                    {recipeCollections.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                        <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">
                          Collections:
                        </span>
                        {recipeCollections.map((col) => (
                          <button
                            key={col.id}
                            onClick={() => {
                              soundFx.playTap();
                              setActiveCollectionId(col.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-headline font-bold uppercase transition-all cursor-pointer shadow-2xs"
                            title={`Filter by ${col.name}`}
                          >
                            <span>{col.emoji}</span>
                            <span>{col.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h2
                        onClick={() => onSelectRecipe(recipe)}
                        className="font-headline text-2xl font-black text-stone-900 hover:text-orange-600 cursor-pointer transition-colors uppercase tracking-tight"
                      >
                        {recipe.title}
                      </h2>
                    </div>

                    {/* Google Search Grounded Source Pill */}
                    {recipe.sourceTitle && (
                      <div className="mb-3">
                        <a
                          href={recipe.sourceUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 hover:bg-sky-100 transition-colors"
                        >
                          <Globe className="w-3 h-3 text-sky-600" />
                          <span>Google Search Grounded: {recipe.sourceTitle}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}

                    {/* Time & Calorie Badges */}
                    <div className="flex items-center gap-4 text-xs font-mono text-stone-600 mb-5 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{recipe.prepTimeMinutes} MIN PREP</span>
                      </div>
                      {recipe.calories > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-rose-500" />
                          <span>{recipe.calories} KCAL</span>
                        </div>
                      )}
                    </div>

                    {/* Nutritional Breakdown Chips */}
                    <div className="mb-5">
                      <div className="text-[10px] font-mono font-bold text-stone-400 mb-2 uppercase tracking-widest">
                        NUTRITIONAL BREAKDOWN
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                          <div className="text-[9px] font-mono text-stone-500 uppercase font-bold">CALS</div>
                          <div className="font-headline font-bold text-sm text-stone-900">
                            {recipe.calories}
                          </div>
                        </div>
                        <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                          <div className="text-[9px] font-mono text-stone-500 uppercase font-bold">PROT</div>
                          <div className="font-headline font-bold text-sm text-stone-900">
                            {recipe.proteinGram}g
                          </div>
                        </div>
                        <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                          <div className="text-[9px] font-mono text-stone-500 uppercase font-bold">CARB</div>
                          <div className="font-headline font-bold text-sm text-stone-900">
                            {recipe.carbGram}g
                          </div>
                        </div>
                        <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                          <div className="text-[9px] font-mono text-stone-500 uppercase font-bold">FAT</div>
                          <div className="font-headline font-bold text-sm text-stone-900">
                            {recipe.fatGram}g
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients Used Pills */}
                    <div className="mb-5">
                      <div className="text-[10px] font-mono font-bold text-stone-400 mb-2 uppercase tracking-widest">
                        INGREDIENTS USED
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recipe.ingredientsUsed.map((ing, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                              ing.expiring
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                          >
                            {ing.name} {ing.expiring ? '(Expiring)' : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Substitution or Missing ingredient notes */}
                    {recipe.substitutionsNote && (
                      <div className="text-xs text-amber-900 mb-2 flex items-start gap-2 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                        <span className="text-amber-600 font-bold shrink-0">⇄</span>
                        <span>{recipe.substitutionsNote}</span>
                      </div>
                    )}
                    {recipe.missingNote && (
                      <div className="text-xs text-sky-900 mb-4 flex items-start gap-2 bg-sky-50 p-3 rounded-2xl border border-sky-200">
                        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span>{recipe.missingNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Action Button Row */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        soundFx.playTap();
                        setTargetRecipeForOrganize(recipe);
                      }}
                      className="px-4 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Layers className="w-4 h-4 text-orange-600" />
                      Organize
                    </button>

                    <button
                      onClick={() => onStartCooking(recipe)}
                      className="flex-1 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-headline font-bold text-base py-3.5 px-6 rounded-full shadow-lg shadow-orange-500/25 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <ChefHat className="w-5 h-5 text-white" />
                      Start Cooking
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* COLLECTION MANAGEMENT MODAL */}
      {onCreateCollection && onUpdateCollection && onDeleteCollection && onToggleRecipeInCollection && onBatchUpdateCollectionRecipes && (
        <CollectionManagerModal
          isOpen={isManagerModalOpen}
          onClose={() => setIsManagerModalOpen(false)}
          collections={collections}
          recipes={recipes}
          activeCollectionId={activeCollectionId}
          onSelectCollection={(id) => setActiveCollectionId(id)}
          onCreateCollection={onCreateCollection}
          onUpdateCollection={onUpdateCollection}
          onDeleteCollection={onDeleteCollection}
          onToggleRecipeInCollection={onToggleRecipeInCollection}
          onBatchUpdateCollectionRecipes={onBatchUpdateCollectionRecipes}
          onAddGroundedRecipe={onAddGroundedRecipe}
        />
      )}

      {/* QUICK ADD-TO-COLLECTION MODAL */}
      {onCreateCollection && onToggleRecipeInCollection && (
        <AddToCollectionModal
          recipe={targetRecipeForOrganize}
          isOpen={!!targetRecipeForOrganize}
          onClose={() => setTargetRecipeForOrganize(null)}
          collections={collections}
          onToggleRecipeInCollection={onToggleRecipeInCollection}
          onCreateCollection={onCreateCollection}
        />
      )}
    </div>
  );
};
