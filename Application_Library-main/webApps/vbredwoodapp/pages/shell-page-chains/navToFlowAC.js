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

  class navToFlowAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.current 
     */
    async run(context, { current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toDefaultFlow = await Actions.navigateToFlow(context, {
        flow: current.flow,
      });

      $variables.popupOpen = false;
    }
  }

  return navToFlowAC;
});
