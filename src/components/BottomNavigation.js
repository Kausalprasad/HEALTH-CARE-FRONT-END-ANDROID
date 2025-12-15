import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeIcon from '../../assets/Dashoabdicons/Home1.png';
import DeitIcon from '../../assets/Dashoabdicons/Diet1.png';
import VitalsIcon from '../../assets/Dashoabdicons/Vitals1.png';
import VaultIcon from '../../assets/Dashoabdicons/Vault1.png';

const { width } = Dimensions.get('window');

export default function BottomNavigation({ navigation, activeScreen = 'Home' }) {
  return (
    <View style={styles.bottomNavContainer}>
      {/* White Main Body with Icons */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('DashboardScreen')}
        >
          <Image 
            source={HomeIcon}
            style={[
              styles.homeIcon,
              { opacity: activeScreen === 'Home' ? 1 : 0.5 }
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('DietScreen')}
        >
         <Image 
            source={DeitIcon}
            style={[
              styles.homeIcon,
              { opacity: activeScreen === 'Home' ? 1 : 0.5 }
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('VitalsScreen')}
        >
           <Image 
            source={VitalsIcon}
            style={[
              styles.homeIcon,
              { opacity: activeScreen === 'Home' ? 1 : 0.5 }
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('LoginVaultId')}
        >
          <Image 
            source={VaultIcon}
            style={[
              styles.homeIcon,
              { opacity: activeScreen === 'Home' ? 1 : 0.5 }
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  homeIcon: {
    width: 24,
    height: 24,
  },
});

