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

  class deleteOkAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {string} params.deleteKey
     */
    async run(context, { event, originalEvent, deleteKey }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        if (deleteKey != null) {

          await Actions.fireNotificationEvent(context, {
            summary: $variables.passDeleteKey,
          });
        }
      } catch (error) {
      } finally {
      }
    }
  }

  return deleteOkAC;
});
