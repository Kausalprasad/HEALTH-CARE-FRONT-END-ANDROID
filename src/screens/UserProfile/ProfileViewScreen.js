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
  Switch,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../../config/config';
import { AuthContext } from '../../context/AuthContext';
import { getAuth } from 'firebase/auth';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const ProfileView = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const auth = getAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: false,
    emergencyContacts: false,
    healthEssentials: false,
    medicalCondition: false,
    contactSecurity: false,
    appPreference: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  const fetchProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
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
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Request camera/gallery permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert('Permissions Required', 'Camera and gallery permissions are needed to upload photos.');
      return false;
    }
    return true;
  };

  // Show photo selection options
  const selectPhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      'Select Photo',
      'Choose how you want to select your profile photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
      ]
    );
  };

  // Open camera
  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  // Open gallery
  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  // Upload photo to server
  const uploadPhoto = async (imageAsset) => {
    try {
      setPhotoUploading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const token = await user.getIdToken();

      // Create FormData
      const formData = new FormData();
      const filename = imageAsset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('profilePhoto', {
        uri: imageAsset.uri,
        name: filename,
        type: type,
      });

      console.log('Uploading to:', `${BASE_URL}/api/profile/photo`);
      const response = await fetch(`${BASE_URL}/api/profile/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.success) {
        const photoUrl = `${BASE_URL}${data.data.profilePhoto.url}`;
        // Refresh profile to get updated photo
        await fetchProfile();
        Alert.alert('Success', 'Profile photo updated successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', `Failed to upload photo: ${error.message}`);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleEdit = (section) => {
    switch(section) {
      case 'personalInfo':
        navigation.navigate('ProfileSetupStep1', { 
          isEdit: true, 
          profileData: profile 
        });
        break;
      case 'emergencyContacts':
        navigation.navigate('ProfileSetupStep2', { 
          isEdit: true, 
          profileData: profile 
        });
        break;
      case 'healthEssentials':
        navigation.navigate('HealthEssentialsScreen', { 
          isEdit: true, 
          profileData: profile 
        });
        break;
      case 'medicalCondition':
        navigation.navigate('ProfileSetupStep3', { 
          isEdit: true, 
          profileData: profile 
        });
        break;
      case 'contactSecurity':
        navigation.navigate('ContactSecurityScreen', { 
          isEdit: true, 
          profileData: profile 
        });
        break;
      case 'appPreference':
        Alert.alert('Edit App Preference', 'Edit functionality coming soon');
        break;
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Simple logout - just sign out from Firebase
              const { signOut } = require('firebase/auth');
              await signOut(auth);
              
              // Clear token from AsyncStorage
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('profileSkipped');
              
              // Navigate to Landing screen (Login)
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              // Even if error, try to navigate to login
              try {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('profileSkipped');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Landing' }],
                });
              } catch (navError) {
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  const user = auth.currentUser;
  const userName = profile?.personalInfo?.fullName || user?.displayName || 'User';
  const userEmail = profile?.contactInfo?.email || user?.email || 'email@example.com';
  const profilePhotoUrl = profile?.personalInfo?.profilePhoto?.url 
    ? `${BASE_URL}${profile.personalInfo.profilePhoto.url}` 
    : null;

  return (
    <LinearGradient
      colors={['#FFE5B4', '#FFD4A3', '#E8F4F8', '#D4E8F0', '#C8D4F0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('DashboardScreen');
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Picture and Info Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                {profilePhotoUrl ? (
                  <Image 
                    source={{ uri: profilePhotoUrl }} 
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#999" />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editPhotoButton}
                  onPress={selectPhoto}
                  disabled={photoUploading}
                >
                  {photoUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="pencil" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
              </View>
            </View>
          </View>

          {/* All Sections in One White Card */}
          <View style={styles.sectionsCard}>
            {/* Personal Information */}
            <View style={styles.sectionItem}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('personalInfo')}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIcon, { backgroundColor: '#FF9800' }]}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {expandedSections.personalInfo && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit('personalInfo');
                    }}
                    style={styles.editIconButton}
                  >
                    <Ionicons name="pencil" size={18} color="#9C27B0" />
                  </TouchableOpacity>
                )}
                <Ionicons 
                  name={expandedSections.personalInfo ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9C27B0" 
                />
              </View>
            </TouchableOpacity>
            {expandedSections.personalInfo && (
              <View style={styles.sectionContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>
                    {profile?.personalInfo?.fullName || 'Not set'}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>
                    {profile?.personalInfo?.gender || 'Not set'}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>DOB</Text>
                  <Text style={styles.infoValue}>
                    {profile?.personalInfo?.dateOfBirth 
                      ? new Date(profile.personalInfo.dateOfBirth).toLocaleDateString('en-GB')
                      : 'Not set'}
                  </Text>
                </View>
              </View>
            )}
            </View>

            {/* Emergency Contacts */}
            <View style={styles.sectionItem}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('emergencyContacts')}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIcon, { backgroundColor: '#00BCD4' }]}>
                  <Ionicons name="notifications" size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {expandedSections.emergencyContacts && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit('emergencyContacts');
                    }}
                    style={styles.editIconButton}
                  >
                    <Ionicons name="pencil" size={18} color="#9C27B0" />
                  </TouchableOpacity>
                )}
                <Ionicons 
                  name={expandedSections.emergencyContacts ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9C27B0" 
                />
              </View>
            </TouchableOpacity>
            {expandedSections.emergencyContacts && (
              <View style={styles.sectionContent}>
                {/* Show all emergency contacts if array exists, otherwise show single contact */}
                {(() => {
                  const emergencyContactsArray = profile?.emergencyContacts;
                  const singleContact = profile?.emergencyContact;
                  
                  
                  // Check if emergencyContacts is an array with data
                  if (emergencyContactsArray && Array.isArray(emergencyContactsArray) && emergencyContactsArray.length > 0) {
                    return emergencyContactsArray.map((contact, index) => (
                      <View key={index}>
                        {index > 0 && <View style={[styles.divider, { marginTop: 16, marginBottom: 16 }]} />}
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Name</Text>
                          <Text style={styles.infoValue}>
                            {contact?.name || 'Not set'}
                          </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Relation</Text>
                          <Text style={styles.infoValue}>
                            {contact?.relationship || 'Not set'}
                          </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Phone Number</Text>
                          <Text style={styles.infoValue}>
                            {contact?.phoneNumber || 'Not set'}
                          </Text>
                        </View>
                      </View>
                    ));
                  }
                  
                  // Fallback to single contact
                  return (
                    <>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>
                          {singleContact?.name || 'Not set'}
                        </Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Relation</Text>
                        <Text style={styles.infoValue}>
                          {singleContact?.relationship || 'Not set'}
                        </Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone Number</Text>
                        <Text style={styles.infoValue}>
                          {singleContact?.phoneNumber || 'Not set'}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            )}
            </View>

            {/* Health Essentials */}
            <View style={styles.sectionItem}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('healthEssentials')}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIcon, { backgroundColor: '#2196F3' }]}>
                  <Ionicons name="medical" size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>Health Essentials</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {expandedSections.healthEssentials && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit('healthEssentials');
                    }}
                    style={styles.editIconButton}
                  >
                    <Ionicons name="pencil" size={18} color="#9C27B0" />
                  </TouchableOpacity>
                )}
                <Ionicons 
                  name={expandedSections.healthEssentials ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9C27B0" 
                />
              </View>
            </TouchableOpacity>
            {expandedSections.healthEssentials && (
              <View style={styles.sectionContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Blood Group</Text>
                  <Text style={styles.infoValue}>
                    {profile?.healthEssentials?.bloodGroup || 'Not set'}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Height</Text>
                  <Text style={styles.infoValue}>
                    {profile?.healthEssentials?.height || 'Not set'}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weight</Text>
                  <Text style={styles.infoValue}>
                    {profile?.healthEssentials?.weight ? `${profile.healthEssentials.weight} kg` : 'Not set'}
                  </Text>
                </View>
              </View>
            )}
            </View>

            {/* Medical Condition */}
            <View style={styles.sectionItem}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('medicalCondition')}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIcon, { backgroundColor: '#9C27B0' }]}>
                  <Ionicons name="medical-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>Medical Condition</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {expandedSections.medicalCondition && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit('medicalCondition');
                    }}
                    style={styles.editIconButton}
                  >
                    <Ionicons name="pencil" size={18} color="#9C27B0" />
                  </TouchableOpacity>
                )}
                <Ionicons 
                  name={expandedSections.medicalCondition ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9C27B0" 
                />
              </View>
            </TouchableOpacity>
            {expandedSections.medicalCondition && (
              <View style={styles.sectionContent}>
                {/* Medical Conditions */}
                {profile?.medicalConditions && profile.medicalConditions.length > 0 ? (
                  <>
                    {profile.medicalConditions.map((condition, index) => (
                      <View key={index}>
                        {index > 0 && <View style={styles.divider} />}
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Medical Condition</Text>
                          <Text style={styles.infoValue}>
                            {condition?.conditionName || 'Not set'}
                          </Text>
                        </View>
                      </View>
                    ))}
                    {(profile.allergies && profile.allergies.length > 0) || (profile.medications && profile.medications.length > 0) ? <View style={styles.divider} /> : null}
                  </>
                ) : (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Medical Condition</Text>
                    <Text style={styles.infoValue}>Not set</Text>
                  </View>
                )}

                {/* Allergies */}
                {profile?.allergies && profile.allergies.length > 0 ? (
                  <>
                    {profile.allergies.map((allergy, index) => (
                      <View key={index}>
                        {index > 0 && <View style={styles.divider} />}
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Allergies</Text>
                          <Text style={styles.infoValue}>
                            {allergy?.allergenName || 'Not set'} {allergy?.severity ? `(${allergy.severity})` : ''}
                          </Text>
                        </View>
                      </View>
                    ))}
                    {profile.medications && profile.medications.length > 0 && <View style={styles.divider} />}
                  </>
                ) : (
                  <>
                    {(!profile?.medicalConditions || profile.medicalConditions.length === 0) && <View style={styles.divider} />}
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Allergies</Text>
                      <Text style={styles.infoValue}>Not set</Text>
                    </View>
                  </>
                )}

                {/* Medications */}
                {profile?.medications && profile.medications.length > 0 ? (
                  <>
                    {profile.medications.map((medication, index) => (
                      <View key={index}>
                        {index > 0 && <View style={styles.divider} />}
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Current Medication</Text>
                          <Text style={styles.infoValue}>
                            {medication?.name || 'Not set'} {medication?.dosage ? `- ${medication.dosage}` : ''} {medication?.frequency ? `(${medication.frequency})` : ''}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <>
                    {((!profile?.medicalConditions || profile.medicalConditions.length === 0) && (!profile?.allergies || profile.allergies.length === 0)) && <View style={styles.divider} />}
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Current Medication</Text>
                      <Text style={styles.infoValue}>Not set</Text>
                    </View>
                  </>
                )}
              </View>
            )}
            </View>

            {/* Contact and Security */}
            <View style={styles.sectionItem}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('contactSecurity')}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIcon, { backgroundColor: '#FF9800' }]}>
                  <Ionicons name="lock-closed" size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>Contact and Security</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {expandedSections.contactSecurity && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit('contactSecurity');
                    }}
                    style={styles.editIconButton}
                  >
                    <Ionicons name="pencil" size={18} color="#9C27B0" />
                  </TouchableOpacity>
                )}
                <Ionicons 
                  name={expandedSections.contactSecurity ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9C27B0" 
                />
              </View>
            </TouchableOpacity>
            {expandedSections.contactSecurity && (
              <View style={styles.sectionContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userEmail}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>
                    {profile?.contactInfo?.primaryPhone || 'Not set'}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Password</Text>
                  <View style={styles.passwordRow}>
                    <Text style={styles.infoValue}>123*****</Text>
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={18} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            </View>

            {/* App Preference */}
            <View style={styles.sectionItem}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('appPreference')}
            >
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIcon, { backgroundColor: '#4CAF50' }]}>
                  <Ionicons name="settings" size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>App Preference</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {expandedSections.appPreference && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit('appPreference');
                    }}
                    style={styles.editIconButton}
                  >
                    <Ionicons name="pencil" size={18} color="#9C27B0" />
                  </TouchableOpacity>
                )}
                <Ionicons 
                  name={expandedSections.appPreference ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9C27B0" 
                />
              </View>
            </TouchableOpacity>
            {expandedSections.appPreference && (
              <View style={styles.sectionContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Languages</Text>
                  <Text style={styles.infoValue}>English US</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>App Notifications</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#E0E0E0', true: '#9C27B0' }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            )}
            </View>

            {/* Logout Button */}
            <View style={styles.sectionItem}>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  profileCard: {
    marginTop: 10,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  avatar: {
    width: 71,
    height: 71,
    borderRadius: 50.78,
  },
  avatarPlaceholder: {
    width: 71,
    height: 71,
    borderRadius: 50.78,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 27,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
    color: '#666',
  },
  sectionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
  },
  sectionItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 233, 233, 1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 1)',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editIconButton: {
    padding: 4,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
    color: ' rgba(133, 134, 137, 1)',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
    color: ' rgba(133, 134, 137, 1)',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
    color: '#FF3B30',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ProfileView;
