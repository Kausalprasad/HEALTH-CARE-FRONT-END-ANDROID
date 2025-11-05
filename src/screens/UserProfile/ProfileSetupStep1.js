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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';

const ProfileSetupStep1 = ({ navigation, route }) => {
  // Check if in edit mode
  const { params } = route;
  const isEdit = params?.isEdit || false;
  const profileData = params?.profileData || null;

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [patientId, setPatientId] = useState('');
  const [email, setEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && profileData) {
      setFullName(profileData.basicInfo?.fullName || '');
      setDateOfBirth(profileData.basicInfo?.dateOfBirth ? 
        new Date(profileData.basicInfo.dateOfBirth).toISOString().split('T')[0] : '');
      setGender(profileData.basicInfo?.gender || '');
      setBloodGroup(profileData.basicInfo?.bloodGroup || '');
      setPatientId(profileData.basicInfo?.patientID || '');
      setEmail(profileData.contactInfo?.email || '');
      setPrimaryPhone(profileData.contactInfo?.primaryPhone || '');
      
      // Set current profile photo
      if (profileData.basicInfo?.profilePhoto?.url) {
        setProfilePhoto(`${BASE_URL}${profileData.basicInfo.profilePhoto.url}`);
      }
    }
  }, [isEdit, profileData]);

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
    setPhotoUploading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        setPhotoUploading(false);
        return;
      }

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

  // Delete photo
  const deletePhoto = async () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${BASE_URL}/api/profile/photo`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await response.json();
              if (data.success) {
                setProfilePhoto(null);
                Alert.alert('Success', 'Profile photo removed');
              } else {
                Alert.alert('Error', data.message || 'Failed to delete photo');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const handleNext = async () => {
    if (!fullName || !dateOfBirth || !gender || !bloodGroup || !primaryPhone) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Different endpoint for edit vs create
      const endpoint = isEdit ? `${BASE_URL}/api/profile` : `${BASE_URL}/api/profile/step1`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit ? {
        // For edit, send complete profile update
        'basicInfo.fullName': fullName,
        'basicInfo.dateOfBirth': dateOfBirth,
        'basicInfo.gender': gender,
        'basicInfo.bloodGroup': bloodGroup,
        'basicInfo.patientID': patientId,
        'contactInfo.primaryPhone': primaryPhone,
        'contactInfo.email': email,
      } : {
        // For create, send step1 data
        fullName,
        dateOfBirth,
        gender,
        bloodGroup,
        patientId,
        email,
        primaryPhone,
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
          Alert.alert('Success', 'Basic information updated!', [
            {
              text: 'OK',
              onPress: () => navigation.goBack() // Go back to ProfileView
            }
          ]);
        } else {
          Alert.alert('Success', 'Step 1 completed!');
          navigation.navigate('ProfileSetupStep2');
        }
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Step 1 error:', err);
      Alert.alert('Error', 'Server error');
    }
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
          {isEdit ? 'Edit Basic Info' : 'Profile Setup'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={styles.profilePhotoContainer}>
          <TouchableOpacity 
            style={styles.profilePhotoCircle}
            onPress={selectPhoto}
            disabled={photoUploading}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <Ionicons name="image-outline" size={32} color="#8B7AD8" />
              </View>
            )}
            
            {photoUploading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
            
            <View style={styles.addIcon}>
              <Ionicons name="add" size={16} color="#8B7AD8" />
            </View>
          </TouchableOpacity>

          {profilePhoto && !photoUploading && (
            <TouchableOpacity style={styles.deletePhotoButton} onPress={deletePhoto}>
              <Text style={styles.deletePhotoText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic information</Text>
          
          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor="#999"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={() => setShowGenderDropdown(!showGenderDropdown)}
            >
              <Text style={[styles.dropdownText, !gender && styles.placeholderText]}>
                {gender || 'Gender'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {showGenderDropdown && (
            <View style={styles.dropdownMenu}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGender(option);
                    setShowGenderDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
              <Ionicons name="calendar-outline" size={20} color="#8B7AD8" style={styles.inputIcon} />
            </View>
            
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={() => setShowBloodGroupDropdown(!showBloodGroupDropdown)}
            >
              <Text style={[styles.dropdownText, !bloodGroup && styles.placeholderText]}>
                {bloodGroup || 'Blood Group'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

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
                >
                  <Text style={styles.dropdownItemText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInput
            style={styles.fullWidthInput}
            value={patientId}
            onChangeText={setPatientId}
            placeholder="Patient ID (Optional)"
            placeholderTextColor="#999"
          />
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          
          <TextInput
            style={styles.fullWidthInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.phoneContainer}>
            <TextInput
              style={styles.phoneInput}
              value={primaryPhone}
              onChangeText={setPrimaryPhone}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.verifyButton}>
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isEdit ? 'Update' : 'Next'}
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
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
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
  dropdownContainer: {
    flex: 1,
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