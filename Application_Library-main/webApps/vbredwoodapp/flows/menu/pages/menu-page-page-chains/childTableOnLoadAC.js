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

  class childTableOnLoadAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if($variables.method === 'PUT'){

        $variables.isMenuCodeReadOnly = true;

      $variables.searchObj.MENU_ID = $variables.primaryKey;

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptedPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Menu/postMenuEntriesSearch',
        body: $variables.encryptedPayload,
      });

      $variables.ADPsubmenuValue.data = response.body.P_OUTPUT;
      $variables.displaynum = +response.body.OUT_TOTAL_COUNT +1 ;
        $variables.pagination.prev = +$variables.searchObj.IN_OFFSET > 0;
        $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";
      } else {
        $variables.isMenuCodeReadOnly = false;
      }
    }
  }

  return childTableOnLoadAC;
});
