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

  class onDeleteAction extends ActionChain {

    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      console.log('onDeleteAction key:', key);

      // ── Check if this is a new unsaved row (negative key) ──────────────
      const isNewRow = Number(key) < 0;

      if (isNewRow) {
        // ── New unsaved row — remove directly from buffer, no API call ───
        try {
          await $page.variables.bufferDPlessonlearnedTable.instance.removeItem({
            metadata: { key: key },
          });

          await Actions.fireNotificationEvent(context, {
            summary: 'Row removed successfully.',
            displayMode: 'transient',
            type: 'confirmation',
          });

        } catch (err) {
          console.error('Error removing new row:', err);
          await Actions.fireNotificationEvent(context, {
            summary: 'Failed to remove row.',
            displayMode: 'transient',
            type: 'error',
          });
        }

        return; // skip dialog for new unsaved rows
      }

      // ── Existing DB row — get data from ADP and open delete dialog ─────
      const allData = $page.variables.lessonlearnedADP.data;
      const rowData = allData.find(row => String(row.lesson_id) === String(key));

      console.log('rowData from ADP:', rowData);

      if (!rowData) {
        console.error('Row not found in ADP for key:', key);
        await Actions.fireNotificationEvent(context, {
          summary: 'Record not found.',
          displayMode: 'transient',
          type: 'error',
        });
        return;
      }

      const enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: key },
      });

      const enc_payload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: { ...rowData } },
      });

      $variables.passKey = enc_key;
      $variables.passPayload = enc_payload;
      $variables.rowToEdit = { rowKey: key };

      await Actions.callComponentMethod(context, {
        selector: '#DeleteDialog',
        method: 'open',
      });
    }
  }

  return onDeleteAction;
});