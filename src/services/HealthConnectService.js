import { Platform, NativeModules, TurboModuleRegistry } from 'react-native';

// Check if we're in development mode
const __DEV__ = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

// Lazy loading - only load module when needed, not at import time
let requestPermissionFn = null;
let initializeFn = null;
let readRecordsFn = null;
let openHealthConnectSettingsFn = null;
let nativeHealthConnect = null;
let isAvailable = false;
let moduleLoadAttempted = false;
let healthConnectModule = null;

// Check if native module exists without requiring it
// This is CRITICAL to prevent crashes in production
function checkNativeModuleExists() {
  try {
    // Check if we can access the native module via NativeModules
    if (NativeModules && typeof NativeModules === 'object') {
      const moduleNames = Object.keys(NativeModules);
      
      // Look for HealthConnect module specifically
      // Common names: HealthConnect, HealthConnectModule, RNHealthConnect, etc.
      const healthConnectNames = [
        'HealthConnect',
        'HealthConnectModule',
        'RNHealthConnect',
        'HealthConnectTurboModule',
      ];
      
      const hasHealthConnect = moduleNames.some(name => {
        const lowerName = name.toLowerCase();
        return healthConnectNames.some(hcName => 
          lowerName === hcName.toLowerCase() || 
          lowerName.includes('healthconnect')
        );
      });
      
      // Also check TurboModuleRegistry if available (for new architecture)
      let hasTurboModule = false;
      try {
        if (typeof TurboModuleRegistry !== 'undefined' && TurboModuleRegistry.get) {
          const tm = TurboModuleRegistry.get('HealthConnect');
          hasTurboModule = !!tm;
        }
      } catch (tmErr) {
        // Ignore TurboModule errors
      }
      
      const exists = hasHealthConnect || hasTurboModule;
      console.log('🔍 [HealthConnectService] Native module check:', {
        exists,
        hasHealthConnect,
        hasTurboModule,
        moduleNames: moduleNames.slice(0, 10) // Log first 10 for debugging
      });
      
      return exists;
    }
  } catch (checkErr) {
    // If check fails, DON'T assume module exists - return false to prevent crash
    console.warn('⚠️ [HealthConnectService] Error checking native module:', checkErr?.message);
    return false;
  }
  return false;
}

// Lazy load the module only when first needed
function loadHealthConnectModule() {
  if (moduleLoadAttempted) {
    return healthConnectModule;
  }
  
  moduleLoadAttempted = true;
  
  // CRITICAL: In production, if module isn't linked, require() can cause native crash
  // So we check NativeModules FIRST and only require if module exists
  if (Platform.OS !== 'android') {
    console.warn('⚠️ [HealthConnectService] Not Android platform - module not loaded');
    isAvailable = false;
    return null;
  }

  // First, check if native module exists in NativeModules
  // This is safer than requiring directly
  const mightExist = checkNativeModuleExists();
  if (!mightExist) {
    console.warn('⚠️ [HealthConnectService] Native module not detected - skipping require to prevent crash');
    isAvailable = false;
    return null;
  }
  
  // PRODUCTION APK: Try to require module if it exists in NativeModules
  // This will work if module is properly linked in APK build
  let requireResult = null;
  let requireError = null;
  
  try {
    // Verify require exists
    if (typeof require === 'undefined') {
      console.warn('⚠️ [HealthConnectService] require() not available');
      isAvailable = false;
      return null;
    }
    
    // Try to require the module - wrap in complete error handling
    // If module is properly linked, this will work
    // If not linked, error will be caught and app won't crash
    try {
      requireResult = require('react-native-health-connect');
      console.log('✅ [HealthConnectService] Module require() successful');
    } catch (requireErr) {
      requireError = requireErr;
      const errorMsg = requireErr?.message || requireErr?.toString() || 'Unknown error';
      console.warn('⚠️ [HealthConnectService] Module require() failed (non-fatal):', errorMsg);
    }
    
  } catch (outerErr) {
    requireError = outerErr;
    console.warn('⚠️ [HealthConnectService] Outer error in require():', outerErr?.message);
  }
  
  // If require failed, gracefully return - don't crash
  if (requireError || !requireResult) {
    console.warn('⚠️ [HealthConnectService] Module not available - Health Connect unavailable');
    console.warn('⚠️ [HealthConnectService] This is normal if module is not properly linked in APK');
    console.warn('⚠️ [HealthConnectService] App will continue working - Health Connect feature disabled');
    isAvailable = false;
    return null;
  }
  
  // Module require successful - set it up
  healthConnectModule = requireResult;
  
  // Check if module exists and has required functions
  try {
    if (healthConnectModule && typeof healthConnectModule === 'object') {
      // Check if functions exist before assigning
      if (typeof healthConnectModule.requestPermission === 'function') {
        requestPermissionFn = healthConnectModule.requestPermission;
      }
      if (typeof healthConnectModule.initialize === 'function') {
        initializeFn = healthConnectModule.initialize;
      }
      if (typeof healthConnectModule.readRecords === 'function') {
        readRecordsFn = healthConnectModule.readRecords;
      }
      if (typeof healthConnectModule.openHealthConnectSettings === 'function') {
        openHealthConnectSettingsFn = healthConnectModule.openHealthConnectSettings;
      }
      
      // Only mark as available if at least one function is available
      isAvailable = !!(requestPermissionFn || initializeFn || readRecordsFn);
      
      if (!isAvailable) {
        console.warn('⚠️ [HealthConnectService] Module loaded but no functions available');
      } else {
        console.log('✅ [HealthConnectService] Module functions loaded successfully');
      }
    } else {
      console.warn('⚠️ [HealthConnectService] Module is not a valid object');
      isAvailable = false;
    }
  } catch (e) {
    // Catch any other unexpected errors
    const errorMsg = e?.message || e?.toString() || 'Unknown error';
    console.error('❌ [HealthConnectService] Error loading module:', errorMsg);
    healthConnectModule = null;
    isAvailable = false;
  }
  
  return healthConnectModule;
}

class HealthConnectService {
  constructor() {
    this.permissions = [];
    this.isAvailable = false; // Will be set after lazy load
  }

  checkAvailability() {
    // Lazy load module on first availability check
    // This will safely handle errors without crashing
    if (!moduleLoadAttempted) {
      try {
        loadHealthConnectModule();
      } catch (err) {
        console.warn('⚠️ [HealthConnectService] Error loading module (non-fatal):', err);
        isAvailable = false;
        this.isAvailable = false;
        return false;
      }
    }
    this.isAvailable = isAvailable;
    return this.isAvailable;
  }

  async initialize() {
    console.log('🚀 [HealthConnectService] Initializing...');
    
    if (Platform.OS !== 'android') {
      console.warn('⚠️ [HealthConnectService] Not Android platform');
      return false;
    }

    // Lazy load module if not already loaded
    if (!moduleLoadAttempted) {
      loadHealthConnectModule();
    }

    // Re-check availability after loading
    this.isAvailable = isAvailable;

    if (!this.isAvailable || !initializeFn) {
      console.warn('⚠️ [HealthConnectService] Module not available after load attempt');
      return false;
    }

    try {
      console.log('📞 [HealthConnectService] Calling initialize function...');
      const ok = await initializeFn();
      console.log('✅ [HealthConnectService] Initialize result:', ok);
      return ok || false;
    } catch (err) {
      console.error('❌ [HealthConnectService] Initialize error:', err);
      // Don't throw - return false instead to prevent crash
      return false;
    }
  }

  async requestPermissions(types = []) {
    console.log('🔐 [HealthConnectService] requestPermissions called');
    
    // Lazy load module if not already loaded
    if (!moduleLoadAttempted) {
      loadHealthConnectModule();
    }
    
    // Re-check availability after loading
    this.isAvailable = isAvailable;
    
    if (!this.isAvailable || !requestPermissionFn) {
      const error = 'Health Connect module not available';
      console.error('❌ [HealthConnectService]', error);
      // Return empty array instead of throwing to prevent crash
      return [];
    }

    const perms = types.length
      ? types
      : [
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'Distance' },
          { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
          { accessType: 'read', recordType: 'SleepSession' },
          { accessType: 'read', recordType: 'OxygenSaturation' },
          { accessType: 'read', recordType: 'BloodPressure' },
        ];

    console.log('📋 [HealthConnectService] Requesting permissions:', perms.length);

    try {
      // Use the wrapper function - it should handle everything correctly in v3.4.0
      if (requestPermissionFn) {
        console.log('📞 [HealthConnectService] Calling requestPermission wrapper...');
        this.permissions = await requestPermissionFn(perms);
        console.log('✅ [HealthConnectService] Permissions granted:', this.permissions?.length || 0);
        return this.permissions || [];
      }
      
      throw new Error('requestPermission method not available');
    } catch (err) {
      console.error('❌ [HealthConnectService] requestPermission error:', err);
      console.error('❌ [HealthConnectService] Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // Return empty array instead of throwing to prevent crash
      // The UI will handle showing permission request screen
      console.warn('⚠️ [HealthConnectService] Returning empty permissions array to prevent crash');
      return [];
    }
  }

  hasPermission(recordType) {
    return this.permissions.some(p => p.recordType === recordType);
  }

  async read(recordType, filter) {
    console.log(`📖 [HealthConnectService] Reading ${recordType}...`);
    
    // Lazy load module if not already loaded
    if (!moduleLoadAttempted) {
      loadHealthConnectModule();
    }
    
    // Re-check availability after loading
    this.isAvailable = isAvailable;
    
    if (!this.isAvailable || !readRecordsFn) {
      console.warn(`⚠️ [HealthConnectService] Module not available for ${recordType}`);
      return [];
    }

    if (!this.hasPermission(recordType)) {
      console.warn(`⚠️ [HealthConnectService] No permission for ${recordType}`);
      return [];
    }

    try {
      const res = await readRecordsFn(recordType, { timeRangeFilter: filter });
      console.log(`✅ [HealthConnectService] ${recordType} records:`, res.records?.length || 0);
      return res.records;
    } catch (err) {
      console.error(`❌ [HealthConnectService] Error reading ${recordType}:`, err);
      return [];
    }
  }

  openSettings() {
    try {
      // Lazy load module if not already loaded
      if (!moduleLoadAttempted) {
        loadHealthConnectModule();
      }
      
      // Re-check availability after loading
      this.isAvailable = isAvailable;
      
      if (!this.isAvailable || !openHealthConnectSettingsFn) {
        console.warn('⚠️ [HealthConnectService] Cannot open settings - module not available');
        // Don't throw - return safely
        return;
      }
      
      try {
        const result = openHealthConnectSettingsFn();
        return result;
      } catch (err) {
        console.error('❌ [HealthConnectService] Error opening settings:', err);
        // Don't throw - return safely to prevent crash
        return;
      }
    } catch (error) {
      console.error('❌ [HealthConnectService] Fatal error in openSettings:', error);
      // Don't throw - return safely to prevent crash
      return;
    }
  }
}

export default new HealthConnectService();

