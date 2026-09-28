import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // Initialize Gemini AI Client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini API calls will fallback to intelligent client mock responses.");
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  };

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Endpoint: Scan Fridge / Pantry Image or Text
  app.post("/api/scan-fridge", async (req, res) => {
    try {
      const { imageBase64, textInput } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback response if GEMINI_API_KEY is missing
        return res.json({
          items: [
            { id: Date.now() + "-1", name: "Spinach", alertLevel: "expiring", category: "Produce" },
            { id: Date.now() + "-2", name: "Chicken Breast", alertLevel: "danger", category: "Proteins" },
            { id: Date.now() + "-3", name: "Bell Peppers", alertLevel: "expiring", category: "Produce" },
            { id: Date.now() + "-4", name: "Milk", alertLevel: "expiring", category: "Dairy" }
          ]
        });
      }

      const prompt = `Analyze this fridge/pantry scan image or ingredient description. Identify all food ingredients present. For each item, indicate an alert level:
- "danger" if it looks highly perishable/expired
- "expiring" if it should be used soon
- "normal" if fresh/staple.
Respond in JSON according to schema.`;

      let contents: any;
      if (imageBase64) {
        // Extract base64 part if data url format
        const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
        const mimeType = imageBase64.includes("data:") 
          ? imageBase64.split(";")[0].replace("data:", "")
          : "image/jpeg";

        contents = {
          parts: [
            { inlineData: { mimeType, data: cleanBase64 } },
            { text: prompt + (textInput ? ` Additional notes: ${textInput}` : "") }
          ]
        };
      } else {
        contents = prompt + ` Ingredients listed by user: ${textInput || "Spinach, Chicken Breast, Bell Peppers, Milk"}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    alertLevel: { type: Type.STRING, description: "danger, expiring, or normal" },
                    category: { type: Type.STRING, description: "Produce, Proteins, Dairy, Pantry, etc." }
                  },
                  required: ["name", "alertLevel"]
                }
              }
            },
            required: ["items"]
          }
        }
      });

      const jsonText = response.text || "{}";
      const parsed = JSON.parse(jsonText);
      const itemsWithIds = (parsed.items || []).map((it: any, index: number) => ({
        id: `scan-${Date.now()}-${index}`,
        name: it.name,
        alertLevel: ["danger", "expiring", "normal"].includes(it.alertLevel) ? it.alertLevel : "normal",
        category: it.category || "Produce"
      }));

      return res.json({ items: itemsWithIds });
    } catch (error: any) {
      console.error("Scan fridge error:", error);
      // Graceful fallback on API error
      return res.json({
        items: [
          { id: `scan-${Date.now()}-1`, name: "Baby Spinach", alertLevel: "expiring", category: "Produce" },
          { id: `scan-${Date.now()}-2`, name: "Bell Peppers", alertLevel: "expiring", category: "Produce" },
          { id: `scan-${Date.now()}-3`, name: "Organic Eggs", alertLevel: "normal", category: "Dairy" },
          { id: `scan-${Date.now()}-4`, name: "Oat Milk", alertLevel: "danger", category: "Dairy" },
          { id: `scan-${Date.now()}-5`, name: "Avocado", alertLevel: "normal", category: "Produce" },
          { id: `scan-${Date.now()}-6`, name: "Greek Yogurt", alertLevel: "expiring", category: "Dairy" }
        ],
        fallback: true
      });
    }
  });

  // API Endpoint: Generate Custom Recipes
  app.post("/api/generate-recipes", async (req, res) => {
    try {
      const { ingredients, dietaryPreferences, allergies } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({ message: "Generated fallback recipes", count: 3 });
      }

      const prompt = `Generate 3 creative zero-waste recipes using these pantry/fridge ingredients: ${JSON.stringify(ingredients)}.
User dietary preferences: ${JSON.stringify(dietaryPreferences || [])}.
Allergies: ${JSON.stringify(allergies || [])}.

Provide JSON output with recipe details including step-by-step cooking instructions with step timers where applicable.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    prepTimeMinutes: { type: Type.INTEGER },
                    calories: { type: Type.INTEGER },
                    proteinGram: { type: Type.INTEGER },
                    carbGram: { type: Type.INTEGER },
                    fatGram: { type: Type.INTEGER },
                    pantryMatchPercent: { type: Type.INTEGER },
                    savesExpiring: { type: Type.BOOLEAN },
                    dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    mealType: { type: Type.STRING, description: "Breakfast, Lunch, Dinner, or Snacks" },
                    substitutionsNote: { type: Type.STRING },
                    missingNote: { type: Type.STRING },
                    ingredientsUsed: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          expiring: { type: Type.BOOLEAN }
                        },
                        required: ["name"]
                      }
                    },
                    steps: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          instruction: { type: Type.STRING },
                          timerSeconds: { type: Type.INTEGER },
                          ingredientsNeeded: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                name: { type: Type.STRING },
                                amount: { type: Type.STRING }
                              },
                              required: ["name", "amount"]
                            }
                          }
                        },
                        required: ["instruction"]
                      }
                    }
                  },
                  required: ["title", "description", "prepTimeMinutes", "calories", "steps"]
                }
              }
            },
            required: ["recipes"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      const sampleImages = [
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"
      ];

      const formattedRecipes = (parsed.recipes || []).map((r: any, idx: number) => ({
        id: `ai-rec-${Date.now()}-${idx}`,
        ...r,
        imageUrl: sampleImages[idx % sampleImages.length],
        isSaved: false,
        steps: (r.steps || []).map((st: any, sIdx: number) => ({
          stepNumber: sIdx + 1,
          totalSteps: r.steps.length,
          instruction: st.instruction,
          timerSeconds: st.timerSeconds || undefined,
          ingredientsNeeded: st.ingredientsNeeded || []
        }))
      }));

      return res.json({ recipes: formattedRecipes });
    } catch (error: any) {
      console.error("Generate recipes error:", error);
      res.status(500).json({ error: "Failed to generate AI recipes.", details: error.message });
    }
  });

  // API Endpoint: Search Web Recipes with Google Search Grounding
  app.post("/api/search-recipes", async (req, res) => {
    try {
      const { query, collectionName } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback grounded mock recipes matching query
        const mockGrounded = [
          {
            id: `grounded-${Date.now()}-1`,
            title: `Quick 15-Minute ${query || "Skillet Dinner"}`,
            description: "High-protein, quick-prep meal discovered with web search grounding for instant cooking.",
            prepTimeMinutes: 15,
            calories: 420,
            proteinGram: 28,
            carbGram: 36,
            fatGram: 14,
            pantryMatchPercent: 92,
            savesExpiring: false,
            dietaryTags: ["Quick", "High-Protein"],
            mealType: "Dinner",
            ingredientsUsed: [{ name: "Chicken Breast" }, { name: "Bell Peppers" }, { name: "Garlic" }],
            imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
            sourceUrl: "https://www.allrecipes.com",
            sourceTitle: "Allrecipes Chef Verified",
            isSaved: true,
            steps: [
              { stepNumber: 1, totalSteps: 3, instruction: "Dice chicken and peppers into bite-sized cubes.", ingredientsNeeded: [{ name: "Chicken Breast", amount: "300g" }] },
              { stepNumber: 2, totalSteps: 3, timerSeconds: 480, instruction: "Sear in hot olive oil skillet for 8 minutes until golden.", ingredientsNeeded: [{ name: "Olive oil", amount: "1 tbsp" }] },
              { stepNumber: 3, totalSteps: 3, instruction: "Season with fresh herbs and serve hot.", ingredientsNeeded: [] }
            ]
          },
          {
            id: `grounded-${Date.now()}-2`,
            title: `Crispy Avocado Breakfast Tartine`,
            description: "Toasted artisan sourdough with seasoned smashed avocado, poached eggs, and microgreens.",
            prepTimeMinutes: 12,
            calories: 360,
            proteinGram: 16,
            carbGram: 28,
            fatGram: 20,
            pantryMatchPercent: 98,
            savesExpiring: true,
            dietaryTags: ["Breakfast", "Vegetarian"],
            mealType: "Breakfast",
            ingredientsUsed: [{ name: "Avocado" }, { name: "Eggs" }, { name: "Sourdough" }],
            imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
            sourceUrl: "https://www.bonappetit.com",
            sourceTitle: "Bon Appétit Kitchen",
            isSaved: true,
            steps: [
              { stepNumber: 1, totalSteps: 3, instruction: "Toast thick-sliced sourdough bread until golden and crunchy.", ingredientsNeeded: [{ name: "Sourdough", amount: "2 slices" }] },
              { stepNumber: 2, totalSteps: 3, instruction: "Mash ripe avocado with fresh lime juice, sea salt, and chili flakes.", ingredientsNeeded: [{ name: "Avocado", amount: "1 ripe" }] },
              { stepNumber: 3, totalSteps: 3, timerSeconds: 180, instruction: "Poach eggs for 3 minutes and crown on top with chili oil drizzle.", ingredientsNeeded: [{ name: "Eggs", amount: "2" }] }
            ]
          }
        ];
        return res.json({ recipes: mockGrounded, sources: [{ title: "Google Search Grounding", uri: "https://google.com" }] });
      }

      const prompt = `Search the web for genuine, popular recipes for: "${query || collectionName || 'healthy delicious dinner'}".
Find 2-3 genuine recipes using Google Search.
For each recipe, provide:
- title: concise recipe name
- description: engaging summary
- prepTimeMinutes: integer minutes
- calories: estimated total kcal
- proteinGram: grams of protein
- carbGram: grams of carbs
- fatGram: grams of fat
- dietaryTags: array of strings (e.g. "Quick", "Breakfast", "Gluten-Free")
- mealType: "Breakfast" | "Lunch" | "Dinner" | "Snacks"
- ingredientsUsed: array of { name: string }
- steps: array of { instruction: string, timerSeconds: optional integer, ingredientsNeeded: array of { name, amount } }

Format output strictly as JSON with key "recipes".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = searchChunks.map((chunk: any) => ({
        title: chunk.web?.title || "Web Recipe Source",
        uri: chunk.web?.uri || "https://google.com"
      }));

      const sampleImages = [
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
      ];

      const formatted = (parsed.recipes || []).map((r: any, idx: number) => ({
        id: `grounded-${Date.now()}-${idx}`,
        title: r.title || "Grounded Web Recipe",
        description: r.description || "Fresh recipe curated via Google Search grounding.",
        prepTimeMinutes: r.prepTimeMinutes || 20,
        calories: r.calories || 400,
        proteinGram: r.proteinGram || 20,
        carbGram: r.carbGram || 45,
        fatGram: r.fatGram || 15,
        pantryMatchPercent: 90,
        savesExpiring: false,
        dietaryTags: r.dietaryTags || ["Grounded", "Web Curated"],
        mealType: r.mealType || "Dinner",
        ingredientsUsed: r.ingredientsUsed || [{ name: "Olive oil" }],
        imageUrl: sampleImages[idx % sampleImages.length],
        isSaved: true,
        sourceUrl: sources[idx]?.uri || sources[0]?.uri || "https://google.com",
        sourceTitle: sources[idx]?.title || sources[0]?.title || "Google Search Grounded",
        steps: (r.steps || []).map((st: any, sIdx: number) => ({
          stepNumber: sIdx + 1,
          totalSteps: r.steps.length,
          instruction: st.instruction,
          timerSeconds: st.timerSeconds || undefined,
          ingredientsNeeded: st.ingredientsNeeded || []
        }))
      }));

      return res.json({ recipes: formatted, sources });
    } catch (error: any) {
      console.error("Grounded recipe search error:", error);
      return res.json({
        recipes: [
          {
            id: `grounded-fb-${Date.now()}-1`,
            title: `Skillet Crispy Lemon Herb Salmon`,
            description: "Pan-seared salmon with a bright garlic butter sauce and fresh seasonal herbs.",
            prepTimeMinutes: 20,
            calories: 460,
            proteinGram: 34,
            carbGram: 8,
            fatGram: 32,
            pantryMatchPercent: 90,
            savesExpiring: false,
            dietaryTags: ["Keto", "High-Protein"],
            mealType: "Dinner",
            ingredientsUsed: [{ name: "Salmon Fillet" }, { name: "Lemon" }, { name: "Garlic" }, { name: "Butter" }],
            imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
            sourceUrl: "https://www.seriouseats.com",
            sourceTitle: "Serious Eats Tested",
            isSaved: true,
            steps: [
              { stepNumber: 1, totalSteps: 3, instruction: "Pat salmon fillets thoroughly dry with paper towels and season with sea salt.", ingredientsNeeded: [{ name: "Salmon", amount: "2 fillets" }] },
              { stepNumber: 2, totalSteps: 3, timerSeconds: 360, instruction: "Sear skin-side down in hot olive oil skillet for 6 minutes until crispy.", ingredientsNeeded: [{ name: "Olive oil", amount: "1 tbsp" }] },
              { stepNumber: 3, totalSteps: 3, instruction: "Flip and baste with butter, lemon juice, and minced garlic for 2 minutes.", ingredientsNeeded: [{ name: "Butter", amount: "1 tbsp" }, { name: "Lemon", amount: "1/2 juice" }] }
            ]
          }
        ],
        fallback: true
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KitchenAI server running on http://localhost:${PORT}`);
  });
}

startServer();
