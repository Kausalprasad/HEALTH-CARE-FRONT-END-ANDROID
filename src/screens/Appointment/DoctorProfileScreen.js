import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function DoctorProfileScreen({ route, navigation }) {
  const { doctor } = route.params;

  // Format stats
  const formatPatients = (patients) => {
    if (patients >= 1000) {
      return `${(patients / 1000).toFixed(1)}k+`;
    }
    return `${patients}+`;
  };

  // Star rating component
  const StarRating = ({ rating, totalReviews }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#E0E0E0" />
        );
      }
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>{stars}</View>
        <Text style={styles.ratingText}>
          {rating.toFixed(1)}/5 ({totalReviews})
        </Text>
      </View>
    );
  };

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
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Header */}
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Doctor's Profile</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Doctor Image Section */}
          <View style={styles.imageContainer}>
            <Image
              source={
                doctor.profilePicture
                  ? { uri: doctor.profilePicture }
                  : require("../../../assets/doctor.png")
              }
              style={styles.doctorImage}
              resizeMode="cover"
            />
          </View>

          {/* White Overlay Card */}
          <View style={styles.whiteCard}>
            {/* Doctor Info */}
            <View style={styles.doctorInfoSection}>
              <Text style={styles.doctorName}>{doctor.name || "Dr. Rajesh Sharma"}</Text>
              <Text style={styles.doctorSpec}>
                {doctor.specialization || "Cardiologist"} | {doctor.hospitalName || "Apollo Hospital"}
              </Text>
              
              {/* Rating */}
              <View style={styles.ratingSection}>
                <StarRating
                  rating={doctor.rating || 4.8}
                  totalReviews={doctor.totalReviews || 127}
                />
              </View>

              {/* Statistics Section */}
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <View style={[styles.statIcon, { backgroundColor: "#FFA500" }]}>
                    <Ionicons name="person" size={24} color="#FFF" />
                  </View>
                  <Text style={styles.statValue}>
                    {doctor.patients ? formatPatients(doctor.patients) : "116+"}
                  </Text>
                  <Text style={styles.statLabel}>Patients</Text>
                </View>

                <View style={styles.statBox}>
                  <View style={[styles.statIcon, { backgroundColor: "#87CEEB" }]}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  </View>
                  <Text style={styles.statValue}>
                    {doctor.experience || 3}+
                  </Text>
                  <Text style={styles.statLabel}>Years</Text>
                </View>

                <View style={styles.statBox}>
                  <View style={[styles.statIcon, { backgroundColor: "#FF6B9D" }]}>
                    <Ionicons name="star" size={24} color="#FFF" />
                  </View>
                  <Text style={styles.statValue}>
                    {doctor.rating ? doctor.rating.toFixed(1) : "4.9"}
                  </Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>

                <View style={styles.statBox}>
                  <View style={[styles.statIcon, { backgroundColor: "#90EE90" }]}>
                    <Ionicons name="chatbubble-ellipses" size={24} color="#FFF" />
                  </View>
                  <Text style={styles.statValue}>
                    {doctor.totalReviews ? formatPatients(doctor.totalReviews) : "90+"}
                  </Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </View>

              {/* About Me Section */}
              <View style={styles.aboutSection}>
                <Text style={styles.aboutHeading}>About Me</Text>
                <Text style={styles.aboutText}>
                  {doctor.bio || "Dr. Rajesh Sharma is a renowned cardiologist at HeartCare Clinic in Manchester, UK. With over 15 years of experience, he has been recognized for his innovative approaches to heart health and has received numerous accolades for his dedication to patient care. Dr. Sharma is passionate about educating his patients on heart disease prevention and regularly conducts workshops to promote cardiovascular wellness."}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerSafeArea: {
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: StatusBar.currentHeight || 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: width,
    height: width * 0.7,
    backgroundColor: "#E0E0E0",
  },
  doctorImage: {
    width: "100%",
    height: "100%",
  },
  whiteCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    marginHorizontal: 12,
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 600,
  },
  doctorInfoSection: {
    alignItems: "flex-start",
    paddingHorizontal: 0,
    width: "100%",
  },
  doctorName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
    textAlign: "left",
  },
  doctorSpec: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "left",
  },
  ratingSection: {
    marginBottom: 24,
    alignItems: "flex-start",
    width: "100%",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 3,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
    paddingHorizontal: 0,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  aboutSection: {
    width: "100%",
    marginTop: 8,
    paddingHorizontal: 0,
  },
  aboutHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 24,
    textAlign: "left",
  },
});