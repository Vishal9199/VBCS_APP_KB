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

  class switchAllowDelete extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value 
     */
    async run(context, { value }) {
      const { $page, $flow, $application, $constants, $variables } = context;
        if (value ===true) {
        $page.variables.subMenuVar.allow_delete = 'Y';
      } else {
        $page.variables.subMenuVar.allow_delete = 'N';
      }
    }
  }

  return switchAllowDelete;
});
