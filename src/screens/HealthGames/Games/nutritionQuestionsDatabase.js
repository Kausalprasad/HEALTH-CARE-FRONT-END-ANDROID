// Comprehensive Nutrition Questions Database
export const nutritionQuestionsDatabase = {
  child: [
    // Basic Healthy Foods
    { text: "Is 🍎 Apple good for you?", answer: "YES", points: 2, difficulty: "easy", category: "fruits" },
    { text: "Is 🥦 Broccoli healthy?", answer: "YES", points: 2, difficulty: "easy", category: "vegetables" },
    { text: "Is 🥕 Carrot good for your eyes?", answer: "YES", points: 2, difficulty: "easy", category: "vegetables" },
    { text: "Is 🍌 Banana a healthy snack?", answer: "YES", points: 2, difficulty: "easy", category: "fruits" },
    { text: "Is 🥛 Milk good for strong bones?", answer: "YES", points: 2, difficulty: "easy", category: "dairy" },

    // Unhealthy Foods
    { text: "Is 🍔 Burger healthy every day?", answer: "NO", points: 2, difficulty: "easy", category: "junk_food" },
    { text: "Is 🍭 Candy good for teeth?", answer: "NO", points: 2, difficulty: "easy", category: "sweets" },
    { text: "Is 🥤 Soda a healthy drink?", answer: "NO", points: 2, difficulty: "easy", category: "beverages" },
    { text: "Is 🍟 French fries healthy?", answer: "NO", points: 2, difficulty: "easy", category: "junk_food" },
    { text: "Is 🍰 Cake good for breakfast?", answer: "NO", points: 2, difficulty: "easy", category: "sweets" },

    // Protein Sources
    { text: "Is 🐟 Fish good for your brain?", answer: "YES", points: 3, difficulty: "medium", category: "protein" },
    { text: "Is 🥚 Egg a good protein source?", answer: "YES", points: 3, difficulty: "medium", category: "protein" },
    { text: "Is 🐔 Chicken healthy?", answer: "YES", points: 3, difficulty: "medium", category: "protein" },
    { text: "Are 🥜 Nuts good for you?", answer: "YES", points: 3, difficulty: "medium", category: "protein" },

    // Grains and Cereals
    {
      text: "Is 🍞 Whole wheat bread better than white bread?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "grains",
    },
    { text: "Is 🥣 Oatmeal a healthy breakfast?", answer: "YES", points: 3, difficulty: "medium", category: "grains" },
    {
      text: "Is 🍚 Brown rice healthier than white rice?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "grains",
    },

    // Beverages
    { text: "Is 💧 Water the best drink?", answer: "YES", points: 2, difficulty: "easy", category: "beverages" },
    {
      text: "Is 🧃 100% fruit juice better than soda?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "beverages",
    },
    { text: "Should you drink water every day?", answer: "YES", points: 2, difficulty: "easy", category: "beverages" },

    // Fun Food Facts
    {
      text: "Do 🥕 carrots help you see in the dark?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "facts",
    },
    { text: "Is 🍫 chocolate made from plants?", answer: "YES", points: 4, difficulty: "hard", category: "facts" },
    { text: "Do 🍌 bananas give you energy?", answer: "YES", points: 3, difficulty: "medium", category: "facts" },
    { text: "Is 🍯 honey made by bees?", answer: "YES", points: 3, difficulty: "medium", category: "facts" },

    // More Fruits
    { text: "Is 🍊 Orange full of Vitamin C?", answer: "YES", points: 3, difficulty: "medium", category: "fruits" },
    { text: "Is 🍇 Grapes a healthy snack?", answer: "YES", points: 2, difficulty: "easy", category: "fruits" },
    { text: "Is 🍓 Strawberry good for you?", answer: "YES", points: 2, difficulty: "easy", category: "fruits" },
    { text: "Is 🥝 Kiwi rich in vitamins?", answer: "YES", points: 3, difficulty: "medium", category: "fruits" },
    { text: "Is 🍑 Cherry healthy?", answer: "YES", points: 2, difficulty: "easy", category: "fruits" },

    // More Vegetables
    { text: "Is 🍅 Tomato good for you?", answer: "YES", points: 2, difficulty: "easy", category: "vegetables" },
    { text: "Is 🥬 Lettuce healthy?", answer: "YES", points: 2, difficulty: "easy", category: "vegetables" },
    { text: "Is 🥒 Cucumber mostly water?", answer: "YES", points: 3, difficulty: "medium", category: "vegetables" },
    { text: "Is 🌽 Corn a vegetable?", answer: "YES", points: 3, difficulty: "medium", category: "vegetables" },
    {
      text: "Is 🥔 Potato healthy when baked?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "vegetables",
    },

    // Meal Timing
    { text: "Is breakfast important?", answer: "YES", points: 3, difficulty: "medium", category: "habits" },
    { text: "Should you eat vegetables every day?", answer: "YES", points: 2, difficulty: "easy", category: "habits" },
    { text: "Is it good to eat fruits as snacks?", answer: "YES", points: 2, difficulty: "easy", category: "habits" },
    { text: "Should you eat candy before dinner?", answer: "NO", points: 2, difficulty: "easy", category: "habits" },

    // More Junk Food
    { text: "Is 🍕 pizza healthy every day?", answer: "NO", points: 2, difficulty: "easy", category: "junk_food" },
    { text: "Is 🌭 hot dog a healthy lunch?", answer: "NO", points: 2, difficulty: "easy", category: "junk_food" },
    { text: "Are 🍪 cookies good for you?", answer: "NO", points: 2, difficulty: "easy", category: "sweets" },
    { text: "Is 🧁 cupcake a healthy breakfast?", answer: "NO", points: 2, difficulty: "easy", category: "sweets" },

    // Healthy Habits
    {
      text: "Should you wash fruits before eating?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "habits",
    },
    { text: "Is it good to try new vegetables?", answer: "YES", points: 3, difficulty: "medium", category: "habits" },
    { text: "Should you eat slowly?", answer: "YES", points: 3, difficulty: "medium", category: "habits" },
    { text: "Is sharing food with friends fun?", answer: "YES", points: 2, difficulty: "easy", category: "habits" },
  ],

  teen: [
    // Advanced Nutrition
    { text: "Does 🥑 avocado contain healthy fats?", answer: "YES", points: 3, difficulty: "medium", category: "fats" },
    {
      text: "Is protein important for muscle growth?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "protein",
    },
    {
      text: "Do energy drinks help with studying?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "beverages",
    },
    {
      text: "Is skipping breakfast bad for concentration?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "habits",
    },
    { text: "Are 🥗 salads always healthy?", answer: "NO", points: 4, difficulty: "hard", category: "vegetables" },

    // Sports Nutrition
    { text: "Should athletes eat more protein?", answer: "YES", points: 4, difficulty: "hard", category: "sports" },
    {
      text: "Is 💧 water better than sports drinks for most activities?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "sports",
    },
    { text: "Should you eat before exercising?", answer: "YES", points: 3, difficulty: "medium", category: "sports" },
    { text: "Is chocolate milk good after workout?", answer: "YES", points: 4, difficulty: "hard", category: "sports" },

    // Weight Management
    { text: "Is crash dieting healthy for teens?", answer: "NO", points: 4, difficulty: "hard", category: "weight" },
    {
      text: "Should teens count calories obsessively?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "weight",
    },
    {
      text: "Is eating regularly better than skipping meals?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "weight",
    },
    {
      text: "Can you be healthy at different body sizes?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "weight",
    },

    // Mental Health & Food
    { text: "Can food affect your mood?", answer: "YES", points: 4, difficulty: "hard", category: "mental_health" },
    { text: "Is emotional eating always bad?", answer: "NO", points: 4, difficulty: "hard", category: "mental_health" },
    {
      text: "Should you eat when stressed?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "mental_health",
    },

    // Social Eating
    {
      text: "Is it okay to eat differently from friends sometimes?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "social",
    },
    {
      text: "Should peer pressure affect your food choices?",
      answer: "NO",
      points: 3,
      difficulty: "medium",
      category: "social",
    },
    {
      text: "Is cooking with friends a good activity?",
      answer: "YES",
      points: 2,
      difficulty: "easy",
      category: "social",
    },

    // Fast Food Knowledge
    {
      text: "Can fast food be part of a balanced diet occasionally?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "fast_food",
    },
    {
      text: "Are all fast food options equally unhealthy?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "fast_food",
    },
    {
      text: "Should you check nutrition facts at restaurants?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "fast_food",
    },

    // Supplements
    {
      text: "Do most teens need vitamin supplements?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "supplements",
    },
    {
      text: "Is it better to get vitamins from food?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "supplements",
    },
    {
      text: "Should you take supplements without doctor advice?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "supplements",
    },

    // Body Image
    { text: "Is there one 'perfect' body type?", answer: "NO", points: 4, difficulty: "hard", category: "body_image" },
    {
      text: "Should you eat based on how you look?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "body_image",
    },
    {
      text: "Is health more important than appearance?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "body_image",
    },

    // Advanced Foods
    { text: "Is 🍣 sushi healthy?", answer: "YES", points: 3, difficulty: "medium", category: "international" },
    { text: "Are 🌮 tacos always unhealthy?", answer: "NO", points: 4, difficulty: "hard", category: "international" },
    { text: "Is 🍜 ramen nutritious?", answer: "NO", points: 3, difficulty: "medium", category: "international" },
    {
      text: "Can 🍝 pasta be part of a healthy diet?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "international",
    },

    // Cooking Skills
    { text: "Is learning to cook important?", answer: "YES", points: 3, difficulty: "medium", category: "cooking" },
    {
      text: "Is meal prep helpful for healthy eating?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "cooking",
    },
    {
      text: "Should teens help with family cooking?",
      answer: "YES",
      points: 2,
      difficulty: "easy",
      category: "cooking",
    },

    // More Complex Nutrition
    {
      text: "Do carbs make you gain weight automatically?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "macros",
    },
    { text: "Is fat always bad for you?", answer: "NO", points: 4, difficulty: "hard", category: "macros" },
    { text: "Do you need all three macronutrients?", answer: "YES", points: 4, difficulty: "hard", category: "macros" },
    { text: "Is fiber important for digestion?", answer: "YES", points: 3, difficulty: "medium", category: "macros" },

    // Hydration
    {
      text: "Should you drink water during meals?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "hydration",
    },
    { text: "Can you drink too much water?", answer: "YES", points: 4, difficulty: "hard", category: "hydration" },
    {
      text: "Do caffeinated drinks dehydrate you?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "hydration",
    },

    // Sleep and Food
    { text: "Does eating late affect sleep?", answer: "YES", points: 4, difficulty: "hard", category: "sleep" },
    {
      text: "Should you eat if you're hungry before bed?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "sleep",
    },
    { text: "Can certain foods help you sleep?", answer: "YES", points: 4, difficulty: "hard", category: "sleep" },
  ],

  adult: [
    // Advanced Nutrition Science
    {
      text: "Do antioxidants prevent all diseases?",
      answer: "NO",
      points: 5,
      difficulty: "expert",
      category: "science",
    },
    {
      text: "Is the glycemic index important for everyone?",
      answer: "NO",
      points: 5,
      difficulty: "expert",
      category: "science",
    },
    {
      text: "Can you get complete proteins from plants?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "science",
    },
    { text: "Is cholesterol in food always bad?", answer: "NO", points: 5, difficulty: "expert", category: "science" },

    // Chronic Disease Prevention
    { text: "Can diet prevent type 2 diabetes?", answer: "YES", points: 4, difficulty: "hard", category: "disease" },
    {
      text: "Is the Mediterranean diet heart-healthy?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "disease",
    },
    {
      text: "Can certain foods reduce cancer risk?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "disease",
    },
    {
      text: "Is high sodium linked to hypertension?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "disease",
    },

    // Metabolism and Aging
    { text: "Does metabolism slow with age?", answer: "YES", points: 4, difficulty: "hard", category: "aging" },
    { text: "Do protein needs increase with age?", answer: "YES", points: 4, difficulty: "hard", category: "aging" },
    {
      text: "Is intermittent fasting safe for everyone?",
      answer: "NO",
      points: 5,
      difficulty: "expert",
      category: "aging",
    },
    { text: "Can diet affect cognitive decline?", answer: "YES", points: 5, difficulty: "expert", category: "aging" },

    // Pregnancy and Nutrition
    {
      text: "Should pregnant women avoid all fish?",
      answer: "NO",
      points: 5,
      difficulty: "expert",
      category: "pregnancy",
    },
    {
      text: "Is folic acid important before pregnancy?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "pregnancy",
    },
    {
      text: "Should pregnant women 'eat for two'?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "pregnancy",
    },

    // Workplace Nutrition
    {
      text: "Can meal timing affect work performance?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "work",
    },
    { text: "Is coffee beneficial for most adults?", answer: "YES", points: 4, difficulty: "hard", category: "work" },
    { text: "Should you eat at your desk?", answer: "NO", points: 3, difficulty: "medium", category: "work" },

    // Supplement Science
    {
      text: "Are multivitamins necessary for healthy adults?",
      answer: "NO",
      points: 5,
      difficulty: "expert",
      category: "supplements",
    },
    {
      text: "Can vitamin D deficiency affect mood?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "supplements",
    },
    {
      text: "Is more always better with vitamins?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "supplements",
    },
    {
      text: "Should you take probiotics daily?",
      answer: "NO",
      points: 5,
      difficulty: "expert",
      category: "supplements",
    },

    // Food Safety
    { text: "Is raw honey safe for adults?", answer: "YES", points: 4, difficulty: "hard", category: "safety" },
    {
      text: "Can you eat eggs past their expiration date?",
      answer: "NO",
      points: 3,
      difficulty: "medium",
      category: "safety",
    },
    { text: "Is it safe to reheat rice?", answer: "YES", points: 4, difficulty: "hard", category: "safety" },
    {
      text: "Should you wash chicken before cooking?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "safety",
    },

    // Environmental Impact
    {
      text: "Does food choice affect the environment?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "environment",
    },
    {
      text: "Is local food always more sustainable?",
      answer: "NO",
      points: 5,
      difficulty: "expert",
      category: "environment",
    },
    {
      text: "Can reducing meat help the planet?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "environment",
    },

    // Budget and Nutrition
    {
      text: "Can you eat healthy on a tight budget?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "budget",
    },
    { text: "Are frozen vegetables less nutritious?", answer: "NO", points: 4, difficulty: "hard", category: "budget" },
    {
      text: "Is organic always worth the extra cost?",
      answer: "NO",
      points: 5,
      difficulty: "expert",
      category: "budget",
    },

    // Digestive Health
    {
      text: "Is fiber important for gut health?",
      answer: "YES",
      points: 3,
      difficulty: "medium",
      category: "digestion",
    },
    { text: "Can stress affect digestion?", answer: "YES", points: 4, difficulty: "hard", category: "digestion" },
    { text: "Are all bacteria in food bad?", answer: "NO", points: 4, difficulty: "hard", category: "digestion" },
    {
      text: "Can certain foods cause inflammation?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "digestion",
    },

    // Advanced Cooking
    {
      text: "Does cooking method affect nutrition?",
      answer: "YES",
      points: 4,
      difficulty: "hard",
      category: "cooking",
    },
    {
      text: "Is grilling always the healthiest option?",
      answer: "NO",
      points: 4,
      difficulty: "hard",
      category: "cooking",
    },
    { text: "Can you cook vegetables too much?", answer: "YES", points: 4, difficulty: "hard", category: "cooking" },

    // Hormones and Food
    { text: "Can diet affect hormone levels?", answer: "YES", points: 5, difficulty: "expert", category: "hormones" },
    {
      text: "Do phytoestrogens in soy affect hormones?",
      answer: "YES",
      points: 5,
      difficulty: "expert",
      category: "hormones",
    },
    {
      text: "Can insulin resistance be reversed with diet?",
      answer: "YES",
      points: 5,
      difficulty: "expert",
      category: "hormones",
    },

    // Mental Health
    {
      text: "Is there a connection between gut and brain health?",
      answer: "YES",
      points: 5,
      difficulty: "expert",
      category: "mental",
    },
    { text: "Can certain foods worsen anxiety?", answer: "YES", points: 4, difficulty: "hard", category: "mental" },
    { text: "Is the 'food-mood' connection real?", answer: "YES", points: 4, difficulty: "hard", category: "mental" },

    // Longevity
    {
      text: "Can caloric restriction extend lifespan?",
      answer: "YES",
      points: 5,
      difficulty: "expert",
      category: "longevity",
    },
    { text: "Are blue zones real?", answer: "YES", points: 5, difficulty: "expert", category: "longevity" },
    {
      text: "Is there a perfect longevity diet?",
      answer: "NO",
      points: 5,
      difficulty: "expert",
      category: "longevity",
    },
  ],
}

// Helper functions
export const getRandomQuestion = (ageGroup, excludeIds = []) => {
  const questions = nutritionQuestionsDatabase[ageGroup].filter((q) => !excludeIds.includes(q.text))
  return questions[Math.floor(Math.random() * questions.length)]
}

export const getQuestionsByDifficulty = (ageGroup, difficulty) => {
  return nutritionQuestionsDatabase[ageGroup].filter((q) => q.difficulty === difficulty)
}

export const getQuestionsByCategory = (ageGroup, category) => {
  return nutritionQuestionsDatabase[ageGroup].filter((q) => q.category === category)
}

export const getTotalQuestions = (ageGroup) => {
  return nutritionQuestionsDatabase[ageGroup].length
}

// Achievement system
export const achievements = [
  { id: 1, name: "First Steps", description: "Answer your first question correctly", points: 5, icon: "🌱" },
  { id: 2, name: "Getting Started", description: "Reach 10 points", points: 10, icon: "🚀" },
  { id: 3, name: "Nutrition Novice", description: "Reach 25 points", points: 25, icon: "📚" },
  { id: 4, name: "Health Hero", description: "Reach 50 points", points: 50, icon: "🦸" },
  { id: 5, name: "Wellness Warrior", description: "Reach 75 points", points: 75, icon: "⚔️" },
  { id: 6, name: "Nutrition Master", description: "Reach 100 points", points: 100, icon: "👑" },
  { id: 7, name: "Perfect Streak", description: "Get 5 questions right in a row", streak: 5, icon: "🔥" },
  { id: 8, name: "Knowledge Seeker", description: "Answer 50 questions", total: 50, icon: "🔍" },
  { id: 9, name: "Dedication", description: "Play for 3 days in a row", days: 3, icon: "📅" },
  {
    id: 10,
    name: "Expert Level",
    description: "Get 10 hard questions right",
    difficulty: "hard",
    count: 10,
    icon: "🎓",
  },
]
