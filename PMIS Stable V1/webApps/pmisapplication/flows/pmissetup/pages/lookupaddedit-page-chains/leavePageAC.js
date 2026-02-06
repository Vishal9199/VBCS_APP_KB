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

  class leavePageAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.resetDirtyDataStatus(context, {
        variables: [
    '$variables.lookupTypeVar',
  ],
      });

      await Actions.callChain(context, {
        chain: 'SimpleCreateAndEditPageTemplateSpCancelChain',
      });
    }
  }

  return leavePageAC;
});