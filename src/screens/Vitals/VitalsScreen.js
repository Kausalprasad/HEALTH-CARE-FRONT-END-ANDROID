import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import ErrorBoundary from '../../components/vitals/ErrorBoundary';

// Lazy load VitalsDashboard to prevent crashes if module import fails
let VitalsDashboard = null;
try {
  VitalsDashboard = require('../../components/vitals/VitalsDashboard').default;
} catch (importError) {
  console.error('❌ [VitalsScreen] Failed to import VitalsDashboard:', importError);
}

export default function VitalsScreen() {
  // If dashboard failed to load, show error screen
  if (!VitalsDashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Unable to Load Vitals</Text>
          <Text style={styles.errorMessage}>
            The Vitals feature could not be loaded.{'\n\n'}
            This may happen if:{'\n'}
            • Health Connect module is not properly linked{'\n'}
            • You are using Expo Go (use development build instead){'\n\n'}
            The app will continue to work. You can use other features normally.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>😔</Text>
            <Text style={styles.errorTitle}>Something Went Wrong</Text>
            <Text style={styles.errorMessage}>
              The Vitals screen encountered an error.{'\n\n'}
              Please go back and try again.{'\n\n'}
              The app will continue to work. This is a non-critical error.
            </Text>
          </View>
        </SafeAreaView>
      }
    >
      <SafeAreaView style={styles.container}>
        <VitalsDashboard />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});


