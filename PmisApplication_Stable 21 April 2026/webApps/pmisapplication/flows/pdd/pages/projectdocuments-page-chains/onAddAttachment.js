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
     * @param {any} params.btnType
     * @param {object} params.passDocDetails
     * @param {any} params.current
     * @param {any} params.key
     * @param {number} params.index
     */
    async run(context, { event, originalEvent, btnType, passDocDetails, current, key, index }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      // await Actions.fireNotificationEvent(context, {
      //   summary: current.row.lookup_value_name,
      // });

      await Actions.resetVariables(context, {
        variables: [
          '$variables.attachmentObj',
        ],
      });

      $variables.attachmentObj.P_TYPE = btnType;
      $variables.attachmentObj.P_DOCUMENT_CATEGORY = current.row.lookup_value_code;

      const attachmentDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#attachmentDialog',
        method: 'open',
      });
    }
  }

  return onAddAttachment;
});