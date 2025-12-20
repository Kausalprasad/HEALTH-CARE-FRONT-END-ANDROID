import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MotherBabyCareScreen = ({ navigation }) => {
  const handlePregnancyClick = () => {
    navigation.navigate('PregnancyScreen');
  };

  const handleBabyCareClick = () => {
    navigation.navigate('BabyScreen');
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
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mother Baby Care</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Illustration Area */}
          <View style={styles.illustrationContainer}>
            <View style={styles.circleContainer}>
              <Image
                source={require('../../../assets/icons/babymother.png')}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Descriptive Text */}
          <Text style={styles.descriptionText}>
            Personalized wellness support for mother and child, from pregnancy to post-care.
          </Text>

          {/* Cards Container */}
          <View style={styles.cardsContainer}>
            {/* Pregnancy Care Card */}
            <TouchableOpacity 
              style={styles.card}
              onPress={handlePregnancyClick}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, styles.pregnancyIconBg]}>
                <Image
                  source={require('../../../assets/icons/pergnacy.png')}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Pregnancy Care</Text>
                <Text style={styles.cardDescription}>
                  Get personalized tips for your pregnancy.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Baby Care Card */}
            <TouchableOpacity 
              style={styles.card}
              onPress={handleBabyCareClick}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, styles.babyIconBg]}>
                <Image
                  source={require('../../../assets/icons/baby.png')}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Baby Care</Text>
                <Text style={styles.cardDescription}>
                  Expert advice for your baby's growth and health.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  headerPlaceholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  circleContainer: {
    width: 340,
    height: 360,
    borderRadius: 170,
    backgroundColor: 'rgba(145, 230, 251, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustrationImage: {
    width: 311,
    height: 335,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
    lineHeight: 22,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.86,
    borderColor: 'rgba(233, 233, 233, 1)',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pregnancyIconBg: {
    backgroundColor: 'transparent',
  },
  babyIconBg: {
    backgroundColor: 'transparent',
  },
  iconImage: {
    width: 50,
    height: 50,
  },
  cardContent: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default MotherBabyCareScreen;