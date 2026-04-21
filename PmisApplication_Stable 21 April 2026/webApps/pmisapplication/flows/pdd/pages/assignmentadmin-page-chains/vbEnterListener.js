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
      const { $page, $flow, $application, $constants, $variables } = context;


      const loadingDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#loadingDialog',
        method: 'open',
      });

      let encsearchObj = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.searchObj,
        },
      });

      const encryptedPayload = {
  payload: encsearchObj
};

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddProjetassSearch',
        body: encryptedPayload,
      });

      $variables.projectAssignmentADP.data = response.body.P_OUTPUT;

      const loadingDialogClose = await Actions.callComponentMethod(context, {
        selector: '#loadingDialog',
        method: 'close',
      });
    }
  }

  return vbEnterListener;
});
