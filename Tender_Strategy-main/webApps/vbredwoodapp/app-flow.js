/* Copyright (c) 2025, Oracle and/or its affiliates */

/* global requirejs */

define([
  'oj-sp/spectra-shell/config/config',
  'resources/js/crypto'
], function (config, CryptoJS) {
  'use strict';

  class AppModule {

    constructor() {
      // Initialize CryptoJS reference
        this.CryptoJS = null;
        this.cryptoLoaded = false;
    }

      async loadCryptoJS() {
        if (this.cryptoLoaded && this.CryptoJS) {
            // this.log("✅ CryptoJS already loaded");
            return true;
        }

        try {
            // this.log("📦 Loading CryptoJS from CDN...");
            
            // Load CryptoJS from CDN using RequireJS
            return new Promise((resolve, reject) => {
                requirejs.config({
                    paths: {
                        'crypto-js': 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min'
                    }
                });

                requirejs(['crypto-js'], (CryptoJS) => {
                    if (CryptoJS) {
                        this.CryptoJS = CryptoJS;
                        this.cryptoLoaded = true;
                        // this.log("✅ CryptoJS loaded successfully from CDN");
                        resolve(true);
                    } else {
                        // this.logError("❌ CryptoJS loaded but is undefined");
                        reject(new Error("CryptoJS library failed to initialize"));
                    }
                }, (error) => {
                    // this.logError("❌ Failed to load CryptoJS from CDN:", error);
                    reject(error);
                });
            });
            
        } catch (error) {
            // this.logError("❌ Error loading CryptoJS:", error);
            return false;
        }
    }

    decryptJs_Normal(key, encryptedPayload) {
      let decryptJs;
      try {
        const parsedKey = CryptoJS.enc.Utf8.parse(key);

        let standardBase64 = encryptedPayload
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .replace(/\./g, '=');

        while (standardBase64.length % 4 !== 0) {
          standardBase64 += '=';
        }

        const rawData = CryptoJS.enc.Base64.parse(standardBase64);

        if (rawData.sigBytes < 16) {
          throw new Error('Insufficient data for decryption');
        }

        const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4), 16);
        const ciphertext = CryptoJS.lib.WordArray.create(rawData.words.slice(4), rawData.sigBytes - 16);

        const decrypted = CryptoJS.AES.decrypt(
          { ciphertext: ciphertext },
          parsedKey,
          {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: iv
          }
        );

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
          throw new Error('Decryption resulted in empty string - key or data may be incorrect');
        }

        console.log("Decrypted text:", decryptedText);

        try {
          const result = JSON.parse(decryptedText);
          decryptJs = result;
          return result;
        } catch {
          return decryptedText;
        }

      } catch (error) {
        console.error("Decryption Error:", error);
        return 'Decryption Error: ' + error.message;
      }
      // return decryptJs;
    }

    encryptJs_Normal(key, payload) {
      try {
        console.log("Encrypting payload:", payload);
        
        // Use the provided key or default
        const encryptionKey = key || this.key;
        const parsedKey = CryptoJS.enc.Utf8.parse(encryptionKey);
        
        // Generate random 16-byte IV (same as PL/SQL)
        const iv = CryptoJS.lib.WordArray.random(16);
        
        // Convert payload to string if it's an object
        const dataToEncrypt = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
        
        // Encrypt using AES CBC mode with PKCS7 padding (same as PL/SQL PKCS5)
        const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, parsedKey, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: iv
        });
        
        // Combine IV and ciphertext (same as PL/SQL: v_iv_raw || v_cipher_raw)
        const ivAndEncrypted = iv.concat(encrypted.ciphertext);
        
        // Convert to standard Base64
        const base64Result = ivAndEncrypted.toString(CryptoJS.enc.Base64);
        
        // Convert to URL-safe Base64 (same as PL/SQL) - Fixed regex patterns
        const urlSafeResult = base64Result
            .replace(/\+/g, '-')        // Replace + with -
            .replace(/\//g, '_')        // Replace / with _
            .replace(/[=]/g, '.');      // Replace = with . (using character class to avoid confusion)
        
        console.log("Encrypted result:", urlSafeResult);
        return urlSafeResult;
        
    } catch (error) {
        console.error("Encryption error:", error);
        return 'Encryption Error: ' + error.message;
    }

    }

    downloadFile(base64String, name, type) {
      let applicationType = "data:" + type + ";base64,";
      let finalContent = applicationType + base64String;
      const downloadLink = document.createElement('a');
      document.body.appendChild(downloadLink);
      downloadLink.href = finalContent;
      downloadLink.download = name;
      downloadLink.click();
    }


    // =====================================================
    // ✅ ENCRYPT FUNCTION (Matches PL/SQL fs_encrypt_data)
    // =====================================================
    
    /**
     * Encrypt plain text with custom parameters
     * CRITICAL FIX: Properly converts objects to JSON strings
     * @param {string|object} plainText - The text or object to encrypt
     * @param {string} customKey - Encryption key (16 characters for AES-128)
     * @param {number} time - Token validity duration value (e.g., 5, 10, 30)
     * @param {string} unit - Token validity unit: 'SECOND', 'MINUTE', 'HOUR', 'DAY'
     * @returns {Promise<string>} URL-safe Base64 encrypted token
     */
    async encryptJs(plainText, customKey, time, unit) {
        try {
            // Ensure CryptoJS is loaded
            if (!this.cryptoLoaded) {
                // this.log("🔄 CryptoJS not loaded, loading now...");
                await this.loadCryptoJS();
            }

            if (!this.CryptoJS) {
                throw new Error("CryptoJS library not available. Please check CDN connection.");
            }

            // this.log("🔐 Starting encryption process...");
            // this.log("Plain text:", plainText);
            // this.log("Encryption Key:", customKey);
            // this.log("Token Validity:", time, unit);
            
            // Validate required parameters
            if (!plainText || !customKey || !time || !unit) {
                throw new Error("Missing required parameters: plainText, customKey, time, or unit");
            }
            
            // ✅ CRITICAL FIX: Convert object to JSON string if needed
            let dataToEncrypt = plainText;
            if (typeof plainText === 'object' && plainText !== null) {
                dataToEncrypt = JSON.stringify(plainText);
                // this.log("✓ Converted object to JSON string:", dataToEncrypt);
            }
            
            // Parse encryption key
            const parsedKey = this.CryptoJS.enc.Utf8.parse(customKey);
            
            // Calculate expiry time using provided time and unit parameters
            const expiryTime = this.calculateExpiryTime(time, unit);
            const expiryString = this.formatTimestamp(expiryTime);
            
            // Combine expiry time with data: "YYYY-MM-DD HH24:MI:SS|actualData"
            const dataWithTime = expiryString + '|' + dataToEncrypt;
            // this.log("Data with expiry:", dataWithTime);
            
            // Generate random 16-byte IV (same as PL/SQL: DBMS_CRYPTO.randombytes(16))
            const iv = this.CryptoJS.lib.WordArray.random(16);
            
            // Encrypt using AES CBC mode with PKCS7 padding (equivalent to PKCS5)
            const encrypted = this.CryptoJS.AES.encrypt(dataWithTime, parsedKey, {
                mode: this.CryptoJS.mode.CBC,
                padding: this.CryptoJS.pad.Pkcs7,
                iv: iv
            });
            
            // Combine IV and ciphertext (same as PL/SQL: v_iv_raw || v_cipher_raw)
            const ivAndEncrypted = iv.concat(encrypted.ciphertext);
            
            // Convert to standard Base64
            const base64Result = ivAndEncrypted.toString(this.CryptoJS.enc.Base64);
            
            // ✅ CRITICAL: URL-safe Base64 encoding (EXACT PL/SQL ORDER)
            // Step 1: Remove line breaks
            let urlSafeResult = base64Result.replace(/[\r\n]/g, '');
            
            // Step 2: Remove padding '=' (FIRST - matching PL/SQL)
            urlSafeResult = urlSafeResult.replace(/=/g, '');
            
            // Step 3: Replace characters (AFTER removing padding)
            urlSafeResult = urlSafeResult.replace(/\+/g, '-');  // Replace + with -
            urlSafeResult = urlSafeResult.replace(/\//g, '_');  // Replace / with _
            
            // this.log("✅ Encryption successful");
            
            return urlSafeResult;
            
        } catch (error) {
            // this.logError("❌ Encryption error:", error);
            throw new Error('Encryption Error: ' + error.message);
        }
    }

    // =====================================================
    // 🛠️ HELPER FUNCTIONS
    // =====================================================
    
    /**
     * Calculate expiry time based on provided parameters
     * Matches PL/SQL: SYSTIMESTAMP + NUMTODSINTERVAL(c_token_validity_value, c_token_validity_unit)
     * @param {number} value - Duration value (e.g., 5, 10, 30)
     * @param {string} unit - Time unit: 'SECOND', 'MINUTE', 'HOUR', 'DAY'
     * @returns {Date} Expiry date/time
     */
    calculateExpiryTime(value, unit) {
        const now = new Date();
        const timeUnit = unit.toUpperCase();
        
        // this.log("Calculating expiry time with value:", value, "unit:", timeUnit);
        
        switch(timeUnit) {
            case 'SECOND':
                now.setSeconds(now.getSeconds() + value);
                break;
            case 'MINUTE':
                now.setMinutes(now.getMinutes() + value);
                break;
            case 'HOUR':
                now.setHours(now.getHours() + value);
                break;
            case 'DAY':
                now.setDate(now.getDate() + value);
                break;
            default:
                // this.logWarn("Unknown time unit:", timeUnit, "- defaulting to MINUTE");
                now.setMinutes(now.getMinutes() + value);
        }
        
        // this.log("Calculated expiry time:", now.toISOString());
        return now;
    }
    
    /**
     * Format timestamp to match PL/SQL format: 'YYYY-MM-DD HH24:MI:SS'
     * @param {Date} date - Date object to format
     * @returns {string} Formatted timestamp string
     */
    formatTimestamp(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    /**
     * Parse timestamp from PL/SQL format: 'YYYY-MM-DD HH24:MI:SS'
     * @param {string} timestampString - Timestamp string in PL/SQL format
     * @returns {Date} Parsed date object
     */
    parseTimestamp(timestampString) {
        // Format: '2025-10-30 14:30:45'
        const parts = timestampString.split(' ');
        const dateParts = parts[0].split('-');
        const timeParts = parts[1].split(':');
        
        return new Date(
            parseInt(dateParts[0]),      // year
            parseInt(dateParts[1]) - 1,  // month (0-based)
            parseInt(dateParts[2]),      // day
            parseInt(timeParts[0]),      // hours
            parseInt(timeParts[1]),      // minutes
            parseInt(timeParts[2])       // seconds
        );
    }

    // =====================================================
    // 📝 EXISTING UTILITY FUNCTIONS (Keep as is)
    // =====================================================

    parseAttributeInfo(data) {
        try {
            const object = JSON.parse(data);
            return object;
        } catch (error) {
            // this.logError('Error parsing duty_resumption_info:', error);
            return null;
        }
    }

    dateConverion(datewithTimeStamp) {
        const date = new Date(datewithTimeStamp);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        return formattedDate;
    }

    getSysdate() {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;
        return today;
    }

    minus() {
        let currentDate = new Date();
        let pastDate = new Date();
        pastDate.setDate(currentDate.getDate() - 1);
    }

    clearSmartSearchChips() {
      const chips = document.querySelectorAll('.oj-sp-filter-chip-close-anchor-invisible');

      chips.forEach((chip, index) => {
        setTimeout(() => {
          try {
            chip.click();
          } catch (e) {
            console.warn("Failed to remove chip:", e);
          }
        }, index * 100);
      });
    }

    updateSmartSearchPlaceHolder() {
      const inputEl = document.querySelector(
        ".oj-sp-smart-search-bar-input-text-container input"
      );

      if (inputEl) {
        inputEl.setAttribute("placeholder", "Search");
      }
    }

    reorderListItems(order) {
      const ul = document.getElementById("smart_searchbar-suggestions-bar");
      if (!ul || !order) return;

      const items = Array.from(ul.querySelectorAll("li"));

      items.sort((a, b) => {
        const aKey = a.getAttribute("data-key");
        const bKey = b.getAttribute("data-key");
        const aIndex = order.indexOf(aKey);
        const bIndex = order.indexOf(bKey);
        return aIndex - bIndex;
      });

      items.forEach(item => ul.removeChild(item));
      items.forEach(item => ul.appendChild(item));
      items.forEach((item, idx) => item.setAttribute("aria-rowindex", idx + 1));
    }

    reorderFilterChips() {
        setTimeout(() => {
          const filterChips = document.querySelectorAll('.oj-sp-filter-chip');

          filterChips.forEach(chip => {
            const chipText = chip.textContent || chip.innerText;

            if (chipText.includes('Governate Name')) {
              chip.classList.add('filter-order-1');
            } else if (chipText.includes('Supplier Name')) {
              chip.classList.add('filter-order-2');
            } else if (chipText.includes('Date Range')) {
              chip.classList.add('filter-order-3');
            }
            // else if (chipText.includes('Created Date')) {
            //   chip.classList.add('filter-order-4');
            // }
          });
        }, 100);
      }

    clearAllFilterChips() {
      const chips = document.querySelectorAll('.oj-sp-filter-chip-close-anchor-invisible');

      chips.forEach((chip, index) => {
        setTimeout(() => {
          chip.click();
        }, index * 100);
      });
    }

    getSysdatenotime() {
      var currentDate = new Date();
      var isoString = currentDate.toISOString().split('T')[0];
      return isoString;
    }

    normalizeDate(dateValue) {
      if (!dateValue) {
        return "";
      }

      if (typeof dateValue === "string" && dateValue.includes("T")) {
        return dateValue.split("T")[0];
      }

      return dateValue;
    }

    formatDateForDB(dateValue) {
      if (!dateValue) return "";

      const date = new Date(dateValue);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    formatToOMR(n) {
      if (typeof n !== 'number')
      {
        n = Number(n);
      }
      if (!isFinite(n))
      {
        return String(n);
      }
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
    }
    
    getSysdateNew() {
      var currentDate = new Date();
      var isoString = currentDate.toISOString();
      return isoString;
    }
    
  }

  return AppModule;
});