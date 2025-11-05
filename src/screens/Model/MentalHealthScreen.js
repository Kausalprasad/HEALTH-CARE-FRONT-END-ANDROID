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
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from "../../config/config";

const { width, height } = Dimensions.get('window');

export default function MentalHealthScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  // Initialize sessionId
  useEffect(() => {
    const initSession = async () => {
      try {
        let savedId = await AsyncStorage.getItem("sessionId");
        if (!savedId) {
          savedId = uuid.v4();
          await AsyncStorage.setItem("sessionId", savedId);
        }
        setSessionId(savedId);

        // Welcome message with typing animation
        setTimeout(() => {
          setMessages([
            {
              id: "welcome",
              text: "Hello! I'm your AI therapist. How are you feeling today? 🌸",
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

    // Scroll to bottom after sending message
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

      // Simulate typing delay for natural feel
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
    <View style={styles.messageContainer}>
      {item.sender === "bot" && (
        <View style={styles.botAvatar}>
          <Ionicons name="heart-circle" size={24} color="#fff" />
        </View>
      )}
      
      <View
        style={[
          styles.message,
          item.sender === "user" ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text style={[
          styles.messageText,
          item.sender === "user" ? styles.userMessageText : styles.botMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          item.sender === "user" ? styles.userTimestamp : styles.botTimestamp
        ]}>
          {item.timestamp}
        </Text>
      </View>

      {item.sender === "user" && (
        <View style={styles.userAvatar}>
          <Ionicons name="person-circle" size={24} color="#fff" />
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={styles.messageContainer}>
      <View style={styles.botAvatar}>
        <Ionicons name="heart-circle" size={24} color="#fff" />
      </View>
      <View style={[styles.message, styles.botMessage, styles.typingMessage]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
     <View
  style={[styles.header, { backgroundColor: '#B2B3F2' }]}
>
        <View style={styles.headerContent}>
          <View style={styles.therapistInfo}>
            <View style={styles.therapistAvatar}>
              <Ionicons name="heart-circle" size={30} color="#fff" />
            </View>
            <View>
              <Text style={styles.therapistName}>AI Therapist</Text>
              <Text style={styles.therapistStatus}>
                {isTyping ? "Typing..." : "Online"}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatSection}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
        />

        {/* Input Container */}
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your message here..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
              editable={!!sessionId}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: (!sessionId || !input.trim()) ? 0.5 : 1 }
              ]}
              onPress={sendMessage}
              disabled={!sessionId || !input.trim()}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  therapistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  therapistAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  therapistName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  therapistStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  menuButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSection: {
    flex: 1,
  },
  chatContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 20,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#764ba2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 20,
  },
  message: {
    maxWidth: width * 0.75,
    padding: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  userMessage: {
    backgroundColor: '#667eea',
    marginLeft: 'auto',
    borderBottomRightRadius: 6,
  },
  botMessage: {
    backgroundColor: '#fff',
    marginRight: 'auto',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.7,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#888',
  },
  typingMessage: {
    paddingVertical: 12,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginHorizontal: 3,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});