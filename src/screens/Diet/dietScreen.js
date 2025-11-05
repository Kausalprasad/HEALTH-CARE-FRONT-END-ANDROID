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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const DietScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
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

  const SavedDietItem = ({ item }) => {
    const formatGoal = (goal) => {
      if (!goal) return 'Diet Plan';
      return goal
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return (
      <View style={styles.savedDietCard}>
        <View style={styles.savedDietHeader}>
          <View style={styles.savedDietLeft}>
            <Text style={styles.savedDietGoal}>
              {formatGoal(item.user_profile?.goal || item.goal).toUpperCase()}
            </Text>
            <Text style={styles.savedDietDate}>
              {new Date(item.createdAt || item.generated_at).toLocaleDateString('en-GB')}
            </Text>
          </View>
          <View style={styles.savedDietRight}>
            <Text style={styles.savedDietCalories}>
              {item.user_profile?.target_calories || '1500'}
            </Text>
            <Text style={styles.savedDietCalText}>cal/day</Text>
          </View>
        </View>
        
        <View style={styles.savedDietActions}>
          <TouchableOpacity 
            style={styles.savedViewButton}
            onPress={() => viewSavedDiet(item)}
          >
            <Text style={styles.savedViewButtonText}>view</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.savedDeleteButton}
            onPress={() => deleteSavedDiet(item._id)}
          >
            <Text style={styles.savedDeleteButtonText}>delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHistoryTab = () => (
    <View style={styles.container}>
      {loadingSavedDiets ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C6FDC" />
          <Text style={styles.loadingText}>Loading your diet plans...</Text>
        </View>
      ) : savedDiets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Diet Plans Yet</Text>
          <Text style={styles.emptyText}>Generate your first diet plan to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={savedDiets}
          renderItem={({ item }) => <SavedDietItem item={item} />}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.historyListContent}
          scrollEnabled={true}
        />
      )}
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
          <Text style={styles.headerTitle}>Diet Plan</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'generate' && styles.activeTab]}
          onPress={() => setActiveTab('generate')}
        >
          <Text style={[styles.tabText, activeTab === 'generate' && styles.activeTabText]}>
            Generate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            My Plans
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'generate' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Height (cm)"
                  keyboardType="numeric"
                  value={formData.height}
                  onChangeText={(value) => handleInputChange('height', value)}
                  placeholderTextColor="#BDBDBD"
                />
              </View>
              <View style={styles.inputHalf}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Weight (kg)"
                  keyboardType="numeric"
                  value={formData.weight}
                  onChangeText={(value) => handleInputChange('weight', value)}
                  placeholderTextColor="#BDBDBD"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Age"
                  keyboardType="numeric"
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  placeholderTextColor="#BDBDBD"
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

            <View style={styles.dropdownContainer}>
              <CustomPicker
                selectedValue={formData.region}
                onValueChange={(value) => handleInputChange('region', value)}
                items={regionOptions}
                placeholder="Region"
              />
            </View>

            <View style={styles.dropdownContainer}>
              <CustomPicker
                selectedValue={formData.goal}
                onValueChange={(value) => handleInputChange('goal', value)}
                items={goalOptions}
                placeholder="Goal"
              />
            </View>

            <View style={styles.dropdownContainer}>
              <CustomPicker
                selectedValue={formData.food_preference}
                onValueChange={(value) => handleInputChange('food_preference', value)}
                items={foodPreferenceOptions}
                placeholder="Food Preference"
              />
            </View>

            <View style={styles.dropdownContainer}>
              <CustomPicker
                selectedValue={formData.activity_level}
                onValueChange={(value) => handleInputChange('activity_level', value)}
                items={activityLevelOptions}
                placeholder="Activity Level"
              />
            </View>

            <View style={styles.dropdownContainer}>
              <CustomPicker
                selectedValue={formData.budget_category}
                onValueChange={(value) => handleInputChange('budget_category', value)}
                items={budgetOptions}
                placeholder="Budget"
              />
            </View>

            <View style={styles.dropdownContainer}>
              <CustomPicker
                selectedValue={formData.cooking_time_available}
                onValueChange={(value) => handleInputChange('cooking_time_available', value)}
                items={cookingTimeOptions}
                placeholder="Cooking Time"
              />
            </View>

            <View style={styles.dropdownContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Medical Condition (optional)"
                value={formData.medical_conditions}
                onChangeText={(value) => handleInputChange('medical_conditions', value)}
                placeholderTextColor="#BDBDBD"
              />
            </View>

            <View style={styles.dropdownContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Allergies (optional)"
                value={formData.allergies}
                onChangeText={(value) => handleInputChange('allergies', value)}
                placeholderTextColor="#BDBDBD"
              />
            </View>

            <TouchableOpacity
              style={[styles.generateButton, loading && styles.buttonDisabled]}
              onPress={generateDietPlan}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.generateButtonText}>Generate</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        renderHistoryTab()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#000000',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerPlaceholder: {
    width: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#7C6FDC',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9E9E9E',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputField: {
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
  generateButton: {
    backgroundColor: '#7C6FDC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#B8B0E8',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  savedDietCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  savedDietHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savedDietLeft: {
    flex: 1,
  },
  savedDietGoal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C6FDC',
    letterSpacing: 0.5,
  },
  savedDietDate: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  savedDietRight: {
    alignItems: 'flex-end',
  },
  savedDietCalories: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  savedDietCalText: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
  savedDietActions: {
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
});

export default DietScreen;