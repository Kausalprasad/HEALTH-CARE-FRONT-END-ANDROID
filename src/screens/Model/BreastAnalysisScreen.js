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
    smoking: 'never',
    diet: 'good',
    family_history: false,
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
    if (!formData.age || !formData.height || !formData.weight || 
        !formData.exercise_hours || !formData.alcohol_drinks) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const exercise_hours = parseFloat(formData.exercise_hours);
    const alcohol_drinks = parseInt(formData.alcohol_drinks);

    if (isNaN(age) || isNaN(height) || isNaN(weight) || 
        isNaN(exercise_hours) || isNaN(alcohol_drinks) ||
        age <= 0 || height <= 0 || weight <= 0 || 
        exercise_hours < 0 || alcohol_drinks < 0) {
      Alert.alert('Error', 'Please enter valid values');
      return;
    }

    setLoading(true);

    const requestData = {
      age,
      weight,
      height,
      exercise_hours,
      alcohol_drinks,
      smoking: formData.smoking,
      diet: formData.diet,
      family_history: formData.family_history,
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
      <Text style={styles.sectionTitle}>Patient Information</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Age (years) *</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Your Age"
          keyboardType="numeric"
          value={formData.age}
          onChangeText={(value) => handleInputChange('age', value)}
          placeholderTextColor="#BDBDBD"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Height (cm) *</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Height"
            keyboardType="numeric"
            value={formData.height}
            onChangeText={(value) => handleInputChange('height', value)}
            placeholderTextColor="#BDBDBD"
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Weight (kg) *</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Weight"
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={(value) => handleInputChange('weight', value)}
            placeholderTextColor="#BDBDBD"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lifestyle Factors</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Exercise (hours/week) *</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Hours of exercise per week"
          keyboardType="numeric"
          value={formData.exercise_hours}
          onChangeText={(value) => handleInputChange('exercise_hours', value)}
          placeholderTextColor="#BDBDBD"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Alcohol (drinks/week) *</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Number of drinks per week"
          keyboardType="numeric"
          value={formData.alcohol_drinks}
          onChangeText={(value) => handleInputChange('alcohol_drinks', value)}
          placeholderTextColor="#BDBDBD"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Smoking Status</Text>
        <CustomPicker
          selectedValue={formData.smoking}
          onValueChange={(value) => handleInputChange('smoking', value)}
          items={smokingOptions}
          placeholder="Select smoking status"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Diet Quality</Text>
        <CustomPicker
          selectedValue={formData.diet}
          onValueChange={(value) => handleInputChange('diet', value)}
          items={dietOptions}
          placeholder="Diet Quality"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.familyHistoryQuestion}>
          Family History of Breast Cancer?
        </Text>
        <CustomPicker
          selectedValue={formData.family_history}
          onValueChange={(value) => handleInputChange('family_history', value)}
          items={familyHistoryOptions}
          placeholder="Select family history"
        />
      </View>

      <TouchableOpacity
        style={[styles.assessButton, loading && styles.buttonDisabled]}
        onPress={assessRisk}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.assessButtonText}>Assess Risk</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderResults = () => (
    <View style={styles.resultsContainer}>
      {/* YouTube Video */}
      <View style={styles.videoContainer}>
        <Text style={styles.videoTitle}>Self-Examination for Breast Cancer</Text>
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

      {/* Risk Level Display */}
      <View style={styles.riskLevelCard}>
        <View style={styles.riskLevelHeader}>
          <Text style={styles.riskLevelLabel}>Risk Level</Text>
          <View style={styles.riskLevelBadge}>
            <Text style={[
              styles.riskLevelValue,
              { color: getRiskColor(assessmentResult.risk_assessment.overall_risk_level) }
            ]}>
              {assessmentResult.risk_assessment.overall_risk_level?.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.riskPercentageContainer}>
          <View style={styles.riskCircle}>
            <Text style={styles.riskPercentage}>
              {assessmentResult.risk_assessment.lifetime_risk_percentage}%
            </Text>
          </View>
        </View>
      </View>

      {/* Risk Score */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Risk Score</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Behaviour Risk Score</Text>
          <Text style={styles.scoreValue}>{assessmentResult.risk_assessment.behavioral_risk_score}</Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Genomic Risk Score</Text>
          <Text style={styles.scoreValue}>{assessmentResult.risk_assessment.genomic_risk_score}</Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Lifetime Risk Score</Text>
          <Text style={styles.scoreValue}>{assessmentResult.risk_assessment.lifetime_risk_percentage}%</Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Combined Risk Score</Text>
          <Text style={styles.scoreValue}>{assessmentResult.risk_assessment.combined_risk_score}</Text>
        </View>
      </View>

      {/* Screening Plan */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Screening Plan</Text>
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
        <Text style={styles.cardTitle}>Next Steps</Text>
        {assessmentResult.next_steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <Text style={styles.stepBullet}>•</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.newAssessmentButton}
        onPress={() => setAssessmentResult(null)}
      >
        <Text style={styles.newAssessmentButtonText}>New Assessment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Breast Cancer Analysis</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {assessmentResult ? renderResults() : renderForm()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerSafeArea: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#111827',
  },
  customPickerButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
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
  },
  assessButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  assessButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    gap: 16,
  },
  videoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  riskLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  riskLevelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  riskLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLevelValue: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  riskPercentageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
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
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  planItem: {
    marginBottom: 12,
  },
  planText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  planLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  stepBullet: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  newAssessmentButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8, //test 
  },
  newAssessmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BreastAnalysisScreen;