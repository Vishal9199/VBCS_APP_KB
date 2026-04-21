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

  class okdeleteaction extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page } = context;

      try {

        const rowKey = $page.variables.rowToEdit?.rowKey;
        console.log("Row key to delete:", rowKey);

        if (rowKey === undefined || rowKey === null) {
          console.warn("Delete aborted: No row key found.");
          await Actions.callComponentMethod(context, {
            selector: '#delete_dialog',
            method: 'close',
          });
          return;
        }

        const submittableItems =
          await $page.variables.bufferDPcahExpTable.instance.getSubmittableItems();

        const currentItem = submittableItems.find(item =>
          item?.item?.metadata?.key === rowKey
        );

        const isNewRow = rowKey < 0 ||
                         (currentItem && currentItem.operation === 'add');

        // ── New/empty row ──────────────────────────────────────────────────
        if (isNewRow) {
          console.log("New row - removing locally and reloading.");

          try {
            await $page.variables.bufferDPcahExpTable.instance.removeItem({
              metadata: { key: rowKey }
            });
          } catch (e) {
            console.warn("Remove from buffer failed:", e);
          }

          // ✅ Reload from backend to restore clean table state
          await Actions.callChain(context, {
            chain: 'cashExpectationonLoad',
          });

          await Actions.fireNotificationEvent(context, {
            summary: 'Row removed successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

          await Actions.callComponentMethod(context, {
            selector: '#delete_dialog',
            method: 'close',
          });

          return;
        }

        // ── Existing DB row ────────────────────────────────────────────────
        try {
          await $page.variables.bufferDPcahExpTable.instance.removeItem({
            metadata: { key: rowKey },
          });
        } catch (e) {
          console.warn("Remove from buffer failed:", e);
        }

        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'DELETE' },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddCashexpectationProcess',
          headers: {
            'x-session-code': enc_method,
            'x-session-id': $page.variables.passKey,
          },
          body: { payload: $page.variables.passPayload },
        });

        if (response?.body?.P_ERR_CODE === 'S') {

          await Actions.callComponentMethod(context, {
            selector: '#delete_dialog',
            method: 'close',
          });

          // ✅ Reload data from backend
          await Actions.callChain(context, {
            chain: 'cashExpectationonLoad',
          });

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'confirmation',
          });

        } else {

          await Actions.fireNotificationEvent(context, {
            summary: response?.body?.P_ERR_MSG || 'Delete failed',
            displayMode: 'transient',
            type: 'error',
          });

        }

      } catch (error) {
        console.error("Delete error:", error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Unexpected error: ' + error.message,
          displayMode: 'transient',
          type: 'error',
        });
      }
      }
  }

  return okdeleteaction;
});