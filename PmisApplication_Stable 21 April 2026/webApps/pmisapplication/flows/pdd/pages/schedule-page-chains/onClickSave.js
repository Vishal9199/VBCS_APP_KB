// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class onClickSave extends ActionChain {

//     /**
//      * Helper function to format date to YYYY-MM-DD
//      * @param {string} dateString - ISO 8601 date string or any date format
//      * @returns {string|null} Formatted date or null
//      */
//     formatDateForOracle(dateString) {
//       if (!dateString) return null;
      
//       try {
//         // Handle various date formats
//         let dateStr = String(dateString).trim();
        
//         // If already in YYYY-MM-DD format, return as-is
//         if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
//           return dateStr;
//         }
        
//         // Extract date part from ISO 8601 format (2024-12-15T00:00:00Z)
//         if (dateStr.includes('T')) {
//           dateStr = dateStr.split('T')[0];
//           if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
//             return dateStr;
//           }
//         }
        
//         // Extract date from timestamp format (2024-12-15 00:00:00)
//         if (dateStr.includes(' ')) {
//           dateStr = dateStr.split(' ')[0];
//           if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
//             return dateStr;
//           }
//         }
        
//         // Fallback: parse as Date object
//         const date = new Date(dateString);
//         if (isNaN(date.getTime())) return null;
        
//         const year = date.getUTCFullYear();
//         const month = String(date.getUTCMonth() + 1).padStart(2, '0');
//         const day = String(date.getUTCDate()).padStart(2, '0');
        
//         return `${year}-${month}-${day}`;
//       } catch (error) {
//         console.error("Date formatting error:", error, "Input:", dateString);
//         return null;
//       }
//     }

//     /**
//      * Save all buffered changes (ADD, UPDATE, DELETE operations)
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       try {
//         // Get all submittable items
//         const submittableItems = $page.variables.bufferDPSchedule.instance.getSubmittableItems();

//         if (submittableItems.length === 0) {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'No Changes',
//             message: 'No changes to save',
//             type: 'info',
//             displayMode: 'transient'
//           });
//           return;
//         }

//         console.log("=== Save Operation Started ===");
//         console.log("Total items to process:", submittableItems.length);
//         console.log("Breakdown - ADD:", submittableItems.filter(i => i.operation === "add").length,
//                     "UPDATE:", submittableItems.filter(i => i.operation === "update").length,
//                     "DELETE:", submittableItems.filter(i => i.operation === "remove").length);

//         // Process all items (ADD, UPDATE, DELETE)
//         const results = await this.processItems(context, submittableItems);

//         console.log("=== Save Operation Completed ===");
//         console.log("Success:", results.successCount, "Failed:", results.errorCount);

//         // Handle results
//         if (results.errorCount === 0) {
//           // All successful - reset buffer and reload
//           await $page.variables.bufferDPSchedule.instance.resetAllUnsubmittedItems();
          
//           await Actions.resetVariables(context, {
//             variables: ['$variables.lvNextValue'],
//           });

//           await Actions.callChain(context, {
//             chain: 'SynScheduleADP',
//           });

//           await Actions.fireNotificationEvent(context, {
//             summary: 'Save Successful',
//             message: `Successfully saved ${results.successCount} record(s)`,
//             type: 'confirmation',
//             displayMode: 'transient'
//           });
//         } else {
//           // Some failed - show detailed message
//           await Actions.fireNotificationEvent(context, {
//             summary: 'Save Completed with Errors',
//             message: `Saved: ${results.successCount}, Failed: ${results.errorCount}. Check console for details.`,
//             type: 'warning',
//             displayMode: 'persist'
//           });

//           // Log failed items for debugging
//           if (results.failedItems.length > 0) {
//             console.error("Failed items:", results.failedItems);
//           }
//         }

//       } catch (error) {
//         console.error("Save - Unexpected Error:", error);
        
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Save Failed',
//           message: 'An unexpected error occurred: ' + error.message,
//           type: 'error',
//           displayMode: 'persist'
//         });
//       }
//     }

//     /**
//      * Process all submittable items (ADD, UPDATE, DELETE)
//      * @param {Object} context
//      * @param Array items - Array of submittable items from BufferingDataProvider
//      * @returns {Object} { successCount, errorCount, failedItems }
//      */
//     async processItems(context, items) {
//       const results = {
//         successCount: 0,
//         errorCount: 0,
//         failedItems: []
//       };

//       // Process all items serially
//       await ActionUtils.forEach(items, async (item, index) => {
//         try {
//           const operation = item.operation; // 'add', 'update', or 'remove'
//           const data = item.item.data;
//           const itemKey = data.proj_schd_id || 'NEW';

//           console.log(`Processing ${operation.toUpperCase()} - Record:`, itemKey);

//           // Call the unified save method
//           const success = await this.saveItem(context, operation, data);

//           if (success) {
//             results.successCount++;
//             console.log(`${operation.toUpperCase()} Success:`, itemKey);
//           } else {
//             results.errorCount++;
//             results.failedItems.push({ operation, key: itemKey, data });
//             console.error(`${operation.toUpperCase()} Failed:`, itemKey);
//           }

//         } catch (error) {
//           results.errorCount++;
//           results.failedItems.push({ 
//             operation: item.operation, 
//             key: item.item.data.proj_schd_id || 'NEW',
//             error: error.message 
//           });
//           console.error(`${item.operation.toUpperCase()} Error:`, error);
//         }
//       }, { mode: 'serial' });

//       return results;
//     }

//     /**
//      * Save a single item (unified method for ADD/UPDATE/DELETE)
//      * @param {Object} context
//      * @param {string} operation - 'add', 'update', or 'remove'
//      * @param {Object} data - The record data
//      * @returns {boolean} Success status
//      */
//     async saveItem(context, operation, data) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       // ============================================
//       // Format dates to YYYY-MM-DD for Oracle
//       // ============================================
//       const formattedData = {
//         ...data,
//         planned_start_date: this.formatDateForOracle(data.planned_start_date),
//         planned_end_date: this.formatDateForOracle(data.planned_end_date),
//         revised_start_date: this.formatDateForOracle(data.revised_start_date),
//         revised_end_date: this.formatDateForOracle(data.revised_end_date),
//         actual_start_date: this.formatDateForOracle(data.actual_start_date),
//         actual_end_date: this.formatDateForOracle(data.actual_end_date)
//       };

//       console.log(`${operation} - Original dates:`, {
//         planned_start: data.planned_start_date,
//         planned_end: data.planned_end_date
//       });
//       console.log(`${operation} - Formatted dates:`, {
//         planned_start: formattedData.planned_start_date,
//         planned_end: formattedData.planned_end_date
//       });

//       // Map operation to HTTP method
//       const methodMap = {
//         'add': 'POST',
//         'update': 'PUT',
//         'remove': 'DELETE'
//       };

//       const httpMethod = methodMap[operation];
      
//       // Determine the key based on operation
//       const key = operation === 'add' ? '0' : formattedData.proj_schd_id;

//       // Encrypt payload with formatted dates
//       const encryptedPayload = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: formattedData },
//       });

//       // Encrypt method
//       const encryptedMethod = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: httpMethod },
//       });

//       // Encrypt key
//       const encryptedKey = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: key },
//       });

//       // Call REST service
//       const response = await Actions.callRest(context, {
//         endpoint: 'PDD/postPmispddScheduleProcess',
//         body: { payload: encryptedPayload },
//         headers: {
//           'x-session-id': encryptedKey,
//           'x-session-code': encryptedMethod,
//         },
//       });

//       // Check response
//       if (response.body.P_ERR_CODE === 'S') {
//         return true;
//       } else {
//         console.error(`API Error - ${operation}:`, response.body.P_ERR_MSG);
//         return false;
//       }
//     }
//   }

//   return onClickSave;
// });



// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class onClickSave extends ActionChain {

//     /**
//      * Helper function to format date to YYYY-MM-DD
//      * @param {string} dateString - ISO 8601 date string or any date format
//      * @returns {string|null} Formatted date or null
//      */
//     formatDateForOracle(dateString) {
//       if (!dateString) return null;
      
//       try {
//         let dateStr = String(dateString).trim();
        
//         // Strategy 1: Already YYYY-MM-DD
//         if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
//           return dateStr;
//         }
        
//         // Strategy 2: ISO 8601 with 'T'
//         if (dateStr.includes('T')) {
//           dateStr = dateStr.split('T')[0];
//           if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
//             return dateStr;
//           }
//         }
        
//         // Strategy 3: Timestamp with space
//         if (dateStr.includes(' ')) {
//           dateStr = dateStr.split(' ')[0];
//           if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
//             return dateStr;
//           }
//         }
        
//         // Strategy 4: Fallback Date object
//         const date = new Date(dateString);
//         if (isNaN(date.getTime())) return null;
        
//         const year = date.getUTCFullYear();
//         const month = String(date.getUTCMonth() + 1).padStart(2, '0');
//         const day = String(date.getUTCDate()).padStart(2, '0');
        
//         return `${year}-${month}-${day}`;
//       } catch (error) {
//         console.error("Date formatting error:", error, "Input:", dateString);
//         return null;
//       }
//     }

//     /**
//      * CRITICAL: Validate if a row has required fields filled
//      * @param {Object} data - Row data
//      * @param {string} operation - 'add', 'update', or 'remove'
//      * @returns {Object} { isValid: boolean, missingFields: Array<string> }
//      */
//     validateRowData(data, operation) {
//       const missingFields = [];

//       // DELETE operations don't need validation
//       if (operation === 'remove') {
//         return { isValid: true, missingFields: [] };
//       }

//       // Required fields for ADD/UPDATE
//       if (!data.milestone_id) {
//         missingFields.push('Milestone');
//       }

//       if (!data.planned_start_date) {
//         missingFields.push('Planned Start Date');
//       }

//       if (!data.planned_end_date) {
//         missingFields.push('Planned End Date');
//       }

//       return {
//         isValid: missingFields.length === 0,
//         missingFields: missingFields
//       };
//     }

//     /**
//      * Save all buffered changes (ADD, UPDATE, DELETE operations)
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       try {
//         // Get all submittable items
//         const submittableItems = $page.variables.bufferDPSchedule.instance.getSubmittableItems();

//         if (submittableItems.length === 0) {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'No Changes',
//             message: 'No changes to save',
//             type: 'info',
//             displayMode: 'transient'
//           });
//           return;
//         }

//         console.log("=== Save Operation Started ===");
//         console.log("Total items in buffer:", submittableItems.length);

//         // CRITICAL FIX: Filter out invalid items and collect invalid row info
//         const { validItems, invalidItems } = this.filterValidItems(submittableItems);

//         console.log("Valid items to process:", validItems.length);
//         console.log("Invalid/empty items skipped:", invalidItems.length);

//         if (validItems.length === 0) {
//           // All items are invalid
//           const invalidMessages = invalidItems.map(inv => 
//             `Row ${inv.key}: Missing ${inv.missingFields.join(', ')}`
//           ).join('\n');

//           await Actions.fireNotificationEvent(context, {
//             summary: 'Validation Failed',
//             message: `Cannot save. Please fix the following:\n${invalidMessages}`,
//             type: 'error',
//             displayMode: 'persist'
//           });
//           return;
//         }

//         // Show warning if some items are being skipped
//         if (invalidItems.length > 0) {
//           console.warn("Skipping invalid items:", invalidItems);
          
//           const invalidMessages = invalidItems.map(inv => 
//             `Row ${inv.key}: Missing ${inv.missingFields.join(', ')}`
//           ).join('\n');

//           await Actions.fireNotificationEvent(context, {
//             summary: 'Validation Warning',
//             message: `${invalidItems.length} row(s) will be skipped:\n${invalidMessages}`,
//             type: 'warning',
//             displayMode: 'transient'
//           });
//         }

//         console.log("Breakdown - ADD:", validItems.filter(i => i.operation === "add").length,
//                     "UPDATE:", validItems.filter(i => i.operation === "update").length,
//                     "DELETE:", validItems.filter(i => i.operation === "remove").length);

//         // Process only valid items
//         const results = await this.processItems(context, validItems);

//         console.log("=== Save Operation Completed ===");
//         console.log("Success:", results.successCount, "Failed:", results.errorCount);

//         // Handle results
//         if (results.errorCount === 0) {
//           // All successful - reset buffer and reload
//           await $page.variables.bufferDPSchedule.instance.resetAllUnsubmittedItems();
          
//           await Actions.resetVariables(context, {
//             variables: ['$variables.lvNextValue'],
//           });

//           await Actions.callChain(context, {
//             chain: 'SynScheduleADP',
//           });

//           await Actions.fireNotificationEvent(context, {
//             summary: 'Save Successful',
//             message: `Successfully saved ${results.successCount} record(s)`,
//             type: 'confirmation',
//             displayMode: 'transient'
//           });
//         } else {
//           // Some failed - show detailed message
//           await Actions.fireNotificationEvent(context, {
//             summary: 'Save Completed with Errors',
//             message: `Saved: ${results.successCount}, Failed: ${results.errorCount}. Check console for details.`,
//             type: 'warning',
//             displayMode: 'persist'
//           });

//           if (results.failedItems.length > 0) {
//             console.error("Failed items:", results.failedItems);
//           }
//         }

//       } catch (error) {
//         console.error("Save - Unexpected Error:", error);
        
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Save Failed',
//           message: 'An unexpected error occurred: ' + error.message,
//           type: 'error',
//           displayMode: 'persist'
//         });
//       }
//     }

//     /**
//      * CRITICAL FIX: Filter submittable items to only valid ones
//      * @returns {Object} { validItems: Array, invalidItems: Array }
//      */
//     filterValidItems(submittableItems) {
//       const validItems = [];
//       const invalidItems = [];

//       submittableItems.forEach(item => {
//         const operation = item.operation;
//         const data = item.item.data;
//         const itemKey = data.proj_schd_id || 'NEW';

//         // Validate the row
//         const validation = this.validateRowData(data, operation);

//         if (validation.isValid) {
//           validItems.push(item);
//         } else {
//           invalidItems.push({
//             key: itemKey,
//             operation: operation,
//             missingFields: validation.missingFields
//           });
//           console.warn(`Skipping ${operation} for row ${itemKey} - Missing:`, validation.missingFields);
//         }
//       });

//       return { validItems, invalidItems };
//     }

//     /**
//      * Process all valid submittable items (ADD, UPDATE, DELETE)
//      * @param {Object} context
//      * @returns {Object} { successCount, errorCount, failedItems }
//      */
//     async processItems(context, items) {
//       const results = {
//         successCount: 0,
//         errorCount: 0,
//         failedItems: []
//       };

//       // Process all items serially
//       await ActionUtils.forEach(items, async (item, index) => {
//         try {
//           const operation = item.operation;
//           const data = item.item.data;
//           const itemKey = data.proj_schd_id || 'NEW';

//           console.log(`Processing ${operation.toUpperCase()} - Record:`, itemKey);

//           // Call the unified save method
//           const success = await this.saveItem(context, operation, data);

//           if (success) {
//             results.successCount++;
//             console.log(`${operation.toUpperCase()} Success:`, itemKey);
//           } else {
//             results.errorCount++;
//             results.failedItems.push({ operation, key: itemKey, data });
//             console.error(`${operation.toUpperCase()} Failed:`, itemKey);
//           }

//         } catch (error) {
//           results.errorCount++;
//           results.failedItems.push({ 
//             operation: item.operation, 
//             key: item.item.data.proj_schd_id || 'NEW',
//             error: error.message 
//           });
//           console.error(`${item.operation.toUpperCase()} Error:`, error);
//         }
//       }, { mode: 'serial' });

//       return results;
//     }

//     /**
//      * Save a single item (unified method for ADD/UPDATE/DELETE)
//      * @param {Object} context
//      * @param {string} operation - 'add', 'update', or 'remove'
//      * @param {Object} data - The record data
//      * @returns {boolean} Success status
//      */
//     async saveItem(context, operation, data) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       // Format dates to YYYY-MM-DD for Oracle
//       const formattedData = {
//         ...data,
//         planned_start_date: this.formatDateForOracle(data.planned_start_date),
//         planned_end_date: this.formatDateForOracle(data.planned_end_date),
//         revised_start_date: this.formatDateForOracle(data.revised_start_date),
//         revised_end_date: this.formatDateForOracle(data.revised_end_date),
//         actual_start_date: this.formatDateForOracle(data.actual_start_date),
//         actual_end_date: this.formatDateForOracle(data.actual_end_date)
//       };

//       console.log(`${operation} - Original dates:`, {
//         planned_start: data.planned_start_date,
//         planned_end: data.planned_end_date
//       });
//       console.log(`${operation} - Formatted dates:`, {
//         planned_start: formattedData.planned_start_date,
//         planned_end: formattedData.planned_end_date
//       });

//       // Map operation to HTTP method
//       const methodMap = {
//         'add': 'POST',
//         'update': 'PUT',
//         'remove': 'DELETE'
//       };

//       const httpMethod = methodMap[operation];
//       const key = operation === 'add' ? '0' : formattedData.proj_schd_id;

//       // Encrypt payload with formatted dates
//       const encryptedPayload = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: formattedData },
//       });

//       // Encrypt method
//       const encryptedMethod = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: httpMethod },
//       });

//       // Encrypt key
//       const encryptedKey = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: key },
//       });

//       // Call REST service
//       const response = await Actions.callRest(context, {
//         endpoint: 'PDD/postPmispddScheduleProcess',
//         body: { payload: encryptedPayload },
//         headers: {
//           'x-session-id': encryptedKey,
//           'x-session-code': encryptedMethod,
//         },
//       });

//       // Check response
//       if (response.body.P_ERR_CODE === 'S') {
//         return true;
//       } else {
//         console.error(`API Error - ${operation}:`, response.body.P_ERR_MSG);
//         return false;
//       }
//     }
//   }

//   return onClickSave;
// });


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

  class onClickSave extends ActionChain {

    /**
     * Helper function to format date to YYYY-MM-DD
     * @param {string} dateString - ISO 8601 date string or any date format
     * @returns {string|null} Formatted date or null
     */
    formatDateForOracle(dateString) {
      if (!dateString) return null;
      
      try {
        let dateStr = String(dateString).trim();
        
        // Strategy 1: Already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }
        
        // Strategy 2: ISO 8601 with 'T'
        if (dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
        }
        
        // Strategy 3: Timestamp with space
        if (dateStr.includes(' ')) {
          dateStr = dateStr.split(' ')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
        }
        
        // Strategy 4: Fallback Date object
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error("Date formatting error:", error, "Input:", dateString);
        return null;
      }
    }

    /**
     * CRITICAL: Validate if a row has required fields filled
     * @param {Object} data - Row data
     * @param {string} operation - 'add', 'update', or 'remove'
     * @returns {Object} { isValid: boolean, missingFields: Array<string> }
     */
    validateRowData(data, operation) {
      const missingFields = [];

      // DELETE operations don't need validation
      if (operation === 'remove') {
        return { isValid: true, missingFields: [] };
      }

      // Required fields for ADD/UPDATE
      if (!data.milestone_id) {
        missingFields.push('Milestone');
      }

      if (!data.planned_start_date) {
        missingFields.push('Planned Start Date');
      }

      if (!data.planned_end_date) {
        missingFields.push('Planned End Date');
      }

      return {
        isValid: missingFields.length === 0,
        missingFields: missingFields
      };
    }

    /**
     * Save all buffered changes (ADD, UPDATE, DELETE operations)
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Get all submittable items
        const submittableItems = $page.variables.bufferDPSchedule.instance.getSubmittableItems();

        if (submittableItems.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No Changes',
            message: 'No changes to save',
            type: 'info',
            displayMode: 'transient'
          });
          return;
        }

        console.log("=== Save Operation Started ===");
        console.log("Total items in buffer:", submittableItems.length);

        // CRITICAL FIX: Filter out invalid items and collect invalid row info
        const { validItems, invalidItems } = this.filterValidItems(submittableItems);

        console.log("Valid items to process:", validItems.length);
        console.log("Invalid/empty items skipped:", invalidItems.length);

        if (validItems.length === 0) {
          // All items are invalid
          const invalidMessages = invalidItems.map(inv => 
            `Row ${inv.key}: Missing ${inv.missingFields.join(', ')}`
          ).join('\n');

          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Failed',
            message: `Cannot save. Please fix the following:\n${invalidMessages}`,
            type: 'error',
            displayMode: 'persist'
          });
          return;
        }

        // Show warning if some items are being skipped
        if (invalidItems.length > 0) {
          console.warn("Skipping invalid items:", invalidItems);
          
          const invalidMessages = invalidItems.map(inv => 
            `Row ${inv.key}: Missing ${inv.missingFields.join(', ')}`
          ).join('\n');

          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Warning',
            message: `${invalidItems.length} row(s) will be skipped:\n${invalidMessages}`,
            type: 'warning',
            displayMode: 'transient'
          });
        }

        console.log("Breakdown - ADD:", validItems.filter(i => i.operation === "add").length,
                    "UPDATE:", validItems.filter(i => i.operation === "update").length,
                    "DELETE:", validItems.filter(i => i.operation === "remove").length);

        // Process only valid items
        const results = await this.processItems(context, validItems);

        console.log("=== Save Operation Completed ===");
        console.log("Success:", results.successCount, "Failed:", results.errorCount);

        // Handle results
        if (results.errorCount === 0) {
          // All successful - reset buffer and reload everything
          await $page.variables.bufferDPSchedule.instance.resetAllUnsubmittedItems();
          
          await Actions.resetVariables(context, {
            variables: ['$variables.lvNextValue'],
          });

          // Call vbEnterListener to refresh entire page (milestone LOV + schedule data)
          await Actions.callChain(context, {
            chain: 'vbEnterListener',
          });

          await Actions.fireNotificationEvent(context, {
            summary: 'Save Successful',
            message: `Successfully saved ${results.successCount} record(s)`,
            type: 'confirmation',
            displayMode: 'transient'
          });
        } else {
          // Some failed - show detailed message
          await Actions.fireNotificationEvent(context, {
            summary: 'Save Completed with Errors',
            message: `Saved: ${results.successCount}, Failed: ${results.errorCount}. Check console for details.`,
            type: 'warning',
            displayMode: 'persist'
          });

          if (results.failedItems.length > 0) {
            console.error("Failed items:", results.failedItems);
          }
        }

      } catch (error) {
        console.error("Save - Unexpected Error:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Save Failed',
          message: 'An unexpected error occurred: ' + error.message,
          type: 'error',
          displayMode: 'persist'
        });
      }
    }

    /**
     * CRITICAL FIX: Filter submittable items to only valid ones
     * @returns {Object} { validItems: Array, invalidItems: Array }
     */
    filterValidItems(submittableItems) {
      const validItems = [];
      const invalidItems = [];

      submittableItems.forEach(item => {
        const operation = item.operation;
        const data = item.item.data;
        const itemKey = data.proj_schd_id || 'NEW';

        // Validate the row
        const validation = this.validateRowData(data, operation);

        if (validation.isValid) {
          validItems.push(item);
        } else {
          invalidItems.push({
            key: itemKey,
            operation: operation,
            missingFields: validation.missingFields
          });
          console.warn(`Skipping ${operation} for row ${itemKey} - Missing:`, validation.missingFields);
        }
      });

      return { validItems, invalidItems };
    }

    /**
     * Process all valid submittable items (ADD, UPDATE, DELETE)
     * @param {Object} context
     * @returns {Object} { successCount, errorCount, failedItems }
     */
    async processItems(context, items) {
      const results = {
        successCount: 0,
        errorCount: 0,
        failedItems: []
      };

      // Process all items serially
      await ActionUtils.forEach(items, async (item, index) => {
        try {
          const operation = item.operation;
          const data = item.item.data;
          const itemKey = data.proj_schd_id || 'NEW';

          console.log(`Processing ${operation.toUpperCase()} - Record:`, itemKey);

          // Call the unified save method
          const success = await this.saveItem(context, operation, data);

          if (success) {
            results.successCount++;
            console.log(`${operation.toUpperCase()} Success:`, itemKey);
          } else {
            results.errorCount++;
            results.failedItems.push({ operation, key: itemKey, data });
            console.error(`${operation.toUpperCase()} Failed:`, itemKey);
          }

        } catch (error) {
          results.errorCount++;
          results.failedItems.push({ 
            operation: item.operation, 
            key: item.item.data.proj_schd_id || 'NEW',
            error: error.message 
          });
          console.error(`${item.operation.toUpperCase()} Error:`, error);
        }
      }, { mode: 'serial' });

      return results;
    }

    /**
     * Save a single item (unified method for ADD/UPDATE/DELETE)
     * @param {Object} context
     * @param {string} operation - 'add', 'update', or 'remove'
     * @param {Object} data - The record data
     * @returns {boolean} Success status
     */
    async saveItem(context, operation, data) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Format dates to YYYY-MM-DD for Oracle
      const formattedData = {
        ...data,
        planned_start_date: this.formatDateForOracle(data.planned_start_date),
        planned_end_date: this.formatDateForOracle(data.planned_end_date),
        revised_start_date: this.formatDateForOracle(data.revised_start_date),
        revised_end_date: this.formatDateForOracle(data.revised_end_date),
        actual_start_date: this.formatDateForOracle(data.actual_start_date),
        actual_end_date: this.formatDateForOracle(data.actual_end_date)
      };

      console.log(`${operation} - Original dates:`, {
        planned_start: data.planned_start_date,
        planned_end: data.planned_end_date
      });
      console.log(`${operation} - Formatted dates:`, {
        planned_start: formattedData.planned_start_date,
        planned_end: formattedData.planned_end_date
      });

      // Map operation to HTTP method
      const methodMap = {
        'add': 'POST',
        'update': 'PUT',
        'remove': 'DELETE'
      };

      const httpMethod = methodMap[operation];
      const key = operation === 'add' ? '0' : formattedData.proj_schd_id;

      // Encrypt payload with formatted dates
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: formattedData },
      });

      // Encrypt method
      const encryptedMethod = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: httpMethod },
      });

      // Encrypt key
      const encryptedKey = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: key },
      });

      // Call REST service
      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddScheduleProcess',
        body: { payload: encryptedPayload },
        headers: {
          'x-session-id': encryptedKey,
          'x-session-code': encryptedMethod,
        },
      });

      // Check response
      if (response.body.P_ERR_CODE === 'S') {
        return true;
      } else {
        console.error(`API Error - ${operation}:`, response.body.P_ERR_MSG);
        return false;
      }
    }
  }

  return onClickSave;
});