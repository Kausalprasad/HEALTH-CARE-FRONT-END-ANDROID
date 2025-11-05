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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../config/config';

const BabyScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    babyAge: '',
    weight: '',
    height: '',
    feedingType: 'Breastfeeding',
    developmentStage: 'Normal',
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

  const feedingTypes = ['Breastfeeding', 'Formula', 'Mixed', 'Solid Foods'];
  const developmentStages = ['Normal', 'Advanced', 'Delayed', 'Needs Assessment'];

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
    <View style={styles.container}>
      {loadingSavedRecommendations ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B8DBD" />
          <Text style={styles.loadingText}>Loading your recommendations...</Text>
        </View>
      ) : savedRecommendations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👶</Text>
          <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
          <Text style={styles.emptyText}>Generate your first baby care recommendation to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={savedRecommendations}
          renderItem={({ item }) => <SavedRecommendationItem item={item} />}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.historyListContent}
          scrollEnabled={true}
        />
      )}
    </View>
  );

  // Detail View
  if (selectedRecommendation) {
    const sections = parseRecommendation(selectedRecommendation.recommendation || selectedRecommendation.recommendations);
    const inputData = selectedRecommendation.inputData || selectedRecommendation.input_data || {};
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        
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

          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={detailTab === 'development' ? styles.tabActive : styles.tab}
              onPress={() => setDetailTab('development')}
            >
              <Text style={detailTab === 'development' ? styles.tabTextActive : styles.tabText}>
                Development
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'nutrition' ? styles.tabActive : styles.tab}
              onPress={() => setDetailTab('nutrition')}
            >
              <Text style={detailTab === 'nutrition' ? styles.tabTextActive : styles.tabText}>
                Nutrition
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'activities' ? styles.tabActive : styles.tab}
              onPress={() => setDetailTab('activities')}
            >
              <Text style={detailTab === 'activities' ? styles.tabTextActive : styles.tabText}>
                Activities
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'sleep' ? styles.tabActive : styles.tab}
              onPress={() => setDetailTab('sleep')}
            >
              <Text style={detailTab === 'sleep' ? styles.tabTextActive : styles.tabText}>
                Sleep
              </Text>
            </TouchableOpacity>
          </View>

          {detailTab === 'development' && (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>👶 Developmental Milestones</Text>
                <Text style={styles.cardText}>
                  {sections.development || 'No developmental information available'}
                </Text>
              </View>
              {sections.health && (
                <View style={styles.infoCard}>
                  <Text style={styles.sectionTitle}>🏥 Health & Safety</Text>
                  <Text style={styles.cardText}>{sections.health}</Text>
                </View>
              )}
            </>
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
        <Text style={styles.headerTitle}>Baby Care</Text>
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
            My Plans
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'generate' ? (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputHalf}
                placeholder="Baby Age (months)"
                placeholderTextColor="#B0B0B0"
                keyboardType="numeric"
                value={formData.babyAge}
                onChangeText={(value) => handleInputChange('babyAge', value)}
              />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputHalf}
                placeholder="Weight (kg)"
                placeholderTextColor="#B0B0B0"
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
              />
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            placeholderTextColor="#B0B0B0"
            keyboardType="numeric"
            value={formData.height}
            onChangeText={(value) => handleInputChange('height', value)}
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.feedingType}
              onValueChange={(value) => handleInputChange('feedingType', value)}
              style={styles.picker}
            >
              <Picker.Item label="Feeding Type" value="" color="#B0B0B0" />
              {feedingTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.developmentStage}
              onValueChange={(value) => handleInputChange('developmentStage', value)}
              style={styles.picker}
            >
              <Picker.Item label="Development Stage" value="" color="#B0B0B0" />
              {developmentStages.map((stage) => (
                <Picker.Item key={stage} label={stage} value={stage} />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Sleep Pattern (e.g., 12 hours daily)"
            placeholderTextColor="#B0B0B0"
            value={formData.sleepPattern}
            onChangeText={(value) => handleInputChange('sleepPattern', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Health Condition (if any)"
            placeholderTextColor="#B0B0B0"
            value={formData.healthCondition}
            onChangeText={(value) => handleInputChange('healthCondition', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Symptoms (if any)"
            placeholderTextColor="#B0B0B0"
            value={formData.symptoms}
            onChangeText={(value) => handleInputChange('symptoms', value)}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={generateRecommendation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Get Recommendations</Text>
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
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#7B8DBD',
    elevation: 2,
    shadowColor: '#7B8DBD',
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
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputHalf: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 14,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  picker: {
    height: 52,
    color: '#333333',
  },
  submitButton: {
    backgroundColor: '#7B8DBD',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
    elevation: 3,
    shadowColor: '#7B8DBD',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  savedRecommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  savedRecommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  savedRecommendationLeft: {
    flex: 1,
  },
  savedRecommendationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7B8DBD',
    letterSpacing: 0.5,
  },
  savedRecommendationDate: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    fontWeight: '400',
  },
  savedRecommendationRight: {
    alignItems: 'flex-end',
  },
  savedRecommendationMonth: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    color: '#333333',
    lineHeight: 20,
  },
  savedRecommendationMonthText: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  savedRecommendationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savedViewButton: {
    backgroundColor: '#008080',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#008080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  savedViewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  savedDeleteButton: {
    backgroundColor: '#E53935',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  savedDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  monthCircleContainer: {
    alignItems: 'center',
    marginVertical: 28,
  },
  monthCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EEF0F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#7B8DBD',
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  tabActive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#7B8DBD',
    marginHorizontal: 3,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#7B8DBD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  tabText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  tabTextActive: {
    fontSize: 12,
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
    color: '#7B8DBD',
    marginBottom: 14,
  },
  cardText: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 22,
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

export default BabyScreen;