// src/screens/Model/MelanomaScreen.js
import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator 
} from "react-native";
import { CameraView, Camera, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Circle, Line, G, Path } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MelanomaScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState("Connecting to server...");
  const [facing, setFacing] = useState("back");
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [landmarks, setLandmarks] = useState({ face: [], hands: [], pose: [], face_connections: [] });
  const [cameraSize, setCameraSize] = useState({ width: screenWidth, height: screenHeight * 0.8 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cameraRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for live mode
  useEffect(() => {
    if (isCapturing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isCapturing]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // WebSocket Connection
  useEffect(() => {
    connectWebSocket();
    return () => {
      cleanup();
    };
  }, []);

  const connectWebSocket = () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      console.log("🔌 Connecting to WebSocket...");
      setResult("Connecting to server...");
      setIsProcessing(true);
      
      wsRef.current = new WebSocket("ws://192.168.1.16:8080");

      wsRef.current.onopen = () => {
        console.log("✅ Connected to Python server");
        setResult("Connected! Ready for DENSE MESH scan...");
        setIsConnected(true);
        setIsProcessing(false);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          setIsProcessing(false);
          
          if (data.error) {
            console.log("❌ Server error:", data.error);
            setResult("Processing error occurred");
            return;
          }
          
          if (data.prediction && data.confidence !== undefined) {
            const confidencePercent = Math.round(data.confidence * 100);
            setResult(`${data.prediction} (${confidencePercent}%)`);
            console.log(`📊 Result: ${data.prediction} ${confidencePercent}%`);
          }
          
          if (data.landmarks && showLandmarks) {
            setLandmarks(data.landmarks);
            const faceCount = data.landmarks.face?.length || 0;
            const connectionsCount = data.landmarks.face_connections?.length || 0;
            const handsCount = data.landmarks.hands?.length || 0;
            const poseCount = data.landmarks.pose?.length || 0;
            console.log(`🔥 DENSE MESH: ${faceCount} face points, ${connectionsCount} WHITE connections, ${handsCount} hands, ${poseCount} pose`);
          }
          
        } catch (e) {
          console.log("❌ Invalid server response:", msg.data);
          setResult("Invalid server response");
          setIsProcessing(false);
        }
      };

      wsRef.current.onerror = (e) => {
        console.log("❌ WebSocket error:", e.message);
        setResult("Connection error");
        setIsConnected(false);
        setIsProcessing(false);
      };

      wsRef.current.onclose = () => {
        console.log("🔌 WebSocket closed");
        setResult("Disconnected. Reconnecting...");
        setIsConnected(false);
        setLandmarks({ face: [], hands: [], pose: [], face_connections: [] });
        setIsProcessing(true);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

    } catch (error) {
      console.log("❌ Connection failed:", error);
      setResult("Failed to connect. Retrying...");
      setIsConnected(false);
      setIsProcessing(true);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const toggleAutoCapture = () => {
    if (!isConnected) {
      Alert.alert("Not Connected", "Please wait for server connection", [
        { text: "OK", style: "default" }
      ]);
      return;
    }

    if (isCapturing) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsCapturing(false);
      setResult("Real-time stopped");
      setLandmarks({ face: [], hands: [], pose: [], face_connections: [] });
    } else {
      intervalRef.current = setInterval(() => {
        captureFrame();
      }, 800);
      setIsCapturing(true);
      setResult("🔥 OPTIMIZED MESH LIVE SCANNING...");
    }
  };

  const toggleCameraFacing = () => {
    try {
      const newFacing = facing === "back" ? "front" : "back";
      console.log(`🔄 Switching to ${newFacing} camera`);
      setFacing(newFacing);
      setIsReady(false);
      setLandmarks({ face: [], hands: [], pose: [], face_connections: [] });
    } catch (error) {
      console.log("❌ Camera switch error:", error);
      Alert.alert("Camera Error", "Unable to switch camera");
    }
  };

  const toggleLandmarks = () => {
    const newState = !showLandmarks;
    setShowLandmarks(newState);
    console.log(`👁️ DENSE MESH: ${newState ? 'ON' : 'OFF'}`);
    
    if (!newState) {
      setLandmarks({ face: [], hands: [], pose: [], face_connections: [] });
    }
  };

  const captureFrame = async () => {
    if (!isReady || !isConnected) {
      if (!isCapturing) {
        Alert.alert("Not Ready", "Camera not ready or server not connected");
      }
      return;
    }

    if (cameraRef.current && wsRef.current?.readyState === 1) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({ 
          base64: true, 
          quality: 0.6,
          skipProcessing: true,
          imageType: 'jpg'
        });
        
        if (photo && photo.base64) {
          const request = {
            image: photo.base64,
            return_landmarks: showLandmarks,
            image_width: photo.width || 640,
            image_height: photo.height || 480
          };
          
          wsRef.current.send(JSON.stringify(request));
          console.log(`📸 Frame sent for DENSE MESH (landmarks: ${showLandmarks})`);
          
          if (!isCapturing) {
            setResult("Processing...");
          }
        }
      } catch (e) {
        console.log("❌ Capture error:", e);
        setIsProcessing(false);
        if (!isCapturing) {
          Alert.alert("Capture Error", "Failed to take picture");
        }
      }
    }
  };

  const onCameraReady = () => {
    console.log(`📷 Camera ready: ${facing}`);
    setIsReady(true);
  };

  const onCameraLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setCameraSize({ width, height });
    console.log(`📏 Camera size: ${width}x${height}`);
  };

  // DENSE WHITE FACE MESH RENDERER
  const renderDenseFaceMesh = () => {
    if (!showLandmarks || !landmarks.face_connections || landmarks.face_connections.length === 0) {
      return null;
    }

    console.log(`🔥 Rendering ${landmarks.face_connections.length} DENSE WHITE connections`);

    return landmarks.face_connections.map((connection, index) => {
      const [startIdx, endIdx] = connection;
      
      // Check if landmarks exist
      if (!landmarks.face || 
          !landmarks.face[startIdx] || 
          !landmarks.face[endIdx] ||
          startIdx >= landmarks.face.length ||
          endIdx >= landmarks.face.length) {
        return null;
      }

      const startPoint = landmarks.face[startIdx];
      const endPoint = landmarks.face[endIdx];
      
      return (
        <Line
          key={`dense-mesh-${index}`}
          x1={startPoint.x * cameraSize.width}
          y1={startPoint.y * cameraSize.height}
          x2={endPoint.x * cameraSize.width}
          y2={endPoint.y * cameraSize.height}
          stroke="#FFFFFF"              // PURE WHITE
          strokeWidth="0.8"             // Thicker for visibility
          opacity="0.95"                // High opacity
          strokeLinecap="round"         // Smooth line ends
        />
      );
    }).filter(Boolean);
  };

  // FACE DOTS (selective for clarity)
  const renderFaceDots = () => {
    if (!showLandmarks || !landmarks.face || landmarks.face.length === 0) {
      return null;
    }

    // Show only key facial points to avoid clutter
    const keyPoints = [
      ...Array.from({length: 17}, (_, i) => i),    // Face outline
      ...Array.from({length: 10}, (_, i) => i + 17), // Eyebrows
      ...Array.from({length: 12}, (_, i) => i + 36), // Eyes
      ...Array.from({length: 20}, (_, i) => i + 48), // Lips
      30, 31, 32, 33, 34, 35                        // Nose
    ];

    return keyPoints.map((index) => {
      if (index >= landmarks.face.length) return null;
      
      const point = landmarks.face[index];
      
      // Color coding for different features
      let color = "#FFFFFF";      // Default white
      let radius = 1.5;
      
      if (index >= 36 && index <= 47) {          // Eyes
        color = "#00FFFF";
        radius = 2;
      } else if (index >= 48 && index <= 67) {   // Lips
        color = "#FF69B4";
        radius = 2;
      } else if (index >= 17 && index <= 26) {   // Eyebrows
        color = "#90EE90";
        radius = 1.8;
      } else if (index >= 27 && index <= 35) {   // Nose
        color = "#FFD700";
        radius = 1.8;
      }
      
      return (
        <Circle
          key={`face-dot-${index}`}
          cx={point.x * cameraSize.width}
          cy={point.y * cameraSize.height}
          r={radius}
          fill={color}
          opacity="0.9"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.3"
        />
      );
    }).filter(Boolean);
  };

  const createHandConnections = (handLandmarks) => {
    if (!handLandmarks || handLandmarks.length < 21) return [];
    
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17]
    ];
    
    return connections.map((connection, index) => {
      const [start, end] = connection;
      if (handLandmarks[start] && handLandmarks[end]) {
        return (
          <Line
            key={`hand-connection-${index}`}
            x1={handLandmarks[start].x * cameraSize.width}
            y1={handLandmarks[start].y * cameraSize.height}
            x2={handLandmarks[end].x * cameraSize.width}
            y2={handLandmarks[end].y * cameraSize.height}
            stroke="#00FFFF"
            strokeWidth="1.5"
            opacity="0.8"
          />
        );
      }
      return null;
    }).filter(Boolean);
  };

  const renderLandmarks = () => {
    if (!showLandmarks) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg 
          width={cameraSize.width} 
          height={cameraSize.height}
          style={StyleSheet.absoluteFillObject}
        >
          <G>
            {/* DENSE WHITE FACE MESH - Main Feature */}
            {renderDenseFaceMesh()}
            
            {/* Key Face Points */}
            {renderFaceDots()}
            
            {/* Hand landmarks */}
            {landmarks.hands?.map((hand, handIndex) => {
              const connections = createHandConnections(hand);
              return (
                <G key={`hand-group-${handIndex}`}>
                  {connections}
                  {hand.map((point, pointIndex) => {
                    const isFingerTip = [4, 8, 12, 16, 20].includes(pointIndex);
                    const radius = isFingerTip ? 3.5 : 2.5;
                    const color = handIndex === 0 ? 
                      (isFingerTip ? "#FFD700" : "#FFA500") : 
                      (isFingerTip ? "#00FFFF" : "#0080FF");
                    
                    return (
                      <Circle
                        key={`hand-${handIndex}-${pointIndex}`}
                        cx={point.x * cameraSize.width}
                        cy={point.y * cameraSize.height}
                        r={radius}
                        fill={color}
                        opacity="0.9"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </G>
              );
            })}
            
            {/* Pose landmarks */}
            {landmarks.pose?.map((point, index) => {
              let radius = 3;
              let color = "#FF00FF";
              
              if ([0, 11, 12, 13, 14, 15, 16, 23, 24].includes(index)) {
                radius = 4;
                color = "#FF1493";
              }
              
              return (
                <Circle
                  key={`pose-${index}`}
                  cx={point.x * cameraSize.width}
                  cy={point.y * cameraSize.height}
                  r={radius}
                  fill={color}
                  opacity="0.85"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.5"
                />
              );
            })}
          </G>
        </Svg>
      </View>
    );
  };

  const getStatusColor = () => {
    if (!isConnected) return "#e74c3c";
    if (isCapturing) return "#00d2d3";
    if (result.toLowerCase().includes("malignant")) return "#e74c3c";
    if (result.toLowerCase().includes("indeterminate")) return "#f39c12";
    if (result.toLowerCase().includes("benign")) return "#27ae60";
    return "#3498db";
  };

  const getResultIcon = () => {
    if (isProcessing) return "hourglass-outline";
    if (result.toLowerCase().includes("malignant")) return "warning";
    if (result.toLowerCase().includes("indeterminate")) return "help-circle";
    if (result.toLowerCase().includes("benign")) return "checkmark-circle";
    if (isCapturing) return "radio-button-on";
    return "information-circle";
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
        <ActivityIndicator size="large" color="#00d2d3" />
        <Text style={styles.loadingText}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ecf0f1" />
        <Animated.View style={[styles.permissionContent, { opacity: fadeAnim }]}>
          <View style={styles.permissionIconContainer}>
            <Ionicons name="camera-outline" size={100} color="#00d2d3" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSubtitle}>
            We need camera access to perform melanoma detection and show DENSE WHITE MESH landmarks for advanced analysis
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Ionicons name="camera" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={onCameraReady}
        onLayout={onCameraLayout}
        animateShutter={false}
      />
      
      {renderLandmarks()}
      
      <View style={styles.overlay}>
        {/* Enhanced Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerTop}>
            <View style={[styles.connectionStatus, { borderColor: getStatusColor() }]}>
              <View style={[styles.connectionDot, { backgroundColor: isConnected ? "#27ae60" : "#e74c3c" }]} />
              <Text style={styles.connectionText}>
                {isConnected ? "CONNECTED" : "DISCONNECTED"}
              </Text>
            </View>
            
            <View style={styles.cameraInfo}>
              <Ionicons name={facing === "back" ? "camera" : "camera-reverse"} size={16} color="#fff" />
              <Text style={styles.cameraText}>{facing.toUpperCase()}</Text>
            </View>
          </View>
          
          {isCapturing && (
            <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>🔥 DENSE MESH LIVE</Text>
            </Animated.View>
          )}
          
          {showLandmarks && (
            <View style={styles.landmarksInfo}>
              <Text style={styles.landmarksText}>
                ⚪ DENSE WHITE MESH ACTIVE
              </Text>
              <Text style={styles.landmarksCount}>
                Face: {landmarks.face?.length || 0} • Connections: {landmarks.face_connections?.length || 0} • Hands: {landmarks.hands?.length || 0} • Pose: {landmarks.pose?.length || 0}
              </Text>
            </View>
          )}
        </Animated.View>
        
        {/* Enhanced Footer */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          {/* Result Display */}
          <View style={[styles.resultPanel, { 
            backgroundColor: `${getStatusColor()}15`, 
            borderColor: getStatusColor() 
          }]}>
            <View style={styles.resultHeader}>
              <Ionicons name={getResultIcon()} size={20} color={getStatusColor()} />
              {isProcessing && <ActivityIndicator size="small" color={getStatusColor()} style={styles.processingIcon} />}
            </View>
            <Text style={[styles.resultText, { color: getStatusColor() }]}>
              {result}
            </Text>
          </View>
          
          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            {/* Camera Switch */}
            <TouchableOpacity 
              style={[styles.controlBtn, styles.secondaryBtn]}
              onPress={toggleCameraFacing}
              disabled={!isReady}
            >
              <Ionicons name="camera-reverse" size={24} color="#fff" />
              <Text style={styles.btnLabel}>Flip</Text>
            </TouchableOpacity>
            
            {/* Main Capture Button */}
            <Animated.View style={{ transform: [{ scale: isCapturing ? pulseAnim : 1 }] }}>
              <TouchableOpacity 
                style={[
                  styles.controlBtn, 
                  styles.primaryBtn, 
                  isCapturing && styles.activeBtn,
                  (!isReady || !isConnected) && styles.disabledBtn
                ]} 
                onPress={isCapturing ? toggleAutoCapture : captureFrame}
                disabled={!isReady || !isConnected}
              >
                <Ionicons 
                  name={isCapturing ? "stop" : "camera"} 
                  size={28} 
                  color="#fff" 
                />
                <Text style={[styles.btnLabel, styles.primaryBtnLabel]}>
                  {isCapturing ? "Stop" : "Scan"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Live Mode Toggle */}
            <TouchableOpacity 
              style={[
                styles.controlBtn,
                styles.secondaryBtn,
                isCapturing && styles.activeBtn,
                (!isReady || !isConnected) && styles.disabledBtn
              ]} 
              onPress={toggleAutoCapture}
              disabled={!isReady || !isConnected}
            >
              <Ionicons 
                name={isCapturing ? "pause" : "play"} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.btnLabel}>
                {isCapturing ? "Pause" : "Live"}
              </Text>
            </TouchableOpacity>

            {/* Dense Mesh Toggle */}
            <TouchableOpacity 
              style={[
                styles.controlBtn,
                styles.secondaryBtn,
                showLandmarks && styles.meshActiveBtn
              ]} 
              onPress={toggleLandmarks}
            >
              <Ionicons 
                name={showLandmarks ? "grid" : "grid-outline"} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.btnLabel}>
                Mesh
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#000' 
  },
  camera: { 
    flex: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  loadingText: {
    color: '#ecf0f1',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 20,
  },
  permissionContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 75,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#00d2d3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonIcon: {
    marginRight: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  cameraText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 10,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
    marginRight: 10,
  },
  liveText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  landmarksInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  landmarksText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  landmarksCount: {
    color: '#333',
    fontSize: 12,
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  resultPanel: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  processingIcon: {
    marginLeft: 8,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    minWidth: 65,
    minHeight: 65,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryBtn: {
    backgroundColor: "#00d2d3",
    padding: 16,
    minWidth: 75,
    minHeight: 75,
  },
  secondaryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  activeBtn: {
    backgroundColor: "#e74c3c",
  },
  meshActiveBtn: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  disabledBtn: {
    opacity: 0.4,
    elevation: 0,
    shadowOpacity: 0,
  },
  btnLabel: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  primaryBtnLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});