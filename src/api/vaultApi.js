// src/api/vaultApi.js
import { auth } from './firebaseConfig';
import { BASE_URL } from '../config/config';

const API_BASE_URL = `${BASE_URL}/api/vault`;

/**
 * Get Firebase token for authentication
 */
const getFirebaseToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    throw error;
  }
};

/**
 * Check vault status
 * @returns {Promise<{success: boolean, vaultExists: boolean, vault?: object}>}
 */
export const checkVaultStatus = async () => {
  try {
    const token = await getFirebaseToken();
    const response = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking vault status:', error);
    return {
      success: false,
      vaultExists: false,
      error: error.message,
    };
  }
};

/**
 * Create new vault
 * @param {string} fullName - User's full name
 * @param {string} pin - 4 digit PIN
 * @param {string} confirmPin - Confirmation PIN
 * @param {string} recoveryEmail - Recovery email
 * @param {boolean} useSameAsMain - Use main email as recovery
 * @returns {Promise<{success: boolean, message?: string, vault?: object}>}
 */
export const createVault = async (fullName, pin, confirmPin, recoveryEmail, useSameAsMain = false) => {
  try {
    const token = await getFirebaseToken();
    console.log('Creating vault with:', { fullName, pin: '****', confirmPin: '****', recoveryEmail, useSameAsMain });
    console.log('API URL:', `${API_BASE_URL}/create`);
    
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName,
        pin,
        confirmPin,
        recoveryEmail,
        useSameAsMain,
      }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `Server error: ${response.status}`,
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error creating vault:', error);
    return {
      success: false,
      message: error.message || 'Failed to create vault. Please check your internet connection.',
    };
  }
};

/**
 * Validate PIN to unlock vault
 * @param {string} pin - 4 digit PIN
 * @returns {Promise<{success: boolean, message?: string, vault?: object}>}
 */
export const validatePin = async (pin) => {
  try {
    const token = await getFirebaseToken();
    const response = await fetch(`${API_BASE_URL}/validate-pin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pin }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error validating PIN:', error);
    return {
      success: false,
      message: error.message || 'Failed to validate PIN',
    };
  }
};

/**
 * Update PIN
 * @param {string} currentPin - Current 4 digit PIN
 * @param {string} newPin - New 4 digit PIN
 * @param {string} confirmPin - Confirmation of new PIN
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const updatePin = async (currentPin, newPin, confirmPin) => {
  try {
    const token = await getFirebaseToken();
    const response = await fetch(`${API_BASE_URL}/update-pin`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPin,
        newPin,
        confirmPin,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating PIN:', error);
    return {
      success: false,
      message: error.message || 'Failed to update PIN',
    };
  }
};

/**
 * Request PIN reset - Send verification code to email
 * @param {string} email - Recovery email address
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const requestPinReset = async (email) => {
  try {
    const token = await getFirebaseToken();
    const response = await fetch(`${API_BASE_URL}/forgot-pin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error requesting PIN reset:', error);
    return {
      success: false,
      message: error.message || 'Failed to send verification code',
    };
  }
};

/**
 * Verify reset code
 * @param {string} email - Recovery email address
 * @param {string} code - Verification code
 * @returns {Promise<{success: boolean, message?: string, token?: string}>}
 */
export const verifyResetCode = async (email, code) => {
  try {
    const token = await getFirebaseToken();
    const response = await fetch(`${API_BASE_URL}/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying reset code:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify code',
    };
  }
};

/**
 * Reset PIN with verification token or Firebase oobCode
 * @param {string} resetToken - Token from verification or Firebase oobCode
 * @param {string} newPin - New 4 digit PIN
 * @param {string} confirmPin - Confirmation of new PIN
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const resetPin = async (resetToken, newPin, confirmPin) => {
  try {
    const token = await getFirebaseToken();
    const response = await fetch(`${API_BASE_URL}/reset-pin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resetToken,
        newPin,
        confirmPin,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error resetting PIN:', error);
    return {
      success: false,
      message: error.message || 'Failed to reset PIN',
    };
  }
};

