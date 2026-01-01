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
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function LandingScreen({ navigation }) {
  const { t } = useTranslation();

  const slides = [
    {
      id: 1,
      title: t('landing.slide1Title'),
      subtitle: t('landing.slide1Subtitle'),
    },
    {
      id: 2,
      title: t('landing.slide2Title'),
      subtitle: t('landing.slide2Subtitle'),
    },
    {
      id: 3,
      title: t('landing.slide3Title'),
      subtitle: t('landing.slide3Subtitle'),
    },
  ];
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
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
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
              <Ionicons name="arrow-forward" size={Math.min(24, screenWidth * 0.06)} color="#fff" />
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
    width: Math.min(200, screenWidth * 0.5),
    height: Math.min(80, screenWidth * 0.2),
    marginBottom: Math.min(30, screenWidth * 0.075),
  },
  loadingBarContainer: {
    width: screenWidth * 0.7,
    height: Math.min(4, screenWidth * 0.01),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: Math.min(2, screenWidth * 0.005),
    overflow: "hidden",
    marginTop: Math.min(10, screenWidth * 0.025),
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
    borderRadius: Math.min(2, screenWidth * 0.005),
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
    paddingTop: Math.min(40, screenWidth * 0.1),
    paddingBottom: Math.min(20, screenWidth * 0.05),
  },
  logo: {
    width: Math.min(180, screenWidth * 0.45),
    height: Math.min(70, screenWidth * 0.175),
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: Math.min(20, screenWidth * 0.05),
  },
  illustration: {
    width: Math.min(325.3148193359375, screenWidth * 0.813),
    height: Math.min(358, screenWidth * 0.895),
  },
  bottomSection: {
    backgroundColor: "transparent",
    borderTopLeftRadius: Math.min(30, screenWidth * 0.075),
    borderTopRightRadius: Math.min(30, screenWidth * 0.075),
    paddingTop: Math.min(30, screenWidth * 0.075),
    paddingBottom: Math.min(30, screenWidth * 0.075),
    minHeight: screenHeight * 0.4,
    flex: 0,
  },
  textSlide: {
    width: screenWidth,
    paddingHorizontal: Math.min(24, screenWidth * 0.06),
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingBottom: Math.min(20, screenWidth * 0.05),
  },
  onboardingTitle: {
    fontSize: Math.min(49.91, screenWidth * 0.125),
    fontWeight: "700",
    lineHeight: Math.min(60, screenWidth * 0.15),
    color: "#000",
    textAlign: "left",
    fontFamily: "Inter_700Bold",
    marginBottom: Math.min(16, screenWidth * 0.04),
  },
  onboardingSubtitle: {
    fontSize: Math.min(16, screenWidth * 0.04),
    fontWeight: "400",
    lineHeight: Math.min(24, screenWidth * 0.06),
    color: "#000",
    textAlign: "left",
    fontFamily: "Inter_400Regular",
  },

  // Bottom Navigation
  bottomNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Math.min(24, screenWidth * 0.06),
    paddingTop: Math.min(20, screenWidth * 0.05),
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    height: Math.min(8, screenWidth * 0.02),
    borderRadius: Math.min(4, screenWidth * 0.01),
    marginRight: Math.min(6, screenWidth * 0.015),
  },
  activeDot: {
    width: Math.min(24, screenWidth * 0.06),
    backgroundColor: "#000",
  },
  inactiveDot: {
    width: Math.min(8, screenWidth * 0.02),
    backgroundColor: "#fff",
  },
  nextButton: {
    width: Math.min(56, screenWidth * 0.14),
    height: Math.min(56, screenWidth * 0.14),
    borderRadius: Math.min(28, screenWidth * 0.07),
    backgroundColor: "#6B5AED",
    justifyContent: "center",
    alignItems: "center",
  },
});
