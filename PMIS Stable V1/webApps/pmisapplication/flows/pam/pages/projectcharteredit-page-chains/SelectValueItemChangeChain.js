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

  class regionChangeListenerChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value
     * @param {any} params.valueItem - ✅ CONTAINS FULL SELECTED REGION DATA
     */
    async run(context, { value, valueItem }) {
      const { $variables } = context;

      try {
        // ✅ USE valueItem.data - It contains the complete selected region object
        if (value && valueItem && valueItem.data) {
          
          const regionItem = valueItem.data;
          
          // Set region code for dependent LOV
          $variables.valueFromLov.regionCode = regionItem.lookup_value_code;

          // Clear previously selected location
          // $variables.projectCharterVar.project_location_id = null;

          // Refresh dependent Location LOV
          // await Actions.fireDataProviderEvent(context, {
          //   target: $variables.getPmispamLovProjectCharterLocationListSDP,
          //   refresh: null,
          // });

          console.log(
            "%cRegion changed - Location LOV refreshed",
            "color:#5c7cfa;font-weight:bold;",
            { 
              regionCode: regionItem.lookup_value_code,
              regionName: regionItem.lookup_value_name,
              regionId: regionItem.lookup_value_id
            }
          );
          
        } else {
          // Clear dependent LOV if region is cleared
          $variables.valueFromLov.regionCode = null;
          // $variables.projectCharterVar.project_location_id = null;
          
          console.log("%cRegion cleared", "color:#fa5252;font-weight:bold;");
        }

      } catch (error) {
        console.error("%cError in regionChangeListener:", "color:#fa5252;font-weight:bold;", error);
        
        // Optional: Show error notification to user
        await Actions.fireNotificationEvent(context, {
          summary: 'Region Change Error',
          message: 'Failed to update dependent location field',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return regionChangeListenerChain;
});