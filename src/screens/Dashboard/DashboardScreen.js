// import React, { useState, useRef, useEffect } from "react";
// import { Image, Dimensions, Animated } from "react-native";
// import DoctorPng from "../../../assets/Dashoabdicons/Group 21.png";
// import CheckupPng from "../../../assets/Dashoabdicons/Group 22.png";
// import CalendarPng from "../../../assets/Dashoabdicons/Group 23.png";
// import CameraPng from "../../../assets/Dashoabdicons/Group 24.png";
// import PrescriptionPng from "../../../assets/Dashoabdicons/MentalHealth.png";
// import GamesPng from "../../../assets/Dashoabdicons/Group 29.png";

// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   ActivityIndicator,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import { useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BASE_URL } from '../../config/config';
// import Sidebar from "../../components/Sidebar";

// const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// const PngIcon = ({ source, style }) => (
//   <Image source={source} style={[{ resizeMode: "contain" }, style]} />
// );

// // Siri Orb Component
// function VoiceOrbButton({ onPress }) {
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const waveAnim1 = useRef(new Animated.Value(0)).current;
//   const waveAnim2 = useRef(new Animated.Value(0)).current;
//   const waveAnim3 = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Pulse animation
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.05,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     // Wave animations
//     Animated.loop(
//       Animated.timing(waveAnim1, {
//         toValue: 1,
//         duration: 2000,
//         useNativeDriver: true,
//       })
//     ).start();

//     Animated.loop(
//       Animated.timing(waveAnim2, {
//         toValue: 1,
//         duration: 2500,
//         useNativeDriver: true,
//       })
//     ).start();

//     Animated.loop(
//       Animated.timing(waveAnim3, {
//         toValue: 1,
//         duration: 3000,
//         useNativeDriver: true,
//       })
//     ).start();
//   }, []);

//   return (
//     <Animated.View
//       style={[
//         orbStyles.container,
//         { transform: [{ scale: pulseAnim }] },
//       ]}
//     >
//       <TouchableOpacity
//         style={orbStyles.button}
//         onPress={onPress}
//         activeOpacity={0.85}
//       >
//         <View style={orbStyles.inner}>
//           <LinearGradient
//             colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={orbStyles.gradient}
//           >
//             {/* Wave 1 */}
//             <Animated.View
//               style={[
//                 orbStyles.wave,
//                 {
//                   opacity: waveAnim1.interpolate({
//                     inputRange: [0, 0.5, 1],
//                     outputRange: [0.3, 0.6, 0.3],
//                   }),
//                   transform: [
//                     {
//                       scale: waveAnim1.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [1, 1.2],
//                       }),
//                     },
//                   ],
//                 },
//               ]}
//             >
//               <LinearGradient
//                 colors={['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)']}
//                 style={orbStyles.waveGradient}
//               />
//             </Animated.View>

//             {/* Wave 2 */}
//             <Animated.View
//               style={[
//                 orbStyles.wave,
//                 {
//                   opacity: waveAnim2.interpolate({
//                     inputRange: [0, 0.5, 1],
//                     outputRange: [0.4, 0.7, 0.4],
//                   }),
//                   transform: [
//                     {
//                       scale: waveAnim2.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [1, 1.15],
//                       }),
//                     },
//                   ],
//                 },
//               ]}
//             >
//               <LinearGradient
//                 colors={['rgba(240, 147, 251, 0.7)', 'rgba(79, 172, 254, 0.7)']}
//                 style={orbStyles.waveGradient}
//               />
//             </Animated.View>

//             {/* Wave 3 */}
//             <Animated.View
//               style={[
//                 orbStyles.wave,
//                 {
//                   opacity: waveAnim3.interpolate({
//                     inputRange: [0, 0.5, 1],
//                     outputRange: [0.5, 0.8, 0.5],
//                   }),
//                   transform: [
//                     {
//                       scale: waveAnim3.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [1, 1.1],
//                       }),
//                     },
//                   ],
//                 },
//               ]}
//             >
//               <LinearGradient
//                 colors={['rgba(118, 75, 162, 0.9)', 'rgba(102, 126, 234, 0.9)']}
//                 style={orbStyles.waveGradient}
//               />
//             </Animated.View>

//             {/* Center glow */}
//             <View style={orbStyles.centerGlow} />
            
//             {/* Glass highlight */}
//             <View style={orbStyles.highlight} />
//           </LinearGradient>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// }

// export default function HealthDashboard({ navigation }) {
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [profile, setProfile] = useState(null);
//   const [loadingProfile, setLoadingProfile] = useState(true);
//   const { user } = useContext(AuthContext);
  
//   // Fetch profile data
//   const fetchProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         setLoadingProfile(false);
//         return;
//       }
//       const res = await fetch(`${BASE_URL}/api/profile`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.success && data.data) {
//         setProfile(data.data);
//       }
//     } catch (err) {
//       console.error('Fetch profile error:', err);
//     } finally {
//       setLoadingProfile(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   // Refresh profile when screen is focused
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchProfile();
//     });
//     return unsubscribe;
//   }, [navigation]);
  
//   const handleChatbotPress = () => {
//     navigation.navigate('VoiceRedirectScreen');
//   }
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#B2B3F2" />

//       {/* Main Gradient Background */}
//       <View style={[styles.gradientBg, { backgroundColor: "#B2B3F2" }]}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity 
//             style={styles.profilePic}
//             onPress={() => setSidebarVisible(true)}
//           >
//             {loadingProfile ? (
//               <ActivityIndicator size="small" color="#8B7AD8" />
//             ) : profile?.basicInfo?.profilePhoto?.url ? (
//               <Image 
//                 source={{ uri: `${BASE_URL}${profile.basicInfo.profilePhoto.url}` }} 
//                 style={styles.profileImage}
//               />
//             ) : (
//               <View style={styles.profilePlaceholder} />
//             )}
//           </TouchableOpacity>
//           <Text style={styles.greeting}>
//             Hi {profile?.basicInfo?.fullName || user?.displayName || user?.email?.split("@")[0] || "User"}!
//           </Text>
//           <View style={styles.sosButton}>
//             <Text style={styles.sosText}>SOS</Text>
//           </View>
//         </View>

//         {/* Well-being Checkup Card */}
//         <View style={styles.wellBeingCard}>
//           <View style={styles.cardTextContainer}>
//             <Text style={styles.cardSubtext}>EVERYDAY WELL-BEING CHECKUP</Text>
//             <Text style={styles.cardMainText}>How do you feel today?</Text>
//           </View>

//           <TouchableOpacity
//             style={styles.startButton}
//             onPress={() => navigation.navigate('MoodCheckupApp')}
//           >
//             <Text style={styles.startButtonText}>Start</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* White Content Area */}
//       <ScrollView style={styles.whiteContent} showsVerticalScrollIndicator={false}>

//         {/* Features Section */}
//         <View style={styles.featuresSection}>
//           <TouchableOpacity 
//             style={styles.sectionTitleContainer}
//             onPress={() => navigation.navigate('FeaturesScreen')}
//           >
//             <Text style={styles.sectionTitle}>Our Features</Text>
//             <Ionicons name="chevron-forward" size={24} color="#333" />
//           </TouchableOpacity>

//           <View style={styles.featuresGrid}>
//             {/* First Row */}
//             <View style={styles.featureRow}>
//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("AIDoctor")}
//               >
//                 <PngIcon source={CameraPng} style={styles.featureIcon} />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("AiHealthCheckupScreen")}
//               >
//                 <PngIcon source={GamesPng} style={styles.featureIcon} />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("MentalHealthScreen")}
//               >
//                 <PngIcon source={PrescriptionPng} style={styles.featureIcon} />
//               </TouchableOpacity>
//             </View>

//             {/* Second Row */}
//             <View style={styles.featureRow}>
//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("HealthGames")}
//               >
//                 <PngIcon source={DoctorPng} style={styles.featureIcon} />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("CosmeticScreen")}
//               >
//                 <PngIcon source={CheckupPng} style={styles.featureIcon} />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("SymptomChecker")}
//               >
//                 <PngIcon source={CalendarPng} style={styles.featureIcon} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* Today's Vitals Section */}
//         <View style={styles.vitalsSection}>
//           <View style={styles.vitalsCard}>
//             <View style={styles.vitalsLeft}>
//               <Text style={styles.vitalsTitle}>TODAY'S{'\n'}VITALS</Text>
//               <Text style={styles.deviceConnected}>Device Connected</Text>
//             </View>
//             <View style={styles.vitalsRight}>
//               <View style={styles.vitalCircle}>
//                 <Text style={styles.vitalLabel}>BPM</Text>
//                 <Text style={styles.vitalValue}>72</Text>
//               </View>
//               <View style={styles.vitalCircle}>
//                 <Text style={styles.vitalLabel}>BP</Text>
//                 <Text style={styles.vitalValue}>120/80</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Upcoming Appointment */}
//         <View style={styles.appointmentSection}>
//           <TouchableOpacity 
//             style={styles.appointmentHeader} 
//             onPress={() => navigation.navigate("MyAppointments")}
//           >
//             <Text style={styles.appointmentTitle}>Upcoming Appointment</Text>
//             <Ionicons name="chevron-forward" size={24} color="#333" />
//           </TouchableOpacity>

//           <View style={styles.appointmentCardContainer}>
//             <View style={styles.appointmentCard}>
//               <View style={styles.doctorAvatar}>
//                 <Image
//                   source={require("../../../assets/doctor.png")}
//                   style={styles.doctorImage}
//                 />
//               </View>

//               <View style={styles.doctorInfo}>
//                 <Text style={styles.doctorName}>Dr. Mehra</Text>
//                 <Text style={styles.doctorSpecialty}>Dermatologist</Text>
//               </View>

//               <View style={styles.appointmentTime}>
//                 <Text style={styles.dateText}>04 Sep</Text>
//                 <Text style={styles.timeText}>10:00 am</Text>
//               </View>
//             </View>

//             <View style={styles.appointmentFooter}>
//               <Text style={styles.patientName}>Kaushal</Text>
//               <View style={styles.hospitalInfo}>
//                 <Ionicons name="location-outline" size={16} color="#666" />
//                 <Text style={styles.hospitalName}>Hospital Name</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Prescription Reminders */}
//         <View style={styles.prescriptionSection}>
//           <View style={styles.prescriptionHeader}>
//             <Text style={styles.prescriptionTitle}>Prescription Reminders</Text>
//             <Ionicons name="chevron-forward" size={24} color="#333" />
//           </View>

//           <View style={styles.prescriptionCard}>
//             <View style={styles.medicineItem}>
//               <View style={styles.pillIcon}>
//                 <View style={[styles.pill, { backgroundColor: '#FFB347' }]} />
//               </View>
//               <View style={styles.medicineInfo}>
//                 <Text style={styles.medicineName}>Vitamin D</Text>
//                 <Text style={styles.medicineQuantity}>1 tablet</Text>
//               </View>
//               <View style={styles.medicineTime}>
//                 <Text style={styles.medicineType}>Supplement</Text>
//                 <Text style={styles.timeSlot}>Morning</Text>
//               </View>
//             </View>

//             <View style={styles.medicineSeparator} />

//             <View style={styles.medicineItem}>
//               <View style={styles.pillIcon}>
//                 <View style={[styles.pill, { backgroundColor: '#FF6B6B' }]} />
//               </View>
//               <View style={styles.medicineInfo}>
//                 <Text style={styles.medicineName}>Amlodipine</Text>
//                 <Text style={styles.medicineQuantity}>2 tablets</Text>
//               </View>
//               <View style={styles.medicineTime}>
//                 <Text style={styles.medicineType}>BP</Text>
//                 <Text style={styles.timeSlot}>Morning, Evening</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Recommended Reads */}
//         <View style={styles.readsSection}>
//           <View style={styles.readsHeader}>
//             <Text style={styles.readsTitle}>Recommended Reads</Text>
//             <Ionicons name="chevron-forward" size={24} color="#333" />
//           </View>

//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.readsScroll}>
//             <View style={styles.readCard}>
//               <View style={styles.readImage} />
//               <View style={styles.readInfo}>
//                 <View style={styles.readTag}>
//                   <Text style={styles.readTagText}>Stress Management</Text>
//                 </View>
//                 <Text style={styles.readTime}>7 min</Text>
//                 <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce Stress</Text>
//               </View>
//             </View>

//             <View style={styles.readCard}>
//               <View style={styles.readImage} />
//               <View style={styles.readInfo}>
//                 <View style={styles.readTag}>
//                   <Text style={styles.readTagText}>Stress Management</Text>
//                 </View>
//                 <Text style={styles.readTime}>5 min</Text>
//                 <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce</Text>
//               </View>
//             </View>
//           </ScrollView>
//         </View>

//         <View style={styles.bottomSpacing} />
//       </ScrollView>

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity style={styles.navItem}>
//           <Image
//             source={require("../../../assets/Dashoabdicons/home.png")}
//             style={styles.navIcon}
//           />
//           <Text style={[styles.navText, { color: "#7475B4" }]}>Home</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("CaregiverDashboard")}
//         >
//           <Image
//             source={require("../../../assets/Dashoabdicons/dashboad.png")}
//             style={styles.navIcon}
//           />
//           <Text style={styles.navText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("LoginVaultId")}
//         >
//           <Image
//             source={require("../../../assets/Dashoabdicons/Vector.png")}
//             style={styles.navIcon}
//           />
//           <Text style={styles.navText}>Vault</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Siri Orb Button (Replaces Chatbot) */}
//       <View style={styles.chatbotButton}>
//         <VoiceOrbButton onPress={handleChatbotPress} />
//       </View>

//       {/* Sidebar Component */}
//       <Sidebar 
//         visible={sidebarVisible}
//         onClose={() => setSidebarVisible(false)}
//         navigation={navigation}
//       />
//     </SafeAreaView>
//   );
// }

// // Orb Button Styles
// const orbStyles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   button: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: 'rgba(30, 30, 60, 0.4)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   inner: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     overflow: 'hidden',
//   },
//   gradient: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   wave: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     borderRadius: 100,
//   },
//   waveGradient: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 100,
//   },
//   centerGlow: {
//     position: 'absolute',
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//   },
//   highlight: {
//     position: 'absolute',
//     top: '18%',
//     left: '22%',
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: 'rgba(255, 255, 255, 0.35)',
//   },
// });

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   gradientBg: {
//     paddingTop: Math.max(StatusBar.currentHeight || 0, 20) + 10,
//     paddingBottom: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     minHeight: screenHeight * 0.25,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 20,
//     marginTop: 10,
//   },
//   profilePic: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#fff",
//     marginRight: 15,
//     overflow: 'hidden',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   profilePlaceholder: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: '#F0F0F0',
//   },
//   greeting: {
//     flex: 1,
//     fontSize: Math.min(24, screenWidth * 0.06),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#1E1E1E",
//   },
//   sosButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sosText: {
//     fontFamily: "Inter",
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#FF4444",
//   },
//   wellBeingCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     marginHorizontal: Math.max(15, screenWidth * 0.04),
//     marginVertical: 10,
//     borderRadius: 50,
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     paddingVertical: 15,
//     maxWidth: screenWidth - (Math.max(15, screenWidth * 0.04) * 2),
//   },
//   cardTextContainer: {
//     flex: 1,
//     marginRight: 10,
//   },
//   cardSubtext: {
//     fontSize: Math.min(13, screenWidth * 0.035),
//     fontFamily: "Inter",
//     color: "#7a7a7a",
//     fontWeight: "600",
//     marginBottom: 3,
//     flexWrap: 'wrap',
//   },
//   cardMainText: {
//     fontSize: Math.min(15, screenWidth * 0.04),
//     fontFamily: "Inter",
//     fontWeight: "700",
//     color: "#333",
//     flexWrap: 'wrap',
//   },
//   startButton: {
//     backgroundColor: "#7475B4",
//     paddingHorizontal: Math.max(18, screenWidth * 0.045),
//     paddingVertical: 10,
//     borderRadius: 25,
//     minWidth: 60,
//   },
//   startButtonText: {
//     color: "#fff",
//     fontSize: Math.min(15, screenWidth * 0.04),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     textAlign: 'center',
//   },
//   whiteContent: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingTop: 30,
//   },
//   featuresSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 30,
//     alignItems: "center",
//   },
//   sectionTitleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     width: "100%",
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: Math.min(22, screenWidth * 0.055),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   featuresGrid: {
//     gap: 15,
//     width: "100%",
//     alignItems: "center",
//   },
//   featureRow: {
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginBottom: 20,
//     width: "100%",
//   },
//   featureItem: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   featureIcon: {
//     width: Math.min(107, screenWidth * 0.25),
//     height: Math.min(107, screenWidth * 0.25),
//   },
//   vitalsSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 30,
//     alignItems: "center",
//   },
//   vitalsCard: {
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     padding: Math.max(20, screenWidth * 0.05),
//     flexDirection: "row",
//     alignItems: "center",
//     boderBottomWidth: 1,
//     width: "100%",
//   },
//   vitalsLeft: {
//     flex: 1,
//   },
//   vitalsTitle: {
//     fontSize: Math.min(18, screenWidth * 0.045),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//     lineHeight: 22,
//     marginBottom: 8,
//   },
//   deviceConnected: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     color: "#4ECDC4",
//     fontWeight: "500",
//   },
//   vitalsRight: {
//     flexDirection: "row",
//     gap: Math.max(15, screenWidth * 0.04),
//   },
//   vitalCircle: {
//     width: Math.min(80, screenWidth * 0.18),
//     height: Math.min(80, screenWidth * 0.18),
//     borderRadius: Math.min(40, screenWidth * 0.09),
//     borderWidth: 3,
//     borderColor: "#39A6A3",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   vitalLabel: {
//     fontSize: Math.min(12, screenWidth * 0.03),
//     fontFamily: "Inter",
//     color: "#666",
//     fontWeight: "500",
//   },
//   vitalValue: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   appointmentSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 30,
//   },
//   appointmentHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   appointmentTitle: {
//     fontSize: Math.min(22, screenWidth * 0.055),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   appointmentCardContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     overflow: "hidden",
//   },
//   appointmentCard: {
//     backgroundColor: "#C9CAFF",
//     padding: Math.max(20, screenWidth * 0.05),
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   appointmentFooter: {
//     backgroundColor: "#fff",
//     padding: Math.max(20, screenWidth * 0.05),
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   doctorInfo: {
//     flex: 1,
//   },
//   doctorName: {
//     fontSize: Math.min(18, screenWidth * 0.045),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     color: "#1E1E1E",
//     marginBottom: 4,
//   },
//   doctorSpecialty: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     color: "#1E1E1E",
//   },
//   patientName: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Inter",
//     color: "#333",
//     fontWeight: "600",
//   },
//   hospitalInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   hospitalName: {
//     fontFamily: "Inter",
//     fontSize: Math.min(14, screenWidth * 0.035),
//     color: "#666",
//     marginLeft: 4,
//   },
//   doctorAvatar: {
//     width: 70,
//     height: 70,
//     borderRadius: 25,
//     overflow: "hidden",
//     marginRight: 12,
//     backgroundColor: "#eee",
//   },
//   doctorImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   appointmentTime: {
//     alignItems: "flex-end",
//   },
//   dateText: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     color: "#1E1E1E",
//     marginBottom: 2,
//   },
//   timeText: {
//     fontSize: Math.min(18, screenWidth * 0.045),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#1E1E1E",
//   },
//   prescriptionSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 30,
//   },
//   prescriptionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   prescriptionTitle: {
//     fontSize: Math.min(22, screenWidth * 0.055),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   prescriptionCard: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: Math.max(20, screenWidth * 0.05),
//   },
//   medicineItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//   },
//   pillIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 15,
//   },
//   pill: {
//     width: 20,
//     height: 12,
//     borderRadius: 6,
//   },
//   medicineInfo: {
//     flex: 1,
//   },
//   medicineName: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   medicineQuantity: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     color: "#666",
//   },
//   medicineTime: {
//     alignItems: "flex-end",
//   },
//   medicineType: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   timeSlot: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     color: "#666",
//   },
//   medicineSeparator: {
//     height: 1,
//     backgroundColor: "#F0F0F0",
//     marginVertical: 10,
//   },
//   readsSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 30,
//     alignItems: "center",
//   },
//   readsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//     width: "100%",
//   },
//   readsTitle: {
//     fontSize: Math.min(22, screenWidth * 0.055),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   readsScroll: {
//     paddingLeft: 0,
//   },
//   readCard: {
//     width: Math.min(280, screenWidth * 0.7),
//     marginRight: 15,
//     backgroundColor: "#fff",
//     overflow: "hidden",
//   },
//   readImage: {
//     width: "100%",
//     height: 140,
//     backgroundColor: "#39A6A3",
//   },
//   readInfo: {
//     padding: 15,
//   },
//   readTag: {
//     backgroundColor: "#E8F5F3",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//     alignSelf: "flex-start",
//     marginBottom: 8,
//   },
//   readTagText: {
//     fontSize: Math.min(12, screenWidth * 0.03),
//     fontFamily: "Inter",
//     color: "#39A6A3",
//     fontWeight: "500",
//   },
//   readTime: {
//     fontSize: Math.min(12, screenWidth * 0.03),
//     fontFamily: "Inter",
//     color: "#666",
//     marginBottom: 8,
//     textAlign: "right",
//     position: "absolute",
//     top: 15,
//     right: 15,
//   },
//   readTitle: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     fontWeight: "500",
//     color: "#333",
//     lineHeight: 18,
//   },
//   bottomSpacing: {
//     height: 50,
//   },
//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 20,
//   },
//   navItem: {
//     alignItems: "center",
//   },
//   navIcon: {
//     width: 25,
//     height: 25,
//     resizeMode: "contain",
//   },
//   navText: {
//     fontSize: 12,
//     fontFamily: "Inter",
//     color: "#999",
//   },
//   chatbotButton: {
//     position: "absolute",
//     bottom: 100,
//     right: 20,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//   },
// });


// import React, { useState, useRef, useEffect } from "react";
// import { Image, Dimensions, Animated } from "react-native";
// import Svg, { Path } from 'react-native-svg';
// import DoctorPng from "../../../assets/Dashoabdicons/Group 21.png";
// import CheckupPng from "../../../assets/Dashoabdicons/Group 22.png";
// import CalendarPng from "../../../assets/Dashoabdicons/Group 23.png";
// import CameraPng from "../../../assets/Dashoabdicons/Group 24.png";
// import PrescriptionPng from "../../../assets/Dashoabdicons/MentalHealth.png";
// import GamesPng from "../../../assets/Dashoabdicons/Group 29.png";

// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   ActivityIndicator,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import { useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BASE_URL } from '../../config/config';
// import Sidebar from "../../components/Sidebar";

// const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// const PngIcon = ({ source, style }) => (
//   <Image source={source} style={[{ resizeMode: "contain" }, style]} />
// );

// // Siri Orb Component
// function VoiceOrbButton({ onPress }) {
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const waveAnim1 = useRef(new Animated.Value(0)).current;
//   const waveAnim2 = useRef(new Animated.Value(0)).current;
//   const waveAnim3 = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.05,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     Animated.loop(
//       Animated.timing(waveAnim1, {
//         toValue: 1,
//         duration: 2000,
//         useNativeDriver: true,
//       })
//     ).start();

//     Animated.loop(
//       Animated.timing(waveAnim2, {
//         toValue: 1,
//         duration: 2500,
//         useNativeDriver: true,
//       })
//     ).start();

//     Animated.loop(
//       Animated.timing(waveAnim3, {
//         toValue: 1,
//         duration: 3000,
//         useNativeDriver: true,
//       })
//     ).start();
//   }, []);

//   return (
//     <Animated.View
//       style={[
//         orbStyles.container,
//         { transform: [{ scale: pulseAnim }] },
//       ]}
//     >
//       <TouchableOpacity
//         style={orbStyles.button}
//         onPress={onPress}
//         activeOpacity={0.85}
//       >
//         <View style={orbStyles.inner}>
//           <LinearGradient
//             colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={orbStyles.gradient}
//           >
//             <Animated.View
//               style={[
//                 orbStyles.wave,
//                 {
//                   opacity: waveAnim1.interpolate({
//                     inputRange: [0, 0.5, 1],
//                     outputRange: [0.3, 0.6, 0.3],
//                   }),
//                   transform: [
//                     {
//                       scale: waveAnim1.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [1, 1.2],
//                       }),
//                     },
//                   ],
//                 },
//               ]}
//             >
//               <LinearGradient
//                 colors={['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)']}
//                 style={orbStyles.waveGradient}
//               />
//             </Animated.View>

//             <Animated.View
//               style={[
//                 orbStyles.wave,
//                 {
//                   opacity: waveAnim2.interpolate({
//                     inputRange: [0, 0.5, 1],
//                     outputRange: [0.4, 0.7, 0.4],
//                   }),
//                   transform: [
//                     {
//                       scale: waveAnim2.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [1, 1.15],
//                       }),
//                     },
//                   ],
//                 },
//               ]}
//             >
//               <LinearGradient
//                 colors={['rgba(240, 147, 251, 0.7)', 'rgba(79, 172, 254, 0.7)']}
//                 style={orbStyles.waveGradient}
//               />
//             </Animated.View>

//             <Animated.View
//               style={[
//                 orbStyles.wave,
//                 {
//                   opacity: waveAnim3.interpolate({
//                     inputRange: [0, 0.5, 1],
//                     outputRange: [0.5, 0.8, 0.5],
//                   }),
//                   transform: [
//                     {
//                       scale: waveAnim3.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [1, 1.1],
//                       }),
//                     },
//                   ],
//                 },
//               ]}
//             >
//               <LinearGradient
//                 colors={['rgba(118, 75, 162, 0.9)', 'rgba(102, 126, 234, 0.9)']}
//                 style={orbStyles.waveGradient}
//               />
//             </Animated.View>

//             <View style={orbStyles.centerGlow} />
//             <View style={orbStyles.highlight} />
//           </LinearGradient>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// }

// export default function HealthDashboard({ navigation }) {
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [profile, setProfile] = useState(null);
//   const [loadingProfile, setLoadingProfile] = useState(true);
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
//   const { user } = useContext(AuthContext);
  
//   // Default prescriptions to show when no data
//   const defaultPrescriptions = [
//     {
//       prescriptionName: 'Vitamin D',
//       dose: '1 tablet',
//       prescriptionType: 'Supplement',
//       time: 'Morning',
//       color: '#FFB347'
//     },
//     {
//       prescriptionName: 'Amlodipine',
//       dose: '2 tablets',
//       prescriptionType: 'BP',
//       time: 'Morning, Evening',
//       color: '#FF6B6B'
//     }
//   ];
  
//   // Fetch profile data
//   const fetchProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         setLoadingProfile(false);
//         return;
//       }
//       const res = await fetch(`${BASE_URL}/api/profile`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.success && data.data) {
//         setProfile(data.data);
//       }
//     } catch (err) {
//       console.error('Fetch profile error:', err);
//     } finally {
//       setLoadingProfile(false);
//     }
//   };

//   // Fetch prescriptions data
//   const fetchPrescriptions = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         setLoadingPrescriptions(false);
//         return;
//       }
      
//       const response = await fetch(`${BASE_URL}/api/prescriptionns`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
        
//         // Process prescriptions data
//         const processedPrescriptions = [];
//         const colors = ['#FFB347', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];
        
//         data.forEach((prescription, index) => {
//           if (prescription.dosages && prescription.dosages.length > 0) {
//             // Get first two dosages
//             const dosagesToShow = prescription.dosages.slice(0, 2);
//             dosagesToShow.forEach((dosage) => {
//               processedPrescriptions.push({
//                 prescriptionName: prescription.prescriptionName,
//                 dose: dosage.dose,
//                 prescriptionType: prescription.prescriptionType,
//                 time: dosage.time,
//                 color: colors[index % colors.length]
//               });
//             });
//           }
//         });
        
//         setPrescriptions(processedPrescriptions);
//       }
//     } catch (err) {
//       console.error('Fetch prescriptions error:', err);
//     } finally {
//       setLoadingPrescriptions(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//     fetchPrescriptions();
//   }, []);

//   // Refresh data when screen is focused
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchProfile();
//       fetchPrescriptions();
//     });
//     return unsubscribe;
//   }, [navigation]);
  
//   const handleChatbotPress = () => {
//     navigation.navigate('VoiceRedirectScreen');
//   }

//   // Determine which prescriptions to show
//   const displayPrescriptions = prescriptions.length > 0 ? prescriptions.slice(0, 2) : defaultPrescriptions;
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#B2B3F2" />

//       {/* Main Gradient Background */}
//       <View style={[styles.gradientBg, { backgroundColor: "#B2B3F2" }]}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity 
//             style={styles.menuButton}
//             onPress={() => setSidebarVisible(true)}
//           >
//             <View style={styles.menuLine} />
//             <View style={styles.menuLine} />
//             <View style={styles.menuLine} />
//           </TouchableOpacity>
//           <Text style={styles.greeting}>
//             Hi {profile?.basicInfo?.fullName || user?.displayName || user?.email?.split("@")[0] || "User"}!
//           </Text>
//           <View style={styles.sosButton}>
//             <Text style={styles.sosText}>SOS</Text>
//           </View>
//         </View>

//         {/* Well-being Checkup Card */}
//         <View style={styles.wellBeingCard}>
//           <View style={styles.cardTextContainer}>
//             <Text style={styles.cardSubtext}>EVERYDAY WELL-BEING CHECKUP</Text>
//             <Text style={styles.cardMainText}>How do you feel today?</Text>
//           </View>

//           <TouchableOpacity
//             style={styles.startButton}
//             onPress={() => navigation.navigate('MoodCheckupApp')}
//           >
//             <Text style={styles.startButtonText}>Start</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* White Content Area */}
//       <ScrollView style={styles.whiteContent} showsVerticalScrollIndicator={false}>

//         {/* Features Section */}
//         <View style={styles.featuresSection}>
//           <TouchableOpacity 
//             style={styles.sectionTitleContainer}
//             onPress={() => navigation.navigate('FeaturesScreen')}
//           >
//             <Text style={styles.sectionTitle}>Our Features</Text>
//             <Ionicons name="chevron-forward" size={24} color="#333" />
//           </TouchableOpacity>

//           <View style={styles.featuresGrid}>
//             {/* First Row */}
//             <View style={styles.featureRow}>
//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("AIDoctor")}
//               >
//                 <PngIcon source={CameraPng} style={styles.featureIcon} />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("AiHealthCheckupScreen")}
//               >
//                 <PngIcon source={GamesPng} style={styles.featureIcon} />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("MentalHealthScreen")}
//               >
//                 <PngIcon source={PrescriptionPng} style={styles.featureIcon} />
//               </TouchableOpacity>
//             </View>

//             {/* Second Row */}
//             <View style={styles.featureRow}>
//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("HealthGames")}
//               >
//                 <PngIcon source={DoctorPng} style={styles.featureIcon} />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("CosmeticScreen")}
//               >
//                 <PngIcon source={CheckupPng} style={styles.featureIcon} />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.featureItem}
//                 onPress={() => navigation.navigate("SymptomChecker")}
//               >
//                 <PngIcon source={CalendarPng} style={styles.featureIcon} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* Today's Vitals Section */}
//         <View style={styles.vitalsSection}>
//           <TouchableOpacity 
//             style={styles.vitalsSectionHeader}
//             onPress={() => navigation.navigate('VitalsScreen')}
//           >
//             <Text style={styles.vitalsMainTitle}>Today's Vitals</Text>
//              <Ionicons name="chevron-forward" size={24} color="#333" />
//           </TouchableOpacity>

//           <View style={styles.vitalsCardsContainer}>
//             {/* Heart Rate Card */}
//             <View style={styles.vitalCard}>
//               <Text style={styles.vitalCardTitle}>Heart Rate</Text>
//               <Text style={styles.vitalCardTime}>15 min ago</Text>
              
//               {/* Heart Rate Graph */}
//               <View style={styles.heartRateGraph}>
//                 <Svg width="100%" height="50" viewBox="0 0 200 50">
//                   <Path
//                     d="M 0 25 L 20 25 L 25 18 L 30 32 L 35 10 L 40 25 L 60 25 L 65 18 L 70 32 L 75 10 L 80 25 L 100 25 L 105 18 L 110 32 L 115 10 L 120 25 L 140 25 L 145 20 L 150 30 L 155 15 L 160 25 L 180 25 L 185 20 L 190 30 L 195 18 L 200 25"
//                     stroke="#FF6B9D"
//                     strokeWidth="2.5"
//                     fill="none"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </Svg>
//               </View>

//               <View style={styles.vitalCardBottom}>
//                 <Text style={styles.vitalMainValue}>84</Text>
//                 <Text style={styles.vitalUnit}>bpm</Text>
//               </View>
//             </View>

//             {/* Blood Pressure Card */}
//             <View style={styles.vitalCard}>
//               <Text style={styles.vitalCardTitle}>Blood Pressure</Text>
//               <Text style={styles.vitalCardTime}>15 min ago</Text>
              
//               {/* Blood Pressure Bar Chart */}
//               <View style={styles.bpGraph}>
//                 <View style={[styles.bpBar, { height: 25, backgroundColor: '#60A5FA' }]} />
//                 <View style={[styles.bpBar, { height: 20, backgroundColor: '#60A5FA' }]} />
//                 <View style={[styles.bpBar, { height: 28, backgroundColor: '#60A5FA' }]} />
//                 <View style={[styles.bpBar, { height: 40, backgroundColor: '#F59E0B' }]} />
//                 <View style={[styles.bpBar, { height: 22, backgroundColor: '#60A5FA' }]} />
//                 <View style={[styles.bpBar, { height: 32, backgroundColor: '#60A5FA' }]} />
//                 <View style={[styles.bpBar, { height: 20, backgroundColor: '#60A5FA' }]} />
//                 <View style={[styles.bpBar, { height: 28, backgroundColor: '#60A5FA' }]} />
//                 <View style={[styles.bpBar, { height: 35, backgroundColor: '#60A5FA' }]} />
//                 <View style={[styles.bpBar, { height: 25, backgroundColor: '#F59E0B' }]} />
//               </View>

//               <View style={styles.vitalCardBottom}>
//                 <Text style={styles.vitalMainValue}>120/80</Text>
//                 <Text style={styles.vitalUnit}>sys/dia</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Upcoming Appointment */}
//         <View style={styles.appointmentSection}>
//           <TouchableOpacity 
//             style={styles.appointmentHeader} 
//             onPress={() => navigation.navigate("MyAppointments")}
//           >
//             <Text style={styles.appointmentTitle}>Upcoming Appointment</Text>
//             <Ionicons name="chevron-forward" size={24} color="#333" />
//           </TouchableOpacity>

//           <View style={styles.appointmentCardContainer}>
//             <View style={styles.appointmentCard}>
//               <View style={styles.doctorAvatar}>
//                 <Image
//                   source={require("../../../assets/doctor.png")}
//                   style={styles.doctorImage}
//                 />
//               </View>

//               <View style={styles.doctorInfo}>
//                 <Text style={styles.doctorName}>Dr. Mehra</Text>
//                 <Text style={styles.doctorSpecialty}>Dermatologist</Text>
//               </View>

//               <View style={styles.appointmentTime}>
//                 <Text style={styles.dateText}>04 Sep</Text>
//                 <Text style={styles.timeText}>10:00 am</Text>
//               </View>
//             </View>

//             <View style={styles.appointmentFooter}>
//               <Text style={styles.patientName}>Kaushal</Text>
//               <View style={styles.hospitalInfo}>
//                 <Ionicons name="location-outline" size={16} color="#666" />
//                 <Text style={styles.hospitalName}>Hospital Name</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Prescription Reminders */}
//         <View style={styles.prescriptionSection}>
//           <TouchableOpacity 
//             style={styles.appointmentHeader} 
//             onPress={() => navigation.navigate("PrescriptionRemindersScreen")}
//           >
//             <Text style={styles.appointmentTitle}>Prescription Reminders</Text>
//             <Ionicons name="chevron-forward" size={24} color="#333" />
//           </TouchableOpacity>

//           <View style={styles.prescriptionCard}>
//             {loadingPrescriptions ? (
//               <ActivityIndicator size="small" color="#7475B4" style={{ paddingVertical: 20 }} />
//             ) : (
//               displayPrescriptions.map((medicine, index) => (
//                 <React.Fragment key={index}>
//                   <View style={styles.medicineItem}>
//                     <View style={styles.pillIcon}>
//                       <View style={[styles.pill, { backgroundColor: medicine.color }]} />
//                     </View>
//                     <View style={styles.medicineInfo}>
//                       <Text style={styles.medicineName}>{medicine.prescriptionName}</Text>
//                       <Text style={styles.medicineQuantity}>{medicine.dose}</Text>
//                     </View>
//                     <View style={styles.medicineTime}>
//                       <Text style={styles.medicineType}>{medicine.prescriptionType}</Text>
//                       <Text style={styles.timeSlot}>{medicine.time}</Text>
//                     </View>
//                   </View>
//                   {index < displayPrescriptions.length - 1 && (
//                     <View style={styles.medicineSeparator} />
//                   )}
//                 </React.Fragment>
//               ))
//             )}
//           </View>
//         </View>

//         {/* Recommended Reads */}
//         <View style={styles.readsSection}>
//           <View style={styles.readsHeader}>
//             <Text style={styles.readsTitle}>Recommended Reads</Text>
//             <Ionicons name="chevron-forward" size={24} color="#333" />
//           </View>

//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.readsScroll}>
//             <View style={styles.readCard}>
//               <Image 
//                 source={require('../../../assets/Dashoabdicons/stress.png')} 
//                 style={styles.readImage}
//                 resizeMode="cover"
//               />
//               <View style={styles.readInfo}>
//                 <View style={styles.readTag}>
//                   <Text style={styles.readTagText}>Stress Management</Text>
//                 </View>
//                 <Text style={styles.readTime}>7 min</Text>
//                 <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce Stress</Text>
//               </View>
//             </View>

//             <View style={styles.readCard}>
//               <Image 
//                 source={require('../../../assets/Dashoabdicons/stress2.png')} 
//                 style={styles.readImage}
//                 resizeMode="cover"
//               />
//               <View style={styles.readInfo}>
//                 <View style={styles.readTag}>
//                   <Text style={styles.readTagText}>Stress Management</Text>
//                 </View>
//                 <Text style={styles.readTime}>5 min</Text>
//                 <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce</Text>
//               </View>
//             </View>
//             <View style={styles.readCard}>
//               <Image 
//                 source={require('../../../assets/Dashoabdicons/stress3.png')} 
//                 style={styles.readImage}
//                 resizeMode="cover"
//               />
//               <View style={styles.readInfo}>
//                 <View style={styles.readTag}>
//                   <Text style={styles.readTagText}>Stress Management</Text>
//                 </View>
//                 <Text style={styles.readTime}>5 min</Text>
//                 <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce</Text>
//               </View>
//             </View>
//           </ScrollView>
//         </View>
//         <View style={styles.bottomSpacing} />
//       </ScrollView>

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity style={styles.navItem}>
//           <Image
//             source={require("../../../assets/Dashoabdicons/home.png")}
//             style={styles.navIcon}
//           />
//           <Text style={[styles.navText, { color: "#7475B4" }]}>Home</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("CaregiverDashboard")}
//         >
//           <Image
//             source={require("../../../assets/Dashoabdicons/dashboad.png")}
//             style={styles.navIcon}
//           />
//           <Text style={styles.navText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("LoginVaultId")}
//         >
//           <Image
//             source={require("../../../assets/Dashoabdicons/Vector.png")}
//             style={styles.navIcon}
//           />
//           <Text style={styles.navText}>Vault</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Siri Orb Button */}
//       <View style={styles.chatbotButton}>
//         <VoiceOrbButton onPress={handleChatbotPress} />
//       </View>

//       {/* Sidebar Component */}
//       <Sidebar 
//         visible={sidebarVisible}
//         onClose={() => setSidebarVisible(false)}
//         navigation={navigation}
//       />
//     </SafeAreaView>
//   );
// }

// // Orb Button Styles
// const orbStyles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   button: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: 'rgba(30, 30, 60, 0.4)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   inner: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     overflow: 'hidden',
//   },
//   gradient: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   wave: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     borderRadius: 100,
//   },
//   waveGradient: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 100,
//   },
//   centerGlow: {
//     position: 'absolute',
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//   },
//   highlight: {
//     position: 'absolute',
//     top: '18%',
//     left: '22%',
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: 'rgba(255, 255, 255, 0.35)',
//   },
// });

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   gradientBg: {
//     paddingTop: Math.max(StatusBar.currentHeight || 0, 20) + 5,
//     paddingBottom: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 15,
//     marginTop: 5,
//   },
//   menuButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 14,
//   },
//   menuLine: {
//     width: 24,
//     height: 3,
//     backgroundColor: '#333',
//     borderRadius: 2,
//     marginVertical: 2.5,
//   },
//   greeting: {
//     flex: 1,
//     fontSize: Math.min(24, screenWidth * 0.06),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#1E1E1E",
//   },
//   sosButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sosText: {
//     fontFamily: "Inter",
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#FF4444",
//   },
//   wellBeingCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     marginHorizontal: Math.max(15, screenWidth * 0.04),
//     marginVertical: 8,
//     borderRadius: 50,
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     paddingVertical: 12,
//     maxWidth: screenWidth - (Math.max(15, screenWidth * 0.04) * 2),
//   },
//   cardTextContainer: {
//     flex: 1,
//     marginRight:10,
//   },
//   cardSubtext: {
//     fontSize: Math.min(13, screenWidth * 0.035),
//     fontFamily: "Inter",
//     color: "#7a7a7a",
//     fontWeight: "600",
//     marginBottom: 0,
//     flexWrap: 'wrap',
//   },
//   cardMainText: {
//     fontSize: Math.min(15, screenWidth * 0.04),
//     fontFamily: "Inter",
//     fontWeight: "700",
//     color: "#333",
//     flexWrap: 'wrap',
//   },
//   startButton: {
//     backgroundColor: "#7475B4",
//     paddingHorizontal: Math.max(18, screenWidth * 0.045),
//     paddingVertical: 6,
//     borderRadius: 25,
//     minWidth: 60,
//   },
//   startButtonText: {
//     color: "#fff",
//     fontSize: Math.min(15, screenWidth * 0.04),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     textAlign: 'center',
//   },
//   whiteContent: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingTop: 20,
//   },
//   featuresSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 10,
//     alignItems: "center",
//   },
//   sectionTitleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     width: "100%",
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   featuresGrid: {
//     gap: 15,
//     width: "100%",
//     alignItems: "center",
//   },
//   featureRow: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 20,
//     width: "100%",
//   },
//   featureItem: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   featureIcon: {
//     width: Math.min(107, screenWidth * 0.25),
//     height: Math.min(135, screenWidth * 0.30),
//   },
//   vitalsSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 30,
//   },
//   vitalsSectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   vitalsMainTitle: {
//     fontSize: Math.min(22, screenWidth * 0.055),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   vitalsCardsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   vitalCard: {
//     flex: 1,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   vitalCardTitle: {
//     fontSize: 16,
//     fontFamily: "Inter",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   vitalCardTime: {
//     fontSize: 13,
//     fontFamily: "Inter",
//     color: "#999",
//     marginBottom: 15,
//   },
//   heartRateGraph: {
//     height: 50,
//     marginBottom: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   bpGraph: {
//     height: 50,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     justifyContent: 'space-between',
//     paddingHorizontal: 3,
//   },
//   bpBar: {
//     width: 7,
//     borderRadius: 3.5,
//   },
//   vitalCardBottom: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//   },
//   vitalMainValue: {
//     fontSize: 28,
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//     marginRight: 5,
//   },
//   vitalUnit: {
//     fontSize: 20,
//     fontFamily: "Inter",
//     color: "#999",
//     marginBottom: 3,
//   },
//   appointmentSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 30,
//   },
//   appointmentHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   appointmentTitle: {
//     fontSize: Math.min(22, screenWidth * 0.055),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   appointmentCardContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   appointmentCard: {
//     backgroundColor: "#C9CAFF",
//     padding: Math.max(20, screenWidth * 0.05),
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   appointmentFooter: {
//     backgroundColor: "#fff",
//     padding: Math.max(20, screenWidth * 0.05),
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   doctorInfo: {
//     flex: 1,
//   },
//   doctorName: {
//     fontSize: Math.min(18, screenWidth * 0.045),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     color: "#1E1E1E",
//     marginBottom: 4,
//   },
//   doctorSpecialty: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     color: "#1E1E1E",
//   },
//   patientName: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Inter",
//     color: "#333",
//     fontWeight: "600",
//   },
//   hospitalInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   hospitalName: {
//     fontFamily: "Inter",
//     fontSize: Math.min(14, screenWidth * 0.035),
//     color: "#666",
//     marginLeft: 4,
//   },
//   doctorAvatar: {
//     width: 70,
//     height: 70,
//     borderRadius: 8,
//     overflow: "hidden",
//     marginRight: 12,
//     backgroundColor: "#eee",
//   },
//   doctorImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   appointmentTime: {
//     alignItems: "flex-end",
//   },
//   dateText: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     color: "#1E1E1E",
//     marginBottom: 2,
//   },
//   timeText: {
//     fontSize: Math.min(18, screenWidth * 0.045),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#1E1E1E",
//   },
//   prescriptionSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 30,
//   },
//   prescriptionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   prescriptionTitle: {
//     fontSize: Math.min(22, screenWidth * 0.055),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   prescriptionCard: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: Math.max(20, screenWidth * 0.05),
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   medicineItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//   },
//   pillIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 15,
//   },
//   pill: {
//     width: 20,
//     height: 12,
//     borderRadius: 6,
//   },
//   medicineInfo: {
//     flex: 1,
//   },
//   medicineName: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   medicineQuantity: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     color: "#666",
//   },
//   medicineTime: {
//     alignItems: "flex-end",
//   },
//   medicineType: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   timeSlot: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     color: "#666",
//   },
//   medicineSeparator: {
//     height: 1,
//     backgroundColor: "#F0F0F0",
//     marginVertical: 10,
//   },
//   readsSection: {
//     paddingHorizontal: Math.max(20, screenWidth * 0.05),
//     marginBottom: 30,
//     alignItems: "center",
//   },
//   readsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//     width: "100%",
//   },
//   readsTitle: {
//     fontSize: Math.min(22, screenWidth * 0.055),
//     fontFamily: "Inter",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   readsScroll: {
//     paddingLeft: 0,
//   },
//   readCard: {
//     width: Math.min(280, screenWidth * 0.7),
//     marginRight: 15,
//     backgroundColor: "#fff",
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//   },
//   readImage: {
//     width: "100%",
//     height: 140,
//     backgroundColor: "#39A6A3",
//   },
//   readInfo: {
//     padding: 15,
//   },
//   readTag: {
//     backgroundColor: "#E8F5F3",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//     alignSelf: "flex-start",
//     marginBottom: 8,
//   },
//   readTagText: {
//     fontSize: Math.min(12, screenWidth * 0.03),
//     fontFamily: "Inter",
//     color: "#39A6A3",
//     fontWeight: "500",
//   },
//   readTime: {
//     fontSize: Math.min(12, screenWidth * 0.03),
//     fontFamily: "Inter",
//     color: "#666",
//     marginBottom: 8,
//     textAlign: "right",
//     position: "absolute",
//     top: 15,
//     right: 15,
//   },
//   readTitle: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Inter",
//     fontWeight: "500",
//     color: "#333",
//     lineHeight: 18,
//   },
//   bottomSpacing: {
//     height: 50,
//   },
//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 20,
//   },
//   navItem: {
//     alignItems: "center",
//   },
//   navIcon: {
//     width: 25,
//     height: 25,
//     resizeMode: "contain",
//   },
//   navText: {
//     fontSize: 12,
//     fontFamily: "Inter",
//     color: "#999",
//   },
//   chatbotButton: {
//     position: "absolute",
//     bottom: 100,
//     right: 20,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//   },
// });

import React, { useState, useRef, useEffect } from "react";
import { Image, Dimensions, Animated } from "react-native";
import Svg, { Path, Circle } from 'react-native-svg';
import DoctorPng from "../../../assets/Dashoabdicons/Group 21.png";
import CheckupPng from "../../../assets/Dashoabdicons/Group 22.png";
import CalendarPng from "../../../assets/Dashoabdicons/Group 23.png";
import CameraPng from "../../../assets/Dashoabdicons/Group 24.png";
import PrescriptionPng from "../../../assets/Dashoabdicons/MentalHealth.png";
import GamesPng from "../../../assets/Dashoabdicons/Group 29.png";
import PillYellowPng from "../../../assets/Dashoabdicons/pill1.png";
import PillRedPng from "../../../assets/Dashoabdicons/pill2.png";
import UserProfilePlaceholder from "../../../assets/doctor.png"; // Placeholder for user profile
import DoctorAvatarPlaceholder from "../../../assets/doctor.png"; // Placeholder for doctor avatar
import SkinHealthIcon from '../../../assets/AiHealthCheckUp/skinHealth.png';
import EyeHealthIcon from '../../../assets/AiHealthCheckUp/eye3.png';
import NailHealthIcon from '../../../assets/AiHealthCheckUp/nail.png';
import TongueHealthIcon from '../../../assets/AiHealthCheckUp/t.png';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';
import Sidebar from "../../components/Sidebar";
import ErrorBoundary from '../../components/ErrorBoundary';
import BottomNavigation from '../../components/BottomNavigation';
// Don't import useHealthData - will cause crash if Health Connect not available
// Use safe defaults instead

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PngIcon = ({ source, style }) => (
  <Image source={source} style={[{ resizeMode: "contain" }, style]} />
);

// Voice Orb Button Component
function VoiceOrbButton({ onPress }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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

  return (
    <Animated.View style={[orbStyles.container, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity style={orbStyles.button} onPress={onPress} activeOpacity={0.85}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={orbStyles.gradient}
          >
            <View style={orbStyles.centerGlow} />
          </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DashboardScreenContent({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [selectedHealthCheckId, setSelectedHealthCheckId] = useState(1); // Default first item selected
  const [eyeHealthModalVisible, setEyeHealthModalVisible] = useState(false);
  const [guidelinesModalVisible, setGuidelinesModalVisible] = useState(false);
  const { user } = useContext(AuthContext);
  
  // Dynamic vitals - can be fetched from API or Health Connect
  // Show 0 if no data available
  const [vitals, setVitals] = useState({
    heartRate: 0,
    bloodPressure: 0,
    sleepHours: 0,
    sleepMinutes: 0,
  });

  // Fetch vitals data (can be from API or Health Connect)
  useEffect(() => {
    // TODO: Fetch actual vitals data from API or Health Connect
    // For now using default values, replace with actual data fetching
    const fetchVitals = async () => {
      try {
        // Example: Fetch from API
        // const response = await fetch(`${BASE_URL}/api/vitals`);
        // const data = await response.json();
        // if (data.success) {
        //   setVitals({
        //     heartRate: data.vitals.heartRate || 0,
        //     bloodPressure: data.vitals.bloodPressure || 0,
        //     sleepHours: data.vitals.sleepHours || 0,
        //     sleepMinutes: data.vitals.sleepMinutes || 0,
        //   });
        // }
        
        // Temporary default values for demo
        setVitals({
          heartRate: 55,
          bloodPressure: 120,
          sleepHours: 6,
          sleepMinutes: 32,
        });
      } catch (error) {
        console.error('Error fetching vitals:', error);
        // Keep defaults as 0 if error
        setVitals({
          heartRate: 0,
          bloodPressure: 0,
          sleepHours: 0,
          sleepMinutes: 0,
        });
      }
    };

    fetchVitals();
  }, []);
  
  // AI Health Checkup items - first one has dark gray background, others white with border
  const aiHealthChecks = [
    { 
      id: 1, 
      title: "Skin Cancer Detection", 
      subtitle: "Get skin health analysis", 
      bgColor: "#1F2937", // Dark gray for first item
      textColor: "#FFFFFF", // White text for first item
      subtitleColor: "#E5E7EB", // Light gray subtitle for first item
      iconBg: "#FBBF24",
      icon: require('../../../assets/AiHealthCheckUp/skinCancerDectection.png'),
      route: 'SkinCheck'
    },
    { 
      id: 2, 
      title: "Eye Health", 
      subtitle: "Eye health recommendation", 
      bgColor: "#FFFFFF",
      textColor: "#1F2937",
      subtitleColor: "#6B7280",
      iconBg: "#FF9800",
      icon: require('../../../assets/AiHealthCheckUp/eye.png'),
      route: 'EyeScreen'
    },
    { 
      id: 3, 
      title: "Nail Health", 
      subtitle: "Get insights with nail health", 
      bgColor: "#FFFFFF",
      textColor: "#1F2937",
      subtitleColor: "#6B7280",
      iconBg: "#9C27B0",
      icon: require('../../../assets/AiHealthCheckUp/nail1.png'),
      route: 'NailAnalysis'
    },
    { 
      id: 4, 
      title: "Tongue Health", 
      subtitle: "Analyze your tongue condition", 
      bgColor: "#FFFFFF",
      textColor: "#1F2937",
      subtitleColor: "#6B7280",
      iconBg: "#2196F3",
      icon: require('../../../assets/AiHealthCheckUp/tough1.png'),
      route: 'TongueDiseaseChecker'
    },
    { 
      id: 5, 
      title: "Scalp Health", 
      subtitle: "Get scalp health analysis", 
      bgColor: "#FFFFFF",
      textColor: "#1F2937",
      subtitleColor: "#6B7280",
      iconBg: "#4CAF50",
      icon: require('../../../assets/AiHealthCheckUp/Hair.png'),
      route: 'HairCheckScreen'
    },
    { 
      id: 6, 
      title: "Posture Analysis", 
      subtitle: "Live posture risk detection", 
      bgColor: "#FFFFFF",
      textColor: "#1F2937",
      subtitleColor: "#6B7280",
      iconBg: "#00BCD4",
      icon: require('../../../assets/AiHealthCheckUp/PostureAnalysis.png'),
      route: 'InjuryScreen'
    },
    { 
      id: 7, 
      title: "Genomic Insights", 
      subtitle: "AI-based health risk analysis", 
      bgColor: "#FFFFFF",
      textColor: "#1F2937",
      subtitleColor: "#6B7280",
      iconBg: "#607D8B",
      icon: require('../../../assets/AiHealthCheckUp/Genomic.png'),
      route: 'RiskAssessmentScreen'
    },
    { 
      id: 8, 
      title: "Dental Analysis", 
      subtitle: "AI-powered dental health detection", 
      bgColor: "#FFFFFF",
      textColor: "#1F2937",
      subtitleColor: "#6B7280",
      iconBg: "#009688",
      icon: require('../../../assets/AiHealthCheckUp/theet.png'),
      route: 'DentalCheckScreen'
    },
    { 
      id: 9, 
      title: "Breast Cancer Analysis", 
      subtitle: "AI-powered breast cancer detection", 
      bgColor: "#FFFFFF",
      textColor: "#1F2937",
      subtitleColor: "#6B7280",
      iconBg: "#E91E63",
      icon: require('../../../assets/AiHealthCheckUp/BresastCancer.png'),
      route: 'BreastAnalysisScreen'
    },
    { 
      id: 10, 
      title: "PCOSS Test", 
      subtitle: "AI-powered PCOSS detection", 
      bgColor: "#FFFFFF",
      textColor: "#1F2937",
      subtitleColor: "#6B7280",
      iconBg: "#FF5722",
      icon: require('../../../assets/AiHealthCheckUp/PcossTest.png'),
      route: 'PCOSScreening'
    }
  ];

  // All Features items - 11 items, 4 per row
  const allFeatures = [
    { id: 1, title: "Cosmetic\nAnalysis", color: "#FF9800", route: "CosmeticScreen" }, // Orange
    { id: 2, title: "X-Ray\nAnalysis", color: "#9C27B0", route: "XrayScreen" }, // Purple
    { id: 3, title: "Reports\nReader", color: "#2196F3", route: "SymptomChecker" }, // Blue
    { id: 4, title: "Mental\nHealth", color: "#E91E63", route: "MentalHealthScreen" }, // Red
    { id: 5, title: "Preventive\nHealth", color: "#00BCD4", route: "PreventiveHealthScreen" }, // Light Blue
    { id: 6, title: "24/7 AI\nDoctor", color: "#FF9800", route: "AIDoctor" }, // Orange
    { id: 7, title: "Mother &\nBaby Care", color: "#009688", route: "MotherBabyCareScreen" }, // Teal/Cyan
    { id: 8, title: "Insurance\nChecker", color: "#4CAF50", route: "InsuranceScreen" }, // Green
    { id: 9, title: "Diet Plan\nGenerator", color: "#2196F3", route: "DietScreen" }, // Blue
    { id: 10, title: "Calorie\nCalculator", color: "#4CAF50", route: "CalorieCalculator" }, // Green
    { id: 11, title: "Health\nGames", color: "#E91E63", route: "HealthGames" } // Red
  ];
  
  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoadingProfile(false);
        return;
      }
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch upcoming appointment
  const fetchAppointment = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoadingAppointment(false);
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Get the next upcoming appointment
        if (data && data.length > 0) {
          const upcoming = data
            .filter(apt => new Date(apt.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
          setAppointment(upcoming || null);
        }
      }
    } catch (err) {
      console.error('Fetch appointment error:', err);
    } finally {
      setLoadingAppointment(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAppointment();
  }, []);

  // Refresh data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
      fetchAppointment();
    });
    return unsubscribe;
  }, [navigation]);
  
  const handleChatbotPress = () => {
    navigation.navigate('VoiceRedirectScreen');
  }

  // Get user name for greeting
  const userName = profile?.basicInfo?.fullName || user?.displayName || user?.email?.split("@")[0] || "User";
  
  // Format appointment date
  const formatAppointmentDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      month: months[date.getMonth()],
      day: date.getDate(),
      weekday: days[date.getDay()],
    };
  };

  const appointmentDate = appointment ? formatAppointmentDate(appointment.date) : null;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.gradientBackground}>
        {/* Base gradient layer */}
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
          style={StyleSheet.absoluteFill}
        />
        {/* Overlay gradient for radial effect simulation */}
        <LinearGradient
          colors={[
            'rgba(254, 215, 112, 0.4)',  // Yellow overlay
            'rgba(235, 177, 180, 0.3)',  // Pink overlay
            'rgba(145, 230, 251, 0.3)',  // Blue overlay
            'rgba(217, 213, 250, 0.2)',  // Purple overlay
            'transparent'
          ]}
          locations={[0, 0.3, 0.5, 0.7, 1]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Greeting Card */}
        <View style={styles.greetingCard}>
          <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.greetingLeft}>
            {/* user photo */}
            {(() => {
              const profilePhotoUrl = profile?.basicInfo?.profilePhoto?.url 
                ? `${BASE_URL}${profile.basicInfo.profilePhoto.url}` 
                : null;
              return profilePhotoUrl ? (
                <Image
                  source={{ uri: profilePhotoUrl }}
                  style={styles.greetingAvatar}
                />
              ) : (
                <Image
                  source={require("../../../assets/doctor.png")}
                  style={styles.greetingAvatar}
                />
              );
            })()}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hello {userName}!</Text>
              <Text style={styles.greetingSubtext}>Let's start your day</Text>
            </View>
          </TouchableOpacity>
          {/* bell + green dot */}
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Appointment Card */}
        <View style={styles.appointmentCard}>
          {/* Top Section */}
          <View style={styles.appointmentTopSection}>
            {appointment?.doctor?.profilePicture ? (
              <Image
                source={{ uri: appointment.doctor.profilePicture }}
                style={styles.doctorAvatarImage}
              />
            ) : (
              <Image
                source={require("../../../assets/doctor.png")}
                style={styles.doctorAvatarImage}
              />
            )}
            <View style={styles.appointmentDetails}>
              <Text style={styles.appointmentLabel}>Appointment:</Text>
              <Text style={styles.appointmentDateTime}>
                {appointmentDate
                  ? `${appointmentDate.month} ${appointmentDate.day}, ${appointmentDate.weekday}`
                  : "Nov 25, Tuesday"}{" "}
                | {appointment?.time || "12 noon"}
              </Text>
            </View>
            <TouchableOpacity style={styles.infoIconButton}>
              <Ionicons name="information-circle-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Bottom Section */}
          <View style={styles.appointmentBottomSection}>
            <Text style={styles.doctorName}>
              {appointment?.doctor?.name || "Dr. Sahil Mehta"}
            </Text>
            <TouchableOpacity
              style={styles.seeProfileButton}
              onPress={() =>
                appointment?.doctor &&
                navigation.navigate("DoctorCard", { doctor: appointment.doctor })
              }
            >
              <Text style={styles.seeProfileButtonText}>See Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Metrics */}
        <View style={styles.metricsCard}>
          {/* Header */}
          <View style={styles.metricsHeader}>
            <Text style={styles.metricsTitle}>Daily Metrics</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VitalsScreen')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricsContent}>
            {/* LEFT SIDE DATA */}
            <View style={styles.metricsLeft}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Heartbeat</Text>
                <View style={styles.metricValueRow}>
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>{vitals?.heartRate || 55}</Text>
                  <Text style={styles.metricUnit}> /72 bpm</Text>
                </View>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Blood Pressure</Text>
                <View style={styles.metricValueRow}>
                  <Text style={[styles.metricValue, { color: '#EF4444' }]}>{vitals?.bloodPressure || 120}</Text>
                  <Text style={styles.metricUnit}> mmHg</Text>
                </View>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Sleep Duration</Text>
                <View style={styles.metricValueRow}>
                  <Text style={[styles.metricValue, { color: '#3B82F6' }]}>{vitals?.sleepHours || 6}h</Text>
                  <Text style={[styles.metricValue, { color: '#3B82F6' }]}> {vitals?.sleepMinutes || 32}m</Text>
                </View>
              </View>
            </View>

            {/* CIRCLE GRAPH */}
            <View style={styles.chartContainer}>
              <Svg width={140} height={140} viewBox="0 0 200 200">
                {/* Base grey rings */}
                <Circle cx="100" cy="100" r="90" stroke="#D1D5DB" strokeWidth="8" fill="none" />
                <Circle cx="100" cy="100" r="70" stroke="#D1D5DB" strokeWidth="8" fill="none" />
                <Circle cx="100" cy="100" r="50" stroke="#D1D5DB" strokeWidth="8" fill="none" />
                
                {/* Outer GREEN arc */}
                <Circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90 * 0.78} ${2 * Math.PI * 90}`}
                  transform="rotate(-120 100 100)"
                />
                
                {/* Middle RED arc */}
                <Circle
                  cx="100"
                  cy="100"
                  r="70"
                  stroke="#EF4444"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70 * 0.65} ${2 * Math.PI * 70}`}
                  transform="rotate(160 100 100)"
                />
                
                {/* Inner BLUE arc */}
                <Circle
                  cx="100"
                  cy="100"
                  r="50"
                  stroke="#2563EB"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50 * 0.55} ${2 * Math.PI * 50}`}
                  transform="rotate(40 100 100)"
                />
              </Svg>
              <Text style={styles.chartPercentage}>25%</Text>
            </View>
          </View>
        </View>

        {/* AI Health Checkup */}
        <View style={styles.aiHealthCheckupSection}>
          <View style={styles.aiHealthCheckupHeader}>
            <Text style={styles.aiHealthCheckupTitle}>AI Health Checkup</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AiHealthCheckupScreen')}>
              <Text style={styles.aiHealthCheckupSeeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.aiHealthCheckupScrollContainer}
            contentContainerStyle={styles.healthChecksContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {aiHealthChecks.map((check, index) => {
              const isSelected = selectedHealthCheckId === check.id;
              return (
                <TouchableOpacity 
                  key={check.id}
                  style={[
                    styles.healthCheckItem,
                    { 
                      backgroundColor: isSelected ? "#1F2937" : "#FFFFFFBF",
                      borderWidth: isSelected ? 0 : 1,
                      borderColor: isSelected ? 'transparent' : '#E9E9E9',
                    }
                  ]}
                  onPress={() => {
                    setSelectedHealthCheckId(check.id);
                    if (check.route === 'EyeScreen') {
                      setEyeHealthModalVisible(true);
                    } else {
                      navigation.navigate(check.route);
                    }
                  }}
                >
                  <View style={[
                    styles.healthCheckIconContainer, 
                    { backgroundColor: 'transparent' }
                  ]}>
                    <Image 
                      source={check.icon} 
                      style={
                        check.id === 2 
                          ? { width: 32, height: 20 }
                          : { width: 26.958070755004883, height: 34.49981689453125 }
                      }
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.healthCheckContent}>
                    <Text style={[styles.healthCheckTitle, { color: isSelected ? "#FFFFFF" : "#1F2937" }]}>
                      {check.title}
                    </Text>
                    <Text style={[styles.healthCheckSubtitle, { color: isSelected ? "#E5E7EB" : "#6B7280" }]}>
                      {check.subtitle}
                    </Text>
                  </View>
                  {!isSelected && (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={styles.healthCheckArrow} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* All Features */}
        <View style={styles.allFeaturesSection}>
          <View style={styles.allFeaturesHeader}>
            <Text style={styles.allFeaturesTitle}>All Features</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FeaturesScreen')}>
              <Text style={styles.allFeaturesSeeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuresGrid}>
            {allFeatures.map((feature) => (
              <TouchableOpacity 
                key={feature.id} 
                style={styles.featureItem}
                onPress={() => navigation.navigate(feature.route)}
              >
                <View style={[styles.featureIcon, (feature.id === 1 || feature.id === 2 || feature.id === 3 || feature.id === 4 || feature.id === 5 || feature.id === 6 || feature.id === 7 || feature.id === 8 || feature.id === 9 || feature.id === 10 || feature.id === 11) ? { backgroundColor: 'transparent' } : { backgroundColor: feature.color }]}>
                  {feature.id === 1 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/CometicAnalysis.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 2 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/X-RayAnalysis.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 3 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/ReportsReader.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 4 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/MentalHealth1.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 5 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/PreventiveHealth.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 6 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/247AIDoctor.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 7 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/MotherbabyCare.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 8 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/InsurnaceCheckker.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 9 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/DietPlan.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 10 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/CalorieCalculator.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : feature.id === 11 ? (
                    <Image 
                      source={require('../../../assets/Dashoabdicons/HealthGames.png')}
                      style={styles.featureIconImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="apps" size={24} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </TouchableOpacity>
            ))}
            {/* Placeholder items to fill the last row to have 4 items */}
            {Array.from({ length: (4 - (allFeatures.length % 4)) % 4 }).map((_, index) => (
              <View 
                key={`placeholder-${index}`}
                style={[styles.featureItem, { opacity: 0, pointerEvents: 'none' }]} 
              />
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Voice Orb Button */}
      <View style={styles.orbButton}>
        <VoiceOrbButton onPress={handleChatbotPress} />
      </View>

      {/* Sidebar Component */}
      <Sidebar 
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
      />

      {/* Bottom Navigation */}
      <BottomNavigation navigation={navigation} activeScreen="Home" />

      {/* Eye Health Scanner Modal */}
      <Modal
        visible={eyeHealthModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEyeHealthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header with Close and Info buttons */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setEyeHealthModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalInfoButton}
                onPress={() => {
                  setEyeHealthModalVisible(false);
                  setGuidelinesModalVisible(true);
                }}
              >
                <Ionicons name="information-circle" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Eye Icon */}
            <View style={styles.modalIconContainer}>
              <View style={styles.eyeIconCircle}>
                <Image 
                  source={require('../../../assets/AiHealthCheckUp/eye3.png')}
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Eye Health Scanner</Text>

            {/* Description */}
            <Text style={styles.modalDescription}>
              We use smart AI to scan your eye for potential health signs. For the most accurate results, make sure your photo is clear and well-lit.
            </Text>

            {/* Action Buttons */}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={styles.modalButtonGallery}
                onPress={() => {
                  setEyeHealthModalVisible(false);
                  // Navigate to gallery picker
                  navigation.navigate('EyeScreen', { source: 'gallery' });
                }}
              >
                <Ionicons name="add" size={32} color="#FF4444" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonCamera}
                onPress={() => {
                  setEyeHealthModalVisible(false);
                  // Navigate to camera
                  navigation.navigate('EyeScreen', { source: 'camera' });
                }}
              >
                <Ionicons name="camera" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Picture Guidelines Modal */}
      <Modal
        visible={guidelinesModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setGuidelinesModalVisible(false);
          setEyeHealthModalVisible(true);
        }}
      >
        <View style={styles.guidelinesModalOverlay}>
          <View style={styles.guidelinesModalContainer}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.guidelinesBackButton}
              onPress={() => {
                setGuidelinesModalVisible(false);
                setEyeHealthModalVisible(true);
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>

            {/* Question Mark Icon */}
            <View style={styles.guidelinesIconContainer}>
              <View style={styles.guidelinesIconCircle}>
                <Text style={styles.guidelinesQuestionMark}>?</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.guidelinesTitle}>Picture Guidelines</Text>

            {/* Instructions List */}
            <View style={styles.guidelinesInstructions}>
              <View style={styles.guidelinesInstructionItem}>
                <Ionicons name="ellipse" size={8} color="#333" style={styles.guidelinesBullet} />
                <Text style={styles.guidelinesInstructionText}>
                  Find a spot with bright, natural light.
                </Text>
              </View>
              <View style={styles.guidelinesInstructionItem}>
                <Ionicons name="ellipse" size={8} color="#333" style={styles.guidelinesBullet} />
                <Text style={styles.guidelinesInstructionText}>
                  Open your eye as wide as possible.
                </Text>
              </View>
              <View style={styles.guidelinesInstructionItem}>
                <Ionicons name="ellipse" size={8} color="#333" style={styles.guidelinesBullet} />
                <Text style={styles.guidelinesInstructionText}>
                  Hold still, we'll capture the image automatically in 5 seconds.
                </Text>
              </View>
              <View style={styles.guidelinesInstructionItem}>
                <Ionicons name="ellipse" size={8} color="#333" style={styles.guidelinesBullet} />
                <Text style={styles.guidelinesInstructionText}>
                  Center your eye inside the box on screen.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Wrap with ErrorBoundary to prevent crashes
export default function DashboardScreen({ navigation }) {
  return (
    <ErrorBoundary
      fallback={
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 64, marginBottom: 20 }}>😔</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 12, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 }}>
            The dashboard encountered an error. Please restart the app.
          </Text>
        </SafeAreaView>
      }
    >
      <DashboardScreenContent navigation={navigation} />
    </ErrorBoundary>
  );
}

// Orb Button Styles
const orbStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9E9E9',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGlow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#E9E9E9',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  gradientBackground: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  // ===== Greeting Card =====
  greetingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFFBF",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9E9E9",
  },
  greetingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  greetingContainer: {
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  greetingSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#111827",
  },
  wellBeingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFFBF",
    marginHorizontal: Math.max(15, screenWidth * 0.04),
    marginVertical: 8,
    borderRadius: 50,
    paddingHorizontal: Math.max(20, screenWidth * 0.05),
    paddingVertical: 12,
    maxWidth: screenWidth - (Math.max(15, screenWidth * 0.04) * 2),
  },
  cardTextContainer: {
    flex: 1,
    marginRight:10,
  },
  cardSubtext: {
    fontSize: Math.min(13, screenWidth * 0.035),
    fontFamily: "Inter",
    color: "#7a7a7a",
    fontWeight: "600",
    marginBottom: 0,
    flexWrap: 'wrap',
  },
  cardMainText: {
    fontSize: Math.min(15, screenWidth * 0.04),
    fontFamily: "Inter",
    fontWeight: "700",
    color: "#333",
    flexWrap: 'wrap',
  },
  startButton: {
    backgroundColor: "#7475B4",
    paddingHorizontal: Math.max(18, screenWidth * 0.045),
    paddingVertical: 6,
    borderRadius: 25,
    minWidth: 60,
  },
  startButtonText: {
    color: "#fff",
    fontSize: Math.min(15, screenWidth * 0.04),
    fontFamily: "Inter",
    fontWeight: "600",
    textAlign: 'center',
  },
  whiteContent: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  featuresSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05),
    marginBottom: 10,
    alignItems: "center",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "#333",
  },
  featuresGrid: {
    gap: 15,
    width: "100%",
    alignItems: "center",
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    width: "100%",
  },
  featureItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: {
    width: Math.min(107, screenWidth * 0.25),
    height: Math.min(135, screenWidth * 0.30),
  },
  vitalsSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05),
    marginBottom: 30,
  },
  vitalsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  vitalsMainTitle: {
    fontSize: Math.min(22, screenWidth * 0.055),
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "#333",
  },
  vitalsCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: "#FFFFFFBF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9E9E9",
  },
  vitalCardTitle: {
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  vitalCardTime: {
    fontSize: 13,
    fontFamily: "Inter",
    color: "#999",
    marginBottom: 15,
  },
  heartRateGraph: {
    height: 50,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpGraph: {
    height: 50,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
  },
  bpBar: {
    width: 7,
    borderRadius: 3.5,
  },
  vitalCardBottom: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  vitalMainValue: {
    fontSize: 28,
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "#333",
    marginRight: 5,
  },
  vitalUnit: {
    fontSize: 20,
    fontFamily: "Inter",
    color: "#999",
    marginBottom: 3,
  },
  appointmentSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05),
    marginBottom: 30,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  appointmentTitle: {
    fontSize: Math.min(22, screenWidth * 0.055),
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "#333",
  },
  appointmentCardContainer: {
    backgroundColor: "#FFFFFFBF",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9E9E9",
  },
  appointmentCard: {
    backgroundColor: "#C9CAFF",
    padding: Math.max(20, screenWidth * 0.05),
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentFooter: {
    backgroundColor: "#FFFFFFBF",
    padding: Math.max(20, screenWidth * 0.05),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: Math.min(18, screenWidth * 0.045),
    fontFamily: "Inter",
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Inter",
    color: "#1E1E1E",
  },
  patientName: {
    fontSize: Math.min(16, screenWidth * 0.04),
    fontFamily: "Inter",
    color: "#333",
    fontWeight: "600",
  },
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  hospitalName: {
    fontFamily: "Inter",
    fontSize: Math.min(14, screenWidth * 0.035),
    color: "#666",
    marginLeft: 4,
  },
  doctorAvatar: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#eee",
  },
  doctorImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  appointmentTime: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: Math.min(16, screenWidth * 0.04),
    fontFamily: "Inter",
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 2,
  },
  timeText: {
    fontSize: Math.min(18, screenWidth * 0.045),
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  prescriptionSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05),
    marginBottom: 30,
  },
  prescriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  prescriptionTitle: {
    fontSize: Math.min(22, screenWidth * 0.055),
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "#333",
  },
  prescriptionCard: {
    backgroundColor: "#FFFFFFBF",
    borderRadius: 8,
    padding: Math.max(20, screenWidth * 0.05),
    borderWidth: 1,
    borderColor: "#E9E9E9",
  },
  medicineItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  pillIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  pillIconImage: {
    width: 36,
    height: 36,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: Math.min(16, screenWidth * 0.04),
    fontFamily: "Inter",
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  medicineQuantity: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Inter",
    color: "#666",
  },
  medicineTime: {
    alignItems: "flex-end",
  },
  medicineType: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Inter",
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  timeSlot: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Inter",
    color: "#666",
  },
  medicineSeparator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 10,
  },
  readsSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05),
    marginBottom: 30,
    alignItems: "center",
  },
  readsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    width: "100%",
  },
  readsTitle: {
    fontSize: Math.min(22, screenWidth * 0.055),
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "#333",
  },
  readsScroll: {
    paddingLeft: 0,
  },
  readCard: {
    width: Math.min(280, screenWidth * 0.7),
    marginRight: 15,
    backgroundColor: "#FFFFFFBF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9E9E9",
    borderRadius: 10,
  },
  readImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#39A6A3",
  },
  readInfo: {
    padding: 15,
  },
  readTag: {
    backgroundColor: "#E8F5F3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  readTagText: {
    fontSize: Math.min(12, screenWidth * 0.03),
    fontFamily: "Inter",
    color: "#39A6A3",
    fontWeight: "500",
  },
  readTime: {
    fontSize: Math.min(12, screenWidth * 0.03),
    fontFamily: "Inter",
    color: "#666",
    marginBottom: 8,
    textAlign: "right",
    position: "absolute",
    top: 15,
    right: 15,
  },
  readTitle: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Inter",
    fontWeight: "500",
    color: "#333",
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 50,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E9E9E9",
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },
  navText: {
    fontSize: 12,
    fontFamily: "Inter",
    color: "#999",
  },
  orbButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  // ===== Appointment Card =====
  appointmentCard: {
    backgroundColor: "#FFFFFFBF",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E9E9E9",
  },
  appointmentTopSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  doctorAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  appointmentDateTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  infoIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  appointmentBottomSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    flexShrink: 1,
  },
  seeProfileButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#A855F7", // purple pill
  },
  seeProfileButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  metricsCard: {
    backgroundColor: '#FFFFFFBF',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E9E9E9',
  },
  // HEADER (Daily Metrics | See all)
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  // MAIN ROW: left text + right chart
  metricsContent: {
    flexDirection: 'row',
    alignItems: 'center',          // chart vertically center w.r.t text
    justifyContent: 'space-between',
  },
  // LEFT SIDE (Heartbeat / BP / Sleep)
  metricsLeft: {
    width: '55%',                  // same proportion as design
  },
  metricItem: {
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  // RIGHT SIDE (rings)
  chartContainer: {
    width: '38%',                  // thoda chhota, right side tight
    aspectRatio: 1,                // perfect square
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',           // center vertically in its own area
    overflow: 'visible',
  },
  chartPercentage: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  // ===== AI Health Checkup main card =====
  aiHealthCheckupSection: {
    backgroundColor: '#FFFFFFBF',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E9E9E9',
  },
  aiHealthCheckupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiHealthCheckupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  aiHealthCheckupSeeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  // ===== Scroll area =====
  aiHealthCheckupScrollContainer: {
    maxHeight: 260,         // jitna screenshot me visible hai
  },
  healthChecksContainer: {
    paddingVertical: 4,
  },
  // ===== Individual health check pill =====
  healthCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,      // poora pill shape
    marginBottom: 10,
  },
  healthCheckIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  healthCheckIconImage: {
    width: 24,
    height: 24,
  },
  healthCheckContent: {
    flex: 1,
    justifyContent: 'center',
  },
  healthCheckTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  healthCheckSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  healthCheckArrow: {
    marginLeft: 8,
  },
  allFeaturesSection: {
    backgroundColor: '#FFFFFFBF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9E9E9',
  },
  allFeaturesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  allFeaturesTitle: {
    fontSize: 21,
    fontWeight: '400',
    color: '#1F2937',
  },
  allFeaturesSeeAll: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  featureItem: {
    width: '23%', // 4 items per row with spacing
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIconImage: {
    width: 48.04189682006836,
    height: 48.04189682006836,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  // ===== Eye Health Modal Styles =====
  modalOverlay: {
    flex: 1,
    backgroundColor: '#1E1E1EE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInfoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  eyeIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E0F5',
    borderWidth: 2,
    borderColor: '#9C27B0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  eyeIcon: {
    width: 80,
    height: 80,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 16,
  },
  modalButtonGallery: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCamera: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Guidelines Modal Styles
  guidelinesModalOverlay: {
    flex: 1,
    backgroundColor: '#1E1E1EE5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  guidelinesModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  guidelinesBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  guidelinesIconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  guidelinesIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelinesQuestionMark: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  guidelinesTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  guidelinesInstructions: {
    gap: 16,
  },
  guidelinesInstructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  guidelinesBullet: {
    marginTop: 6,
    marginRight: 12,
  },
  guidelinesInstructionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    flex: 1,
  },
});