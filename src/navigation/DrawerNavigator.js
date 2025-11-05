import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import VaultMenu from "../screens/Vault/VaultMenu";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, // Hum apna custom header use karenge
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="VaultMenu" component={VaultMenu} />
    </Drawer.Navigator>
  );
}
