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
      
      // {
      //   "label": "Lookup",
      //     "icon": "oj-ux-ico-lookup-set",
      //       "flow": "lookup"
      // }

      

      await Actions.openUrl(context, {
        url: 'https://www.google.com/?zx=1757915993482&no_sw_cr=1',
      });

      $variables.popupOpen = false;
    }
  }

  return navToFlowAC;
});
