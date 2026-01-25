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

  class save_close_ac extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const s =await Actions.callChain(context, {
        chain: 'saveAC',
      });
      await Actions.resetVariables(context, {
        variables: [
    '$variables.payload.person_id',
    '$variables.payload.restriction_code',
  ],
      });
    }
  }

  return save_close_ac;
});