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
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from "../../config/config"
import { useFonts, Inter_300Light, Inter_400Regular } from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 3; // 3 columns with padding

// Only 6 emotions as per design
const emotions = [
  { 
    id: 'lazy', 
    label: 'Lazy', 
    emoji: '😴',
    icon: require('../../../assets/emotions/Lazy.png'),
    color: '#FF9800' // Orange
  },
  { 
    id: 'shocked', 
    label: 'Shocked', 
    emoji: '😲',
    icon: require('../../../assets/emotions/Shocked.png'),
    color: '#FFD93D' // Yellow
  },
  { 
    id: 'worried', 
    label: 'Worried', 
    emoji: '😟',
    icon: require('../../../assets/emotions/Worried.png'),
    color: '#4A90E2' // Light Blue
  },
  { 
    id: 'stressed', 
    label: 'Stressed', 
    emoji: '😰',
    icon: require('../../../assets/emotions/Stressed.png'),
    color: '#F5A5A5' // Light Pink/Beige
  },
  { 
    id: 'confused', 
    label: 'Confused', 
    emoji: '😕',
    icon: require('../../../assets/emotions/Consfused.png'),
    color: '#5F9EA0' // Teal/Blue-grey
  },
  { 
    id: 'happy', 
    label: 'Happy', 
    emoji: '😄',
    icon: require('../../../assets/emotions/happy.png'),
    color: '#FFD93D' // Yellow
  },
];

// Recommendations for each mood
const recommendations = {
  lazy: [
    'Share your happiness with others.',
    'Capture this moment with photos.',
    'Do something creative.',
    'Plan something exciting for tomorrow.',
    'Do something kind for someone.',
  ],
  shocked: [
    'Take a moment to process what happened.',
    'Talk to someone you trust about it.',
    'Write down your thoughts and feelings.',
    'Take deep breaths to calm yourself.',
    'Focus on what you can control.',
  ],
  worried: [
    'Practice deep breathing for 10 minutes.',
    'Make a list of your concerns.',
    'Talk to someone you trust.',
    'Go for a walk in nature.',
    'Focus on what you can control.',
  ],
  stressed: [
    'Take a 15-minute break.',
    'Do some light exercise.',
    'Turn off notifications for an hour.',
    'Practice mindfulness meditation.',
    'Prioritize your tasks for today.',
  ],
  confused: [
    'Write down what\'s confusing you.',
    'Break the problem into parts.',
    'Seek advice from someone experienced.',
    'Research or learn more about it.',
    'Give yourself time to think it through.',
  ],
  happy: [
    'Share your happiness with others.',
    'Capture this moment with photos.',
    'Do something creative.',
    'Plan something exciting for tomorrow.',
    'Do something kind for someone.',
  ],
};

// Blog posts
const blogPosts = [
  { id: 1, title: 'Happiness', description: 'The science of sustainable...', tag: 'Happiness' },
  { id: 2, title: 'Confidence', description: 'Building unshakable confidence.', tag: 'Confidence' },
  { id: 3, title: 'Emotional Health', description: 'Managing difficult emotions.', tag: 'Emotional Health' },
];

export default function MoodCheckupScreen() {
  const navigation = useNavigation();
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [savedEmotions, setSavedEmotions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pressedEmotion, setPressedEmotion] = useState(null);
  const [buttonClicked, setButtonClicked] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
  });

  useEffect(() => {
    if (showCalendar) {
      loadMoods();
    }
  }, [showCalendar]);

  const getToken = async () => {
    return await AsyncStorage.getItem('token');
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

  const handleGetRecommendations = async () => {
    if (!selectedEmotion) {
      Alert.alert('Please Select', 'Please select your mood first.');
      return;
    }

    setButtonClicked(true);

    try {
      const currentEmotion = emotions.find(e => e.id === selectedEmotion);
      const emotionData = {
        emotion: selectedEmotion,
        label: currentEmotion.label,
        color: currentEmotion.color,
      };

      const res = await saveMoodToBackend(emotionData);
      if (res && res.success) {
        setShowRecommendations(true);
      } else {
        // Still show recommendations even if save fails
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('Error saving emotion:', error);
      setShowRecommendations(true);
    }
  };

  const handleBackPress = () => {
    if (showCalendar) {
      setShowCalendar(false);
    } else if (showRecommendations) {
      setShowRecommendations(false);
      setButtonClicked(false);
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

  const currentEmotion = selectedEmotion ? emotions.find(e => e.id === selectedEmotion) : null;
  const emotionRecommendations = selectedEmotion ? recommendations[selectedEmotion] : [];

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={[
        'rgba(254, 215, 112, 0.9)',
        'rgba(235, 177, 180, 0.8)',
        'rgba(145, 230, 251, 0.7)',
        'rgba(217, 213, 250, 0.6)',
        'rgba(255, 255, 255, 0.95)'
      ]}
      locations={[0, 0.2, 0.4, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Check Your Mood</Text>
          <TouchableOpacity onPress={() => setShowCalendar(true)}>
            <Ionicons name="calendar-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {showCalendar ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                <Ionicons name="chevron-back" size={20} color="#8B5CF6" />
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayHeader}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
                <Text key={day} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {getDaysInMonth(currentMonth).map((dayData, index) => (
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
            <View style={styles.bottomSpacing} />
          </ScrollView>
        ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!showRecommendations ? (
            <>
              {/* Question and Description */}
              <Text style={styles.title} numberOfLines={2}>
                How do you feel today?
              </Text>
              <Text style={styles.subtitle} numberOfLines={4}>
                Our Mood Checker AI helps identify your current emotional state and offers gentle, personalised suggestions to support your mental wellbeing.
              </Text>

              {/* Mood Selection Grid - 2x3 */}
              <View style={styles.moodGrid}>
                {emotions.map((emotion) => (
                  <TouchableOpacity
                    key={emotion.id}
                    style={[
                      styles.moodCard,
                      selectedEmotion === emotion.id && styles.selectedMoodCard,
                      pressedEmotion === emotion.id && styles.pressedMoodCard
                    ]}
                    onPressIn={() => setPressedEmotion(emotion.id)}
                    onPressOut={() => setPressedEmotion(null)}
                    onPress={() => {
                      setSelectedEmotion(emotion.id);
                      setPressedEmotion(null);
                    }}
                    activeOpacity={1}
                  >
                    {emotion.icon ? (
                      <Image 
                        source={emotion.icon} 
                        style={styles.moodIcon}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.moodEmoji}>{emotion.emoji}</Text>
                    )}
                    <Text style={styles.moodLabel}>{emotion.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              {/* Results Screen */}
              <View style={styles.resultsContainer}>
                {/* Mood Display */}
                <View style={styles.moodDisplayContainer}>
                  <View style={styles.moodDisplayCircle}>
                    {currentEmotion.icon ? (
                      <Image 
                        source={currentEmotion.icon} 
                        style={styles.moodDisplayIcon}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.moodDisplayEmoji}>{currentEmotion.emoji}</Text>
                    )}
                  </View>
                  <Text style={styles.moodDisplayTitle}>Feeling {currentEmotion.label}!</Text>
                  <Text style={styles.moodDisplayDescription}>
                    Personalized recommendations designed for how you're feeling right now.
                  </Text>
                </View>

                {/* Recommendations List */}
                <View style={styles.recommendationsList}>
                  {emotionRecommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationCard}>
                      <View style={styles.recommendationIcon}>
                        <Ionicons name="checkmark-circle" size={24} color="#FFD93D" />
                      </View>
                      <Text style={styles.recommendationText}>{rec}</Text>
                    </View>
                  ))}
                </View>

                {/* Recommended Blogs */}
                <View style={styles.blogsSection}>
                  <Text style={styles.blogsTitle}>Recommended Blogs</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.blogsScroll}
                  >
                    {blogPosts.map((blog) => (
                      <TouchableOpacity key={blog.id} style={styles.blogCard}>
                        <View style={styles.blogIcon}>
                          <Ionicons name="document-text-outline" size={20} color="#FFD93D" />
                        </View>
                        <Text style={styles.blogTitle}>{blog.title}</Text>
                        <Text style={styles.blogDescription}>{blog.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </>
          )}
          
          {/* Get Recommendation Button - Fixed at bottom */}
          {!showRecommendations && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[
                  styles.recommendButton,
                  (!selectedEmotion || buttonClicked) && styles.recommendButtonDisabled
                ]} 
                onPress={handleGetRecommendations}
                disabled={!selectedEmotion || buttonClicked}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.recommendButtonText,
                  (!selectedEmotion || buttonClicked) && styles.recommendButtonTextDisabled
                ]}>Get Recommendation</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Poppins_400Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: '300',
    color: '#111827',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
    fontFamily: 'Inter_300Light',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 0,
  },
  moodCard: {
    width: (width - 60) / 3,
    height: 110,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    marginHorizontal: 0,
    backgroundColor: 'transparent',
  },
  selectedMoodCard: {
    // No border, just visual feedback if needed
  },
  pressedMoodCard: {
    backgroundColor: 'rgba(233, 233, 233, 0.5)',
    borderRadius: 24,
    transform: [{ scale: 0.95 }],
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodIcon: {
    width: 119.73705291748047,
    height: 110.5265121459961,
    marginTop: 50,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: '400',
    color: '#111827',
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  recommendButton: {
    backgroundColor: 'rgba(7, 122, 255, 1)',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  recommendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
  },
  recommendButtonTextDisabled: {
    color: '#666666',
  },
  // Results Screen Styles
  resultsContainer: {
    paddingTop: 20,
  },
  moodDisplayContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  moodDisplayCircle: {
    width: 120,
    height: 120,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  moodDisplayEmoji: {
    fontSize: 64,
  },
  moodDisplayIcon: {
    width: 119,
    height: 110,
  },
  moodDisplayTitle: {
    fontSize: 50,
    fontWeight: '300',
    color: '#111827',
    marginBottom: 8,
    fontFamily: 'Inter_300Light',
  },
  moodDisplayDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    fontFamily: 'Inter_400Regular',
  },
  recommendationsList: {
    marginBottom: 32,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    padding: 16,
    borderRadius: 30,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(233, 233, 233, 1)',
  },
  recommendationIcon: {
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
    fontFamily: 'Poppins_400Regular',
  },
  blogsSection: {
    marginBottom: 20,
  },
  blogsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Poppins_400Regular',
  },
  blogsScroll: {
    paddingLeft: 0,
  },
  blogCard: {
    width: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(233, 233, 233, 1)',
  },
  blogIcon: {
    marginBottom: 8,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Poppins_400Regular',
  },
  blogDescription: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
  },
  bottomSpacing: {
    height: 30,
  },
  // Calendar Styles
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Poppins_400Regular',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  dayCell: {
    width: `${100/7}%`,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 5,
  },
  dayNumber: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 2,
    backgroundColor: 'transparent',
    fontFamily: 'Poppins_400Regular',
  },
  emotionDot: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    position: 'absolute',
    zIndex: 1,
    opacity: 0.8,
  },
});
