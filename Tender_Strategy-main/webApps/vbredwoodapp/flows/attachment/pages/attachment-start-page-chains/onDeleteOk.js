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

  class onDeleteOk extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const loadingDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#loadingDialog',
        method: 'open',
      });

      console.log("Row id==>"+$variables.rowId);
      console.log("Row Trans id==>"+$variables.rowTransId);
      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/postNws_custAttachmentDelete',
        headers: {
          'x-cache-doc-id': $application.functions.encryptJs_Normal($application.constants.secretKey, $variables.rowId),
        },
      });

      if (!response.ok) {
        if (true) {

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });

          const loadingDialogClose2 = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
        }
      
        return;
      } else {
        const deleteDialogClose = await Actions.callComponentMethod(context, {
          selector: '#deleteDialog',
          method: 'close',
        });

        await Actions.callChain(context, {
          chain: 'searchAC',
        });

        const loadingDialogClose3 = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });
      }
    }
  }

  return onDeleteOk;
});