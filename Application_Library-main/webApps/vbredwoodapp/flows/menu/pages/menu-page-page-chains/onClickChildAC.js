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

  class onClickChildAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key 
     * @param {number} params.index 
     * @param {any} params.current 
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application, $constants, $variables, $current } = context;

       $variables.searchObj.MENU_ID = key;

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchObj);

      $variables.encryptedPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Menu/postMenuEntriesSearch',
        body: $variables.encryptedPayload,
      });

      $variables.subMenuVar = response.body.P_OUTPUT[0];

      if (response.body.P_OUTPUT[0].active_flag === 'Y') {
        $variables.subMenuVar.active_flag = 'true';
      }


      const fidMenuEntriesDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#fid_menuEntriesDialog',
        method: 'open',
      });
    }
  }

  return onClickChildAC;
});
