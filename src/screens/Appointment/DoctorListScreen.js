// --- Updated BookAppointmentScreen with Custom Dropdowns --- //

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "../../config/config";

export default function BookAppointmentScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minRating, setMinRating] = useState("");

  // Temporary filter states
  const [tempSpecialization, setTempSpecialization] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [tempMinRating, setTempMinRating] = useState("");

  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(null);

  // unique lists
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);

  // Rating options
  const ratingOptions = [
    { label: "Any Rating", value: "" },
    { label: "3+ Stars", value: "3" },
    { label: "4+ Stars", value: "4" },
    { label: "4.5+ Stars", value: "4.5" },
  ];

  // Backend se doctors fetch karna
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/doctors`);
        const data = await response.json();
        setDoctors(data);
        setFilteredDoctors(data);

        // unique values extract
        const uniqueSpecs = [...new Set(data.map((d) => d.specialization))];
        const uniqueLocs = [...new Set(data.map((d) => d.location))];
        setSpecializations(uniqueSpecs);
        setLocations(uniqueLocs);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Search + Filter functionality
  useEffect(() => {
    let filtered = doctors;

    if (searchText.trim() !== "") {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchText.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(
        (doc) => doc.specialization === selectedSpecialization
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter((doc) => doc.location === selectedLocation);
    }

    if (minRating) {
      filtered = filtered.filter(
        (doc) => (doc.rating || 0) >= parseFloat(minRating)
      );
    }

    setFilteredDoctors(filtered);
  }, [searchText, doctors, selectedSpecialization, selectedLocation, minRating]);

  const applyFilters = () => {
    setSelectedSpecialization(tempSpecialization);
    setSelectedLocation(tempLocation);
    setMinRating(tempMinRating);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedSpecialization("");
    setSelectedLocation("");
    setMinRating("");
    setTempSpecialization("");
    setTempLocation("");
    setTempMinRating("");
    setShowFilters(false);
  };

  // Custom Dropdown Component
  const CustomFilterDropdown = ({ field, label, options, value, onValueChange }) => {
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.filterDropdownButton}
          onPress={() => setShowDropdown(field)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterDropdownButtonText,
            !selectedOption?.label || selectedOption.label === 'Select' ? styles.filterDropdownButtonTextPlaceholder : null
          ]}>
            {selectedOption?.label || label}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Modal
          visible={showDropdown === field}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(null)}
        >
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(null)}
          >
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setShowDropdown(null)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.dropdownList}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      value === option.value && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      onValueChange(option.value);
                      setShowDropdown(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        value === option.value && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  // Star rating component
  const StarRating = ({ rating, totalReviews }) => {
    const stars = [];
    // Always show 5 full stars (as per image)
    for (let i = 0; i < 5; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>{stars}</View>
        <Text style={styles.reviewCount}>({totalReviews || 127})</Text>
      </View>
    );
  };

  // Doctor card with navigation
  const DoctorCard = ({ item }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate("DoctorCard", { doctor: item })}
    >
      <View style={styles.doctorInfo}>
        <View style={styles.avatarContainer}>
          <Image 
            source={require("../../../assets/doctor.png")} 
            style={styles.avatar} 
          />
        </View>
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.specialization}>
            {item.specialization || "General Practitioner"} | {item.location || "Location"}
          </Text>
          <StarRating
            rating={item.rating || 5}
            totalReviews={item.totalReviews || 127}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Prepare dropdown options
  const specializationOptions = [
    { label: "All Specializations", value: "" },
    ...specializations.map(spec => ({ label: spec, value: spec }))
  ];

  const locationOptions = [
    { label: "All Locations", value: "" },
    ...locations.map(loc => ({ label: loc, value: loc }))
  ];

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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search files here"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              style={styles.filterIconContainer}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={
                  selectedSpecialization || selectedLocation || minRating
                    ? "#8B5CF6"
                    : "#8B5CF6"
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Doctors associated with us</Text>
        </View>

        {/* Doctors List */}
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => <DoctorCard item={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filters</Text>

            <ScrollView style={styles.filterScrollView}>
              {/* Specialization Dropdown */}
              <CustomFilterDropdown
                field="specialization"
                label="Specialization"
                options={specializationOptions}
                value={tempSpecialization}
                onValueChange={setTempSpecialization}
              />

              {/* Location Dropdown */}
              <CustomFilterDropdown
                field="location"
                label="Location"
                options={locationOptions}
                value={tempLocation}
                onValueChange={setTempLocation}
              />

              {/* Rating Dropdown */}
              <CustomFilterDropdown
                field="rating"
                label="Rating"
                options={ratingOptions}
                value={tempMinRating}
                onValueChange={setTempMinRating}
              />
            </ScrollView>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
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
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: { width: 40 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(233, 233, 233, 1)",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#000" },
  filterIconContainer: {
    marginLeft: 8,
    padding: 4,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  doctorCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 30,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(233, 233, 233, 1)",
  },
  doctorInfo: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { marginRight: 16 },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  defaultAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  doctorDetails: { flex: 1 },
  doctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  specialization: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  starsContainer: { flexDirection: "row", marginRight: 6 },
  reviewCount: { fontSize: 12, color: "#666" },
  separator: { height: 8 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { fontSize: 16, color: "#666" },

  // Filter Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 30,
    paddingHorizontal: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },
  filterScrollView: {
    maxHeight: 400,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  filterDropdownButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(233, 233, 233, 1)",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterDropdownButtonText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  filterDropdownButtonTextPlaceholder: {
    color: "#999",
  },
  
  // Dropdown Modal styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "85%",
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  dropdownItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: "#007AFF",
    fontWeight: "500",
  },
  
  // Modal Action Buttons
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  applyButton: {
    backgroundColor: "#8B5CF6",
  },
  cancelButtonText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "600", 
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});