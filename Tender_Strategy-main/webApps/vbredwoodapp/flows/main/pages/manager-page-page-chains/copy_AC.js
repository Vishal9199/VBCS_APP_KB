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

  class copy_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let temp_key;
      let temp_userEmail;

      temp_key = await Actions.callChain(context, {
        chain: 'application:encryptLargePayloadWithTime',
        params: {
          plainText: key,
        },
      });

      temp_userEmail = await Actions.callChain(context, {
        chain: 'application:encryptLargePayloadWithTime',
        params: {
          plainText: $application.variables.userLogin,
        },
      });

      $variables.currentRow_Key = temp_key;
      $variables.currentUser_Email = temp_userEmail;

      const copyDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#copy_dialog',
        method: 'open',
      });
    }
  }

  return copy_AC;
});
