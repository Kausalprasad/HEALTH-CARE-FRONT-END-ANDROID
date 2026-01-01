import React, { useState, useEffect, useMemo } from 'react';
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
import { BASE_URL } from '../../config/config';
import { useTranslation } from 'react-i18next';

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

const PregnancyScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    pregnancyMonth: '',
    height: '',
    weight: '',
    dietType: '',
    activityLevel: '',
    healthCondition: '',
    symptoms: '',
  });

  const dietOptions = useMemo(() => [
    { label: t('pregnancy.dietOptions.vegetarian'), value: 'Vegetarian' },
    { label: t('pregnancy.dietOptions.nonVegetarian'), value: 'Non-Vegetarian' },
    { label: t('pregnancy.dietOptions.vegan'), value: 'Vegan' },
    { label: t('pregnancy.dietOptions.pescatarian'), value: 'Pescatarian' },
  ], [t]);

  const activityOptions = useMemo(() => [
    { label: t('pregnancy.activityOptions.sedentary'), value: 'Sedentary' },
    { label: t('pregnancy.activityOptions.light'), value: 'Light' },
    { label: t('pregnancy.activityOptions.moderate'), value: 'Moderate' },
    { label: t('pregnancy.activityOptions.active'), value: 'Active' },
    { label: t('pregnancy.activityOptions.veryActive'), value: 'Very Active' },
  ], [t]);

  const [loading, setLoading] = useState(false);
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const [loadingSavedRecommendations, setLoadingSavedRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [userToken, setUserToken] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [detailTab, setDetailTab] = useState('health');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState(null);

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
      const response = await fetch(`${BASE_URL}/api/pregnancy/recommendations`, {
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
        Alert.alert(t('common.error'), data.error || t('pregnancy.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching saved recommendations:', error);
      Alert.alert(t('common.error'), t('pregnancy.errors.connectFailed'));
    } finally {
      setLoadingSavedRecommendations(false);
    }
  };

  const deleteSavedRecommendation = async (recommendationId) => {
    if (!userToken) return;

    Alert.alert(
      t('pregnancy.deleteAction'),
      t('pregnancy.errors.deleteConfirm'),
      [
        { text: t('common.cancel'), onPress: () => {} },
        {
          text: t('pregnancy.deleteAction'),
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/api/pregnancy/recommendations/${recommendationId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`,
                },
              });

              const data = await response.json();
              if (response.ok) {
                Alert.alert(t('common.success'), t('pregnancy.errors.deleteSuccess'));
                fetchSavedRecommendations();
              } else {
                Alert.alert(t('common.error'), data.error || t('pregnancy.errors.deleteFailed'));
              }
            } catch (error) {
              console.error('Error deleting recommendation:', error);
              Alert.alert(t('common.error'), t('pregnancy.errors.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  const viewSavedRecommendation = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setDetailTab('health');
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateRecommendation = async () => {
    if (!formData.age || !formData.pregnancyMonth || !formData.height || !formData.weight) {
      Alert.alert(t('common.error'), t('pregnancy.errors.fillRequired'));
      return;
    }

    const age = parseInt(formData.age);
    const pregnancyMonth = parseInt(formData.pregnancyMonth);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    if (isNaN(age) || isNaN(pregnancyMonth) || isNaN(height) || isNaN(weight) || 
        age <= 0 || pregnancyMonth <= 0 || pregnancyMonth > 9 || height <= 0 || weight <= 0) {
      Alert.alert(t('common.error'), t('pregnancy.errors.invalidInput'));
      return;
    }

    if (!userToken) {
      Alert.alert(t('common.error'), t('pregnancy.errors.notAuthenticated'));
      return;
    }

    setLoading(true);

    const requestData = {
      age,
      pregnancy_month: pregnancyMonth,
      height,
      weight,
      diet_type: formData.dietType,
      activity_level: formData.activityLevel,
      health_condition: formData.healthCondition,
      symptoms: formData.symptoms,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(`${BASE_URL}/api/pregnancy/recommend`, {
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
        Alert.alert(t('common.success'), t('pregnancy.errors.generatedSuccess'));
        // Refresh history if on history tab
        if (activeTab === 'history') {
          fetchSavedRecommendations();
        }
      } else {
        Alert.alert(t('common.error'), data.error || t('pregnancy.errors.generateFailed'));
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.name === 'AbortError') {
        Alert.alert(t('common.error'), t('pregnancy.errors.timeout'));
      } else {
        Alert.alert(t('common.error'), t('pregnancy.errors.connectionError'));
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
      health: '',
      nutrition: '',
      activity: '',
      fetalDev: ''
    };

    const headerPattern = /###\s*\d*\.?\s*(.*?)\n([\s\S]*?)(?=###|\z)/g;
    let matches = textContent.matchAll(headerPattern);
    
    for (let match of matches) {
      const header = match[1].toLowerCase().trim();
      const content = match[2].trim();
      
      if (header.includes('maternal') || header.includes('health')) {
        sections.health = content;
      } else if (header.includes('nutrition') || header.includes('diet')) {
        sections.nutrition = content;
      } else if (header.includes('physical') || header.includes('activity') || header.includes('exercise')) {
        sections.activity = content;
      } else if (header.includes('fetal') || header.includes('baby') || header.includes('development')) {
        sections.fetalDev = content;
      }
    }

    if (!sections.health && !sections.nutrition && !sections.activity && !sections.fetalDev) {
      const lines = textContent.split('\n');
      let currentSection = 'health';
      let sectionContent = [];

      lines.forEach(line => {
        const lowerLine = line.toLowerCase().trim();
        
        if (lowerLine.includes('maternal') || (lowerLine.includes('health') && !lowerLine.includes('unhealthy'))) {
          if (sectionContent.length > 0) {
            sections[currentSection] = sectionContent.join('\n').trim();
            sectionContent = [];
          }
          currentSection = 'health';
          if (!line.startsWith('###') && !line.startsWith('##')) {
            sectionContent.push(line);
          }
        } else if (lowerLine.includes('nutrition') || lowerLine.includes('diet')) {
          if (sectionContent.length > 0) {
            sections[currentSection] = sectionContent.join('\n').trim();
            sectionContent = [];
          }
          currentSection = 'nutrition';
          if (!line.startsWith('###') && !line.startsWith('##')) {
            sectionContent.push(line);
          }
        } else if (lowerLine.includes('physical') || lowerLine.includes('activity') || lowerLine.includes('exercise')) {
          if (sectionContent.length > 0) {
            sections[currentSection] = sectionContent.join('\n').trim();
            sectionContent = [];
          }
          currentSection = 'activity';
          if (!line.startsWith('###') && !line.startsWith('##')) {
            sectionContent.push(line);
          }
        } else if (lowerLine.includes('fetal') || (lowerLine.includes('baby') && lowerLine.includes('development'))) {
          if (sectionContent.length > 0) {
            sections[currentSection] = sectionContent.join('\n').trim();
            sectionContent = [];
          }
          currentSection = 'fetalDev';
          if (!line.startsWith('###') && !line.startsWith('##')) {
            sectionContent.push(line);
          }
        } else if (line.trim() && !line.startsWith('###') && !line.startsWith('##')) {
          sectionContent.push(line);
        }
      });

      if (sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }
    }

    if (!sections.health && !sections.nutrition && !sections.activity && !sections.fetalDev) {
      sections.health = textContent;
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
              {t('pregnancy.title').toUpperCase()}
            </Text>
            <Text style={styles.savedRecommendationDate}>
              {new Date(item.createdAt).toLocaleDateString('en-GB')}
            </Text>
          </View>
          <View style={styles.savedRecommendationRight}>
            <Text style={styles.savedRecommendationMonth}>
              {inputData.pregnancy_month || inputData.pregnancyMonth || 'N/A'}
            </Text>
            <Text style={styles.savedRecommendationMonthText}>{t('pregnancy.month')}</Text>
          </View>
        </View>
        
        <View style={styles.savedRecommendationActions}>
          <TouchableOpacity 
            style={styles.savedViewButton}
            onPress={() => viewSavedRecommendation(item)}
          >
            <Text style={styles.savedViewButtonText}>{t('pregnancy.view')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.savedDeleteButton}
            onPress={() => deleteSavedRecommendation(item._id)}
          >
            <Text style={styles.savedDeleteButtonText}>{t('pregnancy.delete')}</Text>
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
          <Text style={styles.emptyText}>{t('pregnancy.noReportsFound')}</Text>
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
                    <Text style={styles.reportTitle}>{t('pregnancy.title')}</Text>
                    <Text style={styles.reportSize}>
                      {new Date(item.createdAt).toLocaleDateString('en-GB')}
                    </Text>
                  </View>
                </View>
                <View style={styles.reportRight}>
                  <Text style={styles.reportRisk}>
                    {inputData.pregnancy_month || inputData.pregnancyMonth || 'N/A'}
                  </Text>
                  <Text style={styles.reportRiskLabel}>{t('pregnancy.Month')}</Text>
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
              <Text style={styles.actionModalButtonText}>{t('pregnancy.viewAction')}</Text>
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
              <Text style={styles.actionModalDeleteText}>{t('pregnancy.deleteAction')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  // Detail View (600-line UI style)
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
            <Text style={styles.headerTitle}>{t('pregnancy.title')}</Text>
            <View style={styles.headerPlaceholder} />
          </View>

        <ScrollView style={styles.detailContainer}>
          <View style={styles.monthCircleContainer}>
            <View style={styles.monthCircle}>
              <View style={styles.monthCircleInner}>
                <Text style={styles.monthNumber}>
                  {inputData.pregnancy_month || inputData.pregnancyMonth || formData.pregnancyMonth || 'N/A'}
                </Text>
                <Text style={styles.monthLabel}>{t('pregnancy.Month')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailTabContainer}>
            <TouchableOpacity 
              style={detailTab === 'health' ? styles.detailTabActive : styles.detailTab}
              onPress={() => setDetailTab('health')}
            >
              <Text style={detailTab === 'health' ? styles.detailTabTextActive : styles.detailTabText}>
                {t('pregnancy.health')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'nutrition' ? styles.detailTabActive : styles.detailTab}
              onPress={() => setDetailTab('nutrition')}
            >
              <Text style={detailTab === 'nutrition' ? styles.detailTabTextActive : styles.detailTabText}>
                {t('pregnancy.nutrition')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'activity' ? styles.detailTabActive : styles.detailTab}
              onPress={() => setDetailTab('activity')}
            >
              <Text style={detailTab === 'activity' ? styles.detailTabTextActive : styles.detailTabText}>
                {t('pregnancy.activity')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'fetalDev' ? styles.detailTabActive : styles.detailTab}
              onPress={() => setDetailTab('fetalDev')}
            >
              <Text style={detailTab === 'fetalDev' ? styles.detailTabTextActive : styles.detailTabText}>
                {t('pregnancy.fetalDev')}
              </Text>
            </TouchableOpacity>
          </View>

          {detailTab === 'health' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🏥 {t('pregnancy.healthRecommendations')}</Text>
              <Text style={styles.cardText}>
                {sections.health || t('pregnancy.noHealthInfo')}
              </Text>
            </View>
          )}

          {detailTab === 'nutrition' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🥗 {t('pregnancy.nutritionGuidelines')}</Text>
              <Text style={styles.cardText}>
                {sections.nutrition || t('pregnancy.noNutritionInfo')}
              </Text>
            </View>
          )}

          {detailTab === 'activity' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🏃‍♀️ {t('pregnancy.activityRecommendations')}</Text>
              <Text style={styles.cardText}>
                {sections.activity || t('pregnancy.noActivityInfo')}
              </Text>
            </View>
          )}

          {detailTab === 'fetalDev' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>👶 {t('pregnancy.fetalDevelopment')}</Text>
              <Text style={styles.cardText}>
                {sections.fetalDev || t('pregnancy.noFetalInfo')}
              </Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>📋 {t('pregnancy.yourInformation')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('pregnancy.ageLabel')}</Text>
              <Text style={styles.infoValue}>{inputData.age || formData.age || 'N/A'} {t('pregnancy.years')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('pregnancy.heightLabel')}</Text>
              <Text style={styles.infoValue}>{inputData.height || formData.height || 'N/A'} {t('pregnancy.cm')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('pregnancy.weightLabel')}</Text>
              <Text style={styles.infoValue}>{inputData.weight || formData.weight || 'N/A'} {t('pregnancy.kg')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('pregnancy.dietLabel')}</Text>
              <Text style={styles.infoValue}>{inputData.diet_type || inputData.dietType || formData.dietType || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('pregnancy.activityLabel')}</Text>
              <Text style={styles.infoValue}>{inputData.activity_level || inputData.activityLevel || formData.activityLevel || 'N/A'}</Text>
            </View>
            {(inputData.health_condition || inputData.healthCondition || formData.healthCondition) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('pregnancy.conditionLabel')}</Text>
                <Text style={styles.infoValue}>{inputData.health_condition || inputData.healthCondition || formData.healthCondition}</Text>
              </View>
            )}
            {(inputData.symptoms || formData.symptoms) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('pregnancy.symptomsLabel')}</Text>
                <Text style={styles.infoValue}>{inputData.symptoms || formData.symptoms}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
    );
  }

  // Main View (900-line functionality with 600-line UI style)
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
          <Text style={styles.headerTitle}>{t('pregnancy.title')}</Text>
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
              {t('pregnancy.generate')}
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
              {t('pregnancy.myReports')}
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
                <Text style={styles.sectionTitle}>{t('pregnancy.addDetails')}</Text>

                <View style={styles.fullInput}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('pregnancy.name')}
                    placeholderTextColor="#999"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('pregnancy.age')}
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.age}
                      onChangeText={(value) => handleInputChange('age', value)}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('pregnancy.pregnancyMonth')}
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.pregnancyMonth}
                      onChangeText={(value) => handleInputChange('pregnancyMonth', value)}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('pregnancy.weight')}
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.weight}
                      onChangeText={(value) => handleInputChange('weight', value)}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('pregnancy.height')}
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={formData.height}
                      onChangeText={(value) => handleInputChange('height', value)}
                    />
                  </View>
                </View>

                <View style={styles.fullInput}>
                  <CustomPicker
                    selectedValue={formData.dietType}
                    onValueChange={(value) => handleInputChange('dietType', value)}
                    items={dietOptions}
                    placeholder={t('pregnancy.preference')}
                  />
                </View>

                <View style={styles.fullInput}>
                  <CustomPicker
                    selectedValue={formData.activityLevel}
                    onValueChange={(value) => handleInputChange('activityLevel', value)}
                    items={activityOptions}
                    placeholder={t('pregnancy.activityLevel')}
                  />
                </View>

                <View style={styles.fullInput}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('pregnancy.healthCondition')}
                    placeholderTextColor="#999"
                    value={formData.healthCondition}
                    onChangeText={(value) => handleInputChange('healthCondition', value)}
                  />
                </View>

                <View style={styles.fullInput}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('pregnancy.symptoms')}
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
                <Text style={styles.analyzeButtonText}>{t('pregnancy.generateReport')}</Text>
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
  detailContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  detailTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailTabActive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  detailTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailTabTextActive: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
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

export default PregnancyScreen;