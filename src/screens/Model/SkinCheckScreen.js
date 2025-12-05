import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  Animated,
  Linking,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import Svg, { Circle } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const { width } = Dimensions.get('window')

// Skin Analysis API URL
const API_URL = "https://ptepv7huyfjapu6uct5rlq3y640hnibn.lambda-url.ap-south-1.on.aws/analyze"

const SkinCheckScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showImageOptions, setShowImageOptions] = useState(false)

  // Animation refs
  const progressAnim = useRef(new Animated.Value(0)).current
  const circleAnim = useRef(new Animated.Value(0)).current
  const progressIntervalRef = useRef(null)

  // Animate progress bar
  useEffect(() => {
    if (loading) {
      Animated.timing(progressAnim, {
        toValue: loadingProgress,
        duration: 300,
        useNativeDriver: false,
      }).start()
      
      Animated.timing(circleAnim, {
        toValue: loadingProgress,
        duration: 300,
        useNativeDriver: false,
      }).start()
    } else {
      progressAnim.setValue(0)
      circleAnim.setValue(0)
    }
  }, [loadingProgress, loading])

  const startProgressSimulation = () => {
    setLoadingProgress(0)
    let progress = 0
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 15 + 5
      
      if (progress >= 90) {
        progress = 90
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
      }
      
      setLoadingProgress(Math.min(progress, 90))
    }, 400)
  }

  const completeProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    setLoadingProgress(100)
    
    setTimeout(() => {
      setLoadingProgress(0)
    }, 500)
  }

  const openLiveCheck = async () => {
    const url = "https://skin.healnova.ai/camera";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open the live check link");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while opening the link");
    }
  };

  const getPermissions = async (type = 'camera') => {
    try {
      if (type === 'camera') {
        const cameraPermission = await ImagePicker.getCameraPermissionsAsync()
        if (cameraPermission.status !== 'granted') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync()
          if (status !== 'granted') {
            Alert.alert(
              'Camera Permission Required',
              'Please enable camera permission from device settings to take photos.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK' }
              ]
            )
            return false
          }
        }
      } else {
        const mediaPermission = await ImagePicker.getMediaLibraryPermissionsAsync()
        if (mediaPermission.status !== 'granted') {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
          if (status !== 'granted') {
            Alert.alert(
              'Gallery Permission Required',
              'Please enable gallery permission from device settings to select photos.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK' }
              ]
            )
            return false
          }
        }
      }
      return true
    } catch (error) {
      console.error('Permission error:', error)
      return false
    }
  }

  const pickPhoto = async (fromCamera = false) => {
    try {
      console.log(`Skin ${fromCamera ? 'Camera' : 'Gallery'} selected`)

      const hasPermission = await getPermissions(fromCamera ? 'camera' : 'gallery')
      if (!hasPermission) {
        setShowImageOptions(false)
        return
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
        exif: false,
      }

      console.log('Launching skin image picker...')

      let result
      if (fromCamera) {
        result = await ImagePicker.launchCameraAsync(options)
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options)
      }

      console.log('Skin image picker result:', {
        canceled: result.canceled,
        hasAssets: !!result.assets,
        assetsLength: result.assets?.length
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        console.log('Skin image selected:', {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize
        })

        setImageUri(asset.uri)
        setResult(null)
        setShowImageOptions(false)
        
        setTimeout(() => {
          sendToBackend(asset)
        }, 300)
      } else {
        console.log('Skin image picker canceled')
        setShowImageOptions(false)
      }
    } catch (error) {
      console.error('Skin image picker error:', error)
      setShowImageOptions(false)
      Alert.alert(
        'Error', 
        `Failed to ${fromCamera ? 'take photo' : 'select image'}. Please try again.`
      )
    }
  }

  const sendToBackend = async (asset) => {
    if (!asset && !imageUri) {
      Alert.alert("Error", "Please select a photo first!")
      return
    }

    const imageSource = asset?.uri || imageUri
    console.log('Sending skin image to backend:', imageSource)
    console.log('Skin API Endpoint:', API_URL)

    setLoading(true)
    startProgressSimulation()
    
    try {
      const formData = new FormData()
      const uriParts = imageSource.split('.')
      const fileType = uriParts[uriParts.length - 1].toLowerCase()
      const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg'
      
      console.log('Skin file info:', { fileType, mimeType })

      formData.append('file', {
        uri: imageSource,
        name: `skin_${Date.now()}.${fileType}`,
        type: mimeType,
      })

      console.log('Making skin analysis API request...')

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      })

      console.log('Skin API response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Skin API Response:', JSON.stringify(data, null, 2))

      if (data && data.success) {
        completeProgress()
        setTimeout(() => {
          setResult(data)
        }, 500)
      } else {
        throw new Error('Empty response from skin analysis server')
      }

    } catch (error) {
      console.error('Skin API Error:', error)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      
      let errorMessage = 'Network error occurred'
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Check your internet connection.'
      } else if (error.message.includes('HTTP error')) {
        errorMessage = 'Server error occurred. Please try again later.'
      }

      Alert.alert('Skin Analysis Failed', errorMessage)
      setResult({ error: errorMessage })
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  const parseAnalysisText = (analysisText) => {
    if (!analysisText) return null

    const sections = {
      diagnosis: '',
      abcde: '',
      riskAssessment: '',
      recommendation: '',
      finalSummary: ''
    }

    // Try multiple patterns for diagnosis
    let diagnosisMatch = analysisText.match(/####?\s*\*?\*?1\.\s*Diagnosis[:\s]+(.*?)(?=####|\n###|$)/si)
    if (!diagnosisMatch) {
      diagnosisMatch = analysisText.match(/\*?\*?Diagnosis\*?\*?[:\s]+(.*?)(?=####|\n###|$)/si)
    }
    if (diagnosisMatch) sections.diagnosis = diagnosisMatch[1].trim()

    // Try multiple patterns for ABCDE
    let abcdeMatch = analysisText.match(/####?\s*\*?\*?2\.\s*ABCDE Criteria\*?\*?[:\s]+(.*?)(?=####|\n###|$)/si)
    if (!abcdeMatch) {
      abcdeMatch = analysisText.match(/\*?\*?ABCDE Criteria\*?\*?[:\s]+(.*?)(?=####|\n###|$)/si)
    }
    if (abcdeMatch) sections.abcde = abcdeMatch[1].trim()

    // Try multiple patterns for Risk Assessment
    let riskMatch = analysisText.match(/####?\s*\*?\*?3\.\s*Risk Assessment[:\s]+(.*?)(?=####|\n###|$)/si)
    if (!riskMatch) {
      riskMatch = analysisText.match(/\*?\*?Risk Assessment\*?\*?[:\s]+(.*?)(?=####|\n###|$)/si)
    }
    if (riskMatch) sections.riskAssessment = riskMatch[1].trim()

    // Try multiple patterns for Recommendation
    let recommendationMatch = analysisText.match(/####?\s*\*?\*?4\.\s*Recommendation[:\s]+(.*?)(?=####|\n###|$)/si)
    if (!recommendationMatch) {
      recommendationMatch = analysisText.match(/\*?\*?Recommendation\*?\*?[:\s]+(.*?)(?=####|\n###|$)/si)
    }
    if (recommendationMatch) sections.recommendation = recommendationMatch[1].trim()

    // Try to get Final Summary
    let summaryMatch = analysisText.match(/###?\s*\*?\*?Final Summary\*?\*?[:\s]+(.*?)(?=\*Note:|$)/si)
    if (summaryMatch) sections.finalSummary = summaryMatch[1].trim()

    // Get the note at the end
    let noteMatch = analysisText.match(/\*Note:[^\*]+(.*?)$/si)
    if (noteMatch) sections.note = noteMatch[0].trim()

    console.log('Parsed sections:', sections)

    return sections
  }

  const renderAnalysisSection = (title, content, icon, color) => {
    if (!content) return null

    // Clean up the content - remove markdown formatting
    let cleanContent = content
      .replace(/\*\*\*/g, '') // Remove bold+italic
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/####/g, '') // Remove h4 headers
      .replace(/###/g, '') // Remove h3 headers
      .replace(/\n\n\n+/g, '\n\n') // Remove extra newlines
      .trim()

    // Split into lines and process
    const lines = cleanContent.split('\n').map(line => line.trim()).filter(line => line)

    return (
      <View style={styles.analysisSection}>
        <View style={styles.analysisSectionHeader}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={[styles.analysisSectionTitle, { color }]}>{title}</Text>
        </View>
        <View style={styles.analysisSectionContent}>
          {lines.map((line, index) => {
            // Check if it's a bullet point
            if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
              const text = line.substring(1).trim()
              return (
                <View key={index} style={styles.bulletPoint}>
                  <Ionicons name="ellipse" size={6} color={color} style={styles.bulletIcon} />
                  <Text style={styles.analysisText}>{text}</Text>
                </View>
              )
            }
            
            // Check if it's a labeled point (e.g., "Asymmetry:", "Risk:")
            if (line.includes(':')) {
              const parts = line.split(':')
              const label = parts[0].trim()
              const value = parts.slice(1).join(':').trim()
              
              return (
                <View key={index} style={styles.labeledPoint}>
                  <Text style={[styles.labelText, { color }]}>{label}:</Text>
                  <Text style={styles.valueText}> {value}</Text>
                </View>
              )
            }
            
            // Regular paragraph
            return (
              <Text key={index} style={[styles.analysisText, { marginBottom: 10 }]}>
                {line}
              </Text>
            )
          })}
        </View>
      </View>
    )
  }

  const renderResult = () => {
    if (!result) return null

    if (result.error) {
      return (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="alert-circle" size={32} color="#F44336" />
            <Text style={styles.resultTitle}>Analysis Error</Text>
          </View>
          <View style={[styles.resultContent, { backgroundColor: '#FFEBEE' }]}>
            <Text style={[styles.resultText, { color: '#D32F2F' }]}>
              {result.error}
            </Text>
          </View>
        </View>
      )
    }

    const parsedAnalysis = parseAnalysisText(result.analysis)

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="medical" size={32} color="#7475B4" />
          <Text style={styles.resultTitle}>Skin Analysis Report</Text>
        </View>

        {result.timestamp && (
          <Text style={styles.timestampText}>
            Analysis Date: {new Date(result.timestamp).toLocaleString()}
          </Text>
        )}

        <View style={styles.resultContent}>
          {parsedAnalysis && (
            <>
              {renderAnalysisSection(
                '1. Diagnosis',
                parsedAnalysis.diagnosis,
                'clipboard',
                '#7475B4'
              )}

              {renderAnalysisSection(
                '2. ABCDE Criteria',
                parsedAnalysis.abcde,
                'list',
                '#2196F3'
              )}

              {renderAnalysisSection(
                '3. Risk Assessment',
                parsedAnalysis.riskAssessment,
                'alert-circle',
                '#FF9800'
              )}

              {renderAnalysisSection(
                '4. Recommendation',
                parsedAnalysis.recommendation,
                'medkit',
                '#F44336'
              )}

              {parsedAnalysis.finalSummary && renderAnalysisSection(
                'Final Summary',
                parsedAnalysis.finalSummary,
                'checkmark-circle',
                '#4CAF50'
              )}

              {parsedAnalysis.note && (
                <View style={styles.conclusionBox}>
                  <Ionicons name="information-circle" size={20} color="#7475B4" />
                  <Text style={styles.conclusionText}>
                    {parsedAnalysis.note.replace(/\*/g, '')}
                  </Text>
                </View>
              )}
            </>
          )}
          
          <View style={styles.disclaimerBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#FF9800" />
            <Text style={styles.disclaimerText}>
              AI-powered analysis for informational purposes only. Always consult a qualified dermatologist for professional medical advice and definitive diagnosis.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.newAnalysisButton}
          onPress={() => setShowImageOptions(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color="#7475B4" />
          <Text style={styles.newAnalysisText}>Analyze Another Photo</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7475B4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skin Lesion Analysis</Text>
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
            Our AI analyzes skin lesions using advanced pattern recognition to assess potential concerns. 
            For best results, take a clear, close-up photo of the skin area in good lighting.
          </Text>
        </View>

        {/* Upload Section */}
        {!imageUri ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="camera-outline" size={64} color="#7475B4" />
            </View>
            <Text style={styles.uploadTitle}>Upload Skin Lesion Photo</Text>
            <Text style={styles.uploadSubtitle}>
              Take a clear photo of the skin area or choose from gallery
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.uploadButtonHalf}
                onPress={() => setShowImageOptions(true)}
                activeOpacity={0.8}
              >
                <View style={[styles.uploadButtonGradient, { backgroundColor: "#7475B4" }]}>
                  <Ionicons name="add" size={24} color="#fff" />
                  <Text style={styles.uploadButtonText}>Add Image</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.liveButtonHalf}
                onPress={openLiveCheck}
                activeOpacity={0.8}
              >
                <View style={[styles.liveButtonGradient, { backgroundColor: "#7475B4" }]}>
                  <Ionicons name="videocam" size={24} color="#fff" />
                  <Text style={styles.liveButtonText}>Live</Text>
                  <View style={styles.liveDotSmall} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Uploaded Image</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={() => setShowImageOptions(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="#7475B4" />
                <Text style={styles.changeImageText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading State with Circular Progress */}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.circularProgressContainer}>
              <Svg width={200} height={200} style={styles.circularProgress}>
                {/* Background Circle */}
                <Circle
                  cx="100"
                  cy="100"
                  r="85"
                  stroke="#E8E8F0"
                  strokeWidth="12"
                  fill="none"
                />
                
                {/* Progress Circle */}
                <AnimatedCircle
                  cx="100"
                  cy="100"
                  r="85"
                  stroke="#7475B4"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  strokeDashoffset={circleAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: [2 * Math.PI * 85, 0],
                  })}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </Svg>
              
              {/* Center Content */}
              <View style={styles.circularProgressCenter}>
                <Ionicons name="medical" size={48} color="#7475B4" />
                <Text style={styles.circularPercentageText}>
                  {Math.round(loadingProgress)}%
                </Text>
              </View>
            </View>
            
            <Text style={styles.loadingText}>Analyzing skin lesion...</Text>
            <Text style={styles.loadingSubtext}>AI is processing your image</Text>

            {/* Loading Steps */}
            <View style={styles.stepsContainer}>
              <View style={styles.stepItem}>
                <Ionicons 
                  name={loadingProgress >= 30 ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={loadingProgress >= 30 ? "#4CAF50" : "#ccc"} 
                />
                <Text style={[
                  styles.stepText,
                  { color: loadingProgress >= 30 ? "#4CAF50" : "#999" }
                ]}>
                  Image Uploaded
                </Text>
              </View>

              <View style={styles.stepItem}>
                <Ionicons 
                  name={loadingProgress >= 60 ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={loadingProgress >= 60 ? "#4CAF50" : "#ccc"} 
                />
                <Text style={[
                  styles.stepText,
                  { color: loadingProgress >= 60 ? "#4CAF50" : "#999" }
                ]}>
                  AI Processing
                </Text>
              </View>

              <View style={styles.stepItem}>
                <Ionicons 
                  name={loadingProgress >= 90 ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={loadingProgress >= 90 ? "#4CAF50" : "#ccc"} 
                />
                <Text style={[
                  styles.stepText,
                  { color: loadingProgress >= 90 ? "#4CAF50" : "#999" }
                ]}>
                  Generating Results
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Result Section */}
        {renderResult()}

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FF9800" />
            <Text style={styles.tipsTitle}>Photography Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Use natural lighting or bright indoor light</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Take close-up photo showing the lesion clearly</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Ensure the area is clean and well-focused</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Avoid shadows and reflections on the skin</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Photo Source</Text>
              <TouchableOpacity onPress={() => setShowImageOptions(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => pickPhoto(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="camera" size={28} color="#2196F3" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>Use camera to capture skin photo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => pickPhoto(false)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E8F5E8" }]}>
                <Ionicons name="images" size={28} color="#4CAF50" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionSubtitle}>Select existing photo from gallery</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.modalNote}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.modalNoteText}>Your photos are processed securely and not stored</Text>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#7475B4",
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  placeholder: { width: 40 },
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
    borderColor: "#E8E8F0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    borderColor: "#E8E8F0",
  },
  uploadIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E8E8F0",
    borderStyle: "dashed",
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  uploadButtonHalf: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
  },
  liveButtonHalf: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
  },
  liveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: "relative",
  },
  liveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  liveDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F44336",
    position: "absolute",
    top: 10,
    right: 10,
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
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8F0",
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
    borderColor: "#E8E8F0",
  },
  circularProgressContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  circularProgress: {
    position: "absolute",
  },
  circularProgressCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  circularPercentageText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#7475B4",
    marginTop: 10,
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
    marginBottom: 20,
  },
  stepsContainer: {
    width: "100%",
    marginTop: 25,
    paddingHorizontal: 10,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E8E8F0",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginLeft: 12,
  },
  timestampText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 15,
    fontStyle: "italic",
  },
  resultContent: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    backgroundColor: "#F8F9FF",
    borderWidth: 1,
    borderColor: "#F0F0F8",
  },
  resultText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  analysisSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8F0",
  },
  analysisSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    flex: 1,
  },
  analysisSectionContent: {
    paddingTop: 4,
  },
  analysisText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    flex: 1,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingLeft: 8,
  },
  bulletIcon: {
    marginTop: 8,
    marginRight: 10,
  },
  labeledPoint: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
  },
  valueText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  conclusionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(116, 117, 180, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#7475B4",
  },
  conclusionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
    fontWeight: "600",
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 152, 0, 0.08)",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  disclaimerText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
    fontStyle: "italic",
  },
  newAnalysisButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(116, 117, 180, 0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(116, 117, 180, 0.2)",
  },
  newAnalysisText: {
    fontSize: 14,
    color: "#7475B4",
    fontWeight: "600",
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E8E8F0",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    fontWeight: "700",
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
})

export default SkinCheckScreen