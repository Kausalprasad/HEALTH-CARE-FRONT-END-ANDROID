import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function InjuryScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const API_URL =
    "https://3ibubkku4e6qgmi5ibk6nwa7zq0tqlmd.lambda-url.ap-south-1.on.aws/analyze";

  const pickImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        `${fromCamera ? "Camera" : "Gallery"} access is needed to continue.`
      );
      return;
    }

    const pickerResult = fromCamera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.5,
          allowsEditing: false,
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.5,
          allowsEditing: false,
        });

    if (!pickerResult.canceled) {
      const img = pickerResult.assets[0];
      setImage(img.uri);
      setResult(null);
      setShowImageOptions(false);
      uploadImage(img.uri);
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "posture_image.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 413) {
        throw new Error("Image size is too large. Please use a smaller image or reduce quality.");
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Posture analysis received:", JSON.stringify(data, null, 2));
      setResult(data);
    } catch (err) {
      console.error("Posture analysis error:", err);
      
      let errorMessage = "Unable to analyze the image. Please try again with a clearer full-body photo.";
      
      if (err.message.includes("413") || err.message.includes("too large")) {
        errorMessage = "Image file is too large. Please try:\n\n1. Taking a new photo with lower quality\n2. Using a smaller image\n3. Compressing the image before upload";
      }
      
      Alert.alert("Analysis Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "severe":
        return "#F44336";
      case "moderate":
        return "#FF9800";
      case "mild":
        return "#FFC107";
      default:
        return "#4CAF50";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case "severe":
        return "alert-circle";
      case "moderate":
        return "warning";
      case "mild":
        return "information-circle";
      default:
        return "checkmark-circle";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Posture Analysis</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="body" size={24} color="#7475B4" />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Upload a full-body photo for AI-powered posture analysis. Get
            detailed insights about your body alignment, potential issues,
            and personalized corrective exercises.
          </Text>
        </View>

        {/* Upload Section */}
        {!image ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="body-outline" size={64} color="#7475B4" />
            </View>
            <Text style={styles.uploadTitle}>Upload Body Photo</Text>
            <Text style={styles.uploadSubtitle}>
              Add a full-body photo (front or side view) to get AI-powered posture analysis.
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowImageOptions(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.uploadButtonGradient, { backgroundColor: "#7475B4" }]}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>Add Image</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Uploaded Image</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => setShowImageOptions(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="#7475B4" />
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7475B4" />
            <Text style={styles.loadingText}>Analyzing your posture...</Text>
            <Text style={styles.loadingSubtext}>This may take a few moments</Text>
          </View>
        )}

        {/* Results */}
        {result && !loading && (
          <View style={styles.resultsSection}>
            {/* Overall Summary Card */}
            <View style={[styles.summaryCard, { borderLeftColor: getSeverityColor(result.severity_level) }]}>
              <View style={styles.summaryHeader}>
                <Ionicons 
                  name={getSeverityIcon(result.severity_level)} 
                  size={28} 
                  color={getSeverityColor(result.severity_level)} 
                />
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryTitle}>Posture Summary</Text>
                  <Text style={[styles.severityBadge, { color: getSeverityColor(result.severity_level) }]}>
                    {result.severity_level?.toUpperCase()} LEVEL
                  </Text>
                </View>
              </View>
              <Text style={styles.summaryText}>{result.posture_summary}</Text>
              
              {result.view_analyzed && (
                <View style={styles.viewBadge}>
                  <Ionicons name="eye" size={14} color="#7475B4" />
                  <Text style={styles.viewText}>View: {result.view_analyzed}</Text>
                </View>
              )}
            </View>

            {/* Main Findings */}
            {result.main_findings && result.main_findings.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="list" size={20} color="#7475B4" />
                  <Text style={styles.cardTitle}>Main Findings</Text>
                </View>
                <View style={styles.findingsList}>
                  {result.main_findings.map((finding, index) => (
                    <View key={index} style={styles.findingItem}>
                      <Ionicons name="chevron-forward" size={16} color="#7475B4" />
                      <Text style={styles.findingText}>{finding}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Alignment Issues */}
            {result.alignment_issues && result.alignment_issues.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Ionicons name="analytics" size={24} color="#7475B4" />
                  <Text style={styles.sectionTitle}>Detailed Alignment Issues</Text>
                </View>
                
                {result.alignment_issues.map((issue, index) => (
                  <View key={index} style={styles.issueCard}>
                    <View style={styles.issueHeader}>
                      <View style={styles.issueHeaderLeft}>
                        <Ionicons name="warning" size={20} color={getSeverityColor(issue.severity)} />
                        <Text style={styles.issueTitle}>{issue.issue}</Text>
                      </View>
                      <View style={[styles.severityTag, { backgroundColor: getSeverityColor(issue.severity) + '20' }]}>
                        <Text style={[styles.severityTagText, { color: getSeverityColor(issue.severity) }]}>
                          {issue.severity}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.issueArea}>
                      <Ionicons name="location" size={14} color="#666" />
                      <Text style={styles.issueAreaText}>{issue.area}</Text>
                    </View>

                    <Text style={styles.issueDescription}>{issue.description}</Text>

                    {/* Exercises */}
                    {issue.exercises && issue.exercises.length > 0 && (
                      <View style={styles.exercisesSection}>
                        <Text style={styles.exercisesTitle}>Recommended Exercises:</Text>
                        {issue.exercises.map((exercise, exIndex) => (
                          <View key={exIndex} style={styles.exerciseItem}>
                            <Ionicons name="fitness" size={14} color="#4CAF50" />
                            <Text style={styles.exerciseText}>{exercise}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* When to See Doctor */}
                    {issue.when_to_see_doctor && (
                      <View style={styles.doctorNote}>
                        <Ionicons name="medical" size={14} color="#F44336" />
                        <Text style={styles.doctorNoteText}>{issue.when_to_see_doctor}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* Measurements */}
            {result.measurements && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="resize" size={20} color="#7475B4" />
                  <Text style={styles.cardTitle}>Body Measurements</Text>
                </View>
                <View style={styles.measurementsGrid}>
                  {Object.entries(result.measurements).map(([key, value], index) => (
                    <View key={index} style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <Text style={styles.measurementValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Corrective Exercises */}
            {result.corrective_exercises && result.corrective_exercises.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="barbell" size={20} color="#4CAF50" />
                  <Text style={styles.cardTitle}>General Corrective Exercises</Text>
                </View>
                <View style={styles.exercisesList}>
                  {result.corrective_exercises.map((exercise, index) => (
                    <View key={index} style={styles.generalExerciseItem}>
                      <View style={styles.exerciseNumber}>
                        <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.generalExerciseText}>{exercise}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Posture Tips */}
            {result.posture_tips && result.posture_tips.length > 0 && (
              <View style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <Ionicons name="bulb" size={24} color="#FF9800" />
                  <Text style={styles.tipsTitle}>Daily Posture Tips</Text>
                </View>
                <View style={styles.tipsList}>
                  {result.posture_tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Professional Consultation Card */}
            {result.requires_professional && (
              <View style={styles.professionalCard}>
                <View style={styles.professionalHeader}>
                  <Ionicons name="medical" size={24} color="#F44336" />
                  <Text style={styles.professionalTitle}>Professional Consultation Recommended</Text>
                </View>
                <Text style={styles.professionalText}>
                  Based on your analysis, we recommend consulting with a physical therapist
                  or healthcare professional for a comprehensive evaluation and personalized treatment plan.
                </Text>
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <Ionicons name="information-circle" size={20} color="#FF9800" />
                <Text style={styles.disclaimerTitle}>Important Note</Text>
              </View>
              <Text style={styles.disclaimerText}>
                {result.note || "This AI analysis is for informational purposes only. Always consult with qualified healthcare professionals for medical decisions."}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#7475B4" />
                <Text style={styles.actionButtonText}>Share Report</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="save-outline" size={20} color="#7475B4" />
                <Text style={styles.actionButtonText}>Save Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Photo Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="camera" size={24} color="#FF9800" />
            <Text style={styles.tipsTitle}>Photo Tips for Best Results</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>
                Stand straight against a plain background
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>
                Capture full body from head to toe
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>
                Use good lighting - avoid shadows
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>
                Wear fitted clothing for accurate analysis
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Image Source</Text>
              <TouchableOpacity onPress={() => setShowImageOptions(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => pickImage(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="camera" size={28} color="#2196F3" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>
                  Use camera to capture full-body photo
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => pickImage(false)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E8F5E8" }]}>
                <Ionicons name="images" size={28} color="#4CAF50" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionSubtitle}>
                  Select existing photo from gallery
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.modalNote}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.modalNoteText}>
                Your photos are processed securely and not stored
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#7475B4",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7475B4",
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  uploadSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  uploadIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  uploadButton: {
    borderRadius: 15,
    overflow: "hidden",
  },
  uploadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  imageSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  image: {
    width: width - 80,
    height: width - 80,
    borderRadius: 15,
    marginBottom: 15,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "rgba(116, 117, 180, 0.1)",
    borderRadius: 20,
  },
  changeImageText: {
    fontSize: 14,
    color: "#7475B4",
    fontWeight: "600",
    marginLeft: 5,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  resultsSection: {
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderLeftWidth: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  severityBadge: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 12,
  },
  viewBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(116, 117, 180, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  viewText: {
    fontSize: 12,
    color: "#7475B4",
    marginLeft: 6,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  findingsList: {
    marginLeft: 28,
  },
  findingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  findingText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  issueCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  issueHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  issueHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  severityTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  severityTagText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  issueArea: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  issueAreaText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  issueDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  exercisesSection: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  exercisesTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  exerciseText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 8,
  },
  doctorNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  doctorNoteText: {
    fontSize: 12,
    color: "#C62828",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  measurementsGrid: {
    marginLeft: 28,
  },
  measurementItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  measurementLabel: {
    fontSize: 14,
    color: "#666",
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  exercisesList: {
    marginLeft: 28,
  },
  generalExerciseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  exerciseNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  generalExerciseText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    lineHeight: 20,
    paddingTop: 2,
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  tipsList: {
    marginLeft: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  professionalCard: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  professionalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  professionalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#C62828",
    marginLeft: 10,
    flex: 1,
  },
  professionalText: {
    fontSize: 13,
    color: "#C62828",
    lineHeight: 20,
    marginLeft: 34,
  },
  disclaimerCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E65100",
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#BF360C",
    lineHeight: 18,
    marginLeft: 28,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#7475B4",
  },
  actionButtonText: {
    color: "#7475B4",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 25,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  modalNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  modalNoteText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 8,
    fontWeight: "500",
  },
});