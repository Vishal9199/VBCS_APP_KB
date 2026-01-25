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

  class mergeQueryCopyAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const copyToClipboard = await $functions.copyToClipboard($variables.merge_query);

      await Actions.fireNotificationEvent(context, {
        summary: 'Merge Query Has Been Copied ToClipboard',
        displayMode: 'transient',
        type: 'info',
      });
    }
  }

  return mergeQueryCopyAC;
});
