// LandingScreen.js
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Inter_700Bold, Inter_400Regular } from "@expo-google-fonts/inter";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "Smart healthcare for all.",
    subtitle: "A more connected, more intelligent way to understand your health, built for everyone, everywhere",
  },
  {
    id: 2,
    title: "Doctors, just a tap away.",
    subtitle: "Seamless access to specialists, designed around your schedule.",
  },
  {
    id: 3,
    title: "Your reports, organized.",
    subtitle: "All your medical documents, sorted and easy to access, right when you need them.",
  },
];

export default function LandingScreen({ navigation }) {
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadingProgress = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef();

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  // Splash auto hide after 3 sec
  useEffect(() => {
    // Animate loading bar
    Animated.timing(loadingProgress, {
      toValue: 70,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      // Last slide - navigate to login
      navigation.replace("Login");
    }
  };

  if (showSplash) {
    return (
      <LinearGradient
        colors={["#FFE5B4", "#FFD4A3", "#E8F4F8", "#D4E8F0", "#C8D4F0"]}
        style={styles.splashContainer}
      >
        <View style={styles.splashContent}>
          <Image
            source={require("../../../assets/Dashoabdicons/Healnova.ai.png")}
            style={styles.splashLogo}
            resizeMode="contain"
          />

          {/* Green Loading Bar */}
          <View style={styles.loadingBarContainer}>
            <View style={styles.loadingBarBackground} />
            <Animated.View
              style={[
                styles.loadingBarFill,
                {
                  width: loadingProgress.interpolate({
                    inputRange: [0, 70],
                    outputRange: ["0%", "70%"],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#FFE5B4", "#FFD4A3", "#E8F4F8", "#D4E8F0", "#C8D4F0"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Section with Logo and Robot */}
        <View style={styles.topSection}>
          {/* Static Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/Dashoabdicons/Healnova.ai.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Static Robot Image */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require("../../../assets/Dashoabdicons/Robot.png")}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Section with White Card */}
        <View style={styles.bottomSection}>
          {/* Sliding Text */}
          <FlatList
            ref={flatListRef}
            data={slides}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={styles.textSlide}>
                <Text
                  style={[
                    styles.onboardingTitle,
                    !fontsLoaded && { fontFamily: undefined, fontWeight: "700" },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.onboardingSubtitle,
                    !fontsLoaded && { fontFamily: undefined, fontWeight: "400" },
                  ]}
                >
                  {item.subtitle}
                </Text>
              </View>
            )}
          />

          {/* Bottom Navigation Row */}
          <View style={styles.bottomNavRow}>
            {/* Pagination Dots - Left */}
            <View style={styles.dotsContainer}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>

            {/* Next Button - Right */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Splash styles
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  splashLogo: {
    width: 200,
    height: 80,
    marginBottom: 30,
  },
  loadingBarContainer: {
    width: width * 0.7,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 10,
  },
  loadingBarBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  loadingBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },

  // Onboarding styles
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  topSection: {
    flex: 1,
    justifyContent: "flex-start",
  },
  logoContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 180,
    height: 70,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 20,
  },
  illustration: {
    width: 325.3148193359375,
    height: 358,
  },
  bottomSection: {
    backgroundColor: "transparent",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingBottom: 30,
    minHeight: height * 0.4,
    flex: 0,
  },
  textSlide: {
    width: width,
    paddingHorizontal: 24,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingBottom: 20,
  },
  onboardingTitle: {
    fontSize: 49.91,
    fontWeight: "700",
    lineHeight: 60,
    color: "#000",
    textAlign: "left",
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  onboardingSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: "#000",
    textAlign: "left",
    fontFamily: "Inter_400Regular",
  },

  // Bottom Navigation
  bottomNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeDot: {
    width: 24,
    backgroundColor: "#000",
  },
  inactiveDot: {
    width: 8,
    backgroundColor: "#fff",
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6B5AED",
    justifyContent: "center",
    alignItems: "center",
  },
});
