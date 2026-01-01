import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function PermissionHandler({ onOpenSettings }) {
  const { t } = useTranslation();
  const handleOpenSettings = () => {
    try {
      if (onOpenSettings && typeof onOpenSettings === 'function') {
        onOpenSettings();
      } else {
        // Fallback: Try to open Health Connect app directly
        Linking.openURL('market://details?id=com.google.android.apps.healthdata').catch(() => {
          // If Play Store app not available, open in browser
          Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata').catch((err) => {
            console.error('❌ Error opening Health Connect:', err);
          });
        });
      }
    } catch (error) {
      console.error('❌ Error in handleOpenSettings:', error);
      // Try to open Play Store as fallback
      Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata').catch(() => {
        console.error('❌ Could not open Play Store');
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="heart-outline" size={64} color="#3B82F6" />
        </View>
        
        <Text style={styles.title}>{t('vitals.healthConnectRequired')}</Text>
        
        <Text style={styles.desc}>
          {t('vitals.healthConnectDesc')}
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleOpenSettings}
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{t('vitals.downloadHealthConnect')}</Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          {t('vitals.healthConnectNote')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});




