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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/config';

const { width: screenWidth } = Dimensions.get('window');

const Sidebar = ({ visible, onClose, navigation }) => {
  const { logout, user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  const handlePress = () => {
    navigation.navigate('UserProfileScreen');
  };

  const slideAnim = useRef(new Animated.Value(-screenWidth * 0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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
    }
  };

  useEffect(() => {
    if (visible) {
      fetchProfile();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -screenWidth * 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const menuItems = [
    { icon: 'calendar-outline', title: 'Book Appointment', route: 'Doctors' },
    { icon: 'flask-outline', title: 'Book Lab Tests', route: 'UserProfileScreen' },
    { icon: 'medical-outline', title: 'Order Medicines', route: 'OrderMedicines' },
    { icon: 'settings-outline', title: 'Settings', route: 'AboutScreen' },
    { icon: 'newspaper-outline', title: 'Blogs', route: 'Blogs' },
  ];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  if (!visible) return null;

  const profilePhotoUrl = profile?.basicInfo?.profilePhoto?.url 
    ? `${BASE_URL}${profile.basicInfo.profilePhoto.url}` 
    : null;
  
  const displayName = profile?.basicInfo?.fullName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.contactInfo?.email || user?.email || 'email';

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        
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
          <View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.slice(0, 3).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                onClose();
                navigation.navigate(item.route);
              }}
            >
              <Ionicons name={item.icon} size={24} color="#6B6FA3" style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Second Menu Section */}
        <View style={styles.menuSection}>
          {menuItems.slice(3).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                onClose();
                navigation.navigate(item.route);
              }}
            >
              <Ionicons name={item.icon} size={24} color="#6B6FA3" style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#6B6FA3" style={styles.menuIcon} />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
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
    zIndex: 1000,
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
    backgroundColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  closeButton: {
    padding: 5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    paddingTop: 60,
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
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
    fontFamily: 'Poppins_400Regular',
  },
  userEmail: {
    fontSize: 13,
    color: '#999999',
    fontFamily: 'Poppins_400Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginVertical: 10,
  },
  menuSection: {
    paddingVertical: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
  },
  menuIcon: {
    marginRight: 18,
    width: 24,
  },
  menuText: {
    fontSize: 16,
    color: '#2D2D2D',
    fontFamily: 'Poppins_400Regular',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    marginTop: 0,
  },
});

export default Sidebar;