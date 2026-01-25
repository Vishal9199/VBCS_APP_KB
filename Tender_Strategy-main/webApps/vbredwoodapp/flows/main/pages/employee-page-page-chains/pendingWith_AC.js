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

  class pendingWith_AC extends ActionChain {

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

      // const emailString = current.row.pending_with;
      const emailString = 'nwstest@nws.com';
      const emailArray = emailString.split(',').map(email => email.trim());
      const result = emailArray.join('\n');
      $variables.clobMessage=result;
      
      const pendingDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#pendingDialog',
        method: 'open',
      });
    }
  }

  return pendingWith_AC;
});