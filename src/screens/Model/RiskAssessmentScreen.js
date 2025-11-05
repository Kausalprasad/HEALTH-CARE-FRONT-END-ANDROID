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
  FlatList,
  SafeAreaView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../config/config';

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

const RiskAssessmentScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    ethnicity: '',
    smoking: '',
    physical_activity: '',
    diet: '',
    alcohol: '',
    sleep_hours: '',
    stress_level: 5,
  });

  const [familyHistory, setFamilyHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [loadingSavedReports, setLoadingSavedReports] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [userToken, setUserToken] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailTab, setDetailTab] = useState('cardiovascular');

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const ethnicityOptions = [
    { label: 'Asian', value: 'Asian' },
    { label: 'Caucasian', value: 'Caucasian' },
    { label: 'African', value: 'African' },
    { label: 'Hispanic', value: 'Hispanic' },
    { label: 'Other', value: 'Other' },
  ];

  const smokingOptions = [
    { label: 'Never', value: 'never' },
    { label: 'Former', value: 'former' },
    { label: 'Current', value: 'current' },
  ];

  const activityOptions = [
    { label: 'Sedentary', value: 'sedentary' },
    { label: 'Light', value: 'light' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Vigorous', value: 'vigorous' },
  ];

  const dietOptions = [
    { label: 'Balanced', value: 'balanced' },
    { label: 'Mixed', value: 'mixed' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'High Fat', value: 'high_fat' },
  ];

  const alcoholOptions = [
    { label: 'None', value: 'none' },
    { label: 'Occasional', value: 'occasional' },
    { label: 'Regular', value: 'regular' },
    { label: 'Heavy', value: 'heavy' },
  ];

  const conditionOptions = [
    { label: 'Heart Disease', value: 'heart_disease' },
    { label: 'Diabetes', value: 'diabetes' },
    { label: 'Hypertension', value: 'hypertension' },
    { label: 'Cancer', value: 'cancer' },
    { label: 'Kidney Disease', value: 'kidney_disease' },
  ];

  const relativeOptions = [
    { label: 'Father', value: 'father' },
    { label: 'Mother', value: 'mother' },
    { label: 'Sibling', value: 'sibling' },
    { label: 'Grandparent', value: 'grandparent' },
  ];

  useEffect(() => {
    fetchUserToken();
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && userToken) {
      fetchSavedReports();
    }
  }, [activeTab, userToken]);

  const fetchUserToken = async () => {
    try {
      let token = await AsyncStorage.getItem('token');
      if (!token) {
        token = await AsyncStorage.getItem('userToken');
      }
      if (!token) {
        token = await AsyncStorage.getItem('authToken');
      }
      console.log('🔑 Token found:', token ? 'Yes' : 'No');
      setUserToken(token);
    } catch (error) {
      console.log('❌ Error fetching token:', error);
    }
  };

  const fetchSavedReports = async () => {
    if (!userToken) {
      console.log('⚠️ No token available');
      return;
    }

    setLoadingSavedReports(true);
    try {
      console.log('📡 Fetching reports from:', `${BASE_URL}/api/analyze-risk`);
      console.log('🔑 Using token:', userToken.substring(0, 20) + '...');

      const response = await fetch(`${BASE_URL}/api/analyze-risk`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        const reports = data.data || data.assessments || data || [];
        console.log('✅ Reports found:', reports.length);
        setSavedReports(Array.isArray(reports) ? reports : []);
      } else {
        console.log('❌ Error response:', data.error || data.message);
        if (response.status !== 404) {
          Alert.alert('Error', data.error || data.message || 'Failed to fetch saved reports');
        } else {
          setSavedReports([]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching saved reports:', error);
      console.error('Error details:', error.message);
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        Alert.alert('Error', 'Failed to connect to server. Please check your internet connection.');
      }
    } finally {
      setLoadingSavedReports(false);
    }
  };

  const deleteSavedReport = async (reportId) => {
    if (!userToken) return;

    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this risk assessment report?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/api/analyze-risk/${reportId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`,
                },
              });

              const data = await response.json();
              if (response.ok) {
                Alert.alert('Success', 'Report deleted successfully');
                fetchSavedReports();
              } else {
                Alert.alert('Error', data.error || 'Failed to delete');
              }
            } catch (error) {
              console.error('Error deleting report:', error);
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  const viewSavedReport = (report) => {
    setSelectedReport(report);
    setDetailTab('cardiovascular');
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const addFamilyHistory = () => {
    setFamilyHistory([
      ...familyHistory,
      {
        condition: 'heart_disease',
        has_condition: true,
        relative: 'father',
        diagnosis_age: '',
      },
    ]);
  };

  const updateFamilyHistory = (index, field, value) => {
    const updated = [...familyHistory];
    updated[index][field] = value;
    setFamilyHistory(updated);
  };

  const removeFamilyHistory = (index) => {
    const updated = familyHistory.filter((_, i) => i !== index);
    setFamilyHistory(updated);
  };

  const generateRiskAssessment = async () => {
    if (!formData.age || !formData.gender || !formData.height || !formData.weight) {
      Alert.alert('Error', 'Please fill in age, gender, height, and weight');
      return;
    }

    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const sleep_hours = parseFloat(formData.sleep_hours) || 7;

    if (isNaN(age) || isNaN(height) || isNaN(weight) || 
        age <= 0 || height <= 0 || weight <= 0) {
      Alert.alert('Error', 'Please enter valid age, height, and weight');
      return;
    }

    if (!userToken) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }

    setLoading(true);

    const requestData = {
      user_id: formData.user_id || 'user_001',
      age,
      gender: formData.gender,
      height,
      weight,
      ethnicity: formData.ethnicity || 'Other',
      family_history: familyHistory.map(fh => ({
        ...fh,
        diagnosis_age: parseInt(fh.diagnosis_age) || 0
      })),
      smoking: formData.smoking || 'never',
      physical_activity: formData.physical_activity || 'moderate',
      diet: formData.diet || 'mixed',
      alcohol: formData.alcohol || 'none',
      sleep_hours: sleep_hours,
      stress_level: formData.stress_level,
    };

    try {
      console.log('📤 Sending request to:', `${BASE_URL}/api/analyze-risk`);
      console.log('📦 Request data:', JSON.stringify(requestData, null, 2));
      console.log('🔑 Using token:', userToken.substring(0, 20) + '...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(`${BASE_URL}/api/analyze-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        Alert.alert('Success', 'Risk assessment generated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setActiveTab('history');
              fetchSavedReports();
            }
          }
        ]);
      } else {
        console.log('❌ Error:', data.error || data.message);
        Alert.alert('Error', data.error || data.message || 'Failed to generate risk assessment');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      console.error('Error details:', error.message);
      if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'Server is taking too long. Please try again.');
      } else {
        Alert.alert('Connection Error', `Cannot connect to server: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'low': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const SavedReportItem = ({ item }) => {
    const inputData = item.inputData || {};
    const assessment = item.assessment || {};
    const risks = assessment.risks || {};
    
    const avgRisk = Object.values(risks).reduce((sum, risk) => 
      sum + (risk.risk_percentage || 0), 0) / Object.keys(risks).length;

    return (
      <View style={styles.savedReportCard}>
        <View style={styles.savedReportHeader}>
          <View style={styles.savedReportLeft}>
            <Text style={styles.savedReportTitle}>RISK ASSESSMENT</Text>
            <Text style={styles.savedReportDate}>
              {new Date(item.createdAt).toLocaleDateString('en-GB')}
            </Text>
          </View>
          <View style={styles.savedReportRight}>
            <Text style={styles.savedReportRisk}>{avgRisk.toFixed(1)}%</Text>
            <Text style={styles.savedReportRiskText}>avg risk</Text>
          </View>
        </View>
        
        <View style={styles.savedReportActions}>
          <TouchableOpacity 
            style={styles.savedViewButton}
            onPress={() => viewSavedReport(item)}
          >
            <Text style={styles.savedViewButtonText}>view</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.savedDeleteButton}
            onPress={() => deleteSavedReport(item._id)}
          >
            <Text style={styles.savedDeleteButtonText}>delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHistoryTab = () => (
    <View style={styles.container}>
      {loadingSavedReports ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E74C3C" />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </View>
      ) : savedReports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏥</Text>
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptyText}>Generate your first risk assessment to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={savedReports}
          renderItem={({ item }) => <SavedReportItem item={item} />}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.historyListContent}
          scrollEnabled={true}
        />
      )}
    </View>
  );

  // Detail View
  if (selectedReport) {
    const assessment = selectedReport.assessment || {};
    const risks = assessment.risks || {};
    const inputData = selectedReport.inputData || {};
    
    const riskTypes = [
      { key: 'cardiovascular', label: 'Heart', icon: '❤️' },
      { key: 'diabetes', label: 'Diabetes', icon: '🩸' },
      { key: 'hypertension', label: 'BP', icon: '💊' },
      { key: 'cancer', label: 'Cancer', icon: '🎗️' },
      { key: 'kidney_disease', label: 'Kidney', icon: '🫘' },
    ];

    const currentRisk = risks[detailTab] || {};
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedReport(null)}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Assessment</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.detailContainer}>
          <View style={styles.riskCircleContainer}>
            <View style={styles.riskCircle}>
              <View style={styles.riskCircleInner}>
                <Text style={styles.riskNumber}>
                  {currentRisk.risk_percentage || 0}%
                </Text>
                <Text style={[styles.riskLevel, { color: getRiskColor(currentRisk.risk_level) }]}>
                  {currentRisk.risk_level || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.tabContainer}>
            {riskTypes.map(type => (
              <TouchableOpacity 
                key={type.key}
                style={detailTab === type.key ? styles.tabActive : styles.tab}
                onPress={() => setDetailTab(type.key)}
              >
                <Text style={styles.tabIcon}>{type.icon}</Text>
                <Text style={detailTab === type.key ? styles.tabTextActive : styles.tabText}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>🎯 Risk Factors</Text>
            {(currentRisk.top_risk_factors || []).map((factor, index) => (
              <View key={index} style={styles.factorItem}>
                <Text style={styles.factorBullet}>•</Text>
                <Text style={styles.factorText}>{factor}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>💡 Recommendations</Text>
            {(currentRisk.recommendations || []).map((rec, index) => (
              <View key={index} style={styles.factorItem}>
                <Text style={styles.factorBullet}>✓</Text>
                <Text style={styles.factorText}>{rec}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>📋 Your Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{inputData.age || 'N/A'} years</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{inputData.gender || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height:</Text>
              <Text style={styles.infoValue}>{inputData.height || 'N/A'} cm</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight:</Text>
              <Text style={styles.infoValue}>{inputData.weight || 'N/A'} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>BMI:</Text>
              <Text style={styles.infoValue}>
                {inputData.height && inputData.weight 
                  ? (inputData.weight / Math.pow(inputData.height/100, 2)).toFixed(1)
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Activity:</Text>
              <Text style={styles.infoValue}>{inputData.physical_activity || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sleep:</Text>
              <Text style={styles.infoValue}>{inputData.sleep_hours || 'N/A'} hours</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main View
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Risk Assessment</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.tabButtonContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'generate' && styles.tabButtonActive]}
          onPress={() => setActiveTab('generate')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'generate' && styles.tabButtonTextActive]}>
            Generate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}>
            My Reports
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'generate' ? (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputHalf}
                placeholder="Age"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
              />
            </View>
            <View style={styles.inputWrapper}>
              <CustomPicker
                selectedValue={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                items={genderOptions}
                placeholder="Gender"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputHalf}
                placeholder="Height (cm)"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                value={formData.height}
                onChangeText={(value) => handleInputChange('height', value)}
              />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputHalf}
                placeholder="Weight (kg)"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
              />
            </View>
          </View>

          <View style={styles.dropdownContainer}>
            <CustomPicker
              selectedValue={formData.ethnicity}
              onValueChange={(value) => handleInputChange('ethnicity', value)}
              items={ethnicityOptions}
              placeholder="Ethnicity"
            />
          </View>

          <View style={styles.dropdownContainer}>
            <CustomPicker
              selectedValue={formData.smoking}
              onValueChange={(value) => handleInputChange('smoking', value)}
              items={smokingOptions}
              placeholder="Smoking Status"
            />
          </View>

          <View style={styles.dropdownContainer}>
            <CustomPicker
              selectedValue={formData.physical_activity}
              onValueChange={(value) => handleInputChange('physical_activity', value)}
              items={activityOptions}
              placeholder="Physical Activity"
            />
          </View>

          <View style={styles.dropdownContainer}>
            <CustomPicker
              selectedValue={formData.diet}
              onValueChange={(value) => handleInputChange('diet', value)}
              items={dietOptions}
              placeholder="Diet Type"
            />
          </View>

          <View style={styles.dropdownContainer}>
            <CustomPicker
              selectedValue={formData.alcohol}
              onValueChange={(value) => handleInputChange('alcohol', value)}
              items={alcoholOptions}
              placeholder="Alcohol Consumption"
            />
          </View>

          <View style={styles.dropdownContainer}>
            <TextInput
              style={styles.input}
              placeholder="Sleep Hours (per night)"
              placeholderTextColor="#BDBDBD"
              keyboardType="numeric"
              value={formData.sleep_hours}
              onChangeText={(value) => handleInputChange('sleep_hours', value)}
            />
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Stress Level: {formData.stress_level}/10</Text>
            <View style={styles.sliderRow}>
              {[1,2,3,4,5,6,7,8,9,10].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.sliderButton,
                    formData.stress_level === level && styles.sliderButtonActive
                  ]}
                  onPress={() => handleInputChange('stress_level', level)}
                >
                  <Text style={[
                    styles.sliderButtonText,
                    formData.stress_level === level && styles.sliderButtonTextActive
                  ]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.familyHistorySection}>
            <View style={styles.familyHistoryHeader}>
              <Text style={styles.familyHistoryTitle}>Family History</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addFamilyHistory}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {familyHistory.map((item, index) => (
              <View key={index} style={styles.familyHistoryItem}>
                <View style={styles.dropdownContainer}>
                  <CustomPicker
                    selectedValue={item.condition}
                    onValueChange={(value) => updateFamilyHistory(index, 'condition', value)}
                    items={conditionOptions}
                    placeholder="Condition"
                  />
                </View>

                <View style={styles.dropdownContainer}>
                  <CustomPicker
                    selectedValue={item.relative}
                    onValueChange={(value) => updateFamilyHistory(index, 'relative', value)}
                    items={relativeOptions}
                    placeholder="Relative"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.inputHalf}
                      placeholder="Diagnosis Age"
                      placeholderTextColor="#BDBDBD"
                      keyboardType="numeric"
                      value={item.diagnosis_age}
                      onChangeText={(value) => updateFamilyHistory(index, 'diagnosis_age', value)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFamilyHistory(index)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={generateRiskAssessment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Analyze Risk</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        renderHistoryTab()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: { 
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  headerPlaceholder: {
    width: 50,
  },
  tabButtonContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 25,
    padding: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 22,
  },
  tabButtonActive: {
    backgroundColor: '#7C6FDC',
    elevation: 2,
    shadowColor: '#7C6FDC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  tabButtonText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputHalf: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#000000',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#000000',
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  customPickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  customPickerText: {
    fontSize: 14,
    color: '#000000',
  },
  placeholderText: {
    color: '#BDBDBD',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
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
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: {
    backgroundColor: '#F5F3FF',
  },
  modalItemText: {
    fontSize: 14,
    color: '#000000',
  },
  modalItemTextSelected: {
    color: '#7C6FDC',
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sliderLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  sliderButtonActive: {
    backgroundColor: '#7C6FDC',
    borderColor: '#7C6FDC',
  },
  sliderButtonText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  sliderButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  familyHistorySection: {
    marginBottom: 16,
  },
  familyHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  familyHistoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#7C6FDC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  familyHistoryItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  removeButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 8,
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#7C6FDC',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  historyListContent: {
    padding: 16,
    paddingBottom: 40,
  },
  savedReportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  savedReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savedReportLeft: {
    flex: 1,
  },
  savedReportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C6FDC',
    letterSpacing: 0.5,
  },
  savedReportDate: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  savedReportRight: {
    alignItems: 'flex-end',
  },
  savedReportRisk: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  savedReportRiskText: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
  savedReportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  savedViewButton: {
    flex: 1,
    backgroundColor: '#00BFA5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  savedViewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  savedDeleteButton: {
    flex: 1,
    backgroundColor: '#FF5252',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  savedDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  riskCircleContainer: {
    alignItems: 'center',
    marginVertical: 28,
  },
  riskCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#7C6FDC',
    borderTopColor: '#FFF5F5',
    borderLeftColor: '#FFF5F5',
  },
  riskCircleInner: {
    alignItems: 'center',
  },
  riskNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333333',
  },
  riskLevel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
    marginBottom: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  tabActive: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#7C6FDC',
    marginHorizontal: 3,
    marginBottom: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#7C6FDC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
  },
  tabTextActive: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#7C6FDC',
    marginBottom: 14,
  },
  factorItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingRight: 8,
  },
  factorBullet: {
    fontSize: 16,
    color: '#7C6FDC',
    marginRight: 8,
    fontWeight: 'bold',
  },
  factorText: {
    flex: 1,
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
    fontWeight: '400',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777777',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
});

export default RiskAssessmentScreen;