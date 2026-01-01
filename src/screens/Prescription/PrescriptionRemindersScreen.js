import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';

export default function PrescriptionRemindersScreen({ navigation }) {
  const [upcomingDosages, setUpcomingDosages] = useState([]);
  const [completedDosages, setCompletedDosages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [activeTab, setActiveTab] = useState('Scheduled');
  const [searchQuery, setSearchQuery] = useState('');

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

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filterDosages = (dosages) => {
    if (!searchQuery) return dosages;
    return dosages.filter(item => 
      item.prescriptionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prescriptionType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const DosageCard = ({ item, isCompleted }) => {
    const daysLeft = calculateDaysLeft(item.endDate);
    
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
          onPress={() => toggleDosage(item.id, isCompleted)}
        >
          {isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
        </TouchableOpacity>
        
        <View style={styles.cardContent}>
          <Text style={styles.prescriptionName}>
            {item.prescriptionName} - {item.dosageNumber} Dose
          </Text>
          <Text style={styles.prescriptionInfo}>
            {item.prescriptionType} | {daysLeft} days left
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['rgba(254, 215, 112, 0.9)', 'rgba(235, 177, 180, 0.8)', 'rgba(145, 230, 251, 0.7)', 'rgba(217, 213, 250, 0.6)']}
        locations={[0, 0.3, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C6FDC" />
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const displayDosages = activeTab === 'Scheduled' ? filterDosages(upcomingDosages) : filterDosages(completedDosages);

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
          <Text style={styles.headerTitle}>My Medication Reminder</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#BDBDBD" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#BDBDBD"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Scheduled')}
          >
            <Text style={[styles.tabText, activeTab === 'Scheduled' && styles.tabTextActive]}>
              Scheduled
            </Text>
            {activeTab === 'Scheduled' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Completed')}
          >
            <Text style={[styles.tabText, activeTab === 'Completed' && styles.tabTextActive]}>
              Completed
            </Text>
            {activeTab === 'Completed' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>

        {/* Medication List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {displayDosages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💊</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'Scheduled' ? 'No scheduled medications' : 'No completed medications'}
              </Text>
            </View>
          ) : (
            displayDosages.map(item => (
              <DosageCard 
                key={item.id} 
                item={item} 
                isCompleted={activeTab === 'Completed'} 
              />
            ))
          )}
        </ScrollView>

        {/* Set New Reminder Button */}
        <TouchableOpacity
          style={styles.setNewReminderButton}
          onPress={() => navigation.navigate('AddPrescriptionScreen', { 
            userToken, 
            onRefresh: fetchPrescriptions 
          })}
        >
          <Text style={styles.setNewReminderText}>Set New Reminder</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 233, 233, 1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 24,
  },
  tab: {
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999',
    fontFamily: 'Inter',
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 233, 233, 1)',
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
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  cardContent: {
    flex: 1,
  },
  prescriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  prescriptionInfo: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter',
  },
  setNewReminderButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  setNewReminderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
