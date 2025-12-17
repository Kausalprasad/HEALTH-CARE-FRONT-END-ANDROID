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
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { BASE_URL } from '../../config/config';

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
    stress_level: '',
  });

  const [familyHistory, setFamilyHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [loadingSavedReports, setLoadingSavedReports] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [userToken, setUserToken] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  const stressOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 10 },
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
      setUserToken(token);
    } catch (error) {
      console.log('Error fetching token:', error);
    }
  };

  const fetchSavedReports = async () => {
    if (!userToken) return;

    setLoadingSavedReports(true);
    try {
      const response = await fetch(`${BASE_URL}/api/analyze-risk`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const reports = data.data || data.assessments || data || [];
        setSavedReports(Array.isArray(reports) ? reports : []);
      } else {
        if (response.status !== 404) {
          Alert.alert('Error', data.error || data.message || 'Failed to fetch saved reports');
        } else {
          setSavedReports([]);
        }
      }
    } catch (error) {
      console.error('Error fetching saved reports:', error);
    } finally {
      setLoadingSavedReports(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const addFamilyHistory = () => {
    setFamilyHistory([
      ...familyHistory,
      {
        condition: '',
        relative: '',
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
      family_history: familyHistory
        .filter(fh => fh.condition && fh.relative) // Only include valid entries
        .map(fh => ({
          condition: fh.condition,
          relative: fh.relative,
          diagnosis_age: fh.diagnosis_age && !isNaN(parseInt(fh.diagnosis_age)) ? parseInt(fh.diagnosis_age) : 0
        })),
      smoking: formData.smoking || 'never',
      physical_activity: formData.physical_activity || 'moderate',
      diet: formData.diet || 'mixed',
      alcohol: formData.alcohol || 'none',
      sleep_hours: sleep_hours,
      stress_level: typeof formData.stress_level === 'number' 
        ? formData.stress_level 
        : (formData.stress_level && !isNaN(parseInt(formData.stress_level)) ? parseInt(formData.stress_level) : 5),
    };

    try {
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
      const data = await response.json();

      if (response.ok) {
        // Store response with inputData for display
        const reportData = {
          ...data,
          inputData: {
            age: formData.age,
            gender: formData.gender,
            height: formData.height,
            weight: formData.weight,
            ethnicity: formData.ethnicity,
            smoking: formData.smoking,
            physical_activity: formData.physical_activity,
            diet: formData.diet,
            alcohol: formData.alcohol,
            sleep_hours: formData.sleep_hours,
            stress_level: formData.stress_level,
          }
        };
        // Show results immediately
        setSelectedReport(reportData);
      } else {
        const errorMessage = data.error || data.message || data.detail || 'Failed to generate risk assessment';
        console.error('API Error:', errorMessage);
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
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

  const getRiskPercentage = (report) => {
    if (!report || !report.assessment || !report.assessment.risks) return 0;
    const risks = report.assessment.risks;
    const values = Object.values(risks).map(r => r.risk_percentage || 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  const groupReportsByDate = (reports) => {
    const grouped = {};
    reports.forEach(report => {
      const date = new Date(report.createdAt || report.created_at);
      const dateKey = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'short' });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(report);
    });
    return grouped;
  };

  const filteredReports = savedReports.filter(report => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report._id?.toLowerCase().includes(query) ||
      'Risk Assessment'.toLowerCase().includes(query)
    );
  });

  const groupedReports = groupReportsByDate(filteredReports);

  // Results/Output Screen
  if (selectedReport) {
    // Extract data from API response - handle different response structures
    const assessment = selectedReport.assessment || selectedReport.data || selectedReport;
    const risks = assessment.risks || assessment || {};
    const inputData = selectedReport.inputData || selectedReport.user_data || {};
    
    // Calculate average risk from all categories
    const riskValues = Object.values(risks).map(r => {
      if (typeof r === 'object' && r.risk_percentage) {
        return r.risk_percentage;
      }
      return 0;
    }).filter(v => v > 0);
    
    const avgRisk = riskValues.length > 0 
      ? riskValues.reduce((a, b) => a + b, 0) / riskValues.length 
      : (assessment.overall_risk_percentage || assessment.avg_risk || getRiskPercentage(selectedReport));
    
    const riskLevel = assessment.overall_risk_level || assessment.risk_level || 
      (avgRisk < 20 ? 'Low' : avgRisk < 50 ? 'Moderate' : 'High');
    
    const categories = [
      { key: 'cardiovascular', label: 'Heart', icon: 'heart', color: '#9C27B0' },
      { key: 'diabetes', label: 'Diabetes', icon: 'leaf', color: '#4CAF50' },
      { key: 'hypertension', label: 'BP', icon: 'pulse', color: '#2196F3' },
      { key: 'cancer', label: 'Cancer', icon: 'ribbon', color: '#00BCD4' },
      { key: 'kidney_disease', label: 'Kidney', icon: 'medical', color: '#FF9800' },
    ];

    // Collect risk factors and recommendations from all categories
    let allRiskFactors = [];
    let allRecommendations = [];
    
    // Log risks for debugging
    console.log('Risks object:', JSON.stringify(risks, null, 2));
    
    // Loop through all categories and collect their data
    categories.forEach(cat => {
      const risk = risks[cat.key] || {};
      if (risk && typeof risk === 'object') {
        // Collect risk factors from this category
        const categoryRiskFactors = risk.top_risk_factors || 
          risk.risk_factors || 
          risk.factors ||
          [];
        
        if (Array.isArray(categoryRiskFactors) && categoryRiskFactors.length > 0) {
          allRiskFactors = [...allRiskFactors, ...categoryRiskFactors];
        } else if (typeof categoryRiskFactors === 'string') {
          allRiskFactors.push(categoryRiskFactors);
        }
        
        // Collect recommendations from this category
        const categoryRecommendations = risk.recommendations || 
          risk.recommendation ||
          risk.advice ||
          [];
        
        if (Array.isArray(categoryRecommendations) && categoryRecommendations.length > 0) {
          allRecommendations = [...allRecommendations, ...categoryRecommendations];
        } else if (typeof categoryRecommendations === 'string') {
          allRecommendations.push(categoryRecommendations);
        }
      }
    });
    
    // Also try to get overall risk factors and recommendations
    const overallRisk = assessment.overall || assessment.summary || {};
    const overallRiskFactors = overallRisk.top_risk_factors || 
      overallRisk.risk_factors || 
      assessment.risk_factors ||
      assessment.top_risk_factors ||
      [];
    
    const overallRecommendations = overallRisk.recommendations || 
      overallRisk.recommendation ||
      assessment.recommendations ||
      assessment.recommendation ||
      [];
    
    // Combine all risk factors and recommendations, remove duplicates
    const combinedRiskFactors = [...allRiskFactors, ...(Array.isArray(overallRiskFactors) ? overallRiskFactors : [])];
    const combinedRecommendations = [...allRecommendations, ...(Array.isArray(overallRecommendations) ? overallRecommendations : [])];
    
    // Remove duplicates by converting to Set and back to array
    const riskFactors = [...new Set(combinedRiskFactors.map(f => typeof f === 'string' ? f : JSON.stringify(f)))];
    const recommendations = [...new Set(combinedRecommendations.map(r => typeof r === 'string' ? r : JSON.stringify(r)))];

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
              onPress={() => setSelectedReport(null)}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Risk Assessment</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
            {/* Risk Score Circle - Show selected category's percentage */}
            <View style={styles.riskCircleContainer}>
              {(() => {
                const displayRisk = selectedCategory 
                  ? (risks[selectedCategory] || {})
                  : { risk_percentage: avgRisk, risk_level: riskLevel };
                const displayPercent = displayRisk.risk_percentage || displayRisk.percentage || avgRisk;
                const displayLevel = displayRisk.risk_level || 
                  (displayPercent < 20 ? 'Low' : displayPercent < 50 ? 'Moderate' : 'High');
                const progressPercent = Math.min(displayPercent, 100);
                const radius = 72;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
                const progressColor = getRiskColor(displayLevel);
                
                return (
                  <View style={styles.riskCircleWrapper}>
                    <Svg width={160} height={160} style={styles.riskCircleSvg}>
                      {/* Background Circle */}
                      <Circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="#E0E0E0"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Progress Circle */}
                      <Circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke={progressColor}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                      />
                    </Svg>
                    <View style={styles.riskCircleInner}>
                      <Text style={styles.riskNumber}>{displayPercent.toFixed(0)}%</Text>
                      <Text style={[styles.riskLevel, { color: progressColor }]}>
                        {displayLevel}
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </View>

            {/* Category Icons */}
            <View style={styles.categoryContainer}>
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <TouchableOpacity 
                    key={cat.key} 
                    style={styles.categoryItem}
                    onPress={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
                  >
                    <View style={[
                      styles.categoryIcon, 
                      { 
                        backgroundColor: cat.color,
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: '#FFF',
                      }
                    ]}>
                      <Ionicons name={cat.icon} size={24} color="#FFF" />
                    </View>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Risk Factors Card - Show selected category's or overall */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="search" size={20} color="#333" />
                <Text style={styles.cardTitle}>Risk Factors</Text>
              </View>
              {(() => {
                let riskFactorsList = [];
                if (selectedCategory) {
                  const risk = risks[selectedCategory] || {};
                  const categoryRiskFactors = risk.top_risk_factors || 
                    risk.risk_factors || 
                    risk.factors ||
                    [];
                  riskFactorsList = Array.isArray(categoryRiskFactors) 
                    ? categoryRiskFactors 
                    : (categoryRiskFactors ? [categoryRiskFactors] : []);
                } else {
                  riskFactorsList = riskFactors;
                }
                
                return riskFactorsList.length > 0 ? (
                  riskFactorsList.map((factor, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.listText}>{typeof factor === 'string' ? factor : factor.factor || factor.name || JSON.stringify(factor)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyDataText}>No risk factors identified</Text>
                );
              })()}
            </View>

            {/* Recommendations Card - Show selected category's or overall */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="megaphone" size={20} color="#333" />
                <Text style={styles.cardTitle}>Recommendation</Text>
              </View>
              {(() => {
                let recommendationsList = [];
                if (selectedCategory) {
                  const risk = risks[selectedCategory] || {};
                  const categoryRecommendations = risk.recommendations || 
                    risk.recommendation ||
                    risk.advice ||
                    [];
                  recommendationsList = Array.isArray(categoryRecommendations) 
                    ? categoryRecommendations 
                    : (categoryRecommendations ? [categoryRecommendations] : []);
                } else {
                  recommendationsList = recommendations;
                }
                
                return recommendationsList.length > 0 ? (
                  recommendationsList.map((rec, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.listText}>{typeof rec === 'string' ? rec : rec.recommendation || rec.advice || rec.text || JSON.stringify(rec)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyDataText}>No recommendations available</Text>
                );
              })()}
            </View>

            {/* Your Information Card */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={20} color="#9C27B0" />
                <Text style={styles.cardTitle}>Your Information</Text>
              </View>
              {/* Labels Row */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoLabel}>Height</Text>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoLabel}>BMI</Text>
              </View>
              {/* Values Row */}
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{inputData.age || 'N/A'} years</Text>
                <Text style={styles.infoValue}>{inputData.gender || 'N/A'}</Text>
                <Text style={styles.infoValue}>{inputData.height || 'N/A'}cm</Text>
                <Text style={styles.infoValue}>{inputData.weight || 'N/A'}kg</Text>
                <Text style={styles.infoValue}>
                  {inputData.height && inputData.weight 
                    ? (inputData.weight / Math.pow(inputData.height/100, 2)).toFixed(1)
                    : 'N/A'}
                </Text>
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
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Main View
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
          <Text style={styles.headerTitle}>Risk Assessment</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('generate')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'generate' ? styles.tabTextGenerateActive : styles.tabTextGenerateInactive
            ]}>
              Generate
            </Text>
            {activeTab === 'generate' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'history' ? styles.tabTextReportsActive : styles.tabTextReportsInactive
            ]}>
              My Reports
            </Text>
            {activeTab === 'history' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>

        {activeTab === 'generate' ? (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* White Card Container */}
            <View style={styles.formCard}>
              <View style={styles.formCardGradient}>
                {/* Add Your Details Section */}
                <Text style={styles.sectionTitle}>Add Your Details</Text>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder="Age"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.age}
                      onChangeText={(value) => handleInputChange('age', value)}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <CustomPicker
                      selectedValue={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                      items={genderOptions}
                      placeholder="Gender"
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder="Height (cm)"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.height}
                      onChangeText={(value) => handleInputChange('height', value)}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder="Weight (kg)"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.weight}
                      onChangeText={(value) => handleInputChange('weight', value)}
                    />
                  </View>
                </View>

                <View style={styles.fullInput}>
                  <CustomPicker
                    selectedValue={formData.ethnicity}
                    onValueChange={(value) => handleInputChange('ethnicity', value)}
                    items={ethnicityOptions}
                    placeholder="Ethnicity"
                  />
                </View>

                <View style={styles.fullInput}>
                  <CustomPicker
                    selectedValue={formData.smoking}
                    onValueChange={(value) => handleInputChange('smoking', value)}
                    items={smokingOptions}
                    placeholder="Smoking Status"
                  />
                </View>

                <View style={styles.fullInput}>
                  <CustomPicker
                    selectedValue={formData.physical_activity}
                    onValueChange={(value) => handleInputChange('physical_activity', value)}
                    items={activityOptions}
                    placeholder="Physical Activity"
                  />
                </View>

                <View style={styles.fullInput}>
                  <CustomPicker
                    selectedValue={formData.diet}
                    onValueChange={(value) => handleInputChange('diet', value)}
                    items={dietOptions}
                    placeholder="Diet Type"
                  />
                </View>

                <View style={styles.fullInput}>
                  <CustomPicker
                    selectedValue={formData.alcohol}
                    onValueChange={(value) => handleInputChange('alcohol', value)}
                    items={alcoholOptions}
                    placeholder="Alcohol Consumption"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder="Sleeping Hours"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.sleep_hours}
                      onChangeText={(value) => handleInputChange('sleep_hours', value)}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder="Stress Level (1-10)"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.stress_level ? formData.stress_level.toString() : ''}
                      onChangeText={(value) => {
                        if (value === '') {
                          handleInputChange('stress_level', '');
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
                            handleInputChange('stress_level', numValue);
                          }
                        }
                      }}
                    />
                  </View>
                </View>

                {/* Family History Section */}
                <View style={styles.familyHistorySection}>
                  <View style={styles.familyHistoryHeader}>
                    <Text style={styles.sectionTitle}>Family History</Text>
                    {familyHistory.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setFamilyHistory([])}
                      >
                        <Text style={styles.removeAllText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {familyHistory.map((item, index) => (
                    <View key={index} style={styles.familyHistoryItem}>
                      <View style={styles.fullInput}>
                        <CustomPicker
                          selectedValue={item.condition}
                          onValueChange={(value) => updateFamilyHistory(index, 'condition', value)}
                          items={conditionOptions}
                          placeholder="Disease Type"
                        />
                      </View>

                      <View style={styles.inputRow}>
                        <View style={styles.inputHalf}>
                          <CustomPicker
                            selectedValue={item.relative}
                            onValueChange={(value) => updateFamilyHistory(index, 'relative', value)}
                            items={relativeOptions}
                            placeholder="Relation"
                          />
                        </View>
                        <View style={styles.inputHalf}>
                          <TextInput
                            style={styles.input}
                            placeholder="Diagnosis Age"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={item.diagnosis_age}
                            onChangeText={(value) => updateFamilyHistory(index, 'diagnosis_age', value)}
                          />
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFamilyHistory(index)}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.addFamilyButton}
                    onPress={addFamilyHistory}
                  >
                    <Ionicons name="add" size={20} color="#2196F3" />
                    <Text style={styles.addFamilyText}>Add Family History</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Analyze Risk Button */}
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={generateRiskAssessment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.analyzeButtonText}>Analyze Risk</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.historyContainer}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {loadingSavedReports ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9C27B0" />
              </View>
            ) : Object.keys(groupedReports).length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No reports found</Text>
              </View>
            ) : (
              <ScrollView style={styles.reportsScroll} showsVerticalScrollIndicator={false}>
                {Object.entries(groupedReports).map(([date, reports]) => (
                  <View key={date} style={styles.dateGroup}>
                    <Text style={styles.dateHeader}>{date}</Text>
                    {reports.map((report, index) => {
                      const avgRisk = getRiskPercentage(report);
                      return (
                        <TouchableOpacity
                          key={report._id || index}
                          style={styles.reportCard}
                          onPress={() => setSelectedReport(report)}
                        >
                          <View style={styles.reportLeft}>
                            <View style={styles.reportIcon}>
                              <Ionicons name="document-text" size={24} color="#9C27B0" />
                            </View>
                            <View>
                              <Text style={styles.reportTitle}>Risk Assessment</Text>
                              <Text style={styles.reportSize}>312 KB</Text>
                            </View>
                          </View>
                          <View style={styles.reportRight}>
                            <Text style={styles.reportRisk}>{avgRisk.toFixed(1)}%</Text>
                            <Text style={styles.reportRiskLabel}>Avg risk</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
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
    paddingTop: 8,
    gap: 24,
  },
  tab: {
    paddingBottom: 8,
  },
  tabText: {
    fontFamily: 'Inter',
  },
  tabTextGenerateActive: {
    fontSize: 27,
    fontWeight: '700',
    fontStyle: 'normal',
    color: '#9C27B0',
    fontFamily: 'Inter',
  },
  tabTextGenerateInactive: {
    fontSize: 16,
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#999',
    fontFamily: 'Inter',
  },
  tabTextReportsActive: {
    fontSize: 27,
    fontWeight: '700',
    fontStyle: 'normal',
    color: '#9C27B0',
    fontFamily: 'Inter',
  },
  tabTextReportsInactive: {
    fontSize: 16,
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#999',
    fontFamily: 'Inter',
  },
  tabUnderline: {
    height: 2,
    backgroundColor: '#9C27B0',
    marginTop: 4,
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  formCardGradient: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
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
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 14,
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
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  familyHistorySection: {
    marginTop: 8,
  },
  familyHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  removeAllText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  familyHistoryItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 30,
    padding: 12,
    marginBottom: 12,
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  removeButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  addFamilyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 30,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addFamilyText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  analyzeButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historyContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#000',
  },
  reportsScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  reportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reportSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  reportRight: {
    alignItems: 'flex-end',
  },
  reportRisk: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  reportRiskLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  // Results Screen Styles
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  riskCircleContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  riskCircleWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  riskCircleSvg: {
    position: 'absolute',
  },
  riskCircleInner: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  riskNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
  },
  riskLevel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    color: '#000',
    textTransform: 'capitalize',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  categoryRisk: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  emptyDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryCardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  categoryCardRisk: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  categoryCardSection: {
    padding: 16,
    paddingTop: 12,
  },
  categoryCardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryCardSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
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
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    fontWeight: 'bold',
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
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
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
    color: '#000',
  },
  modalItemTextSelected: {
    color: '#9C27B0',
    fontWeight: '600',
  },
});

export default RiskAssessmentScreen;

