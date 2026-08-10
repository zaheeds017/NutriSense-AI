/**
 * Packaged Food & Snack Sample Database for Testing & OCR/AI Demonstration
 */

export const SAMPLE_FOOD_PACKAGES = [
  {
    id: "doritos-nacho-cheese",
    name: "Doritos Nacho Cheese Flavored Tortilla Chips",
    brand: "Frito-Lay",
    category: "Snacks",
    barcode: "028400090858",
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80",
    labelImageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80",
    ocrRawText: `
NUTRITION FACTS
Serving size: 1 oz (28g / about 12 chips)
Servings Per Container: About 9

Amount Per Serving
Calories 150

Total Fat 8g (10% DV)
  Saturated Fat 1.5g (7% DV)
  Trans Fat 0g
Cholesterol 0mg (0% DV)
Sodium 210mg (9% DV)
Total Carbohydrate 18g (6% DV)
  Dietary Fiber 1g (4% DV)
  Total Sugars 1g
    Includes 0g Added Sugars
Protein 2g

INGREDIENTS: Corn, Vegetable Oil (Corn, Canola, and/or Sunflower Oil), Maltodextrin (Made from Corn), Salt, Cheddar Cheese (Milk, Cheese Cultures, Salt, Enzymes), Whey, Monosodium Glutamate, Buttermilk, Romano Cheese (Part-Skim Cow's Milk, Cheese Cultures, Salt, Enzymes), Whey Protein Concentrate, Onion Powder, Corn Flour, Natural and Artificial Flavor, Dextrose, Tomato Powder, Lactose, Spices, Artificial Color (Yellow 6, Yellow 5, Red 40), Lactic Acid, Citric Acid, Sugar, Garlic Powder, Skim Milk, Red and Green Bell Pepper Powder, Disodium Inosinate, Disodium Guanylate.

CONTAINS MILK INGREDIENTS.
    `,
    extractedJson: {
      serving_info: {
        serving_size: "1 oz (28g / about 12 chips)",
        servings_per_container: 9
      },
      macros: {
        calories: { value: 150, unit: "kcal" },
        total_fat: { value: 8, unit: "g" },
        saturated_fat: { value: 1.5, unit: "g" },
        trans_fat: { value: 0, unit: "g" },
        cholesterol: { value: 0, unit: "mg" },
        sodium: { value: 210, unit: "mg" },
        total_carbohydrates: { value: 18, unit: "g" },
        dietary_fiber: { value: 1, unit: "g" },
        total_sugars: { value: 1, unit: "g" },
        added_sugars: { value: 0, unit: "g" },
        protein: { value: 2, unit: "g" }
      },
      ingredients: [
        "Corn",
        "Vegetable Oil (Corn, Canola, and/or Sunflower Oil)",
        "Maltodextrin",
        "Salt",
        "Cheddar Cheese (Milk, Cheese Cultures, Salt, Enzymes)",
        "Whey",
        "Monosodium Glutamate (MSG)",
        "Buttermilk",
        "Romano Cheese",
        "Artificial Color (Yellow 6, Yellow 5, Red 40)",
        "Disodium Inosinate",
        "Disodium Guanylate"
      ],
      allergens_identified: ["Milk"]
    },
    nutriScore: "D",
    novaGroup: 4,
    healthFlags: [
      { type: "warning", title: "Artificial Food Dyes", detail: "Contains Yellow 6, Yellow 5, Red 40" },
      { type: "warning", title: "High Processing", detail: "Contains Monosodium Glutamate & Flavor Enhancers" },
      { type: "info", title: "Low Sugar", detail: "Only 1g total sugars per serving" }
    ]
  },

  {
    id: "oreo-original",
    name: "Oreo Sandwich Chocolate Cookies",
    brand: "Nabisco",
    category: "Cookies & Sweets",
    barcode: "044000032029",
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
    labelImageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80",
    ocrRawText: `
NUTRITION FACTS
Serving Size: 3 cookies (34g)
Servings Per Container: About 12

Amount Per Serving
Calories 160

Total Fat 7g (9% DV)
  Saturated Fat 2g (10% DV)
  Trans Fat 0g
Cholesterol 0mg (0% DV)
Sodium 135mg (6% DV)
Total Carbohydrate 25g (9% DV)
  Dietary Fiber <1g (3% DV)
  Total Sugars 14g
    Includes 14g Added Sugars (28% DV)
Protein 1g

INGREDIENTS: UNBLEACHED ENRICHED FLOUR (WHEAT FLOUR, NIACIN, REDUCED IRON, THIAMINE MONONITRATE {VITAMIN B1}, RIBOFLAVIN {VITAMIN B2}, FOLIC ACID), SUGAR, PALM AND/OR CANOLA OIL, COCOA (PROCESSED WITH ALKALI), HIGH FRUCTOSE CORN SYRUP, LEAVENING (BAKING SODA AND/OR CALCIUM PHOSPHATE), SALT, SOY LECITHIN, CHOCOLATE, ARTIFICIAL FLAVOR.

CONTAINS WHEAT, SOY.
    `,
    extractedJson: {
      serving_info: {
        serving_size: "3 cookies (34g)",
        servings_per_container: 12
      },
      macros: {
        calories: { value: 160, unit: "kcal" },
        total_fat: { value: 7, unit: "g" },
        saturated_fat: { value: 2, unit: "g" },
        trans_fat: { value: 0, unit: "g" },
        cholesterol: { value: 0, unit: "mg" },
        sodium: { value: 135, unit: "mg" },
        total_carbohydrates: { value: 25, unit: "g" },
        dietary_fiber: { value: 0.5, unit: "g" },
        total_sugars: { value: 14, unit: "g" },
        added_sugars: { value: 14, unit: "g" },
        protein: { value: 1, unit: "g" }
      },
      ingredients: [
        "Unbleached Enriched Flour (Wheat Flour, Niacin, Reduced Iron, Thiamine Mononitrate, Riboflavin, Folic Acid)",
        "Sugar",
        "Palm and/or Canola Oil",
        "Cocoa (Processed with Alkali)",
        "High Fructose Corn Syrup",
        "Leavening (Baking Soda, Calcium Phosphate)",
        "Salt",
        "Soy Lecithin",
        "Chocolate",
        "Artificial Flavor"
      ],
      allergens_identified: ["Wheat", "Soy"]
    },
    nutriScore: "E",
    novaGroup: 4,
    healthFlags: [
      { type: "danger", title: "High Added Sugars", detail: "14g added sugars (28% Daily Value) per 3 cookies" },
      { type: "warning", title: "High Fructose Corn Syrup", detail: "Contains HFCS sweetener" },
      { type: "warning", title: "Palm Oil Content", detail: "Contains saturated palm oil" }
    ]
  },

  {
    id: "chobani-greek-yogurt",
    name: "Chobani Plain Non-Fat Greek Yogurt",
    brand: "Chobani",
    category: "Dairy & Yogurt",
    barcode: "818290010025",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
    labelImageUrl: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=800&q=80",
    ocrRawText: `
NUTRITION FACTS
Serving Size: 3/4 cup (170g)
Servings Per Container: 1

Amount Per Serving
Calories 90

Total Fat 0g (0% DV)
  Saturated Fat 0g (0% DV)
  Trans Fat 0g
Cholesterol 5mg (2% DV)
Sodium 55mg (2% DV)
Total Carbohydrate 6g (2% DV)
  Dietary Fiber 0g (0% DV)
  Total Sugars 4g
    Includes 0g Added Sugars
Protein 16g

INGREDIENTS: Cultured Nonfat Milk.
Contains Live And Active Cultures: S. Thermophilus, L. Bulgaricus, L. Acidophilus, Bifidus, L. Casei, And L. Rhamnosus.

CONTAINS MILK.
    `,
    extractedJson: {
      serving_info: {
        serving_size: "3/4 cup (170g)",
        servings_per_container: 1
      },
      macros: {
        calories: { value: 90, unit: "kcal" },
        total_fat: { value: 0, unit: "g" },
        saturated_fat: { value: 0, unit: "g" },
        trans_fat: { value: 0, unit: "g" },
        cholesterol: { value: 5, unit: "mg" },
        sodium: { value: 55, unit: "mg" },
        total_carbohydrates: { value: 6, unit: "g" },
        dietary_fiber: { value: 0, unit: "g" },
        total_sugars: { value: 4, unit: "g" },
        added_sugars: { value: 0, unit: "g" },
        protein: { value: 16, unit: "g" }
      },
      ingredients: [
        "Cultured Nonfat Milk",
        "Live Active Probiotic Cultures (S. Thermophilus, L. Bulgaricus, L. Acidophilus, Bifidus, L. Casei, L. Rhamnosus)"
      ],
      allergens_identified: ["Milk"]
    },
    nutriScore: "A",
    novaGroup: 1,
    healthFlags: [
      { type: "success", title: "High Protein", detail: "16g high quality protein per container" },
      { type: "success", title: "Zero Fat & Added Sugar", detail: "0g Fat, 0g Added Sugar" },
      { type: "success", title: "Probiotic Rich", detail: "Contains 6 active live probiotic strains" }
    ]
  },

  {
    id: "quest-protein-bar",
    name: "Quest Nutrition Chocolate Chip Cookie Dough Protein Bar",
    brand: "Quest Nutrition",
    category: "Nutrition Bars",
    barcode: "888849000010",
    imageUrl: "https://images.unsplash.com/photo-1622484210800-77a835a5bc9b?auto=format&fit=crop&w=800&q=80",
    labelImageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80",
    ocrRawText: `
NUTRITION FACTS
Serving Size: 1 bar (60g)
Servings Per Container: 1

Amount Per Serving
Calories 200

Total Fat 7g (9% DV)
  Saturated Fat 2.5g (13% DV)
  Trans Fat 0g
Cholesterol 5mg (2% DV)
Sodium 200mg (9% DV)
Total Carbohydrate 21g (8% DV)
  Dietary Fiber 12g (43% DV)
  Total Sugars 1g
    Includes 0g Added Sugars
  Erythritol 4g
Protein 21g

INGREDIENTS: Protein Blend (Milk Protein Isolate, Whey Protein Isolate), Soluble Corn Fiber, Almonds, Water, Unsweetened Chocolate, Erythritol, Natural Flavors, Cocoa Butter. Contains less than 2% of: Sea Salt, Sunflower Lecithin, Steviol Glycosides (Stevia), Sucralose.

CONTAINS MILK, ALMONDS.
    `,
    extractedJson: {
      serving_info: {
        serving_size: "1 bar (60g)",
        servings_per_container: 1
      },
      macros: {
        calories: { value: 200, unit: "kcal" },
        total_fat: { value: 7, unit: "g" },
        saturated_fat: { value: 2.5, unit: "g" },
        trans_fat: { value: 0, unit: "g" },
        cholesterol: { value: 5, unit: "mg" },
        sodium: { value: 200, unit: "mg" },
        total_carbohydrates: { value: 21, unit: "g" },
        dietary_fiber: { value: 12, unit: "g" },
        total_sugars: { value: 1, unit: "g" },
        added_sugars: { value: 0, unit: "g" },
        protein: { value: 21, unit: "g" }
      },
      ingredients: [
        "Protein Blend (Milk Protein Isolate, Whey Protein Isolate)",
        "Soluble Corn Fiber",
        "Almonds",
        "Water",
        "Unsweetened Chocolate",
        "Erythritol",
        "Natural Flavors",
        "Cocoa Butter",
        "Sea Salt",
        "Sunflower Lecithin",
        "Stevia",
        "Sucralose"
      ],
      allergens_identified: ["Milk", "Tree Nuts (Almonds)"]
    },
    nutriScore: "A",
    novaGroup: 3,
    healthFlags: [
      { type: "success", title: "Exceptional Protein", detail: "21g Whey & Milk Protein isolate" },
      { type: "success", title: "Ultra High Fiber", detail: "12g fiber (43% Daily Value)" },
      { type: "info", title: "Sugar Alcohol", detail: "Contains 4g Erythritol & Sucralose sweetener" }
    ]
  },

  {
    id: "shin-ramyun-cup",
    name: "Nongshim Shin Ramyun Gourmet Spicy Noodle Soup",
    brand: "Nongshim",
    category: "Instant Noodles",
    barcode: "031142371089",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    labelImageUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80",
    ocrRawText: `
NUTRITION FACTS
Serving Size: 1 Container (75g)
Servings Per Container: 1

Amount Per Serving
Calories 340

Total Fat 13g (17% DV)
  Saturated Fat 6g (30% DV)
  Trans Fat 0g
Cholesterol 0mg (0% DV)
Sodium 1440mg (63% DV)
Total Carbohydrate 48g (17% DV)
  Dietary Fiber 2g (7% DV)
  Total Sugars 3g
    Includes 2g Added Sugars
Protein 7g

INGREDIENTS: Enriched Wheat Flour, Palm Oil, Potato Starch, Modified Potato Starch, Salt. Soup Base: Maltodextrin, Salt, Hydrolyzed Soy Protein, Red Chili Pepper, Monosodium Glutamate, Garlic, Sugar, Mushroom Extract, Onion, Yeast Extract, Disodium Guanylate, Disodium Inosinate.

CONTAINS WHEAT, SOY.
    `,
    extractedJson: {
      serving_info: {
        serving_size: "1 Container (75g)",
        servings_per_container: 1
      },
      macros: {
        calories: { value: 340, unit: "kcal" },
        total_fat: { value: 13, unit: "g" },
        saturated_fat: { value: 6, unit: "g" },
        trans_fat: { value: 0, unit: "g" },
        cholesterol: { value: 0, unit: "mg" },
        sodium: { value: 1440, unit: "mg" },
        total_carbohydrates: { value: 48, unit: "g" },
        dietary_fiber: { value: 2, unit: "g" },
        total_sugars: { value: 3, unit: "g" },
        added_sugars: { value: 2, unit: "g" },
        protein: { value: 7, unit: "g" }
      },
      ingredients: [
        "Enriched Wheat Flour",
        "Palm Oil",
        "Potato Starch",
        "Modified Potato Starch",
        "Salt",
        "Hydrolyzed Soy Protein",
        "Red Chili Pepper",
        "Monosodium Glutamate (MSG)",
        "Garlic Powder",
        "Mushroom Extract",
        "Disodium Guanylate",
        "Disodium Inosinate"
      ],
      allergens_identified: ["Wheat", "Soy"]
    },
    nutriScore: "E",
    novaGroup: 4,
    healthFlags: [
      { type: "danger", title: "Extreme Sodium Warning", detail: "1,440mg Sodium (63% of entire daily max intake)" },
      { type: "warning", title: "High Saturated Fat", detail: "6g saturated fat (30% DV) from fried palm oil" },
      { type: "warning", title: "MSG & Flavor Enhancers", detail: "Contains Monosodium Glutamate & Disodium Inosinate" }
    ]
  }
];
