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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { BASE_URL } from '../../config/config';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const ContactSecurityScreen = ({ navigation, route }) => {
  const { params } = route;
  const isEdit = params?.isEdit || false;
  const profileData = params?.profileData || null;
  const auth = getAuth();

  const [email, setEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && profileData) {
      setEmail(profileData.contactInfo?.email || '');
      setPrimaryPhone(profileData.contactInfo?.primaryPhone || '');
    } else {
      // Get from Firebase user if not editing
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email || '');
        setPrimaryPhone(user.phoneNumber || '');
      }
    }
  }, [isEdit, profileData]);

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const token = await user.getIdToken();

      // Use new endpoint for contact info
      const endpoint = `${BASE_URL}/api/profile/contact-info`;
      const payload = {};
      if (email && email.trim()) payload.email = email.trim();
      if (primaryPhone && primaryPhone.trim()) payload.primaryPhone = primaryPhone.trim();

      if (Object.keys(payload).length === 0) {
        Alert.alert('Info', 'Please fill at least one field to update');
        return;
      }

      console.log('Sending contact info payload:', payload);

      setLoading(true);
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
        
        const createPayload = {
          fullName: user.displayName || 'User',
          dateOfBirth: new Date().toISOString().split('T')[0],
          gender: 'Male',
          bloodGroup: 'O+',
          primaryPhone: primaryPhone || user.phoneNumber || '',
          email: email || user.email || '',
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
          console.log('Profile created, now updating contact info...');
          response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
        } else {
          const errorData = await createResponse.json().catch(() => ({ message: 'Network error' }));
          Alert.alert('Error', errorData.message || errorData.error || 'Failed to create profile. Please complete Personal Information first.');
          setLoading(false);
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        Alert.alert('Error', errorData.message || errorData.error || `Server error: ${response.status}`);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success || response.status === 200) {
        Alert.alert('Success', 'Contact information updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert('Error', data.message || data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Contact Security error:', err);
      Alert.alert('Error', err.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!email || !email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch(`${BASE_URL}/api/profile/verify-email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success || response.status === 200) {
        Alert.alert('Success', 'Verification email sent! Please check your inbox.');
      } else {
        Alert.alert('Error', data.message || data.error || 'Failed to send verification email');
      }
    } catch (err) {
      console.error('Verify email error:', err);
      Alert.alert('Error', err.message || 'Network error. Please check your connection.');
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
        <Text style={styles.headerTitle}>Contact and Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* White Card */}
        <View style={styles.whiteCard}>
          {/* Email Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="email@address.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleVerifyEmail}
                activeOpacity={0.7}
              >
                <Text style={styles.verifyButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Number Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              value={primaryPhone}
              onChangeText={setPrimaryPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Inter_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  whiteCard: {
    backgroundColor: '#FFFFFFBF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  inputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Inter_400Regular',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  verifyButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#9C27B0',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_700Bold',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 14,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 20 : 30,
    paddingTop: 15,
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});

export default ContactSecurityScreen;

