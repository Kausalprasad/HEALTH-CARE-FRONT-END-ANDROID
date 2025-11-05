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

export default function XrayScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const API_URL =
    "https://5kjlxpatuk54rbpue5j6bnxbpu0ipecb.lambda-url.ap-south-1.on.aws/analyze";

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
          quality: 0.5, // Reduced from 1 to compress image
          allowsEditing: true,
          aspect: [4, 3],
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.5, // Reduced from 1 to compress image
          allowsEditing: true,
          aspect: [4, 3],
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
        name: "xray_image.jpg",
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
      console.log("✅ X-Ray analysis received:", JSON.stringify(data, null, 2));
      setResult(data);
    } catch (err) {
      console.error("X-Ray analysis error:", err);
      
      // Better error message based on error type
      let errorMessage = "Unable to analyze the image. Please try again with a clearer X-ray/ultrasound image.";
      
      if (err.message.includes("413") || err.message.includes("too large")) {
        errorMessage = "Image file is too large. Please try:\n\n1. Taking a new photo with lower quality\n2. Using a smaller image\n3. Compressing the image before upload";
      }
      
      Alert.alert("Analysis Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysisText = (text) => {
    if (!text) return "No analysis available";
    
    // Replace \n with actual newlines and clean up formatting
    return text
      .replace(/\\n/g, "\n")
      .replace(/\*\*/g, "")
      .trim();
  };

  const parseAnalysisIntoSections = (analysisText) => {
    if (!analysisText) return null;

    const text = formatAnalysisText(analysisText);
    const sections = [];
    
    // Split by common section headers
    const lines = text.split("\n");
    let currentSection = { title: "Analysis Overview", content: [] };
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Check if line is a header (contains ":", starts with number, or is all caps)
      if (
        (trimmedLine.includes(":") && trimmedLine.split(":")[0].length < 40) ||
        /^\d+\./.test(trimmedLine) ||
        (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50)
      ) {
        // Save previous section if it has content
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        
        // Start new section
        const titleParts = trimmedLine.split(":");
        currentSection = {
          title: titleParts[0].replace(/^\d+\.\s*/, "").trim(),
          content: titleParts[1] ? [titleParts[1].trim()] : [],
        };
      } else {
        // Add to current section content
        currentSection.content.push(trimmedLine);
      }
    });

    // Add the last section
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    return sections.length > 0 ? sections : null;
  };

  const sections = result?.analysis ? parseAnalysisIntoSections(result.analysis) : null;

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
        <Text style={styles.headerTitle}>X-Ray Analysis</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#7475B4" />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Upload an X-ray or ultrasound image for AI-powered analysis. Get
            detailed insights about the scan including observations, findings,
            and recommendations.
          </Text>
        </View>

        {/* Upload Section */}
        {!image ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="scan-outline" size={64} color="#7475B4" />
            </View>
            <Text style={styles.uploadTitle}>Upload Medical Scan</Text>
            <Text style={styles.uploadSubtitle}>
              Add an X-ray or ultrasound image to get AI-powered analysis.
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
            <Text style={styles.loadingText}>Analyzing medical scan...</Text>
            <Text style={styles.loadingSubtext}>This may take a few moments</Text>
          </View>
        )}

        {/* Results */}
        {result && !loading && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Ionicons name="document-text" size={24} color="#7475B4" />
              <Text style={styles.sectionTitle}>Analysis Results</Text>
            </View>

            {sections ? (
              // Structured view with sections
              sections.map((section, index) => (
                <View key={index} style={styles.resultCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons
                      name={
                        section.title.toLowerCase().includes("finding")
                          ? "search"
                          : section.title.toLowerCase().includes("recommendation")
                          ? "checkmark-circle"
                          : section.title.toLowerCase().includes("impression")
                          ? "document-text"
                          : "analytics"
                      }
                      size={20}
                      color="#7475B4"
                    />
                    <Text style={styles.cardTitle}>{section.title}</Text>
                  </View>
                  <View style={styles.analysisContent}>
                    {section.content.map((line, lineIndex) => (
                      <Text key={lineIndex} style={styles.analysisText}>
                        {line.startsWith("-") || line.startsWith("•") ? (
                          <>
                            <Text style={styles.bulletPoint}>• </Text>
                            {line.replace(/^[-•]\s*/, "")}
                          </>
                        ) : (
                          line
                        )}
                      </Text>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              // Single card view for unstructured analysis
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="document-text" size={20} color="#7475B4" />
                  <Text style={styles.cardTitle}>Complete Analysis</Text>
                </View>
                <ScrollView style={styles.analysisScrollContainer}>
                  <Text style={styles.analysisTextFull}>
                    {formatAnalysisText(result.analysis || JSON.stringify(result, null, 2))}
                  </Text>
                </ScrollView>
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
              </View>
              <Text style={styles.disclaimerText}>
                This AI analysis is for informational and educational purposes
                only. It is not a substitute for professional medical advice,
                diagnosis, or treatment. Always consult with qualified healthcare
                professionals for medical decisions.
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

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FF9800" />
            <Text style={styles.tipsTitle}>Image Quality Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>
                Ensure the entire scan is visible in the frame
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>
                Use good lighting - avoid glare and shadows
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>
                Keep the image straight and properly aligned
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>
                Higher resolution images provide better analysis
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
                  Use camera to capture medical scan
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
                  Select existing image from gallery
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.modalNote}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.modalNoteText}>
                Your images are processed securely and not stored
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
    marginBottom: 15,
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
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  analysisContent: {
    marginLeft: 28,
  },
  analysisText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    color: "#7475B4",
    fontWeight: "bold",
  },
  analysisScrollContainer: {
    maxHeight: 400,
    marginLeft: 28,
  },
  analysisTextFull: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
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
    fontSize: 16,
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
    alignItems: "center",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
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