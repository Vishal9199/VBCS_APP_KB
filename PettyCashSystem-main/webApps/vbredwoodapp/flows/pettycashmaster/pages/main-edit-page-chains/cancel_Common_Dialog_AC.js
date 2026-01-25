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

  class cancel_Common_Dialog_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.dialogId
     */
    async run(context, { dialogId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (dialogId === 'approveDialog') {

        await Actions.resetVariables(context, {
          variables: [
    '$flow.variables.responseComments',
  ],
        });

        const approveDialogClose = await Actions.callComponentMethod(context, {
          selector: '#approveDialog',
          method: 'close',
        });
      } else if (dialogId === 'rejectDialog') {

        await Actions.resetVariables(context, {
          variables: [
            '$flow.variables.responseComments',
          ],
        });

        const rejectDialogClose = await Actions.callComponentMethod(context, {
          selector: '#rejectDialog',
          method: 'close',
        });
      } else if (dialogId === 'withdrawDialog') {

        await Actions.resetVariables(context, {
          variables: [
            '$flow.variables.responseComments',
          ],
        });

        const withdrawDialogClose = await Actions.callComponentMethod(context, {
          selector: '#withdrawDialog',
          method: 'close',
        });
      } else if (dialogId === 'ReassignDialog') {

        await Actions.resetVariables(context, {
          variables: [
            '$flow.variables.responseComments',
          ],
        });
        const reassignDialogClose = await Actions.callComponentMethod(context, {
          selector: '#ReassignDialog',
          method: 'close',
        });
      } else if (dialogId === 'moreinfoDialog') {

        await Actions.resetVariables(context, {
          variables: [
            '$flow.variables.responseComments',
          ],
        });
        const moreinfoDialogClose = await Actions.callComponentMethod(context, {
          selector: '#moreinfoDialog',
          method: 'close',
        });
      } else if ( dialogId === 'rpaDialog' ) {
      
        await Actions.resetVariables(context, {
          variables: [
            '$flow.variables.responseComments',
          ],
        });
        const apprResponseDialogClose = await Actions.callComponentMethod(context, {
          selector: '#apprResponseDialog',
          method: 'close',
        });
      } else if ( dialogId === 'apprResponseDialog' ) {
            
        await Actions.resetVariables(context, {
          variables: [
            '$flow.variables.responseComments',
          ],
        });
        const apprResponseDialogClose2 = await Actions.callComponentMethod(context, {
          selector: '#apprResponseDialog',
          method: 'close',
        });
      } else if (dialogId === 'submitDialog') {
        const submitDialogClose = await Actions.callComponentMethod(context, {
          selector: '#submitDialog',
          method: 'close',
        });
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'OJET Compatibility Error!',
          message: 'Please try again in sometime.',
          displayMode: 'transient',
          type: 'warning',
        });
      }
    }
  }

  return cancel_Common_Dialog_AC;
});
