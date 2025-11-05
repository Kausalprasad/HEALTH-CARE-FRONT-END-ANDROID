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
//     shadowColor: '#667eea',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.6,
//     shadowRadius: 15,
//     elevation: 10,
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
//     shadowColor: '#fff',
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 1,
//     shadowRadius: 10,
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     elevation: 3,
//     maxWidth: screenWidth - (Math.max(15, screenWidth * 0.04) * 2),
//   },
//   cardTextContainer: {
//     flex: 1,
//     marginRight: 10,
//   },
//   cardSubtext: {
//     fontSize: Math.min(13, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
//     color: "#7a7a7a",
//     fontWeight: "600",
//     marginBottom: 3,
//     flexWrap: 'wrap',
//   },
//   cardMainText: {
//     fontSize: Math.min(15, screenWidth * 0.04),
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "bold",
//     color: "#333",
//     lineHeight: 22,
//     marginBottom: 8,
//   },
//   deviceConnected: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     color: "#666",
//     fontWeight: "500",
//   },
//   vitalValue: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   appointmentCardContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "600",
//     color: "#1E1E1E",
//     marginBottom: 4,
//   },
//   doctorSpecialty: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
//     color: "#1E1E1E",
//   },
//   patientName: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Poppins_400Regular",
//     color: "#333",
//     fontWeight: "600",
//   },
//   hospitalInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   hospitalName: {
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "600",
//     color: "#1E1E1E",
//     marginBottom: 2,
//   },
//   timeText: {
//     fontSize: Math.min(18, screenWidth * 0.045),
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "bold",
//     color: "#333",
//   },
//   prescriptionCard: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: Math.max(20, screenWidth * 0.05),
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   medicineQuantity: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
//     color: "#666",
//   },
//   medicineTime: {
//     alignItems: "flex-end",
//   },
//   medicineType: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   timeSlot: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
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
//     fontFamily: "Poppins_400Regular",
//     color: "#39A6A3",
//     fontWeight: "500",
//   },
//   readTime: {
//     fontSize: Math.min(12, screenWidth * 0.03),
//     fontFamily: "Poppins_400Regular",
//     color: "#666",
//     marginBottom: 8,
//     textAlign: "right",
//     position: "absolute",
//     top: 15,
//     right: 15,
//   },
//   readTitle: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
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
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -2},
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 8,
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
//     fontFamily: "Poppins_400Regular",
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
//     shadowColor: '#667eea',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.6,
//     shadowRadius: 15,
//     elevation: 10,
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
//     shadowColor: '#fff',
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 1,
//     shadowRadius: 10,
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     color: "#7a7a7a",
//     fontWeight: "600",
//     marginBottom: 0,
//     flexWrap: 'wrap',
//   },
//   cardMainText: {
//     fontSize: Math.min(15, screenWidth * 0.04),
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   vitalCardTime: {
//     fontSize: 13,
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "bold",
//     color: "#333",
//     marginRight: 5,
//   },
//   vitalUnit: {
//     fontSize: 20,
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "600",
//     color: "#1E1E1E",
//     marginBottom: 4,
//   },
//   doctorSpecialty: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
//     color: "#1E1E1E",
//   },
//   patientName: {
//     fontSize: Math.min(16, screenWidth * 0.04),
//     fontFamily: "Poppins_400Regular",
//     color: "#333",
//     fontWeight: "600",
//   },
//   hospitalInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   hospitalName: {
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "600",
//     color: "#1E1E1E",
//     marginBottom: 2,
//   },
//   timeText: {
//     fontSize: Math.min(18, screenWidth * 0.045),
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   medicineQuantity: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
//     color: "#666",
//   },
//   medicineTime: {
//     alignItems: "flex-end",
//   },
//   medicineType: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   timeSlot: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
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
//     fontFamily: "Poppins_400Regular",
//     color: "#39A6A3",
//     fontWeight: "500",
//   },
//   readTime: {
//     fontSize: Math.min(12, screenWidth * 0.03),
//     fontFamily: "Poppins_400Regular",
//     color: "#666",
//     marginBottom: 8,
//     textAlign: "right",
//     position: "absolute",
//     top: 15,
//     right: 15,
//   },
//   readTitle: {
//     fontSize: Math.min(14, screenWidth * 0.035),
//     fontFamily: "Poppins_400Regular",
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
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -2},
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 8,
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
//     fontFamily: "Poppins_400Regular",
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
import Svg, { Path } from 'react-native-svg';
import DoctorPng from "../../../assets/Dashoabdicons/Group 21.png";
import CheckupPng from "../../../assets/Dashoabdicons/Group 22.png";
import CalendarPng from "../../../assets/Dashoabdicons/Group 23.png";
import CameraPng from "../../../assets/Dashoabdicons/Group 24.png";
import PrescriptionPng from "../../../assets/Dashoabdicons/MentalHealth.png";
import GamesPng from "../../../assets/Dashoabdicons/Group 29.png";
import PillYellowPng from "../../../assets/Dashoabdicons/pill1.png";
import PillRedPng from "../../../assets/Dashoabdicons/pill2.png";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';
import Sidebar from "../../components/Sidebar";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PngIcon = ({ source, style }) => (
  <Image source={source} style={[{ resizeMode: "contain" }, style]} />
);

// Siri Orb Component
function VoiceOrbButton({ onPress }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

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

    Animated.loop(
      Animated.timing(waveAnim1, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(waveAnim2, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(waveAnim3, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        orbStyles.container,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <TouchableOpacity
        style={orbStyles.button}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={orbStyles.inner}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={orbStyles.gradient}
          >
            <Animated.View
              style={[
                orbStyles.wave,
                {
                  opacity: waveAnim1.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 0.6, 0.3],
                  }),
                  transform: [
                    {
                      scale: waveAnim1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)']}
                style={orbStyles.waveGradient}
              />
            </Animated.View>

            <Animated.View
              style={[
                orbStyles.wave,
                {
                  opacity: waveAnim2.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.4, 0.7, 0.4],
                  }),
                  transform: [
                    {
                      scale: waveAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.15],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(240, 147, 251, 0.7)', 'rgba(79, 172, 254, 0.7)']}
                style={orbStyles.waveGradient}
              />
            </Animated.View>

            <Animated.View
              style={[
                orbStyles.wave,
                {
                  opacity: waveAnim3.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 0.8, 0.5],
                  }),
                  transform: [
                    {
                      scale: waveAnim3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(118, 75, 162, 0.9)', 'rgba(102, 126, 234, 0.9)']}
                style={orbStyles.waveGradient}
              />
            </Animated.View>

            <View style={orbStyles.centerGlow} />
            <View style={orbStyles.highlight} />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HealthDashboard({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const { user } = useContext(AuthContext);
  
  // Default prescriptions to show when no data
  const defaultPrescriptions = [
    {
      prescriptionName: 'Vitamin D',
      dose: '1 tablet',
      prescriptionType: 'Supplement',
      time: 'Morning',
      icon: PillYellowPng
    },
    {
      prescriptionName: 'Amlodipine',
      dose: '2 tablets',
      prescriptionType: 'BP',
      time: 'Morning, Evening',
      icon: PillRedPng
    }
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

  // Fetch prescriptions data
  const fetchPrescriptions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoadingPrescriptions(false);
        return;
      }
      
      const response = await fetch(`${BASE_URL}/api/prescriptionns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Process prescriptions data
        const processedPrescriptions = [];
        const pillIcons = [PillYellowPng, PillRedPng];
        
        data.forEach((prescription, index) => {
          if (prescription.dosages && prescription.dosages.length > 0) {
            // Get first two dosages
            const dosagesToShow = prescription.dosages.slice(0, 2);
            dosagesToShow.forEach((dosage) => {
              processedPrescriptions.push({
                prescriptionName: prescription.prescriptionName,
                dose: dosage.dose,
                prescriptionType: prescription.prescriptionType,
                time: dosage.time,
                icon: pillIcons[index % pillIcons.length]
              });
            });
          }
        });
        
        setPrescriptions(processedPrescriptions);
      }
    } catch (err) {
      console.error('Fetch prescriptions error:', err);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPrescriptions();
  }, []);

  // Refresh data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
      fetchPrescriptions();
    });
    return unsubscribe;
  }, [navigation]);
  
  const handleChatbotPress = () => {
    navigation.navigate('VoiceRedirectScreen');
  }

  // Determine which prescriptions to show
  const displayPrescriptions = prescriptions.length > 0 ? prescriptions.slice(0, 2) : defaultPrescriptions;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#B2B3F2" />

      {/* Main Gradient Background */}
      <View style={[styles.gradientBg, { backgroundColor: "#B2B3F2" }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setSidebarVisible(true)}
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <Text style={styles.greeting}>
            Hi {profile?.basicInfo?.fullName || user?.displayName || user?.email?.split("@")[0] || "User"}!
          </Text>
          <View style={styles.sosButton}>
            <Text style={styles.sosText}>SOS</Text>
          </View>
        </View>

        {/* Well-being Checkup Card */}
        <View style={styles.wellBeingCard}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardSubtext}>EVERYDAY WELL-BEING CHECKUP</Text>
            <Text style={styles.cardMainText}>How do you feel today?</Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('MoodCheckupApp')}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* White Content Area */}
      <ScrollView style={styles.whiteContent} showsVerticalScrollIndicator={false}>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <TouchableOpacity 
            style={styles.sectionTitleContainer}
            onPress={() => navigation.navigate('FeaturesScreen')}
          >
            <Text style={styles.sectionTitle}>Our Features</Text>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.featuresGrid}>
            {/* First Row */}
            <View style={styles.featureRow}>
              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("AIDoctor")}
              >
                <PngIcon source={CameraPng} style={styles.featureIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("AiHealthCheckupScreen")}
              >
                <PngIcon source={GamesPng} style={styles.featureIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("MentalHealthScreen")}
              >
                <PngIcon source={PrescriptionPng} style={styles.featureIcon} />
              </TouchableOpacity>
            </View>

            {/* Second Row */}
            <View style={styles.featureRow}>
              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("HealthGames")}
              >
                <PngIcon source={DoctorPng} style={styles.featureIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("CosmeticScreen")}
              >
                <PngIcon source={CheckupPng} style={styles.featureIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("SymptomChecker")}
              >
                <PngIcon source={CalendarPng} style={styles.featureIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Today's Vitals Section */}
        <View style={styles.vitalsSection}>
          <TouchableOpacity 
            style={styles.vitalsSectionHeader}
            onPress={() => navigation.navigate('VitalsScreen')}
          >
            <Text style={styles.vitalsMainTitle}>Today's Vitals</Text>
             <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.vitalsCardsContainer}>
            {/* Heart Rate Card */}
            <View style={styles.vitalCard}>
              <Text style={styles.vitalCardTitle}>Heart Rate</Text>
              <Text style={styles.vitalCardTime}>15 min ago</Text>
              
              {/* Heart Rate Graph */}
              <View style={styles.heartRateGraph}>
                <Svg width="100%" height="50" viewBox="0 0 200 50">
                  <Path
                    d="M 0 25 L 20 25 L 25 18 L 30 32 L 35 10 L 40 25 L 60 25 L 65 18 L 70 32 L 75 10 L 80 25 L 100 25 L 105 18 L 110 32 L 115 10 L 120 25 L 140 25 L 145 20 L 150 30 L 155 15 L 160 25 L 180 25 L 185 20 L 190 30 L 195 18 L 200 25"
                    stroke="#FF6B9D"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>

              <View style={styles.vitalCardBottom}>
                <Text style={styles.vitalMainValue}>84</Text>
                <Text style={styles.vitalUnit}>bpm</Text>
              </View>
            </View>

            {/* Blood Pressure Card */}
            <View style={styles.vitalCard}>
              <Text style={styles.vitalCardTitle}>Blood Pressure</Text>
              <Text style={styles.vitalCardTime}>15 min ago</Text>
              
              {/* Blood Pressure Bar Chart */}
              <View style={styles.bpGraph}>
                <View style={[styles.bpBar, { height: 25, backgroundColor: '#60A5FA' }]} />
                <View style={[styles.bpBar, { height: 20, backgroundColor: '#60A5FA' }]} />
                <View style={[styles.bpBar, { height: 28, backgroundColor: '#60A5FA' }]} />
                <View style={[styles.bpBar, { height: 40, backgroundColor: '#F59E0B' }]} />
                <View style={[styles.bpBar, { height: 22, backgroundColor: '#60A5FA' }]} />
                <View style={[styles.bpBar, { height: 32, backgroundColor: '#60A5FA' }]} />
                <View style={[styles.bpBar, { height: 20, backgroundColor: '#60A5FA' }]} />
                <View style={[styles.bpBar, { height: 28, backgroundColor: '#60A5FA' }]} />
                <View style={[styles.bpBar, { height: 35, backgroundColor: '#60A5FA' }]} />
                <View style={[styles.bpBar, { height: 25, backgroundColor: '#F59E0B' }]} />
              </View>

              <View style={styles.vitalCardBottom}>
                <Text style={styles.vitalMainValue}>120/80</Text>
                <Text style={styles.vitalUnit}>sys/dia</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Appointment */}
        <View style={styles.appointmentSection}>
          <TouchableOpacity 
            style={styles.appointmentHeader} 
            onPress={() => navigation.navigate("MyAppointments")}
          >
            <Text style={styles.appointmentTitle}>Upcoming Appointment</Text>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.appointmentCardContainer}>
            <View style={styles.appointmentCard}>
              <View style={styles.doctorAvatar}>
                <Image
                  source={require("../../../assets/doctor.png")}
                  style={styles.doctorImage}
                />
              </View>

              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. Mehra</Text>
                <Text style={styles.doctorSpecialty}>Dermatologist</Text>
              </View>

              <View style={styles.appointmentTime}>
                <Text style={styles.dateText}>04 Sep</Text>
                <Text style={styles.timeText}>10:00 am</Text>
              </View>
            </View>

            <View style={styles.appointmentFooter}>
              <Text style={styles.patientName}>Kaushal</Text>
              <View style={styles.hospitalInfo}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.hospitalName}>Hospital Name</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Prescription Reminders */}
        <View style={styles.prescriptionSection}>
          <TouchableOpacity 
            style={styles.appointmentHeader} 
            onPress={() => navigation.navigate("PrescriptionRemindersScreen")}
          >
            <Text style={styles.appointmentTitle}>Prescription Reminders</Text>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.prescriptionCard}>
            {loadingPrescriptions ? (
              <ActivityIndicator size="small" color="#7475B4" style={{ paddingVertical: 20 }} />
            ) : (
              displayPrescriptions.map((medicine, index) => (
                <React.Fragment key={index}>
                  <View style={styles.medicineItem}>
                    <View style={styles.pillIconContainer}>
                      <Image 
                        source={medicine.icon} 
                        style={styles.pillIconImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.medicineInfo}>
                      <Text style={styles.medicineName}>{medicine.prescriptionName}</Text>
                      <Text style={styles.medicineQuantity}>{medicine.dose}</Text>
                    </View>
                    <View style={styles.medicineTime}>
                      <Text style={styles.medicineType}>{medicine.prescriptionType}</Text>
                      <Text style={styles.timeSlot}>{medicine.time}</Text>
                    </View>
                  </View>
                  {index < displayPrescriptions.length - 1 && (
                    <View style={styles.medicineSeparator} />
                  )}
                </React.Fragment>
              ))
            )}
          </View>
        </View>

        {/* Recommended Reads */}
        <View style={styles.readsSection}>
          <View style={styles.readsHeader}>
            <Text style={styles.readsTitle}>Recommended Reads</Text>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.readsScroll}>
            <View style={styles.readCard}>
              <Image 
                source={require('../../../assets/Dashoabdicons/stress.png')} 
                style={styles.readImage}
                resizeMode="cover"
              />
              <View style={styles.readInfo}>
                <View style={styles.readTag}>
                  <Text style={styles.readTagText}>Stress Management</Text>
                </View>
                <Text style={styles.readTime}>7 min</Text>
                <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce Stress</Text>
              </View>
            </View>

            <View style={styles.readCard}>
              <Image 
                source={require('../../../assets/Dashoabdicons/stress2.png')} 
                style={styles.readImage}
                resizeMode="cover"
              />
              <View style={styles.readInfo}>
                <View style={styles.readTag}>
                  <Text style={styles.readTagText}>Stress Management</Text>
                </View>
                <Text style={styles.readTime}>5 min</Text>
                <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce</Text>
              </View>
            </View>
            <View style={styles.readCard}>
              <Image 
                source={require('../../../assets/Dashoabdicons/stress3.png')} 
                style={styles.readImage}
                resizeMode="cover"
              />
              <View style={styles.readInfo}>
                <View style={styles.readTag}>
                  <Text style={styles.readTagText}>Stress Management</Text>
                </View>
                <Text style={styles.readTime}>5 min</Text>
                <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce</Text>
              </View>
            </View>
          </ScrollView>
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require("../../../assets/Dashoabdicons/home.png")}
            style={styles.navIcon}
          />
          <Text style={[styles.navText, { color: "#7475B4" }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("CaregiverDashboard")}
        >
          <Image
            source={require("../../../assets/Dashoabdicons/dashboad.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("LoginVaultId")}
        >
          <Image
            source={require("../../../assets/Dashoabdicons/Vector.png")}
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Vault</Text>
        </TouchableOpacity>
      </View>

      {/* Siri Orb Button */}
      <View style={styles.chatbotButton}>
        <VoiceOrbButton onPress={handleChatbotPress} />
      </View>

      {/* Sidebar Component */}
      <Sidebar 
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

// Orb Button Styles
const orbStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(30, 30, 60, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  inner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  waveGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  centerGlow: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  highlight: {
    position: 'absolute',
    top: '18%',
    left: '22%',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradientBg: {
    paddingTop: Math.max(StatusBar.currentHeight || 0, 20) + 5,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Math.max(20, screenWidth * 0.05),
    marginBottom: 15,
    marginTop: 5,
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuLine: {
    width: 24,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    marginVertical: 2.5,
  },
  greeting: {
    flex: 1,
    fontSize: Math.min(24, screenWidth * 0.06),
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  sosButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  sosText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF4444",
  },
  wellBeingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
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
    fontFamily: "Poppins_400Regular",
    color: "#7a7a7a",
    fontWeight: "600",
    marginBottom: 0,
    flexWrap: 'wrap',
  },
  cardMainText: {
    fontSize: Math.min(15, screenWidth * 0.04),
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
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
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  vitalCardTitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  vitalCardTime: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
    marginRight: 5,
  },
  vitalUnit: {
    fontSize: 20,
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
  },
  appointmentCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  appointmentCard: {
    backgroundColor: "#C9CAFF",
    padding: Math.max(20, screenWidth * 0.05),
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentFooter: {
    backgroundColor: "#fff",
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
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Poppins_400Regular",
    color: "#1E1E1E",
  },
  patientName: {
    fontSize: Math.min(16, screenWidth * 0.04),
    fontFamily: "Poppins_400Regular",
    color: "#333",
    fontWeight: "600",
  },
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  hospitalName: {
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 2,
  },
  timeText: {
    fontSize: Math.min(18, screenWidth * 0.045),
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
  },
  prescriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: Math.max(20, screenWidth * 0.05),
    borderWidth: 1,
    borderColor: "#ddd",
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
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  medicineQuantity: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Poppins_400Regular",
    color: "#666",
  },
  medicineTime: {
    alignItems: "flex-end",
  },
  medicineType: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  timeSlot: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
  },
  readsScroll: {
    paddingLeft: 0,
  },
  readCard: {
    width: Math.min(280, screenWidth * 0.7),
    marginRight: 15,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
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
    fontFamily: "Poppins_400Regular",
    color: "#39A6A3",
    fontWeight: "500",
  },
  readTime: {
    fontSize: Math.min(12, screenWidth * 0.03),
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginBottom: 8,
    textAlign: "right",
    position: "absolute",
    top: 15,
    right: 15,
  },
  readTitle: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontFamily: "Poppins_400Regular",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
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
    fontFamily: "Poppins_400Regular",
    color: "#999",
  },
  chatbotButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});