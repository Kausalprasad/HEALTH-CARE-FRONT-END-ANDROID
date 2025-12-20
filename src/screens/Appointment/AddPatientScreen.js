import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { BASE_URL } from "../../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddPatientScreen({ route, navigation }) {
  const { onPatientAdded } = route.params || {};

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [relation, setRelation] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("ft/inch");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [loading, setLoading] = useState(false);

  // Relations dropdown options
  const relations = [
    "Self",
    "Father",
    "Mother",
    "Spouse",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
    "Other",
  ];

  // ✅ Calculate age from DOB
  const calculateAge = (dateString) => {
    if (!dateString || dateString.length !== 10) return "";
    
    const parts = dateString.split("-");
    if (parts.length !== 3) return "";
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return "";
    
    const birthDate = new Date(year, month, day);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    
    return calculatedAge.toString();
  };

  // ✅ Handle DOB change
  const handleDobChange = (text) => {
    // Auto-format DD-MM-YYYY
    let formatted = text.replace(/[^0-9]/g, "");
    
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + "-" + formatted.slice(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.slice(0, 5) + "-" + formatted.slice(5, 9);
    }
    
    setDob(formatted);
    
    // Auto-calculate age when DOB is complete
    if (formatted.length === 10) {
      const calculatedAge = calculateAge(formatted);
      if (calculatedAge) {
        setAge(calculatedAge);
      }
    }
  };

  // ✅ Validate form
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter patient name");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter email");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter valid email");
      return false;
    }
    if (!dob || dob.length !== 10) {
      Alert.alert("Error", "Please enter valid date of birth (DD-MM-YYYY)");
      return false;
    }
    if (!age) {
      Alert.alert("Error", "Age is required");
      return false;
    }
    return true;
  };

  // ✅ Add Patient API
  const handleAddPatient = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const patientData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        relation,
        dob,
        age,
        gender,
        height: height ? `${height} ${heightUnit}` : "",
        weight: weight ? `${weight} ${weightUnit}` : "",
      };

      const response = await fetch(`${BASE_URL}/api/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Patient added successfully", [
          {
            text: "OK",
            onPress: () => {
              if (onPatientAdded) onPatientAdded();
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Error", data.error || "Failed to add patient");
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
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
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Member</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* White Card Container */}
          <View style={styles.whiteCard}>
            {/* Add Your Details Heading */}
            <Text style={styles.cardHeading}>Add Your Details</Text>

            {/* Name */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Member Relation */}
            <View style={styles.inputGroup}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={relation || ""}
                  onValueChange={(itemValue) => {
                    if (itemValue) setRelation(itemValue);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Member Relation" value="" />
                  {relations.map((rel) => (
                    <Picker.Item key={rel} label={rel} value={rel} />
                  ))}
                </Picker>
                <View style={styles.pickerIcon}>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </View>
              </View>
            </View>

            {/* DOB and Age Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#999"
                  value={dob}
                  onChangeText={handleDobChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  placeholderTextColor="#999"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Weight and Height Row */}
            <View style={styles.rowContainer}>
              {/* Weight */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  placeholderTextColor="#999"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>

              {/* Height */}
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Height"
                  placeholderTextColor="#999"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Gender and Contact Row */}
            <View style={styles.rowContainer}>
              {/* Gender */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={gender || ""}
                    onValueChange={(itemValue) => {
                      if (itemValue) setGender(itemValue);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Gender" value="" />
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                  </Picker>
                  <View style={styles.pickerIcon}>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </View>
                </View>
              </View>

              {/* Contact */}
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Contact"
                  placeholderTextColor="#999"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </ScrollView>
        {/* Bottom Buttons */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddPatient}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add Member</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safe: { 
    flex: 1, 
    backgroundColor: "transparent" 
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#000" 
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  whiteCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 30,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(233, 233, 233, 1)",
    borderRadius: 30,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
    color: "#000",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "rgba(233, 233, 233, 1)",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  picker: {
    flex: 1,
    height: 50,
    color: "#000",
  },
  pickerIcon: {
    position: "absolute",
    right: 14,
    top: 15,
    pointerEvents: "none",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    gap: 6,
  },
  genderButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  genderText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  genderTextActive: {
    color: "#fff",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  addButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});