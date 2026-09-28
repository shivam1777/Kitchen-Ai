import { IdentifiedItem, PantryItem, Recipe, RecipeCollection, UserProfile } from '../types';

export const INITIAL_IDENTIFIED_ITEMS: IdentifiedItem[] = [
  { id: '1', name: 'Spinach', alertLevel: 'expiring', category: 'Produce' },
  { id: '2', name: 'Chicken Breast', alertLevel: 'danger', category: 'Proteins' },
  { id: '3', name: 'Bell Peppers', alertLevel: 'expiring', category: 'Produce' },
  { id: '4', name: 'Milk', alertLevel: 'expiring', category: 'Dairy' },
  { id: '5', name: 'Garlic', alertLevel: 'normal', category: 'Produce' }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Mediterranean Quinoa Bowl',
    description: 'A fresh, vibrant bowl packed with protein, fresh veggies, and rich feta cheese.',
    prepTimeMinutes: 15,
    calories: 450,
    proteinGram: 12,
    carbGram: 58,
    fatGram: 18,
    pantryMatchPercent: 95,
    savesExpiring: true,
    dietaryTags: ['Gluten-Free', 'Vegetarian'],
    mealType: 'Lunch',
    ingredientsUsed: [
      { name: 'Quinoa' },
      { name: 'Tomatoes', expiring: true },
      { name: 'Cucumber' },
      { name: 'Feta' }
    ],
    substitutionsNote: 'Used yogurt dressing instead of lemon vinaigrette based on your pantry.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCZIKmObqO7ff-qUgNkvnY8DJWkrRBM3wI7mjp5tTVsl76NiGtOxcV2PQaI7Vks3nIOD29yGR_qHzvxRLNYck47wkGlgynRiAkH11IXSGzl7mbkbMm242Jzori9Kfbuef6d4LjLqnbQAZr5HV_C2CR-rlHyOY8tPs_NVdyrMjIjf3WeuR3W5tXEDUPEnO_ATV4DaN42NzIXvAPhf5rWBjaUObaU3jmEgmIo9YmCchhIMPVBlaLCtdFaA',
    isSaved: true,
    steps: [
      {
        stepNumber: 1,
        totalSteps: 4,
        instruction: 'Rinse quinoa under cool water and bring to a boil with 2 cups of salted water.',
        ingredientsNeeded: [{ name: 'Quinoa', amount: '1 cup' }]
      },
      {
        stepNumber: 2,
        totalSteps: 4,
        timerSeconds: 900,
        instruction: 'Simmer quinoa covered for 15 minutes until fluffy and liquid is absorbed.',
        ingredientsNeeded: [{ name: 'Quinoa', amount: 'Cooked' }]
      },
      {
        stepNumber: 3,
        totalSteps: 4,
        instruction: 'Dice the cucumber, tomatoes, and crumble feta into a bowl.',
        ingredientsNeeded: [
          { name: 'Tomatoes', amount: '1 cup diced' },
          { name: 'Cucumber', amount: '1/2 diced' },
          { name: 'Feta', amount: '1/4 cup' }
        ]
      },
      {
        stepNumber: 4,
        totalSteps: 4,
        instruction: 'Assemble the bowl with warm quinoa, top with veggies, feta, and olive oil dressing.',
        ingredientsNeeded: [{ name: 'Yogurt Dressing', amount: '2 tbsp' }]
      }
    ]
  },
  {
    id: 'rec-2',
    title: 'Creamy Tomato Basil Soup',
    description: 'Rich and hearty homemade tomato soup crafted from canned pantry staples.',
    prepTimeMinutes: 25,
    calories: 320,
    proteinGram: 8,
    carbGram: 24,
    fatGram: 22,
    pantryMatchPercent: 80,
    savesExpiring: false,
    dietaryTags: ['Vegetarian'],
    mealType: 'Dinner',
    ingredientsUsed: [
      { name: 'Canned Tomatoes' },
      { name: 'Heavy Cream' },
      { name: 'Garlic' }
    ],
    missingNote: 'Missing fresh basil; dry basil suggested as fallback.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    isSaved: false,
    steps: [
      {
        stepNumber: 1,
        totalSteps: 3,
        instruction: 'Sauté minced garlic in olive oil in a deep saucepan until fragrant.',
        ingredientsNeeded: [{ name: 'Garlic', amount: '2 cloves minced' }]
      },
      {
        stepNumber: 2,
        totalSteps: 3,
        timerSeconds: 1200,
        instruction: 'Add canned tomatoes, seasonings, and simmer for 20 minutes before stirring in heavy cream.',
        ingredientsNeeded: [
          { name: 'Canned Tomatoes', amount: '1 tin (400g)' },
          { name: 'Heavy Cream', amount: '1/2 cup' }
        ]
      },
      {
        stepNumber: 3,
        totalSteps: 3,
        instruction: 'Blend until smooth with an immersion blender and garnish with dry basil.',
        ingredientsNeeded: [{ name: 'Dried Basil', amount: '1 tsp' }]
      }
    ]
  },
  {
    id: 'rec-3',
    title: 'Spicy Avocado Egg Toast',
    description: 'Crispy sourdough topped with creamy seasoned avocado and a perfectly poached egg.',
    prepTimeMinutes: 10,
    calories: 380,
    proteinGram: 14,
    carbGram: 28,
    fatGram: 24,
    pantryMatchPercent: 100,
    savesExpiring: false,
    dietaryTags: ['Vegetarian', 'Breakfast'],
    mealType: 'Breakfast',
    ingredientsUsed: [
      { name: 'Avocado' },
      { name: 'Eggs' },
      { name: 'Sourdough' },
      { name: 'Chili Flakes' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    isSaved: true,
    steps: [
      {
        stepNumber: 1,
        totalSteps: 5,
        instruction: 'Slice sourdough bread and toast in a skillet or toaster until golden and crispy.',
        ingredientsNeeded: [{ name: 'Sourdough', amount: '2 slices' }]
      },
      {
        stepNumber: 2,
        totalSteps: 5,
        timerSeconds: 180,
        instruction: 'Mash the avocado in a small bowl with lime juice, salt, and red pepper flakes until smooth.',
        ingredientsNeeded: [
          { name: '1/2 Avocado', amount: 'Fresh' },
          { name: '1 tsp Lime Juice', amount: 'Freshly squeezed' },
          { name: 'Pinch of Salt', amount: 'To taste' }
        ]
      },
      {
        stepNumber: 3,
        totalSteps: 5,
        timerSeconds: 240,
        instruction: 'Gently poach or fry two eggs in a non-stick pan to desired runny yolk perfection.',
        ingredientsNeeded: [{ name: 'Eggs', amount: '2 large' }]
      },
      {
        stepNumber: 4,
        totalSteps: 5,
        instruction: 'Spread the mashed avocado generously across the warm toasted sourdough.',
        ingredientsNeeded: [{ name: 'Mashed Avocado', amount: 'All' }]
      },
      {
        stepNumber: 5,
        totalSteps: 5,
        instruction: 'Place poached egg on top, sprinkle with red chili flakes, and serve immediately.',
        ingredientsNeeded: [{ name: 'Chili Flakes', amount: '1/2 tsp' }]
      }
    ]
  },
  {
    id: 'rec-4',
    title: 'Roasted Sweet Potato Grain Bowl',
    description: 'A quick, nutritious bowl using leftover grains and root vegetables.',
    prepTimeMinutes: 15,
    calories: 410,
    proteinGram: 11,
    carbGram: 62,
    fatGram: 14,
    pantryMatchPercent: 90,
    savesExpiring: true,
    dietaryTags: ['Vegan', '15 Min'],
    mealType: 'Lunch',
    ingredientsUsed: [
      { name: 'Sweet Potato', expiring: true },
      { name: 'Quinoa' },
      { name: 'Tahini' }
    ],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCZIKmObqO7ff-qUgNkvnY8DJWkrRBM3wI7mjp5tTVsl76NiGtOxcV2PQaI7Vks3nIOD29yGR_qHzvxRLNYck47wkGlgynRiAkH11IXSGzl7mbkbMm242Jzori9Kfbuef6d4LjLqnbQAZr5HV_C2CR-rlHyOY8tPs_NVdyrMjIjf3WeuR3W5tXEDUPEnO_ATV4DaN42NzIXvAPhf5rWBjaUObaU3jmEgmIo9YmCchhIMPVBlaLCtdFaA',
    isSaved: false,
    steps: [
      {
        stepNumber: 1,
        totalSteps: 3,
        instruction: 'Cube sweet potato and roast with olive oil and paprika at 400°F.',
        ingredientsNeeded: [{ name: 'Sweet Potato', amount: '1 medium' }]
      },
      {
        stepNumber: 2,
        totalSteps: 3,
        instruction: 'Warm leftover grains in a bowl.',
        ingredientsNeeded: [{ name: 'Grains', amount: '1 cup' }]
      },
      {
        stepNumber: 3,
        totalSteps: 3,
        instruction: 'Drizzle with tahini lemon dressing and sprinkle seeds.',
        ingredientsNeeded: [{ name: 'Tahini', amount: '2 tbsp' }]
      }
    ]
  },
  {
    id: 'rec-5',
    title: 'Zero-Waste Veggie Frittata',
    description: 'The perfect way to use up those odds and ends in the crisper drawer.',
    prepTimeMinutes: 25,
    calories: 340,
    proteinGram: 22,
    carbGram: 10,
    fatGram: 24,
    pantryMatchPercent: 88,
    savesExpiring: true,
    dietaryTags: ['Vegetarian', '25 Min'],
    mealType: 'Breakfast',
    ingredientsUsed: [
      { name: 'Eggs' },
      { name: 'Spinach', expiring: true },
      { name: 'Bell Peppers', expiring: true }
    ],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE8aFh40AO9i4KPYEGukIIa2xIjksBGXpjjU7GfCAjD99tKf51YGp24z1Kt-uwZbNA-l-Vu6Qit--zyD1FBKRlGPQ3C8jZoZ2I4SnCB4cyvqS2lcjVNdmQPb8Rb2y-69Xd2KRNWRJOituYLN0su2_7e5QqEZSEuO2Lt8G05OVG_BoHKg2y9cxhT7oKteeRYCmyfbCSrdyPbCVyIAENWsfCYBnCsvong734InkFUjyEu5N_EDALwg9Lxg',
    isSaved: true,
    steps: [
      {
        stepNumber: 1,
        totalSteps: 3,
        instruction: 'Whisk 6 eggs with splash of milk, salt, and black pepper.',
        ingredientsNeeded: [{ name: 'Eggs', amount: '6 whole' }]
      },
      {
        stepNumber: 2,
        totalSteps: 3,
        instruction: 'Sauté chopped veggies in an oven-safe skillet.',
        ingredientsNeeded: [{ name: 'Vegetables', amount: '1.5 cups chopped' }]
      },
      {
        stepNumber: 3,
        totalSteps: 3,
        timerSeconds: 900,
        instruction: 'Pour egg mixture over veggies and bake at 375°F for 15 minutes.',
        ingredientsNeeded: [{ name: 'Feta Cheese', amount: '2 tbsp' }]
      }
    ]
  },
  {
    id: 'rec-6',
    title: 'Anything-Greens Pesto Pasta',
    description: 'Whip up a vibrant sauce using spinach, kale, or basil stems before they wilt.',
    prepTimeMinutes: 10,
    calories: 490,
    proteinGram: 15,
    carbGram: 64,
    fatGram: 20,
    pantryMatchPercent: 92,
    savesExpiring: true,
    dietaryTags: ['Quick', '10 Min'],
    mealType: 'Dinner',
    ingredientsUsed: [
      { name: 'Pasta' },
      { name: 'Spinach', expiring: true },
      { name: 'Garlic' }
    ],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEzVdcHXVQCzT2UZPjkgsov5uOvZlpYX-1-rRpUv6QfG5X6uUg1inffVeUg_XPOWMEOs-94p48isqEHNX3nZUsRrwRKWk-FGwwgNssYXlVhVkiyVcqLZWTVHKReV3cilG3cLsgMN5qs0uAqiC_-um7lTUf-Moxl9iMaIaYH_lKcGAbb6KXVfSPo-YwRnAxafNb_T9KgPIFZ7WGWkHUfB5-8sw1WCHDtB31rybQO8Z-WRZR7fYd3aDbPA',
    isSaved: false,
    steps: [
      {
        stepNumber: 1,
        totalSteps: 3,
        timerSeconds: 600,
        instruction: 'Boil pasta in salted water until al dente.',
        ingredientsNeeded: [{ name: 'Pasta', amount: '200g' }]
      },
      {
        stepNumber: 2,
        totalSteps: 3,
        instruction: 'Blend greens, garlic, nuts, olive oil, and parmesan into pesto.',
        ingredientsNeeded: [{ name: 'Spinach/Kale', amount: '2 cups' }]
      },
      {
        stepNumber: 3,
        totalSteps: 3,
        instruction: 'Toss hot pasta with pesto and serve.',
        ingredientsNeeded: [{ name: 'Pesto Sauce', amount: '1/2 cup' }]
      }
    ]
  }
];

const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_PANTRY_ITEMS: PantryItem[] = [
  // Produce (in Fridge)
  {
    id: 'p-produce-1',
    name: 'Fresh Baby Spinach',
    detail: 'Plastic tub, 200g',
    quantity: 1,
    unit: 'tub',
    status: 'Running Low',
    category: 'Produce',
    location: 'Fridge',
    expiryDate: getRelativeDate(1), // Expires tomorrow!
    countBadge: '1 tub',
    statusBadgeColor: 'red',
    inShoppingList: true
  },
  {
    id: 'p-produce-2',
    name: 'Bell Peppers (Red & Yellow)',
    detail: 'Crisper drawer',
    quantity: 2,
    unit: 'pcs',
    status: 'Good',
    category: 'Produce',
    location: 'Fridge',
    expiryDate: getRelativeDate(2), // 2 days left
    countBadge: '2 pcs',
    statusBadgeColor: 'amber'
  },
  {
    id: 'p-produce-3',
    name: 'Organic Avocados',
    detail: 'Counter ripened',
    quantity: 3,
    unit: 'pcs',
    status: 'Full',
    category: 'Produce',
    location: 'Pantry',
    expiryDate: getRelativeDate(4),
    countBadge: '3 pcs',
    statusBadgeColor: 'green'
  },
  {
    id: 'p-produce-4',
    name: 'Garlic Bulbs',
    detail: 'Mesh bag',
    quantity: 4,
    unit: 'heads',
    status: 'Good',
    category: 'Produce',
    location: 'Pantry',
    expiryDate: getRelativeDate(21),
    countBadge: '4 heads',
    statusBadgeColor: 'green'
  },

  // Dairy & Refrigerated
  {
    id: 'p-dairy-1',
    name: 'Oat Milk (Barista Blend)',
    detail: 'Carton, 1L',
    quantity: 1,
    unit: 'carton',
    status: 'Running Low',
    category: 'Dairy',
    location: 'Fridge',
    expiryDate: getRelativeDate(0), // Expires today!
    countBadge: '< 20%',
    statusBadgeColor: 'red',
    inShoppingList: true
  },
  {
    id: 'p-dairy-2',
    name: 'Greek Yogurt',
    detail: 'Tub, 500g',
    quantity: 1,
    unit: 'tub',
    status: 'Half',
    category: 'Dairy',
    location: 'Fridge',
    expiryDate: getRelativeDate(3),
    countBadge: 'Half',
    statusBadgeColor: 'amber'
  },
  {
    id: 'p-dairy-3',
    name: 'Free-Range Eggs',
    detail: 'Carton of 12',
    quantity: 8,
    unit: 'eggs',
    status: 'Good',
    category: 'Dairy',
    location: 'Fridge',
    expiryDate: getRelativeDate(12),
    countBadge: '8 pcs',
    statusBadgeColor: 'green'
  },

  // Proteins
  {
    id: 'p-prot-1',
    name: 'Organic Chicken Breast',
    detail: 'Fresh pack, 400g',
    quantity: 1,
    unit: 'pack',
    status: 'Running Low',
    category: 'Proteins',
    location: 'Fridge',
    expiryDate: getRelativeDate(-1), // Expired yesterday!
    countBadge: '1 pack',
    statusBadgeColor: 'red',
    inShoppingList: true
  },
  {
    id: 'p-prot-2',
    name: 'Wild Salmon Fillets',
    detail: 'Vacuum sealed',
    quantity: 2,
    unit: 'fillets',
    status: 'Good',
    category: 'Proteins',
    location: 'Freezer',
    expiryDate: getRelativeDate(45),
    countBadge: '2 fillets',
    statusBadgeColor: 'green'
  },
  {
    id: 'p-prot-3',
    name: 'Firm Organic Tofu',
    detail: 'Block, 350g',
    quantity: 2,
    unit: 'blocks',
    status: 'Full',
    category: 'Proteins',
    location: 'Fridge',
    expiryDate: getRelativeDate(8),
    countBadge: '2 blocks',
    statusBadgeColor: 'green'
  },

  // Spices & Herbs
  { id: 'p-1', name: 'Cumin Powder', detail: 'Jar, 50g', quantity: 1, unit: 'jar', status: 'Full', category: 'Spices & Herbs', location: 'Spice Rack', countBadge: 'Full', statusBadgeColor: 'gray' },
  { id: 'p-2', name: 'Smoked Paprika', detail: 'Running Low', quantity: 1, unit: 'jar', status: 'Running Low', category: 'Spices & Herbs', location: 'Spice Rack', countBadge: '< 10%', statusBadgeColor: 'red', inShoppingList: true },
  { id: 'p-3', name: 'Oregano (Dried)', detail: 'Jar, 30g', quantity: 1, unit: 'jar', status: 'Half', category: 'Spices & Herbs', location: 'Spice Rack', countBadge: 'Half', statusBadgeColor: 'gray' },
  { id: 'p-4', name: 'Black Pepper', detail: 'Jar, 80g', quantity: 1, unit: 'jar', status: 'Full', category: 'Spices & Herbs', location: 'Spice Rack', countBadge: 'Full', statusBadgeColor: 'gray' },
  { id: 'p-5', name: 'Garlic Powder', detail: 'Jar, 45g', quantity: 1, unit: 'jar', status: 'Good', category: 'Spices & Herbs', location: 'Spice Rack', countBadge: 'Good', statusBadgeColor: 'gray' },

  // Grains & Pasta
  { id: 'p-6', name: 'Jasmine Rice', detail: 'Bag, 5kg', quantity: 1, unit: 'bag', status: 'Good', category: 'Grains & Pasta', location: 'Pantry', countBadge: 'Good', statusBadgeColor: 'gray' },
  { id: 'p-7', name: 'Spaghetti', detail: 'Running Low', quantity: 1, unit: 'pack', status: 'Running Low', category: 'Grains & Pasta', location: 'Pantry', countBadge: '1 Serving', statusBadgeColor: 'red', inShoppingList: true },
  { id: 'p-8', name: 'Quinoa', detail: 'Box, 500g', quantity: 1, unit: 'box', status: 'Full', category: 'Grains & Pasta', location: 'Pantry', countBadge: 'Full', statusBadgeColor: 'gray' },
  { id: 'p-9', name: 'Penne Pasta', detail: 'Box, 400g', quantity: 1, unit: 'box', status: 'Good', category: 'Grains & Pasta', location: 'Pantry', countBadge: 'Good', statusBadgeColor: 'gray' },

  // Canned Goods
  { id: 'p-10', name: 'Diced Tomatoes', detail: 'Can, 400g', quantity: 4, unit: 'cans', status: 'In Stock', category: 'Canned Goods', location: 'Pantry', countBadge: 'x4', statusBadgeColor: 'gray' },
  { id: 'p-11', name: 'Chickpeas', detail: 'Can, 400g', quantity: 2, unit: 'cans', status: 'In Stock', category: 'Canned Goods', location: 'Pantry', countBadge: 'x2', statusBadgeColor: 'gray' },
  { id: 'p-12', name: 'Coconut Milk', detail: 'Out of Stock', quantity: 0, unit: 'cans', status: 'Out of Stock', category: 'Canned Goods', location: 'Pantry', countBadge: 'x0', statusBadgeColor: 'red', inShoppingList: true },
  { id: 'p-13', name: 'Black Beans', detail: 'Can, 400g', quantity: 3, unit: 'cans', status: 'In Stock', category: 'Canned Goods', location: 'Pantry', countBadge: 'x3', statusBadgeColor: 'gray' }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Alex Culinary',
  email: 'alex.c@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  dietaryPreferences: ['Vegan'],
  allergies: ['Nuts', 'Dairy', 'Gluten', 'Shellfish'],
  stats: {
    wasteDivertedLbs: 18.4,
    moneySaved: 142,
    recipesCooked: 24
  }
};

export const INITIAL_RECIPE_COLLECTIONS: RecipeCollection[] = [
  {
    id: 'col-breakfast',
    name: 'Breakfast Favorites',
    description: 'High-protein breakfasts & energizing morning staples to jumpstart your day.',
    emoji: '🥞',
    colorTheme: 'amber',
    recipeIds: ['rec-3'],
    createdAt: '2026-09-20T08:00:00Z',
    isDefault: true
  },
  {
    id: 'col-quick-dinners',
    name: 'Quick Dinners',
    description: 'Fast weeknight family dinners ready in 25 minutes or less with zero fuss.',
    emoji: '⚡',
    colorTheme: 'orange',
    recipeIds: ['rec-1', 'rec-2'],
    createdAt: '2026-09-22T14:30:00Z',
    isDefault: true
  },
  {
    id: 'col-zero-waste',
    name: 'Zero-Waste Stars',
    description: 'Hero recipes crafted specifically to rescue expiring produce and reduce food waste.',
    emoji: '🌱',
    colorTheme: 'emerald',
    recipeIds: ['rec-1', 'rec-4'],
    createdAt: '2026-09-25T11:00:00Z',
    isDefault: true
  },
  {
    id: 'col-weekend-feasts',
    name: 'Comfort Classics',
    description: 'Warm, cozy, and nourishing comfort food favorites for relaxing dinners.',
    emoji: '🍲',
    colorTheme: 'rose',
    recipeIds: ['rec-2'],
    createdAt: '2026-09-26T16:45:00Z',
    isDefault: false
  }
];

