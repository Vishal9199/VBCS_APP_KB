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

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{previousPage:string,previousPageParams:any,currentPage:string,currentPageParams:any}} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const progressMsgOpen = await Actions.callComponentMethod(context, {
        selector: '#progressMsg',
        method: 'open',
      });

      $variables.selectedTab = 'claimLine';

      console.log("=== AFTER NAVIGATE START ===");
      console.log("📍 p_nav_id:", $variables.pNavId);

      if ($variables.pNavId) {
        console.log("🔍 Fetching header details with encrypted ID...");
        
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getNws_custPettycashHeaderDtl',
          headers: {
            'x-session-id': $variables.pNavId,
          },
        });

        console.log("📥 GET Response Status:", response.status);
        console.log("📥 GET Response Count:", response.body.count);

        if (response.body.count === 1) {
          console.log("✅ Found 1 record");

          // =====================================================================
          // ✅ FIX: Pass first item from array, not the array itself
          // =====================================================================
          console.log("📦 Raw item data:", JSON.stringify(response.body.items[0]));

          $variables.temp_Supplier_Site = response.body.items[0].supplier_site_code;

          // Call mapAllFields with SINGLE OBJECT (first item)
          const mapAllFields = await $functions.mapAllFields(response.body.items[0]);
          
          console.log("📦 Mapped payload:", JSON.stringify(mapAllFields));

          // Assign to payload
          $variables.payload = mapAllFields;

          $variables.payload.cash_in_hand = $variables.payload.close_balance_amt;

          console.log("✅ Payload assigned successfully");

          // Call toolbar action chain
          await Actions.callChain(context, {
            chain: 'toolBarAC',
            params: {
              taskId: $variables.taskId,
              statusCode: response.body.items[0].status_code,
            },
          });

          console.log("✅ Toolbar configured");

          // Load line tables
          await Actions.callChain(context, {
            chain: 'loadLineTablesAC',
            params: {
              'key_param': response.body.items[0].claim_header_id,
            },
          });

          console.log("✅ Line tables loaded");

          const progressMsgClose = await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });

        } else if (response.body.count === 0) {
          console.error("❌ No records found for encrypted ID");

          const progressMsgClose2 = await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Record not found',
            message: 'The requested petty cash claim could not be found.',
            displayMode: 'transient',
            type: 'error',
          });

        } else {
          console.error("❌ Multiple records found (unexpected):", response.body.count);
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Multiple records found',
            message: `Unexpected: Found ${response.body.count} records.`,
            displayMode: 'transient',
            type: 'warning',
          });
        }

      } else {
        console.log("ℹ️ No p_nav_id - Setting up for new record (Draft)");
        
        // No encrypted ID - this is a new record scenario
        await Actions.callChain(context, {
          chain: 'toolBarAC',
          params: {
            statusCode: 'DRA',
          },
        });

        console.log("✅ Toolbar configured for Draft");

        const progressMsgClose3 = await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close',
        });
      }

      console.log("=== AFTER NAVIGATE END ===");
    }
  }

  return vbAfterNavigateListener;
});