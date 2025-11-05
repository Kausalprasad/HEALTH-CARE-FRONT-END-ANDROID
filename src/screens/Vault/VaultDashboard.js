// VaultScreen.js - Main Vault List Screen with Working Functions
import { useState, useEffect } from "react"
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
  Modal,
  Linking,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getAuth } from "firebase/auth"
import * as WebBrowser from "expo-web-browser"
import { BASE_URL } from "../../config/config"

export default function VaultScreen({ navigation }) {
  const [files, setFiles] = useState([])
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const auth = getAuth()
  const userEmail = auth.currentUser?.email

  const filters = ["All", "Reports", "Prescriptions", "Bills", "Other"]

  // Get auth token
  const getAuthToken = async () => {
    try {
      const user = auth.currentUser
      if (user) {
        const token = await user.getIdToken()
        return token
      }
      throw new Error('No authenticated user')
    } catch (error) {
      console.error('Failed to get auth token:', error)
      throw error
    }
  }

  // Fetch files from backend
  const fetchUserFiles = async () => {
    setIsLoading(true)
    try {
      if (!userEmail) {
        console.warn("User email not available")
        setFiles([])
        return
      }

      const token = await getAuthToken()
      const res = await fetch(`${BASE_URL}/api/files?email=${encodeURIComponent(userEmail)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("API Error:", errorText)
        throw new Error(`Failed to fetch files: ${res.status}`)
      }

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Non-JSON response:", text.substring(0, 200))
        throw new Error("Server returned HTML instead of JSON. Check BASE_URL and API endpoint.")
      }

      const data = await res.json()
      const fetchedFiles = data.map((f) => ({
        id: f._id,
        name: f.fileName,
        date: new Date(f.uploadedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        type: f.category || "Other",
        encrypted: f.isEncrypted || true,
        filePath: `${BASE_URL}/${f.filePath.replace(/\\/g, "/")}`,
        fileType: f.fileType,
        aiOutput: f.aiOutput, // AI analysis data if available
      }))
      setFiles(fetchedFiles)
    } catch (err) {
      console.error("Error fetching files:", err)
      Alert.alert("Error", `Failed to load files: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserFiles()
  }, [userEmail])

  // Refresh files when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserFiles()
    })
    return unsubscribe
  }, [navigation])

  const filteredFiles = files.filter((file) => {
    const matchesFilter = selectedFilter === "All" || file.type === selectedFilter
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleFilePress = (file) => {
    setSelectedFile(file)
    setShowOptionsModal(true)
  }

  const handleViewPDF = async () => {
    setShowOptionsModal(false)
    if (!selectedFile) return

    try {
      console.log("Opening PDF:", selectedFile.filePath)
      const result = await WebBrowser.openBrowserAsync(selectedFile.filePath, {
        toolbarColor: '#6B5FD9',
        controlsColor: '#fff',
        showTitle: true,
      })
      
      if (result.type === 'cancel') {
        const supported = await Linking.canOpenURL(selectedFile.filePath)
        if (supported) {
          await Linking.openURL(selectedFile.filePath)
        } else {
          Alert.alert("Error", "Cannot open this file type")
        }
      }
    } catch (err) {
      console.error("Error opening PDF:", err)
      Alert.alert("Error", `Failed to open document: ${err.message}`)
    }
  }

  const handleAnalyze = async () => {
    setShowOptionsModal(false)
    if (!selectedFile) return

    // If AI output already exists, show it
    if (selectedFile.aiOutput) {
      Alert.alert(
        "AI Analysis Available",
        "This document has already been analyzed. View the AI report?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "View Report",
            onPress: () => {
              // Navigate to AI report or show analysis
              Alert.alert("AI Analysis", JSON.stringify(selectedFile.aiOutput, null, 2))
            }
          }
        ]
      )
      return
    }

    // Otherwise, trigger new analysis
    Alert.alert(
      "Analyze Document",
      "Do you want to analyze this document with AI? This may take a few moments.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Analyze",
          onPress: async () => {
            try {
              setIsLoading(true)
              
              console.log("Starting AI analysis for:", selectedFile.name)

              // Use the same endpoint as upload (api/ai/upload)
              const formData = new FormData()
              
              // For re-analysis, we need to download and re-upload
              // Or backend should have a separate analyze endpoint
              // For now, show message
              Alert.alert(
                "Info",
                "AI analysis is performed during upload. Please re-upload the document for fresh analysis.",
              )
              
            } catch (err) {
              console.error("Analysis error:", err)
              Alert.alert(
                "Error", 
                `Failed to analyze document: ${err.message}`
              )
            } finally {
              setIsLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleDelete = () => {
    setShowOptionsModal(false)
    if (!selectedFile) return

    Alert.alert(
      "Delete Document", 
      `Are you sure you want to delete "${selectedFile.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${BASE_URL}/api/pdfs/${selectedFile.id}`, {
                method: "DELETE",
              })
              
              if (!res.ok) {
                const errorText = await res.text()
                throw new Error(`Delete failed: ${errorText}`)
              }
              
              Alert.alert("Success", "Document deleted successfully")
              fetchUserFiles()
            } catch (err) {
              console.error("Delete error:", err)
              Alert.alert("Error", `Failed to delete document: ${err.message}`)
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vault</Text>
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
        <TouchableOpacity style={styles.filterIconButton}>
          <Ionicons name="options-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterPill, selectedFilter === filter && styles.filterPillActive]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Files List */}
      <ScrollView style={styles.filesList} contentContainerStyle={styles.filesListContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6B5FD9" style={{ marginTop: 50 }} />
        ) : filteredFiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>No documents found</Text>
            <Text style={styles.emptySubtext}>Upload your first document to get started</Text>
          </View>
        ) : (
          filteredFiles.map((file) => (
            <TouchableOpacity 
              key={file.id} 
              style={styles.fileCard}
              onPress={() => handleFilePress(file)}
              activeOpacity={0.7}
            >
              <View style={styles.fileInfo}>
                <View style={styles.fileNameContainer}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  {file.aiOutput && (
                    <View style={styles.aiAnalyzedBadge}>
                      <Ionicons name="sparkles" size={12} color="#6B5FD9" />
                    </View>
                  )}
                </View>
                <View style={styles.fileMetaContainer}>
                  <Text style={styles.fileMeta}>{file.date}</Text>
                  <Text style={styles.dot}> • </Text>
                  <Text style={styles.fileEncrypted}>encrypted</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => handleFilePress(file)} 
                style={styles.moreButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddDocumentScreen')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={styles.optionsModal}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.optionsHeader}>
              <Text style={styles.optionsTitle} numberOfLines={1}>
                {selectedFile?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowOptionsModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.optionItem} onPress={handleViewPDF}>
              <Ionicons name="eye-outline" size={24} color="#6B5FD9" />
              <Text style={styles.optionText}>View Document</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={handleAnalyze}>
              <Ionicons name="sparkles-outline" size={24} color="#FF9500" />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>
                  {selectedFile?.aiOutput ? "View AI Analysis" : "Analyze with AI"}
                </Text>
                {selectedFile?.aiOutput && (
                  <Text style={styles.optionSubtext}>Already analyzed</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              <Text style={[styles.optionText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#6B5FD9" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  filterIconButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    maxHeight: 50,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    height: 36,
    justifyContent: "center",
  },
  filterPillActive: {
    backgroundColor: "#6B5FD9",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  filesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filesListContent: {
    paddingBottom: 100,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 1,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  fileInfo: {
    flex: 1,
  },
  fileNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  aiAnalyzedBadge: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F0EBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  fileMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileMeta: {
    fontSize: 13,
    color: "#999",
  },
  dot: {
    fontSize: 13,
    color: "#999",
  },
  fileEncrypted: {
    fontSize: 13,
    color: "#4A90E2",
  },
  moreButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6B5FD9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6B5FD9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  optionsModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  optionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginRight: 12,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 16,
  },
  optionSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
    marginLeft: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
  },
})