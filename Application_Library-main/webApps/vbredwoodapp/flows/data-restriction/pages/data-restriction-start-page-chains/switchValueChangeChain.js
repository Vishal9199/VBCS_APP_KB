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
       $variables.payload.active_flag = 'Y';
      } else {
       $variables.payload.active_flag = 'N';
      }
    }
  }

  return switchActiveAC;
});
