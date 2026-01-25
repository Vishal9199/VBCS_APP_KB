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

  class headerSaveAndCloseAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
      });

       if (dirtyDataStatus.status === "dirty") {

        const res = await Actions.callChain(context, {
          chain: 'headerEditSaveAC',
        });

        if (res=== 'S') {
          await Actions.navigateBack(context, {
          });
        }

      } else {

        await Actions.fireNotificationEvent(context, {
          summary: 'No changes to Save',
          displayMode: 'transient',
          type: 'info',
        });

        await Actions.navigateBack(context, {
        });
        
      }
    }
  }

  return headerSaveAndCloseAC;
});
