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
import { Picker } from "@react-native-picker/picker";
import { BASE_URL } from "../../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddPatientScreen({ route, navigation }) {
  const { onPatientAdded } = route.params || {};

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [relation, setRelation] = useState("Self");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
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
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Patient</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter member name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Member Relation */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Member Relation<Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={relation}
              onValueChange={(itemValue) => setRelation(itemValue)}
              style={styles.picker}
            >
              {relations.map((rel) => (
                <Picker.Item key={rel} label={rel} value={rel} />
              ))}
            </Picker>
          </View>
        </View>

        {/* DOB and Age Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>
              Date Of Birth<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DD-MM-YYYY"
              placeholderTextColor="#999"
              value={dob}
              onChangeText={handleDobChange}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>
              Age<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.- 5 years"
              placeholderTextColor="#999"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Gender<Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Male" && styles.genderButtonActive,
              ]}
              onPress={() => setGender("Male")}
            >
              <Ionicons
                name="male"
                size={18}
                color={gender === "Male" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.genderText,
                  gender === "Male" && styles.genderTextActive,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Female" && styles.genderButtonActive,
              ]}
              onPress={() => setGender("Female")}
            >
              <Ionicons
                name="female"
                size={18}
                color={gender === "Female" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.genderText,
                  gender === "Female" && styles.genderTextActive,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Height and Weight Row */}
        <View style={styles.rowContainer}>
          {/* Height */}
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Height</Text>
            <View style={styles.unitRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder='0\'
                placeholderTextColor="#999"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
              <View style={styles.unitBox}>
                <Text style={styles.unitText}>{heightUnit}</Text>
              </View>
            </View>
          </View>

          {/* Weight */}
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
            <Text style={styles.label}>Weight</Text>
            <View style={styles.unitRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="0"
                placeholderTextColor="#999"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
              <View style={styles.unitBox}>
                <Text style={styles.unitText}>{weightUnit}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mobile Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            placeholderTextColor="#999"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Email<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="someone@example.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
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
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF6B6B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#fafafa",
    color: "#111",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#0D9488",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#0D9488",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  genderRow: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    gap: 8,
  },
  genderButtonActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  genderText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  genderTextActive: {
    color: "#fff",
  },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  unitBox: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  unitText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D9488",
  },
  addButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});