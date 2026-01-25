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

  class childCancelAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;


      const userNameSelectReset = await Actions.callComponentMethod(context, {
        selector: '#user_name_select',
        method: 'reset',
      });

      const effectiveEndDateInputReset = await Actions.callComponentMethod(context, {
        selector: '#effective_end_date_input',
        method: 'reset',
      });

      const effectiveStartDateInputReset = await Actions.callComponentMethod(context, {
        selector: '#effective_start_date_input',
        method: 'reset',
      });

      await Actions.resetVariables(context, {
        variables: [
    '$variables.childUser',
  ],
      });

      const userDialogClose = await Actions.callComponentMethod(context, {
        selector: '#userDialog',
        method: 'close',
      });
    }
  }

  return childCancelAC;
});
