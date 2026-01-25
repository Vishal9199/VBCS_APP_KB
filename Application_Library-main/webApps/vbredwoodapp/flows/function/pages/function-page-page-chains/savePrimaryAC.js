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

  class savePrimaryAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {string} params.secondaryItem
     * @param {string} params.actionId
     */
    async run(context, { event, secondaryItem, actionId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (actionId === 'save') {
        await Actions.fireNotificationEvent(context, {
          summary: 'vbkwefo',
        });

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
  }

  return savePrimaryAC;
});
