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

  class handlePageActions extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId - The ID of the action button clicked
     */
    async run(context, { actionId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      console.log("handlePageActions - Action ID:", actionId);

      // Route to appropriate action chain based on button ID
      if (actionId === 'save') {
        // Secondary action: Save
        await Actions.callChain(context, {
          chain: 'onClickSave'
        });
        
      } else if (actionId === 'saveClose') {
        // Secondary action: Save & Close
        await Actions.callChain(context, {
          chain: 'onClickSaveClose'
        });
        
      } else if (actionId === 'about') {
        // Secondary action: About
        await Actions.callChain(context, {
          chain: 'onClickAbout'
        });
        
      } else {
        // Primary action: Close (default when no actionId or unrecognized)
        await Actions.callChain(context, {
          chain: 'onClickClose'
        });
      }
    }
  }

  return handlePageActions;
});