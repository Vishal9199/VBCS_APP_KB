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

  class switchFullAcessAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value 
     */
    async run(context, { value }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      if (value ===true) {
        $page.variables.subMenuVar.full_access = 'Y';
        $page.variables.subMenuVar.read_only = 'N';
        $page.variables.subMenuVar.allow_create = 'Y';
        $page.variables.subMenuVar.allow_delete = 'Y';
        $page.variables.subMenuVar.allow_edit = 'Y';
      } else {
        $page.variables.subMenuVar.full_access = 'N';
        $page.variables.subMenuVar.read_only = 'N';
        $page.variables.subMenuVar.allow_create = 'N';
        $page.variables.subMenuVar.allow_delete = 'N';
        $page.variables.subMenuVar.allow_edit = 'N';
      }
    }
  }

  return switchFullAcessAC;
});
