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

  class vbEnterListener extends ActionChain {

    /**
     * OnLoad
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      await $application.functions.reorderFilterChips();

      let encryptJs = await Actions.callChain(context, {
        chain: 'application:encLargePayloadWithTime',
        params: {
          plainText: $variables.SearchObj,
        },
      });

      console.log("++++1 searchObj: ", encryptJs);

      $variables.encSearchObj.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/postPettycashHeaderSearch',
        body: $variables.encSearchObj,
      });

      $variables.tableHeaderADP.data = response.body.P_OUTPUT;
      $variables.totalRecords = response.body.OUT_TOTAL_COUNT;

      // ✅ CALCULATE CURRENT PAGE
      const offset = parseInt($variables.SearchObj.in_offset, 10);
      const limit = parseInt($variables.SearchObj.in_limit, 10);
      $variables.currentPage = Math.floor(offset / limit) + 1;
      
      console.log("📄 Current Page:", $variables.currentPage);
      console.log("📊 Records on page:", $variables.tableHeaderADP.data.length);
      console.log("📈 Total records:", $variables.totalRecords);

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
      
      await Actions.fireDataProviderEvent(context, {
        target: $variables.tableHeaderADP,
        refresh: null,
      });
    
      if (response.body.OUT_HAS_NEXT === 'Y') {
        $variables.pagination.is_next = false;
      } else {
        $variables.pagination.is_next = true;
      }

      if ($variables.SearchObj.in_offset === '0') {
        $variables.pagination.is_prev = true;
      } else {
        $variables.pagination.is_prev = false;
      }
      
      $variables.vShowFragment = true;

//       let order = [
//   'GovernateFilter',
//   'SupplierNameFilter',
//   'DateFilter'
// ];

      // setTimeout(()=> $application.functions.reorderListItems(order),300);

      
    }
  }

  return vbEnterListener;
});