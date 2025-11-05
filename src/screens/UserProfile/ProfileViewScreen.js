import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Image,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { BASE_URL } from '../../config/config';
import { AuthContext } from '../../context/AuthContext';

const ProfileView = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditBasicInfo = () => {
    navigation.navigate('ProfileSetupStep1', { 
      isEdit: true, 
      profileData: profile 
    });
  };

  const handleEditEmergencyContact = () => {
    navigation.navigate('ProfileSetupStep2', { 
      isEdit: true, 
      profileData: profile 
    });
  };

  const handleEditMedicalInfo = () => {
    navigation.navigate('ProfileSetupStep3', { 
      isEdit: true, 
      profileData: profile 
    });
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'What would you like to edit?',
      [
        {
          text: 'Basic Information',
          onPress: handleEditBasicInfo
        },
        {
          text: 'Emergency Contact', 
          onPress: handleEditEmergencyContact
        },
        {
          text: 'Medical Information',
          onPress: handleEditMedicalInfo
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleDeletePress = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        setDeleting(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/profile/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          confirmDelete: true
        })
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.clear();
        console.log('✅ All AsyncStorage data cleared');
        
        if (logout) {
          try {
            await logout();
            console.log('✅ Firebase logout successful');
          } catch (err) {
            console.log('Logout error:', err);
          }
        }
        
        setDeleteModalVisible(false);
        
        Alert.alert(
          'Account Deleted',
          'Your account has been permanently deleted.',
          [
            {
              text: 'OK',
              onPress: () => {
                setTimeout(() => {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Landing' }],
                    })
                  );
                }, 500);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B7AD8" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.noDataText}>No profile found</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('ProfileSetupStep1')}
        >
          <Text style={styles.createButtonText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#B4A7D6" />
      
      {/* Fixed Back Button */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Purple Header - Now Scrollable */}
        <View style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {profile?.basicInfo?.profilePhoto?.url ? (
              <Image 
                source={{ uri: `${BASE_URL}${profile.basicInfo.profilePhoto.url}` }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>
        </View>

        {/* Profile Header Card */}
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>
            {profile.basicInfo?.fullName || 'Anushka'}
          </Text>
          <Text style={styles.profileSubtitle}>
            {profile.basicInfo?.gender || 'Gender'} · {profile.basicInfo?.dateOfBirth ? 
              new Date().getFullYear() - new Date(profile.basicInfo.dateOfBirth).getFullYear() + ' Age' : 'Age'} · {profile.basicInfo?.patientID || 'Patient ID'}
          </Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {profile.contactInfo?.email || 'abc@gmail.com'}
              </Text>
            </View>
            <View style={styles.dividerLine} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone no.</Text>
              <Text style={styles.infoValue}>
                {profile.contactInfo?.primaryPhone || '9876543210'}
              </Text>
            </View>
            <View style={styles.dividerLine} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DOB</Text>
              <Text style={styles.infoValue}>
                {profile.basicInfo?.dateOfBirth ? 
                  new Date(profile.basicInfo.dateOfBirth).toLocaleDateString('en-GB') : 'DD/MM/YY'}
              </Text>
            </View>
            <View style={styles.dividerLine} />
            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.infoLabel}>Blood Group</Text>
              <Text style={styles.infoValue}>
                {profile.basicInfo?.bloodGroup || 'B+'}
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithEdit}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <TouchableOpacity onPress={handleEditEmergencyContact}>
              <Ionicons name="pencil" size={16} color="#8B7AD8" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>
                {profile.emergencyContact?.name || 'Kaushal'}
              </Text>
            </View>
            <View style={styles.dividerLine} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Relation</Text>
              <Text style={styles.infoValue}>
                {profile.emergencyContact?.relationship || 'Friend'}
              </Text>
            </View>
            <View style={styles.dividerLine} />
            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.infoLabel}>Phone No.</Text>
              <Text style={styles.infoValue}>
                {profile.emergencyContact?.phoneNumber || '9876543210'}
              </Text>
            </View>
          </View>
        </View>

        {/* Medical Conditions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithEdit}>
            <Text style={styles.sectionTitle}>Medical Condition</Text>
            <TouchableOpacity onPress={handleEditMedicalInfo}>
              <Ionicons name="pencil" size={16} color="#8B7AD8" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            {profile.medicalConditions && profile.medicalConditions.length > 0 ? (
              profile.medicalConditions.map((condition, index) => (
                <View key={`condition-${index}`}>
                  <View style={styles.conditionRow}>
                    <Text style={styles.conditionText}>{condition.conditionName}</Text>
                  </View>
                  {index < profile.medicalConditions.length - 1 && <View style={styles.dividerLine} />}
                </View>
              ))
            ) : (
              <>
                <View style={styles.conditionRow}>
                  <Text style={styles.conditionText}>Diabetes</Text>
                </View>
                <View style={styles.dividerLine} />
                <View style={[styles.conditionRow, styles.lastRow]}>
                  <Text style={styles.conditionText}>Hypertension</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Allergies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithEdit}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            <TouchableOpacity onPress={handleEditMedicalInfo}>
              <Ionicons name="pencil" size={16} color="#8B7AD8" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            {profile.allergies && profile.allergies.length > 0 ? (
              profile.allergies.map((allergy, index) => (
                <View key={`allergy-${index}`}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{allergy.allergenName}</Text>
                    <Text style={styles.infoValue}>{allergy.severity}</Text>
                  </View>
                  {index < profile.allergies.length - 1 && <View style={styles.dividerLine} />}
                </View>
              ))
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nuts</Text>
                  <Text style={styles.infoValue}>Severe</Text>
                </View>
                <View style={styles.dividerLine} />
                <View style={[styles.infoRow, styles.lastRow]}>
                  <Text style={styles.infoLabel}>Pollen</Text>
                  <Text style={styles.infoValue}>Mild</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* DELETE ACCOUNT BUTTON */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.deleteProfileButton}
            onPress={handleDeletePress}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteProfileButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.warningIconContainer}>
              <Ionicons name="warning" size={50} color="#ef4444" />
            </View>

            <Text style={styles.modalTitle}>Delete Account?</Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to permanently delete your account?{'\n\n'}
              This will delete:
            </Text>

            <View style={styles.deleteItemsList}>
              <View style={styles.deleteItem}>
                <Ionicons name="checkmark-circle" size={20} color="#ef4444" />
                <Text style={styles.deleteItemText}>Your profile & medical data</Text>
              </View>
              <View style={styles.deleteItem}>
                <Ionicons name="checkmark-circle" size={20} color="#ef4444" />
                <Text style={styles.deleteItemText}>Your Firebase account</Text>
              </View>
              <View style={styles.deleteItem}>
                <Ionicons name="checkmark-circle" size={20} color="#ef4444" />
                <Text style={styles.deleteItemText}>Profile photo & documents</Text>
              </View>
              <View style={styles.deleteItem}>
                <Ionicons name="checkmark-circle" size={20} color="#ef4444" />
                <Text style={styles.deleteItemText}>All saved information</Text>
              </View>
            </View>

            <Text style={styles.warningText}>
              ⚠️ This action CANNOT be undone!
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleDeleteCancel}
                activeOpacity={0.8}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmDeleteButton]}
                onPress={handleDeleteConfirm}
                activeOpacity={0.8}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'Poppins_400Regular',
  },
  createButton: {
    backgroundColor: '#8B7AD8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins_400Regular',
  },
  fixedHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 5,
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#B4A7D6',
    paddingTop: Platform.OS === 'ios' ? 90 : (StatusBar.currentHeight || 0) + 50,
    paddingBottom: 50,
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    zIndex: 2,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileHeader: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -90,
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'visible',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
    fontFamily: 'Poppins_400Regular',
  },
  profileSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    letterSpacing: 0.2,
    fontFamily: 'Poppins_400Regular',
  },
  editButton: {
    backgroundColor: '#8B7AD8',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B7AD8',
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
  },
  sectionHeaderWithEdit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 20,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    fontFamily: 'Poppins_400Regular',
  },
  conditionRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  conditionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular',
  },
  deleteProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
    gap: 10,
  },
  deleteProfileButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  modalMessage: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Poppins_400Regular',
  },
  deleteItemsList: {
    width: '100%',
    marginBottom: 24,
  },
  deleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  deleteItemText: {
    fontSize: 15,
    color: '#4a5568',
    fontFamily: 'Poppins_400Regular',
  },
  warningText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 28,
    fontFamily: 'Poppins_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#2d3748',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
  },
  confirmDeleteButton: {
    backgroundColor: '#ef4444',
  },
  confirmDeleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
  },
  bottomPadding: {
    height: 40,
  },
});

export default ProfileView;