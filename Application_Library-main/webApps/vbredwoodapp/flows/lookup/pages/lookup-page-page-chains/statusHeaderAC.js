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

  class statusHeaderAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value 
     */
    async run(context, { value }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.lookupTypeVar.active_flag = (value) ? "Y" : "N";

      if ($variables.lookupTypeVar.active_flag === "Y") {
        $variables.lookupTypeVar.effective_end_date = "4712-12-31";
      } else {
        $variables.lookupTypeVar.effective_end_date = $application.functions.getSysdate();
      }
    }
  }

  return statusHeaderAC;
});
