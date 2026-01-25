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

  class SwitchValueChangeChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {boolean} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     */
    async run(context, { event, previousValue, value, updatedFrom }) {
      const { $page, $flow, $application, $constants, $variables } = context;
       if (value===true) {
       $variables.userAccessChildVar.active_flag = 'Y';

        await Actions.resetVariables(context, {
          variables: [
    '$flow.variables.enddate',
    '$variables.userAccessChildVar.effective_end_date',
  ],
        });
      } else {
       $variables.userAccessChildVar.active_flag = 'N';

        $variables.userAccessChildVar.effective_end_date = $application.functions.getSysdate();

        $flow.variables.enddate = true;
      }
    }
  }

  return SwitchValueChangeChain;
});
