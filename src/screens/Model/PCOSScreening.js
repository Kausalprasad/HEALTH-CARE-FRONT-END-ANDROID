import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  StatusBar,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


export default function PCOSScreening() {
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const [formData, setFormData] = useState({
    irregular_cycles: false,
    excess_hair_growth: false,
    acne: false,
    hair_loss: false,
    weight_difficulty: false,
    age: '',
    weight: '',
    height: '',
    family_history: null,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.age || !formData.weight || !formData.height) {
      setError('Please fill in age, weight, and height');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        irregular_cycles: formData.irregular_cycles,
        excess_hair_growth: formData.excess_hair_growth,
        acne: formData.acne,
        hair_loss: formData.hair_loss,
        weight_difficulty: formData.weight_difficulty,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        family_history: formData.family_history === true,
      };

      const response = await fetch(
        'https://jjag4lud55o7krdda4rnr37zta0fisis.lambda-url.ap-south-1.on.aws/pcos-screening',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get screening results');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Unable to process screening. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      irregular_cycles: false,
      excess_hair_growth: false,
      acne: false,
      hair_loss: false,
      weight_difficulty: false,
      age: '',
      weight: '',
      height: '',
      family_history: null,
    });
    setResult(null);
    setError('');
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return '#DC2626';
      case 'moderate':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const CheckBox = ({ checked, onPress, label }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <View style={styles.checkboxInner} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const YesNoButton = ({ selected, onPress, label }) => (
    <TouchableOpacity
      style={[styles.yesNoButton, selected && styles.yesNoButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.yesNoText, selected && styles.yesNoTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CircularProgress = ({ percentage, color }) => {
    const radius = 54;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;

    return (
      <View style={styles.circleContainer}>
        <Svg width={140} height={140}>
          <Circle
            cx={70}
            cy={70}
            r={radius}
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={70}
            cy={70}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform={`rotate(-90, 70, 70)`}
          />
        </Svg>
        <View style={styles.circleTextContainer}>
          <Text style={styles.circlePercentage}>{percentage}%</Text>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (result) {
    const riskColor = getRiskColor(result.risk_level);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
           <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation && navigation.goBack ? navigation.goBack() : null)}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
          <Text style={styles.headerTitle}>PCOS Screening</Text>
          <View style={styles.backButton} />
        </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.resultContent}>
            <View style={styles.riskLevelCard}>
              <View style={styles.riskLevelHeader}>
                <Text style={styles.riskLevelLabel}>Risk Level</Text>
                <Text style={[styles.riskLevelValue, { color: riskColor }]}>
                  {result.risk_level?.toUpperCase()}
                </Text>
              </View>
              
              <CircularProgress percentage={result.risk_score} color={riskColor} />
            </View>

            <View style={styles.recommendationCard}>
              <Text style={styles.cardTitle}>Recommendation</Text>
              <Text style={styles.recommendationText}>
                {result.recommendation}
              </Text>
            </View>

            <View style={styles.nextStepsCard}>
              <Text style={styles.cardTitle}>Next Steps</Text>
              {result.next_steps?.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepBullet} />
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation && navigation.goBack ? navigation.goBack() : null)}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PCOS Screening</Text>
        <View style={styles.backButton} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContent}>
          {error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Symptoms</Text>
          
          <CheckBox
            checked={formData.irregular_cycles}
            onPress={() => setFormData({ ...formData, irregular_cycles: !formData.irregular_cycles })}
            label="Irregular menstrual cycle"
          />
          <CheckBox
            checked={formData.excess_hair_growth}
            onPress={() => setFormData({ ...formData, excess_hair_growth: !formData.excess_hair_growth })}
            label="Excess hair growth (face, chest, back)"
          />
          <CheckBox
            checked={formData.acne}
            onPress={() => setFormData({ ...formData, acne: !formData.acne })}
            label="Acne or oily skin"
          />
          <CheckBox
            checked={formData.hair_loss}
            onPress={() => setFormData({ ...formData, hair_loss: !formData.hair_loss })}
            label="Hair loss or thinning"
          />
          <CheckBox
            checked={formData.weight_difficulty}
            onPress={() => setFormData({ ...formData, weight_difficulty: !formData.weight_difficulty })}
            label="Difficulty maintaining weight"
          />

          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            keyboardType="numeric"
            placeholder="Age (years)"
            placeholderTextColor="#9CA3AF"
          />
          
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            keyboardType="numeric"
            placeholder="Weight (kg)"
            placeholderTextColor="#9CA3AF"
          />
          
          <TextInput
            style={styles.input}
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
            keyboardType="numeric"
            placeholder="Height (cm)"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.familyHistoryQuestion}>
            Does anyone in your family have{'\n'}PCOS or Diabetes?
          </Text>
          
          <View style={styles.yesNoContainer}>
            <YesNoButton
              selected={formData.family_history === true}
              onPress={() => setFormData({ ...formData, family_history: true })}
              label="Yes"
            />
            <YesNoButton
              selected={formData.family_history === false}
              onPress={() => setFormData({ ...formData, family_history: false })}
              label="No"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Get Result</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
      marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  formContent: {
    padding: 20,
  },
  resultContent: {
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1F2937',
    marginBottom: 16,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#4B5563',
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#1F2937',
    marginBottom: 16,
  },
  familyHistoryQuestion: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  yesNoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  yesNoButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  yesNoButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  yesNoText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6B7280',
  },
  yesNoTextSelected: {
    color: '#6366F1',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  riskLevelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  riskLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  riskLevelLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1F2937',
  },
  riskLevelValue: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlePercentage: {
    fontSize: 32,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1F2937',
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nextStepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#4B5563',
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginTop: 8,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#4B5563',
    lineHeight: 22,
  },
});