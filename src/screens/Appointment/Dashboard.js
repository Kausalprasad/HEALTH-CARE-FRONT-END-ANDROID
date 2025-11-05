import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import MenuCard from "../../components/MenuCard";
import { getAuth } from "firebase/auth";

export default function Dashboard({ navigation }) {
  const [userName, setUserName] = useState("");

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // Agar displayName set hai use karo, nahi to email ka first part
      setUserName(user.displayName || user.email.split("@")[0]);
    }
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greet}>Hello, {userName} 👋</Text>
        <Text style={styles.subtitle}>What would you like to do?</Text>

        <MenuCard
          title="View Doctors"
          subtitle="See list of available doctors"
          emoji="🩺"
          onPress={() => navigation.navigate("Doctors")}
        />

        <MenuCard
          title="Book Appointment"
          subtitle="Choose doctor & slot"
          emoji="📅"
          onPress={() => navigation.navigate("BookAppointment")}
        />

        <MenuCard
          title="My Appointments"
          subtitle="View or cancel your bookings"
          emoji="📋"
          onPress={() => navigation.navigate("MyAppointments")}
        />

        <MenuCard
          title="Profile"
          subtitle="View your profile settings"
          emoji="👤"
          onPress={() => alert("Profile screen placeholder")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20 },
  greet: { fontSize: 22, fontWeight: "800", marginHorizontal: 16, marginBottom: 6 },
  subtitle: { marginHorizontal: 16, color: "#666", marginBottom: 16 }
});
