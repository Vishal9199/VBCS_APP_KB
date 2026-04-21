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
        const rowKey = $variables.rowToEdit?.rowKey;

        console.log('okdeleteaction rowKey:', rowKey);

        if (!rowKey) {
          console.warn('Delete aborted: No row key found.');
          await Actions.fireNotificationEvent(context, {
            summary: 'Delete Failed: No record selected.',
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }

        // ── Encrypt DELETE method ──────────────────────────────────────────
        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'DELETE' },
        });

        // ── Call backend API ───────────────────────────────────────────────
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddLessonlearnedProcess',
          headers: {
            'x-session-code': enc_method,
            'x-session-id': $variables.passKey,
          },
          body: { payload: $variables.passPayload },
        });

        console.log('Delete API response:', response);

        if (response?.body?.P_ERR_CODE === 'S' || response?.body?.P_ERR_CODE === 's') {

          // ── Remove from buffer ───────────────────────────────────────────
          try {
            await $page.variables.bufferDPlessonlearnedTable.instance.removeItem({
              metadata: { key: rowKey },
            });
          } catch (removeErr) {
            console.warn('Buffer removeItem skipped (may not exist):', removeErr);
          }

          // ── Remove from lessonlearnedADP to update UI immediately ────────
          const currentData = $page.variables.lessonlearnedADP.data;
          $page.variables.lessonlearnedADP.data = currentData.filter(
            row => String(row.lesson_id) !== String(rowKey)
          );

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Information Deleted Successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

          await Actions.callComponentMethod(context, {
            selector: '#DeleteDialog',
            method: 'close',
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