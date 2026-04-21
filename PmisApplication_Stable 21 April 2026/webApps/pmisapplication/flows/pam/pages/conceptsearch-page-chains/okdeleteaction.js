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

      const { $page, $variables } = context;

      try {

        const rowKey = $variables.rowToEdit?.rowkey;

        if (!rowKey) {
          console.warn("Delete aborted: No row key found.");
          return;
        }

        // --------------------------------------------------
        // 🔍 Get submittable items from Buffering DP
        // --------------------------------------------------

        const submittableItems =
          await $page.variables.bufferDPTable.instance.getSubmittableItems();

        console.log("Submittable Items:", submittableItems);

        // IMPORTANT: structure is item.item.metadata.key
        const currentItem = submittableItems.find(item =>
          item?.item?.metadata?.key === rowKey
        );

        // --------------------------------------------------
        // 🚫 If row is newly added (operation === 'add')
        // --------------------------------------------------

        if (currentItem && currentItem.operation === 'add') {

          console.log("New unsaved row detected. Removing locally only.");

          await $page.variables.bufferDPTable.instance.removeItem({
            metadata: { key: rowKey }
          });

          await Actions.fireNotificationEvent(context, {
            summary: 'Concept study deleted successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

          await Actions.callComponentMethod(context, {
            selector: '#delete_dialog',
            method: 'close',
          });

          return; // STOP here — no backend call
        }

        // --------------------------------------------------
        // 🌐 Existing DB record → Remove + Call backend
        // --------------------------------------------------

        await $page.variables.bufferDPTable.instance.removeItem({
          metadata: { key: rowKey },
          data: $variables.rowToEdit,
        });

        // Encrypt DELETE method
        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'DELETE' },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamConceptstudyProcess',
          headers: {
            'x-session-code': enc_method,
            'x-session-id': $variables.passKey,
          },
          body: { payload: $variables.passPayload },
        });

        // --------------------------------------------------
        // ✅ Backend Response Handling
        // --------------------------------------------------

        if (response?.body?.P_ERR_CODE === 'S') {

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'confirmation',
          });

          await Actions.callComponentMethod(context, {
            selector: '#delete_dialog',
            method: 'close',
          });

          await Actions.callChain(context, {
            chain: 'vbEnterListener',
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
          summary: 'Unexpected error while deleting',
          displayMode: 'transient',
          type: 'error',
        });

      }
    }
  }

  return okdeleteaction;
});
