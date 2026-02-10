define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class vbAfterNavigateListener extends ActionChain {
    async run(context) {
      const { $page, $application, $variables, $functions } = context;
      await $functions.reorderFilterChips();

      try {
        // Open loading dialog
        const loadingDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

        // ✅ Log the search object BEFORE encryption to verify lowercase keys
        console.log("📤 PMIS Calendar SearchObj before encryption (should be lowercase):");
        console.log(JSON.stringify($variables.searchObj, null, 2));

        // Encrypt the payload
        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.searchObj,
          },
        });

        console.log("🔐 Encrypted payload created for PMIS Calendar search");

        // Prepare encrypted payload object
        const encryptedPayload = {
          payload: enc_payload
        };

        // Call the PMIS Calendar search endpoint
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamServicespecSearch',
          body: encryptedPayload,
        });

        console.log("📥 PMIS Service Specification Response received:", response.body.OUT_STATUS);
        console.log("📊 Total Service Specification records:", response.body.OUT_TOTAL_COUNT);
        console.log("📄 Service Specification records returned:", response.body.OUT_COUNT);

        // Update calendar table data
        $variables.serviceSpecADP.data = response.body.P_OUTPUT || [];
        
        // ✅ FIXED: Calculate pagination values with proper validation
        await this.updatePaginationValues(context, response);

        // Refresh the calendar table data provider
        await Actions.fireDataProviderEvent(context, {
          target: $variables.serviceSpecADP,
          refresh: null,
        });

        // ✅ FIXED: Update pagination controls with proper validation
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

        console.log("✅ PMIS Service Specification search completed successfully");
        console.log("📄 Final Current Page:", $variables.currentPage);
        console.log("📊 Final Total Records:", $variables.totalRecords);

      } catch (error) {
        console.error("❌ Error in PMIS Service Specification vbAfterNavigateListener:", error);
        console.error("❌ Error details:", error.message);
        console.error("❌ Error stack:", error.stack);

        // Close loading dialog on error
          await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
      }
    }

    /**
     * ✅ NEW METHOD: Update pagination values with proper validation
     */
    updatePaginationValues(context, response) {
      const { $variables } = context;

      // Store total records for pagination display
      $variables.totalRecords = response.body.OUT_TOTAL_COUNT || 0;

      // ✅ FIXED: Safe parsing with fallback to default values
      const offset = this.safeParseInt($variables.searchObj.in_offset, 0);
      const limit = this.safeParseInt($variables.searchObj.in_limit, 10);

      // ✅ FIXED: Calculate current page with validation
      // if (limit > 0) {
        $variables.currentPage = Math.floor(offset / limit) + 1;

      // ----------------------------
      // ✅ PAGINATION DISPLAY LOGIC
      // ----------------------------
      const totalCount = Number($variables.totalRecords || 0);

      if (totalCount > 0) {
        const startRecord = offset + 1;
        const endRecord = Math.min(offset + limit, totalCount);
        $variables.paginationDisplay = `(${startRecord}-${endRecord} of ${totalCount} items)`;
      } else {
        $variables.paginationDisplay = "(0-0 of 0 items)";
      }

      console.log("📄 Calculated Current Page:", $variables.currentPage);
      console.log("📊 Total Records:", $variables.totalRecords);
      console.log("🔢 Offset:", offset, "Limit:", limit);
    }

    /**
     * ✅ NEW METHOD: Update pagination controls (Previous/Next buttons)
     */
    /**
 * ✅ CORRECTED: Update pagination controls (Previous/Next buttons)
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

  // ✅ CORRECTED: Disable Next button if no more pages
  if (response.body.OUT_HAS_NEXT === 'Y') {
    $variables.pagination.is_next = false; // Enable Next button (more pages available)
  } else {
    $variables.pagination.is_next = true;  // Disable Next button (last page)
  }

  // ✅ CORRECTED: Safe parsing for Previous button state
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
  console.log("   OUT_HAS_NEXT:", response.body.OUT_HAS_NEXT);
  console.log("   Current offset:", offset);
}

    /**
     * ✅ NEW METHOD: Safely parse integer with fallback
     * @param {number} defaultValue - Default value if parsing fails
     * @returns {number} Parsed integer or default value
     */
    safeParseInt(value, defaultValue) {
      // Handle undefined, null, or empty string
      if (value === undefined || value === null || value === '') {
        return defaultValue;
      }

      // Parse the value
      const parsed = parseInt(value, 10);

      // Return default if parsing resulted in NaN
      if (isNaN(parsed)) {
        return defaultValue;
      }

      return parsed;
    }
  }

  return vbAfterNavigateListener;
});