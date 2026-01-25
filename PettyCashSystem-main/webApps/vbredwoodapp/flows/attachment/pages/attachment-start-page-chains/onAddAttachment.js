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

  class onAddAttachment extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {string} params.btnType
     */
    async run(context, { event, originalEvent, btnType }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.resetVariables(context, {
        variables: [
    '$variables.attachmentObj',
  ],
      });

      $variables.attachmentObj.P_TYPE = btnType;

      const attachmentDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#attachmentDialog',
        method: 'open',
      });
    }
  }

  return onAddAttachment;
});