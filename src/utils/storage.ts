import { PantryItem, IdentifiedItem, Recipe, RecipeCollection, UserProfile } from '../types';
import {
  INITIAL_PANTRY_ITEMS,
  INITIAL_IDENTIFIED_ITEMS,
  INITIAL_RECIPES,
  INITIAL_RECIPE_COLLECTIONS,
  INITIAL_USER_PROFILE
} from '../data/mockData';

const STORAGE_KEYS = {
  PANTRY: 'kitchenai_pantry_items_v2',
  IDENTIFIED: 'kitchenai_identified_items_v2',
  RECIPES: 'kitchenai_recipes_v2',
  COLLECTIONS: 'kitchenai_collections_v2',
  PROFILE: 'kitchenai_profile_v2'
};

export const safeStorage = {
  getPantry: (): PantryItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PANTRY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_PANTRY_ITEMS;
  },

  setPantry: (items: PantryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  },

  getIdentified: (): IdentifiedItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IDENTIFIED);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_IDENTIFIED_ITEMS;
  },

  setIdentified: (items: IdentifiedItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.IDENTIFIED, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  },

  getRecipes: (): Recipe[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_RECIPES;
  },

  setRecipes: (recipes: Recipe[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  },

  getCollections: (): RecipeCollection[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_RECIPE_COLLECTIONS;
  },

  setCollections: (collections: RecipeCollection[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  },

  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_USER_PROFILE;
  },

  setProfile: (profile: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }
};

/**
 * Calculates days difference between today and a target YYYY-MM-DD date.
 */
export function calculateDaysLeft(expiryDateStr?: string): number | null {
  if (!expiryDateStr) return null;
  const target = new Date(expiryDateStr + 'T00:00:00');
  if (isNaN(target.getTime())) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns formatted expiry badge info: color, text, urgency
 */
export function getExpiryBadge(expiryDateStr?: string): {
  text: string;
  color: 'red' | 'amber' | 'green' | 'gray';
  urgent: boolean;
} {
  const days = calculateDaysLeft(expiryDateStr);
  if (days === null) {
    return { text: 'No Expiry Set', color: 'gray', urgent: false };
  }

  if (days < 0) {
    return {
      text: `Expired ${Math.abs(days)}d ago`,
      color: 'red',
      urgent: true
    };
  }
  if (days === 0) {
    return { text: 'Expires Today!', color: 'red', urgent: true };
  }
  if (days === 1) {
    return { text: 'Expires Tomorrow', color: 'amber', urgent: true };
  }
  if (days <= 3) {
    return { text: `Expires in ${days} days`, color: 'amber', urgent: true };
  }
  if (days <= 7) {
    return { text: `Fresh (${days}d left)`, color: 'green', urgent: false };
  }
  return { text: `Fresh (${days}d)`, color: 'green', urgent: false };
}
