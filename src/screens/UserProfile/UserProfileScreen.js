import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';

const ProfileSetupScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState(null);

  // Check profile status on component mount
  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Call the profile status API
      const response = await fetch(`${BASE_URL}/api/profile/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('=== PROFILE STATUS DEBUG ===');
    console.log('Full API Response:', JSON.stringify(data, null, 2));
    console.log('Profile Exists:', data.profileExists);
    console.log('Is Complete:', data.isComplete);
    console.log('Completion %:', data.completionStatus?.completionPercentage);
    console.log('Step3 Complete:', data.completionStatus?.step3Completed);
    console.log('================================');
      if (data.success) {
        if (data.profileExists && data.isComplete) {
          // Profile is complete - redirect to view profile
          navigation.replace('ProfileViewScreen');
          return;
        } else if (data.profileExists && !data.isComplete) {
          // Profile exists but incomplete - show continue option
          setProfileStatus({
            exists: true,
            complete: false,
            nextStep: data.nextStep
          });
        } else {
          // No profile exists - show create profile
          setProfileStatus({
            exists: false,
            complete: false,
            nextStep: 1
          });
        }
      }
    } catch (error) {
      console.error('Profile status check error:', error);
      // If API fails, assume no profile exists
      setProfileStatus({
        exists: false,
        complete: false,
        nextStep: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    if (profileStatus && profileStatus.exists && !profileStatus.complete) {
      // Continue from where user left off
      navigation.navigate(`ProfileSetupStep${profileStatus.nextStep}`);
    } else {
      // Start from beginning
      navigation.navigate('ProfileSetupStep1');
    }
  };

  const handleViewProfile = () => {
    navigation.navigate('ProfileViewScreen');
  };

  const handleSkipForNow = () => {
    navigation.navigate('DashboardScreen');
    console.log('Skip for now pressed');
  };

  // Show loading while checking status
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c7ce0" />
          <Text style={styles.loadingText}>Checking profile status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If profile is complete, show View Profile option
  if (profileStatus && profileStatus.exists && profileStatus.complete) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        
        <View style={styles.content}>
          {/* Profile Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.profileIcon, styles.completedProfileIcon]}>
              <Ionicons name="checkmark-circle" size={60} color="#4ade80" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Profile Complete!</Text>

          {/* Description */}
          <Text style={styles.description}>
            Your profile is all set up.{'\n'}You can view or edit your{'\n'}information anytime.
          </Text>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* View Profile Button */}
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleViewProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>View Profile</Text>
          </TouchableOpacity>

          {/* Back to Dashboard */}
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkipForNow}
            activeOpacity={0.6}
          >
            <Text style={styles.skipButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Default view for incomplete or new profile
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.content}>
        {/* Profile Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.profileIcon}>
            <View style={styles.profileIconInner}>
              <View style={styles.avatarCircle} />
              <View style={styles.bodyShape} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {profileStatus && profileStatus.exists ? 
            'Complete Your\nProfile' : 
            'Let\'s Set Up\nyour Profile'
          }
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          {profileStatus && profileStatus.exists ? 
            'Finish setting up your profile\nto access all features.' :
            'Add your details once and\naccess all your medical\ninfo easily.'
          }
        </Text>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Create/Continue Profile Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>
            {profileStatus && profileStatus.exists ? 
              'Continue Profile' : 
              'Create Profile'
            }
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkipForNow}
          activeOpacity={0.6}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096',
  },
  content: {
    marginTop: StatusBar.currentHeight || 0,
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  profileIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#7c7ce0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  completedProfileIcon: {
    borderColor: '#4ade80',
    backgroundColor: '#f0fdf4',
  },
  profileIconInner: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7c7ce0',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  bodyShape: {
    width: 50,
    height: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderWidth: 2,
    borderColor: '#7c7ce0',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  spacer: {
    flex: 1,
    minHeight: 60,
  },
  createButton: {
    backgroundColor: '#7c7ce0',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#7c7ce0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  skipButtonText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileSetupScreen;