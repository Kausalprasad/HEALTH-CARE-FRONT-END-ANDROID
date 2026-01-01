// screens/DietResultScreen.js
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
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const DietResult = ({ route, navigation }) => {
  const { dietPlan } = route.params;
  
  const parseDietPlan = (planText) => {
    if (!planText) return [];
    
    const days = [];
    const dayRegex = /### Day (\d+) - ([^\n]+)/g;
    const dayMatches = [];
    let match;
    
    while ((match = dayRegex.exec(planText)) !== null) {
      dayMatches.push({
        index: match.index,
        day: match[1],
        theme: match[2].trim()
      });
    }

    for (let i = 0; i < dayMatches.length; i++) {
      const start = dayMatches[i].index;
      const end = dayMatches[i + 1]?.index || planText.length;
      const dayContent = planText.substring(start, end);
      
      const breakfast = extractMeal(dayContent, 'Breakfast');
      const lunch = extractMeal(dayContent, 'Lunch');
      const dinner = extractMeal(dayContent, 'Dinner');
      
      const dailyTotal = extractDailyTotal(dayContent);

      days.push({
        day: dayMatches[i].day,
        dayName: getDayName(parseInt(dayMatches[i].day)),
        theme: dayMatches[i].theme,
        breakfast,
        lunch,
        dinner,
        totalCalories: dailyTotal?.calories || '1500'
      });
    }

    return days;
  };

  const extractMeal = (content, mealType) => {
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

    const descStart = mealContent.indexOf('**:') + 3;
    const descEnd = mealContent.indexOf('(', descStart);
    const description = descEnd > descStart 
      ? mealContent.substring(descStart, descEnd).trim()
      : mealContent.substring(descStart, Math.min(descStart + 100, mealContent.length)).split('\n')[0].trim();

    return description || 'Not available';
  };

  const extractDailyTotal = (content) => {
    const totalStart = content.indexOf('**Daily Total**:');
    if (totalStart === -1) return null;

    const section = content.substring(totalStart, totalStart + 600);
    // Match pattern like "1350 calories" or "1350 calories |"
    const caloriesMatch = section.match(/\*\*Daily Total\*\*:\s*(\d+)\s*calories/i) || 
                         section.match(/\*\*Daily Total\*\*:\s*(\d+)/);
    const calories = caloriesMatch ? caloriesMatch[1] : '1500';

    return { calories };
  };

  const getDayName = (dayNum) => {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return days[(dayNum - 1) % 7];
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return '#2196F3';
    if (bmi < 25) return '#4CAF50';
    if (bmi < 30) return '#FF9800';
    return '#F44336';
  };


const BMICircle = ({ bmi, category }) => {
  const size = 220;
  const radius = 85;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress based on BMI (assuming normal range is 18.5-25)
  let progress = 0;
  if (bmi < 18.5) {
    progress = (bmi / 18.5) * 0.25; // Underweight: 0-25%
  } else if (bmi <= 25) {
    progress = 0.25 + ((bmi - 18.5) / (25 - 18.5)) * 0.5; // Normal: 25-75%
  } else if (bmi <= 30) {
    progress = 0.75 + ((bmi - 25) / (30 - 25)) * 0.25; // Overweight: 75-100%
  } else {
    progress = 1.0; // Obese: 100%
  }
  
  const strokeDashoffset = circumference - (progress * circumference);
  const bmiColor = category === 'Normal' ? '#4CAF50' : category === 'Overweight' ? '#FF9800' : '#F44336';

  return (
    <View style={styles.bmiCircleContainer}>
      <Svg width={size} height={size} style={styles.bmiCircleSvg}>
        {/* Background Circle - Light grey inner */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2}
          fill="#F5F5F5"
        />
        {/* Outer white ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bmiColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.bmiCircleInner}>
        <Text style={styles.bmiCircleNumber}>{bmi}</Text>
        <Text style={styles.bmiCircleLabel} numberOfLines={1} adjustsFontSizeToFit>
          BMI ({category})
        </Text>
      </View>
    </View>
  );
};

  const MultiColorCalorieRing = ({ calories }) => {
    const size = 80;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // Four segments for breakfast, lunch, dinner, snacks
    const segmentLength = circumference * 0.2;
    const gapLength = circumference * 0.05;
    
    return (
      <View style={styles.calorieRingContainer}>
        <Svg height={size} width={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F0F0F0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Blue segment (breakfast) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#42A5F5"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          
          {/* Red segment (lunch) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EC407A"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={-segmentLength - gapLength}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          
          {/* Green segment (dinner) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#4CAF50"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={-(segmentLength * 2) - (gapLength * 2)}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          
          {/* Purple segment (snacks) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#9C27B0"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={-(segmentLength * 3) - (gapLength * 3)}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
      </View>
    );
  };

  // Handle API response structure
  const userProfile = dietPlan.user_profile || {};
  const dietData = dietPlan || {};
  
  // Extract BMI - API returns as number
  const bmi = parseFloat(userProfile.bmi) || parseFloat(dietData.bmi) || 21.3;
  
  // Use health_category from API or calculate from BMI
  const bmiCategory = userProfile.health_category 
    ? userProfile.health_category.replace('Weight', '').trim() 
    : getBMICategory(bmi);
  
  // Extract calories - BMR is at diet level, target_calories at user_profile level
  const requiredCalories = Math.round(dietData.bmr || userProfile.bmr || 1366);
  const targetCalories = Math.round(userProfile.target_calories || dietData.target_calories || 2071);
  
  // Parse diet plan from API response
  const weekPlan = parseDietPlan(dietPlan.diet_plan || dietData.diet_plan || '');

  const getMealColor = (mealType) => {
    const colors = {
      breakfast: '#42A5F5',
      lunch: '#EC407A',
      dinner: '#4CAF50'
    };
    return colors[mealType] || '#999';
  };

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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Diet Plan</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* BMI Circle */}
          <View style={styles.bmiCard}>
            <BMICircle bmi={bmi.toFixed(1)} category={bmiCategory} />
          </View>

          {/* Calories Cards */}
          <View style={styles.caloriesRow}>
            <View style={styles.calorieCard}>
              <Text style={styles.calorieLabel}>Required Calories</Text>
              <Text style={styles.calorieValue}>
                {requiredCalories} <Text style={styles.calorieUnit2}>cal/day</Text>
              </Text>
            </View>
            <View style={styles.calorieCard}>
              <Text style={styles.calorieLabel}>Target Calories</Text>
              <Text style={styles.calorieValue}>
                {targetCalories} <Text style={styles.calorieUnit2}>cal/day</Text>
              </Text>
            </View>
          </View>

        {/* 7-Day Meal Plan Title */}
        <Text style={styles.sectionTitle}>7-Day Meal Plan</Text>

        {/* Day Cards */}
        {weekPlan.map((dayData, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.dayCard}
            onPress={() => navigation.navigate('DayDetailScreen', { dayData, dietPlan })}
            activeOpacity={0.7}
          >
            <View style={styles.dayCardLeft}>
              <Text style={styles.dayName}>{dayData.dayName}</Text>
              <View style={styles.mealsContainer}>
                {dayData.breakfast && (
                  <View style={styles.mealRow}>
                    <View style={[styles.mealDot, { backgroundColor: getMealColor('breakfast') }]} />
                    <Text style={styles.mealText} numberOfLines={1}>
                      Breakfast: {dayData.breakfast}
                    </Text>
                  </View>
                )}
                {dayData.lunch && (
                  <View style={styles.mealRow}>
                    <View style={[styles.mealDot, { backgroundColor: getMealColor('lunch') }]} />
                    <Text style={styles.mealText} numberOfLines={1}>
                      Lunch: {dayData.lunch}
                    </Text>
                  </View>
                )}
                {dayData.dinner && (
                  <View style={styles.mealRow}>
                    <View style={[styles.mealDot, { backgroundColor: getMealColor('dinner') }]} />
                    <Text style={styles.mealText} numberOfLines={1}>
                      Dinner: {dayData.dinner}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <MultiColorCalorieRing calories={dayData.totalCalories} />
          </TouchableOpacity>
        ))}

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
  scrollView: {
    flex: 1,
  },
  bmiCard: {
    backgroundColor: 'transparent',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bmiCircleContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bmiCircleSvg: {
    position: 'absolute',
  },
  bmiCircleInner: {
    width: 170,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: 8,
  },
  bmiCircleNumber: {
    fontSize: 42,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  bmiCircleLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    marginTop: 6,
    fontFamily: 'Inter',
    textAlign: 'center',
    maxWidth: '100%',
  },
  caloriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  calorieCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 24,
  },
  calorieLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Inter',
  },
  calorieUnit2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    fontFamily: 'Inter',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  dayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCardLeft: {
    flex: 1,
    marginRight: 16,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 14,
    fontFamily: 'Inter',
  },
  mealsContainer: {
    gap: 10,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  mealText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  calorieRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default DietResult;