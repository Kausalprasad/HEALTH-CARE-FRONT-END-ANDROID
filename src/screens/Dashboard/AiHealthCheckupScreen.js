import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

const HealthCheckupApp = ({ navigation }) => {
  const healthItems = [
    { 
      id: 1,
      title: 'Skin Cancer Detection', 
      subtitle: 'Get skin health analysis', 
      icon: require('../../../assets/AiHealthCheckUp/skinCancerDectection.png'),
      iconBg: '#FBBF24',
      cardBg: '#1F2937', // Dark gray for first card
      textColor: '#FFFFFF',
      subtitleColor: '#E5E7EB',
      onPress: () => navigation.navigate('SkinCheck') 
    },
    { 
      id: 2,
      title: 'Eye Health', 
      subtitle: 'Eye health recommendation', 
      icon: require('../../../assets/AiHealthCheckUp/eye.png'),
      iconBg: '#FF9800',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      textColor: '#1F2937',
      subtitleColor: '#6B7280',
      onPress: () => navigation.navigate('EyeScreen') 
    },
    { 
      id: 3,
      title: 'Nail Health', 
      subtitle: 'Get insights with nail health', 
      icon: require('../../../assets/AiHealthCheckUp/nail1.png'),
      iconBg: '#9C27B0',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      textColor: '#1F2937',
      subtitleColor: '#6B7280',
      onPress: () => navigation.navigate('NailAnalysis') 
    },
    { 
      id: 4,
      title: 'Tongue Health', 
      subtitle: 'Analyze your tongue condition', 
      icon: require('../../../assets/AiHealthCheckUp/tough1.png'),
      iconBg: '#2196F3',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      textColor: '#1F2937',
      subtitleColor: '#6B7280',
      onPress: () => navigation.navigate('TongueDiseaseChecker') 
    },
    { 
      id: 5,
      title: 'Scalp Health', 
      subtitle: 'Get scalp health analysis', 
      icon: require('../../../assets/AiHealthCheckUp/Hair.png'),
      iconBg: '#4CAF50',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      textColor: '#1F2937',
      subtitleColor: '#6B7280',
      onPress: () => navigation.navigate('HairCheckScreen') 
    },
    { 
      id: 6,
      title: 'Posture Analysis', 
      subtitle: 'Live posture risk detection', 
      icon: require('../../../assets/AiHealthCheckUp/PostureAnalysis.png'),
      iconBg: '#00BCD4',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      textColor: '#1F2937',
      subtitleColor: '#6B7280',
      onPress: () => navigation.navigate('InjuryScreen') 
    },
    { 
      id: 7,
      title: 'Genomic Insights',
      subtitle: 'AI-based health risk analysis', 
      icon: require('../../../assets/AiHealthCheckUp/Genomic.png'),
      iconBg: '#607D8B',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      textColor: '#1F2937',
      subtitleColor: '#6B7280',
      onPress: () => navigation.navigate('RiskAssessmentScreen') 
    },
    { 
      id: 8,
      title: 'Dental Analysis', 
      subtitle: 'AI-powered dental health detection', 
      icon: require('../../../assets/AiHealthCheckUp/theet.png'),
      iconBg: '#009688',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      textColor: '#1F2937',
      subtitleColor: '#6B7280',
      onPress: () => navigation.navigate('DentalCheckScreen') 
    },
    {
      id: 9,
      title: 'Breast Cancer Analysis',
      subtitle: 'AI-powered breast cancer detection',
      icon: require('../../../assets/AiHealthCheckUp/BresastCancer.png'),
      iconBg: '#E91E63',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      textColor: '#1F2937',
      subtitleColor: '#6B7280',
      onPress: () => navigation.navigate('BreastAnalysisScreen'),
    },
    {
      id: 10,
      title: 'PCOS Test',
      subtitle: 'AI-powered PCOSS detection',
      icon: require('../../../assets/AiHealthCheckUp/PcossTest.png'),
      iconBg: '#FF5722',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      textColor: '#1F2937',
      subtitleColor: '#6B7280',
      onPress: () => navigation.navigate('PCOSScreening'),
    }
  ];

  const renderHealthCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.healthCard,
        { 
          backgroundColor: item.cardBg,
          width: cardWidth,
          borderColor: item.id === 1 ? 'transparent' : 'rgba(233, 233, 233, 1)'
        }
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Image 
            source={item.icon} 
            style={[
              styles.iconImage,
              item.id === 2 ? { width: 32, height: 20 } : { width: 40, height: 40 }
            ]}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.cardTitle, { color: item.textColor }]}>
          {item.title}
        </Text>
        <Text style={[styles.cardSubtitle, { color: item.subtitleColor }]}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[
        'rgba(254, 215, 112, 0.9)',  // Yellow (top-left)
        'rgba(235, 177, 180, 0.8)',  // Pink (top-center)
        'rgba(145, 230, 251, 0.7)',  // Blue (top-right)
        'rgba(217, 213, 250, 0.6)',  // Purple (middle)
        'rgba(255, 255, 255, 0.95)'  // White (bottom)
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Health Checkup</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.cardsContainer}>
            {healthItems.map((item) => renderHealthCard(item))}
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
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontFamily: "Poppins_400Regular",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  healthCard: {
    borderRadius: 30,
    padding: 16,
    marginBottom: 16,
    minHeight: 160,
    borderWidth: 1,
    borderColor: 'rgba(233, 233, 233, 1)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: "Poppins_400Regular",
    marginBottom: 6,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
  }
});

export default HealthCheckupApp;
