// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Dimensions,
//   StatusBar,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";

// const { width, height } = Dimensions.get("window");

// export default function LandingScreen({ navigation }) {
//   const features = [
//     {
//       icon: "medical",
//       title: "Expert Care",
//       description: "Connect with certified healthcare professionals"
//     },
//     {
//       icon: "time",
//       title: "24/7 Support",
//       description: "Round-the-clock medical assistance"
//     },
//     {
//       icon: "shield-checkmark",
//       title: "Secure & Private",
//       description: "Your health data is protected and encrypted"
//     },
//     {
//       icon: "location",
//       title: "Find Nearby",
//       description: "Locate hospitals and clinics near you"
//     }
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
//       <LinearGradient
//         colors={['#2E8B57', '#20B2AA', '#48CAE4']}
//         style={styles.gradient}
//       >
//         <ScrollView 
//           contentContainerStyle={styles.scrollContainer}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Header Section */}
//           <View style={styles.header}>
//             <View style={styles.logoContainer}>
//               <Ionicons name="medical" size={60} color="#fff" />
//               <View style={styles.heartbeat}>
//                 <Ionicons name="pulse" size={30} color="#FF6B6B" />
//               </View>
//             </View>
//             <Text style={styles.appName}>HealNOVA.AI</Text>
//             <Text style={styles.tagline}>Your Health, Our Priority</Text>
//           </View>

//           {/* Hero Section */}
//           <View style={styles.heroSection}>
//             <Text style={styles.heroTitle}>
//               Quality Healthcare{'\n'}At Your Fingertips
//             </Text>
//             <Text style={styles.heroDescription}>
//               Access medical consultations, book appointments, and manage your health records all in one secure platform.
//             </Text>
//           </View>

//           {/* Stats Section */}
//           <View style={styles.statsContainer}>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>50K+</Text>
//               <Text style={styles.statLabel}>Patients</Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>1000+</Text>
//               <Text style={styles.statLabel}>Doctors</Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>24/7</Text>
//               <Text style={styles.statLabel}>Support</Text>
//             </View>
//           </View>

//           {/* Features Section */}
//           <View style={styles.featuresSection}>
//             <Text style={styles.sectionTitle}>Why Choose Us?</Text>
//             <View style={styles.featuresGrid}>
//               {features.map((feature, index) => (
//                 <View key={index} style={styles.featureCard}>
//                   <View style={styles.featureIconContainer}>
//                     <Ionicons name={feature.icon} size={28} color="#2E8B57" />
//                   </View>
//                   <Text style={styles.featureTitle}>{feature.title}</Text>
//                   <Text style={styles.featureDescription}>{feature.description}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* Services Preview */}
//           <View style={styles.servicesSection}>
//             <Text style={styles.sectionTitle}>Our Services</Text>
//             <View style={styles.servicesContainer}>
//               <TouchableOpacity style={styles.serviceItem}>
//                 <Ionicons name="videocam" size={24} color="#2E8B57" />
//                 <Text style={styles.serviceText}>Video Consultation</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.serviceItem}>
//                 <Ionicons name="calendar" size={24} color="#2E8B57" />
//                 <Text style={styles.serviceText}>Book Appointment</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.serviceItem}>
//                 <Ionicons name="document-text" size={24} color="#2E8B57" />
//                 <Text style={styles.serviceText}>Health Records</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.serviceItem}>
//                 <Ionicons name="fitness" size={24} color="#2E8B57" />
//                 <Text style={styles.serviceText}>Health Tracking</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* CTA Section */}
//           <View style={styles.ctaSection}>
//             <TouchableOpacity
//               style={styles.primaryButton}
//               onPress={() => navigation.navigate("Login")}
//               activeOpacity={0.8}
//             >
//               <LinearGradient
//                 colors={['#fff', '#f8f9fa']}
//                 style={styles.buttonGradient}
//               >
//                 <Ionicons name="arrow-forward" size={20} color="#2E8B57" style={styles.buttonIcon} />
//                 <Text style={styles.primaryButtonText}>Get Started</Text>
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.secondaryButton}
//               onPress={() => navigation.navigate("Login")}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Emergency Section */}
//           <View style={styles.emergencySection}>
//             <View style={styles.emergencyCard}>
//               <Ionicons name="warning" size={24} color="#FF6B6B" />
//               <View style={styles.emergencyText}>
//                 <Text style={styles.emergencyTitle}>Emergency?</Text>
//                 <Text style={styles.emergencyDescription}>Call 911 or visit nearest hospital</Text>
//               </View>
//               <TouchableOpacity style={styles.emergencyButton}>
//                 <Ionicons name="call" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Footer */}
//           <View style={styles.footer}>
//             <Text style={styles.footerText}>
//               Trusted by healthcare professionals worldwide
//             </Text>
//             <View style={styles.trustBadges}>
//               <View style={styles.trustBadge}>
//                 <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.8)" />
//                 <Text style={styles.trustText}>HIPAA Compliant</Text>
//               </View>
//               <View style={styles.trustBadge}>
//                 <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.8)" />
//                 <Text style={styles.trustText}>SSL Encrypted</Text>
//               </View>
//             </View>
//           </View>
//         </ScrollView>
//       </LinearGradient>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   gradient: {
//     flex: 1,
//   },
//   scrollContainer: {
//     paddingBottom: 30,
//   },
//   header: {
//     alignItems: 'center',
//     paddingTop: 40,
//     paddingBottom: 20,
//   },
//   logoContainer: {
//     position: 'relative',
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   heartbeat: {
//     position: 'absolute',
//     top: -10,
//     right: -10,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   appName: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 8,
//   },
//   tagline: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.9)',
//     fontWeight: '500',
//   },
//   heroSection: {
//     paddingHorizontal: 30,
//     paddingVertical: 30,
//     alignItems: 'center',
//   },
//   heroTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 15,
//     lineHeight: 36,
//   },
//   heroDescription: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.8)',
//     textAlign: 'center',
//     lineHeight: 24,
//     paddingHorizontal: 10,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     marginHorizontal: 30,
//     marginVertical: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     borderRadius: 15,
//     paddingVertical: 20,
//   },
//   statItem: {
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   statLabel: {
//     fontSize: 12,
//     color: 'rgba(255, 255, 255, 0.8)',
//     marginTop: 4,
//   },
//   statDivider: {
//     width: 1,
//     height: 30,
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   featuresSection: {
//     paddingHorizontal: 30,
//     paddingVertical: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   featuresGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   featureCard: {
//     width: (width - 80) / 2,
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 15,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   featureIconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: 'rgba(46, 139, 87, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   featureTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2E8B57',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   featureDescription: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 16,
//   },
//   servicesSection: {
//     paddingHorizontal: 30,
//     paddingVertical: 20,
//   },
//   servicesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   serviceItem: {
//     width: (width - 80) / 2,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   serviceText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '500',
//     marginLeft: 10,
//     flex: 1,
//   },
//   ctaSection: {
//     paddingHorizontal: 30,
//     paddingVertical: 30,
//   },
//   primaryButton: {
//     borderRadius: 25,
//     marginBottom: 15,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 6,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   buttonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 18,
//     paddingHorizontal: 30,
//   },
//   buttonIcon: {
//     marginRight: 10,
//   },
//   primaryButtonText: {
//     color: '#2E8B57',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   secondaryButton: {
//     alignItems: 'center',
//     paddingVertical: 15,
//   },
//   secondaryButtonText: {
//     color: 'rgba(255, 255, 255, 0.9)',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   emergencySection: {
//     paddingHorizontal: 30,
//     paddingVertical: 10,
//   },
//   emergencyCard: {
//     backgroundColor: 'rgba(255, 107, 107, 0.9)',
//     borderRadius: 15,
//     padding: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   emergencyText: {
//     flex: 1,
//     marginLeft: 15,
//   },
//   emergencyTitle: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   emergencyDescription: {
//     color: 'rgba(255, 255, 255, 0.9)',
//     fontSize: 12,
//     marginTop: 2,
//   },
//   emergencyButton: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 20,
//     padding: 10,
//   },
//   footer: {
//     paddingHorizontal: 30,
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
//   footerText: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   trustBadges: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   trustBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 15,
//   },
//   trustText: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 12,
//     marginLeft: 5,
//   },
// });













// LandingScreen.js
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "Smart Healthcare for All",
    subtitle: "With your AI Doctor, Wellness Oracle & Health Guardian.",
    image: require("../../../assets/icons/Roboat.png"),
  },
  {
    id: 2,
    title: "Doctors, Just a Tap Away",
    subtitle: "Book appointments with certified doctors 24/7.",
    image: require("../../../assets/icons/Group53.png"),
  },
  {
    id: 3,
    title: "Your Reports, Organized",
    subtitle: "Securely store, access, and share your reports in one place.",
    image: require("../../../assets/icons/Girl.png"),
  },
];

export default function LandingScreen({ navigation }) {
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const flatListRef = useRef();

  // Splash auto hide after 3 sec
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Splash animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
    setIsChecked(false);
  };

  const currentSlide = slides[currentIndex];

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View
          style={[
            styles.logoWrapper,
            { 
              transform: [{ scale: scaleAnim }], 
              opacity: opacityAnim 
            },
          ]}
        >
          <Animated.View 
            style={[
              styles.logoIconContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text style={styles.logoH}>H</Text>
            <View style={styles.heartBeat}>
              <Ionicons name="fitness" size={24} color="#fff" style={styles.heartIcon} />
            </View>
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.splashTitle, { opacity: opacityAnim }]}>
          HealNOVA.AI
        </Animated.Text>
        <Animated.Text
          style={[styles.splashSubtitle, { opacity: opacityAnim }]}
        >
          Your health is our priority
        </Animated.Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* FlatList for swipe */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Checkbox */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[
            styles.customCheckbox,
            isChecked && styles.customCheckboxChecked,
          ]}
          onPress={() => setIsChecked(!isChecked)}
        >
          {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
        </TouchableOpacity>
        <Text style={styles.checkboxText}>
          I agree to the <Text style={styles.link}>terms of service</Text> and{" "}
          <Text style={styles.link}>privacy policy</Text> and provide my consent
        </Text>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isChecked ? "#6B5AED" : "#aaa" },
        ]}
        disabled={!isChecked}
        onPress={() => navigation.replace("Login")}
      >
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? "Get Started" : "Get Started"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Splash styles
  splashContainer: {
    flex: 1,
    backgroundColor: "#D5D5FC",
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#6B5AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  logoIconContainer: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6B5AED",
    borderRadius: 25,
    position: "relative",
    overflow: "visible",
  },
  logoH: {
    fontSize: 70,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  heartBeat: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 40,
    height: 40,
    backgroundColor: "#279D7D",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 4,
  },
  heartIcon: {
    marginLeft: 2,
  },
  splashTitle: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "#222",
    letterSpacing: 1,
  },
  splashSubtitle: { 
    fontSize: 15, 
    color: "#333", 
    marginTop: 8,
    fontStyle: "italic",
  },

  // Landing styles
  container: {
    marginTop: StatusBar.currentHeight || 0,
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  slide: {
    width: width,
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 60,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "500", 
    color: "#222", 
    textAlign: "left",
    alignSelf: "flex-start",
    fontFamily: "Poppins_400Regular",
  },
  subtitle: {
    fontSize: 20,
    color: "#555",
    textAlign: "left",
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 10,
    fontWeight: "500",
    fontFamily: "Poppins_400Regular",
  },
  image: { 
    width: 350, 
    height: 500, 
    resizeMode: "contain",
    marginTop: -40,
    alignSelf: "center"
  },

  // Dots styles
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: "#6B5AED",
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "#CCCCCC",
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#6B5AED",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  customCheckboxChecked: { 
    backgroundColor: "#6B5AED" 
  },
  checkboxText: { 
    flex: 1, 
    fontSize: 16, 
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
  link: { 
    color: "#279D7D", 
    textDecorationLine: "underline" 
  },
  button: {
    marginHorizontal: 20,
    marginBottom: 100,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "600" 
  },
});