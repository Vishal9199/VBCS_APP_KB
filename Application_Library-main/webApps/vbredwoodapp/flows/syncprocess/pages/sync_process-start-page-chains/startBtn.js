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

  class onClickStart extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const response2 = await Actions.callRest(context, {
        endpoint: 'NodeJsSync/getSchedulerStop',
      });

      const response = await Actions.callRest(context, {
        endpoint: 'NodeJsSync/getSchedulerStart',
      });

      await Actions.fireNotificationEvent(context, {
        summary: 'Request Started Successfull',
        type: 'confirmation',
      });
    }
  }

  return onClickStart;
});
