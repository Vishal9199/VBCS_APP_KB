define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class vbAfterNavigateListener extends ActionChain {
    async run(context) {
      const { $page, $application, $variables } = context;

      try {
        // Open loading dialog
        const loadingDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

        // Reorder filter chips (if you have this function in application level)
        // if ($application.functions.reorderFilterChips) {
        //   await $application.functions.reorderFilterChips();
        // }

        // ✅ Log the search object BEFORE encryption
        console.log("📤 Region SearchObj before encryption:");
        console.log(JSON.stringify($variables.searchObj, null, 2));

        // Encrypt the payload using application-level encryption
        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
           params: {
            input: $variables.searchObj,
          },
        });

        console.log("🔐 Encrypted payload created for Region search");

        // Prepare encrypted payload object
        const encryptedPayload = {
          payload: enc_payload
        };

        // Call the Region search endpoint (matching your PL/SQL get_data procedure)
        const response = await Actions.callRest(context, {
          endpoint: 'PmisSetup/postRegionSearch',
          body: encryptedPayload,
        });

        console.log("📥 Region Response received:", response.body.OUT_STATUS);
        console.log("📊 Total region records:", response.body.OUT_TOTAL_COUNT);
        console.log("📄 Region records returned:", response.body.OUT_COUNT);

        // Update region table data
        $variables.regionADP.data = response.body.P_OUTPUT || [];
        console.log("Region ADP Date: ", JSON.stringify($variables.regionADP.data));
        
        // ✅ Calculate pagination values with proper validation
        await this.updatePaginationValues(context, response);

        // Refresh the region table data provider
        await Actions.fireDataProviderEvent(context, {
          target: $variables.regionADP,
          refresh: null,
        });

        // ✅ Update pagination controls
        await this.updatePaginationControls(context, response);

        // Close loading dialog
        const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });

        // Show the page content
        if (!$variables.vShowFragment) {
          $variables.vShowFragment = true;
        }

        console.log("✅ Region search completed successfully");
        console.log("📄 Final Current Page:", $variables.currentPage);
        console.log("📊 Final Total Records:", $variables.totalRecords);

      } catch (error) {
        console.error("❌ Error in Region vbAfterNavigateListener:", error);
        console.error("❌ Error details:", error.message);
        console.error("❌ Error stack:", error.stack);

        // Close loading dialog on error
        try {
          await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        } catch (dialogError) {
          console.error("❌ Error closing loading dialog:", dialogError);
        }
        
        // Show error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Region Search Error',
          message: 'Failed to load region data: ' + error.message,
          type: 'error',
          displayMode: 'persist'
        });
      }
    }

    /**
     * ✅ Update pagination values with proper validation
     */
    updatePaginationValues(context, response) {
      const { $variables } = context;

      // Store total records for pagination display
      $variables.totalRecords = response.body.OUT_TOTAL_COUNT || 0;

      // ✅ Safe parsing with fallback to default values
      const offset = this.safeParseInt($variables.searchObj.in_offset, 0);
      const limit = this.safeParseInt($variables.searchObj.in_limit, 10);

      // ✅ Calculate current page with validation
      $variables.currentPage = Math.floor(offset / limit) + 1;

      console.log("📄 Calculated Current Page:", $variables.currentPage);
      console.log("📊 Total Records:", $variables.totalRecords);
      console.log("🔢 Offset:", offset, "Limit:", limit);
    }

    /**
     * ✅ Update pagination controls (Previous/Next buttons)
     * IMPORTANT: is_next and is_prev are DISABLED flags (true = disabled, false = enabled)
     */
    updatePaginationControls(context, response) {
      const { $variables } = context;

      // Initialize pagination object if it doesn't exist
      if (!$variables.pagination) {
        $variables.pagination = {
          is_next: false,
          is_prev: false
        };
      }

      // ✅ Disable Next button if no more pages
      if (response.body.OUT_HAS_NEXT === 'Y') {
        $variables.pagination.is_next = false; // Enable Next button (more pages available)
      } else {
        $variables.pagination.is_next = true;  // Disable Next button (last page)
      }

      // ✅ Safe parsing for Previous button state
      const offset = this.safeParseInt($variables.searchObj.in_offset, 0);
      
      // Disable Previous button if on first page
      if (offset <= 0) {
        $variables.pagination.is_prev = true;  // Disable Previous button (first page)
      } else {
        $variables.pagination.is_prev = false; // Enable Previous button (not first page)
      }

      console.log("🔘 Pagination controls updated:");
      console.log("   Previous button disabled:", $variables.pagination.is_prev);
      console.log("   Next button disabled:", $variables.pagination.is_next);
      console.log("   out_has_next:", response.body.OUT_HAS_NEXT);
      console.log("   Current offset:", offset);
    }

    /**
     * ✅ Safely parse integer with fallback
     */
    safeParseInt(value, defaultValue) {
      if (value === undefined || value === null || value === '') {
        return defaultValue;
      }
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        return defaultValue;
      }
      return parsed;
    }
  }

  return vbAfterNavigateListener;
});