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

  class errorCodeCopyAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const copyToClipboard = await $functions.copyToClipboard($variables.errorcode);

      await Actions.fireNotificationEvent(context, {
        summary: 'Error Message Has Been Copied',
        displayMode: 'transient',
        type: 'info',
      });
    }
  }

  return errorCodeCopyAC;
});
