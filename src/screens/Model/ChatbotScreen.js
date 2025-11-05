import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from "../../config/config";

export default function ChatbotScreen({ navigation }) {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([
    {
      ai: "Hello! I'm your AI Health Assistant. How can I help you today? You can ask me about symptoms, medications, or general health questions.",
      isWelcome: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [responses]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Add user message immediately
    const newResponses = [...responses, { user: userMessage }];
    setResponses(newResponses);

    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      // Add AI response
      setResponses([...newResponses, { 
        ai: data.choices[0].message.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      setResponses([...newResponses, { 
        ai: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What are common cold symptoms?",
    "How to reduce fever?",
    "Healthy diet tips",
    "Exercise recommendations"
  ];

  const handleQuickQuestion = (question) => {
    setMessage(question);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2E8B57', '#20B2AA']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.aiAvatar}>
            <Ionicons name="medical" size={24} color="#2E8B57" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <Text style={styles.headerSubtitle}>Always here to help</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {responses.map((r, i) => (
            <Animated.View key={i} style={{ opacity: fadeAnim }}>
              {/* User Message */}
              {r.user && (
                <View style={styles.userMessageContainer}>
                  <View style={styles.userMessage}>
                    <Text style={styles.userMessageText}>{r.user}</Text>
                  </View>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={16} color="#2E8B57" />
                  </View>
                </View>
              )}
              
              {/* AI Message */}
              {r.ai && (
                <View style={styles.aiMessageContainer}>
                  <View style={styles.aiAvatar}>
                    <Ionicons name="medical" size={16} color="#2E8B57" />
                  </View>
                  <View style={[
                    styles.aiMessage,
                    r.isWelcome && styles.welcomeMessage,
                    r.isError && styles.errorMessage
                  ]}>
                    <Text style={[
                      styles.aiMessageText,
                      r.isError && styles.errorMessageText
                    ]}>
                      {r.ai}
                    </Text>
                    {r.timestamp && (
                      <Text style={styles.timestamp}>{r.timestamp}</Text>
                    )}
                  </View>
                </View>
              )}
            </Animated.View>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.aiMessageContainer}>
              <View style={styles.aiAvatar}>
                <Ionicons name="medical" size={16} color="#2E8B57" />
              </View>
              <View style={styles.loadingMessage}>
                <View style={styles.typingIndicator}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Questions */}
        {responses.length === 1 && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionButton}
                  onPress={() => handleQuickQuestion(question)}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Section */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              style={styles.textInput}
              placeholder="Ask me about your health..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!message.trim() || isLoading}
            >
              <LinearGradient
                colors={message.trim() ? ['#2E8B57', '#20B2AA'] : ['#ccc', '#999']}
                style={styles.sendButtonGradient}
              >
                <Ionicons 
                  name={isLoading ? "hourglass" : "send"} 
                  size={20} 
                  color="#fff" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  userMessage: {
    backgroundColor: '#2E8B57',
    borderRadius: 20,
    borderBottomRightRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    marginRight: 8,
  },
  userMessageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E8B57',
  },
  aiMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  aiMessage: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeMessage: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  aiMessageText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  errorMessageText: {
    color: '#D32F2F',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  loadingMessage: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E8B57',
    marginHorizontal: 2,
    opacity: 0.4,
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  quickQuestionButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2E8B57',
  },
  quickQuestionText: {
    color: '#2E8B57',
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 5,
  },
  sendButton: {
    marginLeft: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});