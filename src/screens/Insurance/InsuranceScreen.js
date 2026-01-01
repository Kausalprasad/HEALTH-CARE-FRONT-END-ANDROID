import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from "../../config/config"

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
        <Ionicons name="chevron-down" size={16} color="#666" />
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
          <View style={styles.pickerModalContent}>
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

 const InsuranceScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('predict');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [billResult, setBillResult] = useState(null);
  
  // Prediction Form State
  const [predictionForm, setPredictionForm] = useState({
    operation_name: '',
    operation_cost: '',
    insurance_company: '',
    policy_type: '',
    patient_age: '',
    pre_existing_conditions: '',
    emergency_case: ''
  });

  // Bill Form State
  const [billForm, setBillForm] = useState({
    patient_name: '',
    operation_name: '',
    operation_cost: '',
    claim_amount: '',
    insurance_company: ''
  });

  const handlePrediction = async () => {
    if (!predictionForm.operation_name || !predictionForm.operation_cost || !predictionForm.patient_age) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const preExistingMap = {
        'None': 0,
        'One': 1,
        'Two': 2,
        'Three +': 3
      };

      const response = await fetch(`${BASE_URL}/api/insurance/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation_name: predictionForm.operation_name,
          operation_cost: parseFloat(predictionForm.operation_cost),
          insurance_company: predictionForm.insurance_company,
          policy_type: predictionForm.policy_type,
          patient_age: parseInt(predictionForm.patient_age),
          pre_existing_conditions: preExistingMap[predictionForm.pre_existing_conditions] || 0,
          emergency_case: predictionForm.emergency_case === 'Yes' ? 1 : 0
        })
      });
      const data = await response.json();
      setPredictionResult(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleBill = async () => {
    if (!billForm.patient_name || !billForm.operation_name || !billForm.operation_cost || !billForm.claim_amount || 
        !billForm.insurance_company) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/insurance/bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: billForm.patient_name,
          operation_name: billForm.operation_name,
          operation_cost: parseFloat(billForm.operation_cost),
          claim_approved: parseFloat(billForm.claim_amount),
          insurance_company: billForm.insurance_company
        })
      });
      const data = await response.json();
      setBillResult(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  const renderPredictionForm = () => {
    const insuranceCompanyOptions = [
      { label: 'HealthPlus', value: 'HealthPlus' },
      { label: 'MediCare', value: 'MediCare' },
      { label: 'LifeCare', value: 'LifeCare' },
      { label: 'StarHealth', value: 'StarHealth' },
    ];

    const policyTypeOptions = [
      { label: 'Gold', value: 'Gold' },
      { label: 'Silver', value: 'Silver' },
      { label: 'Platinum', value: 'Platinum' },
    ];

    const preExistingOptions = [
      { label: 'None', value: 'None' },
      { label: 'One', value: 'One' },
      { label: 'Two', value: 'Two' },
      { label: 'Three +', value: 'Three +' },
    ];

    const emergencyOptions = [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ];

    return (
      <View style={styles.formCard}>
        <Text style={styles.detailsHeading}>Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Operation Name"
          placeholderTextColor="#999"
          value={predictionForm.operation_name}
          onChangeText={(text) => setPredictionForm({...predictionForm, operation_name: text})}
        />

        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <TextInput
              style={styles.input}
              placeholder="Operation Cost"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={predictionForm.operation_cost}
              onChangeText={(text) => setPredictionForm({...predictionForm, operation_cost: text})}
            />
          </View>
          <View style={styles.inputHalf}>
            <TextInput
              style={styles.input}
              placeholder="Patient Age"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={predictionForm.patient_age}
              onChangeText={(text) => setPredictionForm({...predictionForm, patient_age: text})}
            />
          </View>
        </View>

        <CustomPicker
          selectedValue={predictionForm.insurance_company}
          onValueChange={(value) => setPredictionForm({...predictionForm, insurance_company: value})}
          items={insuranceCompanyOptions}
          placeholder="Insurance Company"
        />

        <CustomPicker
          selectedValue={predictionForm.policy_type}
          onValueChange={(value) => setPredictionForm({...predictionForm, policy_type: value})}
          items={policyTypeOptions}
          placeholder="Policy Type"
        />

        <CustomPicker
          selectedValue={predictionForm.pre_existing_conditions}
          onValueChange={(value) => setPredictionForm({...predictionForm, pre_existing_conditions: value})}
          items={preExistingOptions}
          placeholder="Any Pre-Existing Condition"
        />

        <CustomPicker
          selectedValue={predictionForm.emergency_case}
          onValueChange={(value) => setPredictionForm({...predictionForm, emergency_case: value})}
          items={emergencyOptions}
          placeholder="Is this an Emergency?"
        />
      </View>
    );
  };

  const renderBillForm = () => {
    const insuranceCompanyOptions = [
      { label: 'HealthPlus', value: 'HealthPlus' },
      { label: 'MediCare', value: 'MediCare' },
      { label: 'LifeCare', value: 'LifeCare' },
      { label: 'StarHealth', value: 'StarHealth' },
    ];

    return (
      <View style={styles.formCard}>
        <Text style={styles.detailsHeading}>Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Patient Name"
          placeholderTextColor="#999"
          value={billForm.patient_name}
          onChangeText={(text) => setBillForm({...billForm, patient_name: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Operation Name"
          placeholderTextColor="#999"
          value={billForm.operation_name}
          onChangeText={(text) => setBillForm({...billForm, operation_name: text})}
        />

        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <TextInput
              style={styles.input}
              placeholder="Operation Cost"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={billForm.operation_cost}
              onChangeText={(text) => setBillForm({...billForm, operation_cost: text})}
            />
          </View>
          <View style={styles.inputHalf}>
            <TextInput
              style={styles.input}
              placeholder="Claim Amount"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={billForm.claim_amount}
              onChangeText={(text) => setBillForm({...billForm, claim_amount: text})}
            />
          </View>
        </View>

        <CustomPicker
          selectedValue={billForm.insurance_company}
          onValueChange={(value) => setBillForm({...billForm, insurance_company: value})}
          items={insuranceCompanyOptions}
          placeholder="Insurance Company"
        />
      </View>
    );
  };

  const renderPredictionResult = () => (
    <Modal visible={!!predictionResult} animationType="slide" transparent={true}>
      <View style={styles.resultModalOverlay}>
        <View style={styles.resultModalContent}>
          {/* Header */}
          <View style={styles.resultModalHeader}>
            <TouchableOpacity 
              style={styles.resultModalCloseButton}
              onPress={() => setPredictionResult(null)}
              activeOpacity={1}
            >
              <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.resultModalHeaderSpacer} />
            <TouchableOpacity 
              style={styles.resultModalInfoButton}
              activeOpacity={1}
            >
              <Ionicons name="information-circle" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Operation Card */}
            <View style={styles.resultInfoCard}>
              <View style={styles.resultInfoCardHeader}>
                <Text style={styles.resultInfoLabel}>Operation</Text>
                <Ionicons name="medical" size={20} color="#42A5F5" />
              </View>
              <Text style={styles.resultInfoValue}>{predictionResult?.operation_name || 'N/A'}</Text>
            </View>

            {/* Total Cost Card */}
            <View style={styles.resultInfoCard}>
              <View style={styles.resultInfoCardHeader}>
                <Text style={styles.resultInfoLabel}>Total Cost</Text>
              </View>
              <View style={styles.resultValueWithIcon}>
                <Text style={styles.rupeeIcon}>₹</Text>
                <Text style={styles.resultInfoValue}>{predictionResult?.operation_cost?.toLocaleString() || '0'}</Text>
              </View>
            </View>

            {/* Claim Approved Card - Purple Highlight */}
            <View style={styles.claimApprovedCard}>
              <Text style={styles.claimApprovedLabel}>Claim Approved</Text>
              <Text style={styles.claimApprovedValue}>
                ₹{predictionResult?.claim_approved?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
              </Text>
              <Text style={styles.claimApprovedPercentage}>
                {predictionResult?.approval_percentage || 0}% Coverage
              </Text>
            </View>

            {/* Patient Payment Card */}
            <View style={styles.resultInfoCard}>
              <View style={styles.resultInfoCardHeader}>
                <Text style={styles.resultInfoLabel}>Patient Payment</Text>
              </View>
              <View style={styles.resultValueWithIcon}>
                <Text style={styles.rupeeIconRed}>₹</Text>
                <Text style={styles.resultInfoValueRed}>
                  {predictionResult?.patient_payment?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.resultActionButtons}>
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderBillResult = () => (
    <Modal visible={!!billResult} animationType="slide" transparent={true}>
      <View style={styles.resultModalOverlay}>
        <View style={styles.resultModalContent}>
          {/* Header */}
          <View style={styles.resultModalHeader}>
            <TouchableOpacity 
              style={styles.resultModalCloseButton}
              onPress={() => setBillResult(null)}
              activeOpacity={1}
            >
              <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.resultModalTitle}>Medical Bill</Text>
            <TouchableOpacity 
              style={styles.resultModalInfoButton}
              activeOpacity={1}
            >
              <Ionicons name="information-circle" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.resultScrollView}>
            {/* Bill Info Card */}
            <View style={styles.billInfoCard}>
              <Text style={styles.billNumberText}>Bill #{billResult?.bill_number || 'N/A'}</Text>
              <Text style={styles.billDateText}>{billResult?.bill_date || 'N/A'}</Text>
            </View>

            {/* Patient Info Card */}
            <View style={styles.billPatientInfoCard}>
              <Text style={styles.billPatientName}>{billResult?.patient_info?.name || 'N/A'}</Text>
              <Text style={styles.billPatientDetail}>Hospital: {billResult?.patient_info?.hospital || 'N/A'}</Text>
              <Text style={styles.billPatientDetail}>Operation: {billResult?.patient_info?.operation || 'N/A'}</Text>
            </View>

            {/* Cost Breakdown */}
            <View style={styles.billSectionCard}>
              <Text style={styles.billSectionTitle}>Cost Breakdown</Text>
              {billResult?.cost_breakdown && Object.entries(billResult.cost_breakdown).map(([key, value]) => (
                <View key={key} style={styles.billCostRow}>
                  <Text style={styles.billCostLabel}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
                  <Text style={styles.billCostValue}>₹{value?.toLocaleString() || '0'}</Text>
                </View>
              ))}
            </View>

            {/* Insurance Claim */}
            <View style={styles.billSectionCard}>
              <Text style={styles.billSectionTitle}>Insurance Claim</Text>
              <View style={styles.billCostRow}>
                <Text style={styles.billCostLabel}>CLAIM APPROVED</Text>
                <Text style={styles.billCostValueSuccess}>₹{billResult?.insurance_claim?.claim_approved?.toLocaleString() || '0'}</Text>
              </View>
              <View style={styles.billCostRow}>
                <Text style={styles.billCostLabel}>CLAIM REJECTED</Text>
                <Text style={styles.billCostValueWarning}>₹{billResult?.insurance_claim?.claim_rejected?.toLocaleString() || '0'}</Text>
              </View>
            </View>

            {/* Final Summary - Purple Gradient Card */}
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.billFinalSummary}
            >
              <View style={styles.billSummaryRow}>
                <Text style={styles.billSummaryLabel}>Total Bill</Text>
                <Text style={styles.billSummaryValue}>₹{billResult?.payment_summary?.total_bill_amount?.toLocaleString() || '0'}</Text>
              </View>
              <View style={styles.billSummaryRow}>
                <Text style={styles.billSummaryLabel}>Insurance Covers</Text>
                <Text style={styles.billSummaryValueCovers}>
                  -₹{billResult?.payment_summary?.insurance_covers?.toLocaleString() || '0'}
                </Text>
              </View>
              <View style={styles.billSummaryFinalRow}>
                <Text style={styles.billSummaryFinalLabel}>Patient Must Pay</Text>
                <Text style={styles.billSummaryFinalValue}>
                  ₹{billResult?.payment_summary?.patient_must_pay?.toLocaleString() || '0'}
                </Text>
              </View>
            </LinearGradient>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.resultActionButtons}>
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Insurance</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('predict')}
          >
            <Text style={[styles.tabText, activeTab === 'predict' && styles.activeTabText]}>
              Prediction
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('bill')}
          >
            <Text style={[styles.tabText, activeTab === 'bill' && styles.activeTabText]}>
              Generate Bill
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'predict' ? renderPredictionForm() : renderBillForm()}
        </ScrollView>

        {/* Submit Button */}
        {activeTab === 'predict' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handlePrediction} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Generate Claim Prediction</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'bill' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleBill} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Generate Bill</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {renderPredictionResult()}
        {renderBillResult()}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
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
  headerSpacer: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 24,
  },
  tab: {
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#666',
  },
  activeTabText: {
    fontSize: 27,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#9C27B0',
    textDecorationLine: 'underline',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  detailsHeading: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#000',
    marginBottom: 16,
    borderWidth: 0,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
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
    marginBottom: 16,
  },
  customPickerText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: {
    backgroundColor: '#F3E5F5',
  },
  modalItemText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#000',
  },
  modalItemTextSelected: {
    color: '#9C27B0',
    fontWeight: '600',
  },
  // Result Modal Styles
  resultModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  resultModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resultModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalInfoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalHeaderSpacer: {
    flex: 1,
  },
  resultModalTitle: {
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
  },
  resultScrollView: {
    maxHeight: 400,
  },
  resultInfoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultInfoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultInfoLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  resultInfoValue: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
  },
  resultInfoValueRed: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#E74C3C',
  },
  resultValueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rupeeIcon: {
    fontSize: 18,
    color: '#9C27B0',
    fontWeight: '600',
    marginRight: 4,
  },
  rupeeIconRed: {
    fontSize: 18,
    color: '#E74C3C',
    fontWeight: '600',
    marginRight: 4,
  },
  claimApprovedCard: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  claimApprovedLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  claimApprovedValue: {
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  claimApprovedPercentage: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#FFF',
    opacity: 0.9,
  },
  resultActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#FFF',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#2196F3',
  },
  // Bill Result Styles
  billInfoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  billNumberText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  billDateText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#666',
  },
  billPatientInfoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  billPatientName: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  billPatientDetail: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#666',
    marginBottom: 4,
  },
  billSectionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  billSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  billCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  billCostLabel: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#666',
  },
  billCostValue: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#000',
  },
  billCostValueSuccess: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#27AE60',
  },
  billCostValueWarning: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#E74C3C',
  },
  billFinalSummary: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  billSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billSummaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#FFF',
  },
  billSummaryValue: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#FFF',
  },
  billSummaryValueCovers: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#FFF',
  },
  billSummaryFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  billSummaryFinalLabel: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#FFF',
  },
  billSummaryFinalValue: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#FFF',
  },
  billHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 16,
  },
  billNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7475B4',
  },
  billDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  patientInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  patientDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 12,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  billLabel: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  billValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  billValueSuccess: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  billValueWarning: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  totalSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  totalValueSuccess: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#7475B4',
  },
  finalLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  finalValue: {
    fontSize: 22,
    color: '#7475B4',
    fontWeight: 'bold',
  },
});
export default InsuranceScreen;