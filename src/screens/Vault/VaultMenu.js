import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get("window");

export default function VaultMenu({ navigation }) {
  const { t } = useTranslation();
  const vaultFeatures = [
    {
      icon: "shield-checkmark",
      title: t('vault.bankLevelSecurity'),
      description: t('vault.encryptionProtection')
    },
    {
      icon: "lock-closed",
      title: t('vault.privateAccess'),
      description: t('vault.onlyYouAccess')
    },
    {
      icon: "cloud-upload",
      title: t('vault.secureBackup'),
      description: t('vault.automaticBackups')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      <LinearGradient
        colors={['#2E8B57', '#20B2AA', '#48CAE4']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/Dashoabdicons/HealthVault.png')}
                style={styles.vaultLogo}
                resizeMode="contain"
              />
              <Text style={styles.vaultTitle}>{t('vault.title')}</Text>
            </View>
            <Text style={styles.vaultSubtitle}>
              {t('vault.subtitle')}
            </Text>
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            {/* Vault Description */}
            <View style={styles.descriptionCard}>
              <View style={styles.descriptionHeader}>
                <Ionicons name="information-circle" size={24} color="#2E8B57" />
                <Text style={styles.descriptionTitle}>{t('vault.whatIsVault')}</Text>
              </View>
              <Text style={styles.descriptionText}>
                {t('vault.vaultDescription')}
              </Text>
            </View>

            {/* Security Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>{t('vault.securityFeatures')}</Text>
              <View style={styles.featuresGrid}>
                {vaultFeatures.map((feature, index) => (
                  <View key={index} style={styles.featureCard}>
                    <View style={styles.featureIconContainer}>
                      <Ionicons name={feature.icon} size={24} color="#2E8B57" />
                    </View>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>{t('vault.accessYourVault')}</Text>
              
              {/* Access Vault Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate("VaultWelcome")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2E8B57', '#20B2AA']}
                  style={styles.buttonGradient}
                >
                  <View style={styles.buttonContent}>
                    <View style={styles.buttonIconContainer}>
                      <Ionicons name="shield" size={24} color="#fff" />
                    </View>
                    <View style={styles.buttonTextContainer}>
                      <Text style={styles.buttonTitle}>{t('vault.accessVault')}</Text>
                      <Text style={styles.buttonSubtitle}>{t('vault.openVault')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Security Notice */}
            <View style={styles.securityNoticeContainer}>
              <View style={styles.securityNoticeCard}>
                <View style={styles.securityNoticeHeader}>
                  <Ionicons name="warning" size={20} color="#FF6B6B" />
                  <Text style={styles.securityNoticeTitle}>{t('vault.importantSecurityNotice')}</Text>
                </View>
                <Text style={styles.securityNoticeText}>
                  • {t('vault.securityNotice1')}{'\n'}
                  • {t('vault.securityNotice2')}{'\n'}
                  • {t('vault.securityNotice3')}{'\n'}
                  • {t('vault.securityNotice4')}
                </Text>
              </View>
            </View>

            {/* Help Section */}
            <View style={styles.helpContainer}>
              <TouchableOpacity style={styles.helpButton}>
                <Ionicons name="help-circle-outline" size={20} color="#2E8B57" />
                <Text style={styles.helpText}>{t('vault.needHelp')}</Text>
                <Ionicons name="chevron-forward" size={16} color="#2E8B57" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 30,
  },
  backButton: {
    position: 'absolute',
    left: 30,
    top: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  vaultLogo: {
    width: 25.76,
    height: 23.18,
    marginRight: 8,
  },
  vaultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  vaultSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  contentContainer: {
    paddingHorizontal: 30,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginLeft: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 80) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 14,
  },
  actionsContainer: {
    marginBottom: 25,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    padding: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButtonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  secondaryButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 4,
  },
  secondaryButtonSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  securityNoticeContainer: {
    marginBottom: 20,
  },
  securityNoticeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  securityNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  securityNoticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginLeft: 8,
  },
  securityNoticeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#fff',
    marginHorizontal: 8,
    fontWeight: '500',
  },
});