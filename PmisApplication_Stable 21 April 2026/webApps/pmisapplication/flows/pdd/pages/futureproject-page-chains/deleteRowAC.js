define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class deleteRowAC extends ActionChain {

    async run(context) {
      const { $page, $application, $variables } = context;

      try {
        document.getElementById('deleteDialog').close();

        const rowKey = $variables.lvCurrentRow.future_project_id;

        // ── Temp row (never saved to DB) — remove from BDP only ──────────
        if (rowKey < 0) {
          await $page.variables.futureProjectBDP.instance.removeItem({
            metadata: { key: rowKey },
            data: $variables.lvCurrentRow,
          });
          await Actions.fireNotificationEvent(context, {
            summary: 'New row discarded.',
            displayMode: 'transient',
            type: 'confirmation',
          });
          return;
        }

        // ── Existing DB row — send DELETE to backend ──────────────────────
        document.getElementById('progressDialog').open();

        const encryptedId = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: String(rowKey) },
        });
        const encryptedMethod = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'DELETE' },
        });
        const encryptedPayload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: JSON.stringify({ future_project_id: rowKey }) },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddFutureprojectProcess',
          body: { payload: encryptedPayload },
          headers: {
            'x-session-id':   encryptedId,
            'x-session-code': encryptedMethod,
          },
        });

        if (response.body && response.body.P_ERR_CODE === 'S') {
          await $page.variables.futureProjectBDP.instance.removeItem({
            metadata: { key: rowKey },
            data: $variables.lvCurrentRow,
          });
          await Actions.fireNotificationEvent(context, {
            summary: 'Record deleted successfully.',
            displayMode: 'transient',
            type: 'confirmation',
          });
          await Actions.callChain(context, { chain: 'SynADPFutureProjectsAC' });

        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Delete failed: ' + (response.body ? response.body.P_ERR_MSG : 'Unknown error'),
            displayMode: 'persist',
            type: 'error',
          });
        }

      } catch (error) {
        console.error('deleteRowAC error ==> ' + error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error deleting record: ' + error,
          displayMode: 'persist',
          type: 'error',
        });
      } finally {
        document.getElementById('progressDialog').close();
      }
    }
  }

  return deleteRowAC;
});