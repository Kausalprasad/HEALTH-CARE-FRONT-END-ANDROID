import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  View,
  Text,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useHealthData from '../../hooks/useHealthData';
import PermissionHandler from './PermissionHandler';

const { width } = Dimensions.get('window');

// Formatting functions
const getHeartRate = (vitals) => {
  const rawValue = vitals?.heartRate;
  if (!rawValue || rawValue === 0) return '--';
  return Math.round(rawValue);
};

const getBloodPressure = (vitals) => {
  const rawValue = vitals?.bloodPressure;
  if (!rawValue || (!rawValue.systolic && !rawValue.diastolic)) {
    return { display: '--/--', systolic: 0, diastolic: 0 };
  }
  return {
    display: `${Math.round(rawValue.systolic)}/${Math.round(rawValue.diastolic)}`,
    systolic: rawValue.systolic,
    diastolic: rawValue.diastolic
  };
};

const getSteps = (vitals) => {
  const rawValue = vitals?.steps;
  if (!rawValue || rawValue === 0) return '--';
  return Math.round(rawValue).toLocaleString();
};

const getDistance = (vitals) => {
  const rawValue = vitals?.distance;
  if (!rawValue || rawValue === 0) return '--';
  return (rawValue / 1000).toFixed(2);
};

const getActiveCalories = (vitals) => {
  const rawValue = vitals?.activeCalories;
  if (!rawValue || rawValue === 0) return '--';
  return Math.round(rawValue);
};

const getSleep = (vitals) => {
  const rawValue = vitals?.sleepDuration;
  if (!rawValue || rawValue === 0) return { hours: '--', mins: '--' };
  const hours = Math.floor(rawValue / 60);
  const mins = rawValue % 60;
  return { hours, mins };
};

const getBloodOxygen = (vitals) => {
  const rawValue = vitals?.bloodOxygen;
  if (!rawValue || rawValue === 0) return '--';
  return Math.round(rawValue);
};

const generateStepsBars = () => {
  const heights = [25, 35, 30, 25, 40, 55, 45, 40, 50, 45, 35, 55];
  return heights.map(height => ({ height, color: '#60A5FA' }));
};

const generateBPBars = (vitals) => {
  const bp = getBloodPressure(vitals);
  const baseHeights = [35, 30, 40, 50, 35, 45, 30, 40, 50, 35];
  
  return baseHeights.map((height) => {
    let color = '#34D399';
    if (bp.systolic > 140 || bp.diastolic > 90) {
      color = '#34D399';
    }
    return { height, color };
  });
};

const LoadingScreen = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingEmoji}>⚡</Text>
      <Text style={styles.loadingTitle}>Loading Your Health Data</Text>
      <Text style={styles.loadingSubtitle}>Please wait...</Text>
    </View>
  </SafeAreaView>
);

const ErrorScreen = ({ error, onRefresh }) => {
  const isModuleError = error?.includes('not linked') || error?.includes('not available');
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>{isModuleError ? '⚠️' : '😔'}</Text>
        <Text style={styles.errorTitle}>
          {isModuleError ? 'Development Build Required' : 'Something went wrong'}
        </Text>
        <Text style={styles.errorMessage}>{error}</Text>
        
        {isModuleError && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to fix:</Text>
            <Text style={styles.instructionsText}>
              1. Stop using Expo Go{'\n'}
              2. Run: npx expo prebuild{'\n'}
              3. Run: npx expo run:android{'\n'}
              4. Or use EAS Build
            </Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function VitalsDashboard() {
  const navigation = useNavigation();
  const { vitals, loading, error, granted, refresh, openSettings } = useHealthData();
  const [refreshing, setRefreshing] = useState(false);

  console.log('📱 [VitalsDashboard] Component rendered');
  console.log('📊 [VitalsDashboard] State:', {
    loading,
    error: error ? error.substring(0, 50) + '...' : null,
    granted,
    vitals: vitals ? {
      steps: vitals.steps,
      heartRate: vitals.heartRate,
      distance: vitals.distance,
      activeCalories: vitals.activeCalories,
      sleepDuration: vitals.sleepDuration,
      bloodOxygen: vitals.bloodOxygen,
      bloodPressure: vitals.bloodPressure,
    } : null,
  });

  const onRefresh = async () => {
    console.log('🔄 [VitalsDashboard] Pull to refresh triggered');
    setRefreshing(true);
    try {
      await refresh();
      console.log('✅ [VitalsDashboard] Refresh completed');
    } catch (err) {
      console.error('❌ [VitalsDashboard] Refresh error:', err);
    } finally {
      setRefreshing(false);
      console.log('🏁 [VitalsDashboard] Refresh finished');
    }
  };

  if (loading) {
    console.log('⏳ [VitalsDashboard] Showing loading screen');
    return <LoadingScreen />;
  }

  if (error) {
    console.log('❌ [VitalsDashboard] Showing error screen:', error);
    return <ErrorScreen error={error} onRefresh={onRefresh} />;
  }

  if (!granted) {
    console.log('🔒 [VitalsDashboard] Showing permission handler');
    const handleOpenSettings = () => {
      try {
        if (openSettings && typeof openSettings === 'function') {
          openSettings();
        } else {
          console.warn('⚠️ [VitalsDashboard] openSettings function not available');
        }
      } catch (error) {
        console.error('❌ [VitalsDashboard] Error in handleOpenSettings:', error);
      }
    };
    return <PermissionHandler onOpenSettings={handleOpenSettings} />;
  }

  console.log('📊 [VitalsDashboard] Processing vitals data for display');
  
  // Ensure vitals has safe defaults to prevent crashes
  const safeVitals = vitals || {
    steps: 0,
    heartRate: 0,
    distance: 0,
    activeCalories: 0,
    sleepDuration: 0,
    bloodOxygen: 0,
    bloodPressure: { systolic: 0, diastolic: 0 },
  };
  
  const heartRate = getHeartRate(safeVitals);
  const bloodPressure = getBloodPressure(safeVitals);
  const steps = getSteps(safeVitals);
  const calories = getActiveCalories(safeVitals);
  const sleep = getSleep(safeVitals);
  const bloodOxygen = getBloodOxygen(safeVitals);
  const stepsBars = generateStepsBars();
  const bpBars = generateBPBars(safeVitals);

  console.log('📈 [VitalsDashboard] Display values:', {
    heartRate,
    bloodPressure: bloodPressure.display,
    steps,
    calories,
    sleep: `${sleep.hours}h ${sleep.mins}m`,
    bloodOxygen,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vitals</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {/* Steps Card - Full Width */}
        <View style={styles.fullCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Steps</Text>
            <Text style={styles.cardTime}>Today</Text>
          </View>
          
          <View style={styles.stepsGraphContainer}>
            <View style={styles.stepsGraph}>
              {stepsBars.map((bar, index) => (
                <View 
                  key={index}
                  style={[
                    styles.stepsBar, 
                    { 
                      height: bar.height, 
                      backgroundColor: bar.color 
                    }
                  ]} 
                />
              ))}
            </View>
          </View>
          <View style={styles.cardValueContainer}>
            <Text style={styles.cardMainValue}>{steps}</Text>
            <Text style={styles.cardUnit}> steps</Text>
          </View>
        </View>

        {/* Calories & Heart Rate Row */}
        <View style={styles.cardRow}>
          {/* Calories Card */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Calories</Text>
              <Text style={styles.cardTime}>Today</Text>
            </View>
            
            <View style={styles.heartRateGraph}>
              <Svg width="100%" height="60" viewBox="0 0 140 60">
                <Path
                  d="M 0 35 L 10 35 L 15 25 L 20 45 L 25 15 L 30 35 L 40 35 L 45 25 L 50 45 L 55 20 L 60 35 L 70 35 L 75 28 L 80 42 L 85 22 L 90 35 L 100 35 L 105 28 L 110 42 L 115 25 L 120 35 L 130 35 L 135 30 L 140 38"
                  stroke="#FF6B9D"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardMainValue}>{calories}</Text>
              <Text style={styles.cardUnit}> kcal</Text>
            </View>
          </View>

          {/* Heart Rate Card */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Heart Rate</Text>
              <Text style={styles.cardTime}>15 min ago</Text>
            </View>
            
            <View style={styles.heartRateGraph}>
              <Svg width="100%" height="60" viewBox="0 0 140 60">
                <Path
                  d="M 0 35 L 10 35 L 15 20 L 20 48 L 25 10 L 30 35 L 40 35 L 45 22 L 50 46 L 55 15 L 60 35 L 70 35 L 75 24 L 80 44 L 85 18 L 90 35 L 100 35 L 105 25 L 110 43 L 115 20 L 120 35 L 130 35 L 135 28 L 140 40"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardMainValue}>{heartRate}</Text>
              <Text style={styles.cardUnit}> bpm</Text>
            </View>
          </View>
        </View>

        {/* Body Indicators Section */}
        <Text style={styles.sectionTitle}>Body Indicators</Text>

        {/* Blood Oxygen & Blood Pressure Row */}
        <View style={styles.cardRow}>
          {/* Blood Oxygen Card */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Blood Oxygen</Text>
              <Text style={styles.cardTime}>15 min ago</Text>
            </View>
            
            <View style={styles.heartRateGraph}>
              <Svg width="100%" height="60" viewBox="0 0 140 60">
                <Path
                  d="M 0 35 L 10 35 L 15 28 L 20 42 L 25 25 L 30 35 L 40 35 L 45 30 L 50 40 L 55 28 L 60 35 L 70 35 L 75 32 L 80 38 L 85 30 L 90 35 L 100 35 L 105 32 L 110 38 L 115 32 L 120 35 L 130 35 L 135 33 L 140 37"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardMainValue}>{bloodOxygen}</Text>
              <Text style={styles.cardUnit}> %</Text>
            </View>
          </View>

          {/* Blood Pressure Card */}
          <View style={styles.halfCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Blood Pressure</Text>
              <Text style={styles.cardTime}>15 min ago</Text>
            </View>
            
            <View style={styles.bpGraphContainer}>
              <View style={styles.bpGraph}>
                {bpBars.map((bar, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.bpBar, 
                      { 
                        height: bar.height, 
                        backgroundColor: bar.color 
                      }
                    ]} 
                  />
                ))}
              </View>
            </View>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardMainValue}>{bloodPressure.display}</Text>
              <Text style={styles.cardUnit}> sys/dia</Text>
            </View>
          </View>
        </View>

        {/* Sleep Card - Full Width */}
        <View style={styles.fullCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sleep</Text>
            <Text style={styles.cardTime}>Last Night</Text>
          </View>
          
          <View style={styles.sleepTimelineContainer}>
            <Text style={styles.sleepTimeText}>01:35 AM - 08:30 AM</Text>
            <View style={styles.sleepTimeline}>
              <View style={[styles.sleepSegment, { flex: 1, backgroundColor: '#C4B5FD' }]} />
            </View>
          </View>
          <View style={styles.cardValueContainer}>
            <Text style={styles.cardMainValue}>{sleep.hours}</Text>
            <Text style={styles.cardUnit}>h </Text>
            <Text style={styles.cardMainValue}>{sleep.mins}</Text>
            <Text style={styles.cardUnit}> min</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  fullCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 0,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: (width - 44) / 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 0,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  stepsGraphContainer: {
    height: 70,
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  stepsGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    paddingHorizontal: 4,
  },
  stepsBar: {
    width: 8,
    borderRadius: 4,
  },
  heartRateGraph: {
    height: 60,
    marginBottom: 16,
  },
  bpGraphContainer: {
    height: 60,
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  bpGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 4,
  },
  bpBar: {
    width: 8,
    borderRadius: 4,
  },
  sleepTimelineContainer: {
    marginBottom: 16,
  },
  sleepTimeText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  sleepTimeline: {
    flexDirection: 'row',
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sleepSegment: {
    height: '100%',
  },
  cardValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardMainValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  cardUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  bottomSpacer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  instructionsContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

