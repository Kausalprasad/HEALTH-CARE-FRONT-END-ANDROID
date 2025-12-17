// src/config/config.js
import { Platform } from "react-native";

// export const BASE_URL =
//    Platform.OS === "android"
//     ? "http://192.168.1.27:5000" // Android Emulator IP
//     : "http://192.168.1.27:5000"; // iOS or real device on same network
  

    export const BASE_URL =
  Platform.OS === "android"
    ? "https://backend.healnova.ai" // Android Emulator IP
    : "https://backend.healnova.ai"; // iOS or real dez
