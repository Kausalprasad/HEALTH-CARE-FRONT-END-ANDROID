import React, { useEffect, useRef, useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  Image,
  Easing,
  Switch,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { BASE_URL } from '../config/config';

const { width: screenWidth } = Dimensions.get('window');

const Sidebar = ({ visible, onClose, navigation }) => {
  const { logout, user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [appNotifications, setAppNotifications] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handlePress = () => {
    navigation.navigate('ProfileViewScreen');
  };

  const slideAnim = useRef(new Animated.Value(-screenWidth * 0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
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
    }
  };

  useEffect(() => {
    fetchProfile(); // Always fetch when component mounts
  }, []);

  useEffect(() => {
    // Stop any ongoing animations
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    if (visible) {
      fetchProfile(); // Also fetch when sidebar opens
      // Always reset to initial position before animating
      slideAnim.setValue(-screenWidth * 0.8);
      overlayOpacity.setValue(0);
      
      // Small delay to ensure reset is applied
      setTimeout(() => {
        animationRef.current = Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]);
        animationRef.current.start(() => {
          animationRef.current = null;
        });
      }, 10);
    } else {
      animationRef.current = Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -screenWidth * 0.8,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start((finished) => {
        if (finished) {
          // Ensure it's at the exact closed position
          slideAnim.setValue(-screenWidth * 0.8);
          overlayOpacity.setValue(0);
        }
        animationRef.current = null;
      });
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [visible]);

  const menuItems = [
    { 
      icon: 'medical-outline', 
      title: 'Book Appointment', 
      route: 'Doctors',
      iconColor: '#8B5CF6', // Purple for stethoscope
    },
    { 
      icon: 'document-text-outline', 
      title: 'Health Blogs', 
      route: 'Blogs',
      iconColor: '#F97316', // Orange for documents
    },
  ];

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
          try {
            if (logout) {
              await logout();
            } else {
              // Fallback logout
              const { signOut } = require('firebase/auth');
              const auth = getAuth();
              await signOut(auth);
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            }
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout');
          }
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const auth = getAuth();
              const user = auth.currentUser;
              if (!user) {
                Alert.alert('Error', 'User not authenticated');
                return;
              }
              const token = await user.getIdToken();

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
                if (logout) {
                  await logout();
                } else {
                  const { signOut } = require('firebase/auth');
                  await signOut(auth);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Landing' }],
                  });
                }
                Alert.alert('Success', 'Account deleted successfully');
              } else {
                Alert.alert('Error', data.message || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (!visible) return null;

  const profilePhotoUrl = profile?.personalInfo?.profilePhoto?.url 
    ? `${BASE_URL}${profile.personalInfo.profilePhoto.url}` 
    : null;
  
  const displayName = profile?.personalInfo?.fullName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.contactInfo?.email || user?.email || 'email';

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar, 
          { 
            transform: [{ translateX: slideAnim }],
            width: screenWidth * 0.8,
          }
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
        
        {/* User Profile */}
        <TouchableOpacity style={styles.profileSection} onPress={handlePress}>
          <View style={styles.profilePic}>
            {profilePhotoUrl ? (
              <Image 
                source={{ uri: profilePhotoUrl }} 
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.profileInitial}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
            <Text style={styles.userName}>{displayName}</Text>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <View key={index}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                navigation.navigate(item.route);
              }}
            >
                  <Ionicons name={item.icon} size={24} color={item.iconColor} style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
                <View style={styles.divider} />
        </View>
            ))}

            {/* Settings with Expandable Sub-menu */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setSettingsExpanded(!settingsExpanded)}
              >
                <Ionicons name="settings-outline" size={24} color="#22C55E" style={styles.menuIcon} />
                <Text style={styles.menuText}>Settings</Text>
                <Ionicons 
                  name={settingsExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#000000" 
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>
              
              {settingsExpanded && (
                <View style={styles.settingsSubMenu}>
                  <TouchableOpacity
                    style={styles.subMenuItem}
                    onPress={() => {
                      onClose();
                      // Navigate to languages screen if exists
                      // navigation.navigate('Languages');
                    }}
                  >
                    <Text style={styles.subMenuText}>Languages</Text>
                  </TouchableOpacity>
                  <View style={styles.subMenuItem}>
                    <Text style={styles.subMenuText}>App Notifications</Text>
                    <Switch
                      value={appNotifications}
                      onValueChange={setAppNotifications}
                      trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                      thumbColor={appNotifications ? '#FFFFFF' : '#FFFFFF'}
                      ios_backgroundColor="#E5E7EB"
                    />
                  </View>
                </View>
              )}
              <View style={styles.divider} />
            </View>

            {/* About */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  navigation.navigate('AboutScreen');
                }}
              >
                <Ionicons name="information-circle-outline" size={24} color="#3B82F6" style={styles.menuIcon} />
                <Text style={styles.menuText}>About</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </View>

            {/* Disclaimer */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  navigation.navigate('MedicalDisclaimerScreen');
                }}
              >
                <Ionicons name="warning-outline" size={24} color="#FBBF24" style={styles.menuIcon} />
                <Text style={styles.menuText}>Disclaimer</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </View>

            {/* Privacy Policies */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  navigation.navigate('PrivacyPolicyScreen');
                }}
              >
                <Ionicons name="people-outline" size={24} color="#EC4899" style={styles.menuIcon} />
                <Text style={styles.menuText}>Privacy Policies</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </View>
          </View>
        </ScrollView>

        {/* Logout at Bottom */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" style={styles.menuIcon} />
            <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Logout Confirmation Dialog */}
      <Modal
        visible={showLogoutDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={handleLogoutCancel}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            {/* Logout Icon */}
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={48} color="#EF4444" />
            </View>

            {/* Title */}
            <Text style={styles.dialogTitle}>Logout?</Text>

            {/* Message */}
            <Text style={styles.dialogMessage}>You're about to end your session.</Text>

            {/* Buttons */}
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleLogoutCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogoutConfirm}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    elevation: 2000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: screenWidth * 0.8,
    maxWidth: screenWidth * 0.8,
    backgroundColor: '#FFFFFF',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    zIndex: 2001,
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    alignSelf: 'flex-start',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B6FA3',
    fontFamily: 'Poppins_400Regular',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins_400Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  menuSection: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  menuIcon: {
    marginRight: 18,
    width: 24,
  },
  menuText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Poppins_400Regular',
    fontWeight: '500',
    flex: 1,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  settingsSubMenu: {
    paddingLeft: 62, // Align with menu items (icon width + margin)
    paddingRight: 20,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  subMenuText: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 20,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontFamily: 'Poppins_400Regular',
    fontWeight: '500',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: screenWidth * 0.85,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  logoutIconContainer: {
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
  },
  dialogMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Poppins_400Regular',
  },
  dialogButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    marginLeft: 6,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: 'Poppins_400Regular',
  },
});

export default Sidebar;