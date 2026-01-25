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
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const loadingDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#loadingDialog',
        method: 'open',
      });

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.SearchObj);

      $variables.encSearchObj.payload = encryptJs;

  const response = await Actions.callRest(context, {
    endpoint: 'User/postNws_aolRestrictionSearch',
    body: $variables.encSearchObj,
  });

      $variables.tableADP.data = response.body.P_OUTPUT;
      await Actions.fireDataProviderEvent(context, {
        target: $variables.tableADP,
        refresh: null,
      });

      // console.log("Data",$variables.tableADP);
    

      if (response.body.OUT_HAS_NEXT === 'Y') {
        $variables.pagination.is_next = false;
      } else {
        $variables.pagination.is_next = true;
      }

      if ($variables.SearchObj.IN_OFFSET === '0') {
        $variables.pagination.is_prev = true;
      } else {
        $variables.pagination.is_prev = false;
      }
      
      let order=["RestrictionFilter","PersonFilter"];

      setTimeout(()=> $application.functions.reorderListItems(order),300);

      const loadingDialogClose = await Actions.callComponentMethod(context, {
        selector: '#loadingDialog',
        method: 'close',
      });

      
    }
  }

  return vbEnterListener;
});
