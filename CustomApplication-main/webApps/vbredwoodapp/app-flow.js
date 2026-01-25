/* Copyright (c) 2025, Oracle and/or its affiliates */
/* global requirejs */

define([
  'oj-sp/spectra-shell/config/config'
], function (config) {
  'use strict';

  class AppModule {

    constructor() {
      // Initialize CryptoJS reference
      this.CryptoJS = null;
      this.cryptoLoaded = false;
    }

    // =====================================================
    // 🔐 LOAD CRYPTOJS LIBRARY
    // =====================================================
    async loadCryptoJS() {
      if (this.cryptoLoaded && this.CryptoJS) {
        console.log("✅ CryptoJS already loaded");
        return true;
      }

      try {
        console.log("📦 Loading CryptoJS from CDN...");
        
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
              console.log("✅ CryptoJS loaded successfully from CDN");
              resolve(true);
            } else {
              console.error("❌ CryptoJS loaded but is undefined");
              reject(new Error("CryptoJS library failed to initialize"));
            }
          }, (error) => {
            console.error("❌ Failed to load CryptoJS from CDN:", error);
            reject(error);
          });
        });
        
      } catch (error) {
        console.error("❌ Error loading CryptoJS:", error);
        return false;
      }
    }

    // =====================================================
    // ✅ ENCRYPT FUNCTION (Matches PL/SQL fs_encrypt_data)
    // =====================================================
    /**
     * Encrypt plain text with custom parameters
     * @param {string|object} plainText - The text or object to encrypt
     * @param {string} customKey - Encryption key (MUST be exactly 16 characters for AES-128)
     * @param {number} time - Token validity duration value (e.g., 5, 10, 30, 60)
     * @param {string} unit - Token validity unit: 'SECOND', 'MINUTE', 'HOUR', 'DAY'
     * @returns {Promise<string>} URL-safe Base64 encrypted token
     */
    async encryptJs(plainText, customKey, time, unit) {
      try {
        // Ensure CryptoJS is loaded
        if (!this.cryptoLoaded) {
          // console.log("🔄 CryptoJS not loaded, loading now...");
          await this.loadCryptoJS();
        }

        if (!this.CryptoJS) {
          throw new Error("CryptoJS library not available. Please check CDN connection.");
        }

        
        // ✅ CRITICAL: Validate key length (AES-128 requires exactly 16 characters)
        if (customKey.length !== 16) {
          throw new Error(`Invalid key length: ${customKey.length}. AES-128 requires exactly 16 characters. Current key: "${customKey}"`);
        }
        
        // Validate required parameters
        if (!plainText || !time || !unit) {
          throw new Error("Missing required parameters: plainText, time, or unit");
        }
        
        // ✅ Convert object to JSON string if needed
        let dataToEncrypt = plainText;
        if (typeof plainText === 'object' && plainText !== null) {
          dataToEncrypt = JSON.stringify(plainText);
        }
        
        // Parse encryption key
        const parsedKey = this.CryptoJS.enc.Utf8.parse(customKey);
        
        // Calculate expiry time using provided parameters
        const expiryTime = this.calculateExpiryTime(time, unit);
        const expiryString = this.formatTimestamp(expiryTime);
        
        // Combine expiry time with data: "YYYY-MM-DD HH24:MI:SS|actualData"
        const dataWithTime = expiryString + '|' + dataToEncrypt;
        
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
        
        // Step 2: Replace characters
        urlSafeResult = urlSafeResult.replace(/\+/g, '-');  // Replace + with -
        urlSafeResult = urlSafeResult.replace(/\//g, '_');  // Replace / with _
        
        // Step 3: Remove padding '=' 
        urlSafeResult = urlSafeResult.replace(/=/g, '');
        
        
        return urlSafeResult;
        
      } catch (error) {
        console.error("❌ Encryption error:", error);
        throw new Error('Encryption Error: ' + error.message);
      }
    }

    // =====================================================
    // 🛠️ HELPER FUNCTIONS
    // =====================================================
    
    /**
     * calculateExpiryTime
     */
    calculateExpiryTime(value, unit) {
      const now = new Date();
      const timeUnit = unit.toUpperCase();
      
      
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
          console.warn("⚠️ Unknown time unit:", timeUnit, "- defaulting to MINUTE");
          now.setMinutes(now.getMinutes() + value);
      }
      
      return now;
    }
    
    /**
    formatTimestamp
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
    












  }

  return AppModule;
});