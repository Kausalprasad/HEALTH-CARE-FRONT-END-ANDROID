// screens/DayDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const DayDetailScreen = ({ route, navigation }) => {
  const { dayData, dietPlan } = route.params;
  const [activeTab, setActiveTab] = useState('breakfast');

  // Extract meal details from backend plan text
  const extractMealDetails = (content, mealType) => {
    const mealStart = content.indexOf(`**${mealType}**:`);
    if (mealStart === -1) return null;

    const possibleEnds = [
      content.indexOf('**Breakfast**:', mealStart + 5),
      content.indexOf('**Lunch**:', mealStart + 5),
      content.indexOf('**Dinner**:', mealStart + 5),
      content.indexOf('**Snacks**:', mealStart + 5),
      content.indexOf('**Daily Total**:', mealStart + 5),
    ].filter(pos => pos > mealStart);

    const mealEnd = possibleEnds.length > 0 ? Math.min(...possibleEnds) : content.length;
    const mealContent = content.substring(mealStart, mealEnd);

    // Extract description
    const descStart = mealContent.indexOf('**:') + 3;
    const descEnd = mealContent.indexOf('(', descStart);
    const description = descEnd > descStart 
      ? mealContent.substring(descStart, descEnd).trim()
      : mealContent.substring(descStart, Math.min(descStart + 100, mealContent.length)).split('\n')[0].trim();

    // Extract macros - Format: (300 cal, Carbs: 45g, Protein: 5g, Fat: 10g)
    const macrosMatch = mealContent.match(/\(([^)]+)\)/);
    const macrosText = macrosMatch ? macrosMatch[1].trim() : '';
    
    // Match patterns: "300 cal", "Carbs: 45g", "Protein: 5g", "Fat: 10g"
    const caloriesMatch = macrosText.match(/(\d+)\s*cal/i);
    const proteinMatch = macrosText.match(/Protein:\s*(\d+)g?/i);
    const carbsMatch = macrosText.match(/Carbs:\s*(\d+)g?/i);
    const fatsMatch = macrosText.match(/Fat:\s*(\d+)g?/i);
    const fiberMatch = macrosText.match(/Fiber:\s*(\d+)g?/i);

    const calories = caloriesMatch ? caloriesMatch[1] : '0';
    const protein = proteinMatch ? proteinMatch[1] : '0';
    const carbs = carbsMatch ? carbsMatch[1] : '0';
    const fats = fatsMatch ? fatsMatch[1] : '0';
    const fiber = fiberMatch ? fiberMatch[1] : '0';

    // Extract medical benefits
    const medicalIndex = mealContent.indexOf('*Medical Note*:');
    let medicalNote = '';
    if (medicalIndex !== -1) {
      const noteStart = medicalIndex + 15;
      const noteEnd = mealContent.indexOf('\n*', noteStart);
      medicalNote = mealContent.substring(noteStart, noteEnd !== -1 ? noteEnd : noteStart + 200).trim();
    }

    // Extract cost
    const costIndex = mealContent.indexOf('*Cost Estimate*:');
    let cost = '₹80';
    if (costIndex !== -1) {
      const costStart = costIndex + 16;
      const costEnd = mealContent.indexOf('\n', costStart);
      cost = mealContent.substring(costStart, costEnd !== -1 ? costEnd : costStart + 50).trim();
    }

    // Extract ingredients from description
    const ingredients = [];
    const descLower = description.toLowerCase();
    
    // Common ingredients mapping
    const ingredientMap = {
      'oatmeal': { name: 'Oatmeal', amount: '50g' },
      'oats': { name: 'Oats', amount: '50g' },
      'almonds': { name: 'Almonds', amount: '10g' },
      'banana': { name: 'Banana', amount: '1 medium' },
      'milk': { name: 'Low-fat Milk', amount: '200ml' },
      'yogurt': { name: 'Yogurt', amount: '100g' },
      'paneer': { name: 'Paneer', amount: '100g' },
      'rice': { name: 'Brown Rice', amount: '150g' },
      'roti': { name: 'Whole Wheat Roti', amount: '2 pcs' },
      'chapati': { name: 'Chapati', amount: '2 pcs' },
      'dal': { name: 'Dal', amount: '150g' },
      'chicken': { name: 'Chicken', amount: '150g' },
      'egg': { name: 'Eggs', amount: '2 pcs' },
      'vegetables': { name: 'Mixed Vegetables', amount: '100g' },
      'spinach': { name: 'Spinach', amount: '100g' },
      'tomato': { name: 'Tomatoes', amount: '50g' },
      'onion': { name: 'Onions', amount: '30g' },
    };

    for (const [key, value] of Object.entries(ingredientMap)) {
      if (descLower.includes(key)) {
        ingredients.push(value);
      }
    }

    // If no ingredients found, add generic ones
    if (ingredients.length === 0) {
      ingredients.push({ name: 'Main ingredient', amount: '200g' });
      ingredients.push({ name: 'Spices & Herbs', amount: 'As needed' });
    }

    return {
      description,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fats: parseInt(fats) || 0,
      fiber: parseInt(fiber) || 0,
      medicalNote: medicalNote || 'This meal provides balanced nutrition for your health goals.',
      cost,
      ingredients,
    };
  };

  // Parse the day
  const parseDietPlanForDay = (planText) => {
    if (!planText) return null;
    const dayIndex = planText.indexOf(`### Day ${dayData.day}`);
    if (dayIndex === -1) return null;

    const nextDayIndex = planText.indexOf(`### Day ${parseInt(dayData.day) + 1}`, dayIndex + 1);
    const dayContent = nextDayIndex !== -1 ? planText.substring(dayIndex, nextDayIndex) : planText.substring(dayIndex);

    return {
      breakfast: extractMealDetails(dayContent, 'Breakfast'),
      lunch: extractMealDetails(dayContent, 'Lunch'),
      dinner: extractMealDetails(dayContent, 'Dinner'),
    };
  };

  // Handle API response structure - diet_plan can be at dietPlan.diet_plan or dietPlan.diet.diet_plan
  const dietPlanText = dietPlan.diet_plan || dietPlan.diet?.diet_plan || '';
  const meals = parseDietPlanForDay(dietPlanText);
  const currentMeal = meals?.[activeTab] || {
    description: 'Meal details not available',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    medicalNote: 'No medical benefits available',
    cost: '₹80',
    ingredients: [],
  };


  // Pie Chart Component - Based on actual meal macros using SVG (Expo compatible)
  const PieChartCircle = ({ meal }) => {
    const size = 260;
    const radius = 130;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Get macros from meal data (convert strings to numbers)
    const protein = parseInt(meal?.protein) || 0;
    const carbs = parseInt(meal?.carbs) || 0;
    const fats = parseInt(meal?.fats) || 0;
    
    // Calculate total and percentages
    const total = protein + carbs + fats;
    
    // Default values: 75% blue (carbs), 25% purple (protein + fats)
    let carbsPercent = 0.75;
    let othersPercent = 0.25;
    
    if (total > 0) {
      carbsPercent = carbs / total;
      othersPercent = (protein + fats) / total;
    }
    
    // Convert percentages to degrees
    const carbsAngle = carbsPercent * 360;
    const othersAngle = othersPercent * 360;
    
    // Helper function to create arc path
    const createArc = (startAngle, endAngle) => {
      const start = (startAngle * Math.PI) / 180;
      const end = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(start);
      const y1 = centerY + radius * Math.sin(start);
      const x2 = centerX + radius * Math.cos(end);
      const y2 = centerY + radius * Math.sin(end);
      
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };
    
    // Calculate angles (starting from -90 degrees to match VictoryPie)
    const carbsStartAngle = -90;
    const carbsEndAngle = carbsStartAngle + carbsAngle;
    const othersStartAngle = carbsEndAngle;
    const othersEndAngle = othersStartAngle + othersAngle;
    
    return (
      <View style={styles.pieChartContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Carbs segment (Blue) */}
          <Path
            d={createArc(carbsStartAngle, carbsEndAngle)}
            fill="#0A33FF"
            stroke="#FFFFFF"
            strokeWidth={3}
          />
          {/* Others segment (Purple) - Protein + Fats */}
          <Path
            d={createArc(othersStartAngle, othersEndAngle)}
            fill="#B05CE6"
            stroke="#FFFFFF"
            strokeWidth={3}
          />
        </Svg>
      </View>
    );
  };

  // Extract food items from meal description - use currentMeal which updates with activeTab
  const getFoodItems = (meal) => {
    // First, try to use ingredients from the parsed meal
    if (meal.ingredients && meal.ingredients.length > 0) {
      return meal.ingredients.map(ing => ({
        name: typeof ing === 'string' ? ing : (ing.name || ing.item || 'Food'),
        amount: typeof ing === 'string' ? '150 gm' : (ing.amount || ing.quantity || '150 gm')
      }));
    }
    
    const items = [];
    const description = meal.description || '';
    
    // Enhanced extraction from description - more specific patterns
    const foodPatterns = [
      { patterns: [/egg/gi, /eggs/gi], name: 'Eggs', amount: '2 Whole' },
      { patterns: [/salad/gi], name: 'Salad', amount: '150 gm' },
      { patterns: [/rice/gi, /biryani/gi], name: 'Rice', amount: '150 gm' },
      { patterns: [/chicken/gi], name: 'Chicken', amount: '150 gm' },
      { patterns: [/dal/gi, /daal/gi, /lentil/gi], name: 'Dal', amount: '150 gm' },
      { patterns: [/roti/gi, /chapati/gi], name: 'Roti', amount: '2 pcs' },
      { patterns: [/paneer/gi], name: 'Paneer', amount: '100 gm' },
      { patterns: [/vegetable/gi, /veg/gi], name: 'Vegetables', amount: '100 gm' },
      { patterns: [/paratha/gi], name: 'Paratha', amount: '2 pcs' },
      { patterns: [/biryani/gi], name: 'Biryani', amount: '200 gm' },
      { patterns: [/curry/gi], name: 'Curry', amount: '150 gm' },
      { patterns: [/masala/gi, /chana masala/gi, /rajma masala/gi], name: 'Masala', amount: '150 gm' },
      { patterns: [/dalia/gi], name: 'Dalia', amount: '100 gm' },
      { patterns: [/milk/gi], name: 'Milk', amount: '200 ml' },
      { patterns: [/nuts/gi], name: 'Nuts', amount: '30 gm' },
    ];
    
    const foundItems = new Set();
    
    foodPatterns.forEach(({ patterns, name, amount }) => {
      if (patterns.some(pattern => pattern.test(description)) && !foundItems.has(name)) {
        items.push({ name, amount });
        foundItems.add(name);
      }
    });
    
    // If no items found, try simpler extraction
    if (items.length === 0) {
      const descLower = description.toLowerCase();
      const simpleMap = [
        { keywords: ['egg'], name: 'Eggs', amount: '2 Whole' },
        { keywords: ['salad'], name: 'Salad', amount: '150 gm' },
        { keywords: ['rice', 'biryani'], name: 'Rice', amount: '150 gm' },
        { keywords: ['chicken'], name: 'Chicken', amount: '150 gm' },
        { keywords: ['dal', 'daal'], name: 'Dal', amount: '150 gm' },
        { keywords: ['roti', 'chapati'], name: 'Roti', amount: '2 pcs' },
        { keywords: ['paneer'], name: 'Paneer', amount: '100 gm' },
        { keywords: ['paratha'], name: 'Paratha', amount: '2 pcs' },
        { keywords: ['masala'], name: 'Masala', amount: '150 gm' },
        { keywords: ['dalia'], name: 'Dalia', amount: '100 gm' },
      ];
      
      simpleMap.forEach(({ keywords, name, amount }) => {
        if (keywords.some(kw => descLower.includes(kw)) && !foundItems.has(name)) {
          items.push({ name, amount });
          foundItems.add(name);
        }
      });
    }
    
    // If still no items, use description to create at least one item
    if (items.length === 0 && description) {
      const words = description.split(/[,\s]+/).filter(w => w.length > 2);
      if (words.length > 0) {
        items.push({ name: words[0].charAt(0).toUpperCase() + words[0].slice(1), amount: '150 gm' });
      }
    }
    
    return items;
  };

  // Main UI
  return (
    <LinearGradient
      colors={['rgba(254, 215, 112, 0.9)', 'rgba(235, 177, 180, 0.8)', 'rgba(145, 230, 251, 0.7)', 'rgba(217, 213, 250, 0.6)']}
      locations={[0, 0.3, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Diet Plan - {dayData.dayName.charAt(0) + dayData.dayName.slice(1).toLowerCase()}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['breakfast', 'lunch', 'dinner'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              {activeTab === tab && (
                <Ionicons 
                  name={tab === 'breakfast' ? 'star' : tab === 'lunch' ? 'sunny' : 'moon'} 
                  size={16} 
                  color="#FFF" 
                  style={styles.tabIcon}
                />
              )}
              {activeTab !== tab && (
                <Ionicons 
                  name={tab === 'breakfast' ? 'star-outline' : tab === 'lunch' ? 'sunny-outline' : 'moon-outline'} 
                  size={16} 
                  color="#666" 
                  style={styles.tabIcon}
                />
              )}
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Pie Chart */}
          <View style={styles.pieChartCard}>
            <PieChartCircle meal={currentMeal} />
          </View>

          {/* Food Items Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="restaurant" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>Food Items</Text>
            </View>
            <View style={styles.foodItemsContainer}>
              {getFoodItems(currentMeal).map((item, index) => (
                <View key={index} style={styles.foodItemRow}>
                  <Text style={styles.foodItemName}>{item.name}</Text>
                  <Text style={styles.foodItemAmount}>{item.amount}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Medical Benefits Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart" size={20} color="#81D4FA" />
              <Text style={styles.cardTitle}>Medical Benefits</Text>
            </View>
            <Text style={styles.cardText}>
              Please consult a doctor if your symptoms persist or worsen, especially considering your medical history of {dietPlan.user_profile?.medical_conditions?.[0] || dietPlan.diet?.user_profile?.medical_conditions?.[0] || 'Hh'}.
            </Text>
          </View>

          {/* Nutritional Values Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bar-chart" size={20} color="#EF5350" />
              <Text style={styles.cardTitle}>Nutritional Values</Text>
            </View>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <Text style={styles.nutritionValue}>{currentMeal.calories || '200'}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Fiber</Text>
                <Text style={styles.nutritionValue}>{currentMeal.fiber || '5'} gm</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>{currentMeal.protein || '10'} gm</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <Text style={styles.nutritionValue}>{currentMeal.fats || '50'} gm</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <Text style={styles.nutritionValue}>{currentMeal.carbs || '250'}</Text>
              </View>
            </View>
          </View>

          {/* Estimated Cost Card */}
          <View style={styles.card}>
            <Text style={styles.costLabel}>Estimated Cost</Text>
            <Text style={styles.costValue}>{currentMeal.cost || '₹190'} /day</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.buttonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#000',
    fontFamily: 'Inter',
  },
  headerPlaceholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeTab: {
    backgroundColor: '#9C27B0',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Inter',
  },
  activeTabText: {
    color: '#FFF',
    fontFamily: 'Inter',
  },
  scrollView: {
    flex: 1,
  },
  pieChartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartContainer: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  foodItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  foodItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '45%',
  },
  foodItemName: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Inter',
  },
  foodItemAmount: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter',
  },
  nutritionGrid: {
    gap: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter',
  },
  nutritionValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  costValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Inter',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 40,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2196F3',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  shareButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default DayDetailScreen;