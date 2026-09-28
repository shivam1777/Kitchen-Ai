import React from 'react';
import { Camera, ArrowRight, Plus } from 'lucide-react';
import { Recipe } from '../types';

interface HomeScreenProps {
  recentlyCookedRecipes: Recipe[];
  onStartScan: () => void;
  onOpenPantry: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onViewAllRecipes: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  recentlyCookedRecipes,
  onStartScan,
  onOpenPantry,
  onSelectRecipe,
  onViewAllRecipes
}) => {
  return (
    <div className="pb-28 pt-6 md:pt-10 max-w-5xl mx-auto px-5">
      {/* Hero Section */}
      <section className="mb-14 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-800">
            [ FRESH HARVEST &bull; ZERO-WASTE AI ]
          </span>
        </div>

        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 mb-5 tracking-tight leading-[1.08] max-w-3xl uppercase">
          Turn What You Have Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500">What You Want.</span>
        </h1>
        <p className="font-body text-base md:text-lg text-stone-600 mb-10 max-w-xl mx-auto leading-relaxed">
          Scan your fridge or pantry. Artificial intelligence curates tailored recipes to eliminate waste and elevate every meal.
        </p>

        {/* Circular Camera Tap Target */}
        <div
          onClick={onStartScan}
          className="relative w-64 h-64 md:w-72 md:h-72 aspect-square rounded-full p-2.5 bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer group active:scale-95 mb-8"
        >
          <div className="absolute inset-2 rounded-full bg-white/20 backdrop-blur-xs animate-pulse pointer-events-none" />
          <div className="flex flex-col items-center justify-center text-stone-900 z-10 w-full h-full rounded-full bg-white shadow-inner group-hover:scale-102 transition-transform duration-300 border border-stone-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-orange-500/30 group-hover:rotate-6 transition-transform">
              <Camera className="w-8 h-8 stroke-[2.2]" />
            </div>
            <span className="font-headline font-black text-xl text-stone-900 tracking-tight uppercase">
              Tap to Scan
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 tracking-wider mt-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              [ CAMERA VISION ]
            </span>
          </div>
        </div>

        {/* Or Type Ingredients Button */}
        <button
          onClick={onStartScan}
          className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-headline font-bold text-base py-4 px-9 rounded-full shadow-lg shadow-orange-500/25 active:scale-95 transition-all duration-200 w-full md:w-auto min-h-[48px] cursor-pointer tracking-wider uppercase"
        >
          Or Type Ingredients
        </button>
      </section>

      {/* Recently Cooked Gallery */}
      <section className="mb-14">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600">
              [ CURATED SELECTION ]
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-black text-stone-900 uppercase tracking-tight">
              Recently Cooked Inspiration
            </h2>
          </div>
          <button
            onClick={onViewAllRecipes}
            className="text-orange-600 hover:text-orange-700 font-headline text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
          >
            See All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentlyCookedRecipes.slice(0, 3).map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe)}
              className="bg-white rounded-3xl border border-stone-200/90 hover:border-orange-300 transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden shadow-xs hover:shadow-xl"
            >
              <div className="h-52 w-full bg-stone-100 relative overflow-hidden">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-80" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRecipe(recipe);
                  }}
                  className="absolute bottom-3 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 z-10 cursor-pointer"
                  aria-label="View Recipe"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {recipe.dietaryTags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-headline text-lg font-bold text-stone-900 mb-1.5 line-clamp-1 tracking-tight">
                    {recipe.title}
                  </h3>
                  <p className="font-body text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-emerald-50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-orange-200/70 relative overflow-hidden shadow-sm">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-gradient-to-br from-orange-300/30 to-amber-300/30 rounded-full blur-2xl pointer-events-none" />
        <div className="mb-6 md:mb-0 max-w-lg z-10">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600">
            [ PANTRY MANAGEMENT ]
          </span>
          <h3 className="font-headline text-xl md:text-2xl font-black text-stone-900 uppercase tracking-tight mb-2">
            Build Your Digital Pantry
          </h3>
          <p className="font-body text-xs md:text-sm text-stone-600 leading-relaxed">
            Keep track of kitchen staples and receive proactive notifications before ingredients reach expiration.
          </p>
        </div>
        <button
          onClick={onOpenPantry}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-headline font-bold text-sm py-3.5 px-7 rounded-full active:scale-95 transition-all duration-200 whitespace-nowrap min-h-[48px] cursor-pointer shadow-md shadow-orange-500/25 z-10 uppercase tracking-wider"
        >
          Setup Pantry
        </button>
      </section>
    </div>
  );
};
