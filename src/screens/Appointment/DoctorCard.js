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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../config/config";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorDetailScreen({ route, navigation }) {
  const { doctor } = route.params;

  // Patient states
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);

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
      
      // Parse slot like "10:00-10:30"
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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpec}>
                {doctor.specialization} | {doctor.hospitalName}
              </Text>
              <Text style={styles.about}>{doctor.bio}</Text>
            </View>

            <Image
              source={
                doctor.profilePicture
                  ? { uri: doctor.profilePicture }
                  : require("../../../assets/doctor.png")
              }
              style={styles.doctorImage}
            />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{doctor.experience} yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{doctor.patients || 1000}</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {doctor.rating ? `${doctor.rating}/5` : "4/5"}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Patient Selection */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionHeading}>Select Patient</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddPatient}
            >
              <Ionicons name="add-circle" size={20} color="#6C63FF" />
              <Text style={styles.addButtonText}>Add Patient</Text>
            </TouchableOpacity>
          </View>

          {loadingPatients ? (
            <ActivityIndicator size="small" color="#6C63FF" />
          ) : patients.length === 0 ? (
            <View style={styles.noPatientBox}>
              <Text style={styles.noPatientText}>No patients added yet</Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={handleAddPatient}
              >
                <Text style={styles.addFirstButtonText}>Add Your First Patient</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedPatient}
                onValueChange={(itemValue) => setSelectedPatient(itemValue)}
                style={styles.picker}
              >
                {patients.map((patient) => (
                  <Picker.Item
                    key={patient._id}
                    label={`${patient.name} (${patient.relation})`}
                    value={patient._id}
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* 📅 Calendar Date Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateScroll}
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

        {/* Available Slots */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionHeading}>Available Slots</Text>
            <Ionicons name="time-outline" size={20} color="#111" />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#6C63FF" />
          ) : slots.length === 0 ? (
            <Text style={{ color: "#666", marginTop: 10 }}>
              No slots available for this date
            </Text>
          ) : (
            <View style={styles.timeRow}>
              {slots.map((time, i) => (
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
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Book Button */}
      <View style={styles.bottomContainer}>
        <Text style={styles.priceText}>₹{price}</Text>
        <TouchableOpacity 
          style={[styles.bookButton, (!selectedPatient || !selectedTime) && styles.bookButtonDisabled]} 
          onPress={handleBooking}
          disabled={!selectedPatient || !selectedTime}
        >
          <Text style={styles.bookButtonText}>
            {loading ? "Booking..." : "Book Appointment"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  doctorCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  doctorImage: { width: 80, height: 80, borderRadius: 12, marginLeft: 12 },
  doctorName: { fontSize: 18, fontWeight: "bold", color: "#111" },
  doctorSpec: { fontSize: 14, color: "#666", marginVertical: 4 },
  about: { fontSize: 13, color: "#777", marginTop: 2 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: {
    flex: 1,
    backgroundColor: "#F8FCFF",
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CFE7FF",
  },
  statValue: { fontSize: 15, fontWeight: "bold", color: "#111" },
  statLabel: { fontSize: 12, color: "#444", marginTop: 2 },
  section: { marginBottom: 20 },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EEFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#6C63FF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  noPatientBox: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  noPatientText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  addFirstButton: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFirstButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // 📅 Calendar Styles
  dateScroll: { marginTop: 10 },
  dateBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
    minWidth: 60,
    backgroundColor: "#fafafa",
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
    color: "#fff",
  },
  dateNum: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginTop: 4,
  },
  dateNumSelected: {
    color: "#fff",
  },
  // Time Slots
  timeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  timeBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    margin: 6,
  },
  timeSelected: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },
  timeText: { fontSize: 14, color: "#111" },
  timeTextSelected: { color: "#fff" },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceText: { fontSize: 18, fontWeight: "bold", color: "#111" },
  bookButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bookButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});