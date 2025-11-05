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
import { PieChart } from 'react-native-chart-kit';
const { width } = Dimensions.get('window');

const DayDetailScreen = ({ route, navigation }) => {
  const { dayData, dietPlan } = route.params;
  const [activeTab, setActiveTab] = useState('breakfast');

  console.log('📥 Received dayData:', dayData);
  console.log('📥 Received dietPlan:', dietPlan);

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

    // Extract macros
    const macrosMatch = mealContent.match(/\(([^)]+)\)/);
    const macrosText = macrosMatch ? macrosMatch[1].trim() : '';
    const caloriesMatch = macrosText.match(/(\d+)\s*kcal/i) || macrosText.match(/(\d+)\s*cal/i);
    const proteinMatch = macrosText.match(/(\d+)g?\s*(?:protein|P)/i);
    const carbsMatch = macrosText.match(/(\d+)g?\s*(?:carbs|carbohydrates|C)/i);
    const fatsMatch = macrosText.match(/(\d+)g?\s*(?:fat|fats|F)/i);
    const fiberMatch = macrosText.match(/(\d+)g?\s*(?:fiber|fibre)/i);

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

  const meals = parseDietPlanForDay(dietPlan.diet_plan || '');
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

  // Pie chart component
  const MealPieChart = ({ ingredients }) => {
    if (!ingredients || ingredients.length === 0) return null;
    const colors = ['#E8D4B8', '#D4A574', '#F5D7A1', '#E0C097'];

    const data = ingredients.map((item, index) => ({
      name: item.name,
      amount: parseInt(item.amount) || 1,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 13,
    }));

    return (
      <View style={styles.pieContainer}>
        <View style={styles.chartWrapper}>
          <PieChart
            data={data}
            width={width - 80}
            height={220}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            chartConfig={{
              color: (opacity = 1) => `rgba(124, 111, 220, ${opacity})`,
            }}
            hasLegend={false}
            center={[(width - 80) / 4, 0]}
          />
        </View>
        <View style={styles.legendContainer}>
          {data.map((item, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={styles.legendLabelRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}</Text>
              </View>
              <Text style={styles.legendAmount}>{ingredients[idx].amount}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Main UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{dayData.dayName}</Text>
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
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pie Chart */}
        <MealPieChart ingredients={currentMeal.ingredients} />

        {/* Medical Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Benefits</Text>
          <Text style={styles.sectionText}>
            {currentMeal.medicalNote || 'This meal provides balanced nutrition for your health goals.'}
          </Text>
        </View>

        {/* Meal Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Calories :</Text>
              <Text style={styles.overviewValue}>{currentMeal.calories}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Protein :</Text>
              <Text style={styles.overviewValue}>{currentMeal.protein}g</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Fiber :</Text>
              <Text style={styles.overviewValue}>{currentMeal.fiber}g</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Fats :</Text>
              <Text style={styles.overviewValue}>{currentMeal.fats}g</Text>
            </View>
          </View>
        </View>

        {/* Estimate Cost */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimate Cost : {currentMeal.cost}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerPlaceholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#7C6FDC',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9E9E9E',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  pieContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  legendAmount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C6FDC',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  overviewGrid: {
    gap: 12,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  overviewValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
});

export default DayDetailScreen;