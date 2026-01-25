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

  class prevBtnAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchValueObj.OFFSET = +$variables.searchValueObj.OFFSET - +$variables.searchValueObj.LIMIT;

      await Actions.callChain(context, {
        chain: 'loadChildTableAC',
        params: {
          'lv_header_id': $variables.ScheduleSyncSearchVar.schedule_id,
        },
      });
    }
  }

  return prevBtnAC;
});
