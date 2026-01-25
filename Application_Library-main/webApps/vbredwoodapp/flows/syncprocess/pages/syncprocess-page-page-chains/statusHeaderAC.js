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

      $variables.ScheduleSyncSearchVar.status = (value) ? "Y" : "N";

      if ($variables.ScheduleSyncSearchVar.status === 'Y') {
        $variables.ScheduleSyncSearchVar.last_update_date = '4712-12-31';
      } else {
        $variables.ScheduleSyncSearchVar.last_update_date = $application.functions.getSysdate();
      }
    }
  }

  return statusHeaderAC;
});
