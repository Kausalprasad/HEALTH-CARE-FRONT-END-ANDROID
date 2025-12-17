import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Image,
  Animated,
  PanResponder,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from "../../config/config";

const { width, height } = Dimensions.get('window');

export default function MentalHealthScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const flatListRef = useRef(null);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initSession = async () => {
      try {
        let savedId = await AsyncStorage.getItem("sessionId");
        if (!savedId) {
          savedId = uuid.v4();
          await AsyncStorage.setItem("sessionId", savedId);
        }
        setSessionId(savedId);

        setTimeout(() => {
          setMessages([
            {
              id: "welcome",
              text: "Hey! How are you?",
              sender: "bot",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
          ]);
        }, 500);
      } catch (err) {
        console.error("Failed to initialize sessionId:", err);
        Alert.alert("Error", "Failed to initialize chat session. Please restart the app.");
      }
    };
    initSession();
  }, []);

  // Pan Responder for drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isExpanded && gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        } else if (isExpanded && gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isExpanded && gestureState.dy < -50) {
          expandChat();
        } else if (isExpanded && gestureState.dy > 50) {
          collapseChat();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const expandChat = () => {
    setIsExpanded(true);
    Animated.spring(translateY, {
      toValue: -height * 0.5,
      useNativeDriver: true,
    }).start();
  };

  const collapseChat = () => {
    setIsExpanded(false);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!sessionId) {
      Alert.alert("Error", "Session is not ready yet. Please wait a moment.");
      return;
    }

    const messageText = input;
    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await fetch(`${BASE_URL}/api/mental-health/therapy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId, message: messageText }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        throw new Error("Server did not return JSON");
      }

      setTimeout(() => {
        const botMessage = {
          id: Date.now().toString() + "_bot",
          text: data.reply || "Sorry, I couldn't respond right now.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          text: "Server error. Please try again later.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
      setIsTyping(false);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === "user" ? styles.userMessageContainer : styles.botMessageContainer
    ]}>
      {item.sender === "bot" && (
        <View style={styles.botAvatar}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          item.sender === "user" ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text style={[
          styles.messageText,
          item.sender === "user" ? styles.userMessageText : styles.botMessageText
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessageContainer]}>
      <View style={styles.botAvatar}>
        <Ionicons name="add" size={24} color="#fff" />
      </View>
      <View style={[styles.messageBubble, styles.botMessage, styles.typingMessage]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFFE" />
      
      {/* Header Section with Gradient Background */}
      {!isExpanded && (
        <LinearGradient
          colors={['rgba(31, 168, 231, 0)', 'rgba(31, 168, 231, 0.85)']}
          locations={[0.2425, 1]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.headerGradient}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../../assets/logo1.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              
              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.titleText}>AI</Text>
                <Text style={styles.titleText}>THERAPIST</Text>
              </View>
              
              {/* Description */}
              <Text style={styles.descriptionText}>
                Our AI companion listens, supports, and gently guides you toward mental clarity and emotional balance.
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      )}

      {/* Chat Section */}
      <Animated.View 
        style={[
          styles.chatSection,
          {
            transform: [{ translateY }],
          }
        ]}
      >
        {/* Drag Handle Bar */}
        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          
          <View style={styles.therapistInfo}>
            <View style={styles.therapistAvatar}>
              <Ionicons name="add" size={24} color="#fff" />
            </View>
            <View style={styles.therapistDetails}>
              <Text style={styles.therapistName}>AI Therapist</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.therapistStatus}>Active Now</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          style={styles.messagesWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping ? renderTypingIndicator : null}
          />

          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Send Message"
                placeholderTextColor="#999"
                value={input}
                onChangeText={setInput}
                editable={!!sessionId}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={!sessionId || !input.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={(!sessionId || !input.trim()) ? "#ccc" : "#666"} 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: 90,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoImage: {
    width: 120,
    height: 35,
  },
  titleContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 4,
    lineHeight: 44,
  },
  descriptionText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
    maxWidth: 320,
  },
  chatSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingTop: 0,
  },
  dragHandleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  dragHandle: {
    width: 60,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  therapistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  therapistAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  therapistDetails: {
    justifyContent: 'center',
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
    marginRight: 6,
  },
  therapistStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  messagesWrapper: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
    paddingRight: 50,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
    paddingLeft: 50,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  botMessage: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 6,
  },
  userMessage: {
    backgroundColor: '#B2E5E0',
    borderBottomRightRadius: 6,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userMessageText: {
    color: '#111827',
  },
  botMessageText: {
    color: '#374151',
  },
  typingMessage: {
    paddingVertical: 14,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14B8A6',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    padding: 6,
    marginLeft: 4,
  },
  micButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});