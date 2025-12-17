import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function BottomNavigation({ navigation, activeScreen = 'Home', onMenuPress }) {
  return (
    <LinearGradient
      colors={["#F5D391", "#DADEE3", "#A6E2F1"]}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.bottomNavContainer}
    >
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            // Open sidebar - use callback if provided, otherwise try drawer navigation
            if (onMenuPress) {
              onMenuPress();
            } else if (navigation.openDrawer) {
              navigation.openDrawer();
            } else {
              navigation.navigate('VaultMenu');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="menu" 
            size={24} 
            color="#4A4A4A" 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('DashboardScreen')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color="#4A4A4A" 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('VaultWelcome')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="lock-closed" 
            size={24} 
            color="#4A4A4A" 
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    width: 377,
    height: 63,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: 999,
    elevation: 999,
  },
  bottomNav: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
