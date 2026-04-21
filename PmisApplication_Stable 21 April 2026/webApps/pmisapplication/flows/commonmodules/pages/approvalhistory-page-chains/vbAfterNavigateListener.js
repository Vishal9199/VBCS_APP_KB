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

  class vbAfterNavigateListener extends ActionChain {
    async run(context) {
      const { $page, $variables, $application, $functions } = context;

      try {
        console.log("=== Encryption Details ===");
        console.log("Transaction ID:", $variables.lv_transaction_id);
        console.log("Secret Key:", $application.constants.secretKey);

        // Validate transaction ID exists
        if (!$variables.lv_transaction_id) {
          console.error("❌ Transaction ID is required");
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: 'Transaction ID is required to load approval history',
            type: 'error',
            displayMode: 'persistent'
          });
          
          $variables.allRowsData = [];
          $variables.expandedRows = {};
          $variables.approvalHistoryADP.data = [];
          return;
        }

        // ✅ CRITICAL FIX: Create JSON object with all required fields
        // const payloadData = {
        //   'payload': $variables.lv_transaction_id
        // };

        // Convert to JSON string
        // const jsonPayload = JSON.stringify(payloadData);
        
        // console.log("JSON Payload to encrypt:", jsonPayload);

        // Encrypt the JSON string (not just the transaction_id)
        // const encryptedPayload = await $functions.encryptJs(
        //   jsonPayload,  // ✅ Encrypt the JSON string, not just the ID
        //   $application.constants.secretKey,
        //   $application.constants.time,
        //   $application.constants.unit
        // );

        // console.log("Encrypted Payload:", encryptedPayload);

        // Set the request body with encrypted payload
        // $variables.encPayload = {
        //   payload: encryptedPayload
        // };

        // console.log("Request Body:", JSON.stringify($variables.encPayload));

        // Call API
        const response = await Actions.callRest(context, {
          endpoint: 'approval/postCommonApprovalActionHistoryDtl',
          headers: {
            'x-session-id': $variables.lv_transaction_id,
          },
        });

        console.log("=== Full API Response ===");
        console.log("Status Code:", response.status);
        console.log("Response Body:", JSON.stringify(response.body, null, 2));

        // Check HTTP status
        if (response.status !== 200) {
          console.error("❌ API Error: Non-200 status code");
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: `Failed to fetch approval history. Status: ${response.status}`,
            type: 'error',
            displayMode: 'transient'
          });
          
          $variables.allRowsData = [];
          $variables.expandedRows = {};
          $variables.approvalHistoryADP.data = [];
          return;
        }

        // Check API response status
        if (response.body.OUT_STATUS !== 'SUCCESS') {
          console.error("❌ API returned error:", response.body.OUT_MESSAGE);
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: response.body.OUT_MESSAGE || 'Failed to fetch approval history',
            type: 'error',
            displayMode: 'transient'
          });
          
          $variables.allRowsData = [];
          $variables.expandedRows = {};
          $variables.approvalHistoryADP.data = [];
          return;
        }

        // Check P_OUTPUT
        if (!response.body.P_OUTPUT || response.body.P_OUTPUT.length === 0) {
          console.warn("⚠️ No approval history records found");
          // await Actions.fireNotificationEvent(context, {
          //   summary: 'No Records',
          //   message: 'No approval history found for this transaction',
          //   type: 'info',
          //   displayMode: 'transient'
          // });
          
          $variables.allRowsData = [];
          $variables.expandedRows = {};
          $variables.approvalHistoryADP.data = [];
          return;
        }

        console.log("=== Processing Records ===");
        console.log("Total records:", response.body.P_OUTPUT.length);

        const flatData = [];
        
        // Group by version_number and appr_level
        const groupedByVersion = {};
        
        response.body.P_OUTPUT.forEach(item => {
          const versionKey = `v${item.version_number}`;
          const levelKey = `level${item.appr_level}`;
          
          if (!groupedByVersion[versionKey]) {
            groupedByVersion[versionKey] = {};
          }
          
          if (!groupedByVersion[versionKey][levelKey]) {
            groupedByVersion[versionKey][levelKey] = [];
          }
          
          groupedByVersion[versionKey][levelKey].push(item);
        });

        console.log("=== Grouped Data ===");
        console.log("Versions:", Object.keys(groupedByVersion));

        // Process each version
        Object.keys(groupedByVersion).sort().reverse().forEach((versionKey) => {
          const versionNum = parseInt(versionKey.replace('v', ''));
          const levels = groupedByVersion[versionKey];
          
          console.log(`Processing Version ${versionNum}, Levels:`, Object.keys(levels));
          
          // Process each approval level within the version
          Object.keys(levels).sort((a, b) => {
            const levelA = parseInt(a.replace('level', ''));
            const levelB = parseInt(b.replace('level', ''));
            return levelA - levelB;
          }).forEach((levelKey) => {
            const levelItems = levels[levelKey];
            const firstItem = levelItems[0];
            const hasNestedHistory = firstItem.nested_history && firstItem.nested_history.length > 0;
            
            console.log(`Level ${firstItem.appr_level}: ${firstItem.category}, Has nested: ${hasNestedHistory}`);
            
            // Create parent record
            const parentId = `v${versionNum}-level${firstItem.appr_level}-${firstItem.category.replace(/\s+/g, '-')}`;
            const parentRecord = {
              id: parentId,
              version_number: versionNum,
              appr_level: firstItem.appr_level,
              category: firstItem.category,
              status: firstItem.status,
              last_action_by: firstItem.last_action_by,
              last_action_date: firstItem.last_action_date,
              last_action_comments: firstItem.last_action_comments,
              request_submitted_date: firstItem.request_submitted_date,
              isParent: true,
              isChild: false,
              parentId: null,
              level: 1,
              hasChildren: hasNestedHistory,
              childCount: hasNestedHistory ? firstItem.nested_history.length : 0,
              approver_name: '',
              approval_role:firstItem.approval_role,
              action_date: '',
              comments: ''
            };
            
            flatData.push(parentRecord);
            
            // Create child records from nested_history
            if (hasNestedHistory) {
              console.log(`Adding ${firstItem.nested_history.length} child records`);
              firstItem.nested_history.forEach((nestedItem, index) => {
                const childRecord = {
                  id: `${parentId}-child${index}`,
                  version_number: versionNum,
                  appr_level: firstItem.appr_level,
                  category: firstItem.category,
                  status: nestedItem.status,
                  last_action_by: '',
                  last_action_date: '',
                  last_action_comments: '',
                  request_submitted_date: '',
                  isParent: false,
                  isChild: true,
                  parentId: parentId,
                  level: 2,
                  hasChildren: false,
                  childCount: 0,
                  approval_role: nestedItem.approval_role,
                  approver_name: nestedItem.approver_name,
                  action_date: nestedItem.action_date,
                  comments: nestedItem.comments
                };
                
                flatData.push(childRecord);
              });
            }
          });
        });

        console.log("=== Hierarchical Flat Data ===");
        console.log("Total rows:", flatData.length);
        console.log("Parent rows:", flatData.filter(r => r.isParent).length);
        console.log("Child rows:", flatData.filter(r => r.isChild).length);
        console.log("Sample data:", JSON.stringify(flatData.slice(0, 3), null, 2));

        // Store full dataset
        $variables.allRowsData = flatData;

        // Initialize expansion state - all collapsed
        const expandedState = {};
        flatData.forEach(row => {
          if (row.isParent) {
            expandedState[row.id] = false;
          }
        });
        $variables.expandedRows = expandedState;

        console.log("Expansion state initialized:", Object.keys(expandedState).length, "parents");

        // Calculate initial visible rows (only parents)
        const visibleRows = this.getVisibleRows(flatData, expandedState);
        
        console.log("=== Initial Visible Rows ===");
        console.log("Visible rows:", visibleRows.length);

        // Assign to ADP
        $variables.approvalHistoryADP.data = visibleRows;

        // Success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: `Loaded ${flatData.filter(r => r.isParent).length} approval levels with ${flatData.filter(r => r.isChild).length} approvers`,
          type: 'confirmation',
          displayMode: 'transient'
        });

      } catch (error) {
        console.error("=== Error in vbAfterNavigateListener ===");
        console.error("Error:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load approval history: ' + error.message,
          type: 'error',
          displayMode: 'persistent'
        });
        
        $variables.allRowsData = [];
        $variables.expandedRows = {};
        $variables.approvalHistoryADP.data = [];
      }
    }

    /**
     * Get visible rows based on expansion state
     */
    getVisibleRows(allRows, expandedState) {
      const visible = [];
      
      allRows.forEach(row => {
        if (row.isParent) {
          visible.push(row);
        } else if (row.isChild && expandedState[row.parentId]) {
          visible.push(row);
        }
      });
      
      return visible;
    }
  }

  return vbAfterNavigateListener;
});