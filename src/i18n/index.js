import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en/translation.json';
import mn from './locales/mn/translation.json';

const LANGUAGE_KEY = '@app_language';

// Get saved language
const getSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    return savedLanguage || 'en';
  } catch (error) {
    console.log('Error getting language:', error);
    return 'en';
  }
};

// Initialize i18n synchronously
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3', // Important for Expo
    resources: {
      en: { translation: en },
      mn: { translation: mn },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Important for React Native
    },
    initImmediate: false, // Ensure i18n is ready before components use it
  });

// Load saved language after init (non-blocking)
getSavedLanguage().then((lang) => {
  if (lang && i18n.hasResourceBundle(lang, 'translation')) {
    i18n.changeLanguage(lang).catch(() => {
      // Fallback to default if change fails
      console.log('Failed to change language, using default');
    });
  }
}).catch(() => {
  // If language loading fails, continue with default
  console.log('Language loading failed, using default');
});

// Export language change function
export const changeLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export default i18n;

