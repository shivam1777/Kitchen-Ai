export type ScreenTab = 'home' | 'scan' | 'recipes' | 'pantry' | 'profile';

export type IngredientAlertLevel = 'normal' | 'expiring' | 'danger';

export interface IdentifiedItem {
  id: string;
  name: string;
  alertLevel: IngredientAlertLevel;
  category?: string;
  confidence?: number;
  selected?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  totalSteps: number;
  timerSeconds?: number;
  instruction: string;
  ingredientsNeeded: {
    name: string;
    amount: string;
  }[];
}

export interface RecipeCollection {
  id: string;
  name: string;
  description: string;
  emoji: string;
  colorTheme: 'orange' | 'amber' | 'emerald' | 'rose' | 'teal' | 'indigo' | 'purple';
  recipeIds: string[];
  createdAt: string;
  isDefault?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  calories: number;
  proteinGram: number;
  carbGram: number;
  fatGram: number;
  pantryMatchPercent: number;
  savesExpiring: boolean;
  dietaryTags: string[]; // e.g. "Vegan", "15 Min", "Gluten-Free", "Vegetarian"
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  ingredientsUsed: {
    name: string;
    expiring?: boolean;
  }[];
  substitutionsNote?: string;
  missingNote?: string;
  imageUrl: string;
  isSaved?: boolean;
  collectionIds?: string[];
  sourceUrl?: string;
  sourceTitle?: string;
  steps: RecipeStep[];
}

export type PantryItemStatus = 'Full' | 'Good' | 'Half' | 'Running Low' | '1 Serving' | 'Out of Stock' | string;

export type PantryLocation = 'Fridge' | 'Freezer' | 'Pantry' | 'Spice Rack';

export interface PantryItem {
  id: string;
  name: string;
  detail: string; // e.g. "Jar, 50g" or "1 carton"
  quantity: number;
  unit: string; // e.g. "pcs", "g", "kg", "can", "bottle", "bag"
  status: PantryItemStatus;
  statusBadgeColor?: 'green' | 'amber' | 'red' | 'gray';
  countBadge?: string;
  inShoppingList?: boolean;
  shoppingListChecked?: boolean;
  category: string;
  location: PantryLocation;
  expiryDate?: string; // YYYY-MM-DD
  addedDate?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  dietaryPreferences: string[];
  allergies: string[];
  stats?: {
    wasteDivertedLbs: number;
    moneySaved: number;
    recipesCooked: number;
  };
}
