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
     * @param {{}} params.value
     */
    async run(context, { value }) {
      const { $variables } = context;

      // try {
      //   if (value) {
      //     // Find the selected region from LOV
      //     // const regionLovData = $variables.getPmisLovRegionNameListSDP;
          
      //     if (regionLovData?.data) {
      //       const regionItem = await regionLovData.data.find(
      //         item => item.lookup_value_id === value
      //       );
            
      //       if (regionItem) {
      //         // Set region code for dependent LOV
      //         // $variables.valueFromLov.regionCode = regionItem.lookup_value_code;

      //         // Clear previously selected location
      //         $variables.projectCharterVar.project_location_id = null;

      //         // Refresh dependent Location LOV
      //         // await Actions.fireDataProviderEvent(context, {
      //         //   target: $variables.getPmispamLovProjectCharterLocationListSDP,
      //         //   refresh: null,
      //         // });

      //         console.log(
      //           "%cRegion changed - Location LOV refreshed",
      //           "color:#5c7cfa;font-weight:bold;",
      //           { regionCode: regionItem.lookup_value_code }
      //         );
      //       }
      //     }
      //   } else {
      //     // Clear dependent LOV if region is cleared
      //     // $variables.valueFromLov.regionCode = null;
      //     $variables.projectCharterVar.project_location_id = null;
      //   }

      // } catch (error) {
      //   console.error("Error in regionChangeListener:", error);
      // }
    }
  }

  return regionChangeListenerChain;
});