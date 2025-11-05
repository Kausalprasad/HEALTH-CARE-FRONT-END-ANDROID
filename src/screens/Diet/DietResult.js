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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

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
    const caloriesMatch = section.match(/\*\*Daily Total\*\*:\s*([^|]+)/);
    const calories = caloriesMatch ? caloriesMatch[1].trim().match(/\d+/)?.[0] : '1500';

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


const BMIGauge = ({ bmi }) => {
  const width = 300;
  const height = 160;
  const radius = 140;
  const strokeWidth = 22;
  const centerX = width / 2;
  const centerY = height;

  const getPoint = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY - radius * Math.sin(rad),
    };
  };

  const startAngle = 180;
  const endAngle = 0;
  const start = getPoint(startAngle);
  const end = getPoint(endAngle);

  const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;

  // Calculate BMI marker angle (map 15–35 range to 180–0)
  const clampedBmi = Math.min(Math.max(bmi, 15), 35);
  const angle = 180 - ((clampedBmi - 15) / 20) * 180;
  const indicator = getPoint(angle);

  return (
    <View style={{ alignItems: 'center', marginTop: 16 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#4CAF50" />
            <Stop offset="50%" stopColor="#FFA726" />
            <Stop offset="100%" stopColor="#EF5350" />
          </SvgGradient>
        </Defs>

        {/* Arc path with gradient */}
        <Path
          d={arcPath}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />

        {/* BMI Indicator Dot */}
        <Circle cx={indicator.x} cy={indicator.y} r="11" fill="#212121" />
      </Svg>

      {/* BMI Value */}
      <Text style={styles.bmiValue}>{bmi}</Text>
    </View>
  );
};

  const MultiColorCalorieRing = ({ calories }) => {
    const size = 90;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // Three segments of equal size
    const segmentLength = circumference * 0.25;
    const gapLength = circumference * 0.083;
    
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
          
          {/* Yellow segment (top-right) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FFD54F"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          
          {/* Pink segment (right) */}
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
          
          {/* Blue segment (bottom) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#42A5F5"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={-(segmentLength * 2) - (gapLength * 2)}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.calorieTextContainer}>
          <Text style={styles.calorieNumber}>{calories}</Text>
          <Text style={styles.calorieUnit}>cal/day</Text>
        </View>
      </View>
    );
  };

  const userProfile = dietPlan.user_profile || dietPlan;
  const bmi = parseFloat(userProfile.bmi || 21.3);
  const requiredCalories = userProfile.bmr || '1366';
  const targetCalories = userProfile.target_calories || '1500';
  const weekPlan = parseDietPlan(dietPlan.diet_plan || '');

  const getMealColor = (mealType) => {
    const colors = {
      breakfast: '#FFD54F',
      lunch: '#42A5F5',
      dinner: '#EC407A'
    };
    return colors[mealType] || '#999';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diet Plan</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* BMI Card */}
        <View style={styles.bmiCard}>
          <View style={styles.bmiHeader}>
            <Text style={styles.bmiLabel}>BMI</Text>
            <Text style={styles.bmiCategory}>{getBMICategory(bmi)}</Text>
          </View>
          <BMIGauge bmi={bmi.toFixed(1)} />
        </View>

        {/* Calories Cards */}
        <View style={styles.caloriesRow}>
          <View style={styles.calorieCard}>
            <Text style={styles.calorieLabel}>REQUIRED CALORIES</Text>
            <Text style={styles.calorieValue}>
              {requiredCalories} <Text style={styles.calorieUnit2}>cal/day</Text>
            </Text>
          </View>
          <View style={styles.calorieCard}>
            <Text style={styles.calorieLabel}>TARGET CALORIES</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  scrollView: {
    flex: 1,
  },
  bmiCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bmiLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7C6FDC',
    letterSpacing: 0.5,
  },
  bmiCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  bmiValue: {
    position: 'absolute',
    bottom: 24,
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  caloriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  calorieCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  calorieLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C6FDC',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  calorieValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  calorieUnit2: {
    fontSize: 13,
    fontWeight: '400',
    color: '#999999',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  dayCardLeft: {
    flex: 1,
    marginRight: 16,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
    letterSpacing: 0.3,
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
    fontSize: 13,
    color: '#666666',
    flex: 1,
    lineHeight: 18,
  },
  calorieRingContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  calorieUnit: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default DietResult;