/**
 * LocalStorage utilities for caching training data
 */

const STORAGE_KEY = 'brightpoint_training_data';
const STORAGE_VERSION = '1.0';

/**
 * Save data to localStorage
 */
export function saveToLocalStorage(data) {
  try {
    const storageData = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data: data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Load data from localStorage
 */
export function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const storageData = JSON.parse(stored);

    // Check version compatibility
    if (storageData.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, clearing cache');
      clearLocalStorage();
      return null;
    }

    return storageData.data;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Clear localStorage
 */
export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Get cached data info
 */
export function getCacheInfo() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const storageData = JSON.parse(stored);
    return {
      timestamp: storageData.timestamp,
      version: storageData.version,
      recordCount: storageData.data?.length || 0,
    };
  } catch (error) {
    return null;
  }
}
