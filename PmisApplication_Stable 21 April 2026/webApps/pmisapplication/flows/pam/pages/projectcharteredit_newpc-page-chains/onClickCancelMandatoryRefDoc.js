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

  class onClickCancelMandatoryRefDoc extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $variables } = context;

      await Actions.callComponentMethod(context, {
        selector: '#attachmentDialog',
        method: 'close',
      });

      await Actions.resetVariables(context, {
        variables: [
          '$variables.attachmentObj',
        ],
      });
    }
  }

  return onClickCancelMandatoryRefDoc;
});