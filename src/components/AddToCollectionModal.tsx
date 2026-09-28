import React, { useState } from 'react';
import { X, Plus, Check, CheckSquare, Square, Layers, Sparkles } from 'lucide-react';
import { Recipe, RecipeCollection } from '../types';
import { soundFx } from '../utils/audio';

interface AddToCollectionModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  collections: RecipeCollection[];
  onToggleRecipeInCollection: (collectionId: string, recipeId: string) => void;
  onCreateCollection: (collection: Omit<RecipeCollection, 'id' | 'createdAt'>) => string;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  recipe,
  isOpen,
  onClose,
  collections,
  onToggleRecipeInCollection,
  onCreateCollection
}) => {
  const [newColName, setNewColName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  if (!isOpen || !recipe) return null;

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    soundFx.playSuccessTone();
    const newId = onCreateCollection({
      name: newColName.trim(),
      description: 'Custom recipe collection',
      emoji: '🥗',
      colorTheme: 'orange',
      recipeIds: [recipe.id]
    });

    setNewColName('');
    setShowCreateInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white text-stone-900 rounded-3xl w-full max-w-md shadow-2xl border border-stone-200 p-5 sm:p-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-black text-base uppercase tracking-tight text-stone-900">
                Organize Into Collections
              </h3>
              <p className="font-body text-xs text-stone-500 truncate max-w-[240px]">
                {recipe.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Collections Checklist */}
        <div className="space-y-2 mb-4 max-h-[320px] overflow-y-auto pr-1">
          {collections.map((col) => {
            const isIncluded = col.recipeIds.includes(recipe.id);

            return (
              <div
                key={col.id}
                onClick={() => {
                  soundFx.playTap();
                  onToggleRecipeInCollection(col.id, recipe.id);
                }}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isIncluded
                    ? 'bg-orange-50 border-orange-300 shadow-2xs'
                    : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl p-1 bg-white rounded-lg shadow-2xs border border-stone-200">
                    {col.emoji}
                  </span>
                  <div>
                    <h4 className="font-headline font-bold text-xs uppercase text-stone-900">
                      {col.name}
                    </h4>
                    <span className="font-mono text-[10px] text-stone-500">
                      {col.recipeIds.length} items
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isIncluded
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'border-2 border-stone-300 bg-white'
                  }`}
                >
                  {isIncluded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick New Collection Form */}
        {showCreateInput ? (
          <form onSubmit={handleCreateAndAdd} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="Collection name (e.g. Quick Lunches)..."
              className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-orange-600 text-white rounded-xl text-xs font-headline font-bold uppercase tracking-wider shadow-xs hover:bg-orange-700 cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowCreateInput(false)}
              className="px-2.5 py-2 bg-stone-100 text-stone-600 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => {
              soundFx.playTap();
              setShowCreateInput(true);
            }}
            className="w-full mb-4 py-2.5 px-3 rounded-2xl border border-dashed border-stone-300 text-stone-600 hover:text-stone-900 hover:border-orange-400 text-xs font-headline font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-orange-500" />
            Create New Collection
          </button>
        )}

        {/* Footer Done */}
        <button
          onClick={() => {
            soundFx.playTap();
            onClose();
          }}
          className="w-full py-2.5 rounded-full bg-stone-900 text-white font-headline font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-all cursor-pointer shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
};
