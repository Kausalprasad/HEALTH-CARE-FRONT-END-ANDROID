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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../config/config";

const { width } = Dimensions.get('window');

const PreventiveHealthScreen = () => {
  const [formData, setFormData] = useState({
    age: '',
    sex: 'Male',
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
    alt_u_l: '',
    ast_u_l: '',
    vitamin_d_ng_ml: '',
    smoking_status: 'Never',
    exercise_frequency: 'Sedentary',
    stress_level: '5',
    alcohol_consumption: 'None',
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [labDataLoaded, setLabDataLoaded] = useState(false);

  const sexOptions = ['Male', 'Female'];
  const smokingOptions = ['Never', 'Former', 'Current'];
  const exerciseOptions = ['Sedentary', '1-2 times/week', '3-4 times/week', '5+ times/week'];
  const alcoholOptions = ['None', '1-2 per week', '3-7 per week', '8-14 per week', '15+ per week'];

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
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(value) => updateFormData('age', value)}
                placeholder="Enter age (18-100)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sex *</Text>
              <View style={styles.optionContainer}>
                {sexOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.sex === option && styles.selectedOption
                    ]}
                    onPress={() => updateFormData('sex', option)}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.sex === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height (cm) *</Text>
              <TextInput
                style={styles.input}
                value={formData.height_cm}
                onChangeText={(value) => updateFormData('height_cm', value)}
                placeholder="Enter height in cm (e.g., 170)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg) *</Text>
              <TextInput
                style={styles.input}
                value={formData.weight_kg}
                onChangeText={(value) => updateFormData('weight_kg', value)}
                placeholder="Enter weight in kg (e.g., 70)"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>BMI {formData.bmi && '(Auto-calculated)'}</Text>
              <TextInput
                style={[styles.input, formData.bmi && styles.calculatedBMI]}
                value={formData.bmi}
                onChangeText={(value) => updateFormData('bmi', value)}
                placeholder="Will auto-calculate from height & weight"
                keyboardType="decimal-pad"
                editable={!formData.height_cm || !formData.weight_kg}
              />
              {formData.bmi && (
                <Text style={styles.bmiInfo}>
                  BMI: {formData.bmi} - {
                    parseFloat(formData.bmi) < 18.5 ? 'Underweight' :
                    parseFloat(formData.bmi) < 25 ? 'Normal' :
                    parseFloat(formData.bmi) < 30 ? 'Overweight' : 'Obese'
                  }
                </Text>
              )}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Vital Signs</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Systolic Blood Pressure</Text>
              <TextInput
                style={styles.input}
                value={formData.systolic_bp}
                onChangeText={(value) => updateFormData('systolic_bp', value)}
                placeholder="e.g., 120"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Diastolic Blood Pressure</Text>
              <TextInput
                style={styles.input}
                value={formData.diastolic_bp}
                onChangeText={(value) => updateFormData('diastolic_bp', value)}
                placeholder="e.g., 80"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Resting Heart Rate (BPM)</Text>
              <TextInput
                style={styles.input}
                value={formData.resting_heart_rate_bpm}
                onChangeText={(value) => updateFormData('resting_heart_rate_bpm', value)}
                placeholder="e.g., 72"
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Lab Values</Text>
            {labDataLoaded && (
              <View style={styles.labDataBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.labDataText}>Lab data auto-filled</Text>
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Cholesterol (mg/dL)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.total_cholesterol_mg_dl && styles.preFilledInput]}
                value={formData.total_cholesterol_mg_dl}
                onChangeText={(value) => updateFormData('total_cholesterol_mg_dl', value)}
                placeholder="e.g., 190"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>HDL Cholesterol (mg/dL)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.hdl_cholesterol_mg_dl && styles.preFilledInput]}
                value={formData.hdl_cholesterol_mg_dl}
                onChangeText={(value) => updateFormData('hdl_cholesterol_mg_dl', value)}
                placeholder="e.g., 55"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Triglycerides (mg/dL)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.triglycerides_mg_dl && styles.preFilledInput]}
                value={formData.triglycerides_mg_dl}
                onChangeText={(value) => updateFormData('triglycerides_mg_dl', value)}
                placeholder="e.g., 150"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Glucose (mg/dL)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.glucose_mg_dl && styles.preFilledInput]}
                value={formData.glucose_mg_dl}
                onChangeText={(value) => updateFormData('glucose_mg_dl', value)}
                placeholder="e.g., 95"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>HbA1c (%)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.hba1c_percent && styles.preFilledInput]}
                value={formData.hba1c_percent}
                onChangeText={(value) => updateFormData('hba1c_percent', value)}
                placeholder="e.g., 5.4"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hemoglobin (g/dL)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.hemoglobin_g_dl && styles.preFilledInput]}
                value={formData.hemoglobin_g_dl}
                onChangeText={(value) => updateFormData('hemoglobin_g_dl', value)}
                placeholder="e.g., 14.5"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Creatinine (mg/dL)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.creatinine_mg_dl && styles.preFilledInput]}
                value={formData.creatinine_mg_dl}
                onChangeText={(value) => updateFormData('creatinine_mg_dl', value)}
                placeholder="e.g., 1.0"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ALT (U/L)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.alt_u_l && styles.preFilledInput]}
                value={formData.alt_u_l}
                onChangeText={(value) => updateFormData('alt_u_l', value)}
                placeholder="e.g., 25"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>AST (U/L)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.ast_u_l && styles.preFilledInput]}
                value={formData.ast_u_l}
                onChangeText={(value) => updateFormData('ast_u_l', value)}
                placeholder="e.g., 30"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vitamin D (ng/mL)</Text>
              <TextInput
                style={[styles.input, labDataLoaded && formData.vitamin_d_ng_ml && styles.preFilledInput]}
                value={formData.vitamin_d_ng_ml}
                onChangeText={(value) => updateFormData('vitamin_d_ng_ml', value)}
                placeholder="e.g., 30"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Lifestyle Factors</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Smoking Status</Text>
              <View style={styles.optionContainer}>
                {smokingOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.smoking_status === option && styles.selectedOption
                    ]}
                    onPress={() => updateFormData('smoking_status', option)}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.smoking_status === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exercise Frequency</Text>
              <View style={styles.optionContainer}>
                {exerciseOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.exercise_frequency === option && styles.selectedOption
                    ]}
                    onPress={() => updateFormData('exercise_frequency', option)}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.exercise_frequency === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stress Level (1-10)</Text>
              <TextInput
                style={styles.input}
                value={formData.stress_level}
                onChangeText={(value) => updateFormData('stress_level', value)}
                placeholder="1 (low) to 10 (high)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alcohol Consumption</Text>
              <View style={styles.optionContainer}>
                {alcoholOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.alcohol_consumption === option && styles.selectedOption
                    ]}
                    onPress={() => updateFormData('alcohol_consumption', option)}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.alcohol_consumption === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
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
      <Modal visible={showResults} animationType="slide">
        <SafeAreaView style={styles.resultsContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.resultsHeader}
          >
            <View style={styles.resultsHeaderContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowResults(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.resultsTitle}>Health Assessment Results</Text>
            </View>
          </LinearGradient>

          <ScrollView style={styles.resultsScroll}>
            {/* Critical Alerts */}
            {results.critical_alerts && results.critical_alerts.length > 0 && (
              <View style={styles.alertSection}>
                <View style={styles.alertHeader}>
                  <Ionicons name="warning" size={24} color="#F44336" />
                  <Text style={styles.alertTitle}>Critical Alerts</Text>
                </View>
                {results.critical_alerts.map((alert, index) => (
                  <View key={index} style={styles.alertItem}>
                    <Text style={styles.alertText}>{alert}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Health Scores */}
            <View style={styles.scoresSection}>
              <Text style={styles.sectionTitle}>Health Risk Scores</Text>
              
              <View style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <Ionicons 
                    name={getRiskIcon(results.health_category)} 
                    size={24} 
                    color={getRiskColor(results.health_category)} 
                  />
                  <Text style={styles.scoreName}>Overall Health</Text>
                </View>
                <Text style={styles.scoreValue}>{results.health_score}/100</Text>
                <Text style={[styles.scoreCategory, { color: getRiskColor(results.health_category) }]}>
                  {results.health_category} Risk
                </Text>
              </View>

              <View style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <Ionicons 
                    name={getRiskIcon(results.cvd_category)} 
                    size={24} 
                    color={getRiskColor(results.cvd_category)} 
                  />
                  <Text style={styles.scoreName}>Cardiovascular Disease</Text>
                </View>
                <Text style={styles.scoreValue}>{results.cvd_risk}%</Text>
                <Text style={[styles.scoreCategory, { color: getRiskColor(results.cvd_category) }]}>
                  {results.cvd_category} Risk
                </Text>
              </View>

              <View style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <Ionicons 
                    name={getRiskIcon(results.diabetes_category)} 
                    size={24} 
                    color={getRiskColor(results.diabetes_category)} 
                  />
                  <Text style={styles.scoreName}>Type 2 Diabetes</Text>
                </View>
                <Text style={styles.scoreValue}>{results.diabetes_risk}%</Text>
                <Text style={[styles.scoreCategory, { color: getRiskColor(results.diabetes_category) }]}>
                  {results.diabetes_category} Risk
                </Text>
              </View>

              {/* Additional Disease Risks */}
              {results.hypertension_risk && (
                <View style={styles.scoreCard}>
                  <View style={styles.scoreHeader}>
                    <Ionicons 
                      name={getRiskIcon(results.hypertension_category)} 
                      size={24} 
                      color={getRiskColor(results.hypertension_category)} 
                    />
                    <Text style={styles.scoreName}>Hypertension</Text>
                  </View>
                  <Text style={styles.scoreValue}>{results.hypertension_risk}%</Text>
                  <Text style={[styles.scoreCategory, { color: getRiskColor(results.hypertension_category) }]}>
                    {results.hypertension_category} Risk
                  </Text>
                </View>
              )}
            </View>

            {/* Risk Factors */}
            {results.risk_factors && results.risk_factors.length > 0 && (
              <View style={styles.factorsSection}>
                <Text style={styles.sectionTitle}>Risk Factors</Text>
                {results.risk_factors.map((factor, index) => (
                  <View key={index} style={styles.factorItem}>
                    <Ionicons name="information-circle" size={16} color="#FF9800" />
                    <Text style={styles.factorText}>{factor}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {results.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={[
            styles.stepDot,
            currentStep >= step && styles.activeStepDot
          ]}
        >
          <Text style={[
            styles.stepNumber,
            currentStep >= step && styles.activeStepNumber
          ]}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="fitness" size={28} color="#fff" />
          <Text style={styles.headerTitle}>HealNova</Text>
          <Text style={styles.headerSubtitle}>AI Health Assessment</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {renderStepIndicator()}
        {renderFormStep()}
        
        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Ionicons name="chevron-back" size={20} color="#667eea" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < 4 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={() => setCurrentStep(currentStep + 1)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.submitButton]}
              onPress={submitHealthAssessment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Get Assessment</Text>
                  <Ionicons name="analytics" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {renderResults()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepDot: {
    backgroundColor: '#667eea',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
  },
  activeStepNumber: {
    color: '#fff',
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
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
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#667eea',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  navButtonText: {
    fontSize: 16,
    color: '#667eea',
    marginLeft: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  resultsHeader: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  resultsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 8,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  resultsScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertSection: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 8,
  },
  alertItem: {
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#c62828',
    fontWeight: '500',
  },
  scoresSection: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scoreCategory: {
    fontSize: 14,
    fontWeight: '600',
  },
  factorsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  factorText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  recommendationsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    marginBottom: 30,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
});

export default PreventiveHealthScreen;