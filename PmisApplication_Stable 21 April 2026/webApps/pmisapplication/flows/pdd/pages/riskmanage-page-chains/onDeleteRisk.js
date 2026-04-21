define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onDeleteRisk extends ActionChain {

    /**
     * Opens the deleteConfirmDialog (declared in HTML, same as progressDialog)
     * and returns a Promise that resolves true (Delete clicked) or false (Cancel clicked).
     */
    showConfirmDialog() {
      return new Promise((resolve) => {
        const dialog    = document.getElementById('deleteConfirmDialog');
        const cancelBtn = document.getElementById('deleteCancelBtn');
        const deleteBtn = document.getElementById('deleteConfirmBtn');

        // FIX: cleanup defined first — before onCancel/onConfirm reference it
        const cleanup = () => {
          cancelBtn.removeEventListener('click', onCancel);
          deleteBtn.removeEventListener('click', onConfirm);
          dialog.close();
        };

        const onCancel = () => {
          cleanup();
          resolve(false);
        };

        const onConfirm = () => {
          cleanup();
          resolve(true);
        };

        cancelBtn.addEventListener('click', onCancel);
        deleteBtn.addEventListener('click', onConfirm);

        dialog.open();
      });
    }

    async run(context, { key, current }) {
      const { $page, $application } = context;

      // Negative key = unsaved row — remove from BDP only, no confirmation needed
      if (key < 0) {
        await $page.variables.riskBufferDP.instance.removeItem({
          metadata: { key: key },
          data: current.row,
        });
        console.log('onDeleteRisk: unsaved row removed, key=', key);
        return;
      }

      // Existing DB row — open oj-dialog confirmation, await user response
      const confirmed = await this.showConfirmDialog();
      if (!confirmed) {
        console.log('onDeleteRisk: delete cancelled by user, key=', key);
        return;
      }

      try {
        document.getElementById('progressDialog').open();

        const allData = $page.variables.ADPrisk.data || [];
        const rowData = allData.find(r => r.risk_id === key) || { risk_id: key };

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
          endpoint: 'PDD/postPmispddRiskmanageProcess',
          body: { payload: encryptedPayload },
          headers: {
            'x-session-id':   encryptedId,
            'x-session-code': encryptedMethod,
          },
        });

        if (deleteResponse.body && deleteResponse.body.P_ERR_CODE === 'S') {
          await $page.variables.riskBufferDP.instance.removeItem({
            metadata: { key: key },
            data: current.row,
          });
          await Actions.fireNotificationEvent(context, {
            summary: 'Risk record deleted successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });
          console.log('onDeleteRisk: record deleted, key=', key);
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Delete failed: ' + (deleteResponse.body.P_ERR_MSG || 'Unknown error'),
            displayMode: 'persist',
            type: 'error',
          });
        }

      } catch (error) {
        console.error('onDeleteRisk error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Failed to delete risk record',
          displayMode: 'persist',
          type: 'error',
        });
      } finally {
        document.getElementById('progressDialog').close();
      }
    }
  }

  return onDeleteRisk;
});