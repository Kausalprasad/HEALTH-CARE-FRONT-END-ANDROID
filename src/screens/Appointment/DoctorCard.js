import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "../../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function DoctorDetailScreen({ route, navigation }) {
  const { doctor } = route.params;

  // Patient states
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showPatientPicker, setShowPatientPicker] = useState(false);

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [price, setPrice] = useState(0);
  const [dates, setDates] = useState([]);

  // ✅ Generate next 7 days
  useEffect(() => {
    const generateDates = () => {
      const dateList = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dateList.push({
          date: date.toISOString().split("T")[0],
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          dayNum: date.getDate(),
        });
      }
      setDates(dateList);
    };
    generateDates();
  }, []);

  // ✅ Fetch user's patients
  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const token = await AsyncStorage.getItem("token");
      
      const response = await fetch(`${BASE_URL}/api/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatient(data[0]._id); // Select first patient by default
        }
      } else {
        Alert.alert("Error", "Failed to fetch patients");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoadingPatients(false);
    }
  };

  // ✅ Load patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // ✅ Fetch slots
  const fetchAvailableSlotsForDate = async (doctorId, date) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/doctors/${doctorId}/slots?date=${date}`
      );
      const data = await response.json();

      if (response.ok) {
        setSlots(data.availableSlots || []);
        setPrice(data.price || doctor.fees);
      } else {
        setSlots(doctor?.availableSlots || []);
        setPrice(doctor?.fees || 0);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlots(doctor?.availableSlots || []);
      setPrice(doctor?.fees || 0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initialize today's slots
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchAvailableSlotsForDate(doctor._id, today);
  }, []);

  // ✅ When date changes, fetch new slots
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    fetchAvailableSlotsForDate(doctor._id, date);
  };

  // ✅ Book Appointment
  const handleBooking = async () => {
    if (!selectedPatient) {
      Alert.alert("Error", "Please select a patient");
      return;
    }
    if (!selectedDate || !selectedTime) {
      Alert.alert("Error", "Please select a date & slot");
      return;
    }

    try {
      setLoading(true);
      
      // Get selected patient details
      const patient = patients.find(p => p._id === selectedPatient);
      
      // Parse slot like "10:00-10:30" - handle null/undefined
      if (!selectedTime || typeof selectedTime !== 'string') {
        Alert.alert("Error", "Please select a valid time slot");
        setLoading(false);
        return;
      }
      const [startTime, endTime] = selectedTime.split("-");

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: doctor._id,
          patientName: patient.name,
          patientEmail: patient.email,
          patientId: patient._id,
          date: selectedDate,
          startTime,
          endTime,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Appointment booked successfully");
        setSelectedTime(null);
        navigation.navigate("MyAppointments");
      } else {
        Alert.alert("Error", data.message || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigate to Add Patient
  const handleAddPatient = () => {
    navigation.navigate("AddPatientScreen", {
      onPatientAdded: () => {
        fetchPatients(); // Refresh patient list
      }
    });
  };

  // Format stats
  const formatPatients = (patients) => {
    if (patients >= 1000) {
      return `1k+`;
    }
    return `${patients}+`;
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
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Header */}
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book Appointment</Text>
            <TouchableOpacity onPress={() => navigation.navigate("DoctorProfile", { doctor })}>
              <Ionicons name="information-circle-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Doctor Image Section */}
          <View style={styles.imageContainer}>
            <Image
              source={
                doctor.profilePicture
                  ? { uri: doctor.profilePicture }
                  : require("../../../assets/doctor.png")
              }
              style={styles.doctorImage}
              resizeMode="cover"
            />
          </View>

          {/* White Overlay Card */}
          <View style={styles.whiteCard}>
          {/* Doctor Info */}
          <View style={styles.doctorInfoSection}>
            <Text style={styles.doctorName}>{doctor.name || "Dr. Rajesh Sharma"}</Text>
            <Text style={styles.doctorSpec}>
              {doctor.specialization || "Cardiologist"} | {doctor.hospitalName || "Apollo Hospital"}
            </Text>
            
             {/* Stats Row */}
             <View style={styles.statsRow}>
               <View style={styles.statItem}>
                 <Text style={styles.statValue}>
                   {doctor.experience || 15} Yrs.
                 </Text>
                 <Text style={styles.statLabel}>Experience</Text>
               </View>
               <View style={styles.statItem}>
                 <Text style={styles.statValue}>
                   {formatPatients(doctor.patients || 1000)}
                 </Text>
                 <Text style={styles.statLabel}>Patients</Text>
               </View>
               <View style={styles.statItem}>
                 <Text style={styles.statValue}>
                   {doctor.rating ? `${doctor.rating}/5` : "4.8/5"}
                 </Text>
                 <Text style={styles.statLabel}>Ratings</Text>
               </View>
             </View>
          </View>

           {/* Appointment Date Section */}
           <View style={styles.section}>
             <Text style={styles.sectionHeading}>Appointment Date</Text>
             <View style={styles.dateContainer}>
               <ScrollView
                 horizontal
                 showsHorizontalScrollIndicator={false}
                 style={styles.dateScroll}
                 contentContainerStyle={styles.dateScrollContent}
               >
                 {dates.map((item) => (
                   <TouchableOpacity
                     key={item.date}
                     style={[
                       styles.dateBox,
                       selectedDate === item.date && styles.dateBoxSelected,
                     ]}
                     onPress={() => handleDateSelect(item.date)}
                   >
                     <Text
                       style={[
                         styles.dateDay,
                         selectedDate === item.date && styles.dateDaySelected,
                       ]}
                     >
                       {item.day}
                     </Text>
                     <Text
                       style={[
                         styles.dateNum,
                         selectedDate === item.date && styles.dateNumSelected,
                       ]}
                     >
                       {item.dayNum}
                     </Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
             </View>
           </View>

          {/* Time Slot Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Select Slot</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#6C63FF" style={{ marginTop: 10 }} />
            ) : slots.length === 0 ? (
              <Text style={styles.noSlotsText}>No slots available for this date</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeScroll}
                contentContainerStyle={styles.timeScrollContent}
              >
                {slots.map((time, i) => {
                  // Format time for display - handle null/undefined
                  if (!time) return null;
                  const displayTime = typeof time === 'string' && time.includes('-') ? time.split('-')[0] : time;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.timeBox,
                        selectedTime === time && styles.timeSelected,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selectedTime === time && styles.timeTextSelected,
                        ]}
                      >
                        {displayTime}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

           {/* Patient Information */}
           <View style={styles.section}>
             {loadingPatients ? (
               <ActivityIndicator size="small" color="#6C63FF" />
             ) : (
               <View style={styles.patientRow}>
                 <TouchableOpacity 
                   style={styles.patientField}
                   onPress={() => patients.length > 0 && setShowPatientPicker(true)}
                 >
                   {patients.length === 0 ? (
                     <Text style={styles.patientText}>No patients added</Text>
                   ) : (
                     <View style={styles.patientFieldContent}>
                       <Text style={styles.patientText}>
                         {patients.findIndex(p => p._id === selectedPatient) + 1}. {patients.find(p => p._id === selectedPatient)?.name || "Patient"} ({patients.find(p => p._id === selectedPatient)?.relation || "Me"})
                       </Text>
                       {patients.length > 1 && (
                         <Ionicons name="chevron-down" size={20} color="#666" />
                       )}
                     </View>
                   )}
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={styles.addPatientButton}
                   onPress={handleAddPatient}
                 >
                   <Text style={styles.addPatientButtonText}>Add Patient</Text>
                 </TouchableOpacity>
               </View>
             )}
           </View>
          </View>
        </ScrollView>

        {/* Bottom Book Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.bookButton, (!selectedPatient || !selectedTime) && styles.bookButtonDisabled]} 
            onPress={handleBooking}
            disabled={!selectedPatient || !selectedTime || loading}
          >
            <Text style={styles.bookButtonText}>
              {loading ? "Booking..." : `Book Appointment for ₹${price || 799}`}
            </Text>
          </TouchableOpacity>
         </View>
       </View>

       {/* Patient Picker Modal */}
       <Modal
         visible={showPatientPicker}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setShowPatientPicker(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Select Patient</Text>
               <TouchableOpacity onPress={() => setShowPatientPicker(false)}>
                 <Ionicons name="close" size={24} color="#000" />
               </TouchableOpacity>
             </View>
             <ScrollView style={styles.modalScrollView}>
               {patients.map((patient) => (
                 <TouchableOpacity
                   key={patient._id}
                   style={[
                     styles.patientOption,
                     selectedPatient === patient._id && styles.patientOptionSelected,
                   ]}
                   onPress={() => {
                     setSelectedPatient(patient._id);
                     setShowPatientPicker(false);
                   }}
                 >
                   <Text style={[
                     styles.patientOptionText,
                     selectedPatient === patient._id && styles.patientOptionTextSelected,
                   ]}>
                     {patients.findIndex(p => p._id === patient._id) + 1}. {patient.name} ({patient.relation || "Me"})
                   </Text>
                   {selectedPatient === patient._id && (
                     <Ionicons name="checkmark" size={20} color="#6C63FF" />
                   )}
                 </TouchableOpacity>
               ))}
             </ScrollView>
           </View>
         </View>
       </Modal>
     </LinearGradient>
   );
 }

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerSafeArea: {
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: StatusBar.currentHeight || 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: width,
    height: width * 0.7,
    backgroundColor: "#E0E0E0",
  },
  doctorImage: {
    width: "100%",
    height: "100%",
  },
  whiteCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 600,
  },
  doctorInfoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  doctorSpec: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
   statsRow: {
     flexDirection: "row",
     justifyContent: "space-between",
     width: "100%",
     marginTop: 8,
     paddingHorizontal: 8,
   },
   statItem: {
     flex: 1,
     alignItems: "center",
   },
   statValue: {
     fontSize: 16,
     fontWeight: "700",
     color: "#000",
     marginBottom: 4,
   },
   statLabel: {
     fontSize: 14,
     fontWeight: "400",
     color: "#000",
   },
  section: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
   dateContainer: {
     backgroundColor: "rgba(255, 255, 255, 0.75)",
     borderRadius: 26.58,
     padding: 12,
   },
   dateScroll: {
     marginTop: 0,
   },
   dateScrollContent: {
     paddingRight: 8,
   },
   dateBox: {
     paddingVertical: 12,
     paddingHorizontal: 20,
     borderRadius: 12,
     marginRight: 10,
     alignItems: "center",
     minWidth: 70,
     backgroundColor: "rgba(255, 255, 255, 1)",
   },
  dateBoxSelected: {
    backgroundColor: "#6C63FF",
    borderColor: "#6C63FF",
  },
  dateDay: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  dateDaySelected: {
    color: "#FFFFFF",
  },
  dateNum: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginTop: 4,
  },
  dateNumSelected: {
    color: "#FFFFFF",
  },
  timeScroll: {
    marginTop: 0,
  },
  timeScrollContent: {
    paddingRight: 20,
  },
   timeBox: {
     paddingVertical: 12,
     paddingHorizontal: 20,
     borderRadius: 12.18,
     marginRight: 10,
     backgroundColor: "rgba(255, 255, 255, 0.75)",
     borderWidth: 1,
     borderColor: "#E0E0E0",
   },
   timeSelected: {
     backgroundColor: "rgba(175, 87, 223, 1)",
     borderColor: "rgba(175, 87, 223, 1)",
     borderRadius: 12.18,
   },
  timeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  timeTextSelected: {
    color: "#FFFFFF",
  },
  noSlotsText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
   patientRow: {
     flexDirection: "row",
     justifyContent: "space-between",
     alignItems: "center",
     gap: 12,
   },
   patientField: {
     flex: 1,
     backgroundColor: "rgba(255, 255, 255, 0.75)",
     borderRadius: 12,
     borderWidth: 1,
     borderColor: "#E0E0E0",
     paddingVertical: 14,
     paddingHorizontal: 16,
   },
   patientFieldContent: {
     flexDirection: "row",
     justifyContent: "space-between",
     alignItems: "center",
   },
   patientText: {
     fontSize: 14,
     color: "#000",
   },
   modalOverlay: {
     flex: 1,
     backgroundColor: "rgba(0, 0, 0, 0.5)",
     justifyContent: "flex-end",
   },
   modalContent: {
     backgroundColor: "#FFFFFF",
     borderTopLeftRadius: 20,
     borderTopRightRadius: 20,
     maxHeight: "70%",
   },
   modalHeader: {
     flexDirection: "row",
     justifyContent: "space-between",
     alignItems: "center",
     padding: 20,
     borderBottomWidth: 1,
     borderBottomColor: "#E0E0E0",
   },
   modalTitle: {
     fontSize: 18,
     fontWeight: "600",
     color: "#000",
   },
   modalScrollView: {
     maxHeight: 400,
   },
   patientOption: {
     flexDirection: "row",
     justifyContent: "space-between",
     alignItems: "center",
     padding: 16,
     borderBottomWidth: 1,
     borderBottomColor: "#F0F0F0",
   },
   patientOptionSelected: {
     backgroundColor: "#F0F8FF",
   },
   patientOptionText: {
     fontSize: 16,
     color: "#000",
   },
   patientOptionTextSelected: {
     color: "#6C63FF",
     fontWeight: "600",
   },
   addPatientButton: {
     paddingVertical: 12,
     paddingHorizontal: 20,
     borderRadius: 20,
     borderWidth: 1,
     borderColor: "#6C63FF",
     backgroundColor: "rgba(255, 255, 255, 0.75)",
   },
   addPatientButtonText: {
     fontSize: 14,
     color: "#6C63FF",
     fontWeight: "600",
   },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  bookButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});