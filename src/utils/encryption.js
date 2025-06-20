const crypto = require('crypto');
const logger = require('./logger');

/**
 * 3DES Encryption (Triple Data Encryption Standard)
 * Uses three different keys for enhanced security
 */
function encrypt3DES(data, key) {
  try {
    // Ensure key is 24 bytes (192 bits) for 3DES
    let finalKey = key;
    if (key.length < 24) {
      // Pad key to 24 bytes
      finalKey = key.padEnd(24, '0');
    } else if (key.length > 24) {
      // Truncate key to 24 bytes
      finalKey = key.substring(0, 24);
    }

    // Create 3DES cipher
    const cipher = crypto.createCipher('des-ede3', finalKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    logger.info('3DES encryption applied successfully');
    return encrypted;
  } catch (error) {
    logger.error('3DES encryption error:', error);
    throw new Error(`3DES encryption failed: ${error.message}`);
  }
}

/**
 * 3DES Decryption
 */
function decrypt3DES(encryptedData, key) {
  try {
    // Ensure key is 24 bytes (192 bits) for 3DES
    let finalKey = key;
    if (key.length < 24) {
      finalKey = key.padEnd(24, '0');
    } else if (key.length > 24) {
      finalKey = key.substring(0, 24);
    }

    // Create 3DES decipher
    const decipher = crypto.createDecipher('des-ede3', finalKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    logger.info('3DES decryption applied successfully');
    return decrypted;
  } catch (error) {
    logger.error('3DES decryption error:', error);
    throw new Error(`3DES decryption failed: ${error.message}`);
  }
}

/**
 * XOR Encryption
 * Simple bitwise XOR encryption using a key
 */
function encryptXOR(data, key) {
  try {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length).charCodeAt(0));
    }
    
    logger.info('XOR encryption applied successfully');
    return Buffer.from(result, 'binary');
  } catch (error) {
    logger.error('XOR encryption error:', error);
    throw new Error(`XOR encryption failed: ${error.message}`);
  }
}

/**
 * XOR Decryption
 */
function decryptXOR(data, key) {
  try {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data[i] ^ key.charCodeAt(i % key.length).charCodeAt(0));
    }
    
    logger.info('XOR decryption applied successfully');
    return result;
  } catch (error) {
    logger.error('XOR decryption error:', error);
    throw new Error(`XOR decryption failed: ${error.message}`);
  }
}

/**
 * Encrypt data based on encryption type
 */
function encryptData(data, encryptionType, encryptionKey) {
  if (!encryptionType || !encryptionKey) {
    logger.warn('No encryption type or key provided, returning original data');
    return data;
  }

  switch (encryptionType.toLowerCase()) {
    case '3des':
      return encrypt3DES(data, encryptionKey);
    case 'xor':
      return encryptXOR(data, encryptionKey);
    default:
      logger.warn(`Unknown encryption type: ${encryptionType}, returning original data`);
      return data;
  }
}

/**
 * Decrypt data based on encryption type
 */
function decryptData(data, encryptionType, encryptionKey) {
  if (!encryptionType || !encryptionKey) {
    logger.warn('No encryption type or key provided, returning original data');
    return data;
  }

  switch (encryptionType.toLowerCase()) {
    case '3des':
      return decrypt3DES(data, encryptionKey);
    case 'xor':
      return decryptXOR(data, encryptionKey);
    default:
      logger.warn(`Unknown encryption type: ${encryptionType}, returning original data`);
      return data;
  }
}

module.exports = {
  encrypt3DES,
  decrypt3DES,
  encryptXOR,
  decryptXOR,
  encryptData,
  decryptData
};