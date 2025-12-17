import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CustomPicker = ({ selectedValue, onValueChange, items, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const getLabel = () => {
    const selected = items.find(item => item.value === selectedValue);
    return selected ? selected.label : placeholder;
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.customPickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.customPickerText, !selectedValue && styles.placeholderText]}>
          {getLabel()}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScroll}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalItem,
                    selectedValue === item.value && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedValue === item.value && styles.modalItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default function PCOSScreening() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    irregular_cycles: false,
    excess_hair_growth: false,
    acne: false,
    hair_loss: false,
    weight_difficulty: false,
    age: '',
    weight: '',
    height: '',
    family_history: '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.age || !formData.weight || !formData.height) {
      Alert.alert('Error', 'Please fill in age, weight, and height');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        irregular_cycles: formData.irregular_cycles,
        excess_hair_growth: formData.excess_hair_growth,
        acne: formData.acne,
        hair_loss: formData.hair_loss,
        weight_difficulty: formData.weight_difficulty,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        family_history: formData.family_history === true || formData.family_history === 'true' || formData.family_history === 'Yes' || formData.family_history === 'yes',
      };

      const response = await fetch(
        'https://jjag4lud55o7krdda4rnr37zta0fisis.lambda-url.ap-south-1.on.aws/pcos-screening',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get screening results');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      Alert.alert('Error', 'Unable to process screening. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return '#F44336';
      case 'moderate':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const CheckBox = ({ checked, onPress, label }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color="#FFF" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderResults = () => {
    const riskPercent = parseFloat(result.risk_score) || 0;
    const riskLevel = result.risk_level || 'Low';
    const radius = 76;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (riskPercent / 100) * circumference;
    const progressColor = getRiskColor(riskLevel);

    return (
      <View style={styles.resultsContainer}>
        {/* Risk Score Circle */}
        <View style={styles.riskCircleContainer}>
          <Svg height="160" width="160" style={styles.circularProgressSvg}>
            <Circle
              cx="80" cy="80" r={radius} stroke="#E0E0E0" strokeWidth="8" fill="none"
            />
            <Circle
              cx="80" cy="80" r={radius}
              stroke={progressColor}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90, 80, 80)"
            />
          </Svg>
          <View style={styles.riskCircleInner}>
            <Text style={styles.riskNumber}>{riskPercent.toFixed(0)}%</Text>
            <Text style={[styles.riskLevelText, { color: progressColor }]}>
              {riskLevel}
            </Text>
          </View>
        </View>

        {/* Recommendation Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="megaphone" size={20} color="#FF9800" />
            <Text style={styles.cardTitle}>Recommendation</Text>
          </View>
          <Text style={styles.recommendationText}>
            {result.recommendation}
          </Text>
        </View>

        {/* Next Steps Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle" size={20} color="#00BCD4" />
            <Text style={styles.cardTitle}>Next Steps</Text>
          </View>
          {result.next_steps?.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <Text style={styles.stepBullet}>•</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Download and Share Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
          <LinearGradient
            colors={['#9C27B0', '#E91E63', '#FF9800']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButton}
          >
            <TouchableOpacity>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Symptoms</Text>
      
      <CheckBox
        checked={formData.irregular_cycles}
        onPress={() => setFormData({ ...formData, irregular_cycles: !formData.irregular_cycles })}
        label="Irregular menstrual cycle"
      />
      <CheckBox
        checked={formData.excess_hair_growth}
        onPress={() => setFormData({ ...formData, excess_hair_growth: !formData.excess_hair_growth })}
        label="Excess hair growth (face, chest, back)"
      />
      <CheckBox
        checked={formData.acne}
        onPress={() => setFormData({ ...formData, acne: !formData.acne })}
        label="Acne or oily skin"
      />
      <CheckBox
        checked={formData.hair_loss}
        onPress={() => setFormData({ ...formData, hair_loss: !formData.hair_loss })}
        label="Hair loss or thinning"
      />
      <CheckBox
        checked={formData.weight_difficulty}
        onPress={() => setFormData({ ...formData, weight_difficulty: !formData.weight_difficulty })}
        label="Difficulty maintaining weight"
      />

      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            keyboardType="numeric"
            placeholder="Age"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.inputHalf}>
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            keyboardType="numeric"
            placeholder="Weight (kg)"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <TextInput
            style={styles.input}
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
            keyboardType="numeric"
            placeholder="Height (cm)"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.inputHalf}>
          <CustomPicker
            selectedValue={formData.family_history}
            onValueChange={(value) => setFormData({ ...formData, family_history: value })}
            items={[
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ]}
            placeholder="Family History"
          />
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['rgba(254, 215, 112, 0.9)', 'rgba(235, 177, 180, 0.8)', 'rgba(145, 230, 251, 0.7)', 'rgba(217, 213, 250, 0.6)']}
      locations={[0, 0.3, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (navigation && navigation.goBack ? navigation.goBack() : null)}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PCOS Screening</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {result ? renderResults() : renderForm()}
        </ScrollView>
        
        {/* Analyze Risk Button - Outside card */}
        {!result && (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Analyze Risk</Text>
            )}
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#000',
    fontFamily: 'Inter',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    width: width - 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    fontFamily: 'Inter',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#000',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter',
  },
  customPickerButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customPickerText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: '80%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  modalItemText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter',
  },
  modalItemTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  resultsContainer: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  riskCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  circularProgressSvg: {
    position: 'absolute',
  },
  riskCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  riskNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Inter',
  },
  riskLevelText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Inter',
  },
  recommendationText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  stepBullet: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    marginTop: 2,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
