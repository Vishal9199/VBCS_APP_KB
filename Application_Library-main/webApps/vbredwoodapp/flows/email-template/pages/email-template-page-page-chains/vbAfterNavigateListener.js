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

  class vbAfterNavigateListener extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{previousPage:string,previousPageParams:any,currentPage:string,currentPageParams:any}} params.event
     */
    async run(context, { event }) {
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

  return vbAfterNavigateListener;
});
