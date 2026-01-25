define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class encLargePayloadWithTime extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.plainText - Data to encrypt (string or object)
     * @param {string} params.valueType - Type identifier for the data
     */
    async run(context, { plainText }) {
      const { $application, $constants, $variables, $functions } = context;

      try {

        if (typeof plainText === 'object' && plainText !== null) {
          // console.log("✓ Data is object type - will be converted to JSON by encryptJs");
          
          // Log object keys to verify structure
          // console.log("Object keys:", Object.keys(plainText));
          
          // ⚠️ Remove any undefined values from object
          const cleanedData = {};
          for (const key in plainText) {
            if (plainText[key] !== undefined) {
              cleanedData[key] = plainText[key];
            }
          }
          plainText = cleanedData;
          // console.log("Cleaned data (undefined values removed):", plainText);
        }

        let encryptJs = await $functions.encryptJs(plainText, $constants.secretKey, $constants.time, $constants.unit);

        return encryptJs;
        
      } catch (error) {
        // ---- TODO: Add your code here ---- //
        throw error;
      } finally {
      }
    }
  }

  return encLargePayloadWithTime;
});