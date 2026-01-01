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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { BASE_URL } from '../../config/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const ProfileSetupStep1 = ({ navigation, route }) => {
  const { t } = useTranslation();
  // Check if in edit mode
  const { params } = route;
  const isEdit = params?.isEdit || false;
  const profileData = params?.profileData || null;
  const auth = getAuth();

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [email, setEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState(null); // Store photo to upload after profile creation
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const genderOptions = useMemo(() => [
    { label: t('riskAssessment.male'), value: 'Male' },
    { label: t('riskAssessment.female'), value: 'Female' },
    { label: t('riskAssessment.other'), value: 'Other' }
  ], [t]);
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date picker change
  const onDateChange = (event, selectedDateValue) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDateValue) {
        setSelectedDate(selectedDateValue);
        const formattedDate = formatDateForAPI(selectedDateValue);
        setDateOfBirth(formattedDate);
      }
    } else {
      // iOS
      if (selectedDateValue) {
        setSelectedDate(selectedDateValue);
        const formattedDate = formatDateForAPI(selectedDateValue);
        setDateOfBirth(formattedDate);
      }
      if (event.type === 'dismissed') {
        setShowDatePicker(false);
      }
    }
  };

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && profileData) {
      setFullName(profileData.personalInfo?.fullName || '');
      if (profileData.personalInfo?.dateOfBirth) {
        const dobDate = new Date(profileData.personalInfo.dateOfBirth);
        setSelectedDate(dobDate);
        setDateOfBirth(formatDateForAPI(dobDate));
      }
      setGender(profileData.personalInfo?.gender || '');
      setBloodGroup(profileData.healthEssentials?.bloodGroup || '');
      setEmail(profileData.contactInfo?.email || '');
      setPrimaryPhone(profileData.contactInfo?.primaryPhone || '');
      
      // Set current profile photo
      if (profileData.personalInfo?.profilePhoto?.url) {
        setProfilePhoto(`${BASE_URL}${profileData.personalInfo.profilePhoto.url}`);
      }
    }
  }, [isEdit, profileData]);

  // Request camera/gallery permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(t('profile.permissionsRequired'), t('profile.permissionsMessage'));
      return false;
    }
    return true;
  };

  // Show photo selection options
  const selectPhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      t('profile.selectPhoto'),
      t('profile.selectPhotoMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        { text: t('profile.camera'), onPress: () => openCamera() },
        { text: t('profile.gallery'), onPress: () => openGallery() },
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
        if (isEdit) {
          // In edit mode, upload immediately
          await uploadPhoto(result.assets[0]);
        } else {
          // In create mode, store locally and upload after profile creation
          setPendingPhoto(result.assets[0]);
          setProfilePhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(t('profile.error'), t('profile.failedToOpenCamera'));
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
        if (isEdit) {
          // In edit mode, upload immediately
          await uploadPhoto(result.assets[0]);
        } else {
          // In create mode, store locally and upload after profile creation
          setPendingPhoto(result.assets[0]);
          setProfilePhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert(t('profile.error'), t('profile.failedToOpenGallery'));
    }
  };

  // Upload photo to server
  const uploadPhoto = async (imageAsset) => {
    setPhotoUploading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(t('profile.error'), t('profile.userNotAuthenticated'));
        setPhotoUploading(false);
        return;
      }
      const token = await user.getIdToken();

      // Create FormData with proper format
      const formData = new FormData();
      
      // For React Native, we need to format the file object properly
      const fileExtension = imageAsset.uri.split('.').pop();
      const fileName = `profile_${Date.now()}.${fileExtension}`;
      
      formData.append('profilePhoto', {
        uri: Platform.OS === 'ios' ? imageAsset.uri.replace('file://', '') : imageAsset.uri,
        type: `image/${fileExtension}`,
        name: fileName,
      } );

      console.log('Uploading to:', `${BASE_URL}/api/profile/photo`);
      console.log('File info:', {
        uri: imageAsset.uri,
        type: `image/${fileExtension}`,
        name: fileName
      });

      const response = await fetch(`${BASE_URL}/api/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        const photoUrl = `${BASE_URL}${data.data.profilePhoto.url}`;
        setProfilePhoto(photoUrl);
        Alert.alert(t('profile.success'), t('profile.photoUpdated'));
      } else {
        Alert.alert(t('profile.error'), data.message || t('profile.failedToOpenGallery'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(t('profile.error'), `${t('profile.failedToOpenGallery')}: ${error.message}`);
    } finally {
      setPhotoUploading(false);
    }
  };

  // Delete photo
  const deletePhoto = async () => {
    Alert.alert(
      t('profile.deletePhoto'),
      t('profile.deletePhotoConfirm'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert(t('profile.error'), t('profile.userNotAuthenticated'));
                return;
              }
              const token = await user.getIdToken();
              const response = await fetch(`${BASE_URL}/api/profile/photo`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await response.json();
              if (data.success) {
                setProfilePhoto(null);
                Alert.alert(t('profile.success'), t('profile.photoRemoved'));
              } else {
                Alert.alert(t('profile.error'), data.message || t('profile.failedToOpenGallery'));
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert(t('profile.error'), t('profile.failedToOpenGallery'));
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      // Get token from Firebase Auth
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(t('profile.error'), t('profile.userNotAuthenticated'));
        return;
      }
      const token = await user.getIdToken();

      // Use new endpoint for personal info
      const endpoint = `${BASE_URL}/api/profile/personal-info`;

      // Build payload according to new schema
      const payload = {};
      if (fullName && fullName.trim()) payload.fullName = fullName.trim();
      if (dateOfBirth) payload.dateOfBirth = dateOfBirth;
      if (gender) payload.gender = gender;

      // Check if payload is empty
      if (Object.keys(payload).length === 0) {
        Alert.alert(t('profile.info'), t('profile.fillAtLeastOne'));
        return;
      }

      console.log('Sending personal info payload:', payload);

      // Use PUT to update personal info
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      let data;
      let finalResponse = response;

      // If profile doesn't exist (404), try to create it first
      if (response.status === 404) {
        console.log('Profile not found, creating profile first...');
        
        // Create profile with all required fields for step1
        // Check if we have minimum required data
        if (!payload.fullName && !user.displayName) {
          Alert.alert(t('profile.error'), t('profile.fullNameRequired'));
          return;
        }
        
        if (!payload.dateOfBirth) {
          Alert.alert(t('profile.error'), t('profile.dobRequired'));
          return;
        }
        
        if (!payload.gender) {
          Alert.alert(t('profile.error'), t('profile.genderRequired'));
          return;
        }
        
        // Create profile with required fields (phone is now optional)
        const createPayload = {
          fullName: payload.fullName || user.displayName || 'User',
          dateOfBirth: payload.dateOfBirth,
          gender: payload.gender,
          bloodGroup: bloodGroup || 'O+', // Default blood group
          primaryPhone: primaryPhone || user.phoneNumber || '', // Optional now
          email: email || user.email || '', // Get from Firebase user
        };
        
        console.log('Creating profile with payload:', createPayload);
        
        // Try to create profile with POST /api/profile/step1
        const createResponse = await fetch(`${BASE_URL}/api/profile/step1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createPayload),
        });

        if (createResponse.ok) {
          console.log('Profile created successfully!');
          const createData = await createResponse.json();
          
          // Profile already created with all data, so show success directly
          if (createData.success || createResponse.status === 200 || createResponse.status === 201) {
            // If photo was selected but not uploaded yet, upload photo now
            if (pendingPhoto) {
              try {
                await uploadPhoto(pendingPhoto);
                setPendingPhoto(null);
              } catch (photoError) {
                console.error('Photo upload failed:', photoError);
              }
            }
            
            Alert.alert(t('profile.success'), t('profile.profileCreated'), [
              {
                text: t('common.ok'),
                onPress: () => navigation.goBack()
              }
            ]);
            return;
          } else {
            Alert.alert(t('profile.error'), createData.message || createData.error || t('profile.somethingWentWrong'));
            return;
          }
        } else {
          const errorData = await createResponse.json().catch(() => ({ message: t('profile.networkError') }));
          console.error('Create Error:', errorData);
          Alert.alert(t('profile.error'), errorData.message || errorData.error || t('profile.somethingWentWrong'));
          return;
        }
      }

      if (!finalResponse.ok) {
        const errorData = await finalResponse.json().catch(() => ({ message: t('profile.networkError') }));
        console.error('API Error:', errorData);
        Alert.alert(t('profile.error'), errorData.message || errorData.error || `Server error: ${finalResponse.status}`);
        return;
      }

      data = await finalResponse.json();
      console.log('Response data:', data);

      if (data.success || finalResponse.status === 200) {
        // If photo was selected but not uploaded yet, upload photo now
        if (pendingPhoto) {
          try {
            await uploadPhoto(pendingPhoto);
            setPendingPhoto(null); // Clear pending photo
          } catch (photoError) {
            console.error('Photo upload failed:', photoError);
            // Continue even if photo upload fails
          }
        }
        
        Alert.alert(t('profile.success'), t('profile.profileUpdated'), [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack() // Always go back to ProfileView
          }
        ]);
      } else {
        Alert.alert(t('profile.error'), data.message || data.error || t('profile.somethingWentWrong'));
      }
    } catch (err) {
      console.error('Step 1 error:', err);
      Alert.alert(t('profile.error'), err.message || t('profile.networkError'));
    }
  };

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
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('profile.personalInformation')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Information Section */}
        <View style={styles.whiteCard}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t('profile.fullName')}</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('profile.fullNamePlaceholder')}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t('profile.gender')}</Text>
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={() => setShowGenderDropdown(!showGenderDropdown)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !gender && styles.placeholderText]}>
                {gender ? genderOptions.find(g => g.value === gender)?.label || gender : t('profile.genderPlaceholder')}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {showGenderDropdown && (
            <View style={styles.dropdownMenu}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGender(option.value);
                    setShowGenderDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{t('profile.dob')}</Text>
            <TouchableOpacity 
              style={[styles.inputContainer, styles.dateInputContainer]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateInputText, !dateOfBirth && styles.placeholderText]}>
                {dateOfBirth ? formatDateForDisplay(dateOfBirth) : t('profile.dobPlaceholder')}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>{t('profile.save')}</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  profilePhotoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profilePhotoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  profilePhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deletePhotoButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  deletePhotoText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 12,
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
  inputContainer: {
    flex: 1,
    position: 'relative',
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
  inputIcon: {
    position: 'absolute',
    right: 15,
    top: 17.5,
  },
  dateInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
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
  fullWidthInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phoneInput: {
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
  verifyButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  verifyButtonText: {
    fontSize: 16,
    color: '#8B7AD8',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 15,
  },
  nextButton: {
    backgroundColor: '#8B7AD8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProfileSetupStep1;