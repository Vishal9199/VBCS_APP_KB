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
          console.warn('Delete aborted: No row key found.');
          return;
        }

        // ── Get submittable items from Buffering DP ───────────────────────
        const submittableItems =
          await $page.variables.bufferDPChangeControlTable.instance.getSubmittableItems();

        // ── String comparison to avoid type mismatch ──────────────────────
        const currentItem = submittableItems.find(item =>
          String(item?.item?.metadata?.key) === String(rowKey)
        );

        console.log('rowKey:', rowKey, 'type:', typeof rowKey);
        console.log('currentItem:', currentItem);

        // ── New unsaved row (operation === 'add') — local remove only ─────
        if (currentItem && currentItem.operation === 'add') {
          console.log('New unsaved row detected. Removing locally only.');

          // ✅ Use the EXACT key from BDP metadata — preserve original type
          const exactKey = currentItem.item.metadata.key;
          console.log('exactKey from BDP:', exactKey, 'type:', typeof exactKey);

          await $page.variables.bufferDPChangeControlTable.instance.removeItem({
            metadata: { key: exactKey },
          });

          await Actions.fireNotificationEvent(context, {
            summary: 'Row deleted successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

          await Actions.callComponentMethod(context, {
            selector: '#delete_dialog',
            method: 'close',
          });

          return; // ── No backend call ───────────────────────────────────────
        }

        // ── Existing DB record — remove locally then call backend ─────────
        await $page.variables.bufferDPChangeControlTable.instance.removeItem({
          metadata: { key: String(rowKey) },
          data: $variables.rowToEdit,
        });

        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'DELETE' },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddChangecontrolProcess',
          headers: {
            'x-session-code': enc_method,
            'x-session-id':   $variables.passKey,
          },
          body: { payload: $variables.passPayload },
        });

        // ── Response handling ─────────────────────────────────────────────
        if (response?.body?.P_ERR_CODE === 'S' || response?.body?.P_ERR_CODE === 's') {

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
        console.error('Delete error:', error);

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