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

  class cancelAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const applicationNameReset = await Actions.callComponentMethod(context, {
        selector: '#application_name',
        method: 'reset',
      });

      const roleNameReset = await Actions.callComponentMethod(context, {
        selector: '#role_name',
        method: 'reset',
      });

      const effectiveStartDateReset = await Actions.callComponentMethod(context, {
        selector: '#effective-start-date',
        method: 'reset',
      });

      const effectiveEndDateReset = await Actions.callComponentMethod(context, {
        selector: '#effective-end-date',
        method: 'reset',
      });

      // 🔸 STEP 2: Close the dialog
      await Actions.callComponentMethod(context, {
        selector: '#userAccessDetailsDialog',
        method: 'close',
      });

      // 🔸 STEP 3: Reset backing variables
      await Actions.resetVariables(context, {
        variables: [
    '$variables.userAccessChildVar',
  ],
      });
    }
  }

  return cancelAC;
});
