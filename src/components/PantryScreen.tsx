import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Camera,
  Plus,
  Trash2,
  Check,
  Search,
  Sparkles,
  Calendar,
  ChefHat,
  Filter,
  Copy,
  Clock,
  ArrowUpDown,
  Pencil,
  RotateCcw,
  CheckSquare,
  Square,
  Share2
} from 'lucide-react';
import { PantryItem, PantryLocation, IdentifiedItem } from '../types';
import { calculateDaysLeft, getExpiryBadge } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface PantryScreenProps {
  pantryItems: PantryItem[];
  onUpdatePantry: (items: PantryItem[]) => void;
  onStartFreshScan: () => void;
  onCookWithIngredients?: (ingredientNames: string[]) => void;
}

type FilterLocationTab = 'All' | 'Expiring' | 'Low Stock' | 'Fridge' | 'Freezer' | 'Pantry' | 'Spice Rack';
type SortOption = 'expiry' | 'name' | 'quantity' | 'category';

export const PantryScreen: React.FC<PantryScreenProps> = ({
  pantryItems,
  onUpdatePantry,
  onStartFreshScan,
  onCookWithIngredients
}) => {
  const [activeTab, setActiveTab] = useState<FilterLocationTab>('All');
  const [showShoppingListOnly, setShowShoppingListOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('expiry');

  // Multi-select for "Cook with Selected"
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formDetail, setFormDetail] = useState<string>('');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUnit, setFormUnit] = useState<string>('pcs');
  const [formCategory, setFormCategory] = useState<string>('Produce');
  const [formLocation, setFormLocation] = useState<PantryLocation>('Fridge');
  const [formExpiryDate, setFormExpiryDate] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>('Good');

  // Copy notification toast
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const categoriesList = [
    'Produce',
    'Dairy',
    'Proteins',
    'Grains & Pasta',
    'Canned Goods',
    'Spices & Herbs',
    'Pantry',
    'Condiments'
  ];

  const locationsList: PantryLocation[] = ['Fridge', 'Freezer', 'Pantry', 'Spice Rack'];

  // Summary counts
  const totalItemsCount = pantryItems.length;
  const runningLowCount = pantryItems.filter(
    (i) => i.status === 'Running Low' || i.status === 'Out of Stock' || i.quantity <= 1
  ).length;
  const expiringCount = pantryItems.filter((i) => {
    const days = calculateDaysLeft(i.expiryDate);
    return days !== null && days <= 3;
  }).length;
  const shoppingListCount = pantryItems.filter((i) => i.inShoppingList).length;

  // Inline Quantity Stepper
  const handleAdjustQuantity = (id: string, delta: number) => {
    soundFx.playTap();
    onUpdatePantry(
      pantryItems.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(0, (item.quantity ?? 1) + delta);
        let newStatus = item.status;
        if (newQty === 0) {
          newStatus = 'Out of Stock';
        } else if (newQty === 1) {
          newStatus = 'Running Low';
        } else if (item.status === 'Out of Stock' && newQty > 0) {
          newStatus = 'Good';
        }
        return {
          ...item,
          quantity: newQty,
          status: newStatus,
          countBadge: `${newQty} ${item.unit || 'pcs'}`
        };
      })
    );
  };

  // Toggle Shopping List
  const handleToggleShoppingList = (id: string) => {
    soundFx.playTap();
    onUpdatePantry(
      pantryItems.map((item) =>
        item.id === id ? { ...item, inShoppingList: !item.inShoppingList } : item
      )
    );
  };

  // Mark item as purchased (Shopping list checkoff)
  const handleMarkPurchased = (id: string) => {
    soundFx.playSuccessTone();
    onUpdatePantry(
      pantryItems.map((item) => {
        if (item.id !== id) return item;
        // Restock to 2 and remove from shopping list
        return {
          ...item,
          inShoppingList: false,
          status: 'Good',
          quantity: Math.max(item.quantity, 2),
          countBadge: `2 ${item.unit || 'pcs'}`,
          expiryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0] // default +10 days
        };
      })
    );
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    soundFx.playTap();
    onUpdatePantry(pantryItems.filter((i) => i.id !== id));
    setSelectedItemIds((prev) => prev.filter((i) => i !== id));
  };

  // Open modal for new item
  const handleOpenAddModal = () => {
    soundFx.playTap();
    setEditingItemId(null);
    setFormName('');
    setFormDetail('');
    setFormQuantity(1);
    setFormUnit('pcs');
    setFormCategory('Produce');
    setFormLocation('Fridge');
    // Default expiry 7 days from today
    const defaultExpiry = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    setFormExpiryDate(defaultExpiry);
    setFormStatus('Good');
    setModalOpen(true);
  };

  // Open modal for editing existing item
  const handleOpenEditModal = (item: PantryItem) => {
    soundFx.playTap();
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormDetail(item.detail || '');
    setFormQuantity(item.quantity ?? 1);
    setFormUnit(item.unit || 'pcs');
    setFormCategory(item.category || 'Produce');
    setFormLocation(item.location || 'Fridge');
    setFormExpiryDate(item.expiryDate || '');
    setFormStatus(item.status || 'Good');
    setModalOpen(true);
  };

  // Set quick relative expiry date
  const setQuickExpiry = (days: number) => {
    soundFx.playTap();
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFormExpiryDate(d.toISOString().split('T')[0]);
  };

  // Save Modal Form
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    soundFx.playSuccessTone();

    if (editingItemId) {
      // Edit existing
      onUpdatePantry(
        pantryItems.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                name: formName.trim(),
                detail: formDetail.trim() || `${formQuantity} ${formUnit}`,
                quantity: formQuantity,
                unit: formUnit,
                category: formCategory,
                location: formLocation,
                expiryDate: formExpiryDate || undefined,
                status: formStatus,
                countBadge: `${formQuantity} ${formUnit}`
              }
            : item
        )
      );
    } else {
      // Add new
      const newItem: PantryItem = {
        id: `p-${Date.now()}`,
        name: formName.trim(),
        detail: formDetail.trim() || `${formQuantity} ${formUnit}`,
        quantity: formQuantity,
        unit: formUnit,
        category: formCategory,
        location: formLocation,
        expiryDate: formExpiryDate || undefined,
        status: formStatus,
        countBadge: `${formQuantity} ${formUnit}`,
        inShoppingList: false
      };
      onUpdatePantry([newItem, ...pantryItems]);
    }

    setModalOpen(false);
  };

  // Toggle item selection for "Cook With Selected"
  const handleToggleSelect = (id: string) => {
    soundFx.playTap();
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all visible items
  const handleSelectAll = () => {
    soundFx.playTap();
    if (selectedItemIds.length === filteredItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map((i) => i.id));
    }
  };

  // Cook with selected items
  const handleCookWithSelected = () => {
    if (!onCookWithIngredients) return;
    soundFx.playSuccessTone();
    const selectedNames = pantryItems
      .filter((i) => selectedItemIds.includes(i.id))
      .map((i) => i.name);
    onCookWithIngredients(selectedNames);
  };

  // Add all low stock items to shopping list
  const handleAddAllLowStockToShopping = () => {
    soundFx.playSuccessTone();
    onUpdatePantry(
      pantryItems.map((i) =>
        i.status === 'Running Low' || i.status === 'Out of Stock' || i.quantity <= 1
          ? { ...i, inShoppingList: true }
          : i
      )
    );
    setCopyToast('All low stock items added to Shopping List!');
    setTimeout(() => setCopyToast(null), 2500);
  };

  // Copy shopping list to clipboard
  const handleCopyShoppingList = () => {
    const listItems = pantryItems.filter((i) => i.inShoppingList);
    if (listItems.length === 0) return;

    soundFx.playTap();
    const text =
      `🛒 KitchenAI Shopping List (${listItems.length} items):\n` +
      listItems
        .map((i) => `• ${i.name} (${i.detail || `${i.quantity} ${i.unit}`}) - ${i.category}`)
        .join('\n');

    navigator.clipboard.writeText(text);
    setCopyToast('Shopping list copied to clipboard!');
    setTimeout(() => setCopyToast(null), 2500);
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return pantryItems
      .filter((item) => {
        // Search query
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        // Shopping list filter
        if (showShoppingListOnly) {
          return item.inShoppingList;
        }

        // Tab filters
        if (activeTab === 'All') return true;
        if (activeTab === 'Expiring') {
          const days = calculateDaysLeft(item.expiryDate);
          return days !== null && days <= 3;
        }
        if (activeTab === 'Low Stock') {
          return item.status === 'Running Low' || item.status === 'Out of Stock' || item.quantity <= 1;
        }
        return item.location === activeTab;
      })
      .sort((a, b) => {
        if (sortBy === 'expiry') {
          const daysA = calculateDaysLeft(a.expiryDate) ?? 9999;
          const daysB = calculateDaysLeft(b.expiryDate) ?? 9999;
          return daysA - daysB;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'quantity') {
          return (a.quantity ?? 0) - (b.quantity ?? 0);
        }
        if (sortBy === 'category') {
          return a.category.localeCompare(b.category);
        }
        return 0;
      });
  }, [pantryItems, searchQuery, showShoppingListOnly, activeTab, sortBy]);

  return (
    <div className="pb-36 pt-5 max-w-3xl mx-auto px-4 md:px-6">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4" />
          {copyToast}
        </div>
      )}

      {/* Screen Title */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600">
              [ SMART INVENTORY &bull; REAL-TIME TRACKING ]
            </span>
            <h1 className="font-headline text-3xl md:text-4xl font-black text-stone-900 uppercase tracking-tight">
              Virtual Pantry
            </h1>
            <p className="font-body text-xs md:text-sm text-stone-600 mt-1 max-w-lg">
              Monitor shelf life, adjust quantities, and batch-select pantry ingredients for zero-waste cooking.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-headline font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md shadow-orange-500/25 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Quick Status Cards Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Total Stock */}
        <div
          onClick={() => {
            soundFx.playTap();
            setActiveTab('All');
            setShowShoppingListOnly(false);
          }}
          className={`bg-white p-4 rounded-3xl border transition-all cursor-pointer shadow-xs text-center ${
            activeTab === 'All' && !showShoppingListOnly
              ? 'border-orange-500 ring-2 ring-orange-200 shadow-md'
              : 'border-stone-200/90 hover:border-stone-300'
          }`}
        >
          <div className="font-headline text-2xl md:text-3xl font-black text-stone-900">
            {totalItemsCount}
          </div>
          <div className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mt-0.5">
            Total Items
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => {
            soundFx.playTap();
            setActiveTab('Expiring');
            setShowShoppingListOnly(false);
          }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs text-center ${
            activeTab === 'Expiring' && !showShoppingListOnly
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-md'
              : 'bg-rose-50/60 border-rose-200/80 hover:bg-rose-50'
          }`}
        >
          <div className="font-headline text-2xl md:text-3xl font-black text-rose-700">
            {expiringCount}
          </div>
          <div className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Expiring Soon
          </div>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => {
            soundFx.playTap();
            setActiveTab('Low Stock');
            setShowShoppingListOnly(false);
          }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-xs text-center ${
            activeTab === 'Low Stock' && !showShoppingListOnly
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-md'
              : 'bg-amber-50/60 border-amber-200/80 hover:bg-amber-50'
          }`}
        >
          <div className="font-headline text-2xl md:text-3xl font-black text-amber-800">
            {runningLowCount}
          </div>
          <div className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider mt-0.5">
            Low Stock
          </div>
        </div>
      </div>

      {/* Shopping List Toggle Banner */}
      <div
        className={`p-4.5 rounded-3xl mb-6 flex items-center justify-between transition-all border shadow-sm ${
          showShoppingListOnly
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/25'
            : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 text-stone-900 border-emerald-200/80 hover:border-emerald-300'
        }`}
      >
        <div
          onClick={() => {
            soundFx.playTap();
            setShowShoppingListOnly(!showShoppingListOnly);
          }}
          className="flex items-center gap-3 cursor-pointer flex-1"
        >
          <div
            className={`p-2.5 rounded-2xl shadow-xs ${
              showShoppingListOnly ? 'bg-white/20 text-white' : 'bg-white text-emerald-700 border border-emerald-200'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className={`font-headline font-black text-base uppercase tracking-wide ${showShoppingListOnly ? 'text-white' : 'text-stone-900'}`}>
              {shoppingListCount} Items On Shopping List
            </div>
            <div className={`text-[10px] font-mono uppercase tracking-wider ${showShoppingListOnly ? 'text-white/80' : 'text-stone-600'}`}>
              {showShoppingListOnly
                ? 'Viewing grocery list • Check items to mark purchased'
                : 'Need restocking from grocer'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shoppingListCount > 0 && (
            <button
              onClick={handleCopyShoppingList}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                showShoppingListOnly
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 shadow-2xs'
              }`}
              title="Copy List to Clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playTap();
              setShowShoppingListOnly(!showShoppingListOnly);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider cursor-pointer border shadow-2xs ${
              showShoppingListOnly
                ? 'bg-white text-emerald-800 border-white hover:bg-stone-100'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            {showShoppingListOnly ? 'Show All Pantry' : 'Open List'}
          </button>
        </div>
      </div>

      {/* Filter Tabs by Storage Location */}
      {!showShoppingListOnly && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {(['All', 'Fridge', 'Freezer', 'Pantry', 'Spice Rack', 'Expiring', 'Low Stock'] as FilterLocationTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => {
                  soundFx.playTap();
                  setActiveTab(tab);
                }}
                className={`px-4 py-2 rounded-full font-headline font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/90 shadow-2xs'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      )}

      {/* Search Bar & Sorting Controls */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, category..."
            className="w-full bg-white text-stone-900 text-xs pl-10 pr-4 py-2.5 rounded-full border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-body placeholder:text-stone-400 shadow-2xs"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              soundFx.playTap();
              setSortBy(e.target.value as SortOption);
            }}
            className="bg-white text-stone-800 text-xs px-3.5 py-2.5 rounded-full border border-stone-200 font-headline font-bold uppercase tracking-wider focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="expiry">Sort: Expiring Soon</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="quantity">Sort: Quantity</option>
            <option value="category">Sort: Category</option>
          </select>
        </div>
      </div>

      {/* Multi-Select Header / Batch Actions */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-xs font-mono text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            {selectedItemIds.length > 0 && selectedItemIds.length === filteredItems.length ? (
              <CheckSquare className="w-4 h-4 text-orange-500" />
            ) : (
              <Square className="w-4 h-4 text-stone-400" />
            )}
            <span>
              {selectedItemIds.length > 0
                ? `${selectedItemIds.length} Selected`
                : 'Select Items to Cook'}
            </span>
          </button>
        </div>

        {runningLowCount > 0 && !showShoppingListOnly && (
          <button
            onClick={handleAddAllLowStockToShopping}
            className="text-[10px] font-mono font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add All Low Stock to List
          </button>
        )}
      </div>

      {/* Pantry Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-3xl border border-dashed border-stone-300 text-stone-600 shadow-2xs">
            <Package className="w-10 h-10 mx-auto text-stone-400 mb-2" />
            <h3 className="font-headline font-bold text-base text-stone-900 uppercase mb-1">
              No Items Found
            </h3>
            <p className="font-body text-xs text-stone-500 mb-4">
              {showShoppingListOnly
                ? 'Your shopping list is clear! All staples are well stocked.'
                : 'No pantry items match the selected filter or search.'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider hover:from-orange-600 hover:to-amber-600 cursor-pointer shadow-md shadow-orange-500/25"
            >
              Add New Item
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const expiryInfo = getExpiryBadge(item.expiryDate);
            const isSelected = selectedItemIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-3xl border transition-all duration-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-200 bg-orange-50/20'
                    : 'border-stone-200/90 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                {/* Left: Checkbox + Name & Badges */}
                <div className="flex items-start gap-3 flex-1">
                  {/* Select Checkbox */}
                  <button
                    onClick={() => handleToggleSelect(item.id)}
                    className="p-1 mt-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-300" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        onClick={() => handleOpenEditModal(item)}
                        className="font-headline font-black text-base text-stone-900 hover:text-orange-600 transition-colors cursor-pointer"
                      >
                        {item.name}
                      </h3>

                      {/* Storage Location Tag */}
                      {item.location && (
                        <span className="text-[9px] font-mono font-bold uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                          {item.location}
                        </span>
                      )}

                      {/* Expiration Tag */}
                      {item.expiryDate && (
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            expiryInfo.color === 'red'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : expiryInfo.color === 'amber'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <Calendar className="w-2.5 h-2.5" />
                          {expiryInfo.text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-body text-stone-500 mt-1">
                      <span>{item.detail || `${item.quantity} ${item.unit}`}</span>
                      <span>&bull;</span>
                      <span className="text-stone-400 uppercase font-mono text-[10px]">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Stepper & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                  {/* Inline Quantity Stepper */}
                  <div className="flex items-center bg-stone-100 rounded-full border border-stone-200 p-1">
                    <button
                      onClick={() => handleAdjustQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-full bg-white hover:bg-stone-200 text-stone-800 flex items-center justify-center cursor-pointer transition-all active:scale-95 text-xs font-bold shadow-2xs"
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-stone-900 min-w-[36px] text-center">
                      {item.quantity ?? 1}
                    </span>
                    <button
                      onClick={() => handleAdjustQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 text-xs font-bold shadow-2xs"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Shopping list action */}
                  {showShoppingListOnly ? (
                    <button
                      onClick={() => handleMarkPurchased(item.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      title="Mark purchased and restock"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Bought
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleShoppingList(item.id)}
                      className={`p-2 rounded-full transition-all cursor-pointer ${
                        item.inShoppingList
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900'
                      }`}
                      title={item.inShoppingList ? 'Remove from Shopping List' : 'Add to Shopping List'}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  )}

                  {/* Edit item */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Edit Item"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete item */}
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Bar: Cook With Selected Items */}
      {selectedItemIds.length > 0 && onCookWithIngredients && (
        <div className="fixed bottom-22 left-0 right-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-white/95 border-2 border-orange-500 rounded-full p-2 px-5 shadow-2xl flex items-center gap-4 text-stone-900 max-w-md w-full justify-between backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="font-headline font-bold text-xs uppercase tracking-wider text-stone-900">
                {selectedItemIds.length} Items Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedItemIds([])}
                className="text-[10px] font-mono font-bold uppercase text-stone-500 hover:text-stone-900 px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={handleCookWithSelected}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-headline font-black text-xs uppercase tracking-wider py-2 px-4 rounded-full hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-500/25"
              >
                <ChefHat className="w-4 h-4" />
                Cook With Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Button: SCAN FRESH ITEMS (when no items selected) */}
      {selectedItemIds.length === 0 && (
        <div className="fixed bottom-22 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
          <button
            onClick={onStartFreshScan}
            className="pointer-events-auto bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white font-headline font-black text-xs uppercase tracking-widest py-3.5 px-7 rounded-full shadow-2xl shadow-orange-500/35 hover:from-orange-600 hover:to-amber-700 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 border border-white/40"
          >
            <Camera className="w-5 h-5 text-white" />
            SCAN FRESH ITEMS
          </button>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 text-stone-900 max-h-[90vh] overflow-y-auto">
            <h3 className="font-headline font-black text-2xl mb-4 text-stone-900 uppercase tracking-tight">
              {editingItemId ? 'Edit Pantry Item' : 'Add New Pantry Item'}
            </h3>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Organic Spinach, Greek Yogurt, Olive Oil"
                  className="w-full bg-stone-50 text-stone-900 px-4 py-2.5 rounded-xl text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Quantity & Unit Stepper */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-stone-50 text-stone-900 px-4 py-2.5 rounded-xl text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Unit
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-stone-50 text-stone-900 px-3 py-2.5 rounded-xl text-sm border border-stone-200 focus:ring-orange-500"
                  >
                    <option value="pcs">pcs</option>
                    <option value="carton">carton</option>
                    <option value="tub">tub</option>
                    <option value="can">can</option>
                    <option value="bottle">bottle</option>
                    <option value="bag">bag</option>
                    <option value="pack">pack</option>
                    <option value="jar">jar</option>
                    <option value="g">grams (g)</option>
                    <option value="kg">kilograms (kg)</option>
                  </select>
                </div>
              </div>

              {/* Storage Location & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Storage Location
                  </label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value as PantryLocation)}
                    className="w-full bg-stone-50 text-stone-900 px-3 py-2.5 rounded-xl text-sm border border-stone-200"
                  >
                    {locationsList.map((loc) => (
                      <option key={loc} value={loc} className="bg-white text-stone-900">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-stone-50 text-stone-900 px-3 py-2.5 rounded-xl text-sm border border-stone-200"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c} className="bg-white text-stone-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expiration Date with quick setter buttons */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Expiration Date (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="flex-1 bg-stone-50 text-stone-900 px-4 py-2.5 rounded-xl text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {formExpiryDate && (
                    <button
                      type="button"
                      onClick={() => setFormExpiryDate('')}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold"
                      title="Clear expiry date"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Expiry Shortcuts */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(3)}
                    className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-mono font-semibold rounded-lg border border-stone-200"
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(7)}
                    className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-mono font-semibold rounded-lg border border-stone-200"
                  >
                    +1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(14)}
                    className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-mono font-semibold rounded-lg border border-stone-200"
                  >
                    +2 Weeks
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(30)}
                    className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-mono font-semibold rounded-lg border border-stone-200"
                  >
                    +1 Month
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-stone-50 text-stone-900 px-3 py-2.5 rounded-xl text-sm border border-stone-200"
                >
                  <option value="Full">Full</option>
                  <option value="Good">Good</option>
                  <option value="Half">Half</option>
                  <option value="Running Low">Running Low</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-stone-100 text-stone-700 font-headline font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-headline font-bold text-xs uppercase tracking-wider rounded-full hover:from-orange-600 hover:to-amber-600 cursor-pointer shadow-md shadow-orange-500/25"
                >
                  {editingItemId ? 'Update Item' : 'Save To Pantry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
