import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../config/config";

const { width } = Dimensions.get('window');

// CustomPicker Component (same as Insurance screen)
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
        <Ionicons name="chevron-down" size={16} color="#666" />
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
          <View style={styles.pickerModalContent}>
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

const PreventiveHealthScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    height_cm: '',
    weight_kg: '',
    bmi: '',
    systolic_bp: '',
    diastolic_bp: '',
    resting_heart_rate_bpm: '',
    total_cholesterol_mg_dl: '',
    hdl_cholesterol_mg_dl: '',
    triglycerides_mg_dl: '',
    glucose_mg_dl: '',
    hba1c_percent: '',
    hemoglobin_g_dl: '',
    creatinine_mg_dl: '',
    smoking_status: '',
    exercise_frequency: '',
    stress_level: '',
    alcohol_consumption: '',
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [labDataLoaded, setLabDataLoaded] = useState(false);

  const sexOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ];
  const smokingOptions = [
    { label: 'Never', value: 'Never' },
    { label: 'Former', value: 'Former' },
    { label: 'Current', value: 'Current' },
  ];
  const exerciseOptions = [
    { label: 'Sedentary', value: 'Sedentary' },
    { label: '1-2 times/week', value: '1-2 times/week' },
    { label: '3-4 times/week', value: '3-4 times/week' },
    { label: '5+ times/week', value: '5+ times/week' },
  ];
  const stressLevelOptions = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '10', value: '10' },
  ];
  const alcoholOptions = [
    { label: 'None', value: 'None' },
    { label: '1-2 per week', value: '1-2 per week' },
    { label: '3-7 per week', value: '3-7 per week' },
    { label: '8-14 per week', value: '8-14 per week' },
    { label: '15+ per week', value: '15+ per week' },
  ];

  // Helper function to update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validate required fields
  const validateRequiredFields = () => {
    if (!formData.age || !formData.height_cm || !formData.weight_kg) {
      Alert.alert('Missing Information', 'Please fill in Age, Height, and Weight (marked with *)');
      return false;
    }

    const age = parseInt(formData.age);
    if (age < 18 || age > 100) {
      Alert.alert('Invalid Age', 'Age must be between 18 and 100');
      return false;
    }

    return true;
  };

  // Calculate BMI automatically when height or weight changes
  useEffect(() => {
    if (formData.height_cm && formData.weight_kg) {
      const heightInMeters = parseFloat(formData.height_cm) / 100;
      const weight = parseFloat(formData.weight_kg);
      
      if (heightInMeters > 0 && weight > 0) {
        const calculatedBMI = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setFormData(prev => ({ ...prev, bmi: calculatedBMI }));
      }
    }
  }, [formData.height_cm, formData.weight_kg]);

  // Fetch user's latest lab results and pre-fill the form
  useEffect(() => {
    const fetchLabResults = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('No token found, skipping lab results fetch');
          return;
        }

        console.log('Fetching lab results...');
        const response = await fetch(`${BASE_URL}/api/lab/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await response.json();
        console.log('Lab results response:', data);

        if (!data.success || !data.results || data.results.length === 0) {
          console.log('No results found');
          return;
        }

        const latestResult = data.results[0];
        const records = latestResult?.result?.records;
        
        if (!records || !Array.isArray(records) || records.length === 0) {
          console.log('No records found');
          return;
        }

        console.log('Found records:', records.length);
        
        // Helper function to find value by name
        const findValue = (name) => {
          const record = records.find(r => r.name === name);
          return record ? record.value?.toString() : '';
        };

        // Map lab values to form fields
        const labValues = {
          glucose_mg_dl: findValue('glucose_fasting') || findValue('glucose'),
          hba1c_percent: findValue('hba1c'),
          hemoglobin_g_dl: findValue('hemoglobin'),
          total_cholesterol_mg_dl: findValue('total_cholesterol') || findValue('cholesterol_total'),
          hdl_cholesterol_mg_dl: findValue('hdl_cholesterol') || findValue('cholesterol_hdl'),
          triglycerides_mg_dl: findValue('triglycerides'),
          creatinine_mg_dl: findValue('creatinine'),
          alt_u_l: findValue('alt') || findValue('sgpt'),
          ast_u_l: findValue('ast') || findValue('sgot'),
          vitamin_d_ng_ml: findValue('vitamin_d'),
        };

        console.log('Found lab values:', labValues);

        // Check if we found at least one value
        const hasAnyValue = Object.values(labValues).some(val => val !== '');
        
        if (hasAnyValue) {
          setFormData(prev => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(labValues).filter(([_, value]) => value !== '')
            )
          }));

          setLabDataLoaded(true);
          console.log('Lab data loaded successfully');
          
          Alert.alert(
            '✅ Lab Data Loaded',
            'Your latest lab results have been pre-filled in the form.',
            [{ text: 'OK' }]
          );
        }
      } catch (err) {
        console.error('Failed to fetch lab results:', err);
        Alert.alert('Info', 'Could not load lab results. You can enter values manually.');
      }
    };

    fetchLabResults();
  }, []);

  const submitHealthAssessment = async () => {
    if (!validateRequiredFields()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        bmi: parseFloat(formData.bmi),
        systolic_bp: formData.systolic_bp ? parseInt(formData.systolic_bp) : undefined,
        diastolic_bp: formData.diastolic_bp ? parseInt(formData.diastolic_bp) : undefined,
        resting_heart_rate_bpm: formData.resting_heart_rate_bpm ? parseInt(formData.resting_heart_rate_bpm) : undefined,
        total_cholesterol_mg_dl: formData.total_cholesterol_mg_dl ? parseInt(formData.total_cholesterol_mg_dl) : undefined,
        hdl_cholesterol_mg_dl: formData.hdl_cholesterol_mg_dl ? parseInt(formData.hdl_cholesterol_mg_dl) : undefined,
        triglycerides_mg_dl: formData.triglycerides_mg_dl ? parseInt(formData.triglycerides_mg_dl) : undefined,
        glucose_mg_dl: formData.glucose_mg_dl ? parseInt(formData.glucose_mg_dl) : undefined,
        hba1c_percent: formData.hba1c_percent ? parseFloat(formData.hba1c_percent) : undefined,
        hemoglobin_g_dl: formData.hemoglobin_g_dl ? parseFloat(formData.hemoglobin_g_dl) : undefined,
        creatinine_mg_dl: formData.creatinine_mg_dl ? parseFloat(formData.creatinine_mg_dl) : undefined,
        alt_u_l: formData.alt_u_l ? parseInt(formData.alt_u_l) : undefined,
        ast_u_l: formData.ast_u_l ? parseInt(formData.ast_u_l) : undefined,
        vitamin_d_ng_ml: formData.vitamin_d_ng_ml ? parseFloat(formData.vitamin_d_ng_ml) : undefined,
        stress_level: parseInt(formData.stress_level),
      };

      const response = await fetch(`${BASE_URL}/api/preventive-health/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.success) {
        setResults(result.data);
        setShowResults(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to get health assessment');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Please check your connection and try again');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (category) => {
    switch (category) {
      case 'Low': return '#4CAF50';
      case 'Moderate': return '#FF9800';
      case 'High': return '#F44336';
      default: return '#757575';
    }
  };

  const getRiskIcon = (category) => {
    switch (category) {
      case 'Low': return 'checkmark-circle';
      case 'Moderate': return 'warning';
      case 'High': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.formCard}>
            <Text style={styles.detailsHeading}>Basic Information</Text>
            
            <View style={styles.twoColumnRow}>
              <View style={styles.inputHalf}>
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(value) => updateFormData('age', value)}
                  placeholder="Age"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputHalf}>
                <CustomPicker
                  selectedValue={formData.sex}
                  onValueChange={(value) => updateFormData('sex', value)}
                  items={sexOptions}
                  placeholder="Gender"
                />
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.inputHalf}>
                <TextInput
                  style={styles.input}
                  value={formData.weight_kg}
                  onChangeText={(value) => updateFormData('weight_kg', value)}
                  placeholder="Weight"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputHalf}>
                <TextInput
                  style={styles.input}
                  value={formData.height_cm}
                  onChangeText={(value) => updateFormData('height_cm', value)}
                  placeholder="Height"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.bmi}
                onChangeText={(value) => updateFormData('bmi', value)}
                placeholder="BMI"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                editable={!formData.height_cm || !formData.weight_kg}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.formCard}>
            <Text style={styles.detailsHeading}>Vital Signs</Text>
            
            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.systolic_bp}
                onChangeText={(value) => updateFormData('systolic_bp', value)}
                placeholder="Systolic Blood Pressure"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.diastolic_bp}
                onChangeText={(value) => updateFormData('diastolic_bp', value)}
                placeholder="Diastolic Blood Pressure"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.resting_heart_rate_bpm}
                onChangeText={(value) => updateFormData('resting_heart_rate_bpm', value)}
                placeholder="Resting Heart Rate (BPM)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.formCard}>
            <Text style={styles.detailsHeading}>Lab Values</Text>
            
            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.total_cholesterol_mg_dl}
                onChangeText={(value) => updateFormData('total_cholesterol_mg_dl', value)}
                placeholder="Total Cholesterol (mg/dL)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.hdl_cholesterol_mg_dl}
                onChangeText={(value) => updateFormData('hdl_cholesterol_mg_dl', value)}
                placeholder="HDL Cholesterol (mg/dL)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.triglycerides_mg_dl}
                onChangeText={(value) => updateFormData('triglycerides_mg_dl', value)}
                placeholder="Triglycerides (mg/dL)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.glucose_mg_dl}
                onChangeText={(value) => updateFormData('glucose_mg_dl', value)}
                placeholder="Glucose (mg/dL)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.hba1c_percent}
                onChangeText={(value) => updateFormData('hba1c_percent', value)}
                placeholder="HbA1c (%)"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.hemoglobin_g_dl}
                onChangeText={(value) => updateFormData('hemoglobin_g_dl', value)}
                placeholder="Hemoglobin (g/dL)"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.fullInput}>
              <TextInput
                style={styles.input}
                value={formData.creatinine_mg_dl}
                onChangeText={(value) => updateFormData('creatinine_mg_dl', value)}
                placeholder="Creatinine (mg/dL)"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.formCard}>
            <Text style={styles.detailsHeading}>Lifestyle Factors</Text>
            
            <View style={styles.twoColumnRow}>
              <View style={styles.inputHalf}>
                <CustomPicker
                  selectedValue={formData.smoking_status}
                  onValueChange={(value) => updateFormData('smoking_status', value)}
                  items={smokingOptions}
                  placeholder="Smoking"
                />
              </View>
              <View style={styles.inputHalf}>
                <CustomPicker
                  selectedValue={formData.exercise_frequency}
                  onValueChange={(value) => updateFormData('exercise_frequency', value)}
                  items={exerciseOptions}
                  placeholder="Exercise"
                />
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.inputHalf}>
                <CustomPicker
                  selectedValue={formData.stress_level}
                  onValueChange={(value) => updateFormData('stress_level', value)}
                  items={stressLevelOptions}
                  placeholder="Stress Level"
                />
              </View>
              <View style={styles.inputHalf}>
                <CustomPicker
                  selectedValue={formData.alcohol_consumption}
                  onValueChange={(value) => updateFormData('alcohol_consumption', value)}
                  items={alcoholOptions}
                  placeholder="Alcohol"
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <Modal visible={showResults} animationType="slide" transparent={false}>
        <LinearGradient
          colors={['rgba(254, 215, 112, 0.9)', 'rgba(235, 177, 180, 0.8)', 'rgba(145, 230, 251, 0.7)', 'rgba(217, 213, 250, 0.6)']}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultModalGradient}
        >
          <SafeAreaView style={styles.resultsContainer}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.resultHeader}>
              <TouchableOpacity
                style={styles.resultBackButton}
                onPress={() => setShowResults(false)}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.resultHeaderTitle}>Health Risk Score</Text>
              <View style={styles.resultHeaderSpacer} />
            </View>

            <ScrollView 
              style={styles.resultsScroll} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsScrollContent}
            >
              {/* Main White Card Container */}
              <View style={styles.resultMainCard}>
                {/* Card Header with Title */}
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>Health Risk Score</Text>
                </View>

                {/* Overall Health Card */}
                <View style={styles.resultScoreCard}>
                  <View style={styles.resultScoreHeader}>
                    <Ionicons 
                      name={getRiskIcon(results.health_category)} 
                      size={24} 
                      color={getRiskColor(results.health_category)} 
                    />
                    <Text style={styles.resultScoreName}>Overall Health</Text>
                  </View>
                  <Text style={styles.resultScoreValue}>{results.health_score}/100</Text>
                  <Text style={[styles.resultScoreCategory, { color: getRiskColor(results.health_category) }]}>
                    {results.health_category} Risk
                  </Text>
                </View>

                {/* Cardiovascular Disease Card */}
                <View style={styles.resultScoreCard}>
                  <View style={styles.resultScoreHeader}>
                    <Ionicons 
                      name={getRiskIcon(results.cvd_category)} 
                      size={24} 
                      color={getRiskColor(results.cvd_category)} 
                    />
                    <Text style={styles.resultScoreName}>Cardiovascular Disease</Text>
                  </View>
                  <Text style={styles.resultScoreValue}>{results.cvd_risk}%</Text>
                  <Text style={[styles.resultScoreCategory, { color: getRiskColor(results.cvd_category) }]}>
                    {results.cvd_category} Risk
                  </Text>
                </View>

                {/* Type 2 Diabetes Card */}
                <View style={styles.resultScoreCard}>
                  <View style={styles.resultScoreHeader}>
                    <Ionicons 
                      name={getRiskIcon(results.diabetes_category)} 
                      size={24} 
                      color={getRiskColor(results.diabetes_category)} 
                    />
                    <Text style={styles.resultScoreName}>Type 2 Diabetes</Text>
                  </View>
                  <Text style={styles.resultScoreValue}>{results.diabetes_risk}%</Text>
                  <Text style={[styles.resultScoreCategory, { color: getRiskColor(results.diabetes_category) }]}>
                    {results.diabetes_category} Risk
                  </Text>
                </View>

                {/* Risk Factors Card */}
                {results.risk_factors && results.risk_factors.length > 0 && (
                  <View style={styles.resultInfoCard}>
                    <Text style={styles.resultSectionTitle}>Risk Factors</Text>
                    {results.risk_factors.map((factor, index) => (
                      <View key={index} style={styles.resultItemRow}>
                        <Ionicons name="warning" size={20} color="#FF9800" />
                        <Text style={styles.resultItemText}>{factor}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Recommendations Card */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <View style={styles.resultInfoCard}>
                    <Text style={styles.resultSectionTitle}>Recommendations</Text>
                    {results.recommendations.map((recommendation, index) => (
                      <View key={index} style={styles.resultItemRow}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.resultItemText}>{recommendation}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.resultActionButtons}>
              <TouchableOpacity style={styles.resultDownloadButton}>
                <Text style={styles.resultDownloadButtonText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resultShareButton}>
                <Text style={styles.resultShareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <TouchableOpacity
          key={step}
          style={[
            styles.stepPill,
            currentStep >= step && styles.activeStepPill
          ]}
          onPress={() => setCurrentStep(step)}
        >
          <Text style={[
            styles.stepPillText,
            currentStep >= step && styles.activeStepPillText
          ]}>
            {step}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <LinearGradient
      colors={['rgba(254, 215, 112, 0.9)', 'rgba(235, 177, 180, 0.8)', 'rgba(145, 230, 251, 0.7)', 'rgba(217, 213, 250, 0.6)']}
      locations={[0, 0.3, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preventive Health</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderFormStep()}
        </ScrollView>
        
        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < 4 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setCurrentStep(currentStep + 1)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={submitHealthAssessment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextButtonText}>Get Assessment</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {renderResults()}
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
  headerSpacer: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  stepPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepPill: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  stepPillText: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#999',
  },
  activeStepPillText: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  detailsHeading: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  fullInput: {
    marginBottom: 16,
  },
  labDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  labDataText: {
    fontSize: 14,
    color: '#2e7d32',
    marginLeft: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#000',
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
    fontFamily: 'Inter',
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: {
    backgroundColor: '#F3E5F5',
  },
  modalItemText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#000',
  },
  modalItemTextSelected: {
    color: '#9C27B0',
    fontWeight: '600',
  },
  preFilledInput: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  calculatedBMI: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  bmiInfo: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
    fontWeight: '600',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#667eea',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: 'transparent',
    gap: 12,
  },
  previousButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  previousButtonText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#2196F3',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#FFF',
  },
  resultModalGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  resultsContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  resultHeader: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  resultHeaderTitle: {
    fontSize: 22,
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#000',
    fontFamily: 'Inter',
  },
  resultHeaderSpacer: {
    width: 40,
  },
  resultInfoIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  resultsScroll: {
    flex: 1,
  },
  resultsScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  resultMainCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  resultCardHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultCardTitle: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  resultScoreCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultScoreName: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
  },
  resultScoreValue: {
    fontSize: 28,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  resultScoreCategory: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  resultInfoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  resultItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultItemText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#000',
    marginLeft: 12,
    flex: 1,
  },
  resultActionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 12,
  },
  resultDownloadButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resultDownloadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#FFF',
  },
  resultShareButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resultShareButtonText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#2196F3',
  },
});

export default PreventiveHealthScreen;