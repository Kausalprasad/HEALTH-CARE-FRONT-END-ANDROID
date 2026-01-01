import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';

export default function LanguageScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  ];

  const handleLanguageChange = async (langCode) => {
    try {
      await changeLanguage(langCode);
      setCurrentLang(langCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <LinearGradient
      colors={[
        'rgba(254, 215, 112, 0.9)',
        'rgba(235, 177, 180, 0.8)',
        'rgba(145, 230, 251, 0.7)',
        'rgba(217, 213, 250, 0.6)',
        'rgba(255, 255, 255, 0.95)'
      ]}
      locations={[0, 0.2, 0.4, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('language.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.currentLanguageText}>
              {t('language.currentLanguage')}: {currentLang === 'en' ? 'English' : 'Монгол'}
            </Text>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageCard,
                  currentLang === lang.code && styles.languageCardSelected
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <View style={styles.languageInfo}>
                  <Text style={[
                    styles.languageName,
                    currentLang === lang.code && styles.languageNameSelected
                  ]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.languageCode}>{lang.name}</Text>
                </View>
                {currentLang === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 0,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  currentLanguageText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fdf4',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  languageNameSelected: {
    color: '#4CAF50',
  },
  languageCode: {
    fontSize: 14,
    color: '#666',
  },
});

