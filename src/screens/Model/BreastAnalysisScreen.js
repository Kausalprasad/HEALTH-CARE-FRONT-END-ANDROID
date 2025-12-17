// screens/BreastAnalysisScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const CustomPicker = ({ selectedValue, onValueChange, items, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const getLabel = () => {
    const selected = items.find(item => item.value === selectedValue);
    return selected ? selected.label : placeholder;
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.customPickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.customPickerText, !selectedValue && styles.placeholderText]}>
          {getLabel()}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScroll}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalItem,
                    selectedValue === item.value && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedValue === item.value && styles.modalItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const BreastAnalysisScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    exercise_hours: '',
    alcohol_drinks: '',
    smoking: '',
    diet: '',
    family_history: '',
  });

  const [loading, setLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [userToken, setUserToken] = useState(null);

  const smokingOptions = [
    { label: 'Never', value: 'never' },
    { label: 'Former', value: 'former' },
    { label: 'Current', value: 'current' },
  ];

  const dietOptions = [
    { label: 'Excellent', value: 'excellent' },
    { label: 'Good', value: 'good' },
    { label: 'Average', value: 'average' },
    { label: 'Poor', value: 'poor' },
  ];

  const familyHistoryOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  useEffect(() => {
    fetchUserToken();
  }, []);

  const fetchUserToken = async () => {
    try {
      let token = await AsyncStorage.getItem('token');
      if (!token) {
        token = await AsyncStorage.getItem('userToken');
      }
      if (!token) {
        token = await AsyncStorage.getItem('authToken');
      }
      setUserToken(token);
    } catch (error) {
      console.log('Error fetching token:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const assessRisk = async () => {
    if (!formData.age || !formData.height || !formData.weight) {
      Alert.alert('Error', 'Please fill in age, height, and weight');
      return;
    }

    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    
    // Parse exercise and alcohol from string values
    let exercise_hours = 0;
    if (formData.exercise_hours) {
      if (formData.exercise_hours.includes('-')) {
        const parts = formData.exercise_hours.split('-');
        exercise_hours = parseFloat(parts[0]) || 0;
      } else if (formData.exercise_hours.includes('+')) {
        exercise_hours = parseFloat(formData.exercise_hours.replace('+', '')) || 0;
      } else {
        exercise_hours = parseFloat(formData.exercise_hours) || 0;
      }
    }
    
    let alcohol_drinks = 0;
    if (formData.alcohol_drinks) {
      if (formData.alcohol_drinks.includes('-')) {
        const parts = formData.alcohol_drinks.split('-');
        alcohol_drinks = parseFloat(parts[0]) || 0;
      } else if (formData.alcohol_drinks.includes('+')) {
        alcohol_drinks = parseFloat(formData.alcohol_drinks.replace('+', '')) || 0;
      } else {
        alcohol_drinks = parseFloat(formData.alcohol_drinks) || 0;
      }
    }

    if (isNaN(age) || isNaN(height) || isNaN(weight) || 
        age <= 0 || height <= 0 || weight <= 0) {
      Alert.alert('Error', 'Please enter valid age, height, and weight');
      return;
    }

    setLoading(true);

    const requestData = {
      age,
      weight,
      height,
      exercise_hours,
      alcohol_drinks,
      smoking: formData.smoking || 'never',
      diet: formData.diet || 'good',
      family_history: formData.family_history === true || formData.family_history === 'true' || formData.family_history === 'Yes',
    };

    try {
      const response = await fetch(
        'https://m77o2pfy3owx7wo2ivb3h47ylq0vgzul.lambda-url.ap-south-1.on.aws/assess-risk',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        setAssessmentResult(data);
      } else {
        Alert.alert('Error', 'Failed to assess risk');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Connection Error', 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'LOW':
        return '#4CAF50';
      case 'MODERATE':
        return '#FF9800';
      case 'HIGH':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Basic Details</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <TextInput
            style={styles.inputField}
            placeholder="Age"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(value) => handleInputChange('age', value)}
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.inputHalf}>
          <TextInput
            style={styles.inputField}
            placeholder="Weight (kg)"
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={(value) => handleInputChange('weight', value)}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <TextInput
            style={styles.inputField}
            placeholder="Height (cm)"
            keyboardType="numeric"
            value={formData.height}
            onChangeText={(value) => handleInputChange('height', value)}
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.inputHalf}>
          <CustomPicker
            selectedValue={formData.diet}
            onValueChange={(value) => handleInputChange('diet', value)}
            items={dietOptions}
            placeholder="Diet Quality"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lifestyle Factors</Text>

      <View style={styles.fullInput}>
        <CustomPicker
          selectedValue={formData.exercise_hours}
          onValueChange={(value) => handleInputChange('exercise_hours', value)}
          items={[
            { label: '0-1 hours', value: '0-1' },
            { label: '2-3 hours', value: '2-3' },
            { label: '4-5 hours', value: '4-5' },
            { label: '6+ hours', value: '6+' },
          ]}
          placeholder="Exercise (hrs per week)"
        />
      </View>

      <View style={styles.fullInput}>
        <CustomPicker
          selectedValue={formData.alcohol_drinks}
          onValueChange={(value) => handleInputChange('alcohol_drinks', value)}
          items={[
            { label: '0 drinks', value: '0' },
            { label: '1-3 drinks', value: '1-3' },
            { label: '4-7 drinks', value: '4-7' },
            { label: '8+ drinks', value: '8+' },
          ]}
          placeholder="Alcohol (drinks per week)"
        />
      </View>

      <View style={styles.fullInput}>
        <CustomPicker
          selectedValue={formData.smoking}
          onValueChange={(value) => handleInputChange('smoking', value)}
          items={smokingOptions}
          placeholder="Smoking Habit"
        />
      </View>

      <View style={styles.fullInput}>
        <CustomPicker
          selectedValue={formData.family_history}
          onValueChange={(value) => handleInputChange('family_history', value)}
          items={familyHistoryOptions}
          placeholder="Family History of Cancer"
        />
      </View>
    </View>
  );

  const renderResults = () => {
    const riskPercent = parseFloat(assessmentResult.risk_assessment.lifetime_risk_percentage) || 0;
    const riskLevel = assessmentResult.risk_assessment.overall_risk_level || 'Low';
    const radius = 76;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (riskPercent / 100) * circumference;
    const progressColor = getRiskColor(riskLevel);

    return (
      <View style={styles.resultsContainer}>
        {/* Risk Score Circle */}
        <View style={styles.riskCircleContainer}>
          <Svg height="160" width="160" style={styles.circularProgressSvg}>
            <Circle
              cx="80" cy="80" r={radius} stroke="#E0E0E0" strokeWidth="8" fill="none"
            />
            <Circle
              cx="80" cy="80" r={radius}
              stroke={progressColor}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90, 80, 80)"
            />
          </Svg>
          <View style={styles.riskCircleInner}>
            <Text style={styles.riskNumber}>{riskPercent.toFixed(1)}%</Text>
            <Text style={[styles.riskLevelText, { color: progressColor }]}>
              {riskLevel}
            </Text>
          </View>
        </View>

        {/* Risk Score Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart" size={20} color="#9C27B0" />
            <Text style={styles.cardTitle}>Risk Score</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Behavior</Text>
            <Text style={styles.scoreValue}>{assessmentResult.risk_assessment.behavioral_risk_score}</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Genomic</Text>
            <Text style={styles.scoreValue}>{assessmentResult.risk_assessment.genomic_risk_score}</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Lifetime</Text>
            <Text style={styles.scoreValue}>{assessmentResult.risk_assessment.lifetime_risk_percentage}%</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Combined</Text>
            <Text style={styles.scoreValue}>{assessmentResult.risk_assessment.combined_risk_score}</Text>
          </View>
        </View>

        {/* Screening Plan */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="search" size={20} color="#2196F3" />
            <Text style={styles.cardTitle}>Screening Plan</Text>
          </View>
          <View style={styles.planItem}>
            <Text style={styles.planText}>
              <Text style={styles.planLabel}>Screening Frequency: </Text>
              {assessmentResult.screening_plan.screening_frequency}
            </Text>
          </View>
          <View style={styles.planItem}>
            <Text style={styles.planText}>
              <Text style={styles.planLabel}>Mammogram: </Text>
              {assessmentResult.screening_plan.mammogram_recommendation}
            </Text>
          </View>
          <View style={styles.planItem}>
            <Text style={styles.planText}>
              <Text style={styles.planLabel}>Clinical Exam: </Text>
              {assessmentResult.screening_plan.clinical_exam}
            </Text>
          </View>
          <View style={styles.planItem}>
            <Text style={styles.planText}>
              <Text style={styles.planLabel}>Self Exam: </Text>
              {assessmentResult.screening_plan.self_exam}
            </Text>
          </View>
          <View style={styles.planItem}>
            <Text style={styles.planText}>
              <Text style={styles.planLabel}>Specialist Referral: </Text>
              {assessmentResult.screening_plan.specialist_referral ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle" size={20} color="#FF9800" />
            <Text style={styles.cardTitle}>Next Steps</Text>
          </View>
          {assessmentResult.next_steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <Text style={styles.stepBullet}>•</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Self Examination */}
        <View style={styles.videoContainer}>
          <View style={styles.cardHeader}>
            <Ionicons name="play-circle" size={20} color="#F44336" />
            <Text style={styles.videoTitle}>Self Examination</Text>
          </View>
          <View style={styles.videoWrapper}>
            <WebView
              style={styles.video}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              source={{
                uri: 'https://www.youtube.com/embed/I7wSEIOz-1k',
              }}
              allowsFullscreenVideo={true}
            />
          </View>
        </View>

        {/* Download and Share Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
          <LinearGradient
            colors={['#9C27B0', '#E91E63', '#FF9800']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButton}
          >
            <TouchableOpacity>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
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
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Breast Cancer Assessment</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {assessmentResult ? renderResults() : renderForm()}
        </ScrollView>
        
        {/* Analyze Risk Button - Outside card */}
        {!assessmentResult && (
          <TouchableOpacity
            style={[styles.assessButton, loading && styles.buttonDisabled]}
            onPress={assessRisk}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.assessButtonText}>Analyze Risk</Text>
            )}
          </TouchableOpacity>
        )}
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
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    width: width - 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    fontFamily: 'Inter',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  fullInput: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    fontFamily: 'Inter',
  },
  inputField: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter',
  },
  customPickerButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customPickerText: {
    fontSize: 14,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  modalItemText: {
    fontSize: 14,
    color: '#111827',
  },
  modalItemTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  familyHistoryQuestion: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    fontFamily: 'Inter',
  },
  assessButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  assessButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  resultsContainer: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  riskCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  circularProgressSvg: {
    position: 'absolute',
  },
  riskCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  riskNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Inter',
  },
  riskLevelText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  videoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  videoWrapper: {
    width: '100%',
    height: (width - 64) * 9 / 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  video: {
    flex: 1,
  },
  riskLevelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
  },
  riskLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  riskLevelLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Inter',
  },
  riskLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLevelValue: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
    fontFamily: 'Inter',
  },
  riskPercentageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  riskPercentage: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Inter',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scoreLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    fontFamily: 'Inter',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Inter',
  },
  planItem: {
    marginBottom: 12,
  },
  planText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  planLabel: {
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Inter',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  stepBullet: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    marginTop: 2,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  riskCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  circularProgressSvg: {
    position: 'absolute',
  },
  riskCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  riskNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Inter',
  },
  riskLevelText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});

export default BreastAnalysisScreen;