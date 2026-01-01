import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import ErrorBoundary from '../../components/vitals/ErrorBoundary';
import { useTranslation } from 'react-i18next';

// Lazy load VitalsDashboard to prevent crashes if module import fails
let VitalsDashboard = null;
try {
  VitalsDashboard = require('../../components/vitals/VitalsDashboard').default;
} catch (importError) {
  console.error('❌ [VitalsScreen] Failed to import VitalsDashboard:', importError);
}

export default function VitalsScreen() {
  const { t } = useTranslation();
  // If dashboard failed to load, show error screen
  if (!VitalsDashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>{t('vitals.unableToLoad')}</Text>
          <Text style={styles.errorMessage}>
            {t('vitals.unableToLoadMessage')}
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
            <Text style={styles.errorTitle}>{t('vitals.somethingWentWrong')}</Text>
            <Text style={styles.errorMessage}>
              {t('vitals.errorMessage')}
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


