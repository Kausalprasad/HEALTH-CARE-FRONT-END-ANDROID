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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BASE_URL } from '../../config/config';

export default function AddPrescriptionScreen({ navigation, route }) {
  const { userToken, onRefresh } = route.params || {};
  
  const [prescriptionName, setPrescriptionName] = useState('');
  const [prescriptionType, setPrescriptionType] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dosages, setDosages] = useState([
    { time: '8:00 am', dose: '1 Tablet' }
  ]);
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({ show: false, index: -1 });
  const [showDosePicker, setShowDosePicker] = useState({ show: false, index: -1 });
  const [loading, setLoading] = useState(false);

  // Convert time string to minutes for sorting
  const convertTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  // Sort dosages by time
  const sortDosagesByTime = (dosagesArray) => {
    return [...dosagesArray].sort((a, b) => {
      return convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time);
    });
  };

  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const newDosages = [...dosages];
      newDosages[showTimePicker.index].time = formatTime(selectedTime);
      const sortedDosages = sortDosagesByTime(newDosages);
      setDosages(sortedDosages);
    }
    setShowTimePicker({ show: Platform.OS === 'ios', index: -1 });
  };

  const updateDose = (index, dose) => {
    const newDosages = [...dosages];
    newDosages[index].dose = dose;
    setDosages(newDosages);
    setShowDosePicker({ show: false, index: -1 });
  };

  const addDosage = () => {
    const newDosages = [...dosages, { time: '12:00 pm', dose: '1 Tablet' }];
    const sortedDosages = sortDosagesByTime(newDosages);
    setDosages(sortedDosages);
  };

  const removeDosage = (index) => {
    if (index === 0) return;
    const newDosages = dosages.filter((_, i) => i !== index);
    setDosages(newDosages);
  };

  const getDosageLabel = (index) => {
    if (index === 0) return 'First';
    if (index === 1) return 'Second';
    if (index === 2) return 'Third';
    return `${index + 1}th`;
  };

  const handleConfirm = async () => {
    if (!prescriptionName || !prescriptionType) {
      Alert.alert('Error', 'Please fill Prescription Name and Type');
      return;
    }

    if (!userToken) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/prescriptionns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          prescriptionName,
          prescriptionType,
          startDate,
          endDate,
          dosages
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Prescription added successfully');
        if (onRefresh) {
          onRefresh();
        }
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to add prescription');
      }
    } catch (error) {
      console.error('Error adding prescription:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const DosePickerModal = () => (
    <Modal
      visible={showDosePicker.show}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDosePicker({ show: false, index: -1 })}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowDosePicker({ show: false, index: -1 })}
      >
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Dose</Text>
            <TouchableOpacity onPress={() => setShowDosePicker({ show: false, index: -1 })}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.pickerOption}
            onPress={() => updateDose(showDosePicker.index, '1 Tablet')}
          >
            <Text style={styles.pickerOptionText}>1 Tablet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.pickerOption}
            onPress={() => updateDose(showDosePicker.index, '2 Tablets')}
          >
            <Text style={styles.pickerOptionText}>2 Tablets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.pickerOption}
            onPress={() => updateDose(showDosePicker.index, '3 Tablets')}
          >
            <Text style={styles.pickerOptionText}>3 Tablets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.pickerOption}
            onPress={() => updateDose(showDosePicker.index, '5ml')}
          >
            <Text style={styles.pickerOptionText}>5ml</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.pickerOption}
            onPress={() => updateDose(showDosePicker.index, '10ml')}
          >
            <Text style={styles.pickerOptionText}>10ml</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
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
          <Text style={styles.headerTitle}>Add Prescription</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Prescription Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg. Amlodipine"
          placeholderTextColor="#BDBDBD"
          value={prescriptionName}
          onChangeText={setPrescriptionName}
        />

        <Text style={styles.label}>Prescription Type</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg. BP"
          placeholderTextColor="#BDBDBD"
          value={prescriptionType}
          onChangeText={setPrescriptionType}
        />

        <Text style={styles.label}>Duration</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(startDate)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(endDate)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {dosages.map((dosage, index) => (
          <View key={index}>
            <View style={styles.dosageHeader}>
              <Text style={styles.label}>
                {getDosageLabel(index)} Dosage
              </Text>
              {index > 0 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeDosage(index)}
                >
                  <Ionicons name="remove-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.dosageRow}
              onPress={() => setShowTimePicker({ show: true, index })}
            >
              <Text style={styles.dosageLabel}>Time</Text>
              <View style={styles.dosageValue}>
                <Text style={styles.dosageValueText}>{dosage.time}</Text>
                <Ionicons name="chevron-down" size={16} color="#7C6FDC" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dosageRow}
              onPress={() => setShowDosePicker({ show: true, index })}
            >
              <Text style={styles.dosageLabel}>Dose</Text>
              <View style={styles.dosageValue}>
                <Text style={styles.dosageValueText}>{dosage.dose}</Text>
                <Ionicons name="chevron-down" size={16} color="#7C6FDC" />
              </View>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addDosageButton} onPress={addDosage}>
          <View style={styles.addDosageIcon}>
            <Ionicons name="add" size={16} color="#fff" />
          </View>
          <Text style={styles.addDosageText}>Add Dosage</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.confirmButton, loading && styles.buttonDisabled]} 
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
        />
      )}

      {showTimePicker.show && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      <DosePickerModal />
    </View>
  );
}

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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  dosageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    padding: 4,
  },
  dosageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dosageLabel: {
    fontSize: 14,
    color: '#666',
  },
  dosageValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dosageValueText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  addDosageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  addDosageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addDosageText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#7C6FDC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#B8B0E8',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#000000',
  },
});