import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';

export default function PrescriptionRemindersScreen({ navigation }) {
  const [upcomingDosages, setUpcomingDosages] = useState([]);
  const [completedDosages, setCompletedDosages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    fetchUserToken();
  }, []);

  useEffect(() => {
    if (userToken) {
      fetchPrescriptions();
    }
  }, [userToken]);

  const fetchUserToken = async () => {
    try {
      let token = await AsyncStorage.getItem('token');
      if (!token) {
        token = await AsyncStorage.getItem('userToken');
      }
      if (!token) {
        token = await AsyncStorage.getItem('authToken');
      }
      
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      
      setUserToken(token);
    } catch (error) {
      console.log('Error fetching token:', error);
      Alert.alert('Error', 'Failed to get authentication token');
    }
  };

  const fetchPrescriptions = async () => {
    if (!userToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/prescriptionns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Flatten prescriptions into individual dosages
        const allDosages = [];
        data.forEach(prescription => {
          if (prescription.dosages && prescription.dosages.length > 0) {
            prescription.dosages.forEach((dosage, index) => {
              allDosages.push({
                id: `${prescription._id}-${index}`,
                prescriptionId: prescription._id,
                prescriptionName: prescription.prescriptionName,
                prescriptionType: prescription.prescriptionType,
                dosageNumber: index + 1,
                time: dosage.time,
                dose: dosage.dose,
                startDate: prescription.startDate,
                endDate: prescription.endDate
              });
            });
          }
        });
        
        setUpcomingDosages(allDosages);
        setCompletedDosages([]);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const toggleDosage = (id, isCompleted) => {
    if (isCompleted) {
      const item = completedDosages.find(d => d.id === id);
      setCompletedDosages(completedDosages.filter(d => d.id !== id));
      setUpcomingDosages([...upcomingDosages, item]);
    } else {
      const item = upcomingDosages.find(d => d.id === id);
      setUpcomingDosages(upcomingDosages.filter(d => d.id !== id));
      setCompletedDosages([...completedDosages, item]);
    }
  };

  const deletePrescription = async (prescriptionId) => {
    if (!userToken) return;

    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to delete this prescription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/api/prescriptionns/${prescriptionId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`
                }
              });

              if (response.ok) {
                Alert.alert('Success', 'Prescription deleted successfully');
                fetchPrescriptions();
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to delete');
              }
            } catch (error) {
              console.error('Error deleting prescription:', error);
              Alert.alert('Error', 'Failed to delete prescription');
            }
          }
        }
      ]
    );
  };

  const DosageCard = ({ item, isCompleted }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
        onPress={() => toggleDosage(item.id, isCompleted)}
      >
        {isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
      </TouchableOpacity>
      
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <Text style={styles.prescriptionName}>
            {item.prescriptionName} - Dose {item.dosageNumber}
          </Text>
          <Text style={styles.prescriptionType}>{item.prescriptionType}</Text>
          <View style={styles.dosageInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.infoText}>{item.time}</Text>
            </View>
            <View style={styles.separator}>
              <Text style={styles.separatorText}>|</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="medical-outline" size={14} color="#666" />
              <Text style={styles.infoText}>{item.dose}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={() => deletePrescription(item.prescriptionId)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C6FDC" />
        <Text style={styles.loadingText}>Loading prescriptions...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Prescription Reminders</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        
        {upcomingDosages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💊</Text>
            <Text style={styles.emptyText}>No upcoming dosages</Text>
          </View>
        ) : (
          upcomingDosages.map(item => (
            <DosageCard key={item.id} item={item} isCompleted={false} />
          ))
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPrescriptionScreen', { 
            userToken, 
            onRefresh: fetchPrescriptions 
          })}
        >
          <View style={styles.addButtonIcon}>
            <Ionicons name="add" size={20} color="#fff" />
          </View>
          <Text style={styles.addButtonText}>Add Prescription</Text>
        </TouchableOpacity>

        {completedDosages.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completedDosages.map(item => (
              <DosageCard key={item.id} item={item} isCompleted={true} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7C6FDC',
    borderColor: '#7C6FDC',
  },
  cardContent: {
    flex: 1,
  },
  cardLeft: {
    flex: 1,
  },
  prescriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  prescriptionType: {
    fontSize: 13,
    color: '#7C6FDC',
    fontWeight: '500',
    marginBottom: 6,
  },
  dosageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  separator: {
    marginHorizontal: 8,
  },
  separatorText: {
    fontSize: 13,
    color: '#E0E0E0',
  },
  deleteIcon: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  addButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C6FDC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButtonText: {
    fontSize: 16,
    color: '#7C6FDC',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});