import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';

const ProfileSetupStep2 = ({ navigation, route }) => {
  // Check if in edit mode
  const { params } = route;
  const isEdit = params?.isEdit || false;
  const profileData = params?.profileData || null;

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: '',
      relationship: '',
      phoneNumber: '',
      showRelationshipDropdown: false,
    }
  ]);

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && profileData && profileData.emergencyContact) {
      const contact = profileData.emergencyContact;
      setContacts([{
        id: 1,
        name: contact.name || '',
        relationship: contact.relationship || '',
        phoneNumber: contact.phoneNumber || '',
        showRelationshipDropdown: false,
      }]);
    }
  }, [isEdit, profileData]);

  const addContact = () => {
    const newContact = {
      id: contacts.length + 1,
      name: '',
      relationship: '',
      phoneNumber: '',
      showRelationshipDropdown: false,
    };
    setContacts([...contacts, newContact]);
  };

  const removeContact = (id) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter(contact => contact.id !== id));
    }
  };

  const updateContact = (id, field, value) => {
    console.log(`Updating contact ${id}, field: ${field}, value: "${value}"`);
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const closeOtherDropdowns = (currentId) => {
    setContacts(prevContacts =>
      prevContacts.map(contact => ({
        ...contact,
        showRelationshipDropdown: contact.id === currentId ? contact.showRelationshipDropdown : false
      }))
    );
  };

  const toggleDropdown = (contactId) => {
    closeOtherDropdowns(contactId);
    setContacts(prevContacts =>
      prevContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, showRelationshipDropdown: !contact.showRelationshipDropdown }
          : contact
      )
    );
  };

  const selectRelationship = (contactId, relationship) => {
    setContacts(prevContacts =>
      prevContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, relationship: relationship, showRelationshipDropdown: false }
          : contact
      )
    );
  };

  const handleNext = async () => {
    const firstContact = contacts[0];
    
    console.log('All contacts:', contacts);
    console.log('First contact data:', firstContact);
    
    if (!firstContact) {
      Alert.alert('Error', 'No contact data found!');
      return;
    }
    
    if (!firstContact.name || firstContact.name.trim() === '') {
      Alert.alert('Error', 'Name is required!');
      return;
    }
    
    if (!firstContact.relationship || firstContact.relationship.trim() === '') {
      Alert.alert('Error', 'Relationship is required!');
      return;
    }
    
    if (!firstContact.phoneNumber || firstContact.phoneNumber.trim() === '') {
      Alert.alert('Error', 'Phone number is required!');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Different endpoint for edit vs create
      const endpoint = isEdit ? `${BASE_URL}/api/profile` : `${BASE_URL}/api/profile/step2`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = isEdit ? {
        // For edit, send nested object update
        'emergencyContact.name': firstContact.name.trim(),
        'emergencyContact.relationship': firstContact.relationship.trim(),
        'emergencyContact.phoneNumber': firstContact.phoneNumber.trim(),
        'emergencyContact.enableSMS': true,
        'emergencyContact.enableCall': true,
      } : {
        // For create, send step2 data
        name: firstContact.name.trim(),
        relationship: firstContact.relationship.trim(),
        phoneNumber: firstContact.phoneNumber.trim(),
        enableSMS: true,
        enableCall: true,
      };

      console.log('Sending payload:', payload);

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        if (isEdit) {
          Alert.alert('Success', 'Emergency contact updated!', [
            {
              text: 'OK',
              onPress: () => navigation.goBack() // Go back to ProfileView
            }
          ]);
        } else {
          Alert.alert('Success', 'Step 2 completed!');
          navigation.navigate('ProfileSetupStep3');
        }
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Step 2 error:', err);
      Alert.alert('Error', 'Server error');
    }
  };

  const renderContact = (contact, index) => (
    <View key={contact.id} style={styles.contactContainer}>
      <View style={styles.contactHeader}>
        <Text style={styles.contactTitle}>
          {index === 0 ? 'Emergency Contact' : `Contact ${index + 1}`}
        </Text>
        {index > 0 && (
          <TouchableOpacity 
            onPress={() => removeContact(contact.id)}
            style={styles.removeButton}
          >
            <Ionicons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.textInput}
          value={contact.name}
          onChangeText={(value) => updateContact(contact.id, 'name', value)}
          placeholder="Name"
          placeholderTextColor="#999"
        />

        <TouchableOpacity 
          style={styles.dropdownContainer}
          onPress={() => toggleDropdown(contact.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, !contact.relationship && styles.placeholderText]}>
            {contact.relationship || 'Relation'}
          </Text>
          <Ionicons 
            name={contact.showRelationshipDropdown ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#999" 
          />
        </TouchableOpacity>

        {contact.showRelationshipDropdown && (
          <View style={styles.dropdownMenu}>
            {['Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Caregiver', 'Other'].map((option, optionIndex) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  optionIndex === 6 && styles.lastDropdownItem
                ]}
                onPress={() => selectRelationship(contact.id, option)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TextInput
          style={styles.textInput}
          value={contact.phoneNumber}
          onChangeText={(value) => updateContact(contact.id, 'phoneNumber', value)}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Emergency Contact' : 'Profile Setup'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar - only show in create mode */}
      {!isEdit && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFilled} />
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <Text style={styles.sectionDescription}>
            {isEdit ? 
              'Update your emergency contact information.' :
              'In case of an emergency, we\'ll reach out to your trusted contact. Please add at least one.'
            }
          </Text>

          {contacts.map((contact, index) => renderContact(contact, index))}

          {/* Add Another Button - hide in edit mode */}
          {!isEdit && (
            <TouchableOpacity style={styles.addButton} onPress={addContact}>
              <Ionicons name="add" size={20} color="#8B7AD8" />
              <Text style={styles.addButtonText}>Add Another</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isEdit ? 'Update' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
     marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFilled: {
    width: '66%',
    height: '100%',
    backgroundColor: '#8B7AD8',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 25,
  },
  contactContainer: {
    marginBottom: 25,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  removeButton: {
    padding: 5,
  },
  inputGroup: {
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#8B7AD8',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 15,
  },
  nextButton: {
    backgroundColor: '#8B7AD8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginTop: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileSetupStep2;