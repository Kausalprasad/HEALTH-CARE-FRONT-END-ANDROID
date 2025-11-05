import React, { useState, useRef, useEffect } from "react"
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
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { CameraView, useCameraPermissions } from "expo-camera"
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import Svg, { Circle } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const { width, height } = Dimensions.get("window")

// Updated API URL
const API_URL = "https://ycgirquuktbdgmhzjetmonlmpq0iggls.lambda-url.ap-south-1.on.aws/analyze"

const TongueDiseaseCheckerScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showImageOptions, setShowImageOptions] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef(null)
  
  // Animation for guide box
  const pulseAnim = useRef(new Animated.Value(1)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const circleAnim = useRef(new Animated.Value(0)).current
  const [guideColor, setGuideColor] = useState("#FFD700")
  const [cameraFacing, setCameraFacing] = useState("front")
  const [countdown, setCountdown] = useState(null)
  const autoClickTimerRef = useRef(null)
  const progressIntervalRef = useRef(null)

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  // Auto-capture after 5 seconds when camera opens
  useEffect(() => {
    if (showCamera) {
      startAutoCapture()
    } else {
      cancelAutoCapture()
    }
    
    return () => {
      cancelAutoCapture()
    }
  }, [showCamera])

  // Animate progress bar
  useEffect(() => {
    if (loading) {
      Animated.timing(progressAnim, {
        toValue: loadingProgress,
        duration: 300,
        useNativeDriver: false,
      }).start()
      
      // Animate circular progress
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
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 15 + 5 // Random increment between 5-20
      
      if (progress >= 90) {
        progress = 90 // Stop at 90% and wait for actual response
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
    
    // Keep at 100% for a moment before hiding
    setTimeout(() => {
      setLoadingProgress(0)
    }, 500)
  }

  const getPermissions = async (type = 'camera') => {
    try {
      if (type === 'camera') {
        if (!permission) {
          return false
        }
        if (!permission.granted) {
          const result = await requestPermission()
          return result.granted
        }
        return true
      } else {
        const mediaPermission = await ImagePicker.getMediaLibraryPermissionsAsync()
        if (mediaPermission.status !== 'granted') {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
          if (status !== 'granted') {
            Alert.alert(
              'Gallery Permission Required',
              'Please enable gallery permission from device settings to select photos.'
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

  const openCameraWithGuide = async () => {
    const hasPermission = await getPermissions('camera')
    if (hasPermission) {
      setShowCamera(true)
      setShowImageOptions(false)
      setGuideColor("#FFD700")
      setCountdown(null)
    }
  }

  const startAutoCapture = () => {
    cancelAutoCapture()
    
    setCountdown(5)
    let count = 5
    
    const countdownInterval = setInterval(() => {
      count -= 1
      setCountdown(count)
      
      if (count === 3) {
        setGuideColor("#FFA500") // Orange when 3 seconds left
      }
      if (count === 1) {
        setGuideColor("#4CAF50") // Green when 1 second left
      }
      
      if (count <= 0) {
        clearInterval(countdownInterval)
        setCountdown(0)
      }
    }, 1000)
    
    autoClickTimerRef.current = setTimeout(() => {
      clearInterval(countdownInterval)
      takePicture()
    }, 5000)
  }

  const cancelAutoCapture = () => {
    if (autoClickTimerRef.current) {
      clearTimeout(autoClickTimerRef.current)
      autoClickTimerRef.current = null
    }
    setCountdown(null)
    setGuideColor("#FFD700")
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        cancelAutoCapture()
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        })
        
        console.log('Photo taken:', photo.uri)
        
        try {
          const croppedPhoto = await cropImageToGuideBox(photo.uri)
          setImageUri(croppedPhoto)
          setShowCamera(false)
          setResult(null)
          
          setTimeout(() => {
            sendToBackend({ uri: croppedPhoto })
          }, 300)
        } catch (cropError) {
          console.log('Crop failed, using original image:', cropError)
          setImageUri(photo.uri)
          setShowCamera(false)
          setResult(null)
          
          setTimeout(() => {
            sendToBackend({ uri: photo.uri })
          }, 300)
        }
      } catch (error) {
        console.error('Error taking picture:', error)
        Alert.alert('Error', 'Failed to take photo. Please try again.')
      }
    }
  }

  const cropImageToGuideBox = async (imageUri) => {
    try {
      // Image ka original size le lo
      const getImageSize = () =>
        new Promise((resolve, reject) => {
          Image.getSize(
            imageUri,
            (width, height) => resolve({ width, height }),
            (error) => reject(error)
          );
        });

      const { width: imgWidth, height: imgHeight } = await getImageSize();
      console.log('Original image size:', imgWidth, imgHeight);

      // Guide box ka size (screen center me 280x280)
      const guideBoxSize = 280;
      const guideBoxRatio = guideBoxSize / width;

      // Image me guide box ka actual size calculate karo
      const cropSize = Math.min(imgWidth, imgHeight) * guideBoxRatio;

      // Center se crop karne ke liye origin calculate karo
      const originX = (imgWidth - cropSize) / 2;
      const originY = (imgHeight - cropSize) / 2;

      console.log('Crop parameters:', { originX, originY, cropSize });

      // Image crop aur resize karo
      const croppedImage = await manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.max(0, originX),
              originY: Math.max(0, originY),
              width: cropSize,
              height: cropSize,
            },
          },
          {
            resize: {
              width: 512,
              height: 512,
            },
          },
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      console.log('Image cropped successfully:', croppedImage.uri);
      return croppedImage.uri;
    } catch (error) {
      console.error('Crop error:', error);
      throw error;
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing(current => (current === "back" ? "front" : "back"))
    cancelAutoCapture()
    startAutoCapture()
  }

  const pickPhoto = async (fromCamera = false) => {
    try {
      if (fromCamera) {
        await openCameraWithGuide()
        return
      }

      const hasPermission = await getPermissions('gallery')
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

      const result = await ImagePicker.launchImageLibraryAsync(options)

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        setImageUri(asset.uri)
        setResult(null)
        setShowImageOptions(false)
        
        setTimeout(() => {
          sendToBackend(asset)
        }, 300)
      } else {
        setShowImageOptions(false)
      }
    } catch (error) {
      console.error('Image picker error:', error)
      setShowImageOptions(false)
      Alert.alert('Error', 'Failed to select image. Please try again.')
    }
  }

  const sendToBackend = async (asset) => {
    if (!asset && !imageUri) {
      Alert.alert("Error", "Please select a photo first!")
      return
    }

    const imageSource = asset?.uri || imageUri
    console.log('Sending to backend:', imageSource)

    setLoading(true)
    startProgressSimulation()
    
    try {
      const formData = new FormData()
      const uriParts = imageSource.split('.')
      const fileType = uriParts[uriParts.length - 1].toLowerCase()
      const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg'
      
      formData.append('file', {
        uri: imageSource,
        name: `tongue_${Date.now()}.${fileType}`,
        type: mimeType,
      })

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)

      // Check if API returned sensitive content error
      if (data && data.error && typeof data.error === 'string' && data.error.includes('SensitiveContentDetected')) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
        setLoading(false)
        Alert.alert(
          'Analysis Not Available', 
          'The image could not be analyzed due to content restrictions. This is a backend API issue with Azure OpenAI content filtering. Please contact support or try with a clearer photo.',
          [{ text: 'OK' }]
        )
        setResult(null)
        return
      }

      if (data && data.success) {
        completeProgress()
        setTimeout(() => {
          setResult(data)
        }, 500)
      } else {
        throw new Error(data?.error || 'Empty or invalid response from server')
      }
    } catch (error) {
      console.error('API Error:', error)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      Alert.alert('Analysis Failed', 'Unable to analyze image. Please try again.')
      setResult({ error: 'Analysis failed' })
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  const renderValue = (value, key) => {
    if (value === null || value === undefined) return null

    // Handle the new API response format
    if (key === 'tongue_summary') {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Tongue Summary:</Text>
          <Text style={styles.resultDetailText}>{value}</Text>
        </View>
      )
    }

    if (key === 'main_findings' && Array.isArray(value)) {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>Main Findings:</Text>
          {value.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color="#7475B4" style={{ marginTop: 8, marginRight: 8 }} />
              <Text style={styles.resultDetailText}>{String(item)}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'possible_issues' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Possible Issues:</Text>
          {value.map((issue, index) => (
            <View key={index} style={styles.diseaseItem}>
              <View style={styles.diseaseHeader}>
                <Ionicons 
                  name="warning" 
                  size={20} 
                  color="#FF9800" 
                />
                <Text style={[styles.diseaseTitle, { color: "#FF9800" }]}>
                  {issue.issue}
                </Text>
              </View>
              
              <View style={styles.remediesSection}>
                <View style={styles.remedyGroup}>
                  <Text style={styles.remedyTitle}>
                    <Ionicons name="stats-chart" size={14} color="#7475B4" /> Probability:
                  </Text>
                  <Text style={[styles.remedyText, { marginLeft: 16 }]}>{issue.probability}</Text>
                </View>

                {issue.why && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="help-circle" size={14} color="#4CAF50" /> Why:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{issue.why}</Text>
                  </View>
                )}

                {issue.what_to_do && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="checkmark-circle" size={14} color="#4CAF50" /> What to do:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{issue.what_to_do}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'vitamin_deficiency' && Array.isArray(value)) {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>Vitamin Deficiency:</Text>
          {value.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color="#7475B4" style={{ marginTop: 8, marginRight: 8 }} />
              <Text style={styles.resultDetailText}>{String(item)}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'simple_advice' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Simple Advice:</Text>
          {value.map((advice, i) => (
            <View key={i} style={styles.remedyItem}>
              <Ionicons name="leaf" size={14} color="#4CAF50" style={{ marginTop: 4, marginRight: 8 }} />
              <Text style={styles.remedyText}>{advice}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'severity') {
      const severityColor = value === 'mild' ? '#4CAF50' : value === 'moderate' ? '#FF9800' : '#F44336'
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>Severity:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="pulse" size={16} color={severityColor} />
            <Text style={[styles.resultDetailText, { color: severityColor, fontWeight: '600', marginLeft: 8 }]}>
              {String(value).toUpperCase()}
            </Text>
          </View>
        </View>
      )
    }

    if (key === 'see_doctor') {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={value ? "medical" : "checkmark-circle"} 
              size={16} 
              color={value ? "#FF9800" : "#4CAF50"} 
            />
            <Text style={[styles.resultDetailText, { marginLeft: 8, fontWeight: '600' }]}>
              {value ? "Consultation with doctor recommended" : "No immediate consultation needed"}
            </Text>
          </View>
        </View>
      )
    }

    // Skip these keys from rendering
    if (key === 'success' || key === 'note' || key === 'patient_input' || key === 'tokens_used') {
      return null
    }

    // Default rendering for other fields
    if (Array.isArray(value)) {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>{key.replace(/_/g, ' ').toUpperCase()}:</Text>
          {value.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color="#7475B4" style={{ marginTop: 8, marginRight: 8 }} />
              <Text style={styles.resultDetailText}>{String(item)}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (typeof value === "object") {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>{key.replace(/_/g, ' ').toUpperCase()}:</Text>
          {Object.entries(value).map(([subKey, subValue]) => (
            <View key={subKey} style={{ marginLeft: 16, marginTop: 6 }}>
              <Text style={styles.resultDetailText}>
                <Text style={{ fontWeight: "700", color: "#7475B4" }}>
                  {subKey.replace(/_/g, ' ')}:
                </Text>
                {" "}
                <Text style={{ color: "#333" }}>{String(subValue)}</Text>
              </Text>
            </View>
          ))}
        </View>
      )
    }

    return (
      <View key={key} style={{ marginTop: 12 }}>
        <Text style={styles.resultSectionTitle}>{key.replace(/_/g, ' ').toUpperCase()}:</Text>
        <Text style={[styles.resultDetailText, { marginTop: 4 }]}>{String(value)}</Text>
      </View>
    )
  }

  const renderResult = () => {
    if (!result) return null
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="medical" size={32} color="#7475B4" />
          <Text style={styles.resultTitle}>Tongue Analysis Report</Text>
        </View>
        <View style={styles.resultContent}>
          {Object.entries(result).map(([key, value]) => renderValue(value, key))}
          
          <View style={styles.disclaimerBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#FF9800" />
            <Text style={styles.disclaimerText}>
              {result.note || "This analysis is for informational purposes only. Please consult a healthcare professional for proper medical advice and diagnosis."}
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
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tongue Disease Checker</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#7475B4" />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Our AI analyzes your tongue image to detect possible signs of
            various tongue conditions. For best results, take a clear photo in
            good lighting.
          </Text>
        </View>

        {!imageUri ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="camera-outline" size={64} color="#7475B4" />
            </View>
            <Text style={styles.uploadTitle}>Upload Your Tongue Photo</Text>
            <Text style={styles.uploadSubtitle}>
              Photo will be automatically captured after 5 seconds
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowImageOptions(true)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.uploadButtonGradient,
                  { backgroundColor: "#7475B4" },
                ]}
              >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>Select Photo</Text>
              </View>
            </TouchableOpacity>
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
                <Ionicons name="analytics" size={48} color="#7475B4" />
                <Text style={styles.circularPercentageText}>
                  {Math.round(loadingProgress)}%
                </Text>
              </View>
            </View>
            
            <Text style={styles.loadingText}>Analyzing your tongue photo...</Text>
            <Text style={styles.loadingSubtext}>
              AI is processing your image
            </Text>

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

        {renderResult()}

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
              <Text style={styles.tipText}>Stick your tongue out fully and keep it steady</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Photo will be captured automatically after 5 seconds</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Position your tongue inside the guide box</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Camera Modal with Guide Overlay */}
      <Modal
        visible={showCamera}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          cancelAutoCapture()
          setShowCamera(false)
        }}
      >
        <View style={styles.cameraContainer}>
          {permission?.granted && (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={cameraFacing}
            >
              {/* Guide Overlay */}
              <View style={styles.guideOverlay}>
                <View style={styles.darkArea} />
                
                <View style={styles.middleRow}>
                  <View style={styles.darkAreaSide} />
                  
                  <Animated.View 
                    style={[
                      styles.guideBox,
                      {
                        borderColor: guideColor,
                        transform: [{ scale: pulseAnim }]
                      }
                    ]}
                  >
                    <View style={[styles.corner, styles.topLeft, { borderColor: guideColor }]} />
                    <View style={[styles.corner, styles.topRight, { borderColor: guideColor }]} />
                    <View style={[styles.corner, styles.bottomLeft, { borderColor: guideColor }]} />
                    <View style={[styles.corner, styles.bottomRight, { borderColor: guideColor }]} />
                    
                    <View style={styles.instructionContainer}>
                      <Ionicons 
                        name="scan-outline" 
                        size={40} 
                        color={guideColor} 
                      />
                      <Text style={[styles.instructionText, { color: guideColor }]}>
                        Position tongue inside the frame
                      </Text>
                      
                      {countdown !== null && countdown > 0 && (
                        <View style={styles.countdownCircle}>
                          <Text style={styles.countdownText}>{countdown}</Text>
                        </View>
                      )}
                      
                      {countdown === 0 && (
                        <Text style={[styles.instructionText, { color: "#4CAF50", marginTop: 15 }]}>
                          Capturing...
                        </Text>
                      )}
                    </View>
                  </Animated.View>
                  
                  <View style={styles.darkAreaSide} />
                </View>
                
                <View style={styles.darkArea} />
              </View>

              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.closeCamera}
                  onPress={() => {
                    cancelAutoCapture()
                    setShowCamera(false)
                  }}
                >
                  <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                  activeOpacity={0.7}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.flipCamera}
                  onPress={toggleCameraFacing}
                >
                  <Ionicons name="camera-reverse" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>
      </Modal>

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
                <Text style={styles.optionSubtitle}>
                  Auto-capture after 5 seconds
                </Text>
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
                <Text style={styles.optionSubtitle}>
                  Select existing photo from gallery
                </Text>
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
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#fff",
  },
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
  resultContent: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    backgroundColor: "#F8F9FF",
    borderWidth: 1,
    borderColor: "#F0F0F8",
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7475B4",
    marginBottom: 8,
    marginTop: 8,
  },
  resultDetailText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    flex: 1,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
    marginBottom: 4,
  },
  diseaseSection: {
    marginTop: 8,
  },
  diseaseItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E8E8F0",
  },
  diseaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  diseaseTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    flex: 1,
  },
  remediesSection: {
    marginTop: 8,
  },
  remedyGroup: {
    marginBottom: 12,
  },
  remedyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  remedyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 8,
  },
  remedyText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    flex: 1,
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
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  guideOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  darkArea: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  middleRow: {
    flexDirection: "row",
    width: "100%",
  },
  darkAreaSide: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  guideBox: {
    width: 280,
    height: 280,
    borderWidth: 4,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderWidth: 5,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  instructionContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  countdownCircle: {
    marginTop: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(116, 117, 180, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  countdownText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  closeCamera: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  flipCamera: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#fff",
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

export default TongueDiseaseCheckerScreen