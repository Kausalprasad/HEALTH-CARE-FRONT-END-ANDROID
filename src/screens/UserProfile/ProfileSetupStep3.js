import React, { useState, useEffect, useMemo } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { BASE_URL } from '../../config/config';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { useTranslation } from 'react-i18next';

const ProfileSetupStep3 = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { params } = route;
  const isEdit = params?.isEdit || false;
  const profileData = params?.profileData || null;
  const auth = getAuth();

  const [medicalConditions, setMedicalConditions] = useState([{ conditionName: '' }]);
  const [allergies, setAllergies] = useState([{ allergenName: '', severity: 'Mild', showSeverityDropdown: false }]);
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: 'Once Daily', showFrequencyDropdown: false }]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  const frequencyOptions = useMemo(() => [
    { label: t('profile.frequencyOptions.onceDaily'), value: 'Once Daily' },
    { label: t('profile.frequencyOptions.twiceDaily'), value: 'Twice Daily' },
    { label: t('profile.frequencyOptions.threeTimesDaily'), value: 'Three Times Daily' },
    { label: t('profile.frequencyOptions.fourTimesDaily'), value: 'Four Times Daily' },
    { label: t('profile.frequencyOptions.asNeeded'), value: 'As Needed' }
  ], [t]);

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && profileData) {
      if (profileData.medicalConditions && profileData.medicalConditions.length > 0) {
        setMedicalConditions(profileData.medicalConditions.map(condition => ({
          conditionName: condition.conditionName || ''
        })));
      }

      if (profileData.allergies && profileData.allergies.length > 0) {
        setAllergies(profileData.allergies.map(allergy => ({
          allergenName: allergy.allergenName || '',
          severity: allergy.severity || 'Mild',
          showSeverityDropdown: false
        })));
      }

      if (profileData.medications && profileData.medications.length > 0) {
        setMedications(profileData.medications.map(medication => ({
          name: medication.name || '',
          dosage: medication.dosage || '',
          frequency: medication.frequency || 'Once Daily',
          showFrequencyDropdown: false
        })));
      }
    }
  }, [isEdit, profileData]);

  const addCondition = () => setMedicalConditions([...medicalConditions, { conditionName: '' }]);
  const addAllergy = () => setAllergies([...allergies, { allergenName: '', severity: 'Mild', showSeverityDropdown: false }]);
  const addMedication = () => setMedications([...medications, { name: '', dosage: '', frequency: 'Once Daily', showFrequencyDropdown: false }]);

  const removeCondition = (index) => {
    if (medicalConditions.length > 1) {
      setMedicalConditions(medicalConditions.filter((_, i) => i !== index));
    }
  };

  const removeAllergy = (index) => {
    if (allergies.length > 1) {
      setAllergies(allergies.filter((_, i) => i !== index));
    }
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const toggleSeverityDropdown = (index) => {
    setAllergies(allergies.map((allergy, i) => 
      i === index 
        ? { ...allergy, showSeverityDropdown: !allergy.showSeverityDropdown }
        : { ...allergy, showSeverityDropdown: false }
    ));
  };

  const selectSeverity = (index, severity) => {
    setAllergies(allergies.map((allergy, i) => 
      i === index 
        ? { ...allergy, severity: severity, showSeverityDropdown: false }
        : allergy
    ));
  };

  const toggleFrequencyDropdown = (index) => {
    setMedications(medications.map((medication, i) => 
      i === index 
        ? { ...medication, showFrequencyDropdown: !medication.showFrequencyDropdown }
        : { ...medication, showFrequencyDropdown: false }
    ));
  };

  const selectFrequency = (index, frequency) => {
    setMedications(medications.map((medication, i) => 
      i === index 
        ? { ...medication, frequency: frequency, showFrequencyDropdown: false }
        : medication
    ));
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(t('profile.error'), t('profile.userNotAuthenticated'));
        return;
      }
      const token = await user.getIdToken();

      const filteredConditions = medicalConditions.filter(c => c.conditionName.trim());
      const filteredAllergies = allergies.filter(a => a.allergenName.trim());
      const filteredMedications = medications.filter(m => m.name.trim());

      const endpoint = `${BASE_URL}/api/profile`;
      const payload = {};
      if (filteredConditions.length > 0) {
        payload.medicalConditions = filteredConditions.map(condition => ({
          conditionName: condition.conditionName,
          isCustom: false,
          status: 'Active'
        }));
      }
      if (filteredAllergies.length > 0) {
        payload.allergies = filteredAllergies.map(allergy => ({
          allergenName: allergy.allergenName,
          severity: allergy.severity,
          isCustom: false
        }));
      }
      if (filteredMedications.length > 0) {
        payload.medications = filteredMedications.map(medication => ({
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          isActive: true,
          addedBy: 'Patient'
        }));
      }

      if (Object.keys(payload).length === 0) {
        Alert.alert(t('profile.info'), t('profile.fillAtLeastOne'));
        return;
      }

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
        
        // Create minimal profile first
        const createPayload = {
          fullName: user.displayName || 'User',
          dateOfBirth: new Date().toISOString().split('T')[0], // Today's date as placeholder
          gender: 'Male', // Default
          bloodGroup: 'O+', // Default
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
          console.log('Profile created, now updating medical conditions...');
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
          const errorData = await createResponse.json().catch(() => ({ message: t('profile.networkError') }));
          Alert.alert(t('profile.error'), errorData.message || errorData.error || t('profile.somethingWentWrong'));
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('profile.networkError') }));
        Alert.alert(t('profile.error'), errorData.message || errorData.error || `Server error: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.success || response.status === 200 || response.status === 201) {
        await AsyncStorage.removeItem('profileSkipped');
        
        Alert.alert(t('profile.success'), t('profile.medicalInfoUpdated'), [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert(t('profile.error'), data.message || data.error || t('profile.somethingWentWrong'));
      }
    } catch (err) {
      console.error('Step 3 error:', err);
      Alert.alert(t('profile.error'), err.message || t('profile.networkError'));
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
        <Text style={styles.headerTitle}>{t('profile.medicalCondition')}</Text>
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
            {/* Medical Condition */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>{t('profile.medicalCondition')}</Text>
              {medicalConditions.map((condition, index) => (
                <View key={`condition-${index}`}>
                  <TextInput
                    style={styles.input}
                    value={condition.conditionName}
                    onChangeText={(text) => {
                      const updated = [...medicalConditions];
                      updated[index].conditionName = text;
                      setMedicalConditions(updated);
                    }}
                    placeholder={t('profile.medicalConditionPlaceholder')}
                    placeholderTextColor="#999"
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.addNewButton} onPress={addCondition}>
                <Text style={styles.addNewText}>{t('profile.addNew')}</Text>
              </TouchableOpacity>
            </View>

            {/* Allergies */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>{t('profile.allergies')}</Text>
              {allergies.map((allergy, index) => (
                <View key={`allergy-${index}`} style={styles.allergyWrapper}>
                  <View style={styles.allergyRow}>
                    <TextInput
                      style={[styles.input, styles.allergyInput]}
                      value={allergy.allergenName}
                      onChangeText={(text) => {
                        const updated = [...allergies];
                        updated[index].allergenName = text;
                        setAllergies(updated);
                      }}
                      placeholder={t('profile.allergiesPlaceholder')}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity 
                      style={styles.severityDropdown}
                      onPress={() => toggleSeverityDropdown(index)}
                    >
                      <Text style={styles.severityText}>{allergy.severity}</Text>
                      <Ionicons 
                        name={allergy.showSeverityDropdown ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color="#999" 
                      />
                    </TouchableOpacity>
                  </View>
                  {allergy.showSeverityDropdown && (
                    <View style={styles.dropdownMenu}>
                      {[
                        { label: t('profile.severity.mild'), value: 'Mild' },
                        { label: t('profile.severity.moderate'), value: 'Moderate' },
                        { label: t('profile.severity.severe'), value: 'Severe' }
                      ].map((severity) => (
                        <TouchableOpacity
                          key={severity.value}
                          style={styles.dropdownItem}
                          onPress={() => selectSeverity(index, severity.value)}
                        >
                          <Text style={styles.dropdownItemText}>{severity.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity style={styles.addNewButton} onPress={addAllergy}>
                    <Text style={styles.addNewText}>{t('profile.addNew')}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Current Medications */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>{t('profile.currentMedications')}</Text>
              {medications.map((medication, index) => (
                <View key={`medication-${index}`} style={styles.medicationWrapper}>
                  <TextInput
                    style={styles.input}
                    value={medication.name}
                    onChangeText={(text) => {
                      const updated = [...medications];
                      updated[index].name = text;
                      setMedications(updated);
                    }}
                    placeholder={t('profile.medicineNamePlaceholder')}
                    placeholderTextColor="#999"
                  />
                  <View style={styles.medicationRow}>
                    <TextInput
                      style={[styles.input, styles.medicationInput]}
                      value={medication.dosage}
                      onChangeText={(text) => {
                        const updated = [...medications];
                        updated[index].dosage = text;
                        setMedications(updated);
                      }}
                      placeholder={t('profile.dosagePlaceholder')}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity 
                      style={styles.frequencyDropdown}
                      onPress={() => toggleFrequencyDropdown(index)}
                    >
                      <Text style={styles.frequencyText}>
                        {frequencyOptions.find(f => f.value === medication.frequency)?.label || medication.frequency}
                      </Text>
                      <Ionicons 
                        name={medication.showFrequencyDropdown ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color="#999" 
                      />
                    </TouchableOpacity>
                  </View>
                  {medication.showFrequencyDropdown && (
                    <View style={styles.dropdownMenu}>
                      {frequencyOptions.map((frequency) => (
                        <TouchableOpacity
                          key={frequency.value}
                          style={styles.dropdownItem}
                          onPress={() => selectFrequency(index, frequency.value)}
                        >
                          <Text style={styles.dropdownItemText}>{frequency.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity style={styles.addNewButton} onPress={addMedication}>
                    <Text style={styles.addNewText}>{t('profile.addNew')}</Text>
                  </TouchableOpacity>
                </View>
              ))}
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
          <Text style={styles.saveButtonText}>{t('profile.save')}</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  allergyWrapper: {
    marginBottom: 12,
  },
  allergyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  allergyInput: {
    flex: 2,
    marginBottom: 0,
  },
  severityDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  severityText: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  medicationWrapper: {
    marginBottom: 12,
  },
  medicationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  medicationInput: {
    flex: 1,
    marginBottom: 0,
  },
  frequencyDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  frequencyText: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  addNewButton: {
    marginTop: 4,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9C27B0',
    textDecorationLine: 'underline',
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

export default ProfileSetupStep3;
