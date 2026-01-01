// screens/DietScreen.js
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
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from "../../config/config";

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

const DietScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    height: '',
    weight: '',
    age: '',
    sex: 'male',
    region: 'North India',
    goal: 'weight loss',
    food_preference: 'vegetarian',
    activity_level: 'moderate',
    medical_conditions: '',
    allergies: '',
    medications: '',
    budget_category: 'moderate_budget',
    cooking_time_available: 'Moderate',
  });

  const [loading, setLoading] = useState(false);
  const [savedDiets, setSavedDiets] = useState([]);
  const [loadingSavedDiets, setLoadingSavedDiets] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [userToken, setUserToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  const regionOptions = [
    { label: 'North India', value: 'North India' },
    { label: 'South India', value: 'South India' },
    { label: 'East India', value: 'East India' },
    { label: 'West India', value: 'West India' },
    { label: 'Central India', value: 'Central India' },
  ];

  const goalOptions = [
    { label: 'Weight Loss', value: 'weight loss' },
    { label: 'Muscle Building', value: 'muscle building' },
    { label: 'Weight Gain', value: 'weight gain' },
    { label: 'Maintain Weight', value: 'maintain weight' },
  ];

  const foodPreferenceOptions = [
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Non-Vegetarian', value: 'non-vegetarian' },
    { label: 'Vegetarian + Eggs', value: 'vegetarian + eggs' },
    { label: 'Vegan', value: 'vegan' },
  ];

  const activityLevelOptions = [
    { label: 'Sedentary', value: 'sedentary' },
    { label: 'Light', value: 'light' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Active', value: 'active' },
    { label: 'Very Active', value: 'very active' },
  ];

  const budgetOptions = [
    { label: 'Low Budget (₹50-100/day)', value: 'low_budget' },
    { label: 'Moderate Budget (₹100-200/day)', value: 'moderate_budget' },
    { label: 'Comfortable Budget (₹200-400/day)', value: 'comfortable_budget' },
    { label: 'Premium Budget (₹400+/day)', value: 'premium_budget' },
  ];

  const cookingTimeOptions = [
    { label: 'Minimal (15-30 min)', value: 'Minimal' },
    { label: 'Moderate (30-60 min)', value: 'Moderate' },
    { label: 'Flexible (1+ hours)', value: 'Flexible' },
  ];

  useEffect(() => {
    fetchUserToken();
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && userToken) {
      fetchSavedDiets();
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

  const fetchSavedDiets = async () => {
    if (!userToken) return;

    setLoadingSavedDiets(true);
    try {
      const response = await fetch(`${BASE_URL}/api/diet`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSavedDiets(data.diets || []);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch saved diets');
      }
    } catch (error) {
      console.error('Error fetching saved diets:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoadingSavedDiets(false);
    }
  };

  const deleteSavedDiet = async (dietId) => {
    if (!userToken) return;

    Alert.alert(
      'Delete Diet Plan',
      'Are you sure you want to delete this diet plan?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/api/diet/${dietId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`,
                },
              });

              const data = await response.json();
              if (data.success) {
                Alert.alert('Success', 'Diet plan deleted successfully');
                fetchSavedDiets();
              } else {
                Alert.alert('Error', data.error || 'Failed to delete');
              }
            } catch (error) {
              console.error('Error deleting diet:', error);
              Alert.alert('Error', 'Failed to delete diet plan');
            }
          },
        },
      ]
    );
  };

  const viewSavedDiet = (diet) => {
    navigation.navigate('DietResult', { dietPlan: diet });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateDietPlan = async () => {
    if (!formData.height || !formData.weight || !formData.age) {
      Alert.alert('Error', 'Please fill in height, weight, and age');
      return;
    }

    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const age = parseInt(formData.age);

    if (isNaN(height) || isNaN(weight) || isNaN(age) || height <= 0 || weight <= 0 || age <= 0) {
      Alert.alert('Error', 'Please enter valid height, weight, and age');
      return;
    }

    if (!userToken) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    const requestData = {
      name: formData.name || '',
      height,
      weight,
      age,
      sex: formData.sex,
      region: formData.region,
      goal: formData.goal,
      food_preference: formData.food_preference,
      activity_level: formData.activity_level,
      medical_conditions: formData.medical_conditions
        ? formData.medical_conditions.split(',').map(c => c.trim()).filter(c => c)
        : [],
      allergies: formData.allergies
        ? formData.allergies.split(',').map(a => a.trim()).filter(a => a)
        : [],
      medications: formData.medications
        ? formData.medications.split(',').map(m => m.trim()).filter(m => m)
        : [],
      budget_category: formData.budget_category,
      cooking_time_available: formData.cooking_time_available,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(`${BASE_URL}/api/diet`, {
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

      if (data.success) {
        navigation.navigate('DietResult', { dietPlan: data.diet || data });
        if (activeTab === 'history') {
          fetchSavedDiets();
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to generate diet plan');
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

  const formatGoal = (goal) => {
    if (!goal) return 'Diet Plan';
    return goal
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const groupDietsByDate = (diets) => {
    const grouped = {};
    diets.forEach(diet => {
      const date = new Date(diet.createdAt || diet.generated_at || diet.created_at);
      const dateKey = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'short' });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(diet);
    });
    return grouped;
  };

  const renderHistoryTab = () => {
    const filteredDiets = savedDiets.filter(diet => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const goal = formatGoal(diet.user_profile?.goal || diet.goal).toLowerCase();
      return goal.includes(query);
    });

    const groupedDiets = groupDietsByDate(filteredDiets);

    return (
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

        {loadingSavedDiets ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9C27B0" />
          </View>
        ) : Object.keys(groupedDiets).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Diet Plans Yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.reportsScroll} showsVerticalScrollIndicator={false}>
          {Object.entries(groupedDiets).map(([date, diets]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {diets.map((diet, index) => (
                <TouchableOpacity
                  key={diet._id || index}
                  style={styles.reportCard}
                  onPress={() => viewSavedDiet(diet)}
                >
                  <View style={styles.reportLeft}>
                    <View style={styles.reportIcon}>
                      <Ionicons name="restaurant" size={24} color="#FF9800" />
                    </View>
                    <View>
                      <Text style={styles.reportTitle}>
                        {formatGoal(diet.user_profile?.goal || diet.goal)}
                      </Text>
                      <Text style={styles.reportSize}>312 KB</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
        )}
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
          <Text style={styles.headerTitle}>Diet Plan</Text>
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
              My Plans
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
              <Text style={styles.sectionTitle}>Add Details</Text>

              <View style={styles.fullInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#999"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
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
                    selectedValue={formData.sex}
                    onValueChange={(value) => handleInputChange('sex', value)}
                    items={genderOptions}
                    placeholder="Gender"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <CustomPicker
                    selectedValue={formData.region}
                    onValueChange={(value) => handleInputChange('region', value)}
                    items={regionOptions}
                    placeholder="Region"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <CustomPicker
                    selectedValue={formData.goal}
                    onValueChange={(value) => handleInputChange('goal', value)}
                    items={goalOptions}
                    placeholder="Goal"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <CustomPicker
                    selectedValue={formData.food_preference}
                    onValueChange={(value) => handleInputChange('food_preference', value)}
                    items={foodPreferenceOptions}
                    placeholder="Preference"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <CustomPicker
                    selectedValue={formData.activity_level}
                    onValueChange={(value) => handleInputChange('activity_level', value)}
                    items={activityLevelOptions}
                    placeholder="Activity Level"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <CustomPicker
                    selectedValue={formData.budget_category}
                    onValueChange={(value) => handleInputChange('budget_category', value)}
                    items={budgetOptions}
                    placeholder="Budget"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <CustomPicker
                    selectedValue={formData.cooking_time_available}
                    onValueChange={(value) => handleInputChange('cooking_time_available', value)}
                    items={cookingTimeOptions}
                    placeholder="Available Time"
                  />
                </View>
              </View>

              <View style={styles.fullInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Medical Condition (optional)"
                  placeholderTextColor="#999"
                  value={formData.medical_conditions}
                  onChangeText={(value) => handleInputChange('medical_conditions', value)}
                />
              </View>

              <View style={styles.fullInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Allergies (optional)"
                  placeholderTextColor="#999"
                  value={formData.allergies}
                  onChangeText={(value) => handleInputChange('allergies', value)}
                />
              </View>
            </View>
          </View>

          {/* Generate Report Button */}
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={generateDietPlan}
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
  input: {
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
    color: '#000',
    fontFamily: 'Inter',
  },
  placeholderText: {
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
    fontFamily: 'Inter',
  },
  modalItemTextSelected: {
    color: '#9C27B0',
    fontWeight: '600',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Inter',
  },
  reportSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'Inter',
  },
});

export default DietScreen;