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

  class switchActiveAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value 
     */
    async run(context, { value }) {
      const { $page, $flow, $application, $constants, $variables } = context;
       if (value===true) {
       $variables.childUser.active_flag ='Y';

        await Actions.resetVariables(context, {
          variables: [
    '$variables.enddate',
    '$variables.childUser.effective_end_date',
  ],
        });
      } else {
       $variables.childUser.active_flag = 'N';

        $variables.childUser.effective_end_date = $application.functions.getSysdate();
        $variables.enddate = true;
      }
    }
  }

  return switchActiveAC;
});
