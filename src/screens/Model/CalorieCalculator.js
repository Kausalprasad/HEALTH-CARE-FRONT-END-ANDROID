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
const PRIMARY_COLOR = "#7475B4"; // Same as X-Ray screen

export default function CalorieCalculator({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const LAMBDA_URL =
    "https://k5c3x6tjnl4nwcxtkekvu6ejju0rttha.lambda-url.ap-south-1.on.aws/analyze";

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
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });

    if (!pickerResult.canceled) {
      const img = pickerResult.assets[0];
      setImage(img.uri);
      setResult(null);
      setShowImageOptions(false);
      analyzeFood(img.uri);
    }
  };

  const analyzeFood = async (imageUri) => {
    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "food.jpg",
      });

      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      if (response.status === 413) {
        throw new Error("Image size is too large. Please use a smaller image.");
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Food analysis received:", JSON.stringify(data, null, 2));
      
      if (data.success) {
        setResult(data);
      } else {
        Alert.alert("Analysis Failed", "Try with a clearer food image.");
      }
    } catch (err) {
      console.error("Food analysis error:", err);
      
      let errorMessage = "Unable to analyze the food. Please try again with a clearer image.";
      
      if (err.message.includes("413") || err.message.includes("too large")) {
        errorMessage = "Image file is too large. Please try taking a new photo or use a smaller image.";
      }
      
      Alert.alert("Analysis Failed", errorMessage);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Calorie Calculator</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Upload a photo of your meal for AI-powered nutrition analysis. Get
            detailed calorie counts, macronutrients, and health recommendations
            instantly.
          </Text>
        </View>

        {/* Upload Section */}
        {!image ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="restaurant-outline" size={64} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.uploadTitle}>Upload Food Image</Text>
            <Text style={styles.uploadSubtitle}>
              Add a photo of your meal to get detailed nutrition analysis.
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowImageOptions(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.uploadButtonGradient, { backgroundColor: PRIMARY_COLOR }]}>
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
                <Ionicons name="camera" size={16} color={PRIMARY_COLOR} />
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={styles.loadingText}>Analyzing your meal...</Text>
            <Text style={styles.loadingSubtext}>This may take a few moments</Text>
          </View>
        )}

        {/* Results */}
        {result && !loading && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Ionicons name="nutrition" size={24} color={PRIMARY_COLOR} />
              <Text style={styles.sectionTitle}>Nutrition Analysis</Text>
            </View>

            {/* Food Items Card */}
            <View style={styles.resultCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="fast-food" size={20} color={PRIMARY_COLOR} />
                <Text style={styles.cardTitle}>Food Items</Text>
              </View>
              <View style={styles.analysisContent}>
                {result.food_items?.map((item, i) => (
                  <Text key={i} style={styles.analysisText}>
                    <Text style={styles.bulletPoint}>• </Text>
                    {item}
                  </Text>
                ))}
              </View>
            </View>

            {/* Calories Card */}
            <View style={styles.resultCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="flame" size={20} color={PRIMARY_COLOR} />
                <Text style={styles.cardTitle}>Calories</Text>
              </View>
              <View style={styles.analysisContent}>
                <Text style={styles.calorieText}>
                  {result.total_calories?.estimate} kcal
                </Text>
                <Text style={styles.calorieRange}>
                  Range: {result.total_calories?.range}
                </Text>
              </View>
            </View>

            {/* Macronutrients Card */}
            {result.macronutrients && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="fitness" size={20} color={PRIMARY_COLOR} />
                  <Text style={styles.cardTitle}>Macronutrients</Text>
                </View>
                <View style={styles.analysisContent}>
                  {result.macronutrients.protein && (
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Protein:</Text>
                      <Text style={styles.macroValue}>{result.macronutrients.protein}</Text>
                    </View>
                  )}
                  {result.macronutrients.fats && (
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Fats:</Text>
                      <Text style={styles.macroValue}>{result.macronutrients.fats}</Text>
                    </View>
                  )}
                  {result.macronutrients.carbohydrates && (
                    <View style={styles.macroRow}>
                      <Text style={styles.macroLabel}>Carbohydrates:</Text>
                      <Text style={styles.macroValue}>{result.macronutrients.carbohydrates}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Portion Analysis Card */}
            <View style={styles.resultCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="pizza" size={20} color={PRIMARY_COLOR} />
                <Text style={styles.cardTitle}>Portion Analysis</Text>
              </View>
              <View style={styles.analysisContent}>
                <Text style={styles.analysisText}>{result.portion_analysis}</Text>
              </View>
            </View>

            {/* Cooking Method Card */}
            <View style={styles.resultCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="restaurant" size={20} color={PRIMARY_COLOR} />
                <Text style={styles.cardTitle}>Cooking Method</Text>
              </View>
              <View style={styles.analysisContent}>
                <Text style={styles.analysisText}>{result.cooking_method}</Text>
              </View>
            </View>

            {/* Confidence Level Card */}
            <View style={styles.resultCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle" size={20} color={PRIMARY_COLOR} />
                <Text style={styles.cardTitle}>Confidence Level</Text>
              </View>
              <View style={styles.analysisContent}>
                <Text style={styles.analysisText}>{result.confidence_level}</Text>
              </View>
            </View>

            {/* Health Notes Card */}
            {result.health_notes && result.health_notes.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="medical" size={20} color={PRIMARY_COLOR} />
                  <Text style={styles.cardTitle}>Health Notes</Text>
                </View>
                <View style={styles.analysisContent}>
                  {result.health_notes.map((note, i) => (
                    <Text key={i} style={styles.analysisText}>
                      <Text style={styles.bulletPoint}>• </Text>
                      {note}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Recommendations Card */}
            {result.recommendations && result.recommendations.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="star" size={20} color={PRIMARY_COLOR} />
                  <Text style={styles.cardTitle}>Recommendations</Text>
                </View>
                <View style={styles.analysisContent}>
                  {result.recommendations.map((rec, i) => (
                    <Text key={i} style={styles.analysisText}>
                      <Text style={styles.bulletPoint}>• </Text>
                      {rec}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.disclaimerTitle}>Nutrition Disclaimer</Text>
              </View>
              <Text style={styles.disclaimerText}>
                This AI analysis provides estimated nutritional information for
                educational purposes only. Values may vary based on specific
                ingredients and preparation methods. Consult a nutritionist for
                personalized dietary advice.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color={PRIMARY_COLOR} />
                <Text style={styles.actionButtonText}>Share Report</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="save-outline" size={20} color={PRIMARY_COLOR} />
                <Text style={styles.actionButtonText}>Save Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FF9800" />
            <Text style={styles.tipsTitle}>Photo Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={PRIMARY_COLOR} />
              <Text style={styles.tipText}>
                Capture the entire meal in the frame
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={PRIMARY_COLOR} />
              <Text style={styles.tipText}>
                Use good lighting for better accuracy
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={PRIMARY_COLOR} />
              <Text style={styles.tipText}>
                Take photo from directly above the plate
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={PRIMARY_COLOR} />
              <Text style={styles.tipText}>
                Include any condiments or side dishes
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
                  Use camera to capture your meal
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
                  Select existing food image
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
    backgroundColor: PRIMARY_COLOR,
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
    color: PRIMARY_COLOR,
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
    backgroundColor: `rgba(116, 117, 180, 0.1)`,
    borderRadius: 20,
  },
  changeImageText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
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
    color: PRIMARY_COLOR,
    fontWeight: "bold",
  },
  calorieText: {
    fontSize: 28,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 5,
  },
  calorieRange: {
    fontSize: 14,
    color: "#666",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingRight: 20,
  },
  macroLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  macroValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
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
    borderColor: PRIMARY_COLOR,
  },
  actionButtonText: {
    color: PRIMARY_COLOR,
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