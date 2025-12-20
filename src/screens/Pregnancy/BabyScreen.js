import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

const BabyScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    babyAge: '',
    weight: '',
    height: '',
    feedingType: '',
    developmentStage: '',
    sleepPattern: '',
    healthCondition: '',
    symptoms: '',
  });

  const [loading, setLoading] = useState(false);
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const [loadingSavedRecommendations, setLoadingSavedRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [userToken, setUserToken] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [detailTab, setDetailTab] = useState('development');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState(null);

  const feedingOptions = [
    { label: 'Breastfeeding', value: 'Breastfeeding' },
    { label: 'Formula', value: 'Formula' },
    { label: 'Mixed', value: 'Mixed' },
    { label: 'Solid Foods', value: 'Solid Foods' },
  ];

  const developmentOptions = [
    { label: 'Normal', value: 'Normal' },
    { label: 'Advanced', value: 'Advanced' },
    { label: 'Delayed', value: 'Delayed' },
    { label: 'Needs Assessment', value: 'Needs Assessment' },
  ];

  useEffect(() => {
    fetchUserToken();
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && userToken) {
      fetchSavedRecommendations();
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

  const fetchSavedRecommendations = async () => {
    if (!userToken) return;

    setLoadingSavedRecommendations(true);
    try {
      const response = await fetch(`${BASE_URL}/api/baby/recommendations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSavedRecommendations(data || []);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch saved recommendations');
      }
    } catch (error) {
      console.error('Error fetching saved recommendations:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoadingSavedRecommendations(false);
    }
  };

  const deleteSavedRecommendation = async (recommendationId) => {
    if (!userToken) return;

    Alert.alert(
      'Delete Recommendation',
      'Are you sure you want to delete this recommendation?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/api/baby/recommendations/${recommendationId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`,
                },
              });

              const data = await response.json();
              if (response.ok) {
                Alert.alert('Success', 'Recommendation deleted successfully');
                fetchSavedRecommendations();
              } else {
                Alert.alert('Error', data.error || 'Failed to delete');
              }
            } catch (error) {
              console.error('Error deleting recommendation:', error);
              Alert.alert('Error', 'Failed to delete recommendation');
            }
          },
        },
      ]
    );
  };

  const viewSavedRecommendation = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setDetailTab('development');
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateRecommendation = async () => {
    if (!formData.babyAge || !formData.weight || !formData.height) {
      Alert.alert('Error', 'Please fill in baby age, weight, and height');
      return;
    }

    const babyAge = parseInt(formData.babyAge);
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);

    if (isNaN(babyAge) || isNaN(weight) || isNaN(height) || 
        babyAge < 0 || weight <= 0 || height <= 0) {
      Alert.alert('Error', 'Please enter valid baby age, weight, and height');
      return;
    }

    if (!userToken) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    const requestData = {
      baby_age: babyAge,
      weight,
      height,
      feeding_type: formData.feedingType,
      development_stage: formData.developmentStage,
      sleep_pattern: formData.sleepPattern,
      health_condition: formData.healthCondition,
      symptoms: formData.symptoms,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(`${BASE_URL}/api/baby/recommend`, {
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
        Alert.alert('Success', 'Recommendation generated successfully!');
        // Refresh history if on history tab
        if (activeTab === 'history') {
          fetchSavedRecommendations();
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to generate recommendation');
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

  const parseRecommendation = (recommendation) => {
    let textContent = '';

    if (recommendation && typeof recommendation === 'object') {
      if (recommendation.recommendations) {
        textContent = recommendation.recommendations;
      } else if (recommendation.recommendation) {
        textContent = recommendation.recommendation;
      } else {
        textContent = JSON.stringify(recommendation, null, 2);
      }
    } else if (typeof recommendation === 'string') {
      textContent = recommendation;
    }

    const sections = {
      development: '',
      nutrition: '',
      activities: '',
      sleep: '',
      health: '',
      parentTips: ''
    };

    const headerPattern = /\*?\*?\d+\.\s*([A-Z\s]+):\*?\*?\n([\s\S]*?)(?=\*?\*?\d+\.|$)/g;
    let matches = textContent.matchAll(headerPattern);
    
    for (let match of matches) {
      const header = match[1].toLowerCase().trim();
      const content = match[2].trim();
      
      if (header.includes('developmental') || header.includes('milestone')) {
        sections.development = content;
      } else if (header.includes('nutrition') || header.includes('feeding')) {
        sections.nutrition = content;
      } else if (header.includes('activities') || header.includes('stimulation')) {
        sections.activities = content;
      } else if (header.includes('sleep') || header.includes('pattern')) {
        sections.sleep = content;
      } else if (header.includes('health') || header.includes('safety')) {
        sections.health = content;
      } else if (header.includes('parent') || header.includes('tips')) {
        sections.parentTips = content;
      }
    }

    if (!sections.development && !sections.nutrition && !sections.activities && !sections.sleep) {
      const altHeaderPattern = /###\s*\d*\.?\s*(.*?)\n([\s\S]*?)(?=###|\z)/g;
      matches = textContent.matchAll(altHeaderPattern);
      
      for (let match of matches) {
        const header = match[1].toLowerCase().trim();
        const content = match[2].trim();
        
        if (header.includes('developmental') || header.includes('milestone')) {
          sections.development = content;
        } else if (header.includes('nutrition') || header.includes('feeding')) {
          sections.nutrition = content;
        } else if (header.includes('activities') || header.includes('stimulation')) {
          sections.activities = content;
        } else if (header.includes('sleep') || header.includes('pattern')) {
          sections.sleep = content;
        } else if (header.includes('health') || header.includes('safety')) {
          sections.health = content;
        } else if (header.includes('parent') || header.includes('tips')) {
          sections.parentTips = content;
        }
      }
    }

    if (!sections.development && !sections.nutrition && !sections.activities && !sections.sleep && !sections.health) {
      sections.development = textContent;
    }

    return sections;
  };

  const SavedRecommendationItem = ({ item }) => {
    const inputData = item.inputData || item.input_data || {};
    
    return (
      <View style={styles.savedRecommendationCard}>
        <View style={styles.savedRecommendationHeader}>
          <View style={styles.savedRecommendationLeft}>
            <Text style={styles.savedRecommendationTitle}>
              BABY CARE
            </Text>
            <Text style={styles.savedRecommendationDate}>
              {new Date(item.createdAt).toLocaleDateString('en-GB')}
            </Text>
          </View>
          <View style={styles.savedRecommendationRight}>
            <Text style={styles.savedRecommendationMonth}>
              {inputData.baby_age || inputData.babyAge || 'N/A'}
            </Text>
            <Text style={styles.savedRecommendationMonthText}>months</Text>
          </View>
        </View>
        
        <View style={styles.savedRecommendationActions}>
          <TouchableOpacity 
            style={styles.savedViewButton}
            onPress={() => viewSavedRecommendation(item)}
          >
            <Text style={styles.savedViewButtonText}>view</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.savedDeleteButton}
            onPress={() => deleteSavedRecommendation(item._id)}
          >
            <Text style={styles.savedDeleteButtonText}>delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHistoryTab = () => (
    <View style={styles.historyContainer}>
      {loadingSavedRecommendations ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
        </View>
      ) : savedRecommendations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reports found</Text>
        </View>
      ) : (
        <ScrollView style={styles.reportsScroll} showsVerticalScrollIndicator={false}>
          {savedRecommendations.map((item, index) => {
            const inputData = item.inputData || item.input_data || {};
            return (
              <TouchableOpacity
                key={item._id || index}
                style={styles.reportCard}
                onPress={() => viewSavedRecommendation(item)}
                onLongPress={() => {
                  setSelectedItemForAction(item);
                  setActionModalVisible(true);
                }}
              >
                <View style={styles.reportLeft}>
                  <View style={styles.reportIcon}>
                    <Ionicons name="document-text" size={24} color="#9C27B0" />
                  </View>
                  <View>
                    <Text style={styles.reportTitle}>Baby Care</Text>
                    <Text style={styles.reportSize}>
                      {new Date(item.createdAt).toLocaleDateString('en-GB')}
                    </Text>
                  </View>
                </View>
                <View style={styles.reportRight}>
                  <Text style={styles.reportRisk}>
                    {inputData.baby_age || inputData.babyAge || 'N/A'}
                  </Text>
                  <Text style={styles.reportRiskLabel}>Months</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={styles.actionModalContent}>
            <TouchableOpacity
              style={styles.actionModalButton}
              onPress={() => {
                setActionModalVisible(false);
                if (selectedItemForAction) {
                  viewSavedRecommendation(selectedItemForAction);
                }
              }}
            >
              <Text style={styles.actionModalButtonText}>View</Text>
            </TouchableOpacity>
            <View style={styles.actionModalDivider} />
            <TouchableOpacity
              style={styles.actionModalButton}
              onPress={() => {
                setActionModalVisible(false);
                if (selectedItemForAction) {
                  deleteSavedRecommendation(selectedItemForAction._id);
                  setSelectedItemForAction(null);
                }
              }}
            >
              <Text style={styles.actionModalDeleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  // Detail View
  if (selectedRecommendation) {
    const sections = parseRecommendation(selectedRecommendation.recommendation || selectedRecommendation.recommendations);
    const inputData = selectedRecommendation.inputData || selectedRecommendation.input_data || {};
    
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
              onPress={() => setSelectedRecommendation(null)}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Baby Care</Text>
            <View style={styles.headerPlaceholder} />
          </View>

        <ScrollView style={styles.detailContainer}>
          <View style={styles.monthCircleContainer}>
            <View style={styles.monthCircle}>
              <View style={styles.monthCircleInner}>
                <Text style={styles.monthNumber}>
                  {inputData.baby_age || inputData.babyAge || formData.babyAge || 'N/A'}
                </Text>
                <Text style={styles.monthLabel}>Months</Text>
              </View>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.detailTabScrollContainer}
            contentContainerStyle={styles.detailTabContainer}
          >
            <TouchableOpacity 
              style={detailTab === 'development' ? styles.detailTabActive : styles.detailTab}
              onPress={() => setDetailTab('development')}
            >
              <Text style={detailTab === 'development' ? styles.detailTabTextActive : styles.detailTabText}>
                Development
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'nutrition' ? styles.detailTabActive : styles.detailTab}
              onPress={() => setDetailTab('nutrition')}
            >
              <Text style={detailTab === 'nutrition' ? styles.detailTabTextActive : styles.detailTabText}>
                Nutrition
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'activities' ? styles.detailTabActive : styles.detailTab}
              onPress={() => setDetailTab('activities')}
            >
              <Text style={detailTab === 'activities' ? styles.detailTabTextActive : styles.detailTabText}>
                Activities
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'sleep' ? styles.detailTabActive : styles.detailTab}
              onPress={() => setDetailTab('sleep')}
            >
              <Text style={detailTab === 'sleep' ? styles.detailTabTextActive : styles.detailTabText}>
                Sleep
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'health' ? styles.detailTabActive : styles.detailTab}
              onPress={() => setDetailTab('health')}
            >
              <Text style={detailTab === 'health' ? styles.detailTabTextActive : styles.detailTabText}>
                Health
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {detailTab === 'development' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>👶 Developmental Milestones</Text>
              <Text style={styles.cardText}>
                {sections.development || 'No developmental information available'}
              </Text>
            </View>
          )}

          {detailTab === 'nutrition' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🍼 Nutrition & Feeding</Text>
              <Text style={styles.cardText}>
                {sections.nutrition || 'No nutrition information available'}
              </Text>
            </View>
          )}

          {detailTab === 'activities' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🎨 Activities & Stimulation</Text>
              <Text style={styles.cardText}>
                {sections.activities || 'No activities information available'}
              </Text>
            </View>
          )}

          {detailTab === 'sleep' && (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>😴 Sleep Patterns</Text>
                <Text style={styles.cardText}>
                  {sections.sleep || 'No sleep information available'}
                </Text>
              </View>
              {sections.parentTips && (
                <View style={styles.infoCard}>
                  <Text style={styles.sectionTitle}>💡 Parent Tips</Text>
                  <Text style={styles.cardText}>{sections.parentTips}</Text>
                </View>
              )}
            </>
          )}

          {detailTab === 'health' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🏥 Health & Safety</Text>
              <Text style={styles.cardText}>
                {sections.health || 'No health & safety information available'}
              </Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>📋 Baby Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{inputData.baby_age || inputData.babyAge || formData.babyAge || 'N/A'} months</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height:</Text>
              <Text style={styles.infoValue}>{inputData.height || formData.height || 'N/A'} cm</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight:</Text>
              <Text style={styles.infoValue}>{inputData.weight || formData.weight || 'N/A'} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Feeding:</Text>
              <Text style={styles.infoValue}>{inputData.feeding_type || inputData.feedingType || formData.feedingType || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Development:</Text>
              <Text style={styles.infoValue}>{inputData.development_stage || inputData.developmentStage || formData.developmentStage || 'N/A'}</Text>
            </View>
            {(inputData.sleep_pattern || inputData.sleepPattern || formData.sleepPattern) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sleep Pattern:</Text>
                <Text style={styles.infoValue}>{inputData.sleep_pattern || inputData.sleepPattern || formData.sleepPattern}</Text>
              </View>
            )}
            {(inputData.health_condition || inputData.healthCondition || formData.healthCondition) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Condition:</Text>
                <Text style={styles.infoValue}>{inputData.health_condition || inputData.healthCondition || formData.healthCondition}</Text>
              </View>
            )}
            {(inputData.symptoms || formData.symptoms) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Symptoms:</Text>
                <Text style={styles.infoValue}>{inputData.symptoms || formData.symptoms}</Text>
              </View>
            )}
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
          <Text style={styles.headerTitle}>Baby Care</Text>
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
              Reports
            </Text>
            {activeTab === 'history' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>

        {activeTab === 'generate' ? (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* White Card Container */}
            <View style={styles.formCard}>
              <View style={styles.formCardGradient}>
                {/* Add Details Section */}
                <Text style={styles.sectionTitle}>Add Details</Text>

                <View style={styles.fullInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Baby Age"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.babyAge}
                    onChangeText={(value) => handleInputChange('babyAge', value)}
                  />
                </View>

                <View style={styles.fullInput}>
                  <CustomPicker
                    selectedValue={formData.feedingType}
                    onValueChange={(value) => handleInputChange('feedingType', value)}
                    items={feedingOptions}
                    placeholder="Feeding Type"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder="Weight"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.weight}
                      onChangeText={(value) => handleInputChange('weight', value)}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder="Height"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.height}
                      onChangeText={(value) => handleInputChange('height', value)}
                    />
                  </View>
                </View>

                <View style={styles.fullInput}>
                  <CustomPicker
                    selectedValue={formData.developmentStage}
                    onValueChange={(value) => handleInputChange('developmentStage', value)}
                    items={developmentOptions}
                    placeholder="Development Stage"
                  />
                </View>

                <View style={styles.fullInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Sleep Pattern (e.g. 12 hrs a day)"
                    placeholderTextColor="#999"
                    value={formData.sleepPattern}
                    onChangeText={(value) => handleInputChange('sleepPattern', value)}
                  />
                </View>

                <View style={styles.fullInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Health Condition (if any)"
                    placeholderTextColor="#999"
                    value={formData.healthCondition}
                    onChangeText={(value) => handleInputChange('healthCondition', value)}
                  />
                </View>

                <View style={styles.fullInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Symptoms (if any)"
                    placeholderTextColor="#999"
                    value={formData.symptoms}
                    onChangeText={(value) => handleInputChange('symptoms', value)}
                  />
                </View>
              </View>
            </View>

            {/* Generate Report Button */}
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={generateRecommendation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.analyzeButtonText}>Generate report</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : (
          renderHistoryTab()
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
    borderWidth: 0.86,
    borderColor: 'rgba(233, 233, 233, 1)',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 14,
    color: '#000',
  },
  customPickerButton: {
    backgroundColor: '#FFF',
    borderWidth: 0.86,
    borderColor: 'rgba(233, 233, 233, 1)',
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
  reportsScroll: {
    flex: 1,
    paddingHorizontal: 16,
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
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  actionModalButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  actionModalButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  actionModalDeleteText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '400',
  },
  actionModalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  detailContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  monthCircleContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  monthCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EEF0F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#9C27B0',
    borderTopColor: '#EEF0F8',
    borderLeftColor: '#EEF0F8',
  },
  monthCircleInner: {
    alignItems: 'center',
  },
  monthNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333333',
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
    marginTop: 4,
  },
  detailTabScrollContainer: {
    marginBottom: 20,
  },
  detailTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  detailTab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailTabActive: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C27B0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  detailTabText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  detailTabTextActive: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
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
  cardText: {
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
});

export default BabyScreen;