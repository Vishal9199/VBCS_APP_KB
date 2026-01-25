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
      
      let order=["RestrictionFilter","PersonFilter"];

      setTimeout(()=> $application.functions.reorderListItems(order),300);

      
    }
  }

  return vbEnterListener;
});