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

  class SaveAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId 
     */
    async run(context, { actionId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
      });

      if (dirtyDataStatus.status === 'dirty') {

        await Actions.callChain(context, {
          chain: 'createEditAC',
        });
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'No Changes Have been made',
          displayMode: 'transient',
          type: 'warning',
        });
      }
    }
  }

  return SaveAC;
});
