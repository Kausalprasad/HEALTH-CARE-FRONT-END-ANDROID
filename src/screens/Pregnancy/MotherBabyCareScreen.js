import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MotherBabyCareScreen = ({ navigation }) => {
  const handlePregnancyClick = () => {
    navigation.navigate('PregnancyScreen');
  };

  const handleBabyCareClick = () => {
    navigation.navigate('BabyScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mother & Baby Care</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Illustration Area - No padding bottom */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../../assets/Dashoabdicons/Motherbaby.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* Cards Container - Starts immediately after illustration */}
        <View style={styles.cardsContainer}>
          {/* Pregnancy Care Card */}
          <TouchableOpacity 
            style={[styles.card, styles.firstCard]}
            onPress={handlePregnancyClick}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, styles.pregnancyIconBg]}>
              <Image
                source={require('../../../assets/Dashoabdicons/p.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Pregnancy Care</Text>
              <Text style={styles.cardDescription}>
                Get personalized recommendations for your pregnancy journey
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
                source={require('../../../assets/Dashoabdicons/Baby.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Baby Care</Text>
              <Text style={styles.cardDescription}>
                Expert guidance for your baby's development and health
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8E8E8',
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
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 0,
    marginBottom: -20,
  },
  illustrationImage: {
    width: 320,
    height: 250,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    marginTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minHeight: 120,
  },
  firstCard: {
    marginTop: 0,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pregnancyIconBg: {
    backgroundColor: '#E8EAF6',
  },
  babyIconBg: {
    backgroundColor: '#E8EAF6',
  },
  iconImage: {
    width: 44,
    height: 44,
  },
  cardContent: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
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