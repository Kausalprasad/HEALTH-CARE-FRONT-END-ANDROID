import React, { useContext, useState, useEffect, useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "../screens/Landing/LandingScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen/ForgotPasswordScreen";
import DisclaimerScreen from "../screens/Auth/DisclaimerScreen";
import { AuthContext } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SymptomCheckerScreen from "../screens/Model/SymptomCheckerScreen";
import NailAnalysisScreen from "../screens/Model/NailAnalysisScreen";
import HealthGamesScreen from "../screens/HealthGames/HealthGamesScreen";
import BreathingGameScreen from "../screens/HealthGames/Games/BreathingGameScreen";
import ResultsScreen from "../screens/HealthGames/Games/ResultsScreen";
import EyeBubblesGameScreen from "../screens/HealthGames/Games/EyeBubblesGameScreen";
import AIDoctorScreen from "../screens/Model/AIDoctorScreen";
import TongueDiseaseCheckerScreen from "../screens/Model/TongueDiseaseCheckerScreen";
import ChatbotScreen from "../screens/Model/ChatbotScreen";
import EyeScreen from "../screens/Model/EyeScreen";
import SkinCheckScreen from "../screens/Model/SkinCheckScreen"; // Import the SkinCheckScreen
import NutritionQuestScreen from "../screens/HealthGames/Games/NutritionQuestScreen"; 
import CosmeticScreen from "../screens/Model/CosmeticScreen";
import Dsdashboard from "../screens/Appointment/Dashboard";
import DoctorListScreen from "../screens/Appointment/DoctorListScreen";
import AppointmentBooking from "../screens/Appointment/AppointmentBooking";
import MyAppointments from "../screens/Appointment/MyAppointments";
import CaregiverDashboard from "../screens/CaregiverDashboard/CaregiverDashboardScreen";
import AiHealthCheckupScreen from "../screens/Dashboard/AiHealthCheckupScreen";
import DoctorCard from "../screens/Appointment/DoctorCard";
import MelanomaScreen from "../screens/Model/MelanomaScreen";
import MentalHealthScreen from "../screens/Model/MentalHealthScreen";
import HairCheckScreen from "../screens/Model/HairCheckScreen";
import Sidebar from "../components/Sidebar";
import UserProfileScreen from "../screens/UserProfile/UserProfileScreen";
import ProfileSetupStep2 from "../screens/UserProfile/ProfileSetupStep2";
import ProfileSetupStep3 from "../screens/UserProfile/ProfileSetupStep3";
import ProfileSetupStep1 from "../screens/UserProfile/ProfileSetupStep1";
import ProfileViewScreen from "../screens/UserProfile/ProfileViewScreen";
import VitalsScreen from "../screens/Vitals/VitalsScreen";
import MoodCheckupApp from "../screens/MoodCheckup/MoodCheckupScreen";
import PreventiveHealthScreen from "../screens/PreventiveHealth/PreventiveHealthScreen";
import InsuranceScreen from "../screens/Insurance/InsuranceScreen";
import DietScreen from "../screens/Diet/dietScreen";
import AddPatientScreen from "../screens/Appointment/AddPatientScreen";
import FeaturesScreen from "../screens/Model/FeaturesScreen";
import XrayScreen from "../screens/Model/XrayScreen";
import VoiceRedirectScreen from "../screens/Model/VoiceRedirectScreen";
import CalorieCalculator from "../screens/Model/CalorieCalculator";
import AddDocumentScreen from "../screens/Vault/AddDocumentScreen";
import DayDetailScreen from "../screens/Diet/DayDetailScreen";
import DietResult from "../screens/Diet/DietResult";
import PregnancyScreen from "../screens/Pregnancy/PregnancyScreen";
import BabyScreen from "../screens/Pregnancy/BabyScreen";
import MotherBabyCareScreen from "../screens/Pregnancy/MotherBabyCareScreen";
import InjuryScreen from "../screens/Model/InjuryScreen";
import DentalCheckScreen from "../screens/Model/DentalCheckScreen";
import RiskAssessmentScreen from "../screens/Model/RiskAssessmentScreen";
import CameraStreamScreen from "../screens/Model/CameraStreamScreen";
import FitnessFighterScreen from "../screens/HealthGames/Games/FitnessFighterScreen";
import AddPrescriptionScreen from "../screens/Prescription/AddPrescriptionScreen";
import PrescriptionRemindersScreen from "../screens/Prescription/PrescriptionRemindersScreen";
import BreastAnalysisScreen from "../screens/Model/BreastAnalysisScreen";
import PCOSScreening from "../screens/Model/PCOSScreening";
import Earing from "../screens/HealthGames/Games/Earing";
import HeartGame from "../screens/HealthGames/Games/HeartGame";
import AboutScreen from "../screens/Settings/AboutScreen";
import MedicalDisclaimerScreen from "../screens/Settings/MedicalDisclaimerScreen";
import PrivacyPolicyScreen from "../screens/Settings/PrivacyPolicyScreen";











// Vault Screens
import VaultMenu from "../screens/Vault/VaultMenu";
import CreateVaultId from "../screens/Vault/CreateVaultId";
import LoginVaultId from "../screens/Vault/LoginVaultId";
import VaultDashboard from "../screens/Vault/VaultDashboard";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkIntervalRef = useRef(null);

  // Check if disclaimer has been accepted
  useEffect(() => {
    const checkDisclaimer = async () => {
      if (user) {
        try {
          const accepted = await AsyncStorage.getItem("disclaimerAccepted");
          setDisclaimerAccepted(accepted === "true");
        } catch (error) {
          console.error("Error checking disclaimer:", error);
          setDisclaimerAccepted(false);
        }
      } else {
        setDisclaimerAccepted(null);
      }
      setIsChecking(false);
    };

    checkDisclaimer();

    // Set up interval to check disclaimer status periodically
    // This will detect when user accepts disclaimer
    if (user) {
      checkIntervalRef.current = setInterval(() => {
        checkDisclaimer();
      }, 500); // Check every 500ms for faster response
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user]);

  // Show loading state while checking
  if (isChecking && user) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
  {user ? (
    // If user is logged in, check disclaimer acceptance
    disclaimerAccepted === false ? (
      // Show disclaimer screen if not accepted
      <Stack.Screen 
        name="DisclaimerScreen" 
        component={DisclaimerScreen}
        options={{ gestureEnabled: false }} // Prevent back navigation
      />
    ) : (
      // Show app screens if disclaimer is accepted
      <>
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
        <Stack.Screen name="VaultMenu" component={VaultMenu} />
        <Stack.Screen name="CreateVaultId" component={CreateVaultId} />
        <Stack.Screen name="LoginVaultId" component={LoginVaultId} />
        <Stack.Screen name="VaultDashboard" component={VaultDashboard} />
      </>
    )
  ) : (
    <>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </>
  )}

  {/* ✅ Available in both cases */}
  <Stack.Screen name="SymptomChecker" component={SymptomCheckerScreen} />
  <Stack.Screen name="NailAnalysis" component={NailAnalysisScreen} />
  <Stack.Screen name="AIDoctor" component={AIDoctorScreen} />
  <Stack.Screen name="TongueDiseaseChecker" component={TongueDiseaseCheckerScreen} />
   <Stack.Screen name="HealthGames" component={HealthGamesScreen} />
   <Stack.Screen name="BreathingGameScreen" component={BreathingGameScreen} />
<Stack.Screen name="ResultsScreen" component={ResultsScreen} />
  <Stack.Screen name="EyeBubblesGameScreen" component={EyeBubblesGameScreen} />
  <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
  <Stack.Screen name="EyeScreen" component={EyeScreen} />
  <Stack.Screen name="SkinCheck" component={SkinCheckScreen} />
  <Stack.Screen name="NutritionQuestScreen" component={NutritionQuestScreen} />
  <Stack.Screen name="CosmeticScreen" component={CosmeticScreen} />
  <Stack.Screen name="HairCheckScreen" component={HairCheckScreen} />

  <>
  <Stack.Screen name="Dsashboard" component={Dsdashboard} />
  <Stack.Screen name="Doctors" component={DoctorListScreen} />
  <Stack.Screen name="BookAppointment" component={AppointmentBooking} />
  <Stack.Screen name="MyAppointments" component={MyAppointments} />
  </>
  <>
  <Stack.Screen name="CaregiverDashboard" component={CaregiverDashboard} />
  <Stack.Screen name="AiHealthCheckupScreen" component={AiHealthCheckupScreen} />
  <Stack.Screen name="DoctorCard" component={DoctorCard} />
  <Stack.Screen name="MelanomaScreen" component={MelanomaScreen} />
  <Stack.Screen name="MentalHealthScreen" component={MentalHealthScreen} />
  <Stack.Screen name="Sidebar" component={Sidebar}/>
  <Stack.Screen name="UserProfileScreen" component={UserProfileScreen}/>
  <Stack.Screen name="ProfileSetupStep2" component={ProfileSetupStep2}/>
  <Stack.Screen name="ProfileSetupStep3" component={ProfileSetupStep3}/>
  <Stack.Screen name="ProfileSetupStep1" component={ProfileSetupStep1}/>
  <Stack.Screen name="ProfileViewScreen" component={ProfileViewScreen}/>
  <Stack.Screen name="VitalsScreen" component={VitalsScreen}/>
  {/*
  

//  */}
 <Stack.Screen name="AddPatientScreen" component={AddPatientScreen}/>
  <Stack.Screen name="MoodCheckupApp" component={MoodCheckupApp}/>
  <Stack.Screen name="PreventiveHealthScreen" component={PreventiveHealthScreen}/>
   <Stack.Screen name="InsuranceScreen" component={InsuranceScreen}/>
   <Stack.Screen name="DietScreen" component={DietScreen}/> 
  <Stack.Screen name="FeaturesScreen" component={FeaturesScreen}/>
  <Stack.Screen name="XrayScreen" component={XrayScreen}/>
  <Stack.Screen name="VoiceRedirectScreen" component={VoiceRedirectScreen}/>
  <Stack.Screen name="CalorieCalculator" component={CalorieCalculator}/>
  {/* <Stack.Screen name="PregnancyScreen" component={PregnancyScreen}/> */}
  <Stack.Screen name="AddDocumentScreen" component={AddDocumentScreen}/>
  <Stack.Screen name="DayDetailScreen" component={DayDetailScreen}/>
  <Stack.Screen name="DietResult" component={DietResult}/>
  <Stack.Screen name="PregnancyScreen" component={PregnancyScreen}/>
  <Stack.Screen name="BabyScreen" component={BabyScreen}/>
  <Stack.Screen name="MotherBabyCareScreen" component={MotherBabyCareScreen}/>
  <Stack.Screen name="InjuryScreen" component={InjuryScreen}/>
  <Stack.Screen name="DentalCheckScreen" component={DentalCheckScreen}/>
  <Stack.Screen name="RiskAssessmentScreen" component={RiskAssessmentScreen}/>
  <Stack.Screen name="CameraStreamScreen" component={CameraStreamScreen}/>
  <Stack.Screen name="FitnessFighterScreen" component={FitnessFighterScreen}/>
  <Stack.Screen name="AddPrescriptionScreen" component={AddPrescriptionScreen}/>
<Stack.Screen name="PrescriptionRemindersScreen" component={PrescriptionRemindersScreen}/>
<Stack.Screen name="BreastAnalysisScreen" component={BreastAnalysisScreen}/>
<Stack.Screen name="PCOSScreening" component={PCOSScreening}/>
<Stack.Screen name="Earing" component={Earing}/>
<Stack.Screen name="HeartGame" component={HeartGame}/>
<Stack.Screen name="AboutScreen" component={AboutScreen}/>
<Stack.Screen name="MedicalDisclaimerScreen" component={MedicalDisclaimerScreen}/>
<Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen}/>
  




  </>
  
</Stack.Navigator>


  );
}
