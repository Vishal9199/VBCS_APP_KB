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

  class lookupValueActiveAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value 
     */
    async run(context, { value }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.lookupValueVar.active_flag = value ? "Y" : "N";

      if ($variables.lookupValueVar.active_flag === "Y") {
        $variables.lookupValueVar.effective_end_date = "4712-12-31";
      } else {
        $variables.lookupValueVar.effective_end_date = $application.functions.getSysdate();
      }
    }
  }

  return lookupValueActiveAC;
});