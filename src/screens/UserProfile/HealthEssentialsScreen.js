import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { BASE_URL } from '../../config/config';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const HealthEssentialsScreen = ({ navigation, route }) => {
  const { params } = route;
  const isEdit = params?.isEdit || false;
  const profileData = params?.profileData || null;
  const auth = getAuth();

  const [bloodGroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && profileData) {
      setBloodGroup(profileData.healthEssentials?.bloodGroup || '');
      setHeight(profileData.healthEssentials?.height || '');
      setWeight(profileData.healthEssentials?.weight ? String(profileData.healthEssentials.weight) : '');
    }
  }, [isEdit, profileData]);

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const token = await user.getIdToken();

      // Use new endpoint for health essentials
      const endpoint = `${BASE_URL}/api/profile/health-essentials`;
      const payload = {};
      if (height && height.trim()) payload.height = height.trim();
      if (weight && weight.trim()) {
        // Convert weight string to number
        const weightNum = parseFloat(weight.trim());
        if (!isNaN(weightNum)) {
          payload.weight = weightNum;
        }
      }
      if (bloodGroup) payload.bloodGroup = bloodGroup;

      if (Object.keys(payload).length === 0) {
        Alert.alert('Info', 'Please fill at least one field to update');
        return;
      }

      console.log('Sending health essentials payload:', payload);

      let response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // If profile doesn't exist (404), create it first
      if (response.status === 404) {
        console.log('Profile not found, creating profile first...');
        
        const createPayload = {
          fullName: user.displayName || 'User',
          dateOfBirth: new Date().toISOString().split('T')[0], // Today's date as placeholder
          gender: 'Male', // Default
          bloodGroup: payload.bloodGroup || 'O+',
          primaryPhone: user.phoneNumber || '',
          email: user.email || '',
        };

        const createResponse = await fetch(`${BASE_URL}/api/profile/step1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createPayload),
        });

        if (createResponse.ok) {
          console.log('Profile created, now updating health essentials...');
          // Try PUT again after profile creation
          response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
        } else {
          const errorData = await createResponse.json().catch(() => ({ message: 'Network error' }));
          Alert.alert('Error', errorData.message || errorData.error || 'Failed to create profile. Please complete Personal Information first.');
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        Alert.alert('Error', errorData.message || errorData.error || `Server error: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.success || response.status === 200) {
        Alert.alert('Success', 'Health essentials updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert('Error', data.message || data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Health Essentials error:', err);
      Alert.alert('Error', err.message || 'Network error. Please check your connection.');
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#FFE5B4', '#FFD4A3', '#E8F4F8', '#D4E8F0', '#C8D4F0']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Essentials</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* White Card */}
        <View style={styles.whiteCard}>
          {/* Blood Group */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Blood Group</Text>
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={() => setShowBloodGroupDropdown(!showBloodGroupDropdown)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !bloodGroup && styles.placeholderText]}>
                {bloodGroup || 'Blood Group'}
              </Text>
              <Ionicons 
                name={showBloodGroupDropdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
            {showBloodGroupDropdown && (
              <View style={styles.dropdownMenu}>
                {bloodGroupOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setBloodGroup(option);
                      setShowBloodGroupDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Height */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Height</Text>
            <TextInput
              style={styles.textInput}
              value={height}
              onChangeText={setHeight}
              placeholder="5'10"
              placeholderTextColor="#999"
            />
          </View>

          {/* Weight */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Weight</Text>
            <TextInput
              style={styles.textInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="69"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 15,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 15,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default HealthEssentialsScreen;

