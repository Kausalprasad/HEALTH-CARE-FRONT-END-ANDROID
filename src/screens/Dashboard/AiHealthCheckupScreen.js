import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HealthCheckupApp = ({ navigation }) => {
  const healthItems = [
    { 
      title: 'Skin Health', 
      subtitle: 'Get skin health analysis', 
      icon: require('../../../assets/AiHealthCheckUp/skinHealth.png'),
      bgColor: '#EAEAF8',
      onPress: () => navigation.navigate('SkinCheck') 
    },
    { 
      title: 'Eye Health', 
      subtitle: 'Eye health recommendations', 
      icon: require('../../../assets/AiHealthCheckUp/eye3.png'),
      bgColor: '#EAEAF8',
      onPress: () => navigation.navigate('EyeScreen') 
    },
    { 
      title: 'Nail Health', 
      subtitle: 'Get insights with nail health', 
      icon: require('../../../assets/AiHealthCheckUp/nail.png'),
      bgColor: '#EAEAF8',
      onPress: () => navigation.navigate('NailAnalysis') 
    },
    { 
      title: 'Tongue Health', 
      subtitle: 'Analyze your tongue condition', 
      icon: require('../../../assets/AiHealthCheckUp/t.png'),
      bgColor: '#EAEAF8',
      onPress: () => navigation.navigate('TongueDiseaseChecker') 
    },
    { 
      title: 'Scalp Health', 
      subtitle: 'Get scalp health analysis', 
      icon: require('../../../assets/AiHealthCheckUp/scalp.png'),
      bgColor: '#EAEAF8',
      onPress: () => navigation.navigate('HairCheckScreen') 
    },
    { 
      title: 'Melanoma Detector', 
      subtitle: 'Live melanoma risk detection', 
      icon: require('../../../assets/AiHealthCheckUp/Melanoma.png'),
      bgColor: '#EAEAF8',
      onPress: () => navigation.navigate('CameraStreamScreen') 
    },
    { 
      title: 'Posture Analysis', 
      subtitle: 'Live melanoma risk detection', 
      icon: require('../../../assets/AiHealthCheckUp/p.png'),
      bgColor: '#EAEAF8',
      onPress: () => navigation.navigate('InjuryScreen') 
    },
    { 
      title: 'Genomic Insights', 
      subtitle: 'AI-based health risk analysis', 
      icon: require('../../../assets/AiHealthCheckUp/Biology.png'),
      bgColor: '#EAEAF8',
      onPress: () => navigation.navigate('RiskAssessmentScreen') 
    },
    { 
      title: 'Dental Analysis', 
      subtitle: 'AI-powered dental health detection', 
      icon: require('../../../assets/AiHealthCheckUp/Dental.png'),
      bgColor: '#EAEAF8',
      onPress: () => navigation.navigate('DentalCheckScreen') 
    },
   
   
    // { 
    //   title: 'Preventive Health', 
    //   subtitle: 'Get Preventive Health analysis', 
    //   icon: require('../../../assets/AiHealthCheckUp/skinHealth.png'),
    //   bgColor: '#EAEAF8',
    //   onPress: () => navigation.navigate('PreventiveHealthScreen') 
    // },
    // { 
    //   title: 'Insurance', 
    //   subtitle: 'Get Insurance Health analysis', 
    //   icon: require('../../../assets/AiHealthCheckUp/skinHealth.png'),
    //   bgColor: '#EAEAF8',
    //   onPress: () => navigation.navigate('InsuranceScreen') 
    // },
    // { 
    //   title: 'Diet Plan', 
    //   subtitle: 'Diet Health analysis', 
    //   icon: require('../../../assets/AiHealthCheckUp/skinHealth.png'),
    //   bgColor: '#EAEAF8',
    //   onPress: () => navigation.navigate('DietScreen') 
    // },
    // { 
    //   title: 'Vitals Monitor', 
    //   subtitle: 'Get Vitals Health analysis', 
    //   icon: require('../../../assets/AiHealthCheckUp/skinHealth.png'),
    //   bgColor: '#EAEAF8',
    //   onPress: () => navigation.navigate('VitalsScreen') 
    // },
    // { 
    //   title: 'Vitals Monitor', 
    //   subtitle: 'Get Vitals Health analysis', 
    //   icon: require('../../../assets/AiHealthCheckUp/skinHealth.png'),
    //   bgColor: '#EAEAF8',
    //   onPress: () => navigation.navigate('XrayScreen') 
    // },
     
  ];

  const renderHealthCard = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.healthCard}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.iconWrapper}>
        <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]} />
        <Image 
          source={item.icon} 
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Health Checkup</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {healthItems.map((item, index) => renderHealthCard(item, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
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
    color: '#000'
  },
  content: {
    flex: 1
  },
  cardsContainer: {
    padding: 16
  },
  healthCard: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 8,
  marginBottom: 12,
  overflow: 'hidden',

  // Border
  borderWidth: 1,
  borderColor: '#e0e0e0', // light gray (you can change to any color you prefer)

  // Optional shadow if you want a more elevated look
  // shadowColor: '#000',
  // shadowOffset: { width: 0, height: 2 },
  // shadowOpacity: 0.08,
  // shadowRadius: 4,
  // elevation: 3,
},

  cardContent: {
    flex: 1,
    marginLeft: 12
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: "Poppins_400Regular",
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: '#666',
    lineHeight: 18
  },
  iconWrapper: {
    width: 90,
    height: 90,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconCircle: {
    position: 'absolute',
    width: 122,
    height: 122,
    borderRadius: 60,
    bottom: -40,
    left: -8
  },
  iconImage: {
    width: 69,
    height: 69,
    zIndex: 1,
    top: 22,
    left: 5
  }
});

export default HealthCheckupApp;