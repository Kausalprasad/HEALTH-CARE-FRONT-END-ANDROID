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
  Alert
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../config/config"

 const InsuranceScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('predict');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [billResult, setBillResult] = useState(null);
  
  // Prediction Form State
  const [predictionForm, setPredictionForm] = useState({
    operation_name: '',
    operation_cost: '',
    insurance_company: 'MediCare',
    policy_type: 'Platinum',
    patient_age: '',
    pre_existing_conditions: 'None',
    emergency_case: 'Yes'
  });

  // Bill Form State
  const [billForm, setBillForm] = useState({
    patient_name: '',
    operation_name: '',
    operation_cost: '',
    claim_amount: '',
    insurance_company: 'MediCare'
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
    if (!billForm.patient_name || !billForm.operation_name || !billForm.operation_cost || !billForm.claim_amount) {
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

  const renderPredictionForm = () => (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Operation Name"
        placeholderTextColor="#C4C4C4"
        value={predictionForm.operation_name}
        onChangeText={(text) => setPredictionForm({...predictionForm, operation_name: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Operation Cost (₹)"
        placeholderTextColor="#C4C4C4"
        keyboardType="numeric"
        value={predictionForm.operation_cost}
        onChangeText={(text) => setPredictionForm({...predictionForm, operation_cost: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Patient Age"
        placeholderTextColor="#C4C4C4"
        keyboardType="numeric"
        value={predictionForm.patient_age}
        onChangeText={(text) => setPredictionForm({...predictionForm, patient_age: text})}
      />

      <Text style={styles.label}>Insurance Company</Text>
      <View style={styles.buttonGroup}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.insurance_company === 'HealthPlus' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, insurance_company: 'HealthPlus'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.insurance_company === 'HealthPlus' && styles.optionBtnTextActive
            ]}>HealthPlus</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.insurance_company === 'MediCare' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, insurance_company: 'MediCare'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.insurance_company === 'MediCare' && styles.optionBtnTextActive
            ]}>MediCare</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.insurance_company === 'LifeCare' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, insurance_company: 'LifeCare'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.insurance_company === 'LifeCare' && styles.optionBtnTextActive
            ]}>LifeCare</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.insurance_company === 'StarHealth' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, insurance_company: 'StarHealth'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.insurance_company === 'StarHealth' && styles.optionBtnTextActive
            ]}>StarHealth</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>Policy Type</Text>
      <View style={styles.buttonGroup}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.policy_type === 'Gold' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, policy_type: 'Gold'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.policy_type === 'Gold' && styles.optionBtnTextActive
            ]}>Gold</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.policy_type === 'Silver' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, policy_type: 'Silver'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.policy_type === 'Silver' && styles.optionBtnTextActive
            ]}>Silver</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.policy_type === 'Platinum' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, policy_type: 'Platinum'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.policy_type === 'Platinum' && styles.optionBtnTextActive
            ]}>Platinum</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>Any Pre-existing Condition</Text>
      <View style={styles.buttonGroup}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.pre_existing_conditions === 'None' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, pre_existing_conditions: 'None'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.pre_existing_conditions === 'None' && styles.optionBtnTextActive
            ]}>None</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.pre_existing_conditions === 'One' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, pre_existing_conditions: 'One'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.pre_existing_conditions === 'One' && styles.optionBtnTextActive
            ]}>One</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.pre_existing_conditions === 'Two' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, pre_existing_conditions: 'Two'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.pre_existing_conditions === 'Two' && styles.optionBtnTextActive
            ]}>Two</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.pre_existing_conditions === 'Three +' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, pre_existing_conditions: 'Three +'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.pre_existing_conditions === 'Three +' && styles.optionBtnTextActive
            ]}>Three +</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>Is this an emergency</Text>
      <View style={styles.buttonGroup}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.emergency_case === 'Yes' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, emergency_case: 'Yes'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.emergency_case === 'Yes' && styles.optionBtnTextActive
            ]}>Yes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              predictionForm.emergency_case === 'No' && styles.optionBtnActive
            ]}
            onPress={() => setPredictionForm({...predictionForm, emergency_case: 'No'})}
          >
            <Text style={[
              styles.optionBtnText,
              predictionForm.emergency_case === 'No' && styles.optionBtnTextActive
            ]}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handlePrediction} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Get Claim Prediction</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBillForm = () => (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Patient Name"
        placeholderTextColor="#C4C4C4"
        value={billForm.patient_name}
        onChangeText={(text) => setBillForm({...billForm, patient_name: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Operation Name"
        placeholderTextColor="#C4C4C4"
        value={billForm.operation_name}
        onChangeText={(text) => setBillForm({...billForm, operation_name: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Operation Cost (₹)"
        placeholderTextColor="#C4C4C4"
        keyboardType="numeric"
        value={billForm.operation_cost}
        onChangeText={(text) => setBillForm({...billForm, operation_cost: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Claim Amount (₹)"
        placeholderTextColor="#C4C4C4"
        keyboardType="numeric"
        value={billForm.claim_amount}
        onChangeText={(text) => setBillForm({...billForm, claim_amount: text})}
      />

      <Text style={styles.label}>Insurance Company</Text>
      <View style={styles.buttonGroup}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              billForm.insurance_company === 'HealthPlus' && styles.optionBtnActive
            ]}
            onPress={() => setBillForm({...billForm, insurance_company: 'HealthPlus'})}
          >
            <Text style={[
              styles.optionBtnText,
              billForm.insurance_company === 'HealthPlus' && styles.optionBtnTextActive
            ]}>HealthPlus</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              billForm.insurance_company === 'MediCare' && styles.optionBtnActive
            ]}
            onPress={() => setBillForm({...billForm, insurance_company: 'MediCare'})}
          >
            <Text style={[
              styles.optionBtnText,
              billForm.insurance_company === 'MediCare' && styles.optionBtnTextActive
            ]}>MediCare</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionBtn,
              billForm.insurance_company === 'LifeCare' && styles.optionBtnActive
            ]}
            onPress={() => setBillForm({...billForm, insurance_company: 'LifeCare'})}
          >
            <Text style={[
              styles.optionBtnText,
              billForm.insurance_company === 'LifeCare' && styles.optionBtnTextActive
            ]}>LifeCare</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              billForm.insurance_company === 'StarHealth' && styles.optionBtnActive
            ]}
            onPress={() => setBillForm({...billForm, insurance_company: 'StarHealth'})}
          >
            <Text style={[
              styles.optionBtnText,
              billForm.insurance_company === 'StarHealth' && styles.optionBtnTextActive
            ]}>StarHealth</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  );

  const renderPredictionResult = () => (
    <Modal visible={!!predictionResult} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Prediction Result</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Operation</Text>
            <Text style={styles.resultValue}>{predictionResult?.operation_name}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Total Cost</Text>
            <Text style={styles.resultValue}>₹{predictionResult?.operation_cost?.toLocaleString()}</Text>
          </View>

          <View style={styles.highlightCard}>
            <Text style={styles.highlightLabel}>Claim Approved</Text>
            <Text style={styles.highlightValue}>₹{predictionResult?.claim_approved?.toLocaleString()}</Text>
            <Text style={styles.percentageText}>{predictionResult?.approval_percentage}% Coverage</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Patient Payment</Text>
            <Text style={styles.resultValueWarning}>₹{predictionResult?.patient_payment?.toLocaleString()}</Text>
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setPredictionResult(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderBillResult = () => (
    <Modal visible={!!billResult} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalScrollContent}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Medical Bill</Text>
            
            <View style={styles.billHeader}>
              <Text style={styles.billNumber}>Bill #{billResult?.bill_number}</Text>
              <Text style={styles.billDate}>{billResult?.bill_date}</Text>
            </View>

            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{billResult?.patient_info?.name}</Text>
              <Text style={styles.patientDetail}>Hospital: {billResult?.patient_info?.hospital}</Text>
              <Text style={styles.patientDetail}>Operation: {billResult?.patient_info?.operation}</Text>
            </View>

            <Text style={styles.sectionHeader}>Cost Breakdown</Text>
            {billResult?.cost_breakdown && Object.entries(billResult.cost_breakdown).map(([key, value]) => (
              <View key={key} style={styles.billRow}>
                <Text style={styles.billLabel}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
                <Text style={styles.billValue}>₹{value?.toLocaleString()}</Text>
              </View>
            ))}

            <Text style={styles.sectionHeader}>Insurance Claim</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>CLAIM APPROVED</Text>
              <Text style={styles.billValueSuccess}>₹{billResult?.insurance_claim?.claim_approved?.toLocaleString()}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>CLAIM REJECTED</Text>
              <Text style={styles.billValueWarning}>₹{billResult?.insurance_claim?.claim_rejected?.toLocaleString()}</Text>
            </View>

            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Bill</Text>
                <Text style={styles.totalValue}>₹{billResult?.payment_summary?.total_bill_amount?.toLocaleString()}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Insurance Covers</Text>
                <Text style={styles.totalValueSuccess}>-₹{billResult?.payment_summary?.insurance_covers?.toLocaleString()}</Text>
              </View>
              <View style={styles.finalTotal}>
                <Text style={styles.finalLabel}>Patient Must Pay</Text>
                <Text style={styles.finalValue}>₹{billResult?.payment_summary?.patient_must_pay?.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setBillResult(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
    <View style={styles.header}>
  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
    <Ionicons name="chevron-back" size={24} color="#000" />
  </TouchableOpacity>

  <Text style={styles.headerTitle}>Insurance</Text>

  {/* Spacer for alignment */}
  <View style={styles.headerSpacer} />
</View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'predict' && styles.tabActive]}
            onPress={() => setActiveTab('predict')}
          >
            <Text style={[styles.tabText, activeTab === 'predict' && styles.tabTextActive]}>
              Prediction
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bill' && styles.tabActive]}
            onPress={() => setActiveTab('bill')}
          >
            <Text style={[styles.tabText, activeTab === 'bill' && styles.tabTextActive]}>
              Generate Bill
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollContent} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'predict' ? renderPredictionForm() : renderBillForm()}
      </ScrollView>

      {renderPredictionResult()}
      {renderBillResult()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 32,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tabActive: {
    backgroundColor: '#7475B4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingTop: 20,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAEAF8',
  },
  optionBtnActive: {
    backgroundColor: '#7475B4',
  },
  optionBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  optionBtnTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#7475B4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '90%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  resultValueWarning: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  highlightCard: {
    backgroundColor: '#7475B4',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  highlightValue: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  closeButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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