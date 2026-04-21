define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onConfirmDeleteIssue extends ActionChain {

    async run(context) {
      const { $page, $application, $variables } = context;

      const key     = $variables.lvDeleteKey;
      const rowData = $variables.lvDeleteRowData;

      try {
        // Close confirm dialog and open progress dialog
        document.getElementById('issueConfirmDialog').close();
        document.getElementById('issueProgressDialog').open();

        const encryptedId = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: String(key) },
        });

        const encryptedMethod = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'DELETE' },
        });

        const encryptedPayload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: JSON.stringify(rowData) },
        });

        const deleteResponse = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddIssueregisterProcess',
          body: { payload: encryptedPayload },
          headers: {
            'x-session-id':   encryptedId,
            'x-session-code': encryptedMethod,
          },
        });

        if (deleteResponse.body && deleteResponse.body.P_ERR_CODE === 'S') {
          await $page.variables.issueBufferDP.instance.removeItem({
            metadata: { key: key },
            data: rowData,
          });
          await Actions.fireNotificationEvent(context, {
            summary: 'Issue record deleted successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });
          console.log('onConfirmDeleteIssue: deleted issue_id=', key);
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Delete failed: ' + (deleteResponse.body.P_ERR_MSG || 'Unknown error'),
            displayMode: 'persist',
            type: 'error',
          });
        }

      } catch (error) {
        console.error('onConfirmDeleteIssue error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Failed to delete issue record',
          displayMode: 'persist',
          type: 'error',
        });
      } finally {
        document.getElementById('issueProgressDialog').close();
        // Clear delete state variables
        $variables.lvDeleteKey = 0;
        $variables.lvDeleteRowData = {};
      }
    }
  }

  return onConfirmDeleteIssue;
});