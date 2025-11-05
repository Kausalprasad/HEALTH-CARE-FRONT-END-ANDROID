// App.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from "../../config/config"

const { width } = Dimensions.get('window');

// Enhanced emotions array with PNG icons
// Step 1: Add your PNG files in assets/emotions/ folder
const emotions = [
  { 
    id: 'happy', 
    label: 'Happy', 
    emoji: '😊', // Keep as fallback
    icon: require('../../../assets/emotions/happy.png'), // Your PNG path
    color: '#FFD93D' 
  },
  { 
    id: 'sad', 
    label: 'Sad', 
    emoji: '😢', 
    icon: require('../../../assets/emotions/sad.png'),
    color: '#4A90E2' 
  },
  { 
    id: 'worried', 
    label: 'Worried', 
    emoji: '😟', 
    icon: require('../../../assets/emotions/Worried.png'),
    color: '#9B59B6' 
  },
  { 
    id: 'stressed', 
    label: 'Stressed', 
    emoji: '😤', 
    icon: require('../../../assets/emotions/Stressed.png'),
    color: '#E74C3C' 
  },
  { 
    id: 'low_energy', 
    label: 'Low Energy', 
    emoji: '😴', 
    icon: require('../../../assets/emotions/Low Energy.png'),
    color: '#95A5A6' 
  },
  { 
    id: 'confident', 
    label: 'Confident', 
    emoji: '😎', 
    icon: require('../../../assets/emotions/Confident.png'),
    color: '#2ECC71' 
  },
  { 
    id: 'angry', 
    label: 'Angry', 
    emoji: '😡', 
    icon: require('../../../assets/emotions/Angry.png'),
    color: '#FF5722' 
  },
  { 
    id: 'overwhelmed', 
    label: 'Overwhelmed', 
    emoji: '🤯', 
    icon: require('../../../assets/emotions/Overwhelmed.png'),
    color: '#FF9800' 
  },
  { 
    id: 'calm', 
    label: 'Calm', 
    emoji: '😌', 
    icon: require('../../../assets/emotions/Calm.png'),
    color: '#00BCD4' 
  },
  { 
    id: 'confused', 
    label: 'Confused', 
    emoji: '😕', 
    icon: require('../../../assets/emotions/Confused.png'),
    color: '#795548' 
  },
];

// Comprehensive recommendations for all emotions
const recommendations = {
  happy: [
    { icon: '🎉', text: 'Share your happiness with others' },
    { icon: '📸', text: 'Capture this moment with photos' },
    { icon: '🎨', text: 'Do something creative' },
    { icon: '🌟', text: 'Plan something exciting for tomorrow' },
    { icon: '💝', text: 'Do something kind for someone else' },
  ],
  sad: [
    { icon: '🛁', text: 'Take a warm shower or bath' },
    { icon: '📝', text: 'Write down your feelings for 5 minutes' },
    { icon: '👥', text: 'Reach out to a close friend' },
    { icon: '🎵', text: 'Play some uplifting music' },
    { icon: '🤗', text: 'Practice self-compassion' },
  ],
  worried: [
    { icon: '🧘', text: 'Practice deep breathing for 10 minutes' },
    { icon: '📋', text: 'Make a list of your concerns' },
    { icon: '☎️', text: 'Talk to someone you trust' },
    { icon: '🌿', text: 'Go for a walk in nature' },
    { icon: '📚', text: 'Focus on what you can control' },
  ],
  stressed: [
    { icon: '💆', text: 'Take a 15-minute break' },
    { icon: '🏃', text: 'Do some light exercise' },
    { icon: '📱', text: 'Turn off notifications for an hour' },
    { icon: '🍃', text: 'Practice mindfulness meditation' },
    { icon: '⏰', text: 'Prioritize your tasks for today' },
  ],
  low_energy: [
    { icon: '☕', text: 'Have a healthy snack or drink water' },
    { icon: '😴', text: 'Take a 20-minute power nap' },
    { icon: '🌞', text: 'Get some sunlight or fresh air' },
    { icon: '🎵', text: 'Listen to energizing music' },
    { icon: '💪', text: 'Do gentle stretching exercises' },
  ],
  confident: [
    { icon: '🎯', text: 'Set a challenging goal for yourself' },
    { icon: '📢', text: 'Share your achievements with others' },
    { icon: '🚀', text: 'Take on a new challenge' },
    { icon: '👑', text: 'Celebrate your accomplishments' },
    { icon: '🌟', text: 'Mentor or help someone else' },
  ],
  angry: [
    { icon: '🥊', text: 'Do some physical exercise' },
    { icon: '🧘', text: 'Practice deep breathing techniques' },
    { icon: '📝', text: 'Write about what made you angry' },
    { icon: '⏰', text: 'Take a timeout before reacting' },
    { icon: '💭', text: 'Think about the root cause' },
  ],
  overwhelmed: [
    { icon: '📝', text: 'Break tasks into smaller steps' },
    { icon: '⏸️', text: 'Take a step back and pause' },
    { icon: '🎯', text: 'Focus on one thing at a time' },
    { icon: '🤝', text: 'Ask for help when needed' },
    { icon: '🗂️', text: 'Organize and prioritize your tasks' },
  ],
  calm: [
    { icon: '🌱', text: 'Enjoy this peaceful moment' },
    { icon: '📖', text: 'Read something inspiring' },
    { icon: '🍃', text: 'Practice gratitude' },
    { icon: '🎨', text: 'Engage in a creative activity' },
    { icon: '🧘', text: 'Extend your meditation practice' },
  ],
  confused: [
    { icon: '📝', text: 'Write down what\'s confusing you' },
    { icon: '🤔', text: 'Break the problem into parts' },
    { icon: '👨‍🏫', text: 'Seek advice from someone experienced' },
    { icon: '📚', text: 'Research or learn more about it' },
    { icon: '⏰', text: 'Give yourself time to think it through' },
  ],
};

// Enhanced blog posts covering all emotions
const blogPosts = [
  // Happy/Positive emotions
  { id: 1, title: 'The Science of Sustainable Happiness', author: 'Dr. Sarah Johnson', readTime: '7 min read', image: '🧠', color: '#FFD93D', emotions: ['happy', 'confident'] },
  { id: 2, title: 'Building Unshakeable Confidence', author: 'Coach Michael Torres', readTime: '6 min read', image: '💪', color: '#2ECC71', emotions: ['confident', 'happy'] },
  
  // Negative emotions
  { id: 3, title: 'Managing Difficult Emotions', author: 'Dr. Lisa Chen', readTime: '5 min read', image: '💙', color: '#4A90E2', emotions: ['sad', 'worried'] },
  { id: 4, title: 'Overcoming Worry and Anxiety', author: 'Dr. James Wilson', readTime: '8 min read', image: '🌿', color: '#9B59B6', emotions: ['worried', 'stressed'] },
  { id: 5, title: 'Stress Relief Techniques That Work', author: 'Prof. Maria Garcia', readTime: '6 min read', image: '🧘', color: '#E74C3C', emotions: ['stressed', 'overwhelmed'] },
  { id: 6, title: 'Healthy Ways to Handle Anger', author: 'Dr. Robert Kim', readTime: '7 min read', image: '⚡', color: '#FF5722', emotions: ['angry', 'stressed'] },
  
  // Energy and clarity
  { id: 7, title: 'Boosting Energy Naturally', author: 'Nutritionist Emma Davis', readTime: '5 min read', image: '⚡', color: '#FF9800', emotions: ['low_energy', 'overwhelmed'] },
  { id: 8, title: 'Finding Clarity in Confusion', author: 'Life Coach Alex Murphy', readTime: '6 min read', image: '🎯', color: '#795548', emotions: ['confused', 'overwhelmed'] },
  { id: 9, title: 'The Power of Being Present', author: 'Mindfulness Expert Zen Master', readTime: '8 min read', image: '🍃', color: '#00BCD4', emotions: ['calm', 'stressed'] },
  { id: 10, title: 'When Life Feels Too Much', author: 'Dr. Patricia Lee', readTime: '7 min read', image: '🤯', color: '#FF9800', emotions: ['overwhelmed', 'confused'] },
];

export default function MoodCheckupScreen() {
  const navigation = useNavigation(); // Add navigation hook
  
  const [selectedEmotion, setSelectedEmotion] = useState('happy');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [savedEmotions, setSavedEmotions] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadMoods();
  }, []);

  const getToken = async () => {
    return await AsyncStorage.getItem('token');
  };

  const saveMoodToBackend = async (emotionData) => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/moods/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emotionData),
      });
      return await res.json();
    } catch (err) {
      console.error('Error saving mood to backend:', err);
      return null;
    }
  };

  const fetchMoodsFromBackend = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/moods/calendar`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.success ? data.moods : [];
    } catch (err) {
      console.error('Error fetching moods:', err);
      return [];
    }
  };

  const loadMoods = async () => {
    const moods = await fetchMoodsFromBackend();
    setSavedEmotions(moods);
  };

  const saveEmotion = async () => {
    try {
      const currentEmotion = emotions.find(e => e.id === selectedEmotion);
      const emotionData = {
        emotion: selectedEmotion,
        label: currentEmotion.label,
        color: currentEmotion.color,
      };

      const res = await saveMoodToBackend(emotionData);

      if (res && res.success) {
        const moods = await fetchMoodsFromBackend();
        setSavedEmotions(moods);
        setShowRecommendations(true);
        Alert.alert('Saved!', 'Your mood has been saved.');
      } else {
        Alert.alert('Error', 'Could not save your mood. Try again.');
      }
    } catch (error) {
      console.error('Error saving emotion:', error);
      Alert.alert('Error', 'Could not save your mood. Try again.');
    }
  };

  // Smart back button handler
  const handleBackPress = () => {
    if (showCalendar) {
      setShowCalendar(false);
    } else if (showRecommendations) {
      setShowRecommendations(false);
    } else {
      navigation.goBack();
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const emotion = savedEmotions.find(e => e.date === dateString);
      days.push({ day, date: dateString, emotion: emotion || null });
    }

    return days;
  };

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const currentEmotion = emotions.find(e => e.id === selectedEmotion);
  const emotionRecommendations = recommendations[selectedEmotion] || recommendations.happy;
  
  // Filter blog posts relevant to current emotion
  const relevantBlogPosts = blogPosts.filter(post => 
    post.emotions.includes(selectedEmotion)
  ).slice(0, 3); // Show max 3 relevant posts

  // If no relevant posts, show general posts
  const displayBlogPosts = relevantBlogPosts.length > 0 ? relevantBlogPosts : blogPosts.slice(0, 3);

  if (showCalendar) {
    const days = getDaysInMonth(currentMonth);
    const monthYear = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emotion Calendar</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              <Ionicons name="chevron-back" size={20} color="#8B5CF6" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{monthYear}</Text>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayHeader}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => <Text key={day} style={styles.weekdayText}>{day}</Text>)}
          </View>

          <View style={styles.calendarGrid}>
            {days.map((dayData, index) => (
              <View key={index} style={styles.dayCell}>
                {dayData && (
                  <>
                    {dayData.emotion && (
                      <View style={[styles.emotionDot, { backgroundColor: dayData.emotion.color }]} />
                    )}
                    <Text style={[
                      styles.dayNumber,
                      dayData.emotion && { color: '#fff', fontWeight: 'bold' }
                    ]}>
                      {dayData.day}
                    </Text>
                  </>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
     </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkup</Text>
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Ionicons name="calendar-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!showRecommendations ? (
          <>
            <Text style={styles.title}>How do you feel today?</Text>
            <Text style={styles.subtitle}>Share your emotions and let us help you navigate them.</Text>

            <View style={styles.largeEmotionContainer}>
              <View style={[styles.largeEmotion, { backgroundColor: currentEmotion.color }]}>
                {/* Try PNG first, fallback to emoji */}
                {currentEmotion.icon ? (
                  <Image 
                    source={currentEmotion.icon} 
                    style={styles.largeEmotionIcon}
                    onError={() => console.log('PNG load failed, using emoji fallback')}
                  />
                ) : (
                  <Text style={styles.largeEmoji}>{currentEmotion.emoji}</Text>
                )}
              </View>
            </View>

            {/* Horizontal scrollable emotions */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.emotionScrollContainer}
              style={styles.emotionScroll}
            >
              {emotions.map((emotion) => (
                <TouchableOpacity 
                  key={emotion.id}
                  style={styles.emotionContainer}
                  onPress={() => setSelectedEmotion(emotion.id)}
                >
                  <View style={[
                    styles.emotionOption, 
                    { backgroundColor: emotion.color }, 
                    selectedEmotion === emotion.id && styles.selectedEmotion
                  ]}>
                    {/* Try PNG first, fallback to emoji */}
                    {emotion.icon ? (
                      <Image 
                        source={emotion.icon} 
                        style={styles.emotionIcon}
                        onError={() => console.log(`PNG load failed for ${emotion.id}, using emoji fallback`)}
                      />
                    ) : (
                      <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                    )}
                  </View>
                  <Text style={styles.emotionLabel}>{emotion.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.recommendButton} onPress={saveEmotion}>
              <Text style={styles.recommendButtonText}>Get Recommendations</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.emotionHeader}>
              <View style={[styles.emotionCircle, { backgroundColor: currentEmotion.color }]}>
                {/* Try PNG first, fallback to emoji */}
                {currentEmotion.icon ? (
                  <Image 
                    source={currentEmotion.icon} 
                    style={styles.emotionCircleIcon}
                    onError={() => console.log('PNG load failed, using emoji fallback')}
                  />
                ) : (
                  <Text style={styles.emotionEmoji}>{currentEmotion.emoji}</Text>
                )}
              </View>
            </View>

            <Text style={styles.sorryText}>
              {['happy', 'confident', 'calm'].includes(selectedEmotion) 
                ? "That's wonderful!" 
                : "I understand how you're feeling"
              }
            </Text>
            <Text style={styles.helpText}>Here are some personalized suggestions to help you today</Text>

            <View style={styles.recommendationsContainer}>
              {emotionRecommendations.map((rec, index) => (
                <TouchableOpacity key={index} style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.recommendationText}>{rec.text}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Recommended Reads</Text>
            {displayBlogPosts.map((post) => (
              <TouchableOpacity key={post.id} style={styles.blogCard}>
                <View style={[styles.blogImageContainer, { backgroundColor: post.color }]}>
                  <Text style={styles.blogEmoji}>{post.image}</Text>
                </View>
                <View style={styles.blogContent}>
                  <Text style={styles.blogTitle}>{post.title}</Text>
                  <Text style={styles.blogMeta}>by {post.author} • {post.readTime}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={[styles.recommendButton, { backgroundColor: '#34D399', marginTop: 20 }]} 
              onPress={() => setShowRecommendations(false)}
            >
              <Text style={styles.recommendButtonText}>Back to Mood Check</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Enhanced styles for 10 emotions grid layout
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  
  content: { flex: 1, paddingHorizontal: 20 },
  title: { 
    fontSize: 24, 
    fontWeight: '600', 
    color: '#6869B3', 
    textAlign: 'center', 
    marginTop: 20, 
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    lineHeight: 22, 
    marginBottom: 100,
    fontFamily: "Poppins_400Regular"
  },
  largeEmotionContainer: { alignItems: 'center', marginBottom: 120 },
  largeEmotion: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  largeEmoji: { fontSize: 48 },
  
  // Horizontal scrollable emotions styles
  emotionScroll: { 
    marginBottom: 40
  },
  emotionScrollContainer: { 
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  emotionContainer: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 70,
    justifyContent: 'center'
  },
  emotionOption: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2,
    marginBottom: 8,
    overflow: 'hidden'
  },
  selectedEmotion: { 
    transform: [{ scale: 1.15 }], 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 6 
  },
  emotionEmoji: { fontSize: 24 },
  
  // PNG Icon Styles
  largeEmotionIcon: {
    width: 232,
    height: 232,
    resizeMode: 'contain'
  },
  emotionIcon: {
    width: 85,
    height: 85,
    resizeMode: 'contain'
  },
  emotionCircleIcon: {
    width: 85,
    height: 85,
    resizeMode: 'contain'
  },
  emotionLabel: { 
    fontSize: 12, 
    color: '#666', 
    textAlign: 'center', 
    fontWeight: '500',
    maxWidth: 70,
    marginTop: 4,
    lineHeight: 14
  },
  
  recommendButton: { 
    backgroundColor: '#7475B4', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginHorizontal: 20, 
    shadowColor: '#8B5CF6', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 4 
  },
  recommendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emotionHeader: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  emotionCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  sorryText: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#8B5CF6', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  helpText: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    lineHeight: 22, 
    marginBottom: 30 
  },
  recommendationsContainer: { marginBottom: 30 },
  recommendationItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderLeftWidth: 4, 
    borderLeftColor: '#8B5CF6' 
  },
  recommendationIcon: { marginRight: 12 },
  recommendationText: { fontSize: 16, color: '#333', flex: 1, fontWeight: '500' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 16 },
  blogCard: { 
    flexDirection: 'row', 
    backgroundColor: '#F8F9FA', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  blogImageContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  blogEmoji: { fontSize: 24 },
  blogContent: { flex: 1, justifyContent: 'center' },
  blogTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  blogMeta: { fontSize: 14, color: '#666' },
  bottomSpacing: { height: 30 },
  
  // Fixed Calendar styles
  calendarHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 20 
  },
  monthText: { fontSize: 20, fontWeight: '600', color: '#333' },
  weekdayHeader: { flexDirection: 'row', marginBottom: 10 },
  weekdayText: { 
    flex: 1, 
    textAlign: 'center', 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#666' 
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { 
    width: `${100/7}%`, 
    height: 60,
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
    paddingVertical: 5
  },
  dayNumber: { 
    fontSize: 16, 
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 2,
    backgroundColor: 'transparent'
  },
  emotionDot: { 
    width: 35, 
    height: 35, 
    borderRadius: 17.5, 
    position: 'absolute',
    zIndex: 1,
    opacity: 0.8
  },
});