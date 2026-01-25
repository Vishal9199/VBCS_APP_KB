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

  class SwitchValueChangeChain1 extends ActionChain {

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
       $variables.userAccessDetailHeaderVar.active_flag ='Y';
      } else {
       $variables.userAccessDetailHeaderVar.active_flag = 'N';
      }
    }
  }

  return SwitchValueChangeChain1;
});
