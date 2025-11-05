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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../config/config';

const PregnancyScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    age: '',
    pregnancyMonth: '',
    height: '',
    weight: '',
    dietType: 'Vegetarian',
    activityLevel: 'Moderate',
    healthCondition: '',
    symptoms: '',
  });

  const [loading, setLoading] = useState(false);
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const [loadingSavedRecommendations, setLoadingSavedRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [userToken, setUserToken] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [detailTab, setDetailTab] = useState('health');

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
              const response = await fetch(`${BASE_URL}/api/pregnancy/recommendations/${recommendationId}`, {
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
    setDetailTab('health');
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateRecommendation = async () => {
    if (!formData.age || !formData.pregnancyMonth || !formData.height || !formData.weight) {
      Alert.alert('Error', 'Please fill in age, pregnancy month, height, and weight');
      return;
    }

    const age = parseInt(formData.age);
    const pregnancyMonth = parseInt(formData.pregnancyMonth);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    if (isNaN(age) || isNaN(pregnancyMonth) || isNaN(height) || isNaN(weight) || 
        age <= 0 || pregnancyMonth <= 0 || pregnancyMonth > 9 || height <= 0 || weight <= 0) {
      Alert.alert('Error', 'Please enter valid age, pregnancy month (1-9), height, and weight');
      return;
    }

    if (!userToken) {
      Alert.alert('Error', 'User not authenticated');
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
              PREGNANCY CARE
            </Text>
            <Text style={styles.savedRecommendationDate}>
              {new Date(item.createdAt).toLocaleDateString('en-GB')}
            </Text>
          </View>
          <View style={styles.savedRecommendationRight}>
            <Text style={styles.savedRecommendationMonth}>
              {inputData.pregnancy_month || inputData.pregnancyMonth || 'N/A'}
            </Text>
            <Text style={styles.savedRecommendationMonthText}>month</Text>
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
          <Text style={styles.emptyText}>Generate your first pregnancy recommendation to see it here</Text>
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

  // Detail View (600-line UI style)
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
          <Text style={styles.headerTitle}>Pregnancy Care</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.detailContainer}>
          <View style={styles.monthCircleContainer}>
            <View style={styles.monthCircle}>
              <View style={styles.monthCircleInner}>
                <Text style={styles.monthNumber}>
                  {inputData.pregnancy_month || inputData.pregnancyMonth || formData.pregnancyMonth || 'N/A'}
                </Text>
                <Text style={styles.monthLabel}>Month</Text>
              </View>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={detailTab === 'health' ? styles.tabActive : styles.tab}
              onPress={() => setDetailTab('health')}
            >
              <Text style={detailTab === 'health' ? styles.tabTextActive : styles.tabText}>
                Health
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
              style={detailTab === 'activity' ? styles.tabActive : styles.tab}
              onPress={() => setDetailTab('activity')}
            >
              <Text style={detailTab === 'activity' ? styles.tabTextActive : styles.tabText}>
                Activity
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={detailTab === 'fetalDev' ? styles.tabActive : styles.tab}
              onPress={() => setDetailTab('fetalDev')}
            >
              <Text style={detailTab === 'fetalDev' ? styles.tabTextActive : styles.tabText}>
                Fetal Dev
              </Text>
            </TouchableOpacity>
          </View>

          {detailTab === 'health' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🏥 Health Recommendations</Text>
              <Text style={styles.cardText}>
                {sections.health || 'No health information available'}
              </Text>
            </View>
          )}

          {detailTab === 'nutrition' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🥗 Nutrition Guidelines</Text>
              <Text style={styles.cardText}>
                {sections.nutrition || 'No nutrition information available'}
              </Text>
            </View>
          )}

          {detailTab === 'activity' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🏃‍♀️ Activity Recommendations</Text>
              <Text style={styles.cardText}>
                {sections.activity || 'No activity information available'}
              </Text>
            </View>
          )}

          {detailTab === 'fetalDev' && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>👶 Fetal Development</Text>
              <Text style={styles.cardText}>
                {sections.fetalDev || 'No fetal development information available'}
              </Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>📋 Your Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{inputData.age || formData.age || 'N/A'} years</Text>
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
              <Text style={styles.infoLabel}>Diet:</Text>
              <Text style={styles.infoValue}>{inputData.diet_type || inputData.dietType || formData.dietType || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Activity:</Text>
              <Text style={styles.infoValue}>{inputData.activity_level || inputData.activityLevel || formData.activityLevel || 'N/A'}</Text>
            </View>
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

  // Main View (900-line functionality with 600-line UI style)
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
        <Text style={styles.headerTitle}>Pregnancy Care</Text>
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
                placeholder="Your Age"
                placeholderTextColor="#B0B0B0"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
              />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputHalf}
                placeholder="Pregnancy Month"
                placeholderTextColor="#B0B0B0"
                keyboardType="numeric"
                value={formData.pregnancyMonth}
                onChangeText={(value) => handleInputChange('pregnancyMonth', value)}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputHalf}
                placeholder="Height (cm)"
                placeholderTextColor="#B0B0B0"
                keyboardType="numeric"
                value={formData.height}
                onChangeText={(value) => handleInputChange('height', value)}
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

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.dietType}
              onValueChange={(value) => handleInputChange('dietType', value)}
              style={styles.picker}
            >
              <Picker.Item label="Diet Type" value="" color="#B0B0B0" />
              <Picker.Item label="Vegetarian" value="Vegetarian" />
              <Picker.Item label="Non-Vegetarian" value="Non-Vegetarian" />
              <Picker.Item label="Vegan" value="Vegan" />
              <Picker.Item label="Pescatarian" value="Pescatarian" />
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.activityLevel}
              onValueChange={(value) => handleInputChange('activityLevel', value)}
              style={styles.picker}
            >
              <Picker.Item label="Activity Level" value="" color="#B0B0B0" />
              <Picker.Item label="Sedentary" value="Sedentary" />
              <Picker.Item label="Light" value="Light" />
              <Picker.Item label="Moderate" value="Moderate" />
              <Picker.Item label="Active" value="Active" />
              <Picker.Item label="Very Active" value="Very Active" />
            </Picker>
          </View>

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
  backButtonText: {
    fontSize: 26,
    color: '#000000',
    fontWeight: '300',
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

export default PregnancyScreen;