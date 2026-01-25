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

  class cancel_SpPrimary_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     */
    async run(context, { event }) {

      const { $page, $flow, $application, $constants, $variables, $functions } = context;
      
      // const comparePettyCashHeaderPayloads = await $functions.comparePettyCashHeaderPayloads($variables.payload, $variables.payload_view);

      // if (comparePettyCashHeaderPayloads === 'Y' && $variables.headerFormValid === 'valid') {

      //   await Actions.navigateBack(context, {
      //   });
      // } else if (comparePettyCashHeaderPayloads === 'N') {
      //   const confirmCanceDialogOpen = await Actions.callComponentMethod(context, {
      //     selector: '#confirmCanceDialog',
      //     method: 'open',
      //   });
      // } else {
      
      //   await Actions.navigateBack(context, {
      //   });
      // }

      await Actions.navigateBack(context, {
      });

    }
  }

  return cancel_SpPrimary_AC;
});
