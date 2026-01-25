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

  class sectionPreBtnAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchSectionObj.IN_OFFSET = +$variables.searchSectionObj.IN_OFFSET - +$variables.searchSectionObj.IN_LIMIT;

      await Actions.callChain(context, {
        chain: 'loadChildTableAC',
      });
    }
  }

  return sectionPreBtnAction;
});
