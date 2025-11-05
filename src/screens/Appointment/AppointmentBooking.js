import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  SafeAreaView,
  Modal
} from "react-native";
import { BASE_URL } from "../../config/config";

export default function AppointmentBooking() {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [slot, setSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctorDetails, setDoctorDetails] = useState(null);

  // Calendar states
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown states for iOS fix
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showSlotDropdown, setShowSlotDropdown] = useState(false);
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);
  const [showLocDropdown, setShowLocDropdown] = useState(false);

  // Custom Dropdown Component (iOS Compatible)
  const CustomDropdown = ({ 
    visible, 
    onClose, 
    options, 
    selectedValue, 
    onSelect, 
    title,
    renderItem 
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.dropdownOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.dropdownModal}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.dropdownClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.dropdownList}>
            {options.map((option, index) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : (option.label || renderItem?.(option));
              const isSelected = selectedValue === value;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    isSelected && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    onSelect(value, option);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      isSelected && styles.dropdownItemTextSelected
                    ]}
                    numberOfLines={2}
                  >
                    {label}
                  </Text>
                  {isSelected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Calendar helper functions
  const getCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      const isSelected = selectedDate === formatDate(date);
      
      dates.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSelected,
        dateString: formatDate(date)
      });
    }
    
    return dates;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const selectDate = (dateString) => {
    setSelectedDate(dateString);
    setShowCalendar(false);
    setSlot("");
    if (selectedDoctor) {
      fetchAvailableSlotsForDate(selectedDoctor, dateString);
    }
  };

  const fetchAvailableSlotsForDate = async (doctorId, date) => {
    try {
      const response = await fetch(`${BASE_URL}/api/doctors/${doctorId}/slots?date=${date}`);
      const data = await response.json();
      
      if (response.ok) {
        setAvailableSlots(data.availableSlots || []);
      } else {
        const doctor = doctors.find(doc => doc._id === doctorId);
        setAvailableSlots(doctor?.availableSlots || []);
      }
    } catch (error) {
      console.error("Error fetching slots for date:", error);
      const doctor = doctors.find(doc => doc._id === doctorId);
      setAvailableSlots(doctor?.availableSlots || []);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchFilters();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      
      let url = `${BASE_URL}/api/doctors`;
      const params = new URLSearchParams();
      
      if (searchQuery?.trim()) params.append('search', searchQuery);
      if (selectedSpecialization) params.append('specialization', selectedSpecialization);
      if (selectedLocation) params.append('location', selectedLocation);
      if (minRating) params.append('rating', minRating);
      
      if (params.toString()) {
        url = `${BASE_URL}/api/doctors/search/doctors?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      const doctorsData = data.doctors || data;
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      
      if (doctorsData?.length > 0) {
        setSelectedDoctor(doctorsData[0]._id);
        setDoctorDetails(doctorsData[0]);
        if (selectedDate) {
          fetchAvailableSlotsForDate(doctorsData[0]._id, selectedDate);
        } else {
          setAvailableSlots(doctorsData[0].availableSlots || []);
        }
      } else {
        setSelectedDoctor("");
        setDoctorDetails(null);
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error("Fetch doctors error:", err);
      Alert.alert("Error", "Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [specRes, locRes] = await Promise.all([
        fetch(`${BASE_URL}/api/doctors/filter/specializations`),
        fetch(`${BASE_URL}/api/doctors/filter/locations`)
      ]);
      
      const specData = await specRes.json();
      const locData = await locRes.json();
      
      setSpecializations(specData.specializations || []);
      setLocations(locData.locations || []);
    } catch (err) {
      console.error("Fetch filters error:", err);
      setSpecializations(["Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics"]);
      setLocations(["Delhi", "Gurgaon", "Noida", "Mumbai", "Bangalore"]);
    }
  };

  useEffect(() => {
    const doctor = doctors.find((doc) => doc._id === selectedDoctor);
    if (doctor) {
      setDoctorDetails(doctor);
      
      if (selectedDate) {
        fetchAvailableSlotsForDate(doctor._id, selectedDate);
      } else {
        setAvailableSlots(doctor.availableSlots || []);
      }
      setSlot("");
    }
  }, [selectedDoctor, doctors]);

  const handleSearch = () => {
    fetchDoctors();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialization("");
    setSelectedLocation("");
    setMinRating("");
    setShowFilters(false);
    setTimeout(() => fetchDoctors(), 100);
  };

  const handleBooking = async () => {
    if (!patientName || !patientEmail || !selectedDoctor || !slot || !selectedDate) {
      Alert.alert("Error", "Please fill all fields including date selection");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          patientName,
          patientEmail,
          slot,
          appointmentDate: selectedDate
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", `Appointment booked successfully for ${formatDisplayDate(selectedDate)}!`);
        setPatientName("");
        setPatientEmail("");
        setSlot("");
        setSelectedDate("");
        setAvailableSlots(prevSlots => prevSlots.filter((s) => s !== slot));
      } else {
        Alert.alert("Error", data.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  if (loadingDoctors) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loaderText}>Loading doctors...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        
        <Text style={styles.heading}>Book an Appointment</Text>

        {/* Patient Information Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={patientName}
            onChangeText={setPatientName}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={patientEmail}
            onChangeText={setPatientEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Search & Filter Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Find Doctor</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, specialization..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.filterToggle} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterToggleText}>
              {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
            </Text>
          </TouchableOpacity>

          {showFilters && (
            <View style={styles.filtersContainer}>
              <Text style={styles.filterLabel}>Specialization:</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSpecDropdown(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {selectedSpecialization || "All Specializations"}
                </Text>
                <Text style={styles.pickerIcon}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.filterLabel}>Location:</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowLocDropdown(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {selectedLocation || "All Locations"}
                </Text>
                <Text style={styles.pickerIcon}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.filterLabel}>Minimum Rating:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 4.0"
                value={minRating}
                onChangeText={setMinRating}
                keyboardType="numeric"
              />

              <View style={styles.filterButtons}>
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleSearch}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={styles.resultsText}>
            {doctors.length} doctor(s) found
          </Text>
        </View>

        {/* Doctor Selection Card */}
        {doctors.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Doctor</Text>
            
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDoctorDropdown(true)}
            >
              <Text style={styles.pickerButtonText} numberOfLines={1}>
                {doctorDetails ? `${doctorDetails.name} - ${doctorDetails.specialization}` : "Choose a doctor"}
              </Text>
              <Text style={styles.pickerIcon}>▼</Text>
            </TouchableOpacity>

            {doctorDetails && (
              <View style={styles.doctorDetailsCard}>
                <Text style={styles.doctorName}>{doctorDetails.name}</Text>
                <View style={styles.doctorInfoRow}>
                  <Text style={styles.doctorInfo}>🏥 {doctorDetails.specialization}</Text>
                  <Text style={styles.doctorInfo}>⭐ {doctorDetails.rating || "4.0"}</Text>
                </View>
                <View style={styles.doctorInfoRow}>
                  <Text style={styles.doctorInfo}>💰 ₹{doctorDetails.fees || "500"}</Text>
                  <Text style={styles.doctorInfo}>📍 {doctorDetails.location || "Delhi"}</Text>
                </View>
                <View style={styles.doctorInfoRow}>
                  <Text style={styles.doctorInfo}>👨‍⚕️ {doctorDetails.experience} years exp</Text>
                  <Text style={styles.doctorInfo}>
                    🏨 {doctorDetails.hospitalName || "Clinic"}
                  </Text>
                </View>
                {doctorDetails.bio && (
                  <Text style={styles.doctorBio}>{doctorDetails.bio}</Text>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.noResultsText}>
              No doctors found matching your criteria
            </Text>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Date Selection Card */}
        {selectedDoctor && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Appointment Date</Text>
            
            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <Text style={styles.dateSelectorText}>
                {selectedDate ? formatDisplayDate(selectedDate) : "📅 Choose Date"}
              </Text>
              <Text style={styles.dateSelectorIcon}>
                {showCalendar ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {showCalendar && (
              <View style={styles.calendarContainer}>
                <View style={styles.monthHeader}>
                  <TouchableOpacity onPress={() => navigateMonth(-1)}>
                    <Text style={styles.navButton}>◀</Text>
                  </TouchableOpacity>
                  <Text style={styles.monthTitle}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </Text>
                  <TouchableOpacity onPress={() => navigateMonth(1)}>
                    <Text style={styles.navButton}>▶</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.weekHeader}>
                  {weekDays.map((day) => (
                    <Text key={day} style={styles.weekDay}>{day}</Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {getCalendarDates().map((dateObj, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dateCell,
                        !dateObj.isCurrentMonth && styles.dateCellInactive,
                        dateObj.isPast && styles.dateCellPast,
                        dateObj.isToday && styles.dateCellToday,
                        dateObj.isSelected && styles.dateCellSelected
                      ]}
                      onPress={() => !dateObj.isPast && dateObj.isCurrentMonth && selectDate(dateObj.dateString)}
                      disabled={dateObj.isPast || !dateObj.isCurrentMonth}
                    >
                      <Text style={[
                        styles.dateText,
                        !dateObj.isCurrentMonth && styles.dateTextInactive,
                        dateObj.isPast && styles.dateTextPast,
                        dateObj.isToday && styles.dateTextToday,
                        dateObj.isSelected && styles.dateTextSelected
                      ]}>
                        {dateObj.day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Time Slot Selection Card */}
        {selectedDoctor && selectedDate && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            <Text style={styles.selectedDateText}>
              📅 {formatDisplayDate(selectedDate)}
            </Text>
            
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => availableSlots.length > 0 && setShowSlotDropdown(true)}
              disabled={availableSlots.length === 0}
            >
              <Text style={[
                styles.pickerButtonText,
                availableSlots.length === 0 && styles.disabledText
              ]}>
                {slot || (availableSlots.length > 0 ? "Choose a time slot" : "No slots available")}
              </Text>
              {availableSlots.length > 0 && (
                <Text style={styles.pickerIcon}>▼</Text>
              )}
            </TouchableOpacity>
            
            {availableSlots.length === 0 && (
              <Text style={styles.noSlotsText}>
                No available slots for this date. Please select another date.
              </Text>
            )}
          </View>
        )}

        {/* Booking Summary */}
        {selectedDoctor && selectedDate && slot && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Doctor:</Text>
              <Text style={styles.summaryValue}>{doctorDetails?.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{formatDisplayDate(selectedDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time:</Text>
              <Text style={styles.summaryValue}>{slot}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fees:</Text>
              <Text style={styles.summaryValue}>₹{doctorDetails?.fees || "500"}</Text>
            </View>
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity 
          style={[
            styles.bookButton, 
            (!patientName || !patientEmail || !selectedDoctor || !slot || !selectedDate) && styles.bookButtonDisabled
          ]}
          onPress={handleBooking}
          disabled={!patientName || !patientEmail || !selectedDoctor || !slot || !selectedDate}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Doctor Dropdown Modal */}
      <CustomDropdown
        visible={showDoctorDropdown}
        onClose={() => setShowDoctorDropdown(false)}
        options={doctors}
        selectedValue={selectedDoctor}
        onSelect={(value, doctor) => setSelectedDoctor(value)}
        title="Select Doctor"
        renderItem={(doc) => `${doc.name} - ${doc.specialization}`}
      />

      {/* Slot Dropdown Modal */}
      <CustomDropdown
        visible={showSlotDropdown}
        onClose={() => setShowSlotDropdown(false)}
        options={availableSlots}
        selectedValue={slot}
        onSelect={(value) => setSlot(value)}
        title="Select Time Slot"
      />

      {/* Specialization Dropdown Modal */}
      <CustomDropdown
        visible={showSpecDropdown}
        onClose={() => setShowSpecDropdown(false)}
        options={[{ label: "All Specializations", value: "" }, ...specializations.map(s => ({ label: s, value: s }))]}
        selectedValue={selectedSpecialization}
        onSelect={(value) => setSelectedSpecialization(value)}
        title="Select Specialization"
      />

      {/* Location Dropdown Modal */}
      <CustomDropdown
        visible={showLocDropdown}
        onClose={() => setShowLocDropdown(false)}
        options={[{ label: "All Locations", value: "" }, ...locations.map(l => ({ label: l, value: l }))]}
        selectedValue={selectedLocation}
        onSelect={(value) => setSelectedLocation(value)}
        title="Select Location"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  scrollView: {
    flex: 1
  },
  container: {
    padding: 16,
    paddingBottom: 30
  },
  
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
    marginTop: 10
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12
  },

  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    fontSize: 16
  },

  searchContainer: {
    flexDirection: "row",
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    marginRight: 8,
    fontSize: 16
  },
  searchButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  searchButtonText: {
    fontSize: 18
  },

  filterToggle: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef"
  },
  filterToggleText: {
    color: "#007bff",
    fontWeight: "600",
    fontSize: 14
  },

  filtersContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    marginTop: 8
  },

  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12
  },
  clearButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 0.45
  },
  clearButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600"
  },
  applyButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 0.45
  },
  applyButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600"
  },

  resultsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic"
  },

  // iOS Compatible Picker Button
  pickerButton: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
    flex: 1
  },
  pickerIcon: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8
  },
  disabledText: {
    color: "#999"
  },

  // Dropdown Modal Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#007bff',
  },
  checkmark: {
    fontSize: 20,
    color: '#007bff',
    fontWeight: 'bold',
  },

  doctorDetailsCard: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff"
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8
  },
  doctorInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  doctorInfo: {
    fontSize: 14,
    color: "#666",
    flex: 1
  },
  doctorBio: {
    fontSize: 13,
    color: "#777",
    marginTop: 8,
    fontStyle: "italic",
    lineHeight: 18
  },

  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
    marginBottom: 12
  },
  dateSelectorText: {
    fontSize: 16,
    color: "#333",
    flex: 1
  },
  dateSelectorIcon: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "bold"
  },

  calendarContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },

  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  navButton: {
    fontSize: 20,
    color: "#007bff",
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333"
  },

  weekHeader: {
    flexDirection: "row",
    marginBottom: 8
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    paddingVertical: 4
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  dateCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginBottom: 4
  },
  dateCellInactive: {
    opacity: 0.3
  },
  dateCellPast: {
    backgroundColor: "#f8f8f8"
  },
  dateCellToday: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#2196f3"
  },
  dateCellSelected: {
    backgroundColor: "#007bff"
  },

  dateText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500"
  },
  dateTextInactive: {
    color: "#ccc"
  },
  dateTextPast: {
    color: "#999"
  },
  dateTextToday: {
    color: "#2196f3",
    fontWeight: "bold"
  },
  dateTextSelected: {
    color: "#fff",
    fontWeight: "bold"
  },

  selectedDateText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    backgroundColor: "#e3f2fd",
    padding: 8,
    borderRadius: 6
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600"
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500"
  },

  noResultsText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginVertical: 20,
    fontStyle: "italic"
  },
  noSlotsText: {
    textAlign: "center",
    color: "#dc3545",
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic"
  },

  bookButton: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  bookButtonDisabled: {
    backgroundColor: "#cccccc"
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center"
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5"
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666"
  }
});