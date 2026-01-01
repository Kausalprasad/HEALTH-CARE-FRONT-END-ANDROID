import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  StatusBar,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BASE_URL } from '../../config/config';

export default function AddPrescriptionScreen({ navigation, route }) {
  const { userToken, onRefresh } = route.params || {};
  
  const [medications, setMedications] = useState([{
    id: Date.now(),
    medicineName: '',
    startDate: new Date(),
    endDate: new Date(),
    dosage: '',
    frequency: '',
    selectedTimings: []
  }]);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showStartPicker, setShowStartPicker] = useState({ show: false, index: -1 });
  const [showEndPicker, setShowEndPicker] = useState({ show: false, index: -1 });
  const [showDosageModal, setShowDosageModal] = useState({ show: false, index: -1 });
  const [showFrequencyModal, setShowFrequencyModal] = useState({ show: false, index: -1 });
  const [showTimingsModal, setShowTimingsModal] = useState({ show: false, index: -1 });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Available time slots
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00',
    '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00',
    '22:00', '23:00', '24:00'
  ];

  const dosageOptions = ['1 Tablet', '2 Tablets', '3 Tablets', '5ml', '10ml'];
  const frequencyOptions = ['Once Daily', 'Twice Daily', 'Thrice Daily', 'Four Times Daily'];

  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker({ show: Platform.OS === 'ios', index: -1 });
    if (selectedDate && showStartPicker.index !== -1) {
      updateMedication(showStartPicker.index, 'startDate', selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker({ show: Platform.OS === 'ios', index: -1 });
    if (selectedDate && showEndPicker.index !== -1) {
      updateMedication(showEndPicker.index, 'endDate', selectedDate);
    }
  };

  const toggleTiming = (index, time) => {
    const medication = medications[index];
    const timings = medication.selectedTimings || [];
    if (timings.includes(time)) {
      updateMedication(index, 'selectedTimings', timings.filter(t => t !== time));
    } else {
      updateMedication(index, 'selectedTimings', [...timings, time]);
    }
  };

  const formatTimingsForDisplay = (timings) => {
    if (!timings || timings.length === 0) return 'Select Timings';
    if (timings.length === 1) return timings[0];
    return `${timings.length} timings selected`;
  };

  const formatTimingsForAPI = (timings) => {
    return timings.map(time => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    });
  };

  const addNewCard = () => {
    setMedications([...medications, {
      id: Date.now(),
      medicineName: '',
      startDate: new Date(),
      endDate: new Date(),
      dosage: '',
      frequency: '',
      selectedTimings: []
    }]);
  };

  const removeCard = (index) => {
    if (medications.length > 1) {
      const updated = medications.filter((_, i) => i !== index);
      setMedications(updated);
    }
  };

  const handleConfirm = async () => {
    // Validate all medications
    for (let i = 0; i < medications.length; i++) {
      const med = medications[i];
      if (!med.medicineName) {
        Alert.alert('Error', `Please enter Medicine Name for medication ${i + 1}`);
        return;
      }
      if (!med.dosage) {
        Alert.alert('Error', `Please select Dosage for medication ${i + 1}`);
        return;
      }
      if (!med.frequency) {
        Alert.alert('Error', `Please select Frequency for medication ${i + 1}`);
        return;
      }
      if (!med.selectedTimings || med.selectedTimings.length === 0) {
        Alert.alert('Error', `Please select at least one timing for medication ${i + 1}`);
        return;
      }
    }

    if (!userToken) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    try {
      // Save all medications
      const promises = medications.map(med => {
        const formattedTimings = formatTimingsForAPI(med.selectedTimings);
        const dosages = formattedTimings.map(time => ({
          time: time,
          dose: med.dosage
        }));

        return fetch(`${BASE_URL}/api/prescriptionns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            prescriptionName: med.medicineName,
            prescriptionType: med.frequency,
            startDate: med.startDate,
            endDate: med.endDate,
            dosages
          })
        });
      });

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(r => r.ok);

      if (allSuccessful) {
        setShowSuccessModal(true);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        Alert.alert('Error', 'Some medications failed to save');
      }
    } catch (error) {
      console.error('Error adding prescriptions:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllReminders = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const getSuccessMessage = () => {
    if (medications.length === 0) return '';
    const firstMed = medications[0];
    if (!firstMed.selectedTimings || firstMed.selectedTimings.length === 0) return '';
    const formatted = formatTimingsForAPI(firstMed.selectedTimings);
    if (formatted.length === 1) {
      const time = formatted[0];
      const isPM = time.includes('pm');
      const suffix = isPM ? ' in the night' : '';
      return `You will get notifications to take your medication daily at ${time}${suffix}.`;
    } else if (formatted.length === 2) {
      const time1 = formatted[0];
      const time2 = formatted[1];
      const isPM2 = time2.includes('pm');
      const suffix = isPM2 ? ' in the night' : '';
      return `You will get notifications to take your medication daily at ${time1} and ${time2}${suffix}.`;
    } else {
      const last = formatted[formatted.length - 1];
      const others = formatted.slice(0, -1).join(', ');
      const isPMLast = last.includes('pm');
      const suffix = isPMLast ? ' in the night' : '';
      return `You will get notifications to take your medication daily at ${others} and ${last}${suffix}.`;
    }
  };

  const MedicationCard = ({ medication, index }) => {
    const isFirst = index === 0;
    
    return (
      <View style={styles.card}>
        {!isFirst && (
          <TouchableOpacity
            style={styles.removeCardButton}
            onPress={() => removeCard(index)}
          >
            <Ionicons name="close-circle" size={24} color="#FF5252" />
          </TouchableOpacity>
        )}
        
        <Text style={styles.cardTitle}>Add Details</Text>
        
        {/* Medicine Name */}
        <TextInput
          style={styles.input}
          placeholder="Medicine Name"
          placeholderTextColor="#BDBDBD"
          value={medication.medicineName}
          onChangeText={(text) => updateMedication(index, 'medicineName', text)}
        />

        {/* Starting Date and End Date Row */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowStartPicker({ show: true, index })}
          >
            <Text style={styles.dropdownText}>
              {formatDate(medication.startDate)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowEndPicker({ show: true, index })}
          >
            <Text style={styles.dropdownText}>
              {formatDate(medication.endDate)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Dosage and Frequency Row */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDosageModal({ show: true, index })}
          >
            <Text style={[styles.dropdownText, !medication.dosage && styles.placeholderText]}>
              {medication.dosage || 'Dosage'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowFrequencyModal({ show: true, index })}
          >
            <Text style={[styles.dropdownText, !medication.frequency && styles.placeholderText]}>
              {medication.frequency || 'Frequency'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Select Timings */}
        <TouchableOpacity
          style={styles.timingsButton}
          onPress={() => setShowTimingsModal({ show: true, index })}
        >
          <Text style={[styles.dropdownText, (!medication.selectedTimings || medication.selectedTimings.length === 0) && styles.placeholderText]}>
            {formatTimingsForDisplay(medication.selectedTimings)}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        {/* Time Selection Grid */}
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeButton,
                medication.selectedTimings && medication.selectedTimings.includes(time) && styles.timeButtonSelected
              ]}
              onPress={() => toggleTiming(index, time)}
            >
              <Text style={[
                styles.timeButtonText,
                medication.selectedTimings && medication.selectedTimings.includes(time) && styles.timeButtonTextSelected
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
          <Text style={styles.headerTitle}>Medication Reminder</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {medications.map((medication, index) => (
            <View key={medication.id}>
              <MedicationCard medication={medication} index={index} />
              {index === medications.length - 1 && (
                <TouchableOpacity 
                  style={styles.addMoreButton}
                  onPress={addNewCard}
                >
                  <Text style={styles.addMoreText}>+ Add More</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Confirm Reminder Button */}
        <TouchableOpacity 
          style={[styles.confirmButton, loading && styles.buttonDisabled]} 
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Reminder</Text>
          )}
        </TouchableOpacity>

        {/* Date Pickers */}
        {showStartPicker.show && (
          <DateTimePicker
            value={medications[showStartPicker.index]?.startDate || new Date()}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}

        {showEndPicker.show && (
          <DateTimePicker
            value={medications[showEndPicker.index]?.endDate || new Date()}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}

        {/* Dosage Modal */}
        <Modal
          visible={showDosageModal.show}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDosageModal({ show: false, index: -1 })}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDosageModal({ show: false, index: -1 })}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Dosage</Text>
                <TouchableOpacity onPress={() => setShowDosageModal({ show: false, index: -1 })}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              {dosageOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.modalItem, medications[showDosageModal.index]?.dosage === option && styles.modalItemSelected]}
                  onPress={() => {
                    updateMedication(showDosageModal.index, 'dosage', option);
                    setShowDosageModal({ show: false, index: -1 });
                  }}
                >
                  <Text style={[styles.modalItemText, medications[showDosageModal.index]?.dosage === option && styles.modalItemTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Frequency Modal */}
        <Modal
          visible={showFrequencyModal.show}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFrequencyModal({ show: false, index: -1 })}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFrequencyModal({ show: false, index: -1 })}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Frequency</Text>
                <TouchableOpacity onPress={() => setShowFrequencyModal({ show: false, index: -1 })}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.modalItem, medications[showFrequencyModal.index]?.frequency === option && styles.modalItemSelected]}
                  onPress={() => {
                    updateMedication(showFrequencyModal.index, 'frequency', option);
                    setShowFrequencyModal({ show: false, index: -1 });
                  }}
                >
                  <Text style={[styles.modalItemText, medications[showFrequencyModal.index]?.frequency === option && styles.modalItemTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Timings Modal */}
        <Modal
          visible={showTimingsModal.show}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimingsModal({ show: false, index: -1 })}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimingsModal({ show: false, index: -1 })}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Timings</Text>
                <TouchableOpacity onPress={() => setShowTimingsModal({ show: false, index: -1 })}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                <View style={styles.timeGridModal}>
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeButtonModal,
                        medications[showTimingsModal.index]?.selectedTimings?.includes(time) && styles.timeButtonModalSelected
                      ]}
                      onPress={() => toggleTiming(showTimingsModal.index, time)}
                    >
                      <Text style={[
                        styles.timeButtonTextModal,
                        medications[showTimingsModal.index]?.selectedTimings?.includes(time) && styles.timeButtonTextModalSelected
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.successModalOverlay}>
            <View style={styles.successModalContent}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark" size={60} color="#fff" />
              </View>
              <Text style={styles.successTitle}>Reminder Activated!</Text>
              <Text style={styles.successMessage}>
                {getSuccessMessage() || 'You will get notifications to take your medication daily.'}
              </Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleViewAllReminders}
              >
                <LinearGradient
                  colors={['#9C27B0', '#7B1FA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.viewAllButtonGradient}
                >
                  <Text style={styles.viewAllButtonText}>View All Reminders</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(233, 233, 233, 1)',
    position: 'relative',
  },
  removeCardButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    fontFamily: 'Inter',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 30,
    padding: 14,
    fontSize: 14,
    color: '#000',
    marginBottom: 16,
    fontFamily: 'Inter',
    borderWidth: 1,
    borderColor: 'rgba(233, 233, 233, 1)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 30,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(233, 233, 233, 1)',
  },
  timingsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 30,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(233, 233, 233, 1)',
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter',
  },
  placeholderText: {
    color: '#BDBDBD',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 233, 233, 1)',
    minWidth: 70,
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  timeButtonText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter',
  },
  timeButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addMoreButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  addMoreText: {
    fontSize: 14,
    color: '#9C27B0',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Inter',
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
  },
  timeGridModal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  timeButtonModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(233, 233, 233, 1)',
    minWidth: 80,
    alignItems: 'center',
  },
  timeButtonModalSelected: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  timeButtonTextModal: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter',
  },
  timeButtonTextModalSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  viewAllButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewAllButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
