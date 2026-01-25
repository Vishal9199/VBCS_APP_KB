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

  class PageVbEnterChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $application.variables.showNavigation = false;

      if ($variables.method === "PUT") {
        // EDIT MODE: Load template and sections
        await Actions.callChain(context, {
          chain: 'loadHeaderAC',
        });
        
        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });
      }
      // CREATE MODE: Variables already initialized with default values in JSON
    }
  }

  return PageVbEnterChain;
});