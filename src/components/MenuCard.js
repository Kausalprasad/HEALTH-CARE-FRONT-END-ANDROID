import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

export default function MenuCard({ title, subtitle, onPress, emoji }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.emoji}>{emoji || "📌"}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", padding: 16, marginVertical: 8, marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 10, elevation: 2, alignItems: "center" },
  left: { width: 48, alignItems: "center" },
  emoji: { fontSize: 28 },
  right: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700" },
  sub: { color: "#666", marginTop: 4 }
});
