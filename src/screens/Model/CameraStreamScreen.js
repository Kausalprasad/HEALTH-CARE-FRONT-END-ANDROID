import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Linking, Alert } from 'react-native';

const CameraStreamScreen = () => {
  const CAMERA_URL = 'https://skin.healnova.ai/camera';

  useEffect(() => {
    const openStream = async () => {
      try {
        const supported = await Linking.canOpenURL(CAMERA_URL);
        if (supported) {
          await Linking.openURL(CAMERA_URL); // Open in browser automatically
        } else {
          Alert.alert('Error', 'Cannot open this link: ' + CAMERA_URL);
        }
      } catch (err) {
        console.error('Error opening browser:', err);
        Alert.alert('Error', 'Something went wrong.');
      }
    };

    openStream();
  }, []);

  // Optional loader in case user comes back
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C63FF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CameraStreamScreen;
