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
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(null);
  const [editPatientModalVisible, setEditPatientModalVisible] = useState(false);
  const [patientFormData, setPatientFormData] = useState({
    name: "",
    relationship: "Self",
    dateOfBirth: "",
    age: "",
    height: "",
    weight: "",
    gender: "Male",
    phoneNumber: "",
    email: "",
  });

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

    setDetailsModalVisible(false);
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

  // Filter appointments based on search
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    const query = searchQuery.toLowerCase();
    return appointments.filter((item) => {
      const doctor = getDoctorData(item);
      return (
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        (item.patientName && item.patientName.toLowerCase().includes(query))
      );
    });
  }, [appointments, searchQuery, getDoctorData]);

  // Open details modal
  const openDetailsModal = useCallback((item) => {
    setSelectedAppointmentDetails(item);
    setDetailsModalVisible(true);
  }, []);

  // Open edit patient modal
  const openEditPatientModal = useCallback((appointment) => {
    if (appointment) {
      setPatientFormData({
        name: appointment.patientName || "",
        relationship: "Self",
        dateOfBirth: appointment.patientDateOfBirth || "18/12/1997",
        age: appointment.patientAge || "28",
        height: appointment.patientHeight || "100",
        weight: appointment.patientWeight || "100",
        gender: appointment.patientGender || "Male",
        phoneNumber: appointment.patientPhone || "8930188923",
        email: appointment.patientEmail || "",
      });
      setSelectedAppointmentDetails(appointment);
      setEditPatientModalVisible(true);
      setDetailsModalVisible(false);
    }
  }, []);

  // Handle patient update
  const handlePatientUpdate = useCallback(async () => {
    if (!selectedAppointmentDetails || !authToken) {
      Alert.alert("Error", "Missing appointment or authentication");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/bookings/${selectedAppointmentDetails._id}/patient`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            patientName: patientFormData.name,
            patientEmail: patientFormData.email,
            patientPhone: patientFormData.phoneNumber,
            patientDateOfBirth: patientFormData.dateOfBirth,
            patientAge: patientFormData.age,
            patientHeight: patientFormData.height,
            patientWeight: patientFormData.weight,
            patientGender: patientFormData.gender,
            relationship: patientFormData.relationship,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Patient details updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              setEditPatientModalVisible(false);
              fetchAppointments();
            },
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to update patient details");
      }
    } catch (err) {
      console.error("Update patient error:", err);
      Alert.alert("Error", "Failed to update patient details. Please try again.");
    }
  }, [selectedAppointmentDetails, patientFormData, authToken, fetchAppointments]);

  // Format full date for modal
  const formatFullDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "long" });
      return `${dayName}, ${day} ${month}`;
    } catch {
      return "N/A";
    }
  }, []);

  // Render appointment card - memoized
  const renderAppointmentCard = useCallback(({ item }) => {
    const doctor = getDoctorData(item);
    const appointmentDate = item.date ? new Date(item.date) : new Date();
    const dayName = appointmentDate.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = formatDate(item.date);
    const timeRange = item.startTime && item.endTime 
      ? `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
      : formatTime(item.startTime || item.time);
    
    return (
      <View style={styles.appointmentCard}>
        {/* Doctor Info Section */}
        <View style={styles.cardTopSection}>
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

        {/* Appointment Details Section */}
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailText}>{dayName}, {formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailText}>{timeRange}</Text>
          </View>
        </View>
        
        {/* Details Button */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => openDetailsModal(item)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    );
  }, [getDoctorData, formatDate, formatTime, openDetailsModal]);

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={['rgba(254, 215, 112, 0.9)', 'rgba(235, 177, 180, 0.8)', 'rgba(145, 230, 251, 0.7)', 'rgba(217, 213, 250, 0.6)']}
        locations={[0, 0.3, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Empty state
  if (appointments.length === 0) {
    return (
      <LinearGradient
        colors={['rgba(254, 215, 112, 0.9)', 'rgba(235, 177, 180, 0.8)', 'rgba(145, 230, 251, 0.7)', 'rgba(217, 213, 250, 0.6)']}
        locations={[0, 0.3, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
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
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.noDataText}>No appointments booked yet.</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(254, 215, 112, 0.9)', 'rgba(235, 177, 180, 0.8)', 'rgba(145, 230, 251, 0.7)', 'rgba(217, 213, 250, 0.6)']}
      locations={[0, 0.3, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search files here"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FlatList
            data={filteredAppointments}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={renderAppointmentCard}
            scrollEnabled={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </ScrollView>

        {/* Details Modal */}
        <Modal
          visible={detailsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDetailsModalVisible(false)}
        >
          <View style={styles.detailsModalOverlay}>
            <View style={styles.detailsModalContent}>
              {selectedAppointmentDetails && (
                <>
                  <View style={styles.modalDoctorInfo}>
                    <Image
                      source={
                        getDoctorData(selectedAppointmentDetails).profilePicture
                          ? { uri: getDoctorData(selectedAppointmentDetails).profilePicture }
                          : require("../../../assets/doctor.png")
                      }
                      style={styles.modalDoctorPhoto}
                    />
                    <View style={styles.modalDoctorDetails}>
                      <Text style={styles.modalDoctorName}>
                        {getDoctorData(selectedAppointmentDetails).name}
                      </Text>
                      <Text style={styles.modalDoctorSpecialty}>
                        {getDoctorData(selectedAppointmentDetails).specialization}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalDivider} />

                  <View style={styles.modalInfoSection}>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={18} color="#666666" />
                      <Text style={styles.modalInfoText}>
                        {formatFullDate(selectedAppointmentDetails.date)} | {formatTime(selectedAppointmentDetails.startTime || selectedAppointmentDetails.time)}
                      </Text>
                      <TouchableOpacity onPress={() => openRescheduleModal(selectedAppointmentDetails)}>
                        <Ionicons name="create-outline" size={18} color="#8B5CF6" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={18} color="#666666" />
                      <Text style={styles.modalInfoText}>
                        Patient: {selectedAppointmentDetails.patientName || "N/A"}
                      </Text>
                      <TouchableOpacity onPress={() => openEditPatientModal(selectedAppointmentDetails)}>
                        <Ionicons name="create-outline" size={18} color="#8B5CF6" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalDivider} />

                    <View style={styles.modalInfoTextRow}>
                      <Text style={styles.modalInfoText}>
                        Email: {selectedAppointmentDetails.patientEmail || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.modalInfoTextRow}>
                      <Text style={styles.modalInfoText}>
                        Hospital: {selectedAppointmentDetails.hospitalName || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.modalInfoTextRow}>
                      <Text style={styles.modalInfoText}>
                        Cost: ₹{selectedAppointmentDetails.fees || "0"}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setDetailsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

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
              <Text style={styles.modalTitle}>Edit Appointment Date and Time</Text>
            </View>

            <Text style={styles.sectionLabel}>Select New Date</Text>
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
                      styles.dateBoxText,
                      selectedDate === item.date && styles.dateBoxTextSelected,
                    ]}
                  >
                    {item.day} {item.dayNum}
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
                color="#8B5CF6"
                style={{ marginVertical: 20 }}
              />
            ) : availableSlots.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.slotsContainer}
                contentContainerStyle={styles.slotsScrollContent}
              >
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
              </ScrollView>
            ) : (
              <View style={styles.noSlotsContainer}>
                <Ionicons name="time-outline" size={32} color="#ccc" />
                <Text style={styles.noSlotsText}>
                  No slots available for selected date
                </Text>
              </View>
            )}

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  (!selectedSlot || loadingSlots) && styles.buttonDisabled,
                ]}
                onPress={handleReschedule}
                disabled={loadingSlots || !selectedSlot}
              >
                <Text style={styles.applyButtonText}>
                  {loadingSlots ? "Loading..." : "Apply"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setRescheduleModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Patient Details Modal */}
      <Modal
        visible={editPatientModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditPatientModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editPatientModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Patient Details</Text>
              <TouchableOpacity
                onPress={() => setEditPatientModalVisible(false)}
                style={styles.closeIcon}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.patientFormScroll} showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.patientInput}
                placeholder="Name"
                value={patientFormData.name}
                onChangeText={(text) => setPatientFormData({ ...patientFormData, name: text })}
              />

              <TouchableOpacity style={[styles.patientInput, styles.relationshipInput]}>
                <Text style={styles.patientInputText}>{patientFormData.relationship}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <View style={styles.patientInputRow}>
                <TextInput
                  style={[styles.patientInput, { flex: 1, marginRight: 8 }]}
                  placeholder="Date of Birth"
                  value={patientFormData.dateOfBirth}
                  onChangeText={(text) => setPatientFormData({ ...patientFormData, dateOfBirth: text })}
                />
                <TextInput
                  style={[styles.patientInput, { flex: 1, marginLeft: 8 }]}
                  placeholder="Age"
                  value={patientFormData.age}
                  onChangeText={(text) => setPatientFormData({ ...patientFormData, age: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.patientInputRow}>
                <TextInput
                  style={[styles.patientInput, { flex: 1, marginRight: 8 }]}
                  placeholder="Height"
                  value={patientFormData.height}
                  onChangeText={(text) => setPatientFormData({ ...patientFormData, height: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.patientInput, { flex: 1, marginLeft: 8 }]}
                  placeholder="Weight"
                  value={patientFormData.weight}
                  onChangeText={(text) => setPatientFormData({ ...patientFormData, weight: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.patientInputRow}>
                <TouchableOpacity style={[styles.patientInput, { flex: 1, marginRight: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
                  <Text style={styles.patientInputText}>{patientFormData.gender}</Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                <TextInput
                  style={[styles.patientInput, { flex: 1, marginLeft: 8 }]}
                  placeholder="Phone Number"
                  value={patientFormData.phoneNumber}
                  onChangeText={(text) => setPatientFormData({ ...patientFormData, phoneNumber: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <TextInput
                style={styles.patientInput}
                placeholder="Email"
                value={patientFormData.email}
                onChangeText={(text) => setPatientFormData({ ...patientFormData, email: text })}
                keyboardType="email-address"
              />
            </ScrollView>

            <View style={styles.patientModalButtons}>
              <TouchableOpacity
                style={styles.updatePatientButton}
                onPress={handlePatientUpdate}
              >
                <Text style={styles.updatePatientButtonText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelPatientButton}
                onPress={() => setEditPatientModalVisible(false)}
              >
                <Text style={styles.cancelPatientButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    textAlign: "center",
  },
  headerSpace: {
    width: 40,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  filterButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  appointmentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 30,
    marginBottom: 16,
    padding: 20,
  },
  cardTopSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  doctorPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: "#f0f0f0",
  },
  doctorInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#666666",
  },
  appointmentDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666666",
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A90E2",
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
    paddingTop: 100,
  },
  noDataText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 16,
  },
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsModalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 24,
    overflow: "hidden",
  },
  modalDoctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  modalDoctorPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: "#f0f0f0",
  },
  modalDoctorDetails: {
    flex: 1,
  },
  modalDoctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  modalDoctorSpecialty: {
    fontSize: 14,
    color: "#666666",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  modalInfoSection: {
    marginBottom: 24,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  modalInfoTextRow: {
    marginBottom: 12,
    paddingLeft: 0,
  },
  modalInfoText: {
    fontSize: 14,
    color: "#666666",
  },
  closeButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A90E2",
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
  dateScrollContent: {
    paddingRight: 10,
  },
  dateBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
    backgroundColor: "#ffffff",
  },
  dateBoxSelected: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  dateBoxText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  dateBoxTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
  slotsContainer: {
    marginBottom: 20,
  },
  slotsScrollContent: {
    paddingRight: 10,
  },
  slotBox: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  slotBoxSelected: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  slotText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  slotTextSelected: {
    color: "#ffffff",
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
  modalActionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalButtonText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "600",
  },
  editPatientModalContent: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
  },
  patientFormScroll: {
    maxHeight: 400,
    marginBottom: 20,
  },
  patientInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  relationshipInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  patientInputRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  patientInputText: {
    fontSize: 16,
    color: "#000000",
  },
  patientModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  updatePatientButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  updatePatientButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelPatientButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelPatientButtonText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "600",
  },
});
