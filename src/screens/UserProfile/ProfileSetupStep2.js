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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { BASE_URL } from '../../config/config';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const ProfileSetupStep2 = ({ navigation, route }) => {
  const { params } = route;
  const isEdit = params?.isEdit || false;
  const profileData = params?.profileData || null;
  const auth = getAuth();

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: '',
      relationship: '',
      phoneNumber: '',
      showRelationshipDropdown: false,
    }
  ]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && profileData) {
      // Check for emergencyContacts array first
      if (profileData.emergencyContacts && profileData.emergencyContacts.length > 0) {
        setContacts(profileData.emergencyContacts.map((contact, index) => ({
          id: contact._id || Date.now() + index, // Use _id from backend if available
          _id: contact._id, // Store backend ID for updates
          name: contact.name || '',
          relationship: contact.relationship || '',
          phoneNumber: contact.phoneNumber || '',
          showRelationshipDropdown: false,
        })));
      } 
      // Fallback to single emergencyContact
      else if (profileData.emergencyContact) {
        const contact = profileData.emergencyContact;
        setContacts([{
          id: contact._id || Date.now(),
          _id: contact._id,
          name: contact.name || '',
          relationship: contact.relationship || '',
          phoneNumber: contact.phoneNumber || '',
          showRelationshipDropdown: false,
        }]);
      }
    }
  }, [isEdit, profileData]);

  const addContact = () => {
    const newContact = {
      id: Date.now(), // Use timestamp for unique ID
      name: '',
      relationship: '',
      phoneNumber: '',
      showRelationshipDropdown: false,
    };
    setContacts([...contacts, newContact]);
  };

  const removeContact = async (id) => {
    if (contacts.length > 1) {
      const contactToRemove = contacts.find(c => c.id === id);
      
      // If contact has _id, delete from backend
      if (contactToRemove?._id) {
        try {
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken();
            const response = await fetch(
              `${BASE_URL}/api/profile/emergency-contacts/${contactToRemove._id}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
            if (!response.ok) {
              console.error('Failed to delete contact from backend');
            }
          }
        } catch (err) {
          console.error('Error deleting contact:', err);
        }
      }
      
      // Remove from local state
      setContacts(contacts.filter(contact => contact.id !== id));
    }
  };

  const updateContact = (id, field, value) => {
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

  const handleSave = async () => {
    const validContacts = contacts.filter(c => (c.name && c.name.trim()) || (c.phoneNumber && c.phoneNumber.trim()));
    
    if (validContacts.length === 0) {
      Alert.alert('Info', 'Please fill at least one contact with name or phone number');
      return;
    }
    
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const token = await user.getIdToken();

      // Use new endpoint to add/update contacts
      // First, check if profile exists, if not create it
      const profileCheckResponse = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileCheckResponse.status === 404) {
        // Profile doesn't exist, create minimal profile first
        console.log('Profile not found, creating profile first...');
        const createPayload = {
          fullName: user.displayName || 'User',
          dateOfBirth: new Date().toISOString().split('T')[0], // Today's date as placeholder
          gender: 'Male', // Default
          bloodGroup: 'O+', // Default
          primaryPhone: user.phoneNumber || '',
          email: user.email || '',
        };

        const createResponse = await fetch(`${BASE_URL}/api/profile/step1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createPayload),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({ message: 'Network error' }));
          Alert.alert('Error', errorData.message || errorData.error || 'Failed to create profile. Please complete Personal Information first.');
          return;
        }
      }

      const baseEndpoint = `${BASE_URL}/api/profile/emergency-contacts`;
      
      let successCount = 0;
      let errorCount = 0;

      // Save each contact using POST (add) or PUT (update if has _id)
      for (const contact of validContacts) {
        try {
          // Validate required fields
          if (!contact.name?.trim() || !contact.relationship?.trim() || !contact.phoneNumber?.trim()) {
            console.warn('Skipping contact with missing required fields:', contact);
            errorCount++;
            continue;
          }

          const contactPayload = {
            name: contact.name.trim(),
            relationship: contact.relationship.trim(),
            phoneNumber: contact.phoneNumber.trim(),
            enableSMS: true,
            enableCall: true
          };

          console.log(`${contact._id ? 'Updating' : 'Adding'} contact:`, contactPayload);

          let response;
          if (contact._id) {
            // Update existing contact
            response = await fetch(`${baseEndpoint}/${contact._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(contactPayload),
            });
          } else {
            // Add new contact
            response = await fetch(baseEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(contactPayload),
            });
          }

          console.log(`Contact ${contact._id ? 'update' : 'add'} response status:`, response.status);
          
          if (response.ok) {
            const responseData = await response.json().catch(() => ({}));
            console.log('Contact saved successfully:', responseData);
            successCount++;
          } else {
            errorCount++;
            const errorText = await response.text().catch(() => '');
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText || `Server error: ${response.status}` };
            }
            console.error('Contact save error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
          }
        } catch (err) {
          errorCount++;
          console.error('Contact save error (exception):', err.message || err);
        }
      }

      if (successCount > 0) {
        Alert.alert('Success', `Emergency contact${successCount > 1 ? 's' : ''} saved successfully!`, [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to save emergency contacts. Please try again.');
      }
    } catch (err) {
      console.error('Step 2 error:', err);
      Alert.alert('Error', err.message || 'Network error. Please check your connection.');
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#FFE5B4', '#FFD4A3', '#E8F4F8', '#D4E8F0', '#C8D4F0']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {contacts.map((contact, index) => (
          <View key={`contact-${contact.id}-${index}`} style={styles.whiteCard}>
            {/* Contact Name */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Contact Name</Text>
              <TextInput
                style={styles.textInput}
                value={contact.name}
                onChangeText={(value) => updateContact(contact.id, 'name', value)}
                placeholder="Contact Name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Relation */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Relation</Text>
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
                  {['Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Caregiver', 'Other'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => selectRelationship(contact.id, option)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={contact.phoneNumber}
                onChangeText={(value) => updateContact(contact.id, 'phoneNumber', value)}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            {/* Delete Button for this contact */}
            {contacts.length > 1 && (
              <View style={styles.actionsRow}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => removeContact(contact.id)} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Add New Button */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            onPress={() => {
              addContact();
            }} 
            activeOpacity={0.7}
          >
            <Text style={styles.addNewText}>Add New</Text>
          </TouchableOpacity>
          <View style={{ width: 20 }} />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    width: '100%',
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
    marginBottom: 15,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 15,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    textDecorationLine: 'underline',
  },
});

export default ProfileSetupStep2;
