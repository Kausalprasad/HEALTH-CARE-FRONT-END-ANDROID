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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';

const ProfileSetupStep3 = ({ navigation, route }) => {
  // Check if in edit mode
  const { params } = route;
  const isEdit = params?.isEdit || false;
  const profileData = params?.profileData || null;

  const [medicalConditions, setMedicalConditions] = useState([{ conditionName: '' }]);
  const [allergies, setAllergies] = useState([{ allergenName: '', severity: 'Mild', showSeverityDropdown: false }]);
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: 'Once Daily' }]);

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && profileData) {
      // Pre-fill medical conditions
      if (profileData.medicalConditions && profileData.medicalConditions.length > 0) {
        setMedicalConditions(profileData.medicalConditions.map(condition => ({
          conditionName: condition.conditionName || ''
        })));
      }

      // Pre-fill allergies
      if (profileData.allergies && profileData.allergies.length > 0) {
        setAllergies(profileData.allergies.map(allergy => ({
          allergenName: allergy.allergenName || '',
          severity: allergy.severity || 'Mild',
          showSeverityDropdown: false
        })));
      }

      // Pre-fill medications
      if (profileData.medications && profileData.medications.length > 0) {
        setMedications(profileData.medications.map(medication => ({
          name: medication.name || '',
          dosage: medication.dosage || '',
          frequency: medication.frequency || 'Once Daily'
        })));
      }
    }
  }, [isEdit, profileData]);

  const handleFinish = async () => {
    // Check if at least one field is filled (optional validation)
    const hasData = 
      medicalConditions.some(c => c.conditionName.trim()) ||
      allergies.some(a => a.allergenName.trim()) ||
      medications.some(m => m.name.trim());

    if (!hasData && !isEdit) {
      Alert.alert('Note', 'You can skip this step or add your health information now');
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Filter out empty entries
      const filteredConditions = medicalConditions.filter(c => c.conditionName.trim());
      const filteredAllergies = allergies.filter(a => a.allergenName.trim());
      const filteredMedications = medications.filter(m => m.name.trim());

      // Different endpoint for edit vs create
      const endpoint = isEdit ? `${BASE_URL}/api/profile` : `${BASE_URL}/api/profile/step3`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit ? {
        // For edit, send nested object update
        medicalConditions: filteredConditions.map(condition => ({
          conditionName: condition.conditionName,
          isCustom: false,
          status: 'Active'
        })),
        allergies: filteredAllergies.map(allergy => ({
          allergenName: allergy.allergenName,
          severity: allergy.severity,
          isCustom: false
        })),
        medications: filteredMedications.map(medication => ({
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          isActive: true,
          addedBy: 'Patient'
        }))
      } : {
        // For create, send step3 data
        medicalConditions: filteredConditions,
        allergies: filteredAllergies,
        medications: filteredMedications
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isEdit) {
          Alert.alert('Success', 'Medical information updated!', [
            {
              text: 'OK',
              onPress: () => navigation.goBack() // Go back to ProfileView
            }
          ]);
        } else {
          Alert.alert('Success', 'Profile setup completed!');
          navigation.replace('ProfileViewScreen');
        }
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Step 3 error:', err);
      Alert.alert('Error', 'Server error');
    }
  };

  // const handleSkip = async () => {
  //   if (isEdit) {
  //     navigation.goBack();
  //     return;
  //   }

  //   Alert.alert(
  //     'Skip Health Information',
  //     'You can add this information later in your profile settings.',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       { 
  //         text: 'Skip', 
  //         onPress: async () => {
  //           try {
  //             const token = await AsyncStorage.getItem('token');
  //             if (!token) {
  //               Alert.alert('Error', 'User not authenticated');
  //               return;
  //             }

  //             // Call skip API to mark profile as complete
  //             const response = await fetch(`${BASE_URL}/api/profile/skip-step3`, {
  //               method: 'POST',
  //               headers: {
  //                 'Content-Type': 'application/json',
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             });

  //             const data = await response.json();

  //             if (data.success) {
  //               Alert.alert('Success', 'Profile setup completed!', [
  //                 {
  //                   text: 'OK',
  //                   onPress: () => {
  //                     // Navigate to ProfileView with reset navigation
  //                     navigation.reset({
  //                       index: 0,
  //                       routes: [{ name: 'ProfileViewScreen' }],
  //                     });
  //                   }
  //                 }
  //               ]);
  //             } else {
  //               Alert.alert('Error', data.message || 'Unable to skip step');
  //             }
  //           } catch (err) {
  //             console.error('Skip error:', err);
  //             Alert.alert('Error', 'Server error while skipping');
  //           }
  //         }
  //       }
  //     ]
  //   );
  // };

  // Add new entries

  const handleSkip = async () => {
  if (isEdit) {
    navigation.goBack();
    return;
  }

  Alert.alert(
    'Skip Health Information',
    'You can add this information later in your profile settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Skip', 
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
              Alert.alert('Error', 'User not authenticated');
              return;
            }

            console.log('=== CALLING SKIP API ===');
            console.log('URL:', `${BASE_URL}/api/profile/skip-step3`);

            const response = await fetch(`${BASE_URL}/api/profile/skip-step3`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });

            const data = await response.json();
            
            console.log('Skip API Response:', JSON.stringify(data, null, 2));

            if (data.success) {
              Alert.alert('Success', 'Profile setup completed!', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'ProfileViewScreen' }],
                    });
                  }
                }
              ]);
            } else {
              console.log('Skip API Failed:', data.message);
              Alert.alert('Error', data.message || 'Unable to skip step');
            }
          } catch (err) {
            console.error('Skip error:', err);
            Alert.alert('Error', 'Server error while skipping');
          }
        }
      }
    ]
  );
};
  const addMedication = () => setMedications([...medications, { name: '', dosage: '', frequency: 'Once Daily' }]);
  const addCondition = () => setMedicalConditions([...medicalConditions, { conditionName: '' }]);
  const addAllergy = () => setAllergies([...allergies, { allergenName: '', severity: 'Mild', showSeverityDropdown: false }]);

  // Remove entries
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

  // Toggle severity dropdown
  const toggleSeverityDropdown = (index) => {
    setAllergies(allergies.map((allergy, i) => 
      i === index 
        ? { ...allergy, showSeverityDropdown: !allergy.showSeverityDropdown }
        : { ...allergy, showSeverityDropdown: false }
    ));
  };

  // Select severity
  const selectSeverity = (index, severity) => {
    setAllergies(allergies.map((allergy, i) => 
      i === index 
        ? { ...allergy, severity: severity, showSeverityDropdown: false }
        : allergy
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Medical Info' : 'Profile Setup'}
        </Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>
            {isEdit ? 'Cancel' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar - only show in create mode */}
      {!isEdit && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFilled} />
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Health Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <Text style={styles.sectionDescription}>
            {isEdit ? 
              'Update your medical conditions, allergies, and current medications.' :
              'Tell us about any medical conditions or allergies you have. This helps caregivers and doctors give you the right support.'
            }
          </Text>

          {/* Medical Condition */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Medical Condition</Text>
            {medicalConditions.map((condition, index) => (
              <View key={`condition-${index}`} style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={condition.conditionName}
                  onChangeText={(text) => {
                    const updated = [...medicalConditions];
                    updated[index].conditionName = text;
                    setMedicalConditions(updated);
                  }}
                  placeholder="Diabetes, Hypertension..."
                  placeholderTextColor="#999"
                />
                {medicalConditions.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removeCondition(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addCondition}>
              <Ionicons name="add" size={20} color="#8B7AD8" />
              <Text style={styles.addButtonText}>Add Another</Text>
            </TouchableOpacity>
          </View>

          {/* Allergies */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Allergies</Text>
            {allergies.map((allergy, index) => (
              <View key={`allergy-${index}`} style={styles.allergyContainer}>
                <View style={styles.allergyRow}>
                  <View style={styles.allergyInputContainer}>
                    <TextInput
                      style={[styles.textInput, styles.allergyInput]}
                      value={allergy.allergenName}
                      onChangeText={(text) => {
                        const updated = [...allergies];
                        updated[index].allergenName = text;
                        setAllergies(updated);
                      }}
                      placeholder="Penicillin, Nuts..."
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.severityDropdown}
                    onPress={() => toggleSeverityDropdown(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.severityText}>{allergy.severity}</Text>
                    <Ionicons 
                      name={allergy.showSeverityDropdown ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#999" 
                    />
                  </TouchableOpacity>

                  {allergies.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeAllergy(index)}
                      style={styles.removeButtonSmall}
                    >
                      <Ionicons name="close" size={18} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>

                {allergy.showSeverityDropdown && (
                  <View style={styles.severityDropdownMenu}>
                    {['Mild', 'Moderate', 'Severe'].map((severity) => (
                      <TouchableOpacity
                        key={severity}
                        style={[
                          styles.severityOption,
                          severity === 'Severe' && styles.lastSeverityOption
                        ]}
                        onPress={() => selectSeverity(index, severity)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.severityOptionText}>{severity}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
              <Ionicons name="add" size={20} color="#8B7AD8" />
              <Text style={styles.addButtonText}>Add Another</Text>
            </TouchableOpacity>
          </View>

          {/* Medications */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Current Medications (Optional)</Text>
            {medications.map((medication, index) => (
              <View key={`medication-${index}`} style={styles.medicationContainer}>
                <View style={styles.medicationInputs}>
                  <TextInput
                    style={[styles.textInput, styles.medicationInput]}
                    value={medication.name}
                    onChangeText={(text) => {
                      const updated = [...medications];
                      updated[index].name = text;
                      setMedications(updated);
                    }}
                    placeholder="Medication name"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={[styles.textInput, styles.medicationInput]}
                    value={medication.dosage}
                    onChangeText={(text) => {
                      const updated = [...medications];
                      updated[index].dosage = text;
                      setMedications(updated);
                    }}
                    placeholder="Dosage"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={[styles.textInput, styles.medicationInput]}
                    value={medication.frequency}
                    onChangeText={(text) => {
                      const updated = [...medications];
                      updated[index].frequency = text;
                      setMedications(updated);
                    }}
                    placeholder="Frequency"
                    placeholderTextColor="#999"
                  />
                </View>
                {medications.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removeMedication(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addMedication}>
              <Ionicons name="add" size={20} color="#8B7AD8" />
              <Text style={styles.addButtonText}>Add Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={handleFinish}>
          <Text style={styles.createButtonText}>
            {isEdit ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  skipText: {
    fontSize: 16,
    color: '#8B7AD8',
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFilled: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8B7AD8',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 30,
  },
  subsection: {
    marginBottom: 30,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
  },
  removeButtonSmall: {
    marginLeft: 8,
    padding: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#8B7AD8',
    fontWeight: '500',
  },
  allergyContainer: {
    marginBottom: 12,
  },
  allergyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allergyInputContainer: {
    flex: 1,
  },
  allergyInput: {
    flex: 1,
  },
  severityDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: '#fff',
    minWidth: 100,
  },
  severityText: {
    fontSize: 14,
    color: '#333',
    marginRight: 5,
  },
  severityDropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 5,
    marginLeft: 'auto',
    marginRight: 30,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  severityOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastSeverityOption: {
    borderBottomWidth: 0,
  },
  severityOptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  medicationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  medicationInputs: {
    flex: 1,
    gap: 10,
  },
  medicationInput: {
    marginBottom: 0,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 15,
  },
  createButton: {
    backgroundColor: '#8B7AD8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProfileSetupStep3;