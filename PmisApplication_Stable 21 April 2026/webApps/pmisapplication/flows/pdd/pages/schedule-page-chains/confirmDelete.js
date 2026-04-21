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

  class confirmDelete extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        if (+$variables.deleteRowKey <= 0) {

          // Remove item from BufferingDataProvider
          const removeItem = await $page.variables.bufferDPSchedule.instance.removeItem({
            metadata: {
              key: $variables.deleteRowKey,
            },
          });
        } else {
          let temp_key = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.deleteRowKey,
            },
          });

          let temp_method = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: 'DELETE',
            },
          });

          const response = await Actions.callRest(context, {
            endpoint: 'PDD/postPmispddScheduleProcess',
            headers: {
              'x-session-code': temp_method,
              'x-session-id': temp_key,
            },
            body: {"payload": $variables.tempPayload},
          });

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: response.body.P_ERR_CODE === 'S' ? 'confirmation' : 'error',
          });

          await Actions.callChain(context, {
            chain: 'vbEnterListener',
          });
        }

        // console.log("confirmDelete - Row deleted:", $variables.deleteRowKey);

        // Close dialog

        // Clear stored values
        $variables.deleteRowKey = null;
        $variables.deleteRowIndex = null;

        // await Actions.fireNotificationEvent(context, {
        //   summary: 'Row Deleted',
        //   message: 'Schedule row has been marked for deletion. Save to commit changes.',
        //   type: 'info',
        //   displayMode: 'transient'
        // });

      } catch (error) {
        console.error("confirmDelete - Error:", error);

        const deleteDialogClose = await Actions.callComponentMethod(context, {
          selector: '#deleteDialog',
          method: 'close',
        });
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Delete Failed',
          message: 'Failed to delete row: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }

      const deleteDialogClose2 = await Actions.callComponentMethod(context, {
        selector: '#deleteDialog',
        method: 'close',
      });
    }
  }

  return confirmDelete;
});