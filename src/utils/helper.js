/**
 * Sanitizes text by removing newlines and trimming whitespace
 * @param {string} str - The string to sanitize
 * @returns {string} The sanitized string
 */
const sanitizeText = (str) => {
    return String(str).replace(/[\n\r]/g, ' ').trim();
};

/**
 * Formats a date to ISO string
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    return new Date(date).toISOString();
};

/**
 * Generates a unique identifier
 * @param {number} length - Length of the identifier
 * @returns {string} Unique identifier
 */
const generateUniqueId = (length = 8) => {
    return Math.random().toString(36).substring(2, length + 2);
};

/**
 * Safely parses JSON string
 * @param {string} str - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed JSON or fallback value
 */
const safeJsonParse = (str, fallback = null) => {
    try {
        return JSON.parse(str);
    } catch (error) {
        return fallback;
    }
};

module.exports = {
    sanitizeText,
    formatDate,
    generateUniqueId,
    safeJsonParse
};
  