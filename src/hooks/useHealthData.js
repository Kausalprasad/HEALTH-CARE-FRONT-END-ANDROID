import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
// Lazy import HealthConnectService to prevent crashes if module isn't available
let HealthConnectService = null;
try {
  HealthConnectService = require('../services/HealthConnectService').default;
} catch (importErr) {
  console.error('❌ [useHealthData] Failed to import HealthConnectService:', importErr);
  // Create a mock service that always returns unavailable
  HealthConnectService = {
    checkAvailability: () => false,
    initialize: async () => false,
    requestPermissions: async () => [],
    read: async () => [],
    openSettings: () => {},
  };
}
import { formatHealthData } from '../utils/formatHealthData';

// Safe default vitals to prevent crashes
const DEFAULT_VITALS = {
  steps: 0,
  heartRate: 0,
  distance: 0,
  activeCalories: 0,
  sleepDuration: 0,
  bloodOxygen: 0,
  bloodPressure: { systolic: 0, diastolic: 0 },
};

export default function useHealthData() {
  const [vitals, setVitals] = useState(DEFAULT_VITALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [granted, setGranted] = useState(false);

  const getTodayRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return {
      startTime: start.toISOString(),
      endTime: now.toISOString(),
    };
  };

  const getLastNightRange = () => {
    const now = new Date();
    const lastNight = new Date(now);
    lastNight.setDate(lastNight.getDate() - 1);
    lastNight.setHours(20, 0, 0, 0); // 8 PM yesterday
    const thisMorning = new Date(now);
    thisMorning.setHours(8, 0, 0, 0); // 8 AM today
    return {
      startTime: lastNight.toISOString(),
      endTime: thisMorning.toISOString(),
    };
  };

  const fetchVitals = async () => {
    console.log('🏥 [Vitals] Starting fetchVitals...');
    
    try {
      if (Platform.OS !== 'android') {
        console.warn('⚠️ [Vitals] Health Connect is only available on Android');
        setError('Health Connect is only available on Android');
        setLoading(false);
        return;
      }

      // Check if module is available (this will trigger lazy loading)
      let isAvailable = false;
      try {
        isAvailable = HealthConnectService.checkAvailability();
        console.log('📦 [Vitals] Module available:', isAvailable);
      } catch (checkErr) {
        console.error('❌ [Vitals] Error checking availability:', checkErr);
        isAvailable = false;
      }
      
      if (!isAvailable) {
        const errorMsg = 'Health Connect is not available on this device.\n\n' +
          'This feature requires:\n' +
          '• Android device with Health Connect app installed\n' +
          '• Proper native module linking\n\n' +
          'The app will continue to work normally. You can use all other features without Health Connect.';
        console.warn('⚠️ [Vitals]', errorMsg);
        setError(errorMsg);
        setVitals(DEFAULT_VITALS); // Set safe defaults to prevent crash
        setLoading(false);
        setGranted(false);
        return;
      }

      setError(null);
      setLoading(true);
      console.log('🔄 [Vitals] Initializing Health Connect...');

      // Initialize Health Connect (returns false if fails, doesn't throw)
      let initResult = false;
      try {
        initResult = await HealthConnectService.initialize();
        console.log('✅ [Vitals] Health Connect initialized:', initResult);
      } catch (initErr) {
        console.warn('⚠️ [Vitals] Initialize error (non-fatal):', initErr);
        initResult = false;
      }

      // If initialization fails, show error but don't crash
      if (!initResult) {
        console.warn('⚠️ [Vitals] Health Connect initialization failed');
        setError('Health Connect is not available. Please ensure Health Connect app is installed.');
        setLoading(false);
        setGranted(false);
        return;
      }

      // Request permissions
      console.log('🔐 [Vitals] Requesting permissions...');
      let permissions = [];
      try {
        permissions = await HealthConnectService.requestPermissions();
        console.log('📋 [Vitals] Permissions granted:', permissions);
        console.log('📋 [Vitals] Permissions count:', permissions?.length || 0);
      } catch (permErr) {
        console.error('❌ [Vitals] Permission request error:', permErr);
        // Don't throw - let the app continue and show permission handler
        permissions = [];
      }
      
      const hasAllPermissions = permissions && permissions.length > 0;
      setGranted(hasAllPermissions);
      console.log('✅ [Vitals] Has all permissions:', hasAllPermissions);

      if (!hasAllPermissions) {
        console.warn('⚠️ [Vitals] No permissions granted - will show permission handler');
        setLoading(false);
        return;
      }

      const todayRange = getTodayRange();
      const sleepRange = getLastNightRange();
      console.log('📅 [Vitals] Today range:', todayRange);
      console.log('😴 [Vitals] Sleep range:', sleepRange);

      // Fetch all data in parallel with error handling
      console.log('📊 [Vitals] Fetching health data...');
      const [
        stepsRecords,
        heartRateRecords,
        distanceRecords,
        caloriesRecords,
        sleepRecords,
        oxygenRecords,
        bpRecords,
      ] = await Promise.allSettled([
        HealthConnectService.read('Steps', todayRange),
        HealthConnectService.read('HeartRate', todayRange),
        HealthConnectService.read('Distance', todayRange),
        HealthConnectService.read('ActiveCaloriesBurned', todayRange),
        HealthConnectService.read('SleepSession', sleepRange),
        HealthConnectService.read('OxygenSaturation', todayRange),
        HealthConnectService.read('BloodPressure', todayRange),
      ]).then(results => 
        results.map(r => r.status === 'fulfilled' ? r.value : [])
      );

      console.log('📈 [Vitals] Raw data received:');
      console.log('  👣 Steps records:', stepsRecords.length);
      console.log('  💓 Heart rate records:', heartRateRecords.length);
      console.log('  📏 Distance records:', distanceRecords.length);
      console.log('  🔥 Calories records:', caloriesRecords.length);
      console.log('  😴 Sleep records:', sleepRecords.length);
      console.log('  🫁 Oxygen records:', oxygenRecords.length);
      console.log('  🩸 BP records:', bpRecords.length);

      // Format the data
      const formattedVitals = {
        steps: formatHealthData.steps(stepsRecords),
        heartRate: formatHealthData.heartRate(heartRateRecords),
        distance: formatHealthData.distance(distanceRecords),
        activeCalories: formatHealthData.activeCalories(caloriesRecords),
        sleepDuration: Math.round(formatHealthData.sleep(sleepRecords) * 60), // Convert hours to minutes
        bloodOxygen: formatHealthData.bloodOxygen(oxygenRecords),
        bloodPressure: formatHealthData.bloodPressure(bpRecords),
      };

      console.log('✨ [Vitals] Formatted vitals:', formattedVitals);
      // Ensure all required fields exist
      const safeFormattedVitals = {
        ...DEFAULT_VITALS,
        ...formattedVitals,
        bloodPressure: formattedVitals.bloodPressure || DEFAULT_VITALS.bloodPressure,
      };
      setVitals(safeFormattedVitals);
      console.log('✅ [Vitals] Vitals data set successfully');
    } catch (err) {
      console.error('❌ [Vitals] Health data fetch error:', err);
      console.error('❌ [Vitals] Error message:', err?.message || 'Unknown error');
      console.error('❌ [Vitals] Error stack:', err?.stack || 'No stack trace');
      // Set error but keep default vitals to prevent crash
      setError(err?.message || 'Failed to fetch health data');
      setVitals(DEFAULT_VITALS); // Ensure vitals always has safe defaults
    } finally {
      setLoading(false);
      console.log('🏁 [Vitals] fetchVitals completed');
    }
  };

  useEffect(() => {
    console.log('🚀 [Vitals] useHealthData hook mounted');
    
    // Production safety: Longer delay and better error handling
    const initializeVitals = async () => {
      try {
        // Extra delay for production builds to prevent native module crashes
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check if HealthConnectService is available
        if (!HealthConnectService) {
          setError('Health Connect service is not available');
          setLoading(false);
          return;
        }
        
        await fetchVitals();
      } catch (err) {
        console.error('❌ [Vitals] Error in fetchVitals on mount:', err);
        setError(`Unable to load vitals: ${err?.message || 'Unknown error'}. The app will continue to work.`);
        setVitals(DEFAULT_VITALS); // Set safe defaults
        setLoading(false);
        setGranted(false);
      }
    };
    
    initializeVitals();
  }, []);

  const refresh = async () => {
    console.log('🔄 [Vitals] Manual refresh triggered');
    await fetchVitals();
  };

  const openSettings = () => {
    console.log('⚙️ [Vitals] Opening Health Connect settings...');
    try {
      if (HealthConnectService && typeof HealthConnectService.openSettings === 'function') {
        HealthConnectService.openSettings();
      } else {
        console.warn('⚠️ [Vitals] HealthConnectService.openSettings not available');
      }
    } catch (error) {
      console.error('❌ [Vitals] Error opening settings:', error);
      // Don't throw - silently fail to prevent crash
    }
  };

  return {
    vitals,
    loading,
    error,
    granted,
    refresh,
    openSettings,
  };
}

