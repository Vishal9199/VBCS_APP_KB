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

  class openMandatoryRefDocAttachmentDialog extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, current }) {
      const { $page, $flow, $application, $variables } = context;

      await Actions.resetVariables(context, {
        variables: [
          '$variables.attachmentObj',
        ],
      });

      $variables.attachmentObj.P_TYPE = 'FILE';
      $variables.attachmentObj.P_DOCUMENT_CATEGORY = current.row.lookup_value_code;
      $variables.attachmentObj.P_APPL_CODE = $variables.P_APPLICATION_CODE;
      $variables.attachmentObj.P_CREATED_BY = $application.user.email;

      await Actions.callComponentMethod(context, {
        selector: '#attachmentDialog',
        method: 'open',
      });
    }
  }

  return openMandatoryRefDocAttachmentDialog;
});