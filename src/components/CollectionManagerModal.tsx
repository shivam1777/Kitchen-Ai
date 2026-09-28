import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Check,
  Search,
  Sparkles,
  Bookmark,
  Clock,
  Flame,
  Globe,
  CheckSquare,
  Square,
  Layers,
  ArrowRight,
  ExternalLink,
  ChefHat
} from 'lucide-react';
import { Recipe, RecipeCollection } from '../types';
import { soundFx } from '../utils/audio';

interface CollectionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: RecipeCollection[];
  recipes: Recipe[];
  activeCollectionId?: string | null;
  onSelectCollection: (id: string | null) => void;
  onCreateCollection: (collection: Omit<RecipeCollection, 'id' | 'createdAt'>) => string;
  onUpdateCollection: (id: string, updates: Partial<RecipeCollection>) => void;
  onDeleteCollection: (id: string) => void;
  onToggleRecipeInCollection: (collectionId: string, recipeId: string) => void;
  onBatchUpdateCollectionRecipes: (collectionId: string, recipeIds: string[]) => void;
  onAddGroundedRecipe?: (recipe: Recipe, targetCollectionId?: string) => void;
}

const EMOJI_OPTIONS = [
  '🥞', '⚡', '🌱', '🍲', '🥑', '🍝', '🌮', '🍕',
  '🥪', '🥕', '🥩', '🍱', '☕', '🥣', '🥗', '🍰',
  '🍳', '🫕', '🥘', '🍣', '🫐', '🥖', '🍤', '🍪'
];

const COLOR_THEMES: {
  id: RecipeCollection['colorTheme'];
  label: string;
  bgLight: string;
  badge: string;
  border: string;
  accent: string;
}[] = [
  { id: 'amber', label: 'Honey Amber', bgLight: 'bg-amber-50', badge: 'bg-amber-100 text-amber-800 border-amber-300', border: 'border-amber-400', accent: 'from-amber-500 to-orange-500' },
  { id: 'orange', label: 'Sunset Coral', bgLight: 'bg-orange-50', badge: 'bg-orange-100 text-orange-800 border-orange-300', border: 'border-orange-400', accent: 'from-orange-500 to-rose-500' },
  { id: 'emerald', label: 'Fresh Herb', bgLight: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', border: 'border-emerald-400', accent: 'from-emerald-600 to-teal-600' },
  { id: 'rose', label: 'Berry Rose', bgLight: 'bg-rose-50', badge: 'bg-rose-100 text-rose-800 border-rose-300', border: 'border-rose-400', accent: 'from-rose-500 to-pink-500' },
  { id: 'teal', label: 'Ocean Teal', bgLight: 'bg-teal-50', badge: 'bg-teal-100 text-teal-800 border-teal-300', border: 'border-teal-400', accent: 'from-teal-500 to-cyan-600' },
  { id: 'indigo', label: 'Royal Indigo', bgLight: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300', border: 'border-indigo-400', accent: 'from-indigo-500 to-purple-600' },
  { id: 'purple', label: 'Wild Berry', bgLight: 'bg-purple-50', badge: 'bg-purple-100 text-purple-800 border-purple-300', border: 'border-purple-400', accent: 'from-purple-500 to-rose-500' }
];

export const CollectionManagerModal: React.FC<CollectionManagerModalProps> = ({
  isOpen,
  onClose,
  collections,
  recipes,
  activeCollectionId,
  onSelectCollection,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onToggleRecipeInCollection,
  onBatchUpdateCollectionRecipes,
  onAddGroundedRecipe
}) => {
  const [activeTab, setActiveTab] = useState<'collections' | 'batch' | 'grounded'>('collections');
  const [selectedBatchCollectionId, setSelectedBatchCollectionId] = useState<string>(
    activeCollectionId || (collections[0]?.id ?? '')
  );
  const [recipeSearch, setRecipeSearch] = useState('');

  // Creation / Edit form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEmoji, setFormEmoji] = useState('🥞');
  const [formColor, setFormColor] = useState<RecipeCollection['colorTheme']>('orange');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search Grounding state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingGrounding, setIsSearchingGrounding] = useState(false);
  const [groundedResults, setGroundedResults] = useState<Recipe[]>([]);
  const [groundedSources, setGroundedSources] = useState<{ title: string; uri: string }[]>([]);
  const [groundedTargetColId, setGroundedTargetColId] = useState<string>(
    activeCollectionId || (collections[0]?.id ?? '')
  );

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenCreate = () => {
    soundFx.playTap();
    setEditingCollectionId(null);
    setFormName('');
    setFormDesc('');
    setFormEmoji('🥞');
    setFormColor('orange');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (col: RecipeCollection) => {
    soundFx.playTap();
    setEditingCollectionId(col.id);
    setFormName(col.name);
    setFormDesc(col.description);
    setFormEmoji(col.emoji);
    setFormColor(col.colorTheme);
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCollectionId) {
      onUpdateCollection(editingCollectionId, {
        name: formName.trim(),
        description: formDesc.trim(),
        emoji: formEmoji,
        colorTheme: formColor
      });
      showToast(`Updated "${formName.trim()}"`);
    } else {
      const newId = onCreateCollection({
        name: formName.trim(),
        description: formDesc.trim() || 'Curated culinary recipe collection',
        emoji: formEmoji,
        colorTheme: formColor,
        recipeIds: []
      });
      setSelectedBatchCollectionId(newId);
      showToast(`Created "${formName.trim()}"`);
    }

    soundFx.playSuccessTone();
    setIsFormOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    soundFx.playTap();
    if (window.confirm(`Delete the "${name}" collection? (Saved recipes will not be deleted)`)) {
      onDeleteCollection(id);
      showToast(`Deleted collection "${name}"`);
    }
  };

  // Google Search Grounding Trigger
  const handlePerformGroundedSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim() || 'trending healthy quick recipes';
    setIsSearchingGrounding(true);
    soundFx.playTap();

    try {
      const targetCol = collections.find((c) => c.id === groundedTargetColId);
      const res = await fetch('/api/search-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, collectionName: targetCol?.name })
      });

      if (res.ok) {
        const data = await res.json();
        setGroundedResults(data.recipes || []);
        setGroundedSources(data.sources || []);
        soundFx.playSuccessTone();
        showToast(`Discovered ${data.recipes?.length || 0} grounded web recipes!`);
      }
    } catch (err) {
      console.error('Failed to search grounded recipes:', err);
      showToast('Search encountered an error, check connection.');
    } finally {
      setIsSearchingGrounding(false);
    }
  };

  const handleAddGroundedToCollection = (recipe: Recipe) => {
    soundFx.playTap();
    if (onAddGroundedRecipe) {
      onAddGroundedRecipe(recipe, groundedTargetColId);
    }
    showToast(`Added to collection!`);
  };

  const currentBatchCol = collections.find((c) => c.id === selectedBatchCollectionId);
  const currentBatchRecipeIds = new Set(currentBatchCol?.recipeIds || []);

  const filteredRecipesForBatch = recipes.filter((r) => {
    if (!recipeSearch.trim()) return true;
    const q = recipeSearch.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.dietaryTags.some((t) => t.toLowerCase().includes(q)) ||
      r.mealType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white text-stone-900 rounded-3xl w-full max-w-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-2 rounded-full font-headline font-bold text-xs uppercase tracking-wider shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200/90 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-black text-xl sm:text-2xl text-stone-900 uppercase tracking-tight">
                  Recipe Collections
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  {collections.length} Total
                </span>
              </div>
              <p className="font-body text-xs text-stone-600 mt-0.5">
                Organize your favorite meals into curated collections like Breakfast Favorites or Quick Dinners.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className="p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200/70 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Tabs */}
        <div className="flex border-b border-stone-200 px-5 pt-3 bg-stone-50/40 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              soundFx.playTap();
              setActiveTab('collections');
            }}
            className={`pb-3 px-4 text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'collections'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            All Collections ({collections.length})
          </button>
          <button
            onClick={() => {
              soundFx.playTap();
              setActiveTab('batch');
            }}
            className={`pb-3 px-4 text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'batch'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Batch Organize Recipes
          </button>
          <button
            onClick={() => {
              soundFx.playTap();
              setActiveTab('grounded');
            }}
            className={`pb-3 px-4 text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'grounded'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-orange-500" />
            Search Grounded Web Recipes
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: COLLECTIONS LIST & MANAGEMENT */}
          {activeTab === 'collections' && (
            <div>
              {/* Create New Trigger Banner */}
              {!isFormOpen && (
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200/80 shadow-2xs">
                  <div>
                    <h3 className="font-headline font-bold text-sm text-stone-900 uppercase tracking-wide">
                      Create Custom Collection
                    </h3>
                    <p className="font-body text-xs text-stone-600">
                      Group high-protein lunches, kids lunches, holiday feasts, or speed meals.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreate}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    New Collection
                  </button>
                </div>
              )}

              {/* Inline Create / Edit Form */}
              {isFormOpen && (
                <form
                  onSubmit={handleSaveForm}
                  className="mb-6 p-5 rounded-3xl bg-stone-50 border border-orange-300 shadow-sm animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                    <h3 className="font-headline font-black text-base uppercase tracking-tight text-stone-900">
                      {editingCollectionId ? 'Edit Collection' : 'Create New Collection'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Collection Name *
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g., Breakfast Favorites, Quick Dinners"
                        className="w-full bg-white text-stone-900 px-4 py-2.5 rounded-xl text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-body"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Color Theme
                      </label>
                      <select
                        value={formColor}
                        onChange={(e) => setFormColor(e.target.value as any)}
                        className="w-full bg-white text-stone-900 px-3 py-2.5 rounded-xl text-sm border border-stone-300 font-headline font-bold uppercase"
                      >
                        {COLOR_THEMES.map((theme) => (
                          <option key={theme.id} value={theme.id}>
                            {theme.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="e.g., Fast weeknight dinners ready in 25 mins or less"
                      className="w-full bg-white text-stone-900 px-4 py-2 rounded-xl text-xs border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-body"
                    />
                  </div>

                  {/* Emoji Picker Grid */}
                  <div className="mb-5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Choose Emoji Icon ({formEmoji})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormEmoji(emoji)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                            formEmoji === emoji
                              ? 'bg-orange-500 text-white scale-110 shadow-md ring-2 ring-orange-300'
                              : 'bg-white hover:bg-stone-200/80 border border-stone-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 bg-stone-200 text-stone-700 hover:bg-stone-300 text-xs font-headline font-bold uppercase tracking-wider rounded-full cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-headline font-bold uppercase tracking-wider rounded-full shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 cursor-pointer active:scale-95"
                    >
                      {editingCollectionId ? 'Save Changes' : 'Create Collection'}
                    </button>
                  </div>
                </form>
              )}

              {/* Collections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {collections.map((col) => {
                  const theme = COLOR_THEMES.find((t) => t.id === col.colorTheme) || COLOR_THEMES[0];
                  const count = col.recipeIds.length;
                  const isActive = activeCollectionId === col.id;

                  // Find preview recipes
                  const previewRecipes = recipes.filter((r) => col.recipeIds.includes(r.id)).slice(0, 3);

                  return (
                    <div
                      key={col.id}
                      className={`p-4 rounded-3xl border transition-all flex flex-col justify-between shadow-2xs ${
                        isActive
                          ? `${theme.bgLight} ${theme.border} ring-2 ring-orange-400/40 shadow-sm`
                          : 'bg-white border-stone-200 hover:border-orange-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-2 rounded-2xl bg-white shadow-2xs border border-stone-200/80">
                              {col.emoji}
                            </span>
                            <div>
                              <h4 className="font-headline font-black text-base text-stone-900 leading-tight">
                                {col.name}
                              </h4>
                              <span
                                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${theme.badge}`}
                              >
                                {count} {count === 1 ? 'Recipe' : 'Recipes'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(col)}
                              className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg cursor-pointer"
                              title="Edit Collection"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(col.id, col.name)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Collection"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="font-body text-xs text-stone-600 mb-3 line-clamp-2">
                          {col.description}
                        </p>

                        {/* Thumbnail Strip of Recipes inside */}
                        {previewRecipes.length > 0 ? (
                          <div className="flex items-center gap-2 mb-3">
                            {previewRecipes.map((pr) => (
                              <img
                                key={pr.id}
                                src={pr.imageUrl}
                                alt={pr.title}
                                className="w-8 h-8 rounded-lg object-cover border border-white shadow-2xs"
                                title={pr.title}
                              />
                            ))}
                            {count > 3 && (
                              <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md">
                                +{count - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-stone-400 mb-3 italic">
                            Empty collection • Tap "Batch Organize" to add recipes
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            soundFx.playTap();
                            setSelectedBatchCollectionId(col.id);
                            setActiveTab('batch');
                          }}
                          className="text-[11px] font-headline font-bold uppercase tracking-wider text-stone-600 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Manage Items
                        </button>

                        <button
                          onClick={() => {
                            soundFx.playTap();
                            onSelectCollection(isActive ? null : col.id);
                            onClose();
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isActive
                              ? 'bg-orange-600 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {isActive ? 'Active Filter' : 'Filter by This'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BATCH ORGANIZE RECIPES */}
          {activeTab === 'batch' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-headline font-bold uppercase text-stone-700">
                    Active Collection:
                  </label>
                  <select
                    value={selectedBatchCollectionId}
                    onChange={(e) => {
                      soundFx.playTap();
                      setSelectedBatchCollectionId(e.target.value);
                    }}
                    className="bg-white text-stone-900 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-headline font-bold uppercase"
                  >
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.emoji} {col.name} ({col.recipeIds.length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search in Batch */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    placeholder="Search recipes..."
                    className="pl-8 pr-3 py-1.5 bg-stone-50 text-xs rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-56"
                  />
                </div>
              </div>

              {currentBatchCol && (
                <div className="p-3 mb-4 rounded-2xl bg-stone-50 border border-stone-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-xl">{currentBatchCol.emoji}</span>
                    <span className="font-headline font-bold text-stone-900 uppercase">
                      {currentBatchCol.name}
                    </span>
                    <span className="font-mono text-stone-500">
                      ({currentBatchCol.recipeIds.length} recipes included)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        soundFx.playTap();
                        const allIds = Array.from(new Set([...currentBatchCol.recipeIds, ...recipes.map((r) => r.id)]));
                        onBatchUpdateCollectionRecipes(currentBatchCol.id, allIds);
                        showToast('Added all recipes to collection');
                      }}
                      className="text-[10px] font-mono font-bold uppercase text-orange-600 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>&bull;</span>
                    <button
                      onClick={() => {
                        soundFx.playTap();
                        onBatchUpdateCollectionRecipes(currentBatchCol.id, []);
                        showToast('Cleared collection');
                      }}
                      className="text-[10px] font-mono font-bold uppercase text-stone-500 hover:underline cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}

              {/* Recipe Checklist */}
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {filteredRecipesForBatch.map((recipe) => {
                  const isInCollection = currentBatchRecipeIds.has(recipe.id);

                  return (
                    <div
                      key={recipe.id}
                      onClick={() => {
                        soundFx.playTap();
                        onToggleRecipeInCollection(selectedBatchCollectionId, recipe.id);
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isInCollection
                          ? 'bg-orange-50/70 border-orange-300 ring-1 ring-orange-300'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-stone-400 hover:text-orange-600 transition-colors"
                        >
                          {isInCollection ? (
                            <CheckSquare className="w-5 h-5 text-orange-600" />
                          ) : (
                            <Square className="w-5 h-5 text-stone-300" />
                          )}
                        </button>

                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-2xs"
                        />

                        <div>
                          <h5 className="font-headline font-black text-sm text-stone-900 leading-tight">
                            {recipe.title}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500 mt-0.5">
                            <span>{recipe.prepTimeMinutes} MIN</span>
                            <span>&bull;</span>
                            <span>{recipe.mealType}</span>
                            <span>&bull;</span>
                            <span className="text-emerald-700 font-bold">{recipe.pantryMatchPercent}% Match</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-headline font-bold uppercase px-2.5 py-1 rounded-full ${
                          isInCollection
                            ? 'bg-orange-200 text-orange-900'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {isInCollection ? 'In Collection' : 'Tap to Add'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE SEARCH GROUNDED RECIPES */}
          {activeTab === 'grounded' && (
            <div>
              <div className="p-4 rounded-3xl bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border border-sky-200 mb-5 shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span className="font-headline font-bold text-xs uppercase tracking-wider text-sky-900">
                    Live Google Search Web Grounding
                  </span>
                </div>
                <p className="font-body text-xs text-sky-800">
                  Search live culinary trends, authentic food blogs, and chef-tested recipes on the web using Gemini with Google Search tool. Add them right into your collections!
                </p>
              </div>

              {/* Search Bar & Target Collection Selector */}
              <form onSubmit={handlePerformGroundedSearch} className="space-y-3 mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., Viral high-protein breakfast bowls, 15-minute skillet dinner..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-stone-900 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-body shadow-2xs"
                    />
                  </div>

                  <select
                    value={groundedTargetColId}
                    onChange={(e) => setGroundedTargetColId(e.target.value)}
                    className="bg-white text-stone-900 border border-stone-300 rounded-2xl px-3 py-2.5 text-xs font-headline font-bold uppercase shadow-2xs"
                  >
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        Save into: {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={isSearchingGrounding}
                    className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-2xl font-headline font-bold text-xs uppercase tracking-wider shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingGrounding ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-white" />
                        Searching Web...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 text-white" />
                        Ground Search
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">Try ideas:</span>
                  {[
                    'High Protein Breakfast Favorites',
                    '20-Minute Weeknight Dinners',
                    'Zero Waste Vegetable Soups',
                    'Crispy Air Fryer Salmon'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSearchQuery(preset);
                        handlePerformGroundedSearch();
                      }}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </form>

              {/* Grounded Web Results */}
              <div className="space-y-4">
                {groundedResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start justify-between"
                  >
                    <div className="flex gap-3.5">
                      <img
                        src={result.imageUrl}
                        alt={result.title}
                        className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shrink-0 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-headline font-black text-base text-stone-900 leading-snug">
                            {result.title}
                          </h4>
                          {result.sourceTitle && (
                            <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                              <ExternalLink className="w-2.5 h-2.5" />
                              {result.sourceTitle}
                            </span>
                          )}
                        </div>
                        <p className="font-body text-xs text-stone-600 line-clamp-2 mb-2">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-stone-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-orange-500" /> {result.prepTimeMinutes} MIN
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-500" /> {result.calories} KCAL
                          </span>
                          <span>&bull;</span>
                          <span>{result.proteinGram}g PROTEIN</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddGroundedToCollection(result)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-headline font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Collection
                    </button>
                  </div>
                ))}

                {groundedResults.length === 0 && !isSearchingGrounding && (
                  <div className="p-8 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-300">
                    <Globe className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <h5 className="font-headline font-bold text-sm text-stone-800 uppercase">
                      No web search queries run yet
                    </h5>
                    <p className="font-body text-xs text-stone-500 max-w-sm mx-auto mt-1">
                      Type any culinary query or tap one of the suggested search presets above to ground recipes with Google Search.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-stone-200/90 bg-stone-50/70 flex items-center justify-between">
          <div className="text-xs font-mono text-stone-500">
            {collections.length} custom collections &bull; {recipes.filter((r) => r.isSaved).length} saved recipes
          </div>

          <button
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-stone-900 text-white hover:bg-stone-800 text-xs font-headline font-bold uppercase tracking-wider cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
