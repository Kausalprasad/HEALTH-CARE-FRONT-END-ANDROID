// VaultDashboard.js - New UI with Gradient, Storage Card, 2x2 Category Grid
import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { BASE_URL } from "../../config/config";
import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

const { width } = Dimensions.get("window");

export default function VaultDashboard({ navigation }) {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryView, setShowCategoryView] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredFiles, setFilteredFiles] = useState([]);

  const auth = getAuth();
  const userEmail = auth.currentUser?.email;

  const categories = [
    { 
      id: "All", 
      name: "All Files", 
      icon: "document-text",
      iconColor: "#9C27B0",
      description: "Check all files together"
    },
    { 
      id: "Reports", 
      name: "Reports", 
      icon: "clipboard",
      iconColor: "#00BCD4",
      description: "All Medical Reports"
    },
    { 
      id: "Prescriptions", 
      name: "Prescriptions", 
      icon: "medical",
      iconColor: "#4CAF50",
      description: "Track every prescription"
    },
    { 
      id: "Bills", 
      name: "Medic Bills", 
      icon: "receipt",
      iconColor: "#FF9800",
      description: "All bills, neatly stored."
    },
  ];

  // Get auth token
  const getAuthToken = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return token;
      }
      throw new Error("No authenticated user");
    } catch (error) {
      console.error("Failed to get auth token:", error);
      throw error;
    }
  };

  // Fetch files from backend
  const fetchUserFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!userEmail) {
        console.warn("User email not available");
        setFiles([]);
        setIsLoading(false);
        return;
      }

      const token = await getAuthToken();
      const res = await fetch(
        `${BASE_URL}/api/files?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch files: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(
          "Server returned HTML instead of JSON. Check BASE_URL and API endpoint."
        );
      }

      const data = await res.json();
      const fetchedFiles = data.map((f) => {
        const uploadDate = new Date(f.uploadedAt);
        return {
          id: f._id,
          name: f.fileName,
          date: uploadDate,
          dateString: uploadDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          dateHeader: uploadDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            weekday: "short",
          }),
          type: f.category || "Other",
          encrypted: f.isEncrypted || true,
          filePath: `${BASE_URL}/${f.filePath.replace(/\\/g, "/")}`,
          fileType: f.fileType,
          aiOutput: f.aiOutput,
          fileSize: f.fileSize || 0, // in bytes
        };
      });
      setFiles(fetchedFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
      Alert.alert("Error", `Failed to load files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchUserFiles();
  }, [fetchUserFiles]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserFiles();
    });
    return unsubscribe;
  }, [navigation, fetchUserFiles]);

  // Calculate storage
  const calculateStorage = () => {
    const totalStorage = 15; // GB
    const usedStorage = 1.8; // GB - can be calculated from files
    return { used: usedStorage, total: totalStorage };
  };

  const storage = calculateStorage();

  // Handle category press
  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setShowCategoryView(false);
    const filtered = files.filter(
      (file) => category === "All" || file.type === category
    );
    setFilteredFiles(filtered);
  };

  // Handle back to categories
  const handleBackToCategories = () => {
    setShowCategoryView(true);
    setSelectedCategory(null);
    setFilteredFiles([]);
  };

  // Handle back button press
  const handleBackPress = () => {
    if (!showCategoryView) {
      // If showing files, go back to categories
      handleBackToCategories();
    } else {
      // If showing categories, navigate back
      navigation.goBack();
    }
  };

  // Handle Add button - navigate to AddDocumentScreen
  const handleAdd = () => {
    navigation.navigate("AddDocumentScreen");
  };

  // Handle file press - open file or show AI report
  const handleFilePress = async (file) => {
    try {
      // Try to open the file in browser
      const supported = await Linking.canOpenURL(file.filePath);
      if (supported) {
        await WebBrowser.openBrowserAsync(file.filePath, {
          toolbarColor: "#1FA8E7",
          controlsColor: "#fff",
          showTitle: true,
        });
      } else {
        // If file can't be opened, check for AI output
        if (file.aiOutput) {
          navigation.navigate("VaultAIReport", { file });
        } else {
          Alert.alert("Info", "File cannot be opened. AI analysis not available.");
        }
      }
    } catch (error) {
      console.error("Error opening file:", error);
      // Fallback to AI report if available
      if (file.aiOutput) {
        navigation.navigate("VaultAIReport", { file });
      } else {
        Alert.alert("Error", "Failed to open file");
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Group files by date
  const groupFilesByDate = (filesList) => {
    const grouped = {};
    filesList.forEach((file) => {
      const dateKey = file.dateHeader;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(file);
    });
    return grouped;
  };

  // Get icon based on file type
  const getFileIcon = (type) => {
    switch (type) {
      case "Bills":
        return "receipt";
      case "Reports":
        return "document-text";
      case "Prescriptions":
        return "medical";
      default:
        return "document";
    }
  };

  return (
    <LinearGradient
      colors={["rgba(31, 168, 231, 0)", "rgba(31, 168, 231, 0.85)"]}
      locations={[0.2425, 1.0]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image
              source={require("../../../assets/Dashoabdicons/HealthVault.png")}
              style={styles.headerIcon}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Health Vault</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {showCategoryView ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Storage Card */}
            <View style={styles.storageCard}>
              <Text style={styles.storageText}>
                {storage.used}GB Used <Text style={styles.storageTotal}>/{storage.total}GB</Text>
              </Text>
              <Text style={styles.storageSubtext}>
                Your vault storage space at a glance.
              </Text>
            </View>

            {/* Categories Grid */}
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    index === 0 && styles.allFilesCard,
                    index % 2 === 1 && styles.rightColumnCard,
                  ]}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  {category.id !== "All" && (
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCategoryPress(category.id);
                      }}
                    >
                      <Ionicons name="share-outline" size={16} color="#666" />
                    </TouchableOpacity>
                  )}
                  <View style={styles.categoryIconContainer}>
                    <Ionicons name={category.icon} size={32} color={category.iconColor} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.filesList}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
            ) : filteredFiles.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={64} color="#fff" />
                <Text style={styles.emptyText}>No files found</Text>
              </View>
            ) : (() => {
              const searchFiltered = filteredFiles.filter((file) =>
                file.name.toLowerCase().includes(searchQuery.toLowerCase())
              );
              const groupedFiles = groupFilesByDate(searchFiltered);
              const sortedDates = Object.keys(groupedFiles).sort((a, b) => {
                return new Date(groupedFiles[b][0].date) - new Date(groupedFiles[a][0].date);
              });

              return sortedDates.map((dateKey) => (
                <View key={dateKey} style={styles.dateGroup}>
                  <Text style={styles.dateHeader}>{dateKey}</Text>
                  {groupedFiles[dateKey].map((file) => (
                    <TouchableOpacity
                      key={file.id}
                      style={styles.fileCard}
                      onPress={() => handleFilePress(file)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.fileIconContainer}>
                        <Ionicons
                          name={getFileIcon(file.type)}
                          size={32}
                          color="#FFC107"
                        />
                      </View>
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <Text style={styles.fileSize}>
                          {formatFileSize(file.fileSize)}
                        </Text>
                      </View>
                      {file.aiOutput && (
                        <Ionicons name="sparkles" size={20} color="#FFD700" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ));
            })()}
          </ScrollView>
        )}

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 20) : 20,
    paddingBottom: 16,
    marginTop: 20,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  storageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E9E9E9",
  },
  storageText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  storageTotal: {
    fontSize: 16,
    fontWeight: "400",
    color: "#999",
  },
  storageSubtext: {
    fontSize: 14,
    color: "#666",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 100,
  },
  categoryCard: {
    width: (width - 48) / 2,
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "#E9E9E9",
    position: "relative",
  },
  allFilesCard: {
    marginLeft: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  rightColumnCard: {
    marginRight: 0,
  },
  shareButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
  },
  categoryIconContainer: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  filesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    color: "#999",
    marginBottom: 12,
    fontWeight: "500",
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4F8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFC107",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#fff",
    marginTop: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 27,
    left: 27,
    right: 27,
    width: width - 54,
    height: 69,
    borderRadius: 214.22,
    backgroundColor: "#1FA8E7",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
