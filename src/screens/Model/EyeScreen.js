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
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { CameraView, useCameraPermissions } from "expo-camera"
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import * as Font from 'expo-font'
import Svg, { Circle } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const { width, height } = Dimensions.get("window")

// Updated API URL for Eye
const API_URL = "https://gmu4em2cfot4a4cq5yt3l46doa0yfsel.lambda-url.ap-south-1.on.aws/analyze"

const EyeScreen = ({ navigation, route }) => {
  const [imageUri, setImageUri] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showImageOptions, setShowImageOptions] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [error, setError] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [photoSource, setPhotoSource] = useState(null) // Store source (camera/gallery)
  const [permission, requestPermission] = useCameraPermissions()
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    why: true,
    safetyTips: true,
    homeRemedies: true,
    aiGuidance: true,
  })
  const cameraRef = useRef(null)
  
  // Animation for guide box
  const pulseAnim = useRef(new Animated.Value(1)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const circleAnim = useRef(new Animated.Value(0)).current
  const [guideColor, setGuideColor] = useState("#ADFF2F") // Yellow-green color
  const [cameraFacing, setCameraFacing] = useState("front")
  const [countdown, setCountdown] = useState(null)
  const autoClickTimerRef = useRef(null)
  const progressIntervalRef = useRef(null)
  const [eyeHealthModalVisible, setEyeHealthModalVisible] = useState(false)
  const [guidelinesModalVisible, setGuidelinesModalVisible] = useState(false)

  // Load fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
        })
        setFontsLoaded(true)
      } catch (error) {
        console.log('Font loading error:', error)
        setFontsLoaded(true)
      }
    }
    loadFonts()
  }, [])

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
        setGuideColor("#FFA500") // Orange
      }
      if (count === 1) {
        setGuideColor("#4CAF50") // Green
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
    setGuideColor("#ADFF2F") // Yellow-green
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        cancelAutoCapture()
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        })
        
        console.log('Photo taken:', photo.uri, 'Photo dimensions:', photo.width, photo.height)
        
        try {
          // Photo object se dimensions pass karo for better accuracy
          // Agar dimensions nahi mili to null pass karo, function internally Image.getSize use karega
          const croppedPhoto = await cropImageToGuideBox(
            photo.uri, 
            photo.width || null, 
            photo.height || null
          )
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

const cropImageToGuideBox = async (imageUri, photoWidth = null, photoHeight = null) => {
    try {
      let imgWidth, imgHeight;
      
      // Agar photo dimensions directly mil gayi hain to use karo, warna Image.getSize se le lo
      if (photoWidth && photoHeight) {
        imgWidth = photoWidth;
        imgHeight = photoHeight;
        console.log('Using photo dimensions:', imgWidth, imgHeight, 'Platform:', Platform.OS);
      } else {
        // Image ka original size le lo
        const getImageSize = () =>
          new Promise((resolve, reject) => {
            Image.getSize(
              imageUri,
              (width, height) => resolve({ width, height }),
              (error) => reject(error)
            );
          });

        const size = await getImageSize();
        imgWidth = size.width;
        imgHeight = size.height;
        console.log('Image size from getSize:', imgWidth, imgHeight, 'Platform:', Platform.OS);
      }

      // Guide box ka size (screen center me 280x280)
      const guideBoxSize = 280;
      const screenWidth = width; // Dimensions.get("window") se aaya hai
      const screenHeight = height;
      
      console.log('Screen dimensions:', screenWidth, screenHeight);
      console.log('Image dimensions:', imgWidth, imgHeight);
      
      // Android me camera preview aur actual image ka aspect ratio different ho sakta hai
      // Isliye proper scale factor calculate karo
      let cropSize;
      
      if (Platform.OS === 'android') {
        // Android me: camera preview aur actual image ka aspect ratio different ho sakta hai
        // Guide box screen pe 280x280 hai (center me)
        // Main approach: Guide box screen dimensions ke basis pe calculate karo,
        // phir actual image dimensions ke basis pe scale karo
        
        // Screen aspect ratio
        const screenAspectRatio = screenWidth / screenHeight;
        // Image aspect ratio
        const imageAspectRatio = imgWidth / imgHeight;
        
        console.log('Aspect ratios:', {
          screenAspectRatio,
          imageAspectRatio,
          screenWidth,
          screenHeight,
          imgWidth,
          imgHeight
        });
        
        // Guide box screen width ka kitna percentage hai
        const guideBoxRatio = guideBoxSize / screenWidth;
        
        // Android me: image dimensions ke basis pe crop size calculate karo
        // Agar image aspect ratio screen se different hai, to adjust karo
        if (Math.abs(imageAspectRatio - screenAspectRatio) > 0.1) {
          // Aspect ratio different hai - use the smaller dimension to ensure square crop
          const scaleFactor = Math.min(imgWidth / screenWidth, imgHeight / screenHeight);
          cropSize = guideBoxSize * scaleFactor;
        } else {
          // Aspect ratio similar hai - simple calculation use karo
          cropSize = Math.min(imgWidth, imgHeight) * guideBoxRatio;
        }
        
        // Ensure crop size doesn't exceed image dimensions
        const minDimension = Math.min(imgWidth, imgHeight);
        cropSize = Math.min(cropSize, minDimension);
        
        console.log('Android crop calculation:', {
          guideBoxRatio,
          scaleFactor: Math.min(imgWidth / screenWidth, imgHeight / screenHeight),
          finalCropSize: cropSize
        });
      } else {
        // iOS ke liye: original calculation (jo pehle se kaam kar raha hai)
        const guideBoxRatio = guideBoxSize / screenWidth;
        cropSize = Math.min(imgWidth, imgHeight) * guideBoxRatio;
      }

      // Center se crop karne ke liye origin calculate karo
      const originX = Math.max(0, (imgWidth - cropSize) / 2);
      const originY = Math.max(0, (imgHeight - cropSize) / 2);

      // Crop dimensions ko ensure karo ki wo image ke andar hi rahe
      const finalCropWidth = Math.min(cropSize, imgWidth - originX);
      const finalCropHeight = Math.min(cropSize, imgHeight - originY);
      
      // Square crop ensure karo - minimum dimension use karo
      const finalCropSize = Math.min(finalCropWidth, finalCropHeight);

      console.log('Crop parameters:', { 
        originX: Math.floor(originX), 
        originY: Math.floor(originY), 
        cropSize: Math.floor(finalCropSize), 
        imgWidth, 
        imgHeight,
        platform: Platform.OS,
        screenWidth,
        screenHeight
      });

      // Image crop aur resize karo
      const croppedImage = await manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.max(0, Math.floor(originX)),
              originY: Math.max(0, Math.floor(originY)),
              width: Math.floor(finalCropSize),
              height: Math.floor(finalCropSize),
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
        // User cancelled gallery picker - go back to dashboard
        setShowImageOptions(false)
        if (route?.params?.source === 'gallery') {
          navigation.navigate('DashboardScreen')
        } else {
          navigation.goBack()
        }
      }
    } catch (error) {
      console.error('Image picker error:', error)
      setShowImageOptions(false)
      Alert.alert('Error', 'Failed to select image. Please try again.')
    }
  }

  // Check route params to auto-open camera or gallery - Skip upload screen
  useEffect(() => {
    if (!fontsLoaded) return // Wait for fonts to load first
    
    if (route?.params?.source === 'camera') {
      setPhotoSource('camera') // Store source in state
      // Auto-open camera directly - skip upload screen
      setTimeout(() => {
        openCameraWithGuide()
      }, 100)
    } else if (route?.params?.source === 'gallery') {
      setPhotoSource('gallery') // Store source in state
      // Auto-open gallery directly - skip upload screen
      setTimeout(() => {
        pickPhoto(false)
      }, 100)
    }
  }, [route?.params, fontsLoaded])

  // Handle case when no route params - show modal instead of going back
  useEffect(() => {
    if (!route?.params?.source && !imageUri && !result && !showCamera && !loading && fontsLoaded) {
      setEyeHealthModalVisible(true)
    }
  }, [route?.params?.source, imageUri, result, showCamera, loading, fontsLoaded])

  const sendToBackend = async (asset) => {
    if (!asset && !imageUri) {
      Alert.alert("Error", "Please select a photo first!")
      return
    }

    const imageSource = asset?.uri || imageUri
    console.log('Sending to backend:', imageSource)

    setLoading(true)
    setError(null)
    setErrorMessage(null)
    startProgressSimulation()
    
    try {
      const formData = new FormData()
      const uriParts = imageSource.split('.')
      const fileType = uriParts[uriParts.length - 1].toLowerCase()
      const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg'
      
      // Fix: Use 'file' instead of 'image' as the field name
      formData.append('file', {
        uri: Platform.OS === 'android' ? imageSource : imageSource.replace('file://', ''),
        name: `eye_${Date.now()}.jpg`,
        type: 'image/jpeg',
      })

      console.log('FormData prepared, sending request...')

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Response status:', response.status)
      
      // Get response text first to check if it's JSON or error
      const responseText = await response.text()
      console.log('Response text:', responseText)
      
      if (!response.ok) {
        // Try to parse error message from API
        let errorMsg = `Server error (${response.status})`
        try {
          const errorData = JSON.parse(responseText)
          errorMsg = errorData.message || errorData.error || errorData.detail || errorMsg
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMsg = errorData.errors.join(', ')
          }
        } catch (e) {
          // If not JSON, use text as error message
          if (responseText && responseText.trim()) {
            errorMsg = responseText.trim()
          }
        }
        
        console.log('API Error:', errorMsg)
        setError(true)
        setErrorMessage(errorMsg)
        setResult(null)
        return
      }

      // Parse JSON response
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse JSON:', e)
        setError(true)
        setErrorMessage('Invalid response from server. Please try again.')
        setResult(null)
        return
      }

      console.log('API Response:', JSON.stringify(data, null, 2))

      // Check if API returned an error in the response
      if (data.error || data.message?.toLowerCase().includes('error') || data.status === 'error') {
        const errorMsg = data.message || data.error || data.detail || 'Analysis failed. Please try again.'
        console.log('API returned error:', errorMsg)
        setError(true)
        setErrorMessage(errorMsg)
        setResult(null)
        return
      }

      // Handle both success and direct data response
      if (data && (data.success || data.result || Object.keys(data).length > 0)) {
        // Clear any previous errors
        setError(false)
        setErrorMessage(null)
        completeProgress()
        setTimeout(() => {
          // If data has a result field, use it, otherwise use data directly
          const resultData = data.result || data.data || data
          setResult(resultData)
        }, 500)
      } else {
        setError(true)
        setErrorMessage('Empty or invalid response from server. Please try again.')
        setResult(null)
      }

    } catch (error) {
      console.error('API Error:', error)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      
      // Handle different error types
      let errorMsg = 'Unable to analyze image. Please try again.'
      
      if (error.message) {
        if (error.message.includes('Network')) {
          errorMsg = 'Network error. Please check your internet connection and try again.'
        } else if (error.message.includes('timeout')) {
          errorMsg = 'Request timed out. Please try again.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMsg = 'Failed to connect to server. Please check your internet connection.'
        } else {
          errorMsg = error.message
        }
      }
      
      setError(true)
      setErrorMessage(errorMsg)
      setResult(null)
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }
  const renderValue = (value, key) => {
    if (value === null || value === undefined) return null

    // Handle the new eye API response format
    if (key === 'eye_summary') {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Eye Summary:</Text>
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

    if (key === 'eye_conditions' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Eye Conditions:</Text>
          {value.map((condition, index) => (
            <View key={index} style={styles.diseaseItem}>
              <View style={styles.diseaseHeader}>
                <Ionicons 
                  name="eye" 
                  size={20} 
                  color="#FF9800" 
                />
                <Text style={[styles.diseaseTitle, { color: "#FF9800" }]}>
                  {condition.condition}
                </Text>
              </View>
              
              <View style={styles.remediesSection}>
                <View style={styles.remedyGroup}>
                  <Text style={styles.remedyTitle}>
                    <Ionicons name="stats-chart" size={14} color="#7475B4" /> Severity:
                  </Text>
                  <Text style={[styles.remedyText, { marginLeft: 16 }]}>{condition.severity}</Text>
                </View>

                <View style={styles.remedyGroup}>
                  <Text style={styles.remedyTitle}>
                    <Ionicons name="pulse" size={14} color="#7475B4" /> Probability:
                  </Text>
                  <Text style={[styles.remedyText, { marginLeft: 16 }]}>{condition.probability}</Text>
                </View>

                {condition.why && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="help-circle" size={14} color="#4CAF50" /> Why:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{condition.why}</Text>
                  </View>
                )}

                {condition.treatment && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="medical" size={14} color="#4CAF50" /> Treatment:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{condition.treatment}</Text>
                  </View>
                )}

                {condition.when_to_see_doctor && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="warning" size={14} color="#FF9800" /> When to see doctor:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{condition.when_to_see_doctor}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'cosmetic_concerns' && Array.isArray(value) && value.length > 0) {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>Cosmetic Concerns:</Text>
          {value.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color="#7475B4" style={{ marginTop: 8, marginRight: 8 }} />
              <Text style={styles.resultDetailText}>{String(item)}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'safety_tips' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Safety Tips:</Text>
          {value.map((tip, i) => (
            <View key={i} style={styles.remedyItem}>
              <Ionicons name="shield-checkmark" size={14} color="#4CAF50" style={{ marginTop: 4, marginRight: 8 }} />
              <Text style={styles.remedyText}>{tip}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'home_remedies' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Home Remedies:</Text>
          {value.map((remedy, i) => (
            <View key={i} style={styles.remedyItem}>
              <Ionicons name="leaf" size={14} color="#4CAF50" style={{ marginTop: 4, marginRight: 8 }} />
              <Text style={styles.remedyText}>{remedy}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'severity_level') {
      const severityColor = value === 'mild' ? '#4CAF50' : value === 'moderate' ? '#FF9800' : '#F44336'
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>Severity Level:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="pulse" size={16} color={severityColor} />
            <Text style={[styles.resultDetailText, { color: severityColor, fontWeight: '600', marginLeft: 8 }]}>
              {String(value).toUpperCase()}
            </Text>
          </View>
        </View>
      )
    }

    if (key === 'see_doctor_urgently') {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={value ? "medical" : "checkmark-circle"} 
              size={16} 
              color={value ? "#FF9800" : "#4CAF50"} 
            />
            <Text style={[styles.resultDetailText, { marginLeft: 8, fontWeight: '600' }]}>
              {value ? "Urgent consultation with doctor recommended" : "No urgent consultation needed"}
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
          <Ionicons name="eye" size={32} color="#7475B4" />
          <Text style={styles.resultTitle}>Eye Analysis Report</Text>
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

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7475B4" />
      </View>
    )
  }

  // If camera is open, show only camera (no upload screen) - Full screen with overlay controls
  if (showCamera) {
  return (
      <View style={styles.cameraContainer}>
        {permission?.granted && (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraFacing}
          >
            {/* Full Screen Guide Overlay */}
            <View style={styles.guideOverlay}>
              {/* Top Dark Area */}
              <View style={styles.darkAreaTop} />
              
              {/* Middle Section with Frame */}
              <View style={styles.middleSection}>
                <View style={styles.darkAreaSide} />
                
                <View style={styles.frameContainer}>
                  {/* Instruction Text Above Frame */}
                  <Text style={styles.instructionTextTop}>
                    Position your eye inside the frame
                  </Text>
                  
                  {/* Square Frame with Grid */}
                  <Animated.View 
                    style={[
                      styles.guideBox,
                      {
                        borderColor: guideColor,
                        transform: [{ scale: pulseAnim }]
                      }
                    ]}
                  >
                    {/* 3x3 Grid Lines */}
                    <View style={[styles.gridLine, styles.gridVertical1, { backgroundColor: guideColor }]} />
                    <View style={[styles.gridLine, styles.gridVertical2, { backgroundColor: guideColor }]} />
                    <View style={[styles.gridLine, styles.gridHorizontal1, { backgroundColor: guideColor }]} />
                    <View style={[styles.gridLine, styles.gridHorizontal2, { backgroundColor: guideColor }]} />
                  </Animated.View>
                  
                  {/* Countdown Below Frame */}
                  {countdown !== null && countdown > 0 && (
                    <Text style={styles.countdownTextLarge}>{countdown}</Text>
                  )}
                  
                  {countdown === 0 && (
                    <Text style={styles.capturingText}>Capturing...</Text>
                  )}
      </View>

                <View style={styles.darkAreaSide} />
        </View>

              {/* Bottom Dark Area */}
              <View style={styles.darkAreaBottom} />
            </View>

            {/* Bottom Control Panel - Overlay at bottom with Gradient */}
            <View style={styles.controlPanelOverlay}>
              <LinearGradient
                colors={['#FFE5B4', '#B3E5FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.controlPanelGradient}
              >
                <View style={styles.controlButtons}>
                  {/* Cancel Button - Red */}
                  <TouchableOpacity
                    style={styles.controlButtonCancel}
                    onPress={() => {
                      cancelAutoCapture()
                      setShowCamera(false)
                      if (route?.params?.source) {
                        navigation.navigate('DashboardScreen')
                      } else {
                        navigation.goBack()
                      }
                    }}
                  >
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Capture Button - Blue */}
                  <TouchableOpacity
                    style={styles.controlButtonCapture}
                    onPress={takePicture}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera" size={28} color="#FFFFFF" />
            </TouchableOpacity>

                  {/* Flip Camera Button - Light Purple */}
              <TouchableOpacity
                    style={styles.controlButtonRotate}
                    onPress={toggleCameraFacing}
                    activeOpacity={0.7}
              >
                    <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
              </LinearGradient>
          </View>
          </CameraView>
        )}
      </View>
    )
  }

  // Show analysis/loading screen when image is captured and loading - Modal Design
  if (imageUri && loading) {
    return (
      <View style={styles.analysisModalOverlay}>
        <View style={styles.analysisModal}>
          {/* Circular Progress Indicator */}
            <View style={styles.circularProgressContainer}>
              <Svg width={200} height={200} style={styles.circularProgress}>
                <Circle
                  cx="100"
                  cy="100"
                  r="85"
                  stroke="#E8E8F0"
                strokeWidth="8"
                  fill="none"
                />
                
                <AnimatedCircle
                  cx="100"
                  cy="100"
                  r="85"
                stroke="#4CAF50"
                strokeWidth="8"
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
              
              <View style={styles.circularProgressCenter}>
                <Text style={styles.circularPercentageText}>
                  {Math.round(loadingProgress)}%
                </Text>
              </View>
            </View>
            
          {/* Main Title */}
          <Text style={styles.analysisModalTitle}>Analysing...</Text>
          
          {/* Descriptive Text */}
          <Text style={styles.analysisModalDescription}>
            Our AI is working in the background to get you accurate, clear results.
            </Text>

          {/* Process Steps */}
            <View style={styles.stepsContainer}>
              <View style={styles.stepItem}>
                <Ionicons 
                  name={loadingProgress >= 30 ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color="#FF9800" 
              />
              <Text style={styles.stepText}>
                Image uploaded
                </Text>
              </View>

              <View style={styles.stepItem}>
                <Ionicons 
                  name={loadingProgress >= 60 ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color="#FF9800" 
              />
              <Text style={styles.stepText}>
                AI processing
                </Text>
              </View>

              <View style={styles.stepItem}>
                <Ionicons 
                  name={loadingProgress >= 90 ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color="#FF9800" 
              />
              <Text style={styles.stepText}>
                Generating results...
                </Text>
              </View>
            </View>
          </View>
      </View>
    )
  }

  // Show error screen when API returns error
  if (error && !loading && errorMessage) {
    return (
      <SafeAreaView style={styles.resultsContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#E1BEE7" />
        <LinearGradient
          colors={['#E1BEE7', '#FFF9C4']}
          style={styles.resultsGradient}
        >
          <ScrollView 
            style={styles.resultsScrollView} 
            contentContainerStyle={styles.errorContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Eye Image Card */}
            {imageUri && (
              <View style={styles.resultImageCard}>
                <Image source={{ uri: imageUri }} style={styles.resultImage} />
                
                {/* Back Button - Top Left */}
                <TouchableOpacity
                  style={styles.resultImageBackButton}
                  onPress={() => {
                    if (route?.params?.source) {
                      navigation.navigate('DashboardScreen')
                    } else {
                      navigation.goBack()
                    }
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Retake Button - Bottom Left */}
                <TouchableOpacity
                  style={styles.resultImageRetakeButton}
                  onPress={async () => {
                    setImageUri(null)
                    setResult(null)
                    setError(null)
                    setErrorMessage(null)
                    setLoading(false)
                    // If came from camera, open camera again. If from gallery, open gallery again
                    const source = photoSource || route?.params?.source
                    if (source === 'camera') {
                      await openCameraWithGuide()
                    } else if (source === 'gallery') {
                      await pickPhoto(false)
                    } else {
                      // Navigate back to dashboard modal to select new photo
                      navigation.navigate('DashboardScreen')
                    }
                  }}
                >
                  <Text style={styles.resultImageRetakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error Card */}
            <View style={styles.errorCard}>
              <View style={styles.errorIconContainer}>
                <Ionicons name="alert-circle" size={64} color="#FF4444" />
              </View>
              
              <Text style={styles.errorTitle}>Analysis Failed</Text>
              
              <Text style={styles.errorMessage}>
                {errorMessage}
              </Text>

              <View style={styles.errorDetailsCard}>
                <View style={styles.errorDetailsHeader}>
                  <Ionicons name="information-circle" size={20} color="#FF9800" />
                  <Text style={styles.errorDetailsTitle}>Possible Reasons:</Text>
                </View>
                <View style={styles.errorDetailsList}>
                  <View style={styles.errorDetailItem}>
                    <Ionicons name="ellipse" size={8} color="#666" style={styles.bulletPoint} />
                    <Text style={styles.errorDetailText}>Image may not be clear or properly focused</Text>
                  </View>
                  <View style={styles.errorDetailItem}>
                    <Ionicons name="ellipse" size={8} color="#666" style={styles.bulletPoint} />
                    <Text style={styles.errorDetailText}>Image may not contain a valid eye photo</Text>
                  </View>
                  <View style={styles.errorDetailItem}>
                    <Ionicons name="ellipse" size={8} color="#666" style={styles.bulletPoint} />
                    <Text style={styles.errorDetailText}>Network connection issue</Text>
                  </View>
                  <View style={styles.errorDetailItem}>
                    <Ionicons name="ellipse" size={8} color="#666" style={styles.bulletPoint} />
                    <Text style={styles.errorDetailText}>Server temporarily unavailable</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.errorRetryButton}
                onPress={() => {
                  setError(null)
                  setErrorMessage(null)
                  if (imageUri) {
                    sendToBackend({ uri: imageUri })
                  } else {
                    setShowImageOptions(true)
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.errorRetryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.errorNewPhotoButton}
                onPress={() => {
                  setImageUri(null)
                  setResult(null)
                  setError(null)
                  setErrorMessage(null)
                  setShowImageOptions(true)
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={20} color="#7475B4" />
                <Text style={styles.errorNewPhotoButtonText}>Take New Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  // Show results screen when analysis is complete - New Design
  if (result && !loading && !error) {
    const toggleSection = (section) => {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }))
    }

    // Extract data from result - Properly map all backend fields
    const getSummary = () => {
      // Try multiple possible field names from backend
      if (result.summary) return result.summary
      if (result.eye_summary) return result.eye_summary
      if (result.why) return result.why
      if (result.description) return result.description
      if (result.analysis_summary) return result.analysis_summary
      // Fallback
      return "Eye appears mostly normal with minor redness and dark circles under the eye."
    }

    const getCondition = () => {
      // Try multiple possible field names
      if (result.condition) return result.condition
      if (result.eye_condition) return result.eye_condition
      if (result.detected_condition) return result.detected_condition
      if (result.condition_name) return result.condition_name
      // Try to extract from main_findings
      if (result.main_findings && Array.isArray(result.main_findings) && result.main_findings[0]) {
        const firstFinding = result.main_findings[0].toLowerCase()
        if (firstFinding.includes('redness')) return "Redness"
        if (firstFinding.includes('dryness')) return "Dryness"
        if (firstFinding.includes('infection')) return "Infection"
        return result.main_findings[0].split(' ')[0] || "Redness"
      }
      return "Redness"
    }

    const getSeverity = () => {
      // Try multiple possible field names
      if (result.severity) return result.severity
      if (result.condition_severity) return result.condition_severity
      if (result.severity_level) return result.severity_level
      // Try to extract from other fields
      if (result.analysis && result.analysis.severity) return result.analysis.severity
      return "Mild"
    }

    const getProbability = () => {
      // Try multiple possible field names
      if (result.probability) return result.probability
      if (result.confidence) return result.confidence
      if (result.confidence_level) return result.confidence_level
      if (result.detection_probability) return result.detection_probability
      // Try to extract from other fields
      if (result.analysis && result.analysis.probability) return result.analysis.probability
      return "High"
    }

    const getMainFindings = () => {
      // Try multiple possible field names
      if (result.main_findings && Array.isArray(result.main_findings)) {
        return result.main_findings
      }
      if (result.findings && Array.isArray(result.findings)) {
        return result.findings
      }
      if (result.key_findings && Array.isArray(result.key_findings)) {
        return result.key_findings
      }
      if (result.detected_conditions && Array.isArray(result.detected_conditions)) {
        return result.detected_conditions
      }
      // If it's a string, split it
      if (result.main_findings && typeof result.main_findings === 'string') {
        return result.main_findings.split(',').map(f => f.trim())
      }
      // Fallback
      return ["Mild redness in the eye", "Dark circles under the eye"]
    }

    const getWhy = () => {
      // Try multiple possible field names
      if (result.why) return result.why
      if (result.reason) return result.reason
      if (result.explanation) return result.explanation
      if (result.why_this_condition) return result.why_this_condition
      // Use summary as fallback
      return getSummary()
    }

    const getSafetyTips = () => {
      // Try multiple possible field names
      if (result.safety_tips) {
        if (Array.isArray(result.safety_tips)) {
          return result.safety_tips.join(', ')
        }
        return result.safety_tips
      }
      if (result.safety_advice) {
        if (Array.isArray(result.safety_advice)) {
          return result.safety_advice.join(', ')
        }
        return result.safety_advice
      }
      if (result.prevention_tips) {
        if (Array.isArray(result.prevention_tips)) {
          return result.prevention_tips.join(', ')
        }
        return result.prevention_tips
      }
      if (result.care_tips) {
        if (Array.isArray(result.care_tips)) {
          return result.care_tips.join(', ')
        }
        return result.care_tips
      }
      // Fallback
      return "Avoid rubbing your eyes, wear sunglasses in sunlight, and take screen breaks every 20 minutes."
    }

    const getHomeRemedies = () => {
      // Try multiple possible field names
      if (result.home_remedies) {
        if (Array.isArray(result.home_remedies)) {
          return result.home_remedies.join(', ')
        }
        return result.home_remedies
      }
      if (result.remedies) {
        if (Array.isArray(result.remedies)) {
          return result.remedies.join(', ')
        }
        return result.remedies
      }
      if (result.treatment) {
        if (Array.isArray(result.treatment)) {
          return result.treatment.join(', ')
        }
        return result.treatment
      }
      if (result.home_treatment) {
        if (Array.isArray(result.home_treatment)) {
          return result.home_treatment.join(', ')
        }
        return result.home_treatment
      }
      // Fallback
      return "cold tea bags or cucumber slices on eyes for 10 minutes daily."
    }

    const getAIGuidance = () => {
      // Try multiple possible field names
      if (result.ai_guidance) return result.ai_guidance
      if (result.recommendation) return result.recommendation
      if (result.recommendations) {
        if (Array.isArray(result.recommendations)) {
          return result.recommendations.join(', ')
        }
        return result.recommendations
      }
      if (result.when_to_see_doctor) return result.when_to_see_doctor
      if (result.doctor_consultation) return result.doctor_consultation
      if (result.medical_advice) return result.medical_advice
      // Fallback
      return "See doctor for eye pain, vision changes or worsening symptoms."
    }

    const getUrgentConsultation = () => {
      // Try multiple possible field names
      if (result.see_doctor_urgently !== undefined) return result.see_doctor_urgently
      if (result.urgent_consultation !== undefined) return result.urgent_consultation
      if (result.urgent_care_needed !== undefined) return result.urgent_care_needed
      if (result.requires_immediate_attention !== undefined) return result.requires_immediate_attention
      // Check severity for urgency
      const severity = getSeverity().toLowerCase()
      if (severity === 'severe' || severity === 'critical') return true
      return false
    }

    return (
      <SafeAreaView style={styles.resultsContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#E1BEE7" />
        <LinearGradient
          colors={['#E1BEE7', '#FFF9C4']}
          style={styles.resultsGradient}
        >
          <ScrollView 
            style={styles.resultsScrollView} 
            showsVerticalScrollIndicator={false}
          >
            {/* Eye Image Card */}
            <View style={styles.resultImageCard}>
              <Image source={{ uri: imageUri }} style={styles.resultImage} />
              
              {/* Back Button - Top Left */}
                <TouchableOpacity
                style={styles.resultImageBackButton}
                onPress={() => {
                  if (route?.params?.source) {
                    navigation.navigate('DashboardScreen')
                  } else {
                    navigation.goBack()
                  }
                }}
              >
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>

              {/* Retake Button - Bottom Left */}
                <TouchableOpacity
                style={styles.resultImageRetakeButton}
                onPress={async () => {
                  setImageUri(null)
                  setResult(null)
                  setError(null)
                  setErrorMessage(null)
                  setLoading(false)
                  // If came from camera, open camera again. If from gallery, open gallery again
                  if (route?.params?.source === 'camera') {
                    await openCameraWithGuide()
                  } else if (route?.params?.source === 'gallery') {
                    await pickPhoto(false)
                  } else {
                    // Navigate back to dashboard modal to select new photo
                    navigation.navigate('DashboardScreen')
                  }
                }}
              >
                <Text style={styles.resultImageRetakeText}>Retake</Text>
                </TouchableOpacity>

              {/* Expand Button - Bottom Right */}
                <TouchableOpacity
                style={styles.resultImageExpandButton}
                onPress={() => {
                  // TODO: Implement full screen image view
                }}
              >
                <Ionicons name="expand" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

            {/* Analysis Report Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultCardHeader}>
                <Ionicons name="eye" size={24} color="#FF4444" />
                <Text style={styles.resultCardTitle}>Analysis Report</Text>
        </View>
              
              <Text style={styles.resultSummaryText}>
                {getSummary()}
              </Text>

              {/* Condition Table */}
              <View style={styles.resultTable}>
                <View style={styles.resultTableRow}>
                  <Text style={styles.resultTableLabel}>Condition:</Text>
                  <Text style={styles.resultTableValueRed}>{getCondition()}</Text>
                </View>
                <View style={styles.resultTableRow}>
                  <Text style={styles.resultTableLabel}>Severity:</Text>
                  <Text style={styles.resultTableValueGreen}>{getSeverity()}</Text>
                </View>
                <View style={styles.resultTableRow}>
                  <Text style={styles.resultTableLabel}>Probability:</Text>
                  <Text style={styles.resultTableValueBlue}>{getProbability()}</Text>
                </View>
              </View>
            </View>

            {/* Main Findings Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultCardHeader}>
                <Ionicons name="search" size={24} color="#9C27B0" />
                <Text style={styles.resultCardTitle}>Main Findings</Text>
              </View>
              
              <View style={styles.mainFindingsList}>
                {getMainFindings().map((finding, index) => (
                  <View key={index} style={styles.mainFindingItem}>
                    <Ionicons name="ellipse" size={8} color="#333" style={styles.bulletPoint} />
                    <Text style={styles.mainFindingText}>{finding}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Why? Section */}
            <View style={styles.resultCard}>
            <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => toggleSection('why')}
                activeOpacity={0.7}
              >
                <View style={styles.collapsibleHeaderLeft}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#9C27B0" />
                  <Text style={styles.collapsibleTitle}>Why?</Text>
              </View>
                <Ionicons 
                  name={expandedSections.why ? "chevron-down" : "chevron-forward"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {expandedSections.why && (
                <Text style={styles.collapsibleContent}>
                  {getWhy()}
                </Text>
              )}
              </View>

            {/* Safety Tips Section */}
            <View style={styles.resultCard}>
            <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => toggleSection('safetyTips')}
                activeOpacity={0.7}
              >
                <View style={styles.collapsibleHeaderLeft}>
                  <Ionicons name="snow" size={24} color="#03A9F4" />
                  <Text style={styles.collapsibleTitle}>Safety Tips</Text>
              </View>
                <Ionicons 
                  name={expandedSections.safetyTips ? "chevron-down" : "chevron-forward"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {expandedSections.safetyTips && (
                <Text style={styles.collapsibleContent}>
                  {getSafetyTips()}
                </Text>
              )}
              </View>

            {/* Home Remedies Section */}
            <View style={styles.resultCard}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => toggleSection('homeRemedies')}
                activeOpacity={0.7}
              >
                <View style={styles.collapsibleHeaderLeft}>
                  <Ionicons name="leaf" size={24} color="#4CAF50" />
                  <Text style={styles.collapsibleTitle}>Home Remedies</Text>
                </View>
                <Ionicons 
                  name={expandedSections.homeRemedies ? "chevron-down" : "chevron-forward"} 
                  size={20} 
                  color="#666" 
                />
            </TouchableOpacity>

              {expandedSections.homeRemedies && (
                <View style={styles.collapsibleContent}>
                  <Text style={styles.collapsibleContent}>
                    {getHomeRemedies()}
                  </Text>
                  <View style={styles.urgentConsultation}>
                    <Ionicons 
                      name={getUrgentConsultation() ? "medical" : "checkmark-circle"} 
                      size={16} 
                      color={getUrgentConsultation() ? "#FF9800" : "#4CAF50"} 
                    />
                    <Text style={styles.urgentConsultationText}>
                      {getUrgentConsultation() ? "Urgent consultation with doctor recommended" : "No urgent consultation needed."}
                    </Text>
            </View>
          </View>
              )}
        </View>

            {/* AI Guidance Section */}
            <View style={styles.resultCard}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => toggleSection('aiGuidance')}
                activeOpacity={0.7}
              >
                <View style={styles.collapsibleHeaderLeft}>
                  <Ionicons name="sparkles" size={24} color="#9C27B0" />
                  <Text style={styles.collapsibleTitle}>AI Guidance</Text>
                </View>
                <Ionicons 
                  name={expandedSections.aiGuidance ? "chevron-down" : "chevron-forward"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {expandedSections.aiGuidance && (
                <Text style={styles.collapsibleContent}>
                  {getAIGuidance()}
                </Text>
              )}
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>
        </LinearGradient>
    </SafeAreaView>
  )
  }

  // Eye Health Scanner Modal - Show when no source param
  return (
    <>
      <Modal
        visible={eyeHealthModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setEyeHealthModalVisible(false)
          navigation.goBack()
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header with Close and Info buttons */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => {
                  setEyeHealthModalVisible(false)
                  const fromScreen = route?.params?.from || 'DashboardScreen'
                  if (fromScreen === 'AiHealthCheckupScreen') {
                    navigation.navigate('AiHealthCheckupScreen')
                  } else {
                    navigation.navigate('DashboardScreen')
                  }
                }}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalInfoButton}
                onPress={() => {
                  setEyeHealthModalVisible(false)
                  setGuidelinesModalVisible(true)
                }}
              >
                <Ionicons name="information-circle" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Eye Icon */}
            <View style={styles.modalIconContainer}>
              <View style={styles.eyeIconCircle}>
                <Image 
                  source={require('../../../assets/AiHealthCheckUp/eye3.png')}
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Eye Health Scanner</Text>

            {/* Description */}
            <Text style={styles.modalDescription}>
              We use smart AI to scan your eye for potential health signs. For the most accurate results, make sure your photo is clear and well-lit.
            </Text>

            {/* Action Buttons */}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={styles.modalButtonGallery}
                onPress={async () => {
                  setEyeHealthModalVisible(false)
                  setPhotoSource('gallery')
                  await pickPhoto(false)
                }}
              >
                <Ionicons name="add" size={32} color="#FF4444" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonCamera}
                onPress={async () => {
                  setEyeHealthModalVisible(false)
                  setPhotoSource('camera')
                  await openCameraWithGuide()
                }}
              >
                <Ionicons name="camera" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Picture Guidelines Modal */}
      <Modal
        visible={guidelinesModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setGuidelinesModalVisible(false)
          setEyeHealthModalVisible(true)
        }}
      >
        <View style={styles.guidelinesModalOverlay}>
          <View style={styles.guidelinesModalContainer}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.guidelinesBackButton}
              onPress={() => {
                setGuidelinesModalVisible(false)
                setEyeHealthModalVisible(true)
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>

            {/* Question Mark Icon */}
            <View style={styles.guidelinesIconContainer}>
              <View style={styles.guidelinesIconCircle}>
                <Text style={styles.guidelinesQuestionMark}>?</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.guidelinesTitle}>Picture Guidelines</Text>

            {/* Instructions List */}
            <View style={styles.guidelinesInstructions}>
              <View style={styles.guidelinesInstructionItem}>
                <Ionicons name="ellipse" size={8} color="#333" style={styles.guidelinesBullet} />
                <Text style={styles.guidelinesInstructionText}>
                  Find a spot with bright, natural light.
                </Text>
              </View>
              <View style={styles.guidelinesInstructionItem}>
                <Ionicons name="ellipse" size={8} color="#333" style={styles.guidelinesBullet} />
                <Text style={styles.guidelinesInstructionText}>
                  Open your eye as wide as possible.
                </Text>
              </View>
              <View style={styles.guidelinesInstructionItem}>
                <Ionicons name="ellipse" size={8} color="#333" style={styles.guidelinesBullet} />
                <Text style={styles.guidelinesInstructionText}>
                  Hold still, we'll capture the image automatically in 5 seconds.
                </Text>
              </View>
              <View style={styles.guidelinesInstructionItem}>
                <Ionicons name="ellipse" size={8} color="#333" style={styles.guidelinesBullet} />
                <Text style={styles.guidelinesInstructionText}>
                  Center your eye inside the box on screen.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    position: "relative",
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  circularPercentageText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
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
    marginTop: 10,
    alignItems: "flex-start",
    width: "100%",
    marginTop: 25,
    paddingHorizontal: 10,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 12,
    fontWeight: "500",
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
  analysisModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  analysisModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analysisModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  analysisModalDescription: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
    paddingHorizontal: 10,
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
    bottom: 0, // Full screen overlay
    justifyContent: "flex-start",
    alignItems: "center",
  },
  darkAreaTop: {
    height: '20%',
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  middleSection: {
    flexDirection: "row",
    width: "100%",
    height: '60%',
    alignItems: "center",
    justifyContent: "center",
  },
  darkAreaSide: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  frameContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 280,
  },
  instructionTextTop: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  guideBox: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    position: "relative",
  },
  gridLine: {
    position: "absolute",
  },
  gridVertical1: {
    width: 1,
    height: "100%",
    left: "33.33%",
  },
  gridVertical2: {
    width: 1,
    height: "100%",
    left: "66.66%",
  },
  gridHorizontal1: {
    width: "100%",
    height: 1,
    top: "33.33%",
  },
  gridHorizontal2: {
    width: "100%",
    height: 1,
    top: "66.66%",
  },
  darkAreaBottom: {
    flex: 1, // Takes remaining space but controls overlay on top
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  countdownTextLarge: {
    fontSize: 64,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 30,
    textAlign: "center",
  },
  capturingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4CAF50",
    marginTop: 30,
    textAlign: "center",
  },
  controlPanelOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 30,
    paddingTop: 20,
  },
  controlPanelGradient: {
    width: "100%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 20,
  },
  controlPanel: {
    // This style is now unused - using controlPanelOverlay and controlPanelGradient instead
    // Keeping for backward compatibility
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
  controlButtonCancel: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonCapture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonRotate: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#9C27B0",
    justifyContent: "center",
    alignItems: "center",
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
  // Error Screen Styles
  errorContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 30,
    marginHorizontal: 15,
    marginTop: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF4444",
    marginBottom: 15,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  errorDetailsCard: {
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  errorDetailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  errorDetailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF9800",
    marginLeft: 8,
  },
  errorDetailsList: {
    marginLeft: 5,
  },
  errorDetailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  errorDetailText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    flex: 1,
    marginLeft: 12,
  },
  errorRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7475B4",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    marginBottom: 15,
  },
  errorRetryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  errorNewPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(116, 117, 180, 0.1)",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(116, 117, 180, 0.3)",
  },
  errorNewPhotoButtonText: {
    color: "#7475B4",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  // Results Screen Styles
  resultsContainer: {
    flex: 1,
  },
  resultsGradient: {
    flex: 1,
  },
  resultsScrollView: {
    flex: 1,
  },
  resultImageCard: {
    width: "100%",
    height: 300,
    borderRadius: 0,
    overflow: "hidden",
    marginBottom: 0,
    position: "relative",
  },
  resultImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  resultImageBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultImageRetakeButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  resultImageRetakeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  resultImageExpandButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  resultCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginLeft: 10,
  },
  resultSummaryText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 15,
  },
  resultTable: {
    marginTop: 10,
  },
  resultTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resultTableLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  resultTableValueRed: {
    fontSize: 14,
    color: "#FF4444",
    fontWeight: "600",
  },
  resultTableValueGreen: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  resultTableValueBlue: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
  mainFindingsList: {
    marginTop: 5,
  },
  mainFindingItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletPoint: {
    marginTop: 6,
    marginRight: 12,
  },
  mainFindingText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    flex: 1,
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  collapsibleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 10,
  },
  collapsibleContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 10,
  },
  urgentConsultation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  urgentConsultationText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  // ===== Eye Health Modal Styles =====
  modalOverlay: {
    flex: 1,
    backgroundColor: '#1E1E1EE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInfoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  eyeIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E0F5',
    borderWidth: 2,
    borderColor: '#9C27B0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  eyeIcon: {
    width: 80,
    height: 80,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 16,
  },
  modalButtonGallery: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCamera: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelinesModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelinesModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    position: 'relative',
  },
  guidelinesBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  guidelinesIconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  guidelinesIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelinesQuestionMark: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  guidelinesTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  guidelinesInstructions: {
    gap: 16,
  },
  guidelinesInstructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  guidelinesBullet: {
    marginTop: 6,
    marginRight: 12,
  },
  guidelinesInstructionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    flex: 1,
    fontFamily: 'Inter',
  },
})

export default EyeScreen