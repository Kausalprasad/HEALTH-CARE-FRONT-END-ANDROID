import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { BASE_URL } from "../../config/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function MyAppointments({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const auth = getAuth();

  // Generate next 14 days - memoized
  const dates = useMemo(() => {
    const dateList = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dateList.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return dateList;
  }, []);

  // Get Firebase Auth Token
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const token = await user.getIdToken();
          setAuthToken(token);
        } else {
          setAuthToken(null);
          setAppointments([]);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting token:", error);
        setAuthToken(null);
        setAppointments([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Helper: Get doctor ID from appointment
  const getDoctorId = useCallback((appointment) => {
    if (!appointment) return null;
    return appointment.doctorId?._id || 
           appointment.doctorId || 
           appointment.doctor?._id || 
           appointment.doctor || 
           null;
  }, []);

  // Helper: Get doctor data
  const getDoctorData = useCallback((item) => {
    const doctor = item.doctorId || item.doctor || {};
    return {
      name: doctor.name || "Doctor",
      specialization: doctor.specialization || "Specialist",
      profilePicture: doctor.profilePicture || null,
    };
  }, []);

  // Fetch appointments - optimized with error handling
  const fetchAppointments = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch appointments error:", err);
      Alert.alert("Error", err.message || "Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Cancel booking - optimized
  const handleCancel = useCallback(async (bookingId) => {
    if (!bookingId) return;

    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              });

              const data = await response.json();
              
              if (response.ok) {
                Alert.alert("Success", data.message || "Booking cancelled successfully");
                setRescheduleModalVisible(false);
                fetchAppointments();
              } else {
                Alert.alert("Error", data.message || "Failed to cancel appointment");
              }
            } catch (err) {
              console.error("Cancel booking error:", err);
              Alert.alert("Error", "Failed to cancel appointment. Please try again.");
            }
          },
        },
      ]
    );
  }, [authToken, fetchAppointments]);

  // Fetch slots for date - optimized
  const fetchSlotsForDate = useCallback(async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    setAvailableSlots([]);

    try {
      const response = await fetch(
        `${BASE_URL}/api/doctors/${doctorId}/slots?date=${date}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const slots = data.availableSlots || [];
      setAvailableSlots(slots);

      if (slots.length === 0) {
        Alert.alert("Info", "No slots available for this date");
      }
    } catch (err) {
      console.error("Fetch slots error:", err);
      Alert.alert("Error", "Failed to fetch available slots. Please try another date.");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Open reschedule modal
  const openRescheduleModal = useCallback(async (appointment) => {
    if (!appointment) return;

    setSelectedAppointment(appointment);
    setSelectedSlot("");
    setAvailableSlots([]);

    const appointmentDate = appointment.date
      ? new Date(appointment.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    
    setSelectedDate(appointmentDate);
    setRescheduleModalVisible(true);

    const doctorId = getDoctorId(appointment);
    if (doctorId) {
      fetchSlotsForDate(doctorId, appointmentDate);
    } else {
      Alert.alert("Error", "Doctor ID missing for this appointment");
    }
  }, [getDoctorId, fetchSlotsForDate]);

  // Handle date select
  const handleDateSelect = useCallback((date) => {
    if (!date || !selectedAppointment) return;
    
    setSelectedDate(date);
    setSelectedSlot("");
    
    const doctorId = getDoctorId(selectedAppointment);
    if (doctorId) {
      fetchSlotsForDate(doctorId, date);
    }
  }, [selectedAppointment, getDoctorId, fetchSlotsForDate]);

  // Handle reschedule - optimized
  const handleReschedule = useCallback(async () => {
    if (!selectedAppointment || !selectedSlot || !selectedDate) {
      Alert.alert("Error", "Please select a date and time slot");
      return;
    }

    if (!authToken) {
      Alert.alert("Error", "Authentication required");
      return;
    }

    try {
      if (!selectedSlot || typeof selectedSlot !== 'string') {
        throw new Error("Invalid time slot");
      }
      const slotParts = selectedSlot.split("-");
      if (!slotParts || slotParts.length < 2) {
        throw new Error("Invalid time slot format");
      }
      const [startTime, endTime] = slotParts;
      if (!startTime || !endTime) {
        throw new Error("Invalid time slot format");
      }

      const response = await fetch(
        `${BASE_URL}/api/bookings/${selectedAppointment._id}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            newDate: selectedDate,
            newStartTime: startTime,
            newEndTime: endTime,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Appointment rescheduled successfully!", [
          {
            text: "OK",
            onPress: () => {
              setRescheduleModalVisible(false);
              setSelectedAppointment(null);
              setSelectedSlot("");
              setSelectedDate(null);
              fetchAppointments();
            },
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to reschedule appointment");
      }
    } catch (err) {
      console.error("Reschedule error:", err);
      Alert.alert("Error", err.message || "Failed to reschedule appointment. Please try again.");
    }
  }, [selectedAppointment, selectedSlot, selectedDate, authToken, fetchAppointments]);

  // Format date - memoized
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      });
    } catch {
      return "N/A";
    }
  }, []);

  // Format time - memoized with better null handling
  const formatTime = useCallback((timeString) => {
    if (!timeString || typeof timeString !== 'string') return "N/A";
    try {
      const parts = timeString.split(":");
      if (!parts || parts.length < 2) return "N/A";
      const hours = parts[0];
      const minutes = parts[1];
      const hour = parseInt(hours, 10);
      if (isNaN(hour)) return "N/A";
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes || "00"} ${ampm}`;
    } catch (err) {
      console.error("Format time error:", err, timeString);
      return "N/A";
    }
  }, []);

  // Render appointment card - memoized
  const renderAppointmentCard = useCallback(({ item }) => {
    const doctor = getDoctorData(item);
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.cardTop}>
          <View style={styles.leftInfo}>
            <Image
              source={
                doctor.profilePicture
                  ? { uri: doctor.profilePicture }
                  : require("../../../assets/doctor.png")
              }
              style={styles.doctorPhoto}
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
            </View>
          </View>

          <View style={styles.rightInfo}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            <Text style={styles.timeText}>{formatTime(item.startTime || item.time)}</Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.patientInfo}>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Patient: </Text>
              <Text style={styles.infoValue}>{item.patientName || "N/A"}</Text>
            </Text>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Email: </Text>
              <Text style={styles.infoValue}>{item.patientEmail || "N/A"}</Text>
            </Text>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Hospital: </Text>
              <Text style={styles.infoValue}>{item.hospitalName || "N/A"}</Text>
            </Text>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Cost: </Text>
              <Text style={styles.infoValue}>₹{item.fees || "0"}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openRescheduleModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#5DBAAE" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [getDoctorData, formatDate, formatTime, openRescheduleModal]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#5DBAAE" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (appointments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <View style={styles.headerSpace} />
        </View>
        <View style={styles.separator} />
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.noDataText}>No appointments booked yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.separator} />

      <View style={styles.content}>
        <Text style={styles.upcomingText}>Upcoming</Text>

        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={renderAppointmentCard}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </View>

      {/* Reschedule Modal */}
      <Modal
        visible={rescheduleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Appointment</Text>
              <TouchableOpacity
                onPress={() => setRescheduleModalVisible(false)}
                style={styles.closeIcon}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedAppointment && (
              <View style={styles.currentInfo}>
                <Text style={styles.currentLabel}>Current Appointment:</Text>
                <Text style={styles.currentValue}>
                  {formatDate(selectedAppointment.date)} at{" "}
                  {formatTime(selectedAppointment.startTime || selectedAppointment.time)}
                </Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>Select New Date</Text>
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
                  <Text
                    style={[
                      styles.dateMonth,
                      selectedDate === item.date && styles.dateMonthSelected,
                    ]}
                  >
                    {item.month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
              Select New Time Slot
            </Text>
            {loadingSlots ? (
              <ActivityIndicator
                size="large"
                color="#5DBAAE"
                style={{ marginVertical: 20 }}
              />
            ) : availableSlots.length > 0 ? (
              <ScrollView
                style={styles.slotsContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.slotsGrid}>
                  {availableSlots
                    .filter(slot => slot && typeof slot === 'string')
                    .map((slot, index) => {
                      const slotParts = slot.split("-");
                      const start = slotParts && slotParts.length > 0 ? slotParts[0] : null;
                      return (
                        <TouchableOpacity
                          key={`${slot}-${index}`}
                          style={[
                            styles.slotBox,
                            selectedSlot === slot && styles.slotBoxSelected,
                          ]}
                          onPress={() => setSelectedSlot(slot)}
                        >
                          <Text
                            style={[
                              styles.slotText,
                              selectedSlot === slot && styles.slotTextSelected,
                            ]}
                          >
                            {start ? formatTime(start) : "N/A"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.noSlotsContainer}>
                <Ionicons name="time-outline" size={32} color="#ccc" />
                <Text style={styles.noSlotsText}>
                  No slots available for selected date
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.updateBtn,
                (!selectedSlot || loadingSlots) && styles.buttonDisabled,
              ]}
              onPress={handleReschedule}
              disabled={loadingSlots || !selectedSlot}
            >
              <Text style={styles.buttonText}>
                {loadingSlots ? "Loading..." : "Update Appointment"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelBtn]}
              onPress={() => handleCancel(selectedAppointment?._id)}
            >
              <Text style={styles.buttonText}>Cancel Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    textAlign: "center",
    marginRight: 36,
  },
  headerSpace: {
    width: 36,
  },
  placeholder: {
    width: 24,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  upcomingText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 20,
  },
  appointmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTop: {
    backgroundColor: "#C9CAFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: "#ffffff",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  rightInfo: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  cardBottom: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  patientInfo: {
    flex: 1,
  },
  infoLine: {
    fontSize: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#000000",
  },
  infoValue: {
    fontWeight: "400",
    color: "#000000",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  editText: {
    fontSize: 16,
    color: "#5DBAAE",
    fontWeight: "500",
    marginLeft: 4,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  closeIcon: {
    padding: 4,
  },
  currentInfo: {
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#5DBAAE",
  },
  currentLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  dateScroll: {
    marginBottom: 10,
  },
  dateBox: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
    minWidth: 60,
    backgroundColor: "#fafafa",
  },
  dateBoxSelected: {
    backgroundColor: "#5DBAAE",
    borderColor: "#5DBAAE",
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
  dateMonth: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  dateMonthSelected: {
    color: "#fff",
  },
  slotsContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  slotBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    margin: 6,
    backgroundColor: "#fafafa",
  },
  slotBoxSelected: {
    backgroundColor: "#5DBAAE",
    borderColor: "#5DBAAE",
  },
  slotText: {
    fontSize: 14,
    color: "#111",
  },
  slotTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  noSlotsContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  noSlotsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 12,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  updateBtn: {
    backgroundColor: "#5DBAAE",
  },
  cancelBtn: {
    backgroundColor: "#dc3545",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
