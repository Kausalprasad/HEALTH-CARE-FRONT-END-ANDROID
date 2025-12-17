// VaultDashboard.js - Exact UI matching screenshot
import { useState, useEffect, useCallback, useRef } from "react";
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
  Modal,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { BASE_URL } from "../../config/config";
import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Print from "expo-print";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");

export default function VaultDashboard({ navigation }) {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryView, setShowCategoryView] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredFiles, setFilteredFiles] = useState([]);
  
  // Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  
  // Context menu states
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedFileForMenu, setSelectedFileForMenu] = useState(null);

  useEffect(() => {
    if (showUploadModal) {
      Animated.timing(progressAnimation, {
        toValue: uploadProgress / 100,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [uploadProgress, showUploadModal]);

  const auth = getAuth();
  const userEmail = auth.currentUser?.email;

  const categories = [
    { 
      id: "All", 
      name: "All Files", 
      icon: "document-text",
      iconColor: "#9C27B0",
      iconBg: "#E1BEE7",
      description: "Check all files together"
    },
    { 
      id: "Reports", 
      name: "Reports", 
      icon: "clipboard",
      iconColor: "#00BCD4",
      iconBg: "#B2EBF2",
      description: "All Medical Reports"
    },
    { 
      id: "Prescriptions", 
      name: "Prescriptions", 
      icon: "medical",
      iconColor: "#4CAF50",
      iconBg: "#C8E6C9",
      description: "Track every prescription"
    },
    { 
      id: "Bills", 
      name: "Medic Bills", 
      icon: "receipt",
      iconColor: "#FF9800",
      iconBg: "#FFE0B2",
      description: "All bills, neatly stored."
    },
  ];

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
          fileSize: f.fileSize || 0,
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

  const calculateStorage = () => {
    const totalStorage = 15;
    const usedStorage = 1.8;
    return { used: usedStorage, total: totalStorage };
  };

  const storage = calculateStorage();

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setShowCategoryView(false);
    const filtered = files.filter(
      (file) => category === "All" || file.type === category
    );
    setFilteredFiles(filtered);
  };

  const handleBackToCategories = () => {
    setShowCategoryView(true);
    setSelectedCategory(null);
    setFilteredFiles([]);
  };

  const handleBackPress = () => {
    if (!showCategoryView) {
      handleBackToCategories();
    } else {
      navigation.goBack();
    }
  };

  const safeStringify = (value, fallback = "Not available") => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === "object") {
          return JSON.stringify(item, null, 2);
        }
        return String(item);
      }).join(", ");
    }
    if (typeof value === "object") {
      if (value.text) return value.text;
      if (value.description) return value.description;
      if (value.content) return value.content;
      return JSON.stringify(value, null, 2);
    }
    return fallback;
  };

  const generateAIPDFReport = async (aiOutput, originalFileName) => {
    try {
      const patientDetails = safeStringify(
        aiOutput.patientDetails || aiOutput.patient_info || aiOutput.patient_condition,
        "No patient details available."
      );
      const diagnoses = safeStringify(
        aiOutput.diagnoses || aiOutput.diagnosis,
        "No diagnoses found."
      );
      const medications = safeStringify(
        aiOutput.medications || aiOutput.medication,
        "None mentioned in the report"
      );
      const followUps = safeStringify(
        aiOutput.followUps || aiOutput.follow_up || aiOutput.recommendations,
        "No follow-up recommendations available."
      );

      const escapeHtml = (text) => {
        if (!text) return "";
        return String(text)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            background: linear-gradient(to bottom, #E3F2FD 0%, #FFFFFF 100%);
            color: #000;
            padding: 20px;
            min-height: 100vh;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: transparent;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 0;
            margin-bottom: 16px;
          }
          .header-title {
            font-size: 20px;
            font-weight: 700;
            color: #000;
            flex: 1;
            text-align: center;
          }
          .document-info {
            padding: 16px 0;
            background: transparent;
          }
          .document-label {
            font-size: 14px;
            color: #000;
            margin-bottom: 4px;
          }
          .generated-label {
            font-size: 14px;
            color: #000;
          }
          .divider {
            height: 1px;
            background-color: #E0E0E0;
            margin: 16px 0;
          }
          .section {
            padding: 16px 0;
          }
          .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
          }
          .icon-container {
            width: 40px;
            height: 40px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 20px;
          }
          .icon-patient { background-color: rgba(156, 39, 176, 0.2); }
          .icon-diagnoses { background-color: rgba(0, 188, 212, 0.2); }
          .icon-medications { background-color: rgba(76, 175, 80, 0.2); }
          .icon-followups { background-color: rgba(255, 193, 7, 0.2); }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #000;
          }
          .section-content {
            font-size: 14px;
            color: #000;
            line-height: 22px;
            margin-left: 52px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .disclaimer-container {
            background-color: #E3F2FD;
            border-radius: 12px;
            padding: 16px;
            margin-top: 24px;
            margin-bottom: 32px;
          }
          .disclaimer-text {
            font-size: 12px;
            color: #000;
            line-height: 18px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-title">AI Report</div>
          </div>
          
          <div class="document-info">
            <div class="document-label">Document: ${escapeHtml(originalFileName)}</div>
            <div class="generated-label">Generated: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="section">
            <div class="section-header">
              <div class="icon-container icon-patient" style="color: #9C27B0;">ℹ️</div>
              <div class="section-title">Patient Details</div>
            </div>
            <div class="section-content">${escapeHtml(patientDetails)}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="section">
            <div class="section-header">
              <div class="icon-container icon-diagnoses" style="color: #00BCD4;">🩺</div>
              <div class="section-title">Diagnoses</div>
            </div>
            <div class="section-content">${escapeHtml(diagnoses)}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="section">
            <div class="section-header">
              <div class="icon-container icon-medications" style="color: #4CAF50;">💊</div>
              <div class="section-title">Medications</div>
            </div>
            <div class="section-content">${escapeHtml(medications)}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="section">
            <div class="section-header">
              <div class="icon-container icon-followups" style="color: #FFC107;">💡</div>
              <div class="section-title">Follow-ups</div>
            </div>
            <div class="section-content">${escapeHtml(followUps)}</div>
          </div>
          
          <div class="disclaimer-container">
            <div class="disclaimer-text">
              Medical Disclaimer: This AI-generated report is for informational purposes only.
            </div>
          </div>
        </div>
      </body>
      </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html });
      const pdfName = `${originalFileName.replace(/\.[^/.]+$/, "")}-AI-Report.pdf`;

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: pdfName,
        type: "application/pdf",
      });
      formData.append("email", userEmail);
      formData.append("category", "ai-report");

      await fetch(`${BASE_URL}/api/pdfs/upload`, {
        method: "POST",
        body: formData,
      });
      
      console.log("✅ AI Report PDF generated and saved!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  const handleAdd = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedFile = result.assets[0];
        await handleUpload(selectedFile);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick document");
      console.error(err);
    }
  };

  const handleUpload = async (selectedFile) => {
    setShowUploadModal(true);
    setUploadProgress(0);
    progressAnimation.setValue(0);

    try {
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
      
      const formData = new FormData();
      formData.append("file", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/pdf",
      });
      formData.append("email", userEmail);
      formData.append("category", "Reports");

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const res = await fetch(`${BASE_URL}/api/ai/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await res.json();
      console.log("Upload response:", data);

      let aiOutput = data.output;
      if (typeof aiOutput === 'string') {
        try {
          aiOutput = JSON.parse(
            aiOutput
              .trim()
              .replace(/\n/g, " ")
              .replace(/'/g, '"')
              .replace(/\bNone\b/g, "null")
              .replace(/\bTrue\b/g, "true")
              .replace(/\bFalse\b/g, "false")
          );
        } catch (e) {
          console.warn("Could not parse AI output");
          aiOutput = data.output;
        }
      }

      if (aiOutput && (typeof aiOutput === 'object' || typeof aiOutput === 'string')) {
        try {
          await generateAIPDFReport(aiOutput, fileName);
        } catch (error) {
          console.error("Failed to generate AI PDF report:", error);
        }
      }

      const uploadDate = data.uploadedAt ? new Date(data.uploadedAt) : new Date();
      const fileObject = {
        id: data._id || data.id || Date.now().toString(),
        name: data.fileName || fileName,
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
        type: data.category || "Reports",
        encrypted: data.isEncrypted !== undefined ? data.isEncrypted : true,
        filePath: data.filePath ? `${BASE_URL}/${data.filePath.replace(/\\/g, "/")}` : "",
        fileType: data.fileType || selectedFile.mimeType || "application/pdf",
        aiOutput: aiOutput || data.output,
        fileSize: data.fileSize || selectedFile.size || 0,
      };

      setUploadedFile(fileObject);
      
      setTimeout(() => {
        setShowUploadModal(false);
        setShowCompletionModal(true);
      }, 500);
    } catch (err) {
      console.error("Upload error:", err);
      setShowUploadModal(false);
      Alert.alert("Error", `Failed to upload: ${err.message}`);
    }
  };

  const handleViewReport = () => {
    setShowCompletionModal(false);
    if (uploadedFile) {
      const fileToView = uploadedFile;
      setUploadedFile(null);
      fetchUserFiles();
      setTimeout(() => {
        navigation.navigate("VaultAIReport", { file: fileToView });
      }, 300);
    }
  };

  const handleMoveToFolder = () => {
    setShowCompletionModal(false);
    setUploadedFile(null);
    fetchUserFiles();
  };

  const handleFilePress = async (file) => {
    // Don't open file if context menu is showing
    if (showContextMenu) return;
    
    try {
      const supported = await Linking.canOpenURL(file.filePath);
      if (supported) {
        await WebBrowser.openBrowserAsync(file.filePath, {
          toolbarColor: "#1FA8E7",
          controlsColor: "#fff",
          showTitle: true,
        });
      } else {
        if (file.aiOutput) {
          navigation.navigate("VaultAIReport", { file });
        } else {
          Alert.alert("Info", "File cannot be opened. AI analysis not available.");
        }
      }
    } catch (error) {
      console.error("Error opening file:", error);
      if (file.aiOutput) {
        navigation.navigate("VaultAIReport", { file });
      } else {
        Alert.alert("Error", "Failed to open file");
      }
    }
  };

  const handleFileLongPress = (file) => {
    setSelectedFileForMenu(file);
    setShowContextMenu(true);
  };

  const handleContextMenuClose = () => {
    setShowContextMenu(false);
    setSelectedFileForMenu(null);
  };

  const handleShare = async () => {
    if (!selectedFileForMenu) return;
    handleContextMenuClose();
    try {
      await Linking.share({
        url: selectedFileForMenu.filePath,
        title: selectedFileForMenu.name,
      });
    } catch (error) {
      console.error("Error sharing file:", error);
      Alert.alert("Error", "Failed to share file");
    }
  };

  const handleRename = () => {
    if (!selectedFileForMenu) return;
    handleContextMenuClose();
    // Using Alert with input (Alert.prompt is iOS only, so we'll use a simple alert for now)
    Alert.alert(
      "Rename File",
      "Rename functionality will be implemented soon.",
      [{ text: "OK" }]
    );
  };

  const handleMoveToFolderFromMenu = () => {
    if (!selectedFileForMenu) return;
    handleContextMenuClose();
    Alert.alert("Move to Folder", "Select folder to move file to", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Move",
        onPress: async () => {
          // TODO: Implement move API call
          Alert.alert("Success", "File moved successfully");
          fetchUserFiles();
        },
      },
    ]);
  };

  const handleDownload = async () => {
    if (!selectedFileForMenu) return;
    handleContextMenuClose();
    try {
      // TODO: Implement download functionality
      Alert.alert("Download", "File download started");
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Error", "Failed to download file");
    }
  };

  const handleDelete = () => {
    if (!selectedFileForMenu) return;
    handleContextMenuClose();
    Alert.alert(
      "Delete File",
      `Are you sure you want to delete "${selectedFileForMenu.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getAuthToken();
              const fileId = selectedFileForMenu.id;
              console.log("Deleting file with ID:", fileId);
              
              // Use PDF delete endpoint: /api/pdfs/:id
              const deleteUrl = `${BASE_URL}/api/pdfs/${fileId}`;
              console.log("Delete URL:", deleteUrl);
              
              const res = await fetch(deleteUrl, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              
              console.log("Delete response status:", res.status);
              
              if (res.ok) {
                const responseData = await res.json().catch(() => ({}));
                console.log("Delete response:", responseData);
                
                // Optimize: Remove file from state immediately instead of refetching
                setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
                setFilteredFiles((prevFiltered) => prevFiltered.filter((f) => f.id !== fileId));
                
                Alert.alert("Success", "File deleted successfully");
              } else {
                const errorText = await res.text().catch(() => "Unknown error");
                console.error("Delete error response:", errorText);
                throw new Error(`Failed to delete file: ${res.status} - ${errorText}`);
              }
            } catch (error) {
              console.error("Error deleting file:", error);
              Alert.alert("Error", `Failed to delete file: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }
    return `${(kb / 1024).toFixed(1)} MB`;
  };

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
      colors={["#FFFFFF", "#B3E5FC"]}
      locations={[0, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
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
          <Ionicons name="search" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search files here"
            placeholderTextColor="#757575"
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

            {/* Categories Grid - 2x2 */}
            <View style={styles.categoriesContainer}>
              <View style={styles.categoryRow}>
                {/* All Files - Top Left with blob */}
                <TouchableOpacity
                  style={[styles.categoryCard, styles.topLeftCard]}
                  onPress={() => handleCategoryPress(categories[0].id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: categories[0].iconBg }]}>
                    <Ionicons name={categories[0].icon} size={24} color={categories[0].iconColor} />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryName}>{categories[0].name}</Text>
                    <Text style={styles.categoryDescription}>{categories[0].description}</Text>
                  </View>
                </TouchableOpacity>

                {/* Reports - Top Right */}
                    <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(categories[1].id)}
                  activeOpacity={0.8}
                >
                  <TouchableOpacity style={styles.shareIconButton}>
                    <Ionicons name="arrow-redo-outline" size={16} color="#757575" />
                    </TouchableOpacity>
                  <View style={[styles.categoryIconBox, { backgroundColor: categories[1].iconBg }]}>
                    <Ionicons name={categories[1].icon} size={24} color={categories[1].iconColor} />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryName}>{categories[1].name}</Text>
                    <Text style={styles.categoryDescription}>{categories[1].description}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.categoryRow}>
                {/* Prescriptions - Bottom Left */}
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(categories[2].id)}
                  activeOpacity={0.8}
                >
                  <TouchableOpacity style={styles.shareIconButton}>
                    <Ionicons name="arrow-redo-outline" size={16} color="#757575" />
                  </TouchableOpacity>
                  <View style={[styles.categoryIconBox, { backgroundColor: categories[2].iconBg }]}>
                    <Ionicons name={categories[2].icon} size={24} color={categories[2].iconColor} />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryName}>{categories[2].name}</Text>
                    <Text style={styles.categoryDescription}>{categories[2].description}</Text>
                  </View>
                </TouchableOpacity>

                {/* Bills - Bottom Right */}
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(categories[3].id)}
                  activeOpacity={0.8}
                >
                  <TouchableOpacity style={styles.shareIconButton}>
                    <Ionicons name="arrow-redo-outline" size={16} color="#757575" />
                  </TouchableOpacity>
                  <View style={[styles.categoryIconBox, { backgroundColor: categories[3].iconBg }]}>
                    <Ionicons name={categories[3].icon} size={24} color={categories[3].iconColor} />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryName}>{categories[3].name}</Text>
                    <Text style={styles.categoryDescription}>{categories[3].description}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.filesList}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#1FA8E7" style={{ marginTop: 50 }} />
            ) : filteredFiles.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={64} color="#999" />
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
                      onLongPress={() => handleFileLongPress(file)}
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
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.9}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>

        {/* Upload Progress Modal */}
        <Modal
          visible={showUploadModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.uploadModalContainer}>
              <View style={styles.progressCircleContainer}>
                <Svg width="120" height="120" viewBox="0 0 120 120" style={styles.progressSvg}>
                  <Circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#E0E0E0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <AnimatedCircle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#FF3B30"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={314}
                    strokeDashoffset={progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [314, 314 - (314 * uploadProgress) / 100],
                    })}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </Svg>
                <View style={styles.progressIconContainer}>
                  <Ionicons name="document" size={40} color="#FFC107" />
                  <Ionicons 
                    name="arrow-up" 
                    size={20} 
                    color="#FFC107" 
                    style={styles.arrowIcon}
                  />
                </View>
              </View>
              
              <Text style={styles.uploadModalTitle}>Uploading File..</Text>
              <Text style={styles.uploadModalSubtext}>
                Uploading securely. Your information stays yours.
              </Text>
            </View>
          </View>
        </Modal>

        {/* Completion Modal */}
        <Modal
          visible={showCompletionModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCompletionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.completionModalContainer}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark" size={60} color="#fff" />
              </View>
              
              <Text style={styles.completionModalTitle}>Analyze Complete!</Text>
              <Text style={styles.completionFileName}>
                {uploadedFile?.name || "medical_report_01_nov_2025"}
              </Text>
              <Text style={styles.completionModalSubtext}>
                Your information stays yours.
              </Text>
              
              <View style={styles.completionButtonsContainer}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={handleViewReport}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.moveToFolderButton}
                  onPress={handleMoveToFolder}
                >
                  <Text style={styles.moveToFolderButtonText}>Move to folder</Text>
                  <Ionicons name="chevron-down" size={16} color="#9C27B0" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Context Menu Modal */}
        <Modal
          visible={showContextMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={handleContextMenuClose}
        >
          <TouchableOpacity
            style={styles.contextMenuOverlay}
            activeOpacity={1}
            onPress={handleContextMenuClose}
          >
            <View style={styles.contextMenuContainer}>
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Text style={styles.contextMenuText}>Share</Text>
              </TouchableOpacity>
              <View style={styles.contextMenuDivider} />
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={handleRename}
                activeOpacity={0.7}
              >
                <Text style={styles.contextMenuText}>Rename</Text>
              </TouchableOpacity>
              <View style={styles.contextMenuDivider} />
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={handleMoveToFolderFromMenu}
                activeOpacity={0.7}
              >
                <Text style={styles.contextMenuText}>Move to folder</Text>
              </TouchableOpacity>
              <View style={styles.contextMenuDivider} />
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={handleDownload}
                activeOpacity={0.7}
              >
                <Text style={styles.contextMenuText}>Download</Text>
              </TouchableOpacity>
              <View style={styles.contextMenuDivider} />
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Text style={[styles.contextMenuText, styles.contextMenuDeleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 20) + 10 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  storageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  storageText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  storageTotal: {
    fontSize: 14,
    fontWeight: "400",
    color: "#9E9E9E",
  },
  storageSubtext: {
    fontSize: 13,
    color: "#757575",
  },
  categoriesContainer: {
    marginBottom: 100,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    position: "relative",
  },
  topLeftCard: {
    borderBottomRightRadius: 50,
  },
  shareIconButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTextContainer: {
    marginTop: 4,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 11,
    color: "#757575",
    lineHeight: 15,
  },
  filesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 10,
    fontWeight: "500",
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4F8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFC107",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 3,
  },
  fileSize: {
    fontSize: 13,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
    marginTop: 12,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 56,
    borderRadius: 100,
    backgroundColor: "#1FA8E7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    width: width - 60,
    maxWidth: 380,
  },
  progressCircleContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  progressSvg: {
    position: "absolute",
  },
  progressIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  arrowIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  uploadModalTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  uploadModalSubtext: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 19,
  },
  completionModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    width: width - 60,
    maxWidth: 380,
  },
  successIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  completionModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  completionFileName: {
    fontSize: 15,
    color: "#1FA8E7",
    marginBottom: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  completionModalSubtext: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginBottom: 26,
  },
  completionButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#9C27B0",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  moveToFolderButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#9C27B0",
    flexDirection: "row",
    gap: 6,
  },
  moveToFolderButtonText: {
    color: "#9C27B0",
    fontSize: 15,
    fontWeight: "600",
  },
  // Context Menu Styles
  contextMenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contextMenuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: width - 80,
    maxWidth: 320,
    overflow: "hidden",
  },
  contextMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  contextMenuText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "400",
  },
  contextMenuDeleteText: {
    color: "#FF3B30",
  },
  contextMenuDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 0,
  },
});