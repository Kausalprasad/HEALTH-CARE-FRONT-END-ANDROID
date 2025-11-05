import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import Svg, { Circle } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const { width } = Dimensions.get('window')

// API URL for dental analysis
const API_URL = "https://pck5gogvokeykzh2iyeo7x7wrq0yipxg.lambda-url.ap-south-1.on.aws/analyze"

const DentalCheckScreen = ({ navigation }) => {
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
      console.log(`Dental ${fromCamera ? 'Camera' : 'Gallery'} selected`)

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

      console.log('Launching dental image picker...')

      let result
      if (fromCamera) {
        result = await ImagePicker.launchCameraAsync(options)
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options)
      }

      console.log('Dental image picker result:', {
        canceled: result.canceled,
        hasAssets: !!result.assets,
        assetsLength: result.assets?.length
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        console.log('Dental image selected:', {
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
        console.log('Dental image picker canceled')
        setShowImageOptions(false)
      }
    } catch (error) {
      console.error('Dental image picker error:', error)
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
    console.log('Sending dental image to backend:', imageSource)
    console.log('Dental API Endpoint:', API_URL)

    setLoading(true)
    startProgressSimulation()
    
    try {
      const formData = new FormData()
      const uriParts = imageSource.split('.')
      const fileType = uriParts[uriParts.length - 1].toLowerCase()
      const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg'
      
      console.log('Dental file info:', { fileType, mimeType })

      formData.append('file', {
        uri: imageSource,
        name: `teeth_${Date.now()}.${fileType}`,
        type: mimeType,
      })

      console.log('Making dental analysis API request...')

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Dental API response status:', response.status)
      console.log('Dental API response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Dental API error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Dental API Response:', JSON.stringify(data, null, 2))

      if (data && data.success) {
        completeProgress()
        setTimeout(() => {
          setResult(data)
        }, 500)
      } else if (data && data.error) {
        // Backend returned an error
        throw new Error(data.error)
      } else {
        throw new Error('Empty response from dental analysis server')
      }

    } catch (error) {
      console.error('Dental API Error:', error)
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      
      let errorMessage = 'Network error occurred'
      
      // Check for specific error messages
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Network request failed. Please check:\n\n1. Your internet connection\n2. The API URL is correct\n3. The server is running\n4. Try with a different image or smaller file size'
      } else if (error.message.includes('property name enclosed in double quotes')) {
        errorMessage = 'Backend processing error. The image may not be suitable for dental analysis. Please try a clearer photo showing your teeth.'
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Check your internet connection.'
      } else if (error.message.includes('HTTP error')) {
        errorMessage = 'Server error occurred. Please try again later.'
      } else if (error.message) {
        // Use the actual error message from backend
        errorMessage = error.message
      }

      Alert.alert('Dental Analysis Failed', errorMessage)
      setResult({ error: errorMessage })
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'immediate':
        return '#F44336'
      case 'urgent':
        return '#FF9800'
      case 'routine':
        return '#4CAF50'
      default:
        return '#7475B4'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'
    if (score >= 60) return '#FF9800'
    return '#F44336'
  }

  const renderValue = (value, key) => {
    if (value === null || value === undefined) return null

    if (key === 'dental_summary') {
      return (
        <View key={key} style={{ marginTop: 8 }}>
          <Text style={styles.resultSectionTitle}>Dental Summary:</Text>
          <Text style={styles.resultDetailText}>{value}</Text>
        </View>
      )
    }

    if (key === 'oral_hygiene_score') {
      const color = getScoreColor(value)
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>Oral Hygiene Score:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="star" size={16} color={color} />
            <Text style={[styles.resultDetailText, { marginLeft: 8, fontWeight: '600', color }]}>
              {value}/100
            </Text>
          </View>
        </View>
      )
    }

    if (key === 'dental_health_score') {
      const color = getScoreColor(value)
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>Dental Health Score:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="fitness" size={16} color={color} />
            <Text style={[styles.resultDetailText, { marginLeft: 8, fontWeight: '600', color }]}>
              {value}/100
            </Text>
          </View>
        </View>
      )
    }

    if (key === 'systemic_health_score') {
      const color = getScoreColor(value)
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>Systemic Health Score:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="heart" size={16} color={color} />
            <Text style={[styles.resultDetailText, { marginLeft: 8, fontWeight: '600', color }]}>
              {value}/100
            </Text>
          </View>
        </View>
      )
    }

    if (key === 'dental_conditions' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Dental Conditions:</Text>
          {value.map((condition, index) => (
            <View key={index} style={styles.diseaseItem}>
              <View style={styles.diseaseHeader}>
                <Ionicons name="medical" size={20} color="#FF9800" />
                <Text style={[styles.diseaseTitle, { color: "#FF9800" }]}>
                  {condition.condition}
                </Text>
              </View>
              
              <View style={styles.remediesSection}>
                <View style={styles.remedyGroup}>
                  <Text style={styles.remedyTitle}>
                    <Ionicons name="stats-chart" size={14} color="#7475B4" /> Severity:
                  </Text>
                  <Text style={[styles.remedyText, { marginLeft: 16, textTransform: 'capitalize' }]}>
                    {condition.severity}
                  </Text>
                </View>

                <View style={styles.remedyGroup}>
                  <Text style={styles.remedyTitle}>
                    <Ionicons name="pulse" size={14} color="#7475B4" /> Probability:
                  </Text>
                  <Text style={[styles.remedyText, { marginLeft: 16, textTransform: 'capitalize' }]}>
                    {condition.probability}
                  </Text>
                </View>

                {condition.visible_signs && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="eye" size={14} color="#2196F3" /> Visible Signs:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{condition.visible_signs}</Text>
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

                {condition.home_care && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="home" size={14} color="#4CAF50" /> Home Care:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{condition.home_care}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'systemic_health_alerts' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Systemic Health Alerts:</Text>
          {value.map((alert, index) => (
            <View key={index} style={styles.diseaseItem}>
              <View style={styles.diseaseHeader}>
                <Ionicons name="warning" size={20} color="#F44336" />
                <Text style={[styles.diseaseTitle, { color: "#F44336" }]}>
                  {alert.organ_system}
                </Text>
              </View>
              
              <View style={styles.remediesSection}>
                <View style={styles.remedyGroup}>
                  <Text style={styles.remedyTitle}>
                    <Ionicons name="alert-circle" size={14} color="#7475B4" /> Risk Level:
                  </Text>
                  <Text style={[styles.remedyText, { marginLeft: 16, textTransform: 'capitalize' }]}>
                    {alert.risk_level}
                  </Text>
                </View>

                {alert.indicators && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="pulse" size={14} color="#7475B4" /> Indicators:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{alert.indicators}</Text>
                  </View>
                )}

                {alert.explanation && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="information-circle" size={14} color="#2196F3" /> Explanation:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{alert.explanation}</Text>
                  </View>
                )}

                {alert.recommendation && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="clipboard" size={14} color="#4CAF50" /> Recommendation:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{alert.recommendation}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'lifestyle_indicators' && typeof value === 'object') {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Lifestyle Indicators:</Text>
          <View style={styles.diseaseItem}>
            {value.smoking_detected !== undefined && (
              <View style={styles.remedyGroup}>
                <Text style={styles.remedyTitle}>
                  <Ionicons name="fitness" size={14} color={value.smoking_detected ? "#F44336" : "#4CAF50"} /> Smoking Detected:
                </Text>
                <Text style={[styles.remedyText, { marginLeft: 16, color: value.smoking_detected ? "#F44336" : "#4CAF50" }]}>
                  {value.smoking_detected ? "Yes" : "No"}
                </Text>
                {value.signs && (
                  <Text style={[styles.remedyText, { marginLeft: 16, marginTop: 4, fontStyle: 'italic' }]}>
                    {value.signs}
                  </Text>
                )}
              </View>
            )}

            {value.bruxism_grinding !== undefined && (
              <View style={styles.remedyGroup}>
                <Text style={styles.remedyTitle}>
                  <Ionicons name="moon" size={14} color={value.bruxism_grinding ? "#FF9800" : "#4CAF50"} /> Teeth Grinding:
                </Text>
                <Text style={[styles.remedyText, { marginLeft: 16 }]}>
                  {value.bruxism_grinding ? "Detected" : "Not Detected"}
                </Text>
              </View>
            )}

            {value.diet_quality && (
              <View style={styles.remedyGroup}>
                <Text style={styles.remedyTitle}>
                  <Ionicons name="restaurant" size={14} color="#7475B4" /> Diet Quality:
                </Text>
                <Text style={[styles.remedyText, { marginLeft: 16, textTransform: 'capitalize' }]}>
                  {value.diet_quality}
                </Text>
              </View>
            )}

            {value.oral_hygiene && (
              <View style={styles.remedyGroup}>
                <Text style={styles.remedyTitle}>
                  <Ionicons name="water" size={14} color="#7475B4" /> Oral Hygiene:
                </Text>
                <Text style={[styles.remedyText, { marginLeft: 16, textTransform: 'capitalize' }]}>
                  {value.oral_hygiene}
                </Text>
              </View>
            )}
          </View>
        </View>
      )
    }

    if (key === 'recommended_routine' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Recommended Routine:</Text>
          {value.map((routine, index) => (
            <View key={index} style={styles.diseaseItem}>
              <View style={styles.diseaseHeader}>
                <Ionicons name="calendar" size={20} color="#4CAF50" />
                <Text style={[styles.diseaseTitle, { color: "#4CAF50" }]}>
                  {routine.step}
                </Text>
              </View>
              
              <View style={styles.remediesSection}>
                <View style={styles.remedyGroup}>
                  <Text style={styles.remedyTitle}>
                    <Ionicons name="time" size={14} color="#7475B4" /> Frequency:
                  </Text>
                  <Text style={[styles.remedyText, { marginLeft: 16 }]}>{routine.frequency}</Text>
                </View>

                {routine.instructions && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="document-text" size={14} color="#4CAF50" /> Instructions:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{routine.instructions}</Text>
                  </View>
                )}

                {routine.products && (
                  <View style={styles.remedyGroup}>
                    <Text style={styles.remedyTitle}>
                      <Ionicons name="flask" size={14} color="#7475B4" /> Products:
                    </Text>
                    <Text style={[styles.remedyText, { marginLeft: 16 }]}>{routine.products}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'immediate_actions' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>⚠️ Immediate Actions:</Text>
          {value.map((action, i) => (
            <View key={i} style={styles.remedyItem}>
              <Ionicons name="alert" size={14} color="#F44336" style={{ marginTop: 4, marginRight: 8 }} />
              <Text style={[styles.remedyText, { fontWeight: '600' }]}>{action}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'preventive_tips' && Array.isArray(value)) {
      return (
        <View key={key} style={styles.diseaseSection}>
          <Text style={styles.resultSectionTitle}>Preventive Tips:</Text>
          {value.map((tip, i) => (
            <View key={i} style={styles.remedyItem}>
              <Ionicons name="shield-checkmark" size={14} color="#4CAF50" style={{ marginTop: 4, marginRight: 8 }} />
              <Text style={styles.remedyText}>{tip}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'ingredients_to_use' && Array.isArray(value)) {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>✅ Ingredients to Use:</Text>
          {value.map((ingredient, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" style={{ marginTop: 4, marginRight: 8 }} />
              <Text style={styles.resultDetailText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'things_to_avoid' && Array.isArray(value)) {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>❌ Things to Avoid:</Text>
          {value.map((thing, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="close-circle" size={14} color="#F44336" style={{ marginTop: 4, marginRight: 8 }} />
              <Text style={styles.resultDetailText}>{thing}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'see_doctor_for' && Array.isArray(value)) {
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>🏥 See Doctor For:</Text>
          {value.map((reason, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="medical" size={14} color="#FF9800" style={{ marginTop: 4, marginRight: 8 }} />
              <Text style={styles.resultDetailText}>{reason}</Text>
            </View>
          ))}
        </View>
      )
    }

    if (key === 'see_dentist_urgency') {
      const urgencyColor = getUrgencyColor(value)
      return (
        <View key={key} style={{ marginTop: 12 }}>
          <Text style={styles.resultSectionTitle}>Dentist Visit Urgency:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="time" size={16} color={urgencyColor} />
            <Text style={[styles.resultDetailText, { color: urgencyColor, fontWeight: '600', marginLeft: 8, textTransform: 'uppercase' }]}>
              {value}
            </Text>
          </View>
        </View>
      )
    }

    // Skip these keys from rendering
    if (key === 'success' || key === 'note' || key === 'user_concerns' || key === 'tokens_used') {
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

    return null
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

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="medkit" size={32} color="#7475B4" />
          <Text style={styles.resultTitle}>Dental Analysis Report</Text>
        </View>

        <View style={styles.resultContent}>
          {Object.entries(result).map(([key, value]) => renderValue(value, key))}
          
          <View style={styles.disclaimerBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#FF9800" />
            <Text style={styles.disclaimerText}>
              {result.note || "AI guidance - consult a dentist for personalized care."}
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
        <Text style={styles.headerTitle}>Dental Analysis</Text>
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
            Our AI analyzes your teeth and oral health to detect various dental conditions. 
            For best results, take a clear photo showing your teeth and gums in good lighting.
          </Text>
        </View>

        {/* Upload Section */}
        {!imageUri ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="camera-outline" size={64} color="#7475B4" />
            </View>
            <Text style={styles.uploadTitle}>Upload Your Dental Photo</Text>
            <Text style={styles.uploadSubtitle}>
              Take a clear photo of your teeth or choose from gallery
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
                <Ionicons name="medkit" size={48} color="#7475B4" />
                <Text style={styles.circularPercentageText}>
                  {Math.round(loadingProgress)}%
                </Text>
              </View>
            </View>
            
            <Text style={styles.loadingText}>Analyzing your dental photo...</Text>
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
              <Text style={styles.tipText}>Show both teeth and gums clearly</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Smile naturally to expose teeth</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Avoid shadows and ensure clear focus</Text>
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
                <Text style={styles.optionSubtitle}>Use camera to capture dental photo</Text>
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
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
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
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
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
    shadowColor: "#7475B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
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

export default DentalCheckScreen